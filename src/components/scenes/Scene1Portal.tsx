import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { Sparkles as SparkIcon } from 'lucide-react';
import { useState } from 'react';
import { invitation } from '../../config/invitation.config';
import { BloomingRose, FlowerCluster } from '../decorative/BloomingRose';
import { ButterflySwarm } from '../decorative/Butterfly';
import { Flourish } from '../decorative/OrnateFrame';
import { CrownCrest, PaperDeckled } from '../decorative/PaperDeckled';
import { Sparkles } from '../decorative/Sparkles';

/** CENA 1 — Portal encantado em tela cheia. Bloqueia a rolagem até abrir. */
export function Scene1Portal({ onOpen }: { onOpen: () => void }) {
  const [opening, setOpening] = useState(false);
  const reduce = useReducedMotion();

  const open = () => {
    if (opening) return;
    setOpening(true);
    setTimeout(onOpen, reduce ? 200 : 1900);
  };

  return (
    <AnimatePresence>
      <motion.div
        key="portal"
        className="watercolor-deep fixed inset-0 z-50 flex items-center justify-center overflow-y-auto overflow-x-hidden px-4 py-6"
        exit={{ opacity: 0 }}
        transition={{ duration: 0.8 }}
      >
        <Sparkles count={36} seed={3} />
        <ButterflySwarm count={5} seedBase={2} />

        {/* Véus/cortinas florais que se abrem */}
        <motion.div
          className="pointer-events-none absolute inset-y-0 left-0 w-1/2 bg-gradient-to-r from-lilac/70 via-lavender/60 to-transparent"
          animate={opening ? { x: '-100%', opacity: 0 } : { x: 0 }}
          transition={{ duration: 1.6, ease: [0.65, 0, 0.35, 1] }}
        >
          <FlowerCluster side="left" className="top-[8%]" />
          <FlowerCluster side="left" className="bottom-[4%]" />
        </motion.div>
        <motion.div
          className="pointer-events-none absolute inset-y-0 right-0 w-1/2 bg-gradient-to-l from-lilac/70 via-lavender/60 to-transparent"
          animate={opening ? { x: '100%', opacity: 0 } : { x: 0 }}
          transition={{ duration: 1.6, ease: [0.65, 0, 0.35, 1] }}
        >
          <FlowerCluster side="right" className="top-[14%]" />
          <FlowerCluster side="right" className="bottom-[2%]" />
        </motion.div>

        {/* Explosão de luz e flores ao abrir */}
        {opening && !reduce && (
          <>
            <motion.div
              className="pointer-events-none absolute h-40 w-40 rounded-full bg-white"
              initial={{ scale: 0, opacity: 0.9 }}
              animate={{ scale: 18, opacity: 0 }}
              transition={{ duration: 1.8, ease: 'easeOut' }}
            />
            {Array.from({ length: 10 }).map((_, i) => {
              const a = (i / 10) * Math.PI * 2;
              return (
                <motion.div
                  key={i}
                  className="pointer-events-none absolute"
                  initial={{ x: 0, y: 0, scale: 0.2, opacity: 0 }}
                  animate={{ x: Math.cos(a) * 260, y: Math.sin(a) * 260, scale: 1, opacity: [0, 1, 0] }}
                  transition={{ duration: 1.7, ease: 'easeOut' }}
                >
                  <BloomingRose size={46} color={i % 2 ? 'white' : 'lilac'} />
                </motion.div>
              );
            })}
          </>
        )}

        <motion.div
          className="relative z-10 my-auto w-full max-w-[27rem]"
          initial={{ opacity: 0, scale: 0.93, y: 12 }}
          animate={
            opening
              ? { opacity: 0, scale: 1.1, y: -12, filter: 'blur(8px)' }
              : { opacity: 1, scale: 1, y: 0 }
          }
          transition={{ duration: opening ? 1.1 : 1.5, ease: [0.22, 1, 0.36, 1] }}
        >
          <PaperDeckled onClick={open}>
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35, duration: 0.9 }}
            >
              <CrownCrest className="mb-2" />
              <p className="font-sans text-[0.65rem] font-semibold uppercase tracking-[0.42em] text-plum">
                Convite Especial · 15 Anos
              </p>
            </motion.div>

            <motion.div
              className="mt-4 flex flex-col items-center"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.65, duration: 1.1 }}
            >
              <p className="font-script text-5xl leading-tight text-plum-deep sm:text-[3.5rem]">
                {invitation.debutante.name}
              </p>
              <div className="mt-1 flex items-center gap-3">
                <span className="h-px w-8 bg-gold/80" />
                <span className="font-numeral text-5xl font-bold leading-none tracking-tight text-gold-shine sm:text-6xl">
                  15
                </span>
                <span className="h-px w-8 bg-gold/80" />
              </div>
              <p className="mt-1.5 font-sans text-[0.62rem] font-medium uppercase tracking-[0.36em] text-plum/85">
                Uma noite de conto de fadas
              </p>
            </motion.div>

            <Flourish className="my-5" />

            <motion.h1
              className="mx-auto max-w-[18rem] font-serif text-xl italic leading-relaxed text-plum-deep sm:text-2xl"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.0, duration: 1.1 }}
            >
              “{invitation.texts.portal}”
            </motion.h1>

            <motion.button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                open();
              }}
              className="btn-magic mt-7 inline-flex min-h-[48px] items-center justify-center gap-2.5 rounded-full border border-gold/80 bg-gradient-to-r from-plum via-[#a786d1] to-[#b393de] px-8 py-3.5 font-sans text-xs font-semibold uppercase tracking-[0.24em] text-white shadow-[0_12px_28px_-8px_rgb(110_79_153/0.65)] ring-4 ring-lavender/50"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.35, duration: 0.9 }}
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
            >
              <SparkIcon size={15} />
              {invitation.texts.portalButton}
            </motion.button>

            <motion.p
              className="mt-3.5 font-sans text-[0.72rem] tracking-wide text-plum/80"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.75 }}
            >
              Toque para abrir o seu convite
            </motion.p>
          </PaperDeckled>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
