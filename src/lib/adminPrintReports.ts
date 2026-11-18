import { invitation } from '../config/invitation.config';
import { eventParts } from './date';
import { formatPhone, type RsvpRecord } from './supabase';

const DATE_TIME_FMT = new Intl.DateTimeFormat('pt-BR', {
  dateStyle: 'short',
  timeStyle: 'short',
});

const ISSUED_AT_FMT = new Intl.DateTimeFormat('pt-BR', {
  dateStyle: 'long',
  timeStyle: 'short',
});

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

const CROWN_SVG = `<svg viewBox="0 0 80 42" width="46" height="24" aria-hidden="true">
  <g fill="none" stroke="#b39a6b" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
    <path d="M14 33 L10 15 L26 24 L40 8 L54 24 L70 15 L66 33 Z" fill="rgba(216, 197, 162, 0.2)" />
    <path d="M16 37 H64" stroke-width="1.8" />
  </g>
  <circle cx="10" cy="13" r="2.2" fill="#b39a6b" />
  <circle cx="40" cy="6" r="2.6" fill="#b39a6b" />
  <circle cx="70" cy="13" r="2.2" fill="#b39a6b" />
  <circle cx="40" cy="24" r="2" fill="#9875c4" />
</svg>`;

const BASE_PRINT_STYLES = `
  @page {
    size: A4 portrait;
    margin: 12mm;
  }
  * {
    box-sizing: border-box;
    -webkit-print-color-adjust: exact !important;
    print-color-adjust: exact !important;
  }
  html, body {
    margin: 0;
    padding: 0;
    background: #f6f1fc;
    color: #3b235a;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
    font-size: 12px;
    line-height: 1.45;
  }
  .toolbar-top {
    position: sticky;
    top: 0;
    z-index: 20;
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: space-between;
    gap: 10px;
    padding: 12px 18px;
    background: linear-gradient(135deg, #6e4f99 0%, #9875c4 100%);
    color: #ffffff;
    box-shadow: 0 8px 24px -8px rgba(59, 35, 90, 0.45);
  }
  .toolbar-left {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 10px;
  }
  .toolbar-title {
    font-size: 13px;
    font-weight: 700;
    letter-spacing: 0.02em;
    margin-right: 6px;
  }
  .toolbar-label {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    font-size: 11px;
    font-weight: 600;
    color: rgba(255, 255, 255, 0.92);
  }
  .toolbar-select {
    border: 1px solid rgba(255, 255, 255, 0.45);
    background: rgba(255, 255, 255, 0.96);
    color: #3b235a;
    border-radius: 8px;
    padding: 6px 10px;
    font-size: 12px;
    font-weight: 600;
    outline: none;
    cursor: pointer;
  }
  .toolbar-actions {
    display: flex;
    align-items: center;
    gap: 8px;
  }
  .btn-print {
    border: 1px solid rgba(255, 255, 255, 0.8);
    background: #ffffff;
    color: #5b3d85;
    border-radius: 8px;
    padding: 8px 14px;
    font-size: 12px;
    font-weight: 700;
    cursor: pointer;
    box-shadow: 0 4px 12px rgba(31, 18, 53, 0.22);
  }
  .btn-print:hover {
    background: #f5effd;
  }
  .btn-close {
    border: 1px solid rgba(255, 255, 255, 0.45);
    background: rgba(255, 255, 255, 0.16);
    color: #ffffff;
    border-radius: 8px;
    padding: 8px 12px;
    font-size: 12px;
    font-weight: 600;
    cursor: pointer;
  }
  .btn-close:hover {
    background: rgba(255, 255, 255, 0.28);
  }
  .sheet {
    max-width: 210mm;
    margin: 18px auto 28px;
    background: #ffffff;
    border: 1px solid #e3d5f5;
    border-radius: 14px;
    padding: 24px 26px;
    box-shadow: 0 18px 44px -20px rgba(88, 56, 138, 0.28);
  }
  .doc-header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 16px;
    padding-bottom: 14px;
    border-bottom: 2px solid #d8c5a2;
  }
  .brand-block {
    display: flex;
    align-items: center;
    gap: 12px;
  }
  .brand-eyebrow {
    font-size: 9.5px;
    font-weight: 700;
    letter-spacing: 0.18em;
    text-transform: uppercase;
    color: #9875c4;
    margin: 0 0 2px;
  }
  .brand-title {
    font-family: Georgia, 'Times New Roman', serif;
    font-size: 22px;
    font-weight: 700;
    color: #3b235a;
    margin: 0;
    line-height: 1.15;
  }
  .brand-subtitle {
    font-size: 11px;
    color: #735398;
    margin: 4px 0 0;
  }
  .meta-right {
    text-align: right;
    font-size: 10.5px;
    color: #735398;
    white-space: nowrap;
  }
  .meta-right strong {
    display: block;
    color: #3b235a;
    font-size: 11px;
    margin-bottom: 2px;
  }
  .summary-strip {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: space-between;
    gap: 10px;
    margin: 14px 0;
    padding: 10px 14px;
    background: linear-gradient(135deg, #faf6ff 0%, #f3ebfc 100%);
    border: 1px solid #e2d3f4;
    border-radius: 10px;
  }
  .summary-pills {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }
  .pill {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    padding: 4px 10px;
    border-radius: 999px;
    font-size: 11px;
    font-weight: 700;
    border: 1px solid transparent;
  }
  .pill-total {
    background: #ffffff;
    color: #3b235a;
    border-color: #d7c3ef;
  }
  .pill-yes {
    background: #ecfdf5;
    color: #047857;
    border-color: #a7f3d0;
  }
  .pill-no {
    background: #fff1f2;
    color: #be123c;
    border-color: #fecdd3;
  }
  .filter-caption {
    font-size: 10.5px;
    color: #735398;
    font-weight: 600;
  }
  table.report-table {
    width: 100%;
    border-collapse: collapse;
    margin-top: 8px;
  }
  table.report-table thead {
    display: table-header-group;
  }
  table.report-table th {
    background: #f2eafc;
    color: #5d3e88;
    font-size: 9.5px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    text-align: left;
    padding: 8px 10px;
    border-top: 1px solid #d7c3ef;
    border-bottom: 1.5px solid #c9afe9;
  }
  table.report-table td {
    padding: 7px 10px;
    border-bottom: 1px solid #eee5fa;
    font-size: 11.2px;
    color: #3b235a;
    vertical-align: middle;
  }
  table.report-table tbody tr {
    break-inside: avoid;
    page-break-inside: avoid;
  }
  table.report-table tbody tr:nth-child(even) {
    background: #fcfaff;
  }
  .col-num {
    width: 38px;
    color: #735398;
    font-weight: 600;
    font-variant-numeric: tabular-nums;
  }
  .col-check {
    width: 58px;
    text-align: center !important;
  }
  .check-box {
    display: inline-block;
    width: 14px;
    height: 14px;
    border: 1.5px solid #9875c4;
    border-radius: 3px;
    vertical-align: middle;
    background: #ffffff;
  }
  .mono {
    font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
    font-variant-numeric: tabular-nums;
  }
  .badge-yes {
    display: inline-block;
    padding: 2px 8px;
    border-radius: 999px;
    font-size: 10px;
    font-weight: 700;
    background: #ecfdf5;
    color: #047857;
    border: 1px solid #a7f3d0;
    white-space: nowrap;
  }
  .badge-no {
    display: inline-block;
    padding: 2px 8px;
    border-radius: 999px;
    font-size: 10px;
    font-weight: 700;
    background: #fff1f2;
    color: #be123c;
    border: 1px solid #fecdd3;
    white-space: nowrap;
  }
  .kpi-row {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 10px;
    margin: 16px 0;
  }
  .kpi-box {
    position: relative;
    padding: 12px 13px;
    border-radius: 10px;
    border: 1px solid #e2d3f4;
    background: #fcfaff;
    border-top: 3px solid #9875c4;
    break-inside: avoid;
  }
  .kpi-box.is-yes { border-top-color: #10b981; }
  .kpi-box.is-no { border-top-color: #f43f5e; }
  .kpi-box.is-gold { border-top-color: #b39a6b; }
  .kpi-label {
    font-size: 9.5px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    color: #735398;
  }
  .kpi-val {
    font-size: 24px;
    font-weight: 800;
    color: #3b235a;
    margin: 4px 0 2px;
    font-variant-numeric: tabular-nums;
  }
  .kpi-sub {
    font-size: 10.5px;
    color: #735398;
  }
  .two-cols {
    display: grid;
    grid-template-columns: 1.15fr 0.85fr;
    gap: 12px;
    margin-bottom: 16px;
  }
  .card-box {
    padding: 14px 16px;
    border-radius: 10px;
    border: 1px solid #e2d3f4;
    background: #fcfaff;
    break-inside: avoid;
  }
  .card-box h3 {
    margin: 0 0 10px;
    font-size: 12.5px;
    font-weight: 700;
    color: #3b235a;
    padding-bottom: 6px;
    border-bottom: 1px solid #ede4fa;
  }
  .bar-row {
    margin-bottom: 11px;
  }
  .bar-row:last-child {
    margin-bottom: 0;
  }
  .bar-head {
    display: flex;
    justify-content: space-between;
    font-size: 11px;
    font-weight: 600;
    margin-bottom: 4px;
  }
  .bar-track {
    width: 100%;
    height: 9px;
    border-radius: 999px;
    background: #ece3fa;
    overflow: hidden;
  }
  .bar-fill-yes {
    height: 100%;
    border-radius: 999px;
    background: linear-gradient(90deg, #6e4f99, #10b981);
  }
  .bar-fill-no {
    height: 100%;
    border-radius: 999px;
    background: linear-gradient(90deg, #9875c4, #f43f5e);
  }
  .kv-list {
    display: grid;
    gap: 6px;
    font-size: 11px;
  }
  .kv-item {
    display: flex;
    justify-content: space-between;
    gap: 10px;
    border-bottom: 1px dashed #e6daf7;
    padding-bottom: 4px;
  }
  .kv-item:last-child {
    border-bottom: none;
    padding-bottom: 0;
  }
  .kv-key {
    color: #735398;
    font-weight: 600;
  }
  .kv-val {
    color: #3b235a;
    font-weight: 700;
    text-align: right;
  }
  .section-heading {
    margin: 14px 0 6px;
    font-size: 12.5px;
    font-weight: 700;
    color: #3b235a;
  }
  .doc-footer {
    margin-top: 18px;
    padding-top: 10px;
    border-top: 1px solid #e2d3f4;
    display: flex;
    flex-wrap: wrap;
    justify-content: space-between;
    gap: 8px;
    font-size: 10px;
    color: #735398;
  }
  @media print {
    html, body {
      background: #ffffff !important;
    }
    .no-print {
      display: none !important;
    }
    .sheet {
      max-width: none;
      margin: 0;
      padding: 0;
      border: none;
      border-radius: 0;
      box-shadow: none;
    }
  }
  @media (max-width: 640px) {
    .sheet {
      margin: 8px;
      padding: 14px;
    }
    .kpi-row {
      grid-template-columns: repeat(2, 1fr);
    }
    .two-cols {
      grid-template-columns: 1fr;
    }
    .doc-header {
      flex-direction: column;
    }
    .meta-right {
      text-align: left;
    }
  }
`;

