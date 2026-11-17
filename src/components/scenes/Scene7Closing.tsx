import { motion, useReducedMotion } from 'framer-motion';
import { ArrowUp, Lock } from 'lucide-react';
import { invitation } from '../../config/invitation.config';
import { BloomingRose, FlowerCluster } from '../decorative/BloomingRose';
import { ButterflySwarm } from '../decorative/Butterfly';
import { Flourish } from '../decorative/OrnateFrame';
import { Sparkles } from '../decorative/Sparkles';
import { Reveal, Scene } from '../Scene';

export function Scene7Closing() {
  const reduce = useReducedMotion();
  return (
    <Scene
      id="fim"
      className="watercolor-deep min-h-[100dvh]"
      decor={
        <>
          <Sparkles count={40} seed={71} />
          <ButterflySwarm count={6} seedBase={17} />
          <FlowerCluster side="left" className="bottom-0" />
          <FlowerCluster side="right" className="bottom-0" />
        </>
      }
    >
      {/* Brilho suave de luar */}
      <motion.div
        className="pointer-events-none absolute left-1/2 top-1/2 -z-0 h-[28rem] w-[28rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/60 blur-3xl"
        animate={reduce ? undefined : { scale: [1, 1.12, 1], opacity: [0.6, 0.9, 0.6] }}
        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
      />
      <div className="relative text-center">
        <Reveal>
          <p className="mx-auto max-w-lg font-serif text-3xl italic leading-relaxed text-plum-deep sm:text-4xl">“{invitation.texts.closing}”</p>
        </Reveal>
        <Reveal delay={0.3}>
          <Flourish className="my-10" />
          <p className="font-script text-6xl text-plum-deep sm:text-7xl">{invitation.debutante.name}</p>
          <p className="font-numeral mt-2 text-8xl font-bold tracking-tight text-gold-shine sm:text-9xl">15</p>
        </Reveal>
        <Reveal delay={0.5}>
          <div className="my-6 flex justify-center gap-2">
            <BloomingRose size={44} color="white" />
            <BloomingRose size={54} color="lilac" delay={0.2} />
            <BloomingRose size={44} color="white" delay={0.4} />
          </div>
          <div className="mt-4 flex flex-col items-center">
            <button
              onClick={() => window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' })}
              className="btn-magic inline-flex min-h-[46px] items-center gap-2 rounded-full border border-gold bg-white/90 px-7 py-3.5 font-sans text-xs font-semibold uppercase tracking-[0.22em] text-plum-deep shadow-lg transition hover:bg-white"
            >
              <ArrowUp size={16} /> VOLTAR AO INÍCIO
            </button>

            <a
              href="#admin"
              className="mt-8 inline-flex items-center gap-1.5 rounded-full border border-plum/20 bg-white/50 px-4 py-1.5 font-sans text-[0.68rem] font-medium uppercase tracking-[0.2em] text-plum/75 backdrop-blur-sm transition hover:border-plum/40 hover:bg-white/80 hover:text-plum-deep"
            >
              <Lock size={12} />
              <span>Acesso Admin</span>
            </a>
          </div>
        </Reveal>
      </div>
    </Scene>
  );
}

