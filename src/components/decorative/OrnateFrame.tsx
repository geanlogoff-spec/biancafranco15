import { motion, useReducedMotion } from 'framer-motion';

/** Arabesco de canto em dourado, desenhado com animação de traço */
function Corner({ className = '', delay = 0 }: { className?: string; delay?: number }) {
  const reduce = useReducedMotion();
  const draw = {
    hidden: { pathLength: reduce ? 1 : 0, opacity: reduce ? 1 : 0 },
    show: { pathLength: 1, opacity: 1, transition: { delay, duration: 2.2, ease: 'easeInOut' as const } },
  };
  return (
    <motion.svg
      viewBox="0 0 120 120"
      className={`absolute h-16 w-16 sm:h-24 sm:w-24 ${className}`}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true }}
      aria-hidden
    >
      <g fill="none" stroke="#c9b38a" strokeWidth="1.4" strokeLinecap="round">
        <motion.path variants={draw} d="M6 114 L6 40 Q6 6 40 6 L114 6" />
        <motion.path variants={draw} d="M14 100 L14 46 Q14 14 46 14 L100 14" strokeWidth="0.8" />
        <motion.path variants={draw} d="M6 40 C 22 40, 30 30, 30 18 C 30 10, 22 8, 18 14 C 14 20, 22 26, 28 22" />
        <motion.path variants={draw} d="M40 6 C 40 22, 30 30, 18 30 C 10 30, 8 22, 14 18 C 20 14, 26 22, 22 28" />
      </g>
      <motion.circle variants={draw} cx="30" cy="30" r="3" fill="#d8c5a2" />
    </motion.svg>
  );
}

export function OrnateFrame({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`relative ${className}`}>
      <Corner className="left-1 top-1" />
      <Corner className="right-1 top-1 rotate-90" delay={0.15} />
      <Corner className="bottom-1 right-1 rotate-180" delay={0.3} />
      <Corner className="bottom-1 left-1 -rotate-90" delay={0.45} />
      {children}
    </div>
  );
}

/** Divisor ornamental com flor central */
export function Flourish({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 240 24" className={`mx-auto h-5 w-48 ${className}`} aria-hidden>
      <g fill="none" stroke="#c9b38a" strokeWidth="1">
        <path d="M4 12 H96 M144 12 H236" />
        <path d="M96 12 C 104 2, 112 2, 120 12 C 128 22, 136 22, 144 12" />
        <path d="M96 12 C 104 22, 112 22, 120 12 C 128 2, 136 2, 144 12" />
      </g>
      <circle cx="120" cy="12" r="3" fill="#d8c5a2" />
      <circle cx="4" cy="12" r="1.8" fill="#d8c5a2" />
      <circle cx="236" cy="12" r="1.8" fill="#d8c5a2" />
    </svg>
  );
}

