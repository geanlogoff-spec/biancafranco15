import { motion, useInView, useReducedMotion } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import { invitation } from '../../config/invitation.config';
import { BloomingRose } from '../decorative/BloomingRose';
import { ButterflySwarm } from '../decorative/Butterfly';
import { Flourish } from '../decorative/OrnateFrame';
import { Sparkles } from '../decorative/Sparkles';
import { Scene, SectionTitle } from '../Scene';

/** CENA 3 — Carta encantada: o lacre se rompe, a aba abre e a carta é revelada */
export function Scene3Invitation() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.25 });
  const reduce = useReducedMotion();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (inView) {
      const t = setTimeout(() => setOpen(true), reduce ? 0 : 600);
      return () => clearTimeout(t);
    }
  }, [inView, reduce]);

  return (
    <Scene
      id="convite"
      className="watercolor-deep"
      decor={
        <>
          <Sparkles count={22} seed={21} />
          <ButterflySwarm count={3} seedBase={9} />
        </>
      }
    >
      <SectionTitle eyebrow="Um convite especial" title="Era uma vez..." />

      <div ref={ref} className="relative mx-auto w-full max-w-lg" style={{ perspective: 1400 }}>
        {/* Carta */}
        <motion.div
          className="glass-card relative z-20 mx-auto rounded-2xl px-7 py-10 text-center sm:px-12 sm:py-14"
          initial={false}
          animate={open ? { y: 0, opacity: 1, scale: 1 } : { y: reduce ? 0 : 120, opacity: 0, scale: 0.92 }}
          transition={{ duration: 1.4, delay: open ? 0.9 : 0, ease: [0.22, 1, 0.36, 1] }}
        >
          <p className="font-script text-4xl text-plum">Querido(a) convidado(a),</p>
          <Flourish className="my-6" />
          {invitation.texts.invitation.map((p, i) => (
            <motion.p
              key={i}
              className="mb-5 font-serif text-xl leading-relaxed text-plum-deep sm:text-[1.4rem]"
              initial={{ opacity: 0, y: 12 }}
              animate={open ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 1.6 + i * 0.5, duration: 1 }}
            >
              {p}
            </motion.p>
          ))}
          <motion.p
            className="mt-6 font-script text-4xl text-gold-shine"
            initial={{ opacity: 0 }}
            animate={open ? { opacity: 1 } : {}}
            transition={{ delay: 2.8, duration: 1 }}
          >
            {invitation.debutante.name.split(' ')[0]}
          </motion.p>
          <BloomingRose size={70} color="lilac" className="absolute -left-6 -top-6" delay={2} />
          <BloomingRose size={56} color="white" className="absolute -bottom-5 -right-4" delay={2.3} />
        </motion.div>

        {/* Envelope que se abre e desaparece */}
        <motion.div
          className="absolute inset-x-0 top-0 z-30 mx-auto h-64 w-full max-w-md cursor-pointer sm:h-72"
          initial={false}
          animate={open ? { opacity: 0, y: 80, pointerEvents: 'none' } : { opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: open ? 0.7 : 0 }}
          onClick={() => setOpen(true)}
          role="button"
          aria-label="Abrir carta"
        >
          <div className="absolute inset-0 rounded-xl bg-gradient-to-b from-[#efe5fc] to-lilac shadow-2xl" />
          <motion.div
            className="absolute inset-x-0 top-0 h-1/2 origin-top"
            style={{ transformStyle: 'preserve-3d' }}
            animate={open ? { rotateX: 180 } : { rotateX: 0 }}
            transition={{ duration: 0.8, ease: 'easeInOut' }}
          >
            <svg viewBox="0 0 100 50" preserveAspectRatio="none" className="h-full w-full">
              <path d="M0 0 L50 48 L100 0 Z" fill="#d9c4f3" stroke="#d8c5a2" strokeWidth="0.4" />
            </svg>
          </motion.div>
          <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 h-full w-full">
            <path d="M0 100 L50 52 L100 100 Z" fill="#c9afe9" opacity="0.6" />
          </svg>
          {/* Lacre */}
          <motion.div
            className="font-numeral absolute left-1/2 top-1/2 flex h-16 w-16 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-gradient-to-br from-gold to-gold-deep text-2xl font-bold tracking-tight text-white shadow-lg"
            animate={open ? { scale: 0, rotate: 90 } : { scale: [1, 1.06, 1] }}
            transition={open ? { duration: 0.4 } : { duration: 2, repeat: Infinity }}
          >
            15
          </motion.div>
          {!open && <p className="absolute bottom-4 w-full text-center font-sans text-xs uppercase tracking-[0.3em] text-plum-deep/70">toque para abrir</p>}
        </motion.div>
      </div>
    </Scene>
  );
}

