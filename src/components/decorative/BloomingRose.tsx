import { motion, useReducedMotion, type Variants } from 'framer-motion';
import { useState } from 'react';

interface RoseProps {
  size?: number;
  color?: 'lilac' | 'white' | 'plum';
  delay?: number;
  className?: string;
  style?: React.CSSProperties;
  rotate?: number;
}

const TONES = {
  lilac: { outer: '#c9afe9', mid: '#b596df', inner: '#9875c4', light: '#efe5fc' },
  white: { outer: '#fdfbff', mid: '#f1e9fb', inner: '#ddcdf2', light: '#ffffff' },
  plum: { outer: '#b08bd9', mid: '#9875c4', inner: '#7a5aa8', light: '#d9c4f3' },
};

/** Rosa em SVG que desabrocha camada por camada ao entrar na tela; toque faz ela "respirar" */
export function BloomingRose({ size = 90, color = 'lilac', delay = 0, className = '', style, rotate = 0 }: RoseProps) {
  const reduce = useReducedMotion();
  const [pulse, setPulse] = useState(0);
  const t = TONES[color];

  const layer: Variants = {
    hidden: { scale: reduce ? 1 : 0.1, opacity: reduce ? 1 : 0, rotate: reduce ? 0 : -40 },
    show: (i: number) => ({
      scale: 1,
      opacity: 1,
      rotate: 0,
      transition: { delay: delay + i * 0.18, duration: 1.4, ease: [0.22, 1, 0.36, 1] },
    }),
  };

  const ring = (n: number, r: number, rx: number, ry: number, fill: string, offset = 0) =>
    Array.from({ length: n }, (_, k) => (
      <ellipse
        key={k}
        cx="50"
        cy={50 - r}
        rx={rx}
        ry={ry}
        fill={fill}
        stroke={t.light}
        strokeWidth="0.8"
        transform={`rotate(${(360 / n) * k + offset} 50 50)`}
      />
    ));

  return (
    <motion.div
      className={`relative cursor-pointer ${className}`}
      style={{ width: size, height: size, rotate, ...style }}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: 0.3 }}
      onPointerDown={() => setPulse((p) => p + 1)}
      aria-hidden
    >
      <motion.svg
        key={pulse}
        viewBox="0 0 100 100"
        width="100%"
        height="100%"
        animate={pulse && !reduce ? { scale: [1, 1.12, 0.96, 1], rotate: [0, 8, -4, 0] } : undefined}
        transition={{ duration: 0.9 }}
        style={{ overflow: 'visible', filter: 'drop-shadow(0 6px 10px rgb(110 79 153 / 0.18))' }}
      >
        {/* Folhas */}
        <motion.g custom={0} variants={layer} style={{ originX: '50px', originY: '50px' }}>
          <path d="M50 50 C 70 62, 92 70, 98 88 C 80 90, 62 78, 50 50 Z" fill="#b9c9a8" opacity="0.85" />
          <path d="M50 50 C 30 64, 10 66, 2 84 C 22 88, 40 76, 50 50 Z" fill="#a9bd98" opacity="0.8" />
        </motion.g>
        <motion.g custom={1} variants={layer} style={{ originX: '50px', originY: '50px' }}>
          {ring(6, 22, 17, 22, t.outer)}
        </motion.g>
        <motion.g custom={2} variants={layer} style={{ originX: '50px', originY: '50px' }}>
          {ring(5, 14, 13, 16, t.mid, 30)}
        </motion.g>
        <motion.g custom={3} variants={layer} style={{ originX: '50px', originY: '50px' }}>
          {ring(4, 7, 9, 11, t.inner, 15)}
          <circle cx="50" cy="50" r="6" fill={t.inner} />
          <path d="M46 50 Q 50 43 54 50 Q 50 55 46 50" fill={t.light} opacity="0.6" />
        </motion.g>
      </motion.svg>
    </motion.div>
  );
}

/** Ramo de flores decorativo usado nas laterais das cenas */
export function FlowerCluster({ side = 'left', className = '' }: { side?: 'left' | 'right'; className?: string }) {
  const flip = side === 'right';
  return (
    <div
      className={`pointer-events-auto absolute ${flip ? 'right-0' : 'left-0'} ${className}`}
      style={{ transform: flip ? 'scaleX(-1)' : undefined }}
    >
      <div className="relative h-56 w-40 sm:h-72 sm:w-56">
        <BloomingRose size={110} color="lilac" className="absolute -left-6 top-6" />
        <BloomingRose size={78} color="white" delay={0.3} className="absolute left-16 top-0 sm:left-24" rotate={20} />
        <BloomingRose size={64} color="plum" delay={0.5} className="absolute left-4 top-28 sm:top-32" rotate={-15} />
        <BloomingRose size={52} color="white" delay={0.7} className="absolute left-20 top-32 sm:left-28 sm:top-40" />
      </div>
    </div>
  );
}

