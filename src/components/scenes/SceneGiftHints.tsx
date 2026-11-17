import { motion, useReducedMotion } from 'framer-motion';
import { Check, Copy, Gem, Gift, Shirt, Sparkles as SparkleIcon, SprayCan } from 'lucide-react';
import { useState } from 'react';
import { invitation, type GiftHintCategory } from '../../config/invitation.config';
import { BloomingRose, FlowerCluster } from '../decorative/BloomingRose';
import { ButterflySwarm } from '../decorative/Butterfly';
import { Flourish, OrnateFrame } from '../decorative/OrnateFrame';
import { Sparkles } from '../decorative/Sparkles';
import { Reveal, Scene, SectionTitle } from '../Scene';

const CATEGORY_ICON: Record<GiftHintCategory['id'], typeof SparkleIcon> = {
  shoes: SparkleIcon,
  clothes: Shirt,
  beauty: SprayCan,
  accessories: Gem,
  teen: Gift,
};

const ROMAN_CHAPTERS = ['I', 'II', 'III', 'IV', 'V'];

function buildCheatSheet(): string {
  const first = invitation.debutante.name.split(' ')[0];
  const lines = invitation.giftHints.categories.map((cat) => `• ${cat.title}: ${cat.items.join(', ')}`);
  return `✨ Colinha de Presentes — 15 Anos da ${first} ✨\n\n${lines.join('\n')}`;
}

export function SceneGiftHints() {
  const { giftHints } = invitation;
  const reduce = useReducedMotion();
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(buildCheatSheet());
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      /* fallback silencioso se clipboard não estiver disponível */
    }
  };

  return (
    <Scene
      id="presentes"
      className="watercolor"
      decor={
        <>
          <Sparkles count={22} seed={61} />
          <ButterflySwarm count={3} seedBase={15} />
          <FlowerCluster side="left" className="-top-6 opacity-75" />
          <FlowerCluster side="right" className="-bottom-6 opacity-75" />
        </>
      }
    >
      <SectionTitle eyebrow={giftHints.eyebrow} title={giftHints.title} />

      <Reveal className="mx-auto mb-12 max-w-xl text-center">
        <p className="font-serif text-xl italic leading-relaxed text-plum-deep sm:text-2xl">{giftHints.subtitle}</p>
        <Flourish className="mt-7" />
      </Reveal>

      <div className="relative">
        <div className="pointer-events-none absolute inset-x-10 top-1/2 -z-10 h-72 -translate-y-1/2 rounded-full bg-lavender/45 blur-3xl" />

        <div className="grid gap-6 md:grid-cols-2">
          {giftHints.categories.map((cat, idx) => {
            const Icon = CATEGORY_ICON[cat.id];
            const isLastOdd = giftHints.categories.length % 2 === 1 && idx === giftHints.categories.length - 1;
            const chapter = ROMAN_CHAPTERS[idx] ?? String(idx + 1);

            return (
              <motion.article
                key={cat.id}
                className={`glass-card group relative flex flex-col justify-between overflow-hidden rounded-[2rem] p-7 sm:p-8 ${
                  isLastOdd ? 'md:col-span-2 md:mx-auto md:w-full md:max-w-xl' : ''
                }`}
                initial={{ opacity: 0, y: reduce ? 0 : 28 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.9, delay: idx * 0.08, ease: [0.22, 1, 0.36, 1] }}
                whileHover={reduce ? undefined : { y: -4 }}
              >
                {/* Filete dourado superior */}
                <span
                  aria-hidden
                  className="pointer-events-none absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-gold to-transparent"
                />

                <div>
                  <div className="mb-4 flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3.5">
                      <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-gold/70 bg-white text-plum-deep shadow-sm ring-4 ring-lavender/50 transition group-hover:ring-lilac/40">
                        <Icon size={20} />
                      </span>
                      <div>
                        <span className="font-sans block text-[0.65rem] font-medium uppercase tracking-[0.25em] text-plum/80">
                          Pista {chapter}
                        </span>
                        <h3 className="font-serif text-[1.65rem] font-semibold italic leading-tight text-plum-deep">
                          {cat.title}
                        </h3>
                      </div>
                    </div>

                    <span
                      aria-hidden
                      className="font-serif text-2xl font-semibold italic text-gold-deep/45 select-none"
                    >
                      {chapter}
                    </span>
                  </div>

                  <p className="font-sans text-[0.92rem] leading-relaxed text-plum-deep/85">{cat.description}</p>
                </div>

                <div className="mt-6">
                  <div className="mb-4 h-px w-full bg-gradient-to-r from-gold/55 via-gold/20 to-transparent" />
                  <div className="flex flex-wrap gap-2">
                    {cat.items.map((item) => (
                      <span
                        key={item}
                        className="font-sans inline-flex items-center rounded-full border border-gold/65 bg-gradient-to-b from-white to-lavender/45 px-4 py-1.5 text-xs font-semibold tracking-wide text-plum-deep tabular-nums shadow-xs transition group-hover:border-gold"
                      >
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
              </motion.article>
            );
          })}
        </div>
      </div>

      <Reveal delay={0.2} className="mt-12">
        <div className="relative mx-auto max-w-2xl">
          <OrnateFrame className="glass-card rounded-[2rem] px-6 py-9 text-center sm:px-10 sm:py-10">
            <p className="font-sans text-[0.68rem] font-semibold uppercase tracking-[0.35em] text-plum">
              Colinha Oficial de Tamanhos
            </p>

            <div className="mx-auto mt-5 grid max-w-lg grid-cols-3 divide-x divide-gold/40 rounded-2xl border border-gold/45 bg-white/75 py-4 shadow-xs">
              <div className="px-2">
                <p className="font-sans text-[0.65rem] font-medium uppercase tracking-[0.15em] text-plum">Calçados</p>
                <p className="font-numeral mt-1 text-2xl font-bold text-gold-shine sm:text-3xl">37</p>
              </div>
              <div className="px-2">
                <p className="font-sans text-[0.65rem] font-medium uppercase tracking-[0.15em] text-plum">Blusas &amp; Vestidos</p>
                <p className="font-serif mt-1 text-2xl font-semibold italic text-plum-deep sm:text-3xl">M / Único</p>
              </div>
              <div className="px-2">
                <p className="font-sans text-[0.65rem] font-medium uppercase tracking-[0.15em] text-plum">Calça</p>
                <p className="font-numeral mt-1 text-2xl font-bold text-gold-shine sm:text-3xl">36</p>
              </div>
            </div>

            <Flourish className="my-6" />

            <p className="mx-auto max-w-md font-serif text-lg italic leading-relaxed text-plum-deep sm:text-xl">
              {giftHints.footerNote}
            </p>

            <motion.button
              type="button"
              onClick={handleCopy}
              whileTap={{ scale: 0.97 }}
              className="btn-magic mt-6 inline-flex min-h-[46px] items-center justify-center gap-2 rounded-full border border-gold/70 bg-gradient-to-r from-plum to-[#b393de] px-7 py-3.5 font-sans text-xs font-semibold uppercase tracking-[0.2em] text-white shadow-[0_10px_28px_-10px_rgb(152_117_196/0.75)]"
            >
              {copied ? <Check size={15} /> : <Copy size={15} />}
              {copied ? 'Colinha copiada!' : 'Copiar colinha de tamanhos'}
            </motion.button>
          </OrnateFrame>

          <BloomingRose size={64} color="lilac" className="absolute -bottom-5 -left-5" delay={0.3} />
          <BloomingRose size={56} color="white" className="absolute -right-4 -top-5" delay={0.5} />
        </div>
      </Reveal>
    </Scene>
  );
}
