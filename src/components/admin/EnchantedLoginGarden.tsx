import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { memo, useCallback, useEffect, useRef, useState } from 'react';
import { BloomingRose, FlowerCluster } from '../decorative/BloomingRose';
import { Sparkles } from '../decorative/Sparkles';

interface BloomItem {
  id: number;
  x: number;
  y: number;
  size: number;
  tone: 'lilac' | 'white' | 'gold';
  rotation: number;
}

const BUTTERFLIES = [
  { size: 42, wingA: '#c9afe9', wingB: '#9875c4', speed: 0.095, orbitR: 28, orbitSpeed: 0.0028, phase: 0.0, flapMs: 210 },
  { size: 34, wingA: '#e9ddfb', wingB: '#c9afe9', speed: 0.072, orbitR: 52, orbitSpeed: -0.0022, phase: 1.4, flapMs: 250 },
  { size: 38, wingA: '#f6edff', wingB: '#d8c5a2', speed: 0.056, orbitR: 74, orbitSpeed: 0.0019, phase: 2.7, flapMs: 230 },
  { size: 30, wingA: '#d9c4f3', wingB: '#9875c4', speed: 0.044, orbitR: 92, orbitSpeed: -0.0025, phase: 4.1, flapMs: 270 },
  { size: 28, wingA: '#fff8ec', wingB: '#d8c5a2', speed: 0.036, orbitR: 112, orbitSpeed: 0.0016, phase: 5.2, flapMs: 240 },
  { size: 36, wingA: '#c9afe9', wingB: '#6e4f99', speed: 0.028, orbitR: 64, orbitSpeed: -0.0031, phase: 3.3, flapMs: 220 },
];

const BLOOM_PALETTE = {
  lilac: { outer: '#d5bef2', mid: '#b694e0', inner: '#8f6bc0', center: '#f7e9cb' },
  white: { outer: '#ffffff', mid: '#f3ebfd', inner: '#decbf6', center: '#d8c5a2' },
  gold: { outer: '#f7ebd4', mid: '#e5d1ab', inner: '#caa974', center: '#fffdf8' },
};

const TONES: Array<'lilac' | 'white' | 'gold'> = ['lilac', 'white', 'gold'];

/** Broto de flor SVG que germina e desabrocha no ponto tocado/visitado */
function SproutingBloom({ bloom }: { bloom: BloomItem }) {
  const c = BLOOM_PALETTE[bloom.tone];
  return (
    <motion.div
      className="pointer-events-none fixed z-[3]"
      style={{
        left: bloom.x - bloom.size / 2,
        top: bloom.y - bloom.size / 2,
        width: bloom.size,
        height: bloom.size,
      }}
      initial={{ opacity: 0, scale: 0.15, rotate: bloom.rotation - 25 }}
      animate={{
        opacity: [0, 1, 1, 0],
        scale: [0.15, 1.08, 1, 0.85],
        rotate: bloom.rotation,
      }}
      exit={{ opacity: 0, scale: 0.4 }}
      transition={{ duration: 2.6, times: [0, 0.25, 0.72, 1], ease: [0.22, 1, 0.36, 1] }}
      aria-hidden="true"
    >
      <svg viewBox="0 0 80 80" width="100%" height="100%" style={{ overflow: 'visible' }}>
        {/* Folhas que brotam */}
        <motion.g
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.45, ease: 'easeOut' }}
          style={{ originX: '40px', originY: '40px' }}
        >
          <path d="M40 40 C 55 48, 68 56, 72 68 C 58 68, 48 56, 40 40 Z" fill="#a8bd97" opacity="0.85" />
          <path d="M40 40 C 25 48, 12 56, 8 68 C 22 68, 32 56, 40 40 Z" fill="#9ab287" opacity="0.8" />
        </motion.g>

        {/* Pétalas externas abrindo */}
        <motion.g
          initial={{ scale: 0.1, rotate: -30 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ duration: 0.75, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
          style={{ originX: '40px', originY: '40px' }}
        >
          {[0, 60, 120, 180, 240, 300].map((deg) => (
            <ellipse
              key={deg}
              cx="40"
              cy="22"
              rx="11"
              ry="16"
              fill={c.outer}
              stroke="#fff"
              strokeWidth="0.7"
              transform={`rotate(${deg} 40 40)`}
            />
          ))}
        </motion.g>

        {/* Pétalas internas */}
        <motion.g
          initial={{ scale: 0, rotate: 25 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ duration: 0.75, delay: 0.18, ease: [0.22, 1, 0.36, 1] }}
          style={{ originX: '40px', originY: '40px' }}
        >
          {[30, 90, 150, 210, 270, 330].map((deg) => (
            <ellipse
              key={deg}
              cx="40"
              cy="27"
              rx="8"
              ry="12"
              fill={c.mid}
              opacity="0.95"
              transform={`rotate(${deg} 40 40)`}
            />
          ))}
          <circle cx="40" cy="40" r="7" fill={c.inner} />
          <circle cx="40" cy="40" r="3.2" fill={c.center} />
        </motion.g>
      </svg>
    </motion.div>
  );
}

