import { motion, useReducedMotion } from 'framer-motion';
import { invitation } from '../../config/invitation.config';
import { BloomingRose } from '../decorative/BloomingRose';
import { ButterflySwarm } from '../decorative/Butterfly';
import { Flourish } from '../decorative/OrnateFrame';
import { Sparkles } from '../decorative/Sparkles';
import { Reveal, Scene } from '../Scene';

/** Nome aparece letra a letra, como se estivesse sendo escrito à mão */
function HandwrittenName({ text }: { text: string }) {
  const reduce = useReducedMotion();
  return (
    <h1 className="font-script text-6xl leading-tight text-plum-deep sm:text-8xl" aria-label={text}>
      {text.split('').map((ch, i) => (
        <motion.span
          key={i}
          aria-hidden
          className="inline-block"
          initial={{ opacity: 0, y: reduce ? 0 : 14, filter: reduce ? 'none' : 'blur(4px)' }}
          whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 + i * 0.09, duration: 0.6, ease: 'easeOut' }}
        >
          {ch === ' ' ? '\u00A0' : ch}
        </motion.span>
      ))}
    </h1>
  );
}

export function Scene2Debutante() {
  const { debutante, texts } = invitation;
  const reduce = useReducedMotion();
  return (
    <Scene
      id="debutante"
      className="watercolor"
      decor={
        <>
          <Sparkles count={20} seed={11} />
          <ButterflySwarm count={3} seedBase={5} />
        </>
      }
    >
      <div className="flex flex-col items-center text-center">
        <Reveal>
          <p className="font-sans text-xs uppercase tracking-[0.45em] text-plum">Meus</p>
        </Reveal>
        <motion.p
          className="font-numeral text-[7rem] font-bold leading-none tracking-tight text-gold-shine sm:text-[10rem]"
          initial={{ opacity: 0, scale: reduce ? 1 : 0.6 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1.4, ease: [0.22, 1, 0.36, 1] }}
        >
          15
        </motion.p>
        <p className="mt-1 mb-6 font-sans text-xs font-medium uppercase tracking-[0.45em] text-plum">anos</p>

        <HandwrittenName text={debutante.name} />
        <Flourish className="my-8" />

        {/* Moldura floral com a foto/ilustração */}
        <motion.div
          className="relative my-6"
          initial={{ opacity: 0, clipPath: reduce ? 'inset(0)' : 'circle(0% at 50% 50%)' }}
          whileInView={{ opacity: 1, clipPath: 'circle(75% at 50% 50%)' }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 1.8, ease: [0.65, 0, 0.35, 1] }}
        >
          <div className="relative h-[26rem] w-[19.5rem] overflow-hidden rounded-t-full border-[6px] border-white shadow-[0_30px_70px_-25px_rgb(110_79_153/0.6)] outline outline-1 outline-offset-8 outline-gold sm:h-[32rem] sm:w-[24rem]">
            <img
              src={debutante.photo}
              alt={debutante.photoAlt}
              width={768}
              height={1024}
              decoding="async"
              className="h-full w-full object-cover object-top"
            />
          </div>
          <BloomingRose size={110} color="lilac" className="absolute -bottom-8 -left-10" delay={0.6} />
          <BloomingRose size={80} color="white" className="absolute -bottom-4 left-10" delay={0.9} rotate={25} />
          <BloomingRose size={96} color="plum" className="absolute -right-8 -top-2" delay={1.1} />
          <BloomingRose size={60} color="white" className="absolute -right-4 top-20" delay={1.3} />
        </motion.div>

        <Reveal delay={0.2} className="mt-12 max-w-md">
          <p className="font-serif text-2xl italic leading-relaxed text-plum-deep sm:text-3xl">“{texts.debutanteQuote}”</p>
        </Reveal>
      </div>
    </Scene>
  );
}

