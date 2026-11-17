import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { Sparkles as SparkIcon } from 'lucide-react';
import { useState } from 'react';
import { invitation } from '../../config/invitation.config';
import { BloomingRose, FlowerCluster } from '../decorative/BloomingRose';
import { ButterflySwarm } from '../decorative/Butterfly';
import { OrnateFrame } from '../decorative/OrnateFrame';
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
        className="watercolor-deep fixed inset-0 z-50 flex items-center justify-center overflow-hidden"
        exit={{ opacity: 0 }}
        transition={{ duration: 0.8 }}
      >
        <Sparkles count={36} seed={3} />
        <ButterflySwarm count={5} seedBase={2} />

        {/* Véus/cortinas florais que se abrem */}
        <motion.div
          className="absolute inset-y-0 left-0 w-1/2 bg-gradient-to-r from-lilac/70 via-lavender/60 to-transparent"
          animate={opening ? { x: '-100%', opacity: 0 } : { x: 0 }}
          transition={{ duration: 1.6, ease: [0.65, 0, 0.35, 1] }}
        >
          <FlowerCluster side="left" className="top-[8%]" />
          <FlowerCluster side="left" className="bottom-[4%]" />
        </motion.div>
        <motion.div
          className="absolute inset-y-0 right-0 w-1/2 bg-gradient-to-l from-lilac/70 via-lavender/60 to-transparent"
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
              className="absolute h-40 w-40 rounded-full bg-white"
              initial={{ scale: 0, opacity: 0.9 }}
              animate={{ scale: 18, opacity: 0 }}
              transition={{ duration: 1.8, ease: 'easeOut' }}
            />
            {Array.from({ length: 10 }).map((_, i) => {
              const a = (i / 10) * Math.PI * 2;
              return (
                <motion.div
                  key={i}
                  className="absolute"
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
          className="relative z-10 mx-5 w-full max-w-md"
          initial={{ opacity: 0, scale: 0.92 }}
          animate={opening ? { opacity: 0, scale: 1.15, filter: 'blur(8px)' } : { opacity: 1, scale: 1 }}
          transition={{ duration: opening ? 1.2 : 1.6, ease: [0.22, 1, 0.36, 1] }}
        >
          <OrnateFrame className="glass-card cursor-pointer rounded-[2rem] px-8 py-14 text-center sm:px-12">
            <div onClick={open}>
              <motion.p
                className="mb-2 font-sans text-[0.7rem] uppercase tracking-[0.5em] text-plum"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
              >
                Uma noite de conto de fadas
              </motion.p>
              <motion.p
                className="font-numeral text-7xl font-bold tracking-tight text-gold-shine sm:text-8xl"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.9, duration: 1.2 }}
              >
                15
              </motion.p>
              <motion.h1
                className="mt-4 font-serif text-2xl italic leading-snug text-plum-deep sm:text-3xl"
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.2, duration: 1.2 }}
              >
                {invitation.texts.portal}
              </motion.h1>
              <motion.button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  open();
                }}
                className="btn-magic mt-10 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-plum to-[#b393de] px-8 py-4 font-sans text-sm font-medium tracking-[0.25em] text-white shadow-[0_10px_30px_-8px_rgb(152_117_196/0.8)]"
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.6, duration: 1 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.96 }}
              >
                <SparkIcon size={16} />
                {invitation.texts.portalButton}
              </motion.button>
              <motion.p
                className="mt-4 font-sans text-xs tracking-wide text-plum/85"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 2 }}
              >
                Toque no botão acima para entrar
              </motion.p>
            </div>
          </OrnateFrame>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