/** Ramo botânico animado que brota e se estende pelas bordas (visível em mobile e desktop) */
function BotanicalVine({ className = '', flip = false }: { className?: string; flip?: boolean }) {
  const reduce = useReducedMotion();
  return (
    <svg
      viewBox="0 0 220 220"
      className={`pointer-events-none h-36 w-36 sm:h-52 sm:w-52 ${className}`}
      style={{ transform: flip ? 'scaleX(-1)' : undefined }}
      aria-hidden="true"
    >
      <motion.path
        d="M12 210 Q 38 148 82 118 T 165 56 T 210 14"
        fill="none"
        stroke="#b39a6b"
        strokeWidth="1.6"
        strokeLinecap="round"
        initial={{ pathLength: reduce ? 1 : 0, opacity: reduce ? 0.75 : 0 }}
        animate={{ pathLength: 1, opacity: 0.75 }}
        transition={{ duration: 2.2, ease: [0.22, 1, 0.36, 1] }}
      />
      <motion.path
        d="M52 146 Q 28 118 22 92 M96 108 Q 112 72 136 62 M138 74 Q 110 44 114 18"
        fill="none"
        stroke="#c9b38a"
        strokeWidth="1.2"
        strokeLinecap="round"
        initial={{ pathLength: reduce ? 1 : 0, opacity: reduce ? 0.7 : 0 }}
        animate={{ pathLength: 1, opacity: 0.7 }}
        transition={{ duration: 2.0, delay: 0.5, ease: 'easeOut' }}
      />
      {[
        { cx: 34, cy: 112, r: -30, d: 0.7 },
        { cx: 78, cy: 122, r: 40, d: 0.9 },
        { cx: 126, cy: 66, r: -15, d: 1.1 },
        { cx: 174, cy: 48, r: 30, d: 1.3 },
      ].map((leaf, i) => (
        <motion.ellipse
          key={i}
          cx={leaf.cx}
          cy={leaf.cy}
          rx="11"
          ry="5.5"
          fill="#adc19c"
          opacity="0.72"
          transform={`rotate(${leaf.r} ${leaf.cx} ${leaf.cy})`}
          initial={{ scale: reduce ? 1 : 0 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.8, delay: leaf.d, ease: 'easeOut' }}
          style={{ originX: `${leaf.cx}px`, originY: `${leaf.cy}px` }}
        />
      ))}
    </svg>
  );
}

