import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';

/** Revelação progressiva (fade + slide-up) acionada pelo scroll via IntersectionObserver */
export function Reveal({
  children,
  delay = 0,
  y = 36,
  className = '',
}: {
  children: React.ReactNode;
  delay?: number;
  y?: number;
  className?: string;
}) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: reduce ? 0 : y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.25 }}
      transition={{ duration: 1.1, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}

/** Container de cena com parallax suave nas camadas decorativas */
export function Scene({
  id,
  children,
  decor,
  className = '',
}: {
  id: string;
  children: React.ReactNode;
  decor?: React.ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] });
  const yDecor = useTransform(scrollYProgress, [0, 1], reduce ? [0, 0] : [80, -80]);

  return (
    <section ref={ref} id={id} className={`relative flex min-h-[100dvh] items-center justify-center overflow-hidden px-5 py-24 ${className}`}>
      {decor && (
        <motion.div className="pointer-events-none absolute inset-0" style={{ y: yDecor }}>
          {decor}
        </motion.div>
      )}
      <div className="relative z-10 w-full max-w-3xl">{children}</div>
    </section>
  );
}

export function SectionTitle({ eyebrow, title }: { eyebrow?: string; title: string }) {
  return (
    <Reveal className="mb-10 text-center">
      {eyebrow && <p className="mb-3 font-sans text-xs uppercase tracking-[0.4em] text-plum">{eyebrow}</p>}
      <h2 className="font-serif text-4xl font-medium italic text-plum-deep sm:text-5xl">{title}</h2>
    </Reveal>
  );
}

