import { AnimatePresence, motion } from 'framer-motion';
import {
  ArrowUp,
  Calendar,
  Gift,
  Heart,
  MapPin,
  Menu,
  Music,
  ScrollText,
  Sparkles,
  UserCheck,
  X,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { invitation } from '../config/invitation.config';

interface Props {
  playing: boolean;
  onToggleMusic: () => void;
}

const SECTIONS = [
  { id: 'debutante', label: 'Debutante', Icon: Sparkles },
  { id: 'convite', label: 'O Convite', Icon: ScrollText },
  { id: 'data', label: 'Data e Horário', Icon: Calendar },
  { id: 'local', label: 'Local da Festa', Icon: MapPin },
  { id: 'presentes', label: 'Dicas de Presentes', Icon: Gift },
  { id: 'rsvp', label: 'Confirmar Presença', Icon: UserCheck },
  { id: 'fim', label: 'Encerramento', Icon: Heart },
];

const btnBase =
  'flex h-12 w-12 items-center justify-center rounded-full transition active:scale-90';
const btn = `${btnBase} ios-glass-pill text-plum-deep hover:brightness-105`;
const btnActive = `${btnBase} border border-white/60 bg-gradient-to-br from-plum to-[#b393de] text-white shadow-[0_10px_28px_-8px_rgba(110,79,153,0.6)]`;

export function FloatingControls({ playing, onToggleMusic }: Props) {
  const [showTop, setShowTop] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('debutante');

  useEffect(() => {
    const onScroll = () => setShowTop(window.scrollY > window.innerHeight * 0.5);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const elements = SECTIONS.map((s) => document.getElementById(s.id)).filter(Boolean) as HTMLElement[];
    if (!elements.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible?.target?.id) {
          setActiveSection(visible.target.id);
        }
      },
      { threshold: [0.25, 0.5, 0.75] },
    );

    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  const navigateTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    setMenuOpen(false);
  };

  return (
    <div
      className="fixed bottom-5 right-4 z-40 flex items-end gap-3"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      {/* Véu por trás do menu: isola o texto da página e fecha ao tocar fora */}
      <AnimatePresence>
        {menuOpen && (
          <motion.button
            type="button"
            aria-label="Fechar menu das seções"
            className="section-menu-scrim fixed inset-0 -z-10 cursor-default"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={() => setMenuOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Submenu lateral das seções */}
      <AnimatePresence>
        {menuOpen && (
          <motion.nav
            aria-label="Navegação das seções do convite"
            initial={{ opacity: 0, x: 16, scale: 0.94 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 16, scale: 0.94 }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            className="section-menu-panel w-56 rounded-2xl p-2.5"
          >
            <p className="mb-1.5 border-b border-gold/40 px-2.5 pb-1.5 font-sans text-[0.68rem] font-semibold uppercase tracking-[0.2em] text-plum">
              Ir para seção
            </p>
            <ul className="space-y-1">
              {SECTIONS.map(({ id, label, Icon }) => {
                const isActive = activeSection === id;
                return (
                  <li key={id}>
                    <button
                      type="button"
                      onClick={() => navigateTo(id)}
                      className={`flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-left font-sans text-xs font-medium transition ${
                        isActive
                          ? 'bg-gradient-to-r from-plum to-[#b393de] text-white shadow-sm'
                          : 'text-plum-deep hover:bg-lavender'
                      }`}
                    >
                      <Icon size={14} className="shrink-0" />
                      <span className="truncate">{label}</span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </motion.nav>
        )}
      </AnimatePresence>

      {/* Pilha lateral de controles */}
      <div className="flex flex-col items-end gap-2.5">
        {invitation.audio.musicUrl && (
          <button className={btn} onClick={onToggleMusic} aria-label={playing ? 'Pausar música' : 'Tocar música'} title="Música">
            {playing ? (
              <span className="flex h-4 items-end gap-[3px]">
                {[0, 1, 2].map((i) => (
                  <motion.span
                    key={i}
                    className="w-[3px] rounded bg-plum"
                    animate={{ height: ['30%', '100%', '45%', '80%', '30%'] }}
                    transition={{ duration: 1.1, repeat: Infinity, delay: i * 0.18 }}
                  />
                ))}
              </span>
            ) : (
              <Music size={18} />
            )}
          </button>
        )}

        <button
          type="button"
          className={menuOpen ? btnActive : btn}
          onClick={() => setMenuOpen((o) => !o)}
          aria-expanded={menuOpen}
          aria-label={menuOpen ? 'Fechar menu das seções' : 'Abrir menu das seções'}
          title="Seções do convite"
        >
          {menuOpen ? <X size={18} /> : <Menu size={18} />}
        </button>

        <AnimatePresence>
          {showTop && (
            <motion.button
              className={btn}
              onClick={() => {
                setMenuOpen(false);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              aria-label="Voltar ao topo"
              title="Voltar ao topo"
              initial={{ opacity: 0, scale: 0.6 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.6 }}
            >
              <ArrowUp size={18} />
            </motion.button>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