/** Borboleta decorativa parada (usada no fundo estático do painel admin) */
function StaticButterfly({
  size,
  wingA,
  wingB,
  rotate,
  className,
  gid,
}: {
  size: number;
  wingA: string;
  wingB: string;
  rotate: number;
  className: string;
  gid: string;
}) {
  return (
    <svg
      viewBox="0 0 64 64"
      width={size}
      height={size}
      className={`absolute opacity-80 drop-shadow-[0_6px_10px_rgba(110,79,153,0.18)] ${className}`}
      style={{ transform: `rotate(${rotate}deg)`, overflow: 'visible' }}
    >
      <defs>
        <radialGradient id={gid} cx="30%" cy="40%" r="80%">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.95" />
          <stop offset="48%" stopColor={wingA} />
          <stop offset="100%" stopColor={wingB} />
        </radialGradient>
      </defs>
      <path d="M32 30 C 18 6, 2 10, 6 26 C 8 34, 20 34, 32 32 Z" fill={`url(#${gid})`} stroke="#d8c5a2" strokeWidth="0.9" />
      <path d="M32 33 C 20 36, 8 44, 14 52 C 20 58, 28 46, 32 36 Z" fill={`url(#${gid})`} stroke="#d8c5a2" strokeWidth="0.9" opacity="0.92" />
      <path d="M32 30 C 46 6, 62 10, 58 26 C 56 34, 44 34, 32 32 Z" fill={`url(#${gid})`} stroke="#d8c5a2" strokeWidth="0.9" />
      <path d="M32 33 C 44 36, 56 44, 50 52 C 44 58, 36 46, 32 36 Z" fill={`url(#${gid})`} stroke="#d8c5a2" strokeWidth="0.9" opacity="0.92" />
      <circle cx="15" cy="20" r="2" fill="#fff" opacity="0.85" />
      <circle cx="49" cy="20" r="2" fill="#fff" opacity="0.85" />
      <ellipse cx="32" cy="34" rx="1.5" ry="8.5" fill="#6e4f99" />
      <path d="M31 26 Q 27 18 24 16 M33 26 Q 37 18 40 16" stroke="#6e4f99" strokeWidth="0.8" fill="none" strokeLinecap="round" />
    </svg>
  );
}

interface GardenProps {
  /** Fundo parado: sem borboletas voando, sem halo e sem flores brotando (painel admin) */
  staticMode?: boolean;
}

