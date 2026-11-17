import { motion, useReducedMotion } from 'framer-motion';
import { useMemo } from 'react';

function rand(seed: number) {
  const s = Math.sin(seed * 12.9898 + 78.233) * 43758.5453;
  return s - Math.floor(s);
}

/** Partículas brilhantes flutuantes (leves, só CSS transform/opacity) */
export function Sparkles({ count = 18, seed = 1, className = '' }: { count?: number; seed?: number; className?: string }) {
  const reduce = useReducedMotion();
  const items = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => ({
        left: rand(seed + i) * 100,
        top: rand(seed * 2 + i) * 100,
        size: 2 + rand(seed * 3 + i) * 5,
        delay: rand(seed * 4 + i) * 6,
        dur: 4 + rand(seed * 5 + i) * 6,
        gold: rand(seed * 6 + i) > 0.5,
        star: rand(seed * 7 + i) > 0.75,
      })),
    [count, seed],
  );

  return (
    <div className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`} aria-hidden>
      {items.map((p, i) =>
        p.star ? (
          <motion.svg
            key={i}
            viewBox="0 0 20 20"
            className="absolute"
            style={{ left: `${p.left}%`, top: `${p.top}%`, width: p.size * 3, height: p.size * 3 }}
            animate={reduce ? { opacity: 0.6 } : { opacity: [0, 1, 0], scale: [0.4, 1, 0.4], rotate: [0, 90] }}
            transition={{ duration: p.dur, delay: p.delay, repeat: Infinity, ease: 'easeInOut' }}
          >
            <path d="M10 0 L12 8 L20 10 L12 12 L10 20 L8 12 L0 10 L8 8 Z" fill={p.gold ? '#e9d9b8' : '#fff'} />
          </motion.svg>
        ) : (
          <motion.span
            key={i}
            className="absolute rounded-full"
            style={{
              left: `${p.left}%`,
              top: `${p.top}%`,
              width: p.size,
              height: p.size,
              background: p.gold ? '#e9d9b8' : '#ffffff',
              boxShadow: `0 0 ${p.size * 3}px ${p.size}px ${p.gold ? 'rgb(216 197 162 / 0.6)' : 'rgb(201 175 233 / 0.7)'}`,
            }}
            animate={reduce ? { opacity: 0.5 } : { opacity: [0, 0.9, 0], y: [0, -40, -80] }}
            transition={{ duration: p.dur, delay: p.delay, repeat: Infinity, ease: 'easeOut' }}
          />
        ),
      )}
    </div>
  );
}

