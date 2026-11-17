import { ArrowLeft, Eye, EyeOff, KeyRound, Loader2, Lock, Mail } from 'lucide-react';
import { useState } from 'react';
import { invitation } from '../../config/invitation.config';
import { signInAdmin } from '../../lib/supabase';
import { BloomingRose } from '../decorative/BloomingRose';
import { Flourish, OrnateFrame } from '../decorative/OrnateFrame';
import { CrownCrest } from '../decorative/PaperDeckled';
import { EnchantedLoginGarden } from './EnchantedLoginGarden';

interface Props {
  onSuccess: () => void;
  onBack: () => void;
}

export function AdminLogin({ onSuccess, onBack }: Props) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

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
    <div className="relative flex min-h-[100dvh] items-center justify-center overflow-hidden px-4 py-8 sm:px-6">
      <EnchantedLoginGarden />

      {/* Cartão Central de Login */}
      <div className="admin-login-fullscreen pointer-events-none">
        <div className="relative w-full max-w-[460px] pointer-events-auto">
          <BloomingRose
            size={64}
            color="lilac"
            delay={0.2}
            className="pointer-events-auto absolute -right-5 -top-6 z-20 sm:-right-7 sm:-top-7"
          />
          <BloomingRose
            size={54}
            color="white"
            delay={0.45}
            rotate={-18}
            className="pointer-events-auto absolute -bottom-5 -left-4 z-20 sm:-bottom-6 sm:-left-6"
          />

          <div className="admin-login-card relative overflow-hidden !p-3 sm:!p-4">
            <OrnateFrame className="rounded-[var(--radius-md)] border border-gold/55 bg-white/55 px-5 py-7 sm:px-7 sm:py-8">
              <div className="mb-6 text-center">
                <CrownCrest className="mb-2" />

                <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-[var(--color-card-border)] bg-[var(--color-bg-alt)]/90 px-3 py-1">
                  <span className="pulse-dot" />
                  <span className="font-mono text-[0.64rem] font-semibold uppercase tracking-[0.08em] text-[var(--color-text-muted)]">
                    CONSOLE ADMINISTRATIVO // ACESSO RESTRITO
                  </span>
                </div>

                <h1 className="font-display mt-2 text-2xl font-bold tracking-[-0.03em] text-[var(--color-text-main)] sm:text-[1.75rem]">
                  Painel · {invitation.debutante.name}
                </h1>
                <p className="mt-1 text-sm text-[var(--color-text-muted)]">
                  Entre para acompanhar confirmações e compartilhar o convite.
                </p>
                <Flourish className="mt-4" />
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

              <div className="mt-5 border-t border-[var(--color-card-border)] pt-4 text-center">
                <button
                  type="button"
                  onClick={onBack}
                  className="inline-flex min-h-[44px] items-center justify-center gap-1.5 rounded-full px-4 text-xs font-semibold uppercase tracking-[0.14em] text-[var(--color-text-muted)] transition hover:bg-[var(--color-bg-alt)] hover:text-[var(--color-text-main)]"
                >
                  <ArrowLeft size={14} /> Voltar para o convite
                </button>
              </div>
            </OrnateFrame>
          </div>
        </div>
      </div>
    </div>
  );
}
