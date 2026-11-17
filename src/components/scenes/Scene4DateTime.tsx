import { AnimatePresence, motion } from 'framer-motion';
import { CalendarPlus, Clock } from 'lucide-react';
import { invitation } from '../../config/invitation.config';
import { eventDate, eventParts, useCountdown } from '../../lib/date';
import { FlowerCluster } from '../decorative/BloomingRose';
import { Flourish, OrnateFrame } from '../decorative/OrnateFrame';
import { Sparkles } from '../decorative/Sparkles';
import { Reveal, Scene, SectionTitle } from '../Scene';

function Unit({ value, label }: { value: number; label: string }) {
  const v = String(value).padStart(2, '0');
  return (
    <div className="glass-card flex w-[4.5rem] flex-col items-center rounded-2xl py-3 sm:w-24 sm:py-5">
      <div className="relative flex h-11 items-center justify-center overflow-hidden sm:h-14">
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.span
            key={v}
            className="block font-sans text-3xl font-bold tracking-tight text-plum-deep tabular-nums sm:text-4xl"
            initial={{ y: -30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 30, opacity: 0 }}
            transition={{ duration: 0.45 }}
          >
            {v}
          </motion.span>
        </AnimatePresence>
      </div>
      <span className="mt-1 font-sans text-[0.65rem] font-medium uppercase tracking-[0.2em] text-plum">{label}</span>
    </div>
  );
}

function googleCalendarLink() {
  const fmt = (d: Date) => d.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
  const end = new Date(eventDate.getTime() + 5 * 3_600_000);
  const v = invitation.venue;
  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: `15 anos de ${invitation.debutante.name}`,
    dates: `${fmt(eventDate)}/${fmt(end)}`,
    location: `${v.name ? v.name + ', ' : ''}${v.mapsQuery}`,
    details: 'Uma noite de conto de fadas ✨',
  });
  return `https://calendar.google.com/calendar/render?${params}`;
}

export function Scene4DateTime() {
  const c = useCountdown();
  return (
    <Scene
      id="data"
      className="watercolor"
      decor={
        <>
          <Sparkles count={18} seed={31} />
          <FlowerCluster side="left" className="-bottom-6 opacity-80" />
          <FlowerCluster side="right" className="-top-4 opacity-80" />
        </>
      }
    >
      <SectionTitle eyebrow="Guarde esta data" title="O grande dia" />

      <Reveal>
        <OrnateFrame className="glass-card mx-auto max-w-md rounded-[2rem] px-6 py-10 text-center">
          <p className="font-sans text-xs font-medium uppercase tracking-[0.35em] text-plum">{eventParts.weekday}</p>
          <div className="my-3 flex items-center justify-center gap-5">
            <span className="h-px w-12 bg-gold" />
            <span className="font-sans text-7xl font-bold leading-none tracking-tight text-gold-shine tabular-nums sm:text-8xl">
              {eventParts.day}
            </span>
            <span className="h-px w-12 bg-gold" />
          </div>
          <p className="font-serif text-4xl font-semibold italic text-plum-deep">{eventParts.month}</p>
          <p className="mt-1 font-sans text-lg font-medium tracking-[0.35em] text-plum tabular-nums">{eventParts.year}</p>
          <Flourish className="my-6" />
          <p className="inline-flex items-center gap-2 font-sans text-lg font-medium text-plum-deep tabular-nums">
            <Clock size={18} className="text-gold-deep" /> às {eventParts.time}
          </p>
        </OrnateFrame>
      </Reveal>

      <Reveal delay={0.2} className="mt-12 text-center">
        {c.done ? (
          <p className="font-serif text-4xl italic text-plum-deep">Chegou o grande dia! ✨</p>
        ) : (
          <>
            <p className="mb-5 font-serif text-xl italic text-plum-deep">Faltam apenas...</p>
            <div className="flex justify-center gap-2 sm:gap-4">
              <Unit value={c.days} label="dias" />
              <Unit value={c.hours} label="horas" />
              <Unit value={c.minutes} label="min" />
              <Unit value={c.seconds} label="seg" />
            </div>
          </>
        )}
        <a
          href={googleCalendarLink()}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-8 inline-flex items-center gap-2 rounded-full border border-plum/40 bg-white/70 px-6 py-3 font-sans text-sm tracking-[0.15em] text-plum-deep transition hover:bg-white"
        >
          <CalendarPlus size={16} /> SALVAR NA AGENDA
        </a>
      </Reveal>
    </Scene>
  );
}

