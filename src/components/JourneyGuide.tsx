import { AnimatePresence, motion, useReducedMotion, useScroll, useSpring } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import { useEffect, useState } from 'react';

const STEPS = [
  { id: 'debutante', label: 'A Debutante' },
  { id: 'convite', label: 'O Convite' },
  { id: 'data', label: 'Data e Horário' },
  { id: 'local', label: 'Local da Festa' },
  { id: 'presentes', label: 'Dicas de Presentes' },
  { id: 'rsvp', label: 'Confirmar Presença' },
  { id: 'fim', label: 'Encerramento' },
];

export function JourneyGuide() {
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 140, damping: 24, restDelta: 0.001 });
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const elements = STEPS.map((s) => document.getElementById(s.id)).filter(Boolean) as HTMLElement[];
    if (!elements.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible?.target?.id) {
          const idx = STEPS.findIndex((s) => s.id === visible.target.id);
          if (idx !== -1) setActiveIndex(idx);
        }
      },
      { threshold: [0.2, 0.45, 0.7] },
    );

    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  const currentStep = STEPS[activeIndex];
  const nextStep = activeIndex < STEPS.length - 1 ? STEPS[activeIndex + 1] : null;
  const isNextRsvp = nextStep?.id === 'rsvp';

  const handleNext = () => {
    if (!nextStep) return;
    const el = document.getElementById(nextStep.id);
    if (el) {
      el.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
    }
  };

  return (
    <>
      {/* Barra de progresso fina no topo */}
      <div className="pointer-events-none fixed inset-x-0 top-0 z-40 h-[3px] bg-lavender/60" aria-hidden>
        <motion.div
          className="h-full origin-left bg-gradient-to-r from-plum via-lilac to-gold"
          style={{ scaleX: reduce ? scrollYProgress : scaleX }}
        />
      </div>

      {/* Pílula discreta estilo Dynamic Island em vidro fosco */}
      <div className="pointer-events-none fixed inset-x-0 top-3.5 z-30 flex justify-center px-4">
        <div className="ios-glass-pill rounded-full px-4 py-1.5 font-sans text-[0.7rem] font-medium tracking-[0.14em] text-plum-deep tabular-nums">
          <span className="font-semibold text-plum">
            {activeIndex + 1} de {STEPS.length}
          </span>
          <span className="mx-2 text-gold-deep">·</span>
          <span>{currentStep.label}</span>
        </div>
      </div>

      {/* Botão guiado em cápsula Liquid Glass */}
      <AnimatePresence>
        {nextStep && (
          <motion.div
            key={nextStep.id}
            className="pointer-events-none fixed bottom-5 left-4 right-20 z-30 flex justify-start sm:left-1/2 sm:right-auto sm:-translate-x-1/2 sm:justify-center"
            style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 12 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
          >
            <button
              type="button"
              onClick={handleNext}
              className={`pointer-events-auto inline-flex min-h-[46px] max-w-full items-center gap-2 rounded-full px-5 py-2.5 font-sans text-xs font-semibold tracking-wide transition active:scale-95 ${
                isNextRsvp
                  ? 'border border-white/60 bg-gradient-to-r from-plum/90 to-[#b393de]/90 text-white shadow-[0_14px_32px_-8px_rgba(110,79,153,0.65)] backdrop-blur-xl'
                  : 'ios-glass-pill text-plum-deep hover:brightness-105'
              }`}
            >
              <span className="truncate">
                {isNextRsvp ? `Ir para ${nextStep.label}` : `Continuar: ${nextStep.label}`}
              </span>
              <ChevronDown size={16} className={reduce ? 'shrink-0' : 'shrink-0 animate-bounce'} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

