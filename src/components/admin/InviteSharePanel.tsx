import {
  Check,
  Copy,
  Download,
  FileText,
  Image as ImageIcon,
  Link2,
  Loader2,
  MapPin,
  MessageCircle,
  RotateCcw,
  Send,
  Sparkles,
} from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { invitation } from '../../config/invitation.config';
import { eventDate, eventParts } from '../../lib/date';
import {
  canvasToPngBlob,
  generateInvitePdfBlob,
  renderInviteCardToCanvas,
  type PdfLinkRect,
} from '../../lib/inviteCardGenerator';

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

function slugifyFilePart(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function triggerBlobDownload(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1200);
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

  // Estúdio de geração de Cartão (PDF Interativo & Imagem PNG)
  const [includePhoto, setIncludePhoto] = useState(true);
  const [previewUrl, setPreviewUrl] = useState('');
  const [previewBusy, setPreviewBusy] = useState(true);
  const [exportingAction, setExportingAction] = useState<
    'none' | 'pdf' | 'png' | 'copy-img' | 'share-png' | 'share-pdf'
  >('none');
  const [cardNotice, setCardNotice] = useState<{ type: 'success' | 'info' | 'error'; text: string } | null>(null);

  const cardCacheRef = useRef<{
    key: string;
    canvas: HTMLCanvasElement;
    links: PdfLinkRect[];
  } | null>(null);

  const effectiveInviteUrl = inviteLink.trim() || defaultOrigin;
  const mapsUrl = invitation.venue.mapsLink;
  const cardCacheKey = `${guestName.trim()}||${effectiveInviteUrl}||${mapsUrl}||${includePhoto ? '1' : '0'}`;

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, messageTemplate);
    } catch {
      /* localStorage indisponível */
    }
  }, [messageTemplate]);

  useEffect(() => {
    let cancelled = false;
    setPreviewBusy(true);

    const timer = window.setTimeout(async () => {
      try {
        const result = await renderInviteCardToCanvas({
          guestName,
          inviteUrl: effectiveInviteUrl,
          mapsUrl,
          includePhoto,
        });
        if (cancelled) return;
        cardCacheRef.current = { key: cardCacheKey, canvas: result.canvas, links: result.links };
        setPreviewUrl(result.canvas.toDataURL('image/png'));
      } catch {
        if (!cancelled) {
          setCardNotice({
            type: 'error',
            text: 'Não foi possível renderizar a pré-visualização do cartão neste navegador.',
          });
        }
      } finally {
        if (!cancelled) setPreviewBusy(false);
      }
    }, 180);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [cardCacheKey, guestName, effectiveInviteUrl, mapsUrl, includePhoto]);

  const resolvedMessage = useMemo(() => {
    const trimmedGuest = guestName.trim();
    const guestChunk = trimmedGuest ? `, ${trimmedGuest}` : '';
    const linkChunk = effectiveInviteUrl;

    let text = messageTemplate.replace(/\{convidado\}/g, guestChunk);
    if (text.includes('{link}')) {
      text = text.replace(/\{link\}/g, linkChunk);
    } else if (linkChunk) {
      text = `${text.trimEnd()}\n\n${linkChunk}`;
    }
    return text;
  }, [guestName, effectiveInviteUrl, messageTemplate]);

  const copyText = async (value: string, type: 'all' | 'link') => {
    if (!value) return;
    await navigator.clipboard.writeText(value);
    setCopiedState(type);
    setTimeout(() => setCopiedState('none'), 2200);
  };

  const getOrRenderCard = useCallback(async () => {
    if (cardCacheRef.current && cardCacheRef.current.key === cardCacheKey) {
      return cardCacheRef.current;
    }
    const rendered = await renderInviteCardToCanvas({
      guestName,
      inviteUrl: effectiveInviteUrl,
      mapsUrl,
      includePhoto,
    });
    const entry = { key: cardCacheKey, canvas: rendered.canvas, links: rendered.links };
    cardCacheRef.current = entry;
    return entry;
  }, [cardCacheKey, guestName, effectiveInviteUrl, mapsUrl, includePhoto]);

  const buildFileBaseName = () => {
    const debutanteSlug = slugifyFilePart(invitation.debutante.name) || 'debutante';
    const guestSlug = guestName.trim() ? `-${slugifyFilePart(guestName)}` : '';
    return `convite-15-anos-${debutanteSlug}${guestSlug}`;
  };

  const handleDownloadPdf = async () => {
    setExportingAction('pdf');
    setCardNotice(null);
    try {
      const { canvas, links } = await getOrRenderCard();
      const blob = await generateInvitePdfBlob(canvas, links);
      triggerBlobDownload(blob, `${buildFileBaseName()}.pdf`);
      setCardNotice({
        type: 'success',
        text: 'PDF baixado com sucesso! Os botões do convite e da localização estão clicáveis dentro do arquivo.',
      });
    } catch {
      setCardNotice({ type: 'error', text: 'Erro ao gerar o PDF do convite.' });
    } finally {
      setExportingAction('none');
    }
  };

  const handleDownloadPng = async () => {
    setExportingAction('png');
    setCardNotice(null);
    try {
      const { canvas } = await getOrRenderCard();
      const blob = await canvasToPngBlob(canvas);
      triggerBlobDownload(blob, `${buildFileBaseName()}.png`);
      setCardNotice({
        type: 'success',
        text: 'Imagem PNG personalizada baixada! Ideal para enviar junto com o link no WhatsApp.',
      });
    } catch {
      setCardNotice({ type: 'error', text: 'Erro ao gerar a imagem PNG do convite.' });
    } finally {
      setExportingAction('none');
    }
  };

  const handleCopyImageToClipboard = async () => {
    setExportingAction('copy-img');
    setCardNotice(null);
    try {
      if (
        typeof window === 'undefined' ||
        typeof ClipboardItem === 'undefined' ||
        !navigator.clipboard?.write
      ) {
        setCardNotice({
          type: 'info',
          text: 'Este navegador não suporta copiar imagens direto. Use "Baixar Imagem (PNG)" para enviar.',
        });
        return;
      }

      const { canvas } = await getOrRenderCard();
      const blob = await canvasToPngBlob(canvas);
      await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
      setCardNotice({
        type: 'success',
        text: 'Imagem copiada! Agora abra o WhatsApp Web e pressione Ctrl+V na conversa para enviar.',
      });
    } catch {
      setCardNotice({
        type: 'info',
        text: 'Não foi possível copiar a imagem automaticamente neste navegador. Baixe o PNG pelo botão ao lado.',
      });
    } finally {
      setExportingAction('none');
    }
  };

  const handleShareViaWhatsApp = async (format: 'png' | 'pdf') => {
    setExportingAction(format === 'pdf' ? 'share-pdf' : 'share-png');
    setCardNotice(null);
    const whatsappShareUrl = `https://wa.me/?text=${encodeURIComponent(resolvedMessage)}`;

    try {
      const { canvas, links } = await getOrRenderCard();
      const blob = format === 'pdf' ? await generateInvitePdfBlob(canvas, links) : await canvasToPngBlob(canvas);
      const mime = format === 'pdf' ? 'application/pdf' : 'image/png';
      const ext = format === 'pdf' ? 'pdf' : 'png';
      const filename = `${buildFileBaseName()}.${ext}`;
      const file = new File([blob], filename, { type: mime });

      const supportsNativeFileShare =
        typeof navigator !== 'undefined' &&
        typeof navigator.share === 'function' &&
        typeof navigator.canShare === 'function' &&
        navigator.canShare({ files: [file] });

      if (supportsNativeFileShare) {
        try {
          await navigator.share({
            files: [file],
            title: `15 Anos de ${invitation.debutante.name}`,
            text: resolvedMessage,
          });
          setCardNotice({
            type: 'success',
            text: `${format === 'pdf' ? 'PDF' : 'Imagem'} compartilhado com a mensagem e os links!`,
          });
          return;
        } catch (err) {
          if (err instanceof DOMException && err.name === 'AbortError') {
            return;
          }
          /* fallback para download + WhatsApp Web abaixo */
        }
      }

      triggerBlobDownload(blob, filename);
      window.open(whatsappShareUrl, '_blank', 'noopener,noreferrer');
      setCardNotice({
        type: 'info',
        text: `Arquivo (${ext.toUpperCase()}) baixado e WhatsApp aberto com a mensagem pronta! Anexe o arquivo baixado na conversa.`,
      });
    } catch {
      setCardNotice({ type: 'error', text: 'Não foi possível preparar o arquivo para envio.' });
    } finally {
      setExportingAction('none');
    }
  };

  const whatsappShareUrl = `https://wa.me/?text=${encodeURIComponent(resolvedMessage)}`;

  return (
    <div className="space-y-5">
      {/* Bloco 1: Central de Mensagem e Links para WhatsApp */}
      <div className="admin-panel-card">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3 border-b border-[var(--color-card-border)] pb-4">
          <div>
            <p className="font-mono text-[0.68rem] font-semibold uppercase tracking-[0.11em] text-[var(--color-text-muted)]">
              CENTRAL DE ENVIO // WHATSAPP &amp; PERSONALIZAÇÃO
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
                e personaliza o cartão em PDF/PNG abaixo.
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

      {/* Bloco 2: Cartão Oficial do Convite (PDF com Links Clicáveis & Imagem PNG) */}
      <section className="admin-panel-card">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3 border-b border-[var(--color-card-border)] pb-4">
          <div>
            <p className="font-mono text-[0.68rem] font-semibold uppercase tracking-[0.11em] text-[var(--color-text-muted)]">
              ESTÚDIO DE EXPORTAÇÃO // PDF INTERATIVO &amp; IMAGEM PNG
            </p>
            <h2 className="font-display mt-1 text-xl font-bold tracking-[-0.025em] text-[var(--color-text-main)] sm:text-2xl">
              Convite Personalizado para Baixar ou Enviar no WhatsApp
            </h2>
          </div>

          <div className="inline-flex rounded-[var(--radius-sm)] border border-[var(--color-card-border)] bg-white/80 p-1">
            <button
              type="button"
              onClick={() => setIncludePhoto(true)}
              className={`rounded-[6px] px-3 py-1.5 text-xs font-semibold transition ${
                includePhoto
                  ? 'bg-[var(--color-primary)] text-white shadow-sm'
                  : 'text-[var(--color-text-muted)] hover:text-[var(--color-text-main)]'
              }`}
            >
              Com Foto da Princesa
            </button>
            <button
              type="button"
              onClick={() => setIncludePhoto(false)}
              className={`rounded-[6px] px-3 py-1.5 text-xs font-semibold transition ${
                !includePhoto
                  ? 'bg-[var(--color-primary)] text-white shadow-sm'
                  : 'text-[var(--color-text-muted)] hover:text-[var(--color-text-main)]'
              }`}
            >
              Brasão Clássico (15)
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[minmax(0,360px)_1fr]">
          {/* Preview do Cartão */}
          <div className="flex flex-col items-center rounded-[var(--radius-md)] border border-[var(--color-card-border)] bg-[var(--color-bg-alt)]/50 p-4">
            <div className="relative aspect-[2/3] w-full max-w-[320px] overflow-hidden rounded-2xl border border-[var(--color-card-border)] bg-white shadow-[0_18px_40px_-14px_rgba(110,79,153,0.32)]">
              {previewUrl ? (
                <img
                  src={previewUrl}
                  alt={`Prévia do convite em cartão de ${invitation.debutante.name}`}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full flex-col items-center justify-center gap-2 text-[var(--color-text-muted)]">
                  <Loader2 className="animate-spin" size={24} />
                  <span className="font-mono text-xs uppercase tracking-wider">Gerando arte...</span>
                </div>
              )}

              {previewBusy && previewUrl && (
                <div className="absolute right-2.5 top-2.5 inline-flex items-center gap-1.5 rounded-full bg-white/90 px-2.5 py-1 text-[0.68rem] font-medium text-[var(--color-primary)] shadow-sm backdrop-blur-sm">
                  <Loader2 size={11} className="animate-spin" />
                  Atualizando
                </div>
              )}
            </div>
            <p className="mt-3 text-center font-mono text-[0.68rem] text-[var(--color-text-muted)]">
              1080 × 1620 px · Alta definição (2×)
            </p>
          </div>

          {/* Informações embutidas, Downloads & Envio via WhatsApp */}
          <div className="flex flex-col justify-between space-y-5">
            <div className="space-y-4">
              <div>
                <label
                  htmlFor="card-guest-sync"
                  className="mb-1.5 block font-mono text-[0.7rem] font-semibold uppercase tracking-[0.08em] text-[var(--color-text-muted)]"
                >
                  Personalizar Nome no Cartão (Opcional)
                </label>
                <input
                  id="card-guest-sync"
                  type="text"
                  className="input-magic"
                  style={{ minHeight: 44 }}
                  value={guestName}
                  onChange={(e) => setGuestName(e.target.value)}
                  placeholder="Deixe vazio para convite geral ou digite o nome (Ex.: Família Silva)"
                />
              </div>

              <div className="rounded-[var(--radius-md)] border border-[var(--color-card-border)] bg-white/75 p-4 space-y-2.5">
                <p className="font-mono text-[0.68rem] font-semibold uppercase tracking-[0.08em] text-[var(--color-text-muted)]">
                  Informações e Links Incluídos no Cartão
                </p>
                <div className="space-y-1.5 text-xs text-[var(--color-text-main)]">
                  <p className="flex items-start gap-2">
                    <Sparkles size={14} className="mt-0.5 shrink-0 text-[var(--color-primary)]" />
                    <span>
                      <strong>Evento:</strong> {eventParts.weekday}, {eventParts.day} de {eventParts.month} de{' '}
                      {eventParts.year} às {eventParts.time} · {invitation.venue.address}, {invitation.venue.district},{' '}
                      {invitation.venue.city}/{invitation.venue.state}
                    </span>
                  </p>
                  <p className="flex items-start gap-2">
                    <Link2 size={14} className="mt-0.5 shrink-0 text-[var(--color-primary)]" />
                    <span className="break-all">
                      <strong>Convite &amp; Confirmação (clicável no PDF):</strong>{' '}
                      <span className="font-mono text-[0.72rem] text-[var(--color-primary)]">
                        {effectiveInviteUrl}
                      </span>
                    </span>
                  </p>
                  <p className="flex items-start gap-2">
                    <MapPin size={14} className="mt-0.5 shrink-0 text-[var(--color-primary)]" />
                    <span className="break-all">
                      <strong>Google Maps (clicável no PDF):</strong>{' '}
                      <span className="font-mono text-[0.72rem] text-[var(--color-primary)]">{mapsUrl}</span>
                    </span>
                  </p>
                </div>
              </div>
            </div>

            {cardNotice && (
              <p
                role="status"
                className={`rounded-[var(--radius-sm)] border px-3.5 py-2.5 text-xs font-medium ${
                  cardNotice.type === 'success'
                    ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
                    : cardNotice.type === 'error'
                      ? 'border-rose-200 bg-rose-50 text-rose-700'
                      : 'border-[var(--color-card-border)] bg-[var(--color-bg-alt)] text-[var(--color-text-main)]'
                }`}
              >
                {cardNotice.text}
              </p>
            )}

            {/* Botões de Download */}
            <div className="space-y-3">
              <p className="font-mono text-[0.68rem] font-semibold uppercase tracking-[0.08em] text-[var(--color-text-muted)]">
                1. Baixar Arquivo Personalizado
              </p>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <button
                  type="button"
                  onClick={handleDownloadPdf}
                  disabled={exportingAction !== 'none'}
                  className="btn-magic flex items-center justify-center gap-2 rounded-[var(--radius-sm)] bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-accent)] px-4 py-3 text-xs font-semibold uppercase tracking-[0.1em] text-white shadow-md transition hover:brightness-105 disabled:opacity-60"
                  style={{ minHeight: 48 }}
                >
                  {exportingAction === 'pdf' ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <FileText size={16} />
                  )}
                  <span>Baixar PDF (Links Clicáveis)</span>
                </button>

                <button
                  type="button"
                  onClick={handleDownloadPng}
                  disabled={exportingAction !== 'none'}
                  className="btn-admin-outline justify-center bg-white"
                  style={{ minHeight: 48 }}
                >
                  {exportingAction === 'png' ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <Download size={16} />
                  )}
                  <span>Baixar Imagem (PNG)</span>
                </button>
              </div>

              <button
                type="button"
                onClick={handleCopyImageToClipboard}
                disabled={exportingAction !== 'none'}
                className="btn-admin-outline w-full justify-center bg-white/85"
                style={{ minHeight: 44 }}
              >
                {exportingAction === 'copy-img' ? (
                  <Loader2 size={15} className="animate-spin" />
                ) : (
                  <ImageIcon size={15} />
                )}
                <span>Copiar Imagem para Colar no WhatsApp Web (Ctrl+V)</span>
              </button>
            </div>

            {/* Botões de Envio no WhatsApp */}
            <div className="space-y-3 border-t border-[var(--color-card-border)] pt-4">
              <p className="font-mono text-[0.68rem] font-semibold uppercase tracking-[0.08em] text-[var(--color-text-muted)]">
                2. Enviar Convite Personalizado pelo WhatsApp
              </p>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <button
                  type="button"
                  onClick={() => handleShareViaWhatsApp('png')}
                  disabled={exportingAction !== 'none'}
                  className="flex items-center justify-center gap-2 rounded-[var(--radius-sm)] bg-[#25D366] px-4 py-3 text-xs font-semibold uppercase tracking-[0.1em] text-white shadow-sm transition hover:brightness-95 disabled:opacity-60"
                  style={{ minHeight: 48 }}
                >
                  {exportingAction === 'share-png' ? (
                    <Loader2 size={15} className="animate-spin" />
                  ) : (
                    <Send size={15} />
                  )}
                  <span>Enviar Imagem no WhatsApp</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleShareViaWhatsApp('pdf')}
                  disabled={exportingAction !== 'none'}
                  className="flex items-center justify-center gap-2 rounded-[var(--radius-sm)] border border-[#1d9c4b]/40 bg-[#eefce8] px-4 py-3 text-xs font-semibold uppercase tracking-[0.1em] text-[#1b6e38] shadow-sm transition hover:brightness-95 disabled:opacity-60"
                  style={{ minHeight: 48 }}
                >
                  {exportingAction === 'share-pdf' ? (
                    <Loader2 size={15} className="animate-spin" />
                  ) : (
                    <FileText size={15} />
                  )}
                  <span>Enviar PDF no WhatsApp</span>
                </button>
              </div>
              <p className="text-[0.72rem] leading-relaxed text-[var(--color-text-muted)]">
                No celular, abre o compartilhamento direto com o arquivo e os links; no computador, baixa o arquivo e
                abre o WhatsApp com o texto personalizado pronto para anexar.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
