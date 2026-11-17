import {
  Activity,
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle2,
  Copy,
  Database,
  Download,
  Edit3,
  LayoutDashboard,
  Loader2,
  LogOut,
  MessageCircle,
  Plus,
  RefreshCw,
  Search,
  Share2,
  ShieldCheck,
  Trash2,
  UserCheck,
  Users,
  X,
  XCircle,
} from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { invitation } from '../../config/invitation.config';
import { eventParts, useCountdown } from '../../lib/date';
import {
  deleteRsvp,
  fetchRsvpsWithLatency,
  formatPhone,
  signOutAdmin,
  submitRsvp,
  updateRsvp,
  validateRsvp,
  type RsvpInput,
  type RsvpRecord,
} from '../../lib/supabase';
import { InviteSharePanel } from './InviteSharePanel';

interface Props {
  adminEmail: string;
  onSignedOut: () => void;
  onGoToInvite: () => void;
}

type TabMode = 'overview' | 'rsvps' | 'share';
type FilterMode = 'all' | 'yes' | 'no';

function formatDateTime(iso: string): string {
  return new Intl.DateTimeFormat('pt-BR', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(new Date(iso));
}

function escapeCsvCell(value: string | number): string {
  const s = String(value).replace(/"/g, '""');
  return `"${s}"`;
}

function toWhatsAppUrl(phoneDigits: string): string {
  const clean = phoneDigits.replace(/\D/g, '');
  const withCountry = clean.startsWith('55') && clean.length >= 12 ? clean : `55${clean}`;
  return `https://wa.me/${withCountry}`;
}

export function AdminDashboard({ adminEmail, onSignedOut, onGoToInvite }: Props) {
  const countdown = useCountdown();
  const [tab, setTab] = useState<TabMode>('overview');
  const [rsvps, setRsvps] = useState<RsvpRecord[]>([]);
  const [latencyMs, setLatencyMs] = useState<number | null>(null);
  const [lastSyncAt, setLastSyncAt] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<FilterMode>('all');
  const [linkCopied, setLinkCopied] = useState(false);

  // Modal de exclusão (sempre centralizado)
  const [deleteTarget, setDeleteTarget] = useState<RsvpRecord | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Modal de adicionar/editar (Bottom-Sheet no mobile)
  const [modalMode, setModalMode] = useState<'closed' | 'create' | 'edit'>('closed');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [modalForm, setModalForm] = useState<RsvpInput>({ name: '', phone: '', attending: true, companions: 0 });
  const [modalErrors, setModalErrors] = useState<Partial<Record<keyof RsvpInput, string>>>({});
  const [modalSaving, setModalSaving] = useState(false);
  const [modalServerError, setModalServerError] = useState('');

  const loadRsvps = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const { records, latencyMs: ms } = await fetchRsvpsWithLatency();
      setRsvps(records);
      setLatencyMs(ms);
      setLastSyncAt(
        new Intl.DateTimeFormat('pt-BR', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        }).format(new Date()),
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar confirmações.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadRsvps();
  }, [loadRsvps]);

  const stats = useMemo(() => {
    const confirmedList = rsvps.filter((r) => r.attending);
    const declinedCount = rsvps.length - confirmedList.length;
    const confirmPct = rsvps.length ? Math.round((confirmedList.length / rsvps.length) * 100) : 0;
    const declinedPct = rsvps.length ? 100 - confirmPct : 0;

    return {
      confirmedResponses: confirmedList.length,
      declinedCount,
      totalResponses: rsvps.length,
      confirmPct,
      declinedPct,
    };
  }, [rsvps]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    const digitsQuery = q.replace(/\D/g, '');
    return rsvps.filter((item) => {
      if (filter === 'yes' && !item.attending) return false;
      if (filter === 'no' && item.attending) return false;
      if (!q) return true;
      const matchesName = item.name.toLowerCase().includes(q);
      const matchesPhone = digitsQuery ? item.phone.includes(digitsQuery) : false;
      return matchesName || matchesPhone;
    });
  }, [rsvps, filter, search]);

  const handleCopyInviteLink = async () => {
    const url = `${window.location.origin}/`;
    await navigator.clipboard.writeText(url);
    setLinkCopied(true);
    setTimeout(() => setLinkCopied(false), 2200);
  };

  const handleExportCsv = () => {
    const header = ['Nome', 'WhatsApp', 'Status', 'Data/Hora'];
    const rows = filtered.map((r) => [
      r.name,
      formatPhone(r.phone),
      r.attending ? 'Confirmado' : 'Não poderá ir',
      formatDateTime(r.created_at),
    ]);
    const csv = [header, ...rows].map((row) => row.map(escapeCsvCell).join(';')).join('\r\n');
    const blob = new Blob([`\uFEFF${csv}`], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `confirmacoes-${invitation.debutante.name.toLowerCase().replace(/\s+/g, '-')}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    setError('');
    try {
      await deleteRsvp(deleteTarget.id);
      setRsvps((prev) => prev.filter((r) => r.id !== deleteTarget.id));
      setDeleteTarget(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Não foi possível excluir o registro.');
      setDeleteTarget(null);
    } finally {
      setDeleting(false);
    }
  };

  const openCreateModal = () => {
    setModalMode('create');
    setEditingId(null);
    setModalForm({ name: '', phone: '', attending: true, companions: 0 });
    setModalErrors({});
    setModalServerError('');
  };

  const openEditModal = (record: RsvpRecord) => {
    setModalMode('edit');
    setEditingId(record.id);
    setModalForm({
      name: record.name,
      phone: record.phone,
      attending: record.attending,
      companions: record.companions,
    });
    setModalErrors({});
    setModalServerError('');
  };

  const handleSaveModal = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validateRsvp(modalForm);
    setModalErrors(errs);
    if (Object.keys(errs).length) return;

    setModalSaving(true);
    setModalServerError('');
    try {
      if (modalMode === 'create') {
        await submitRsvp(modalForm);
      } else if (modalMode === 'edit' && editingId) {
        await updateRsvp(editingId, modalForm);
      }
      setModalMode('closed');
      await loadRsvps();
    } catch (err) {
      setModalServerError(err instanceof Error ? err.message : 'Erro ao salvar confirmação.');
    } finally {
      setModalSaving(false);
    }
  };

  const handleSignOut = async () => {
    await signOutAdmin();
    onSignedOut();
  };

  return (
    <div className="admin-page-shell pb-14">
      {/* 6.1 Top Navbar Sticky */}
      <div className="admin-navbar-wrap">
        <header className="admin-navbar">
          <div className="flex items-center gap-3.5">
            <button type="button" onClick={onGoToInvite} className="btn-back-to-site">
              <ArrowLeft size={15} />
              <span>Convite</span>
            </button>

            <div>
              <h1 className="font-display text-[1.06rem] font-bold tracking-[-0.025em] text-[var(--color-text-main)]">
                15 Anos · {invitation.debutante.name}
              </h1>
              <div className="mt-0.5 flex items-center gap-2">
                <span className="pulse-dot" />
                <span className="font-mono text-[0.66rem] font-medium uppercase tracking-[0.08em] text-[var(--color-text-muted)]">
                  CONSOLE ADMINISTRATIVO // STATUS ONLINE
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {adminEmail && (
              <div className="admin-user-pill font-mono" title={adminEmail}>
                <ShieldCheck size={14} className="shrink-0 text-[var(--color-primary)]" />
                <span>{adminEmail}</span>
              </div>
            )}

            <button
              type="button"
              onClick={handleCopyInviteLink}
              className={`btn-admin-outline ${linkCopied ? 'is-copied' : ''}`}
            >
              {linkCopied ? <Check size={14} /> : <Copy size={14} />}
              <span>{linkCopied ? 'Link copiado' : 'Copiar Link'}</span>
            </button>

            <button type="button" onClick={loadRsvps} disabled={loading} className="btn-admin-outline" aria-label="Atualizar dados">
              <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
              <span className="hidden sm:inline">Atualizar</span>
            </button>

            <button type="button" onClick={handleSignOut} className="btn-admin-logout">
              <LogOut size={14} />
              <span>Sair</span>
            </button>
          </div>
        </header>
      </div>

      <main className="relative z-10 mx-auto mt-6 max-w-[1280px] space-y-5 px-4 sm:px-5">
        {/* 6.2 Barra de Abas Segmentadas */}
        <nav className="admin-tabs-bar" aria-label="Navegação do painel">
          <button
            type="button"
            onClick={() => setTab('overview')}
            className={`admin-tab-item ${tab === 'overview' ? 'is-active' : ''}`}
          >
            <LayoutDashboard size={16} />
            <span>Visão Geral</span>
          </button>

          <button
            type="button"
            onClick={() => setTab('rsvps')}
            className={`admin-tab-item ${tab === 'rsvps' ? 'is-active' : ''}`}
          >
            <Users size={16} />
            <span>Confirmações</span>
            <span className="tab-badge font-mono">{stats.totalResponses}</span>
          </button>

          <button
            type="button"
            onClick={() => setTab('share')}
            className={`admin-tab-item ${tab === 'share' ? 'is-active' : ''}`}
          >
            <Share2 size={16} />
            <span>Convite, PDF &amp; WhatsApp</span>
          </button>
        </nav>

        {tab === 'share' && <InviteSharePanel />}

        {tab === 'overview' && (
          <>
            {/* 6.4 Banner de Destaque / Cronômetro Técnico */}
            <section className="event-countdown-box">
              <div className="relative z-10 flex flex-col justify-between gap-5 lg:flex-row lg:items-center">
                <div>
                  <p className="font-mono text-[0.68rem] font-semibold uppercase tracking-[0.11em] text-white/80">
                    CONTAGEM REGRESSIVA // {eventParts.day} DE {eventParts.month.toUpperCase()} DE {eventParts.year} ·{' '}
                    {eventParts.time}
                  </p>
                  <h2 className="font-display mt-1.5 text-[1.22rem] font-bold tracking-[-0.025em] text-white sm:text-2xl">
                    Rumo à Noite de Conto de Fadas
                  </h2>
                  <p className="mt-1 text-sm text-white/80">
                    {invitation.venue.address} — {invitation.venue.city}/{invitation.venue.state}
                  </p>
                </div>

                <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                  <div className="countdown-digits-grid">
                    {[
                      { val: countdown.days, label: 'DIAS' },
                      { val: countdown.hours, label: 'HORAS' },
                      { val: countdown.minutes, label: 'MIN' },
                      { val: countdown.seconds, label: 'SEG' },
                    ].map((cell) => (
                      <div key={cell.label} className="countdown-digit-cell min-w-[66px]">
                        <span className="font-mono block text-[1.6rem] font-bold leading-none text-white">
                          {String(cell.val).padStart(2, '0')}
                        </span>
                        <span className="font-mono mt-1 block text-[0.65rem] uppercase tracking-[0.1em] text-white/75">
                          {cell.label}
                        </span>
                      </div>
                    ))}
                  </div>

                  <button
                    type="button"
                    onClick={handleExportCsv}
                    disabled={filtered.length === 0}
                    className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-[var(--radius-sm)] border border-white/30 bg-white/15 px-4 py-2.5 text-xs font-semibold uppercase tracking-wider text-white backdrop-blur-md transition hover:bg-white/25 disabled:opacity-50"
                  >
                    <Download size={15} />
                    <span>Exportar CSV</span>
                  </button>
                </div>
              </div>
            </section>

            {/* 6.3 Grid de 4 KPIs */}
            <section className="kpi-grid" aria-label="Indicadores de presença">
              <div className="kpi-card">
                <div className="kpi-header">
                  <span className="kpi-title">Confirmados (Sim)</span>
                  <div className="kpi-icon-wrapper">
                    <CheckCircle2 size={17} className="text-emerald-600" />
                  </div>
                </div>
                <div className="kpi-value-box">
                  <span className="kpi-value font-mono">{stats.confirmedResponses}</span>
                  <span className="kpi-unit">convidados</span>
                </div>
                <div className="kpi-footer">
                  <span className="font-mono font-semibold text-[var(--color-primary)]">{stats.confirmPct}%</span> das respostas
                </div>
              </div>

              <div className="kpi-card">
                <div className="kpi-header">
                  <span className="kpi-title">Não Comparecerão</span>
                  <div className="kpi-icon-wrapper">
                    <XCircle size={17} className="text-rose-500" />
                  </div>
                </div>
                <div className="kpi-value-box">
                  <span className="kpi-value font-mono">{stats.declinedCount}</span>
                  <span className="kpi-unit">ausências</span>
                </div>
                <div className="kpi-footer">
                  <span className="font-mono font-semibold">{stats.declinedPct}%</span> das respostas
                </div>
              </div>

              <div className="kpi-card">
                <div className="kpi-header">
                  <span className="kpi-title">Taxa de Presença</span>
                  <div className="kpi-icon-wrapper">
                    <UserCheck size={17} />
                  </div>
                </div>
                <div className="kpi-value-box">
                  <span className="kpi-value font-mono">{stats.confirmPct}%</span>
                  <span className="kpi-unit">adesão</span>
                </div>
                <div className="kpi-footer">
                  <span className="font-mono">{stats.confirmedResponses}</span> de{' '}
                  <span className="font-mono">{stats.totalResponses}</span> respostas
                </div>
              </div>

              <div className="kpi-card">
                <div className="kpi-header">
                  <span className="kpi-title">Total de Respostas</span>
                  <div className="kpi-icon-wrapper">
                    <Users size={17} />
                  </div>
                </div>
                <div className="kpi-value-box">
                  <span className="kpi-value font-mono">{stats.totalResponses}</span>
                  <span className="kpi-unit">registros</span>
                </div>
                <div className="kpi-footer">Confirmações individuais</div>
              </div>
            </section>

            {/* 6.5 & 6.7 Painéis Analíticos em 2 Colunas */}
            <section className="dashboard-grid-2">
              <div className="admin-panel-card space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-mono text-[0.66rem] font-semibold uppercase tracking-[0.08em] text-[var(--color-text-muted)]">
                      MÉTRICAS // DISTRIBUIÇÃO
                    </p>
                    <h2 className="font-display text-lg font-bold text-[var(--color-text-main)]">
                      Composição das Confirmações
                    </h2>
                  </div>
                </div>

                <div className="space-y-4 pt-1">
                  <div>
                    <div className="cat-bar-info">
                      <span>Presenças confirmadas</span>
                      <span className="font-mono text-[0.75rem] text-[var(--color-text-muted)]">
                        {stats.confirmedResponses}/{stats.totalResponses} ({stats.confirmPct}%)
                      </span>
                    </div>
                    <div className="cat-bar-track">
                      <div className="cat-bar-fill" style={{ width: `${stats.confirmPct}%` }} />
                    </div>
                  </div>

                  <div>
                    <div className="cat-bar-info">
                      <span>Ausências informadas</span>
                      <span className="font-mono text-[0.75rem] text-[var(--color-text-muted)]">
                        {stats.declinedCount}/{stats.totalResponses} ({stats.declinedPct}%)
                      </span>
                    </div>
                    <div className="cat-bar-track">
                      <div className="cat-bar-fill" style={{ width: `${stats.declinedPct}%` }} />
                    </div>
                  </div>
                </div>
              </div>

              <div className="admin-panel-card db-health-card">
                <div>
                  <div className="mb-4 flex items-center justify-between">
                    <div>
                      <p className="font-mono text-[0.66rem] font-semibold uppercase tracking-[0.08em] text-[var(--color-text-muted)]">
                        TELEMETRIA // BANCO ISOLADO
                      </p>
                      <h2 className="font-display text-lg font-bold text-[var(--color-text-main)]">
                        Saúde da Conexão Supabase
                      </h2>
                    </div>
                    <Database size={18} className="text-[var(--color-primary)]" />
                  </div>

                  <div className="db-health-grid">
                    <div className="db-metric-box">
                      <span className="font-mono text-[0.66rem] uppercase tracking-[0.08em] text-[var(--color-text-muted)]">
                        LATÊNCIA REST
                      </span>
                      <p className="db-metric-value font-mono mt-1 flex items-center gap-1.5">
                        <Activity size={15} className="text-emerald-600" />
                        {latencyMs !== null ? `${latencyMs} ms` : '—'}
                      </p>
                    </div>

                    <div className="db-metric-box">
                      <span className="font-mono text-[0.66rem] uppercase tracking-[0.08em] text-[var(--color-text-muted)]">
                        SEGURANÇA RLS
                      </span>
                      <p className="db-metric-value font-mono mt-1 text-emerald-700">ACTIVE</p>
                    </div>
                  </div>
                </div>

                <div className="db-project-meta font-mono">
                  <div className="flex justify-between gap-2">
                    <span>TABELA_DESTINO</span>
                    <span className="font-semibold text-[var(--color-text-main)]">{invitation.rsvp.supabaseTable}</span>
                  </div>
                  <div className="flex justify-between gap-2">
                    <span>TIMEZONE</span>
                    <span className="font-semibold text-[var(--color-text-main)]">{invitation.event.timeZone}</span>
                  </div>
                  <div className="flex justify-between gap-2">
                    <span>ULTIMA_SINCRONIZACAO</span>
                    <span className="font-semibold text-[var(--color-text-main)]">{lastSyncAt || '—'}</span>
                  </div>
                </div>
              </div>
            </section>

            {/* Atalhos rápidos para Confirmações e Exportação do Convite */}
            <div className="dashboard-grid-2">
              <div className="admin-panel-card flex flex-wrap items-center justify-between gap-4">
                <div>
                  <p className="font-mono text-[0.66rem] font-semibold uppercase tracking-[0.08em] text-[var(--color-text-muted)]">
                    LISTA DE CONVIDADOS // GESTÃO
                  </p>
                  <p className="font-display mt-0.5 text-base font-bold text-[var(--color-text-main)]">
                    {stats.totalResponses === 0
                      ? 'Nenhuma resposta registrada ainda'
                      : `${stats.totalResponses} resposta(s) recebida(s) · ${stats.confirmedResponses} confirmado(s)`}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setTab('rsvps')}
                  className="inline-flex min-h-[42px] items-center gap-2 rounded-[var(--radius-sm)] bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-accent)] px-5 py-2.5 text-xs font-semibold uppercase tracking-wider text-white shadow-sm transition hover:brightness-105"
                >
                  <span>Gerenciar Confirmações</span>
                  <ArrowRight size={15} />
                </button>
              </div>

              <div className="admin-panel-card flex flex-wrap items-center justify-between gap-4">
                <div>
                  <p className="font-mono text-[0.66rem] font-semibold uppercase tracking-[0.08em] text-[var(--color-text-muted)]">
                    EXPORTAÇÃO &amp; ENVIO // CARTÃO DIGITAL
                  </p>
                  <p className="font-display mt-0.5 text-base font-bold text-[var(--color-text-main)]">
                    Convite em PDF, Imagem &amp; WhatsApp
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setTab('share')}
                  className="btn-admin-outline bg-white/85"
                  style={{ minHeight: 42 }}
                >
                  <Download size={15} />
                  <span>Baixar PDF / Imagem</span>
                </button>
              </div>
            </div>
          </>
        )}

        {tab === 'rsvps' && (
          <section className="admin-panel-card space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--color-card-border)] pb-4">
              <div>
                <p className="font-mono text-[0.66rem] font-semibold uppercase tracking-[0.08em] text-[var(--color-text-muted)]">
                  CONVIDADOS // LISTA DE PRESENÇA
                </p>
                <h2 className="font-display mt-1 text-xl font-bold tracking-[-0.025em] text-[var(--color-text-main)]">
                  Confirmações de Presença
                </h2>
              </div>
              <div className="flex flex-wrap items-center gap-2 font-mono text-xs">
                <span className="status-pill is-confirmed">{stats.confirmedResponses} sim</span>
                <span className="status-pill is-declined">{stats.declinedCount} não</span>
              </div>
            </div>
              <div className="admin-toolbar">
                <div className="admin-search-wrapper">
                  <Search size={16} className="search-icon" />
                  <input
                    type="search"
                    placeholder="Buscar por nome ou WhatsApp..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    aria-label="Buscar confirmações"
                  />
                  {search && (
                    <button
                      type="button"
                      onClick={() => setSearch('')}
                      className="search-clear-btn"
                      aria-label="Limpar busca"
                    >
                      <X size={13} />
                    </button>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-2.5">
                  <select
                    className="admin-select-filter"
                    value={filter}
                    onChange={(e) => setFilter(e.target.value as FilterMode)}
                    aria-label="Filtrar por status"
                  >
                    <option value="all">Todos os status ({stats.totalResponses})</option>
                    <option value="yes">Confirmados ({stats.confirmedResponses})</option>
                    <option value="no">Não poderão ir ({stats.declinedCount})</option>
                  </select>

                  <button type="button" onClick={handleExportCsv} disabled={filtered.length === 0} className="btn-admin-outline" style={{ minHeight: 42 }}>
                    <Download size={14} />
                    <span>CSV</span>
                  </button>

                  <button
                    type="button"
                    onClick={openCreateModal}
                    className="inline-flex min-h-[42px] items-center gap-1.5 rounded-[var(--radius-sm)] bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-accent)] px-4 py-2 text-xs font-semibold uppercase tracking-wider text-white shadow-sm transition hover:brightness-105"
                  >
                    <Plus size={15} />
                    <span>Nova Confirmação</span>
                  </button>
                </div>
              </div>

              {error && (
                <p className="rounded-[var(--radius-sm)] border border-rose-200 bg-rose-50 p-3 text-center text-sm font-medium text-rose-700" role="alert">
                  {error}
                </p>
              )}

              {loading ? (
                <div className="flex flex-col items-center justify-center py-16 text-[var(--color-text-muted)]">
                  <Loader2 className="mb-3 animate-spin" size={26} />
                  <p className="font-mono text-xs uppercase tracking-[0.1em]">Sincronizando registros...</p>
                </div>
              ) : filtered.length === 0 ? (
                <div className="rounded-[var(--radius-md)] border border-dashed border-[var(--color-card-border)] bg-white/60 py-14 text-center">
                  <p className="font-display text-lg font-bold text-[var(--color-text-main)]">Nenhuma confirmação encontrada</p>
                  <p className="mt-1 text-sm text-[var(--color-text-muted)]">
                    {rsvps.length === 0
                      ? 'Assim que seus convidados responderem ao convite, a lista aparecerá aqui.'
                      : 'Tente limpar a busca ou alterar o filtro selecionado.'}
                  </p>
                </div>
              ) : (
                <>
                  {/* Tabela Desktop */}
                  <div className="admin-table-container">
                    <table className="admin-data-table">
                      <thead>
                        <tr>
                          <th>Convidado(a)</th>
                          <th>WhatsApp</th>
                          <th>Status</th>
                          <th>Recebido em</th>
                          <th className="text-right">Ações</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filtered.map((item) => (
                          <tr key={item.id}>
                            <td className="font-semibold">{item.name}</td>
                            <td>
                              <a
                                href={toWhatsAppUrl(item.phone)}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="font-mono inline-flex items-center gap-1.5 rounded-full bg-[#eefce8] px-3 py-1 text-xs font-medium text-[#1b6e38] transition hover:brightness-95"
                              >
                                <MessageCircle size={13} />
                                {formatPhone(item.phone)}
                              </a>
                            </td>
                            <td>
                              {item.attending ? (
                                <span className="status-pill is-confirmed">
                                  <CheckCircle2 size={13} /> Confirmado
                                </span>
                              ) : (
                                <span className="status-pill is-declined">
                                  <XCircle size={13} /> Não irá
                                </span>
                              )}
                            </td>
                            <td className="font-mono text-xs text-[var(--color-text-muted)]">{formatDateTime(item.created_at)}</td>
                            <td>
                              <div className="flex justify-end gap-1.5">
                                <button
                                  type="button"
                                  onClick={() => openEditModal(item)}
                                  className="btn-table-action"
                                  aria-label={`Editar ${item.name}`}
                                  title="Editar"
                                >
                                  <Edit3 size={14} />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setDeleteTarget(item)}
                                  className="btn-table-action is-danger"
                                  aria-label={`Excluir ${item.name}`}
                                  title="Excluir"
                                >
                                  <Trash2 size={14} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Cartões Mobile (ativado automaticamente em <= 768px) */}
                  <div className="mobile-cards-list">
                    {filtered.map((item) => (
                      <div key={item.id} className="mobile-data-card space-y-3">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <h3 className="font-display text-base font-bold text-[var(--color-text-main)]">{item.name}</h3>
                            <p className="mobile-card-meta-item mt-0.5">{formatDateTime(item.created_at)}</p>
                          </div>
                          {item.attending ? (
                            <span className="status-pill is-confirmed">
                              <CheckCircle2 size={12} /> Confirmado
                            </span>
                          ) : (
                            <span className="status-pill is-declined">
                              <XCircle size={12} /> Não irá
                            </span>
                          )}
                        </div>

                        <div className="border-t border-[var(--color-card-border)] pt-2.5">
                          <span className="mobile-card-meta-item">{formatPhone(item.phone)}</span>
                        </div>

                        <div className="grid grid-cols-3 gap-2 pt-1">
                          <a
                            href={toWhatsAppUrl(item.phone)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="mobile-card-action-btn flex items-center justify-center gap-1.5 rounded-[var(--radius-sm)] bg-[#eefce8] px-3 text-xs font-semibold text-[#1b6e38]"
                          >
                            <MessageCircle size={15} /> Whats
                          </a>
                          <button
                            type="button"
                            onClick={() => openEditModal(item)}
                            className="mobile-card-action-btn flex items-center justify-center gap-1.5 rounded-[var(--radius-sm)] border border-[var(--color-card-border)] bg-white px-3 text-xs font-semibold text-[var(--color-text-main)]"
                          >
                            <Edit3 size={15} /> Editar
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeleteTarget(item)}
                            className="mobile-card-action-btn flex items-center justify-center gap-1.5 rounded-[var(--radius-sm)] border border-rose-200 bg-rose-50 px-3 text-xs font-semibold text-rose-700"
                          >
                            <Trash2 size={15} /> Excluir
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </section>
        )}
      </main>

      {/* Modal de Adicionar / Editar (Bottom-Sheet no Mobile) */}
      {modalMode !== 'closed' && (
        <div
          className="admin-modal-backdrop"
          role="dialog"
          aria-modal="true"
          aria-labelledby="rsvp-modal-title"
          onClick={(e) => {
            if (e.target === e.currentTarget && !modalSaving) setModalMode('closed');
          }}
        >
          <div className="admin-modal-card">
            <div className="mb-4 flex items-center justify-between border-b border-[var(--color-card-border)] pb-3">
              <div>
                <p className="font-mono text-[0.66rem] uppercase tracking-[0.08em] text-[var(--color-text-muted)]">
                  {modalMode === 'create' ? 'NOVO REGISTRO' : 'EDITAR REGISTRO'}
                </p>
                <h2 id="rsvp-modal-title" className="font-display text-lg font-bold text-[var(--color-text-main)]">
                  {modalMode === 'create' ? 'Adicionar Confirmação' : 'Editar Confirmação'}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setModalMode('closed')}
                disabled={modalSaving}
                className="btn-table-action"
                aria-label="Fechar modal"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSaveModal} noValidate className="space-y-4">
              <div>
                <label htmlFor="modal-name" className="mb-1 block font-mono text-[0.7rem] uppercase tracking-[0.08em] text-[var(--color-text-muted)]">
                  Nome completo
                </label>
                <input
                  id="modal-name"
                  className="input-magic"
                  value={modalForm.name}
                  onChange={(e) => setModalForm({ ...modalForm, name: e.target.value })}
                  maxLength={120}
                />
                {modalErrors.name && <p className="mt-1 text-xs text-rose-600">{modalErrors.name}</p>}
              </div>

              <div>
                <label htmlFor="modal-phone" className="mb-1 block font-mono text-[0.7rem] uppercase tracking-[0.08em] text-[var(--color-text-muted)]">
                  WhatsApp (com DDD)
                </label>
                <input
                  id="modal-phone"
                  type="tel"
                  inputMode="numeric"
                  className="input-magic font-mono"
                  placeholder="(68) 99999-9999"
                  value={formatPhone(modalForm.phone)}
                  onChange={(e) => setModalForm({ ...modalForm, phone: e.target.value.replace(/\D/g, '').slice(0, 11) })}
                />
                {modalErrors.phone && <p className="mt-1 text-xs text-rose-600">{modalErrors.phone}</p>}
              </div>

              <div>
                <span className="mb-1.5 block font-mono text-[0.7rem] uppercase tracking-[0.08em] text-[var(--color-text-muted)]">
                  Presença
                </span>
                <div className="grid grid-cols-2 gap-2.5">
                  <button
                    type="button"
                    onClick={() => setModalForm({ ...modalForm, attending: true })}
                    className={`flex min-h-[44px] items-center justify-center gap-1.5 rounded-[var(--radius-sm)] border text-xs font-semibold transition ${
                      modalForm.attending
                        ? 'border-emerald-500 bg-emerald-50 text-emerald-800'
                        : 'border-[var(--color-card-border)] bg-white text-[var(--color-text-muted)]'
                    }`}
                  >
                    <Check size={14} /> Confirmado
                  </button>
                  <button
                    type="button"
                    onClick={() => setModalForm({ ...modalForm, attending: false, companions: 0 })}
                    className={`flex min-h-[44px] items-center justify-center gap-1.5 rounded-[var(--radius-sm)] border text-xs font-semibold transition ${
                      !modalForm.attending
                        ? 'border-rose-400 bg-rose-50 text-rose-800'
                        : 'border-[var(--color-card-border)] bg-white text-[var(--color-text-muted)]'
                    }`}
                  >
                    <X size={14} /> Não irá
                  </button>
                </div>
              </div>

              {modalServerError && (
                <p className="rounded-[var(--radius-sm)] bg-rose-50 p-3 text-center text-xs font-medium text-rose-700" role="alert">
                  {modalServerError}
                </p>
              )}

              <div className="flex justify-end gap-2.5 border-t border-[var(--color-card-border)] pt-4">
                <button
                  type="button"
                  onClick={() => setModalMode('closed')}
                  disabled={modalSaving}
                  className="btn-admin-outline"
                  style={{ minHeight: 44 }}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={modalSaving}
                  className="inline-flex min-h-[44px] items-center gap-2 rounded-[var(--radius-sm)] bg-[var(--color-primary)] px-5 text-xs font-semibold uppercase tracking-wider text-white transition hover:brightness-110 disabled:opacity-60"
                >
                  {modalSaving && <Loader2 size={15} className="animate-spin" />}
                  {modalSaving ? 'Salvando...' : 'Salvar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de Confirmação de Exclusão (sempre centralizado) */}
      {deleteTarget && (
        <div
          className="admin-modal-backdrop"
          role="dialog"
          aria-modal="true"
          aria-labelledby="delete-modal-title"
          onClick={(e) => {
            if (e.target === e.currentTarget && !deleting) setDeleteTarget(null);
          }}
        >
          <div className="confirm-modal-card">
            <p className="font-mono text-[0.66rem] uppercase tracking-[0.08em] text-rose-600">CONFIRMAÇÃO NECESSÁRIA</p>
            <h2 id="delete-modal-title" className="font-display mt-1 text-lg font-bold text-[var(--color-text-main)]">
              Excluir confirmação?
            </h2>
            <p className="mt-2 text-sm text-[var(--color-text-muted)]">
              Deseja remover o registro de <strong className="text-[var(--color-text-main)]">{deleteTarget.name}</strong>? Esta ação não
              pode ser desfeita.
            </p>
            <div className="mt-5 flex justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                disabled={deleting}
                className="btn-admin-outline"
                style={{ minHeight: 44 }}
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={deleting}
                className="inline-flex min-h-[44px] items-center gap-1.5 rounded-[var(--radius-sm)] bg-rose-600 px-4 text-xs font-semibold uppercase tracking-wider text-white transition hover:bg-rose-700 disabled:opacity-60"
              >
                {deleting && <Loader2 size={14} className="animate-spin" />}
                {deleting ? 'Excluindo...' : 'Excluir'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
