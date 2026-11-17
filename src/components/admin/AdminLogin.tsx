import { ArrowLeft, Eye, EyeOff, KeyRound, Loader2, Lock, Mail, ShieldCheck } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { invitation } from '../../config/invitation.config';
import { signInAdmin } from '../../lib/supabase';

interface Props {
  onSuccess: () => void;
  onBack: () => void;
}

export function AdminLogin({ onSuccess, onBack }: Props) {
  const loginStageRef = useRef<HTMLDivElement>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const stageEl = loginStageRef.current;
    if (!stageEl || typeof window === 'undefined') return;

    const prefersReducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches;
    if (prefersReducedMotion) return;

    let rafId: number | null = null;
    let isRunning = false;

    const state = {
      targetX: window.innerWidth * 0.5,
      targetY: window.innerHeight * 0.45,
      currX: window.innerWidth * 0.5,
      currY: window.innerHeight * 0.45,
      targetNX: 0,
      targetNY: 0,
      currNX: 0,
      currNY: 0,
    };

    const tick = () => {
      const lerp = 0.085;
      state.currX += (state.targetX - state.currX) * lerp;
      state.currY += (state.targetY - state.currY) * lerp;
      state.currNX += (state.targetNX - state.currNX) * lerp;
      state.currNY += (state.targetNY - state.currNY) * lerp;

      stageEl.style.setProperty('--mouse-x', `${state.currX.toFixed(1)}px`);
      stageEl.style.setProperty('--mouse-y', `${state.currY.toFixed(1)}px`);
      stageEl.style.setProperty('--parallax-x', state.currNX.toFixed(4));
      stageEl.style.setProperty('--parallax-y', state.currNY.toFixed(4));

      const dx = Math.abs(state.targetX - state.currX);
      const dy = Math.abs(state.targetY - state.currY);
      if (dx > 0.25 || dy > 0.25) {
        rafId = window.requestAnimationFrame(tick);
      } else {
        isRunning = false;
      }
    };

    const handlePointerMove = (e: PointerEvent) => {
      const w = window.innerWidth || 1;
      const h = window.innerHeight || 1;
      state.targetX = e.clientX;
      state.targetY = e.clientY;
      state.targetNX = (e.clientX / w - 0.5) * 2;
      state.targetNY = (e.clientY / h - 0.5) * 2;

      if (!isRunning) {
        isRunning = true;
        rafId = window.requestAnimationFrame(tick);
      }
    };

    window.addEventListener('pointermove', handlePointerMove, { passive: true });
    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      if (rafId) window.cancelAnimationFrame(rafId);
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) {
      setError('Preencha seu e-mail e sua senha.');
      return;
    }

    setLoading(true);
    setError('');
    try {
      await signInAdmin(email, password);
      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Não foi possível entrar.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div ref={loginStageRef} className="login-interactive-stage">
      {/* Fundo Interativo com 5 Camadas */}
      <div className="login-interactive-bg" aria-hidden="true">
        <div className="login-grid-base" />
        <div className="login-grid-spotlight" />
        <div className="login-cursor-halo" />
        <div className="login-orb login-orb-1" />
        <div className="login-orb login-orb-2" />
        <div className="login-orb login-orb-3" />
        <div className="login-orbital-rings">
          <div className="login-ring login-ring-outer">
            <span className="login-ring-node node-top" />
            <span className="login-ring-node node-bottom" />
          </div>
          <div className="login-ring login-ring-inner">
            <span className="login-ring-node node-right" />
          </div>
        </div>
      </div>

      {/* Cartão Central de Login */}
      <div className="admin-login-fullscreen">
        <div className="admin-login-card">
          <div className="mb-7 text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl border border-[var(--color-card-border)] bg-white/90 text-[var(--color-primary)] shadow-sm">
              <ShieldCheck size={22} />
            </div>

            <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-[var(--color-card-border)] bg-[var(--color-bg-alt)] px-3 py-1">
              <span className="pulse-dot" />
              <span className="font-mono text-[0.66rem] font-semibold uppercase tracking-[0.08em] text-[var(--color-text-muted)]">
                CONSOLE ADMINISTRATIVO // ACESSO RESTRITO
              </span>
            </div>

            <h1 className="font-display mt-2 text-2xl font-bold tracking-[-0.03em] text-[var(--color-text-main)] sm:text-[1.75rem]">
              Painel · {invitation.debutante.name}
            </h1>
            <p className="mt-1.5 text-sm text-[var(--color-text-muted)]">
              Entre com suas credenciais para acompanhar confirmações e divulgar o convite.
            </p>
          </div>

          <form onSubmit={handleSubmit} noValidate className="space-y-4">
            <div>
              <label
                htmlFor="admin-email"
                className="mb-1.5 block font-mono text-[0.7rem] font-semibold uppercase tracking-[0.08em] text-[var(--color-text-muted)]"
              >
                E-mail de acesso
              </label>
              <div className="relative">
                <Mail
                  size={16}
                  className="pointer-events-none absolute top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]"
                  style={{ left: 14 }}
                />
                <input
                  id="admin-email"
                  type="email"
                  autoComplete="username"
                  placeholder="seu@email.com"
                  className="input-magic has-left-icon"
                  style={{ minHeight: 46 }}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                  required
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="admin-password"
                className="mb-1.5 block font-mono text-[0.7rem] font-semibold uppercase tracking-[0.08em] text-[var(--color-text-muted)]"
              >
                Senha
              </label>
              <div className="relative">
                <KeyRound
                  size={16}
                  className="pointer-events-none absolute top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]"
                  style={{ left: 14 }}
                />
                <input
                  id="admin-password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  placeholder="••••••••"
                  className="input-magic has-left-icon has-right-icon"
                  style={{ minHeight: 46 }}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-2 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-lg text-[var(--color-text-muted)] transition hover:bg-[var(--color-bg-alt)] hover:text-[var(--color-text-main)]"
                  aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                >
                  {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </div>
            </div>

            {error && (
              <p
                className="rounded-[var(--radius-sm)] border border-rose-200 bg-rose-50/90 px-3.5 py-2.5 text-center text-sm font-medium text-rose-700"
                role="alert"
              >
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn-magic mt-2 flex w-full items-center justify-center gap-2 rounded-[var(--radius-sm)] bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-accent)] px-6 py-3.5 font-sans text-sm font-semibold tracking-wide text-white shadow-[0_12px_28px_-10px_color-mix(in_srgb,var(--color-primary)_75%,transparent)] active:scale-[0.99] disabled:opacity-70"
              style={{ minHeight: 48 }}
            >
              {loading ? <Loader2 className="animate-spin" size={18} /> : <Lock size={16} />}
              {loading ? 'Autenticando...' : 'Entrar no Painel'}
            </button>
          </form>

          <div className="mt-6 border-t border-[var(--color-card-border)] pt-5 text-center">
            <button
              type="button"
              onClick={onBack}
              className="inline-flex min-h-[44px] items-center justify-center gap-1.5 rounded-full px-4 text-xs font-semibold uppercase tracking-[0.14em] text-[var(--color-text-muted)] transition hover:bg-[var(--color-bg-alt)] hover:text-[var(--color-text-main)]"
            >
              <ArrowLeft size={14} /> Voltar para o convite
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
