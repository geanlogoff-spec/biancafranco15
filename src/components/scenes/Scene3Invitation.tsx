import { AnimatePresence, motion, useInView, useReducedMotion } from 'framer-motion';
import { RotateCcw, Sparkles as SparkIcon } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { invitation } from '../../config/invitation.config';
import { BloomingRose } from '../decorative/BloomingRose';
import { ButterflySwarm } from '../decorative/Butterfly';
import { Flourish, OrnateFrame } from '../decorative/OrnateFrame';
import { CrownCrest } from '../decorative/PaperDeckled';
import { Sparkles } from '../decorative/Sparkles';
import { Scene, SectionTitle } from '../Scene';

/** Lacre de cera dourada em relevo com borda orgânica e o numeral 15 */
function WaxSeal({ breaking }: { breaking: boolean }) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      className="relative flex h-20 w-20 items-center justify-center sm:h-24 sm:w-24"
      animate={
        breaking
          ? { scale: [1, 1.18, 0], rotate: [0, -12, 35], opacity: [1, 1, 0] }
          : reduce
            ? undefined
            : { scale: [1, 1.05, 1] }
      }
      transition={
        breaking
          ? { duration: 0.45, ease: 'easeInOut' }
          : { duration: 2.4, repeat: Infinity, ease: 'easeInOut' }
      }
    >
      <svg viewBox="0 0 100 100" className="h-full w-full drop-shadow-[0_10px_18px_rgba(110,79,153,0.45)]" aria-hidden="true">
        <defs>
          <radialGradient id="wax-gold-grad" cx="35%" cy="30%" r="75%">
            <stop offset="0%" stopColor="#fff3d6" />
            <stop offset="35%" stopColor="#dfc798" />
            <stop offset="78%" stopColor="#b89861" />
            <stop offset="100%" stopColor="#8d6f3d" />
          </radialGradient>
        </defs>
        {/* Borda orgânica de cera derretida */}
        <path
          d="M50,4 C59,3 66,8 73,11 C81,15 89,22 92,31 C95,39 97,46 95,55 C94,63 92,72 86,79 C80,86 72,92 62,94 C54,96 45,97 36,93 C28,90 19,86 14,78 C8,70 4,62 5,52 C5,43 7,34 12,26 C18,18 25,11 35,8 C41,5 45,4 50,4 Z"
          fill="url(#wax-gold-grad)"
          stroke="#f5e6c4"
          strokeWidth="1.2"
        />
        {/* Anel interno em baixo-relevo */}
        <circle cx="50" cy="50" r="34" fill="none" stroke="#8a6c3a" strokeWidth="1.2" opacity="0.55" />
        <circle
          cx="50"
          cy="50"
          r="31"
          fill="none"
          stroke="#fff6e3"
          strokeWidth="1"
          strokeDasharray="2 3"
          opacity="0.7"
        />
      </svg>
      <span className="font-numeral pointer-events-none absolute text-2xl font-bold tracking-tight text-white drop-shadow-[0_1px_2px_rgba(92,66,28,0.65)] sm:text-3xl">
        15
      </span>
    </motion.div>
  );
}