export const EnchantedLoginGarden = memo(function EnchantedLoginGarden({ staticMode = false }: GardenProps = {}) {
  const reduce = useReducedMotion() || staticMode;
  const haloRef = useRef<HTMLDivElement>(null);
  const butterflyRefs = useRef<Array<HTMLDivElement | null>>([]);
  const [blooms, setBlooms] = useState<BloomItem[]>([]);
  const bloomSeq = useRef(1);

  const spawnBloom = useCallback(
    (x: number, y: number, sizeOverride?: number) => {
      if (reduce) return;
      const id = bloomSeq.current++;
      const tone = TONES[id % TONES.length];
      const size = sizeOverride ?? 34 + (id % 4) * 8;
      const rotation = ((id * 47) % 60) - 30;
      setBlooms((prev) => [...prev.slice(-11), { id, x, y, size, tone, rotation }]);
      window.setTimeout(() => {
        setBlooms((prev) => prev.filter((b) => b.id !== id));
      }, 2600);
    },
    [reduce],
  );

  // Flores espontâneas brotando periodicamente pelo jardim (garante movimento vivo mesmo no mobile parado)
  useEffect(() => {
    if (reduce || typeof window === 'undefined') return;
    const id = window.setInterval(() => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      // Posiciona preferencialmente ao redor da área central (bordas e cantos visíveis no mobile e desktop)
      const edge = Math.random() > 0.5;
      const x = edge ? (Math.random() > 0.5 ? w * (0.08 + Math.random() * 0.18) : w * (0.74 + Math.random() * 0.18)) : w * (0.15 + Math.random() * 0.7);
      const y = edge ? h * (0.12 + Math.random() * 0.76) : (Math.random() > 0.5 ? h * (0.08 + Math.random() * 0.16) : h * (0.76 + Math.random() * 0.16));
      spawnBloom(x, y, 36 + Math.random() * 18);
    }, 1800);
    return () => window.clearInterval(id);
  }, [reduce, spawnBloom]);

  // Física do bando de borboletas seguindo o cursor (desktop) ou toque / voo autônomo (mobile)
  useEffect(() => {
    if (reduce || typeof window === 'undefined') return;

    const w0 = window.innerWidth;
    const h0 = window.innerHeight;
    let targetX = w0 * 0.5;
    let targetY = h0 * 0.35;
    let lastUserInput = 0; // 0 => inicia no passeio autônomo bonito logo ao abrir (ótimo no mobile!)
    let lastBloomAt = 0;
    let lastBloomX = targetX;
    let lastBloomY = targetY;

    const flock = BUTTERFLIES.map((b, i) => ({
      x: w0 * (0.2 + (i / BUTTERFLIES.length) * 0.6),
      y: h0 * (0.2 + ((i * 37) % 60) / 100),
      vx: 0,
      vy: 0,
      ...b,
    }));

    let haloX = targetX;
    let haloY = targetY;
    let rafId = 0;

    const onPointerMove = (e: PointerEvent) => {
      targetX = e.clientX;
      targetY = e.clientY;
      lastUserInput = performance.now();

      const now = lastUserInput;
      const dist = Math.hypot(e.clientX - lastBloomX, e.clientY - lastBloomY);
      if (dist > 64 && now - lastBloomAt > 140) {
        lastBloomAt = now;
        lastBloomX = e.clientX;
        lastBloomY = e.clientY;
        spawnBloom(e.clientX, e.clientY);
      }
    };

    const onPointerDown = (e: PointerEvent) => {
      targetX = e.clientX;
      targetY = e.clientY;
      lastUserInput = performance.now();
      // Ao tocar na tela (especialmente no celular), brota uma flor maior no ponto tocado
      spawnBloom(e.clientX, e.clientY, 54);
    };

    const tick = (now: number) => {
      const w = window.innerWidth || 390;
      const h = window.innerHeight || 844;

      // Se o usuário não moveu o ponteiro há > 2.6s (ou ainda não tocou no celular), o alvo passeia pelo jardim
      const idle = lastUserInput === 0 || now - lastUserInput > 2600;
      const cx = idle ? w * 0.5 + Math.cos(now * 0.00075) * (w * 0.34) : targetX;
      const cy = idle ? h * 0.48 + Math.sin(now * 0.00115) * (h * 0.3) : targetY;

      haloX += (cx - haloX) * 0.08;
      haloY += (cy - haloY) * 0.08;
      if (haloRef.current) {
        haloRef.current.style.transform = `translate3d(${(haloX - 180).toFixed(1)}px, ${(haloY - 180).toFixed(1)}px, 0)`;
      }

      for (let i = 0; i < flock.length; i++) {
        const b = flock[i];
        const angle = b.phase + now * b.orbitSpeed;
        const radius = w < 640 ? b.orbitR * 0.72 : b.orbitR;
        const goalX = cx + Math.cos(angle) * radius;
        const goalY = cy + Math.sin(angle * 1.3) * (radius * 0.65);

        const dx = goalX - b.x;
        const dy = goalY - b.y;
        b.vx = b.vx * 0.72 + dx * b.speed;
        b.vy = b.vy * 0.72 + dy * b.speed;
        b.x += b.vx;
        b.y += b.vy;

        const tilt = Math.max(-32, Math.min(32, b.vx * 2.2));
        const el = butterflyRefs.current[i];
        if (el) {
          el.style.transform = `translate3d(${(b.x - b.size / 2).toFixed(1)}px, ${(b.y - b.size / 2).toFixed(1)}px, 0) rotate(${tilt.toFixed(1)}deg)`;
        }
      }

      rafId = window.requestAnimationFrame(tick);
    };

    window.addEventListener('pointermove', onPointerMove, { passive: true });
    window.addEventListener('pointerdown', onPointerDown, { passive: true });
    rafId = window.requestAnimationFrame(tick);

    return () => {
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerdown', onPointerDown);
      window.cancelAnimationFrame(rafId);
    };
  }, [reduce, spawnBloom]);

  return (
    <div className="watercolor-deep pointer-events-none fixed inset-0 z-0 overflow-hidden" aria-hidden="true">
      {/* Partículas brilhantes de conto de fadas */}
      <Sparkles count={staticMode ? 14 : 28} seed={91} />

      {/* Halo suave que acompanha as borboletas / ponteiro */}
      {!reduce && (
        <div
          ref={haloRef}
          className="pointer-events-none fixed left-0 top-0 h-[360px] w-[360px] rounded-full opacity-75 blur-3xl will-change-transform"
          style={{
            background:
              'radial-gradient(circle, rgba(216,197,162,0.34) 0%, rgba(201,175,233,0.28) 45%, transparent 72%)',
          }}
        />
      )}

      {/* Trepadeiras e rosas desabrochando nos 4 cantos (visível no mobile e no desktop) */}
      <BotanicalVine className="absolute -left-3 bottom-0" />
      <BotanicalVine className="absolute -right-3 top-0 rotate-180" />

      <FlowerCluster side="left" className="-top-6 opacity-85 sm:top-0" />
      <FlowerCluster side="right" className="-bottom-6 opacity-85 sm:bottom-0" />

      {/* Rosas extras próximas às bordas inferiores/superiores no mobile */}
      <div className="pointer-events-auto">
        <BloomingRose size={72} color="white" delay={0.3} className="absolute left-3 bottom-3 sm:left-10 sm:bottom-8" />
        <BloomingRose size={64} color="lilac" delay={0.6} className="absolute right-3 top-3 sm:right-10 sm:top-8" />
      </div>

      {/* Flores que brotam e desabrocham com o movimento/toque e espontaneamente */}
      <AnimatePresence>
        {blooms.map((b) => (
          <SproutingBloom key={b.id} bloom={b} />
        ))}
      </AnimatePresence>

      {/* Borboletas paradas decorando o fundo estático */}
      {staticMode && (
        <>
          <StaticButterfly gid="st-bf-1" size={46} wingA="#c9afe9" wingB="#9875c4" rotate={-18} className="left-[8%] top-[22%]" />
          <StaticButterfly gid="st-bf-2" size={36} wingA="#f6edff" wingB="#d8c5a2" rotate={14} className="right-[10%] top-[38%]" />
          <StaticButterfly gid="st-bf-3" size={40} wingA="#e9ddfb" wingB="#c9afe9" rotate={-8} className="left-[18%] bottom-[18%]" />
          <StaticButterfly gid="st-bf-4" size={32} wingA="#d9c4f3" wingB="#6e4f99" rotate={22} className="right-[22%] bottom-[10%] hidden sm:block" />
          <StaticButterfly gid="st-bf-5" size={30} wingA="#fff8ec" wingB="#d8c5a2" rotate={-26} className="left-[46%] top-[12%] hidden sm:block" />
        </>
      )}

      {/* Bando de borboletas seguidoras */}
      {!reduce &&
        BUTTERFLIES.map((b, i) => (
          <div
            key={i}
            ref={(el) => {
              butterflyRefs.current[i] = el;
            }}
            className="pointer-events-none fixed left-0 top-0 z-[4] will-change-transform"
            style={{ width: b.size, height: b.size }}
          >
            <svg viewBox="0 0 64 64" width="100%" height="100%" style={{ overflow: 'visible' }}>
              <defs>
                <radialGradient id={`login-bf-${i}`} cx="30%" cy="40%" r="80%">
                  <stop offset="0%" stopColor="#ffffff" stopOpacity="0.95" />
                  <stop offset="48%" stopColor={b.wingA} />
                  <stop offset="100%" stopColor={b.wingB} />
                </radialGradient>
              </defs>
              <motion.g
                style={{ originX: '32px', originY: '32px' }}
                animate={{ scaleX: [1, 0.24, 1] }}
                transition={{ duration: b.flapMs / 1000, repeat: Infinity, ease: 'easeInOut' }}
              >
                <path
                  d="M32 30 C 18 6, 2 10, 6 26 C 8 34, 20 34, 32 32 Z"
                  fill={`url(#login-bf-${i})`}
                  stroke="#d8c5a2"
                  strokeWidth="0.9"
                />
                <path
                  d="M32 33 C 20 36, 8 44, 14 52 C 20 58, 28 46, 32 36 Z"
                  fill={`url(#login-bf-${i})`}
                  stroke="#d8c5a2"
                  strokeWidth="0.9"
                  opacity="0.92"
                />
                <path
                  d="M32 30 C 46 6, 62 10, 58 26 C 56 34, 44 34, 32 32 Z"
                  fill={`url(#login-bf-${i})`}
                  stroke="#d8c5a2"
                  strokeWidth="0.9"
                />
                <path
                  d="M32 33 C 44 36, 56 44, 50 52 C 44 58, 36 46, 32 36 Z"
                  fill={`url(#login-bf-${i})`}
                  stroke="#d8c5a2"
                  strokeWidth="0.9"
                  opacity="0.92"
                />
                <circle cx="15" cy="20" r="2" fill="#fff" opacity="0.85" />
                <circle cx="49" cy="20" r="2" fill="#fff" opacity="0.85" />
              </motion.g>
              <ellipse cx="32" cy="34" rx="1.5" ry="8.5" fill="#6e4f99" />
              <path
                d="M31 26 Q 27 18 24 16 M33 26 Q 37 18 40 16"
                stroke="#6e4f99"
                strokeWidth="0.8"
                fill="none"
                strokeLinecap="round"
              />
            </svg>
          </div>
        ))}
    </div>
  );
});