function openPrintDocument(html: string): void {
  const popup = window.open('', '_blank');
  if (popup) {
    popup.document.open();
    popup.document.write(html);
    popup.document.close();
    window.setTimeout(() => {
      try {
        popup.focus();
        popup.print();
      } catch {
        /* Usuário pode acionar o botão Imprimir na própria barra da janela */
      }
    }, 320);
    return;
  }

  // Fallback para bloqueadores de pop-up (especialmente navegadores mobile): iframe oculto
  const iframe = document.createElement('iframe');
  iframe.style.position = 'fixed';
  iframe.style.right = '0';
  iframe.style.bottom = '0';
  iframe.style.width = '0';
  iframe.style.height = '0';
  iframe.style.border = '0';
  iframe.setAttribute('aria-hidden', 'true');
  document.body.appendChild(iframe);

  const doc = iframe.contentDocument;
  const win = iframe.contentWindow;
  if (!doc || !win) {
    iframe.remove();
    return;
  }

  doc.open();
  doc.write(html);
  doc.close();

  const cleanup = () => {
    window.setTimeout(() => iframe.remove(), 1000);
  };

  win.addEventListener('afterprint', cleanup, { once: true });
  window.setTimeout(() => {
    try {
      win.focus();
      win.print();
    } finally {
      window.setTimeout(() => iframe.remove(), 60_000);
    }
  }, 320);
}

