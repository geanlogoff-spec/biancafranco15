import { Clock, MapPin, Navigation } from 'lucide-react';
import { invitation } from '../../config/invitation.config';
import { eventParts } from '../../lib/date';
import { BloomingRose } from '../decorative/BloomingRose';
import { ButterflySwarm } from '../decorative/Butterfly';
import { Flourish } from '../decorative/OrnateFrame';
import { Sparkles } from '../decorative/Sparkles';
import { Reveal, Scene, SectionTitle } from '../Scene';

export function Scene5Location() {
  const v = invitation.venue;
  const embed = `https://maps.google.com/maps?q=${encodeURIComponent(v.mapsQuery)}&z=16&output=embed`;
  const directions = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(v.mapsQuery)}`;

  return (
    <Scene
      id="local"
      className="watercolor-deep"
      decor={
        <>
          <Sparkles count={16} seed={41} />
          <ButterflySwarm count={2} seedBase={13} />
        </>
      }
    >
      <SectionTitle eyebrow="Onde a magia acontece" title="O castelo da noite" />

      <Reveal>
        <div className="glass-card relative mx-auto max-w-xl overflow-hidden rounded-[2rem]">
          <div className="px-6 pb-6 pt-10 text-center sm:px-10">
            <MapPin className="mx-auto mb-3 text-gold-deep" size={28} />
            {v.name && <h3 className="font-serif text-4xl font-semibold italic text-plum-deep">{v.name}</h3>}
            <p className="mt-2 font-sans text-xl font-semibold text-plum-deep tabular-nums">{v.address}</p>
            <p className="mt-1 font-sans text-base text-plum">
              {v.district} · {v.city} – {v.state}
            </p>
            <p className="mt-1 font-sans text-sm font-medium tracking-[0.15em] text-plum/85 tabular-nums">CEP {v.zip}</p>
            <Flourish className="my-5" />
            <p className="inline-flex items-center gap-2 font-sans text-base font-medium text-plum-deep tabular-nums">
              <Clock size={18} className="text-gold-deep" /> Início às {eventParts.time}
            </p>
          </div>

          <div className="relative mx-4 mb-4 overflow-hidden rounded-2xl border-4 border-white shadow-inner">
            <iframe
              title={`Mapa: ${v.mapsQuery}`}
              src={embed}
              className="h-72 w-full sm:h-80"
              style={{ border: 0, filter: 'saturate(0.85) hue-rotate(-8deg)' }}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              allowFullScreen
            />
          </div>

          <div className="flex flex-col gap-3 px-6 pb-8 sm:flex-row sm:justify-center">
            <a
              href={directions}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-magic inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-plum to-[#b393de] px-8 py-4 font-sans text-sm font-medium tracking-[0.25em] text-white shadow-[0_10px_30px_-8px_rgb(152_117_196/0.8)] transition active:scale-95"
            >
              <Navigation size={16} /> COMO CHEGAR
            </a>
            <a
              href={v.mapsLink}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 rounded-full border border-plum/40 bg-white/70 px-6 py-4 font-sans text-sm tracking-[0.15em] text-plum-deep transition hover:bg-white"
            >
              <MapPin size={16} /> VER NO MAPA
            </a>
          </div>
          <BloomingRose size={72} color="lilac" className="absolute -right-4 -top-4" />
          <BloomingRose size={56} color="white" className="absolute -left-3 top-10" delay={0.3} />
        </div>
      </Reveal>
    </Scene>
  );
}

