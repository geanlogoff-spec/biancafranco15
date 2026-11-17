import { invitation } from '../config/invitation.config';
import { eventDate, eventParts } from './date';

export const CARD_WIDTH = 1080;
export const CARD_HEIGHT = 1620;

export interface PdfLinkRect {
  url: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface InviteCardOptions {
  guestName?: string;
  inviteUrl: string;
  mapsUrl: string;
  includePhoto?: boolean;
}

function formatNumericDate(): string {
  return new Intl.DateTimeFormat('pt-BR', {
    timeZone: invitation.event.timeZone,
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(eventDate);
}

function loadImage(src: string): Promise<HTMLImageElement | null> {
  return new Promise((resolve) => {
    if (!src) {
      resolve(null);
      return;
    }
    const img = new Image();
    img.crossOrigin = 'anonymous';
    const timer = window.setTimeout(() => resolve(null), 5000);
    img.onload = () => {
      window.clearTimeout(timer);
      resolve(img.naturalWidth > 0 ? img : null);
    };
    img.onerror = () => {
      window.clearTimeout(timer);
      resolve(null);
    };
    img.src = src;
  });
}

async function ensureFontsLoaded(): Promise<void> {
  if (typeof document === 'undefined' || !('fonts' in document)) return;
  try {
    await Promise.allSettled([
      document.fonts.load('400 104px "Great Vibes"'),
      document.fonts.load('700 44px "Playfair Display"'),
      document.fonts.load('600 32px "Cormorant Garamond"'),
      document.fonts.load('italic 500 28px "Cormorant Garamond"'),
      document.fonts.load('600 22px "Geist"'),
    ]);
    await document.fonts.ready;
  } catch {
    /* fallback seguro para fontes do sistema */
  }
}

function drawRoundedRectPath(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
): void {
  const radius = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + w - radius, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + radius);
  ctx.lineTo(x + w, y + h - radius);
  ctx.quadraticCurveTo(x + w, y + h, x + w - radius, y + h);
  ctx.lineTo(x + radius, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
}

function drawTrackedCenterText(
  ctx: CanvasRenderingContext2D,
  text: string,
  cx: number,
  y: number,
  tracking: number,
): void {
  if (!text) return;
  const chars = Array.from(text);
  const widths = chars.map((ch) => ctx.measureText(ch).width);
  const totalWidth = widths.reduce((sum, w) => sum + w, 0) + tracking * Math.max(0, chars.length - 1);
  let x = cx - totalWidth / 2;
  const prevAlign = ctx.textAlign;
  ctx.textAlign = 'left';
  chars.forEach((ch, idx) => {
    ctx.fillText(ch, x, y);
    x += widths[idx] + tracking;
  });
  ctx.textAlign = prevAlign;
}

function wrapLines(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
  const words = text.trim().split(/\s+/);
  const lines: string[] = [];
  let current = '';
  for (const word of words) {
    const candidate = current ? `${current} ${word}` : word;
    if (ctx.measureText(candidate).width <= maxWidth) {
      current = candidate;
    } else {
      if (current) lines.push(current);
      current = word;
    }
  }
  if (current) lines.push(current);
  return lines;
}

function truncateMiddleOrEnd(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string {
  if (ctx.measureText(text).width <= maxWidth) return text;
  let truncated = text;
  while (truncated.length > 10 && ctx.measureText(`${truncated}…`).width > maxWidth) {
    truncated = truncated.slice(0, -1);
  }
  return `${truncated}…`;
}

function drawFourPointSparkle(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  size: number,
  fill: string,
): void {
  ctx.save();
  ctx.fillStyle = fill;
  ctx.beginPath();
  ctx.moveTo(cx, cy - size);
  ctx.quadraticCurveTo(cx + size * 0.14, cy - size * 0.14, cx + size, cy);
  ctx.quadraticCurveTo(cx + size * 0.14, cy + size * 0.14, cx, cy + size);
  ctx.quadraticCurveTo(cx - size * 0.14, cy + size * 0.14, cx - size, cy);
  ctx.quadraticCurveTo(cx - size * 0.14, cy - size * 0.14, cx, cy - size);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

function drawCrown(ctx: CanvasRenderingContext2D, cx: number, cy: number): void {
  ctx.save();
  ctx.translate(cx, cy);
  const grad = ctx.createLinearGradient(-34, -20, 34, 18);
  grad.addColorStop(0, '#9d8251');
  grad.addColorStop(0.5, '#e8d7b7');
  grad.addColorStop(1, '#9d8251');

  ctx.strokeStyle = grad;
  ctx.fillStyle = 'rgba(216, 197, 162, 0.28)';
  ctx.lineWidth = 2.6;
  ctx.lineJoin = 'round';
  ctx.lineCap = 'round';

  ctx.beginPath();
  ctx.moveTo(-26, 12);
  ctx.lineTo(-32, -8);
  ctx.lineTo(-14, 2);
  ctx.lineTo(0, -16);
  ctx.lineTo(14, 2);
  ctx.lineTo(32, -8);
  ctx.lineTo(26, 12);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = '#b39a6b';
  [
    [-32, -10],
    [0, -19],
    [32, -10],
  ].forEach(([jx, jy]) => {
    ctx.beginPath();
    ctx.arc(jx, jy, 3.2, 0, Math.PI * 2);
    ctx.fill();
  });

  ctx.beginPath();
  ctx.moveTo(-26, 18);
  ctx.lineTo(26, 18);
  ctx.stroke();
  ctx.restore();
}

function drawCornerFlourish(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  scaleX: number,
  scaleY: number,
): void {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scaleX, scaleY);
  ctx.strokeStyle = 'rgba(179, 154, 107, 0.72)';
  ctx.lineWidth = 2.2;
  ctx.beginPath();
  ctx.moveTo(0, 48);
  ctx.quadraticCurveTo(0, 0, 48, 0);
  ctx.stroke();

  ctx.strokeStyle = 'rgba(152, 117, 196, 0.45)';
  ctx.lineWidth = 1.6;
  ctx.beginPath();
  ctx.moveTo(10, 34);
  ctx.quadraticCurveTo(10, 10, 34, 10);
  ctx.stroke();

  ctx.fillStyle = '#b39a6b';
  ctx.beginPath();
  ctx.moveTo(10, 4);
  ctx.lineTo(15, 10);
  ctx.lineTo(10, 16);
  ctx.lineTo(5, 10);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

function drawSmallCalendarIcon(ctx: CanvasRenderingContext2D, cx: number, cy: number, color: string): void {
  ctx.save();
  ctx.translate(cx, cy);
  ctx.strokeStyle = color;
  ctx.lineWidth = 2;
  drawRoundedRectPath(ctx, -11, -9, 22, 20, 4);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(-11, -3);
  ctx.lineTo(11, -3);
  ctx.moveTo(-5, -12);
  ctx.lineTo(-5, -7);
  ctx.moveTo(5, -12);
  ctx.lineTo(5, -7);
  ctx.stroke();
  ctx.restore();
}

function drawSmallClockIcon(ctx: CanvasRenderingContext2D, cx: number, cy: number, color: string): void {
  ctx.save();
  ctx.translate(cx, cy);
  ctx.strokeStyle = color;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(0, 0, 10.5, 0, Math.PI * 2);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(0, -6);
  ctx.lineTo(0, 0);
  ctx.lineTo(5, 3);
  ctx.stroke();
  ctx.restore();
}

function drawSmallPinIcon(ctx: CanvasRenderingContext2D, cx: number, cy: number, color: string): void {
  ctx.save();
  ctx.translate(cx, cy);
  ctx.strokeStyle = color;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(0, 11);
  ctx.bezierCurveTo(-9, 3, -9, -10, 0, -10);
  ctx.bezierCurveTo(9, -10, 9, 3, 0, 11);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(0, -2, 3.2, 0, Math.PI * 2);
  ctx.stroke();
  ctx.restore();
}

function drawIconLabel(
  ctx: CanvasRenderingContext2D,
  drawIcon: (ctx: CanvasRenderingContext2D, cx: number, cy: number, color: string) => void,
  label: string,
  centerX: number,
  y: number,
  color: string,
): void {
  ctx.save();
  ctx.fillStyle = '#735398';
  ctx.font = '700 16px "Geist", sans-serif';
  ctx.textBaseline = 'middle';
  const textW = ctx.measureText(label).width;
  const iconSize = 22;
  const gap = 10;
  const totalW = iconSize + gap + textW;
  const startX = centerX - totalW / 2;
  drawIcon(ctx, startX + iconSize / 2, y, color);
  ctx.textAlign = 'left';
  ctx.fillText(label, startX + iconSize + gap, y + 1);
  ctx.restore();
}

export async function renderInviteCardToCanvas(
  options: InviteCardOptions,
): Promise<{ canvas: HTMLCanvasElement; links: PdfLinkRect[] }> {
  await ensureFontsLoaded();

  const includePhoto = options.includePhoto ?? true;
  const img = includePhoto ? await loadImage(invitation.debutante.photo) : null;

  const canvas = document.createElement('canvas');
  canvas.width = CARD_WIDTH;
  canvas.height = CARD_HEIGHT;
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('Contexto Canvas 2D indisponível neste navegador.');
  }

  // 1. Fundo pergaminho real + aquarela lavanda/dourado
  const bgGrad = ctx.createLinearGradient(0, 0, CARD_WIDTH, CARD_HEIGHT);
  bgGrad.addColorStop(0, '#fdfaf5');
  bgGrad.addColorStop(0.48, '#f7f0fd');
  bgGrad.addColorStop(1, '#ede1fa');
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, CARD_WIDTH, CARD_HEIGHT);

  const glows: Array<[number, number, number, string]> = [
    [170, 210, 440, 'rgba(201, 175, 233, 0.34)'],
    [920, 290, 400, 'rgba(216, 197, 162, 0.25)'],
    [220, 1340, 420, 'rgba(216, 197, 162, 0.24)'],
    [880, 1360, 460, 'rgba(152, 117, 196, 0.28)'],
  ];
  for (const [gx, gy, gr, color] of glows) {
    const rad = ctx.createRadialGradient(gx, gy, 0, gx, gy, gr);
    rad.addColorStop(0, color);
    rad.addColorStop(1, 'rgba(255, 255, 255, 0)');
    ctx.fillStyle = rad;
    ctx.fillRect(0, 0, CARD_WIDTH, CARD_HEIGHT);
  }

  // Pontos de brilho suaves ao redor
  const sparkles: Array<[number, number, number, string]> = [
    [120, 165, 9, 'rgba(179, 154, 107, 0.55)'],
    [955, 175, 10, 'rgba(179, 154, 107, 0.55)'],
    [135, 515, 7, 'rgba(152, 117, 196, 0.45)'],
    [945, 520, 7, 'rgba(152, 117, 196, 0.45)'],
    [115, 1190, 8, 'rgba(179, 154, 107, 0.5)'],
    [965, 1195, 8, 'rgba(179, 154, 107, 0.5)'],
  ];
  for (const [sx, sy, ss, sc] of sparkles) {
    drawFourPointSparkle(ctx, sx, sy, ss, sc);
  }

  // 2. Moldura dupla dourada e arabescos nos 4 cantos
  ctx.save();
  drawRoundedRectPath(ctx, 36, 36, CARD_WIDTH - 72, CARD_HEIGHT - 72, 28);
  ctx.strokeStyle = 'rgba(179, 154, 107, 0.55)';
  ctx.lineWidth = 2.4;
  ctx.stroke();

  drawRoundedRectPath(ctx, 52, 52, CARD_WIDTH - 104, CARD_HEIGHT - 104, 20);
  ctx.strokeStyle = 'rgba(152, 117, 196, 0.34)';
  ctx.lineWidth = 1.6;
  ctx.stroke();
  ctx.restore();

  drawCornerFlourish(ctx, 74, 74, 1, 1);
  drawCornerFlourish(ctx, CARD_WIDTH - 74, 74, -1, 1);
  drawCornerFlourish(ctx, 74, CARD_HEIGHT - 74, 1, -1);
  drawCornerFlourish(ctx, CARD_WIDTH - 74, CARD_HEIGHT - 74, -1, -1);

  // 3. Coroa & Título Principal
  drawCrown(ctx, 540, 112);

  ctx.fillStyle = '#7c5aa8';
  ctx.font = '600 18px "Geist", sans-serif';
  ctx.textBaseline = 'middle';
  drawTrackedCenterText(ctx, 'UMA NOITE DE CONTO DE FADAS', 540, 158, 5.5);

  ctx.fillStyle = '#5c3c88';
  ctx.font = '700 44px "Playfair Display", Georgia, serif';
  ctx.textAlign = 'center';
  ctx.fillText('MEUS 15 ANOS', 540, 205);

  // 4. Medalhão Central (Foto da Princesa ou Brasão "15")
  const medX = 540;
  const medY = 342;
  const medR = 104;

  const haloGrad = ctx.createRadialGradient(medX, medY, medR * 0.5, medX, medY, medR + 36);
  haloGrad.addColorStop(0, 'rgba(216, 197, 162, 0.42)');
  haloGrad.addColorStop(1, 'rgba(216, 197, 162, 0)');
  ctx.fillStyle = haloGrad;
  ctx.beginPath();
  ctx.arc(medX, medY, medR + 36, 0, Math.PI * 2);
  ctx.fill();

  ctx.save();
  ctx.beginPath();
  ctx.arc(medX, medY, medR + 8, 0, Math.PI * 2);
  ctx.strokeStyle = 'rgba(179, 154, 107, 0.8)';
  ctx.lineWidth = 2.4;
  ctx.stroke();

  ctx.beginPath();
  ctx.arc(medX, medY, medR, 0, Math.PI * 2);
  ctx.fillStyle = '#ffffff';
  ctx.fill();
  ctx.clip();

  if (img) {
    const targetSize = medR * 2;
    const scale = Math.max(targetSize / img.width, targetSize / img.height);
    const drawW = img.width * scale;
    const drawH = img.height * scale;
    const drawX = medX - drawW / 2;
    const drawY = medY - medR - (drawH - targetSize) * 0.22;
    ctx.drawImage(img, drawX, drawY, drawW, drawH);
  } else {
    const crestBg = ctx.createRadialGradient(medX, medY - 24, 12, medX, medY, medR);
    crestBg.addColorStop(0, '#ffffff');
    crestBg.addColorStop(0.65, '#f2e8fd');
    crestBg.addColorStop(1, '#e1cdf8');
    ctx.fillStyle = crestBg;
    ctx.fillRect(medX - medR, medY - medR, medR * 2, medR * 2);

    ctx.fillStyle = '#6e4f99';
    ctx.font = '700 88px "Playfair Display", Georgia, serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('15', medX, medY + 4);
  }
  ctx.restore();

  ctx.beginPath();
  ctx.arc(medX, medY, medR, 0, Math.PI * 2);
  ctx.strokeStyle = '#d8c5a2';
  ctx.lineWidth = 4;
  ctx.stroke();

  // 5. Nome da Debutante (Great Vibes)
  ctx.save();
  const nameGrad = ctx.createLinearGradient(290, 500, 790, 565);
  nameGrad.addColorStop(0, '#5a3a85');
  nameGrad.addColorStop(0.5, '#865fb8');
  nameGrad.addColorStop(1, '#9d8251');
  ctx.fillStyle = nameGrad;
  ctx.font = '400 104px "Great Vibes", cursive';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(invitation.debutante.name, 540, 528);
  ctx.restore();

  // Divisor ornamental abaixo do nome
  ctx.save();
  const divGrad = ctx.createLinearGradient(250, 586, 830, 586);
  divGrad.addColorStop(0, 'rgba(179, 154, 107, 0)');
  divGrad.addColorStop(0.5, 'rgba(179, 154, 107, 0.85)');
  divGrad.addColorStop(1, 'rgba(179, 154, 107, 0)');
  ctx.strokeStyle = divGrad;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(250, 586);
  ctx.lineTo(520, 586);
  ctx.moveTo(560, 586);
  ctx.lineTo(830, 586);
  ctx.stroke();
  drawFourPointSparkle(ctx, 540, 586, 10, '#b39a6b');
  ctx.restore();

  // 6. Pílula Personalizada do Convidado (opcional) + Texto do Convite
  const trimmedGuest = options.guestName?.trim() || '';
  let textStartY = 648;

  if (trimmedGuest) {
    const badgeLabel = `CONVITE ESPECIAL PARA: ${trimmedGuest.toUpperCase()}`;
    ctx.font = '700 18px "Geist", sans-serif';
    const measured = Math.min(820, Math.max(420, ctx.measureText(badgeLabel).width + 64));
    const pillX = 540 - measured / 2;
    const pillY = 616;
    const pillH = 44;

    ctx.save();
    drawRoundedRectPath(ctx, pillX, pillY, measured, pillH, 22);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.88)';
    ctx.fill();
    ctx.strokeStyle = 'rgba(179, 154, 107, 0.75)';
    ctx.lineWidth = 1.8;
    ctx.stroke();

    ctx.fillStyle = '#5c3c88';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(truncateMiddleOrEnd(ctx, badgeLabel, measured - 40), 540, pillY + pillH / 2 + 1);
    ctx.restore();

    textStartY = 696;
  }

  ctx.save();
  ctx.fillStyle = '#432b66';
  ctx.font = '500 30px "Cormorant Garamond", Georgia, serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  const maxParagraphWidth = 840;
  let cursorY = textStartY;
  invitation.texts.invitation.forEach((paragraph, idx) => {
    const lines = wrapLines(ctx, paragraph, maxParagraphWidth);
    for (const line of lines) {
      ctx.fillText(line, 540, cursorY);
      cursorY += 41;
    }
    if (idx < invitation.texts.invitation.length - 1) {
      cursorY += 12;
    }
  });
  ctx.restore();

  // 7. Cartão de Informações do Evento (Data, Horário, Local)
  const infoX = 96;
  const infoY = Math.max(918, cursorY + 24);
  const infoW = CARD_WIDTH - infoX * 2;
  const infoH = 266;

  ctx.save();
  ctx.shadowColor = 'rgba(110, 79, 153, 0.14)';
  ctx.shadowBlur = 24;
  ctx.shadowOffsetY = 10;
  drawRoundedRectPath(ctx, infoX, infoY, infoW, infoH, 24);
  ctx.fillStyle = 'rgba(255, 255, 255, 0.84)';
  ctx.fill();
  ctx.restore();

  ctx.save();
  drawRoundedRectPath(ctx, infoX, infoY, infoW, infoH, 24);
  ctx.strokeStyle = 'rgba(179, 154, 107, 0.52)';
  ctx.lineWidth = 1.8;
  ctx.stroke();

  // Divisor horizontal central
  const midRowY = infoY + 132;
  ctx.strokeStyle = 'rgba(152, 117, 196, 0.22)';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(infoX + 36, midRowY);
  ctx.lineTo(infoX + infoW - 36, midRowY);
  ctx.stroke();

  // Divisor vertical entre Data e Horário
  ctx.beginPath();
  ctx.moveTo(540, infoY + 24);
  ctx.lineTo(540, midRowY - 18);
  ctx.stroke();

  // Coluna Data (Esquerda)
  const leftCx = infoX + infoW * 0.25;
  drawIconLabel(ctx, drawSmallCalendarIcon, 'DATA DO EVENTO', leftCx, infoY + 40, '#8d6bb8');

  ctx.textAlign = 'center';
  ctx.fillStyle = '#3b235a';
  ctx.font = '700 28px "Playfair Display", Georgia, serif';
  ctx.fillText(`${eventParts.day} de ${eventParts.month} de ${eventParts.year}`, leftCx, infoY + 78);

  ctx.fillStyle = '#735398';
  ctx.font = '600 17px "Geist", sans-serif';
  ctx.fillText(`${eventParts.weekday} · ${formatNumericDate()}`, leftCx, infoY + 108);

  // Coluna Horário (Direita)
  const rightCx = infoX + infoW * 0.75;
  drawIconLabel(ctx, drawSmallClockIcon, 'HORÁRIO', rightCx, infoY + 40, '#8d6bb8');

  ctx.textAlign = 'center';
  ctx.fillStyle = '#3b235a';
  ctx.font = '700 32px "Playfair Display", Georgia, serif';
  ctx.fillText(eventParts.time, rightCx, infoY + 78);

  ctx.fillStyle = '#735398';
  ctx.font = '600 17px "Geist", sans-serif';
  ctx.fillText('Abertura do Salão', rightCx, infoY + 108);

  // Linha Inferior: Endereço Completo
  const v = invitation.venue;
  const linePrimary = `${v.name ? `${v.name} — ` : ''}${v.address} · ${v.district}`;
  const lineSecondary = `${v.city} - ${v.state} · CEP ${v.zip}`;

  drawIconLabel(ctx, drawSmallPinIcon, 'LOCAL DA CELEBRAÇÃO', 540, midRowY + 34, '#8d6bb8');

  ctx.textAlign = 'center';
  ctx.fillStyle = '#3b235a';
  ctx.font = '600 25px "Geist", sans-serif';
  ctx.fillText(truncateMiddleOrEnd(ctx, linePrimary, infoW - 72), 540, midRowY + 72);

  ctx.fillStyle = '#6e4f99';
  ctx.font = '500 20px "Geist", sans-serif';
  ctx.fillText(lineSecondary, 540, midRowY + 104);
  ctx.restore();

  // 8. Bloco de Links Interativos (Clicáveis no PDF e legíveis na Imagem)
  const links: PdfLinkRect[] = [];
  const cleanInviteUrl = options.inviteUrl.trim();
  const cleanMapsUrl = options.mapsUrl.trim();

  const btnX = 110;
  const btnW = CARD_WIDTH - btnX * 2;
  const sectionHeaderY = Math.max(1224, infoY + infoH + 34);

  ctx.fillStyle = '#735398';
  ctx.font = '700 16px "Geist", sans-serif';
  ctx.textAlign = 'center';
  drawTrackedCenterText(ctx, 'LINKS DO CONVITE (CLIQUE NO PDF OU ACESSE)', 540, sectionHeaderY, 2.2);

  // Link 1: Convite Interativo & RSVP
  const btn1Y = sectionHeaderY + 22;
  const btn1H = 100;
  ctx.save();
  ctx.shadowColor = 'rgba(110, 79, 153, 0.25)';
  ctx.shadowBlur = 18;
  ctx.shadowOffsetY = 8;
  drawRoundedRectPath(ctx, btnX, btn1Y, btnW, btn1H, 20);
  const btn1Grad = ctx.createLinearGradient(btnX, btn1Y, btnX + btnW, btn1Y + btn1H);
  btn1Grad.addColorStop(0, '#5d3e88');
  btn1Grad.addColorStop(1, '#8c66bd');
  ctx.fillStyle = btn1Grad;
  ctx.fill();
  ctx.restore();

  ctx.save();
  drawRoundedRectPath(ctx, btnX, btn1Y, btnW, btn1H, 20);
  ctx.strokeStyle = 'rgba(216, 197, 162, 0.85)';
  ctx.lineWidth = 2;
  ctx.stroke();

  ctx.fillStyle = '#ffffff';
  ctx.font = '700 21px "Geist", sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('ABRIR CONVITE INTERATIVO & CONFIRMAR PRESENÇA', 540, btn1Y + 35);

  ctx.fillStyle = '#f6e7c7';
  ctx.font = '500 18px "Geist", monospace';
  ctx.fillText(truncateMiddleOrEnd(ctx, cleanInviteUrl || '—', btnW - 56), 540, btn1Y + 70);
  ctx.restore();

  if (cleanInviteUrl) {
    links.push({ url: cleanInviteUrl, x: btnX, y: btn1Y, width: btnW, height: btn1H });
  }

  // Link 2: Localização Google Maps
  const btn2Y = btn1Y + btn1H + 18;
  const btn2H = 96;
  ctx.save();
  drawRoundedRectPath(ctx, btnX, btn2Y, btnW, btn2H, 20);
  ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
  ctx.fill();
  ctx.strokeStyle = 'rgba(152, 117, 196, 0.45)';
  ctx.lineWidth = 2;
  ctx.stroke();

  ctx.fillStyle = '#4e3178';
  ctx.font = '700 20px "Geist", sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('COMO CHEGAR · ABRIR LOCALIZAÇÃO NO GOOGLE MAPS', 540, btn2Y + 34);

  ctx.fillStyle = '#735398';
  ctx.font = '500 17px "Geist", monospace';
  ctx.fillText(truncateMiddleOrEnd(ctx, cleanMapsUrl || '—', btnW - 56), 540, btn2Y + 67);
  ctx.restore();

  if (cleanMapsUrl) {
    links.push({ url: cleanMapsUrl, x: btnX, y: btn2Y, width: btnW, height: btn2H });
  }

  // 9. Rodapé
  const footerY = Math.min(1538, Math.max(btn2Y + btn2H + 34, 1510));
  ctx.fillStyle = '#6e4f99';
  ctx.font = 'italic 600 26px "Cormorant Garamond", Georgia, serif';
  ctx.textAlign = 'center';
  ctx.fillText(invitation.texts.closing, 540, footerY);

  return { canvas, links };
}

export function canvasToPngBlob(canvas: HTMLCanvasElement): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) resolve(blob);
      else reject(new Error('Não foi possível gerar a imagem PNG.'));
    }, 'image/png');
  });
}