function renderEventHeaderHtml(subtitle: string, issuedBy?: string): string {
  const debutante = escapeHtml(invitation.debutante.name);
  const venue = invitation.venue;
  const eventLine = `${eventParts.weekday}, ${eventParts.day} de ${eventParts.month} de ${eventParts.year} às ${eventParts.time}`;
  const venueLine = `${venue.name ? `${venue.name} · ` : ''}${venue.address}, ${venue.district} — ${venue.city}/${venue.state}`;
  const issuedAt = escapeHtml(ISSUED_AT_FMT.format(new Date()));

  return `
    <header class="doc-header">
      <div class="brand-block">
        ${CROWN_SVG}
        <div>
          <p class="brand-eyebrow">${escapeHtml(subtitle)}</p>
          <h1 class="brand-title">15 Anos · ${debutante}</h1>
          <p class="brand-subtitle">${escapeHtml(eventLine)}<br />${escapeHtml(venueLine)}</p>
        </div>
      </div>
      <div class="meta-right">
        <strong>Documento Oficial do Evento</strong>
        Emitido em: ${issuedAt}
        ${issuedBy ? `<br />Admin: ${escapeHtml(issuedBy)}` : ''}
      </div>
    </header>
  `;
}

export interface PrintOverviewParams {
  records: RsvpRecord[];
  stats: {
    confirmedResponses: number;
    declinedCount: number;
    totalResponses: number;
    confirmPct: number;
    declinedPct: number;
  };
  latencyMs: number | null;
  lastSyncAt: string;
  adminEmail: string;
}

