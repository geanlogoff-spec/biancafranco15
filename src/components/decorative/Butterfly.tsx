import { motion, useReducedMotion } from 'framer-motion';
import { useMemo, useState } from 'react';

const PALETTE = [
  ['#c9afe9', '#9875c4'],
  ['#e9ddfb', '#c9afe9'],
  ['#f3e9ff', '#d8c5a2'],
  ['#d9c4f3', '#9875c4'],
];

interface Props {
  /** Posição inicial em % da área */
  x: number;
  y: number;
  size?: number;
  variant?: number;
  /** Amplitude da trajetória em px */
  range?: number;
  seed?: number;
}

function rand(seed: number) {
  const s = Math.sin(seed * 9301 + 49297) * 233280;
  return s - Math.floor(s);
}

export function Butterfly({ x, y, size = 38, variant = 0, range = 120, seed = 1 }: Props) {
  const reduce = useReducedMotion();
  const [flee, setFlee] = useState(0);
  const [c1, c2] = PALETTE[variant % PALETTE.length];

  // Trajetória orgânica gerada por seed: cada borboleta tem um caminho único
  const path = useMemo(() => {
    const pts = Array.from({ length: 6 }, (_, i) => ({
      x: (rand(seed + i) - 0.5) * range * 2,
      y: (rand(seed * 3 + i) - 0.5) * range,
      r: (rand(seed * 7 + i) - 0.5) * 40,
    }));
    pts.push(pts[0]);
    return pts;
  }, [seed, range]);

  const duration = 14 + rand(seed * 11) * 10;
  const flap = 0.22 + rand(seed * 5) * 0.14;

  return (
    <motion.div
      className="absolute cursor-pointer select-none"
      style={{ left: `${x}%`, top: `${y}%`, width: size, height: size, zIndex: 5 }}
      animate={
        reduce
          ? { opacity: 0.9 }
          : {
              x: path.map((p) => p.x + flee * 60),
              y: path.map((p) => p.y - flee * 80),
              rotate: path.map((p) => p.r),
            }
      }
      transition={{ duration, repeat: Infinity, ease: 'easeInOut' }}
      onPointerDown={() => setFlee((f) => (f >= 2 ? 0 : f + 1))}
      onHoverStart={() => setFlee((f) => (f >= 2 ? 0 : f + 1))}
      aria-hidden
    >
      <svg viewBox="0 0 64 64" width="100%" height="100%" style={{ overflow: 'visible' }}>
        <defs>
          <radialGradient id={`bw-${seed}`} cx="30%" cy="40%" r="80%">
            <stop offset="0%" stopColor="#fff" stopOpacity="0.95" />
            <stop offset="45%" stopColor={c1} />
            <stop offset="100%" stopColor={c2} />
          </radialGradient>
        </defs>
        {/* Asa esquerda */}
        <motion.g
          style={{ originX: '32px', originY: '32px' }}
          animate={reduce ? undefined : { scaleX: [1, 0.25, 1] }}
          transition={{ duration: flap, repeat: Infinity, ease: 'easeInOut' }}
        >
          <path d="M32 30 C 18 6, 2 10, 6 26 C 8 34, 20 34, 32 32 Z" fill={`url(#bw-${seed})`} stroke="#d8c5a2" strokeWidth="0.8" />
          <path d="M32 33 C 20 36, 8 44, 14 52 C 20 58, 28 46, 32 36 Z" fill={`url(#bw-${seed})`} stroke="#d8c5a2" strokeWidth="0.8" opacity="0.9" />
          <circle cx="14" cy="20" r="2.2" fill="#fff" opacity="0.8" />
        </motion.g>
        {/* Asa direita */}
        <motion.g
          style={{ originX: '32px', originY: '32px' }}
          animate={reduce ? undefined : { scaleX: [1, 0.25, 1] }}
          transition={{ duration: flap, repeat: Infinity, ease: 'easeInOut' }}
        >
          <path d="M32 30 C 46 6, 62 10, 58 26 C 56 34, 44 34, 32 32 Z" fill={`url(#bw-${seed})`} stroke="#d8c5a2" strokeWidth="0.8" />
          <path d="M32 33 C 44 36, 56 44, 50 52 C 44 58, 36 46, 32 36 Z" fill={`url(#bw-${seed})`} stroke="#d8c5a2" strokeWidth="0.8" opacity="0.9" />
          <circle cx="50" cy="20" r="2.2" fill="#fff" opacity="0.8" />
        </motion.g>
        <ellipse cx="32" cy="34" rx="1.6" ry="9" fill="#6e4f99" />
        <path d="M31 26 Q 27 18 24 16 M33 26 Q 37 18 40 16" stroke="#6e4f99" strokeWidth="0.8" fill="none" strokeLinecap="round" />
      </svg>
    </motion.div>
  );
}

/** Grupo de borboletas posicionadas pela seção */
export function ButterflySwarm({ count = 4, seedBase = 1 }: { count?: number; seedBase?: number }) {
  const items = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => ({
        x: 8 + rand(seedBase * 13 + i) * 80,
        y: 10 + rand(seedBase * 17 + i) * 70,
        size: 26 + rand(seedBase * 19 + i) * 22,
        variant: i,
        seed: seedBase * 10 + i + 1,
      })),
    [count, seedBase],
  );
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="pointer-events-auto">
        {items.map((b) => (
          <Butterfly key={b.seed} {...b} />
        ))}
      </div>
    </div>
  );
}

