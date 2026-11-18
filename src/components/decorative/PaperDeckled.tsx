import { useId } from 'react';
import { OrnateFrame } from './OrnateFrame';

/**
 * Cartão de papel artesanal de alta gramatura (deckled edge stationery).
 * Projeta duas folhas sobrepostas com borda orgânica, textura de algodão e filetes dourados.
 */
export function PaperDeckled({
  children,
  className = '',
  onClick,
}: {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}) {
  const uid = useId().replace(/:/g, '');
  const clipId = `deckled-${uid}`;

  return (
    <div
      onClick={onClick}
      className={`relative select-none ${onClick ? 'cursor-pointer' : ''} ${className}`}
    >
      {/* Definições SVG: recorte orgânico de papel rasgado à mão */}
      <svg className="pointer-events-none absolute h-0 w-0 overflow-hidden" aria-hidden="true">
        <defs>
          <clipPath id={clipId} clipPathUnits="objectBoundingBox">
            <path
              d="
                M 0.014,0.012
                Q 0.12,0.004 0.24,0.010
                Q 0.38,0.016 0.50,0.007
                Q 0.66,0.002 0.79,0.011
                Q 0.91,0.016 0.986,0.010
                Q 0.996,0.14 0.990,0.28
                Q 0.984,0.44 0.994,0.58
                Q 0.998,0.74 0.988,0.88
                Q 0.994,0.96 0.985,0.989
                Q 0.87,0.997 0.74,0.990
                Q 0.58,0.984 0.44,0.994
                Q 0.28,0.998 0.14,0.989
                Q 0.05,0.995 0.012,0.987
                Q 0.003,0.86 0.010,0.71
                Q 0.016,0.55 0.006,0.40
                Q 0.002,0.24 0.011,0.11
                Z
              "
            />
          </clipPath>
        </defs>
      </svg>

      {/* Folha traseira em vidro lavanda translúcido estilo iOS */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-1 -rotate-2 rounded-sm border border-white/75 bg-gradient-to-br from-white/50 via-[#e9ddfb]/55 to-[#d4bcf5]/55 shadow-[0_24px_54px_-16px_rgba(88,56,138,0.34)] backdrop-blur-xl"
      />

      {/* Wrapper com drop-shadow que acompanha exatamente a borda irregular do recorte */}
      <div className="relative drop-shadow-[0_26px_52px_rgba(88,56,138,0.28)]">
        <div
          style={{
            clipPath: `url(#${clipId})`,
            background:
              'linear-gradient(145deg, rgba(255,255,255,0.72) 0%, rgba(252,248,255,0.52) 52%, rgba(240,229,254,0.58) 100%)',
            backdropFilter: 'blur(26px) saturate(185%) brightness(1.03)',
            WebkitBackdropFilter: 'blur(26px) saturate(185%) brightness(1.03)',
          }}
          className="relative px-5 py-7 sm:px-7 sm:py-9"
        >
          {/* Reflexo especular estilo iOS Liquid Glass nas bordas do recorte */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 shadow-[inset_0_2px_2px_rgba(255,255,255,0.95),inset_0_0_42px_rgba(216,197,162,0.2)]"
          />

          {/* Moldura interna dupla em vidro fosco + dourado */}
          <div className="relative border border-white/75 bg-white/25 p-1.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.85)]">
            <OrnateFrame className="border border-gold/55 bg-white/35 px-5 py-9 text-center backdrop-blur-md sm:px-8 sm:py-11">
              {children}
            </OrnateFrame>
          </div>
        </div>
      </div>
    </div>
  );
}

/** Coroa delicada estilo brasão de papelaria fina */
export function CrownCrest({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 80 42" className={`mx-auto h-8 w-16 ${className}`} aria-hidden="true">
      <g fill="none" stroke="#c9b38a" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 33 L10 15 L26 24 L40 8 L54 24 L70 15 L66 33 Z" fill="rgba(216, 197, 162, 0.16)" />
        <path d="M16 37 H64" strokeWidth="1.6" />
      </g>
      <circle cx="10" cy="13" r="2.2" fill="#d8c5a2" />
      <circle cx="40" cy="6" r="2.6" fill="#d8c5a2" />
      <circle cx="70" cy="13" r="2.2" fill="#d8c5a2" />
      <circle cx="40" cy="24" r="2" fill="#c9afe9" />
    </svg>
  );
}