function base64ToUint8Array(base64: string): Uint8Array {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

function escapePdfUri(url: string): string {
  const safe = url.replace(/[^\x20-\x7E]/g, (ch) => encodeURIComponent(ch));
  return safe.replace(/\\/g, '\\\\').replace(/\(/g, '\\(').replace(/\)/g, '\\)');
}

export async function generateInvitePdfBlob(
  canvas: HTMLCanvasElement,
  links: PdfLinkRect[],
): Promise<Blob> {
  const jpegDataUrl = canvas.toDataURL('image/jpeg', 0.94);
  const base64 = jpegDataUrl.split(',')[1] ?? '';
  const jpegBytes = base64ToUint8Array(base64);

  const scale = 0.5;
  const pdfW = Math.round(canvas.width * scale);
  const pdfH = Math.round(canvas.height * scale);

  const encoder = new TextEncoder();
  const chunks: Uint8Array[] = [];
  let byteOffset = 0;

  const pushText = (text: string) => {
    const bytes = encoder.encode(text);
    chunks.push(bytes);
    byteOffset += bytes.byteLength;
  };

  const pushBytes = (bytes: Uint8Array) => {
    chunks.push(bytes);
    byteOffset += bytes.byteLength;
  };

  const validLinks = links.filter((l) => /^https?:\/\//i.test(l.url));
  const offsets: number[] = [];

  // Header PDF 1.4 com marcador binário
  pushText('%PDF-1.4\n');
  pushBytes(new Uint8Array([0x25, 0xe2, 0xe3, 0xcf, 0xd3, 0x0a]));

  // 1: Catalog
  offsets[1] = byteOffset;
  pushText('1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n');

  // 2: Pages
  offsets[2] = byteOffset;
  pushText('2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n');

  // 3: Page
  const annotRefs = validLinks.map((_, i) => `${6 + i} 0 R`).join(' ');
  const annotsEntry = validLinks.length > 0 ? ` /Annots [${annotRefs}]` : '';
  offsets[3] = byteOffset;
  pushText(
    `3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${pdfW} ${pdfH}] /Resources << /XObject << /Im0 4 0 R >> /ProcSet [/PDF /ImageC] >> /Contents 5 0 R${annotsEntry} >>\nendobj\n`,
  );

  // 4: Image XObject (JPEG /DCTDecode)
  offsets[4] = byteOffset;
  pushText(
    `4 0 obj\n<< /Type /XObject /Subtype /Image /Width ${canvas.width} /Height ${canvas.height} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${jpegBytes.byteLength} >>\nstream\n`,
  );
  pushBytes(jpegBytes);
  pushText('\nendstream\nendobj\n');

  // 5: Content Stream
  const contentStream = `q ${pdfW} 0 0 ${pdfH} 0 0 cm /Im0 Do Q`;
  const contentLen = encoder.encode(contentStream).byteLength;
  offsets[5] = byteOffset;
  pushText(`5 0 obj\n<< /Length ${contentLen} >>\nstream\n${contentStream}\nendstream\nendobj\n`);

  // 6+: Annotations de Link clicáveis (/Subtype /Link)
  validLinks.forEach((link, idx) => {
    const objId = 6 + idx;
    const llx = (link.x * scale).toFixed(2);
    const urx = ((link.x + link.width) * scale).toFixed(2);
    const ury = ((canvas.height - link.y) * scale).toFixed(2);
    const lly = ((canvas.height - (link.y + link.height)) * scale).toFixed(2);
    const uri = escapePdfUri(link.url);

    offsets[objId] = byteOffset;
    pushText(
      `${objId} 0 obj\n<< /Type /Annot /Subtype /Link /Rect [${llx} ${lly} ${urx} ${ury}] /Border [0 0 0] /H /I /A << /Type /Action /S /URI /URI (${uri}) >> >>\nendobj\n`,
    );
  });

  // Tabela xref (cada linha com exatos 20 bytes)
  const totalObjs = 6 + validLinks.length;
  const xrefStart = byteOffset;
  pushText(`xref\n0 ${totalObjs}\n`);
  pushText('0000000000 65535 f \r\n');
  for (let i = 1; i < totalObjs; i++) {
    const offStr = String(offsets[i]).padStart(10, '0');
    pushText(`${offStr} 00000 n \r\n`);
  }

  pushText(
    `trailer\n<< /Size ${totalObjs} /Root 1 0 R >>\nstartxref\n${xrefStart}\n%%EOF`,
  );

  const output = new Uint8Array(byteOffset);
  let pos = 0;
  for (const chunk of chunks) {
    output.set(chunk, pos);
    pos += chunk.byteLength;
  }

  return new Blob([output], { type: 'application/pdf' });
}