/** CENA 3 — Envelope elegante que se abre revelando a carta do convite para leitura */
export function Scene3Invitation() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.25 });
  const reduce = useReducedMotion();
  const [stage, setStage] = useState<'closed' | 'opening' | 'open'>('closed');

  const triggerOpen = () => {
    if (stage !== 'closed') return;
    if (reduce) {
      setStage('open');
      return;
    }
    setStage('opening');
    window.setTimeout(() => setStage('open'), 850);
  };

  useEffect(() => {
    if (!inView || stage !== 'closed') return;
    const t = window.setTimeout(() => triggerOpen(), reduce ? 150 : 1800);
    return () => window.clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inView, reduce]);

  const firstName = invitation.debutante.name.split(' ')[0];

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

      <div ref={ref} className="relative mx-auto w-full max-w-xl" style={{ perspective: 1600 }}>
        <AnimatePresence mode="wait">
          {stage !== 'open' ? (
            /* ================= ESTADO FECHADO / ABRINDO ================= */
            <motion.div
              key="envelope-closed"
              role="button"
              tabIndex={0}
              aria-label="Abrir envelope do convite"
              onClick={triggerOpen}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  triggerOpen();
                }
              }}
              initial={{ opacity: 0, y: 24, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.96, filter: 'blur(6px)' }}
              transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
              className="group relative mx-auto max-w-md cursor-pointer select-none py-4"
            >
              {/* Folha de papel iluminada saindo ligeiramente ao abrir */}
              <motion.div
                className="pointer-events-none absolute inset-x-5 top-6 h-40 rounded-t-2xl border border-gold/60 bg-white/95 shadow-lg"
                initial={{ y: 12, opacity: 0 }}
                animate={stage === 'opening' ? { y: -38, opacity: 1 } : { y: 12, opacity: 0 }}
                transition={{ duration: 0.65, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
              />

              {/* Corpo principal do envelope em Liquid Glass + Papelaria */}
              <div className="glass-card relative overflow-visible rounded-[1.75rem] p-2">
                <div
                  className="relative h-[18.5rem] w-full overflow-hidden rounded-[1.35rem] border border-white/80 sm:h-[20.5rem]"
                  style={{
                    background:
                      'linear-gradient(155deg, rgba(255,255,255,0.88) 0%, rgba(245,237,254,0.84) 55%, rgba(227,209,249,0.88) 100%)',
                    boxShadow: 'inset 0 2px 3px rgba(255,255,255,0.95), inset 0 -16px 32px rgba(152,117,196,0.14)',
                  }}
                >
                  {/* Forro interno brilhante visível quando a aba gira */}
                  <div
                    className="absolute inset-x-0 top-0 h-1/2"
                    style={{
                      background:
                        'radial-gradient(ellipse at 50% 25%, rgba(255,255,255,0.95), rgba(233,221,251,0.6) 75%)',
                    }}
                  />

                  {/* Fita horizontal dourada/acetinada */}
                  <motion.div
                    className="pointer-events-none absolute inset-x-0 top-[53%] h-3 -translate-y-1/2 border-y border-gold/55 bg-gradient-to-r from-gold/25 via-white/75 to-gold/25"
                    animate={stage === 'opening' ? { opacity: 0, scaleX: 1.08 } : { opacity: 1 }}
                    transition={{ duration: 0.35 }}
                  />

                  {/* Abas laterais e inferior chanfradas do envelope */}
                  <svg
                    viewBox="0 0 400 260"
                    preserveAspectRatio="none"
                    className="pointer-events-none absolute inset-0 h-full w-full"
                    aria-hidden="true"
                  >
                    <defs>
                      <linearGradient id="env-side" x1="0" y1="0" x2="1" y2="1">
                        <stop offset="0%" stopColor="#ffffff" stopOpacity="0.72" />
                        <stop offset="100%" stopColor="#e5d4fa" stopOpacity="0.68" />
                      </linearGradient>
                      <linearGradient id="env-bottom" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#f8f2ff" stopOpacity="0.92" />
                        <stop offset="100%" stopColor="#e3cffb" stopOpacity="0.95" />
                      </linearGradient>
                    </defs>
                    {/* Aba esquerda e direita */}
                    <path d="M0 0 L195 135 L0 260 Z" fill="url(#env-side)" stroke="rgba(216,197,162,0.65)" strokeWidth="1" />
                    <path d="M400 0 L205 135 L400 260 Z" fill="url(#env-side)" stroke="rgba(216,197,162,0.65)" strokeWidth="1" />
                    {/* Aba inferior */}
                    <path
                      d="M0 260 L184 126 Q200 116 216 126 L400 260 Z"
                      fill="url(#env-bottom)"
                      stroke="#d8c5a2"
                      strokeWidth="1.2"
                    />
                  </svg>

                  {/* Aba superior triangular que abre em 3D */}
                  <motion.div
                    className="pointer-events-none absolute inset-x-0 top-0 z-10 h-[58%] origin-top"
                    style={{ transformStyle: 'preserve-3d' }}
                    animate={stage === 'opening' ? { rotateX: -175 } : { rotateX: 0 }}
                    transition={{ duration: 0.72, delay: 0.12, ease: [0.65, 0, 0.35, 1] }}
                  >
                    <svg
                      viewBox="0 0 400 155"
                      preserveAspectRatio="none"
                      className="h-full w-full drop-shadow-[0_10px_14px_rgba(110,79,153,0.18)]"
                      aria-hidden="true"
                    >
                      <defs>
                        <linearGradient id="env-flap" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.96" />
                          <stop offset="100%" stopColor="#eadcfb" stopOpacity="0.98" />
                        </linearGradient>
                      </defs>
                      <path
                        d="M0 0 L400 0 L216 142 Q200 154 184 142 Z"
                        fill="url(#env-flap)"
                        stroke="#d8c5a2"
                        strokeWidth="1.4"
                      />
                      {/* Filete dourado interno na aba */}
                      <path
                        d="M18 8 L382 8 L210 134 Q200 141 190 134 Z"
                        fill="none"
                        stroke="rgba(216,197,162,0.55)"
                        strokeWidth="1"
                      />
                    </svg>
                  </motion.div>

                  {/* Lacre de cera dourada central */}
                  <div className="absolute left-1/2 top-[53%] z-20 -translate-x-1/2 -translate-y-1/2">
                    <WaxSeal breaking={stage === 'opening'} />
                  </div>

                  {/* Texto do remetente e convite ao toque na parte inferior do envelope */}
                  <motion.div
                    className="absolute inset-x-0 bottom-4 z-20 px-4 text-center"
                    animate={stage === 'opening' ? { opacity: 0, y: 8 } : { opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <p className="font-script text-2xl text-plum-deep sm:text-3xl">
                      Para você, com carinho
                    </p>
                    <span className="mt-1 inline-flex items-center gap-1.5 rounded-full border border-gold/65 bg-white/85 px-4 py-1 font-sans text-[0.66rem] font-semibold uppercase tracking-[0.22em] text-plum-deep shadow-xs transition group-hover:bg-white">
                      <SparkIcon size={12} className="text-gold-deep" />
                      Toque no lacre para abrir
                    </span>
                  </motion.div>
                </div>

                <BloomingRose size={64} color="lilac" className="absolute -left-5 -top-5 z-20" delay={0.1} />
                <BloomingRose size={52} color="white" className="absolute -bottom-4 -right-4 z-20" delay={0.25} />
              </div>
            </motion.div>
          ) : (
            /* ================= ESTADO ABERTO (CARTA PARA LEITURA) ================= */
            <motion.div
              key="letter-open"
              initial={{ opacity: 0, y: 36, scale: 0.94 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.95 }}
              transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
              className="relative"
            >
              <div className="glass-card relative rounded-[2.1rem] p-2.5 sm:p-3.5">
                <OrnateFrame className="relative overflow-hidden rounded-[1.6rem] border border-gold/55 bg-white/75 px-6 py-10 text-center shadow-[inset_0_1px_0_rgba(255,255,255,0.95)] backdrop-blur-md sm:px-12 sm:py-12">
                  {/* Marca d'água delicada "15" ao fundo da carta */}
                  <span
                    aria-hidden="true"
                    className="font-numeral pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-[11rem] font-bold leading-none text-plum/[0.045] select-none sm:text-[14rem]"
                  >
                    15
                  </span>

                  <div className="relative z-10">
                    <CrownCrest className="mb-2" />
                    <p className="font-sans text-[0.65rem] font-semibold uppercase tracking-[0.38em] text-plum">
                      Convite Oficial · {firstName} 15 Anos
                    </p>

                    <p className="mt-4 font-script text-4xl text-plum-deep sm:text-5xl">
                      Querido(a) convidado(a),
                    </p>

                    <Flourish className="my-6" />

                    <div className="mx-auto max-w-md space-y-5">
                      {invitation.texts.invitation.map((paragraph, i) => (
                        <motion.p
                          key={i}
                          className="font-serif text-[1.28rem] font-medium leading-[1.8] text-plum-deep sm:text-[1.45rem]"
                          initial={{ opacity: 0, y: reduce ? 0 : 12 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.25 + i * 0.28, duration: 0.75, ease: 'easeOut' }}
                        >
                          {paragraph}
                        </motion.p>
                      ))}
                    </div>

                    <motion.div
                      className="mt-8 flex flex-col items-center"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.85, duration: 0.8 }}
                    >
                      <span className="font-sans text-[0.66rem] font-medium uppercase tracking-[0.3em] text-plum/80">
                        Com amor,
                      </span>
                      <p className="mt-1 inline-block px-2 py-3 font-script text-5xl leading-[1.4] text-gold-shine sm:text-6xl">
                        {invitation.debutante.name}
                      </p>
                    </motion.div>
                  </div>
                </OrnateFrame>

                <BloomingRose size={72} color="lilac" className="absolute -left-6 -top-6 z-20" delay={0.15} />
                <BloomingRose size={58} color="white" className="absolute -bottom-5 -right-4 z-20" delay={0.35} />
              </div>

              <div className="mt-5 text-center">
                <button
                  type="button"
                  onClick={() => setStage('closed')}
                  className="ios-glass-pill inline-flex min-h-[40px] items-center gap-2 rounded-full px-5 py-2 font-sans text-[0.7rem] font-semibold uppercase tracking-[0.2em] text-plum-deep transition hover:brightness-105"
                >
                  <RotateCcw size={13} /> Fechar envelope
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </Scene>
  );
}