/** Abre relatório A4 profissional da Visão Geral + Estatísticas pronto para impressão ou PDF */
export function printOverviewReport({
  records,
  stats,
  latencyMs,
  lastSyncAt,
  adminEmail,
}: PrintOverviewParams): void {
  const recent = records.slice(0, 15);
  const recentRows = recent
    .map(
      (r, idx) => `
      <tr>
        <td class="col-num">${idx + 1}</td>
        <td><strong>${escapeHtml(r.name)}</strong></td>
        <td class="mono">${escapeHtml(formatPhone(r.phone))}</td>
        <td>${r.attending ? '<span class="badge-yes">Confirmado</span>' : '<span class="badge-no">Não irá</span>'}</td>
        <td class="mono">${escapeHtml(DATE_TIME_FMT.format(new Date(r.created_at)))}</td>
      </tr>
    `,
    )
    .join('');

  const html = `<!doctype html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Visão Geral — 15 Anos ${escapeHtml(invitation.debutante.name)}</title>
  <style>${BASE_PRINT_STYLES}</style>
</head>
<body>
  <div class="toolbar-top no-print">
    <div class="toolbar-left">
      <span class="toolbar-title">Relatório Executivo · Visão Geral</span>
    </div>
    <div class="toolbar-actions">
      <button type="button" class="btn-print" onclick="window.print()">Imprimir / Salvar em PDF</button>
      <button type="button" class="btn-close" onclick="window.close()">Fechar</button>
    </div>
  </div>

  <main class="sheet">
    ${renderEventHeaderHtml('Relatório Executivo // Visão Geral & Estatísticas', adminEmail)}

    <section class="kpi-row">
      <div class="kpi-box is-yes">
        <div class="kpi-label">Confirmados (Sim)</div>
        <div class="kpi-val">${stats.confirmedResponses.toLocaleString('pt-BR')}</div>
        <div class="kpi-sub">${stats.confirmPct}% das respostas</div>
      </div>
      <div class="kpi-box is-no">
        <div class="kpi-label">Não Comparecerão</div>
        <div class="kpi-val">${stats.declinedCount.toLocaleString('pt-BR')}</div>
        <div class="kpi-sub">${stats.declinedPct}% das respostas</div>
      </div>
      <div class="kpi-box is-gold">
        <div class="kpi-label">Taxa de Presença</div>
        <div class="kpi-val">${stats.confirmPct}%</div>
        <div class="kpi-sub">${stats.confirmedResponses} de ${stats.totalResponses}</div>
      </div>
      <div class="kpi-box">
        <div class="kpi-label">Total de Respostas</div>
        <div class="kpi-val">${stats.totalResponses.toLocaleString('pt-BR')}</div>
        <div class="kpi-sub">Registros individuais</div>
      </div>
    </section>

    <section class="two-cols">
      <div class="card-box">
        <h3>Composição das Confirmações</h3>
        <div class="bar-row">
          <div class="bar-head">
            <span>Presenças confirmadas</span>
            <span class="mono">${stats.confirmedResponses}/${stats.totalResponses} (${stats.confirmPct}%)</span>
          </div>
          <div class="bar-track"><div class="bar-fill-yes" style="width:${stats.confirmPct}%"></div></div>
        </div>
        <div class="bar-row">
          <div class="bar-head">
            <span>Ausências informadas</span>
            <span class="mono">${stats.declinedCount}/${stats.totalResponses} (${stats.declinedPct}%)</span>
          </div>
          <div class="bar-track"><div class="bar-fill-no" style="width:${stats.declinedPct}%"></div></div>
        </div>
      </div>

      <div class="card-box">
        <h3>Telemetria e Dados do Painel</h3>
        <div class="kv-list">
          <div class="kv-item">
            <span class="kv-key">Tabela Supabase</span>
            <span class="kv-val mono">${escapeHtml(invitation.rsvp.supabaseTable)}</span>
          </div>
          <div class="kv-item">
            <span class="kv-key">Fuso Horário</span>
            <span class="kv-val mono">${escapeHtml(invitation.event.timeZone)}</span>
          </div>
          <div class="kv-item">
            <span class="kv-key">Última Sincronização</span>
            <span class="kv-val mono">${escapeHtml(lastSyncAt || '—')}</span>
          </div>
          <div class="kv-item">
            <span class="kv-key">Latência REST</span>
            <span class="kv-val mono">${latencyMs !== null ? `${latencyMs} ms` : '—'}</span>
          </div>
        </div>
      </div>
    </section>

    <h2 class="section-heading">Últimas Confirmações Recebidas (${recent.length} de ${records.length.toLocaleString('pt-BR')})</h2>
    ${
      recent.length === 0
        ? '<p style="color:#735398;padding:12px 0;">Nenhuma resposta registrada até o momento.</p>'
        : `
      <table class="report-table">
        <thead>
          <tr>
            <th class="col-num">#</th>
            <th>Convidado(a)</th>
            <th>WhatsApp</th>
            <th>Status</th>
            <th>Recebido em</th>
          </tr>
        </thead>
        <tbody>
          ${recentRows}
        </tbody>
      </table>
    `
    }

    <footer class="doc-footer">
      <span>15 Anos · ${escapeHtml(invitation.debutante.name)} — Painel Administrativo</span>
      <span>Para listar todos os convidados com caixa de check-in, use "Imprimir / PDF" na aba Confirmações.</span>
    </footer>
  </main>
</body>
</html>`;

  openPrintDocument(html);
}

