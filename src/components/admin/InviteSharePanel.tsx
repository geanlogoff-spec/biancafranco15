import { Check, Copy, Link2, MessageCircle, RotateCcw, Sparkles } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { invitation } from '../../config/invitation.config';
import { eventDate, eventParts } from '../../lib/date';

const STORAGE_KEY = 'bianca15_whatsapp_template_v1';

function formatShortDate(): string {
  return new Intl.DateTimeFormat('pt-BR', {
    timeZone: invitation.event.timeZone,
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(eventDate);
}

function buildTemplates() {
  const shortDate = formatShortDate();
  const v = invitation.venue;
  const venueLine = `${v.name ? `${v.name} — ` : ''}${v.address} – ${v.district}, ${v.city} - ${v.state}`;

  return [
    {
      id: 'completo',
      label: 'Conto de Fadas (Completo)',
      text: `Olá{convidado}! ✨🦋\n\nCom muita alegria, convido você para celebrar os meus *15 anos* — uma noite mágica de conto de fadas!\n\n📅 *Data:* ${shortDate} às ${eventParts.time}\n📍 *Local:* ${venueLine}\n\nToque no link abaixo para abrir seu convite interativo e confirmar sua presença:\n{link}`,
    },
    {
      id: 'curto',
      label: 'Curto e Delicado',
      text: `Olá{convidado}! 💜✨\nVocê é meu(minha) convidado(a) especial para os meus *15 anos* no dia *${shortDate} às ${eventParts.time}*!\n\nAbra seu convite encantado e confirme sua presença aqui:\n{link}`,
    },
    {
      id: 'lembrete',
      label: 'Lembrete de Confirmação',
      text: `Olá{convidado}! 🌸\nPassando com carinho para lembrar de confirmar sua presença nos meus *15 anos* (${shortDate} às ${eventParts.time}).\n\nBasta acessar o convite no link abaixo:\n{link}`,
    },
  ];
}

export function InviteSharePanel() {
  const templates = useMemo(() => buildTemplates(), []);
  const defaultOrigin = typeof window !== 'undefined' ? `${window.location.origin}/` : '';

  const [inviteLink, setInviteLink] = useState(defaultOrigin);
  const [guestName, setGuestName] = useState('');
  const [messageTemplate, setMessageTemplate] = useState(() => {
    if (typeof window === 'undefined') return templates[0].text;
    return window.localStorage.getItem(STORAGE_KEY) || templates[0].text;
  });
  const [copiedState, setCopiedState] = useState<'none' | 'all' | 'link'>('none');

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, messageTemplate);
    } catch {
      /* localStorage indisponível */
    }
  }, [messageTemplate]);

  const resolvedMessage = useMemo(() => {
    const trimmedGuest = guestName.trim();
    const guestChunk = trimmedGuest ? `, ${trimmedGuest}` : '';
    const linkChunk = inviteLink.trim() || defaultOrigin;

    let text = messageTemplate.replace(/\{convidado\}/g, guestChunk);
    if (text.includes('{link}')) {
      text = text.replace(/\{link\}/g, linkChunk);
    } else if (linkChunk) {
      text = `${text.trimEnd()}\n\n${linkChunk}`;
    }
    return text;
  }, [guestName, inviteLink, messageTemplate, defaultOrigin]);

  const copyText = async (value: string, type: 'all' | 'link') => {
    if (!value) return;
    await navigator.clipboard.writeText(value);
    setCopiedState(type);
    setTimeout(() => setCopiedState('none'), 2200);
  };

  const whatsappShareUrl = `https://wa.me/?text=${encodeURIComponent(resolvedMessage)}`;

  return (
    <div className="admin-panel-card">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3 border-b border-[var(--color-card-border)] pb-4">
        <div>
          <p className="font-mono text-[0.68rem] font-semibold uppercase tracking-[0.11em] text-[var(--color-text-muted)]">
            CENTRAL DE ENVIO // WHATSAPP
          </p>
          <h2 className="font-display mt-1 text-xl font-bold tracking-[-0.025em] text-[var(--color-text-main)] sm:text-2xl">
            Personalizar Convite &amp; Copiar Link
          </h2>
        </div>

        <button
          type="button"
          onClick={() => setMessageTemplate(templates[0].text)}
          className="btn-admin-outline"
          style={{ minHeight: 42 }}
        >
          <RotateCcw size={14} /> Restaurar padrão
        </button>
      </div>

      <div className="dashboard-grid-2">
        <div className="space-y-5">
          <div>
            <label
              htmlFor="invite-url"
              className="mb-1.5 block font-mono text-[0.7rem] font-semibold uppercase tracking-[0.08em] text-[var(--color-text-muted)]"
            >
              Link do Convite
            </label>
            <div className="flex flex-col gap-2 sm:flex-row">
              <input
                id="invite-url"
                type="url"
                className="input-magic font-mono text-sm"
                style={{ minHeight: 44 }}
                value={inviteLink}
                onChange={(e) => setInviteLink(e.target.value)}
                placeholder="https://seu-convite.com/"
              />
              <button
                type="button"
                onClick={() => copyText(inviteLink.trim(), 'link')}
                className={`btn-admin-outline shrink-0 justify-center ${copiedState === 'link' ? 'is-copied' : ''}`}
                style={{ minHeight: 44 }}
              >
                {copiedState === 'link' ? <Check size={15} /> : <Link2 size={15} />}
                {copiedState === 'link' ? 'Link copiado' : 'Copiar só o link'}
              </button>
            </div>
          </div>

          <div>
            <label
              htmlFor="guest-greeting"
              className="mb-1.5 block font-mono text-[0.7rem] font-semibold uppercase tracking-[0.08em] text-[var(--color-text-muted)]"
            >
              Nome do Convidado / Família (Opcional)
            </label>
            <input
              id="guest-greeting"
              type="text"
              className="input-magic"
              style={{ minHeight: 44 }}
              value={guestName}
              onChange={(e) => setGuestName(e.target.value)}
              placeholder="Ex.: Tia Maria e família"
            />
            <p className="mt-1.5 text-xs text-[var(--color-text-muted)]">
              Preenche automaticamente a variável{' '}
              <code className="font-mono rounded bg-[var(--color-bg-alt)] px-1.5 py-0.5 text-[0.75rem] text-[var(--color-primary)]">
                {'{convidado}'}
              </code>{' '}
              na saudação.
            </p>
          </div>

          <div>
            <p className="mb-2 font-mono text-[0.7rem] font-semibold uppercase tracking-[0.08em] text-[var(--color-text-muted)]">
              Modelos Prontos
            </p>
            <div className="flex flex-wrap gap-2">
              {templates.map((tpl) => {
                const active = messageTemplate === tpl.text;
                return (
                  <button
                    key={tpl.id}
                    type="button"
                    onClick={() => setMessageTemplate(tpl.text)}
                    className={`inline-flex min-h-[38px] items-center gap-1.5 rounded-[var(--radius-sm)] border px-3.5 py-2 text-xs font-semibold transition ${
                      active
                        ? 'border-[var(--color-primary)] bg-[var(--color-primary)] text-white shadow-sm'
                        : 'border-[var(--color-card-border)] bg-white text-[var(--color-text-main)] hover:bg-[var(--color-bg-alt)]'
                    }`}
                  >
                    <Sparkles size={13} />
                    {tpl.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label
              htmlFor="message-editor"
              className="mb-1.5 block font-mono text-[0.7rem] font-semibold uppercase tracking-[0.08em] text-[var(--color-text-muted)]"
            >
              Editor da Mensagem
            </label>
            <textarea
              id="message-editor"
              rows={8}
              className="input-magic resize-y text-sm leading-relaxed"
              value={messageTemplate}
              onChange={(e) => setMessageTemplate(e.target.value)}
            />
            <p className="mt-1.5 text-xs text-[var(--color-text-muted)]">
              Variáveis disponíveis:{' '}
              <code className="font-mono rounded bg-[var(--color-bg-alt)] px-1.5 py-0.5 text-[0.75rem] text-[var(--color-primary)]">
                {'{convidado}'}
              </code>{' '}
              e{' '}
              <code className="font-mono rounded bg-[var(--color-bg-alt)] px-1.5 py-0.5 text-[0.75rem] text-[var(--color-primary)]">
                {'{link}'}
              </code>
              .
            </p>
          </div>
        </div>

        <div className="flex flex-col justify-between rounded-[var(--radius-md)] border border-[var(--color-card-border)] bg-[var(--color-bg-alt)]/55 p-5 sm:p-6">
          <div>
            <div className="mb-3 flex items-center justify-between">
              <p className="font-mono text-[0.7rem] font-semibold uppercase tracking-[0.08em] text-[var(--color-text-muted)]">
                Pré-visualização // WhatsApp
              </p>
              <span className="font-mono text-[0.68rem] text-[var(--color-text-light)] tabular-nums">
                {resolvedMessage.length} chars
              </span>
            </div>

            <div className="rounded-2xl rounded-tl-sm border border-[#cfe5cd] bg-[#eefce8] p-4 text-sm leading-relaxed text-[#1f2c24] shadow-sm whitespace-pre-wrap break-words">
              {resolvedMessage}
            </div>
          </div>

          <div className="mt-6 flex flex-col gap-3">
            <button
              type="button"
              onClick={() => copyText(resolvedMessage, 'all')}
              className={`btn-magic flex w-full items-center justify-center gap-2 rounded-[var(--radius-sm)] px-6 py-3.5 text-xs font-semibold uppercase tracking-[0.14em] text-white shadow-md transition active:scale-[0.99] ${
                copiedState === 'all'
                  ? 'bg-emerald-600'
                  : 'bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-accent)]'
              }`}
              style={{ minHeight: 48 }}
            >
              {copiedState === 'all' ? <Check size={16} /> : <Copy size={16} />}
              {copiedState === 'all' ? 'Texto + Link Copiados!' : 'Copiar Texto + Link'}
            </button>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <button
                type="button"
                onClick={() => copyText(inviteLink.trim(), 'link')}
                className={`btn-admin-outline justify-center ${copiedState === 'link' ? 'is-copied' : ''}`}
                style={{ minHeight: 46 }}
              >
                {copiedState === 'link' ? <Check size={15} /> : <Link2 size={15} />}
                {copiedState === 'link' ? 'Link Copiado!' : 'Copiar Apenas o Link'}
              </button>

              <a
                href={whatsappShareUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 rounded-[var(--radius-sm)] bg-[#25D366] px-4 py-3 text-xs font-semibold uppercase tracking-[0.12em] text-white shadow-sm transition hover:brightness-95"
                style={{ minHeight: 46 }}
              >
                <MessageCircle size={15} />
                Enviar no WhatsApp
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