export interface PrintGuestListParams {
  records: RsvpRecord[];
  filter: 'all' | 'yes' | 'no';
  search: string;
}

/** Abre Lista Oficial de Convidados paginada em A4 com check-in, ordenação e filtro antes da impressão/PDF */
export function printGuestListReport({ records, filter, search }: PrintGuestListParams): void {
  const initialRecords = records
    .filter((r) => (filter === 'yes' ? r.attending : filter === 'no' ? !r.attending : true))
    .sort((a, b) => a.name.localeCompare(b.name, 'pt-BR', { sensitivity: 'base' }));

  const initialConfirmed = initialRecords.filter((r) => r.attending).length;
  const initialDeclined = initialRecords.length - initialConfirmed;

  const filterDesc =
    filter === 'yes' ? 'Somente confirmados (Sim)' : filter === 'no' ? 'Não poderão ir' : 'Todos os registros';
  const searchNote = search.trim() ? ` · Busca aplicada: "${search.trim()}"` : '';

  const initialRows = initialRecords
    .map(
      (r, idx) => `
      <tr>
        <td class="col-num">${idx + 1}</td>
        <td class="col-check"><span class="check-box" aria-hidden="true"></span></td>
        <td><strong>${escapeHtml(r.name)}</strong></td>
        <td class="mono">${escapeHtml(formatPhone(r.phone))}</td>
        <td>${r.attending ? '<span class="badge-yes">Confirmado</span>' : '<span class="badge-no">Não irá</span>'}</td>
        <td class="mono">${escapeHtml(DATE_TIME_FMT.format(new Date(r.created_at)))}</td>
      </tr>
    `,
    )
    .join('');

  // Dados pré-formatados em JSON seguro para alternar filtro e ordenação dentro da janela antes de gerar o PDF
  const serialized = records.map((r) => ({
    name: r.name,
    phoneFormatted: formatPhone(r.phone),
    attending: r.attending,
    dateFormatted: DATE_TIME_FMT.format(new Date(r.created_at)),
    createdAt: r.created_at,
  }));
  const safeJson = JSON.stringify(serialized).replace(/</g, '\\u003c');

  const html = `<!doctype html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Lista de Convidados — 15 Anos ${escapeHtml(invitation.debutante.name)}</title>
  <style>${BASE_PRINT_STYLES}</style>
</head>
<body>
  <div class="toolbar-top no-print">
    <div class="toolbar-left">
      <span class="toolbar-title">Lista Oficial · Impressão / PDF</span>
      <label class="toolbar-label">
        Ordenar:
        <select id="sortSelect" class="toolbar-select">
          <option value="alpha" selected>Ordem Alfabética (A–Z)</option>
          <option value="recent">Mais recentes primeiro</option>
        </select>
      </label>
      <label class="toolbar-label">
        Exibir:
        <select id="filterSelect" class="toolbar-select">
          <option value="all" ${filter === 'all' ? 'selected' : ''}>Todos os registros</option>
          <option value="yes" ${filter === 'yes' ? 'selected' : ''}>Somente Confirmados (Sim)</option>
          <option value="no" ${filter === 'no' ? 'selected' : ''}>Não poderão ir</option>
        </select>
      </label>
    </div>
    <div class="toolbar-actions">
      <button type="button" class="btn-print" onclick="window.print()">Imprimir / Salvar em PDF</button>
      <button type="button" class="btn-close" onclick="window.close()">Fechar</button>
    </div>
  </div>

  <main class="sheet">
    ${renderEventHeaderHtml('Lista Oficial de Convidados // Controle de Recepção')}

    <div class="summary-strip">
      <div class="summary-pills">
        <span class="pill pill-total" id="pillTotal">Total listado: ${initialRecords.length.toLocaleString('pt-BR')}</span>
        <span class="pill pill-yes" id="pillYes">Confirmados: ${initialConfirmed.toLocaleString('pt-BR')}</span>
        <span class="pill pill-no" id="pillNo">Não irão: ${initialDeclined.toLocaleString('pt-BR')}</span>
      </div>
      <span class="filter-caption" id="filterCaption">${escapeHtml(filterDesc + searchNote)}</span>
    </div>

    <table class="report-table">
      <thead>
        <tr>
          <th class="col-num">#</th>
          <th class="col-check">Check-in</th>
          <th>Nome do(a) Convidado(a)</th>
          <th>WhatsApp / Telefone</th>
          <th>Status</th>
          <th>Confirmado em</th>
        </tr>
      </thead>
      <tbody id="guestRows">
        ${initialRows}
      </tbody>
    </table>

    <footer class="doc-footer">
      <span>15 Anos · ${escapeHtml(invitation.debutante.name)} — Controle de Portaria &amp; Recepção</span>
      <span>Visto da recepção: _______________________________</span>
    </footer>
  </main>

  <script>
    (function () {
      var data = ${safeJson};
      var searchNote = ${JSON.stringify(searchNote).replace(/</g, '\\u003c')};
      var sortEl = document.getElementById('sortSelect');
      var filterEl = document.getElementById('filterSelect');
      var tbody = document.getElementById('guestRows');
      var pillTotal = document.getElementById('pillTotal');
      var pillYes = document.getElementById('pillYes');
      var pillNo = document.getElementById('pillNo');
      var captionEl = document.getElementById('filterCaption');

      function esc(str) {
        return String(str)
          .replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;')
          .replace(/"/g, '&quot;')
          .replace(/'/g, '&#39;');
      }

      function render() {
        var f = filterEl.value;
        var s = sortEl.value;
        var list = data.filter(function (item) {
          if (f === 'yes') return item.attending;
          if (f === 'no') return !item.attending;
          return true;
        });

        if (s === 'alpha') {
          list.sort(function (a, b) {
            return a.name.localeCompare(b.name, 'pt-BR', { sensitivity: 'base' });
          });
        } else {
          list.sort(function (a, b) {
            return b.createdAt.localeCompare(a.createdAt);
          });
        }

        var yesCount = 0;
        var parts = [];
        for (var i = 0; i < list.length; i++) {
          var r = list[i];
          if (r.attending) yesCount++;
          parts.push(
            '<tr>' +
              '<td class="col-num">' + (i + 1) + '</td>' +
              '<td class="col-check"><span class="check-box" aria-hidden="true"></span></td>' +
              '<td><strong>' + esc(r.name) + '</strong></td>' +
              '<td class="mono">' + esc(r.phoneFormatted) + '</td>' +
              '<td>' + (r.attending ? '<span class="badge-yes">Confirmado</span>' : '<span class="badge-no">Não irá</span>') + '</td>' +
              '<td class="mono">' + esc(r.dateFormatted) + '</td>' +
            '</tr>'
          );
        }

        tbody.innerHTML = parts.join('');
        var noCount = list.length - yesCount;
        pillTotal.textContent = 'Total listado: ' + list.length.toLocaleString('pt-BR');
        pillYes.textContent = 'Confirmados: ' + yesCount.toLocaleString('pt-BR');
        pillNo.textContent = 'Não irão: ' + noCount.toLocaleString('pt-BR');
        var label = f === 'yes' ? 'Somente confirmados (Sim)' : f === 'no' ? 'Não poderão ir' : 'Todos os registros';
        captionEl.textContent = label + searchNote;
      }

      if (sortEl && filterEl) {
        sortEl.addEventListener('change', render);
        filterEl.addEventListener('change', render);
      }
    })();
  </script>
</body>
</html>`;

  openPrintDocument(html);
}
