import { AnimatePresence, motion } from 'framer-motion';
import { Check, Heart, Loader2, MessageCircle, X } from 'lucide-react';
import { useState } from 'react';
import { invitation } from '../../config/invitation.config';
import { formatPhone, submitRsvp, supabase, validateRsvp, type RsvpInput } from '../../lib/supabase';
import { FlowerCluster } from '../decorative/BloomingRose';
import { Flourish, OrnateFrame } from '../decorative/OrnateFrame';
import { Sparkles } from '../decorative/Sparkles';
import { Reveal, Scene, SectionTitle } from '../Scene';

function whatsappLink(data: RsvpInput) {
  const first = invitation.debutante.name.split(' ')[0];
  const msg = data.attending
    ? `Olá! Confirmo minha presença nos 15 anos de ${first} ✨\n\nNome: ${data.name.trim()}\nWhatsApp: ${formatPhone(data.phone)}`
    : `Olá! Infelizmente não poderei comparecer aos 15 anos de ${first}. Desejo uma noite linda! 💜\n\nNome: ${data.name.trim()}`;
  return `https://wa.me/${invitation.rsvp.whatsappNumber}?text=${encodeURIComponent(msg)}`;
}

export function Scene6Rsvp() {
  const { rsvp } = invitation;
  const [form, setForm] = useState<RsvpInput>({ name: '', phone: '', attending: true, companions: 0 });
  const [errors, setErrors] = useState<Partial<Record<keyof RsvpInput, string>>>({});
  const [status, setStatus] = useState<'idle' | 'sending' | 'saved' | 'error'>('idle');
  const [serverError, setServerError] = useState('');

  const hasDb = !!supabase;
  const hasWhats = !!rsvp.whatsappNumber;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validateRsvp(form);
    setErrors(errs);
    if (Object.keys(errs).length) return;

    if (!hasDb) {
      // Sem banco: a confirmação acontece apenas via WhatsApp
      if (hasWhats) window.open(whatsappLink(form), '_blank', 'noopener');
      setStatus('saved');
      return;
    }
    setStatus('sending');
    setServerError('');
    try {
      await submitRsvp(form);
      setStatus('saved');
    } catch (err) {
      setServerError(err instanceof Error ? err.message : 'Erro desconhecido');
      setStatus('error');
    }
  };

  return (
    <Scene
      id="rsvp"
      className="watercolor"
      decor={
        <>
          <Sparkles count={18} seed={51} />
          <FlowerCluster side="right" className="bottom-0 opacity-80" />
          <FlowerCluster side="left" className="top-10 opacity-70" />
        </>
      }
    >
      <SectionTitle eyebrow="Confirmação de presença" title={invitation.texts.rsvpTitle} />

      <Reveal>
        <OrnateFrame className="glass-card mx-auto max-w-md rounded-[2rem] px-6 py-10 sm:px-10">
          {!hasDb && !hasWhats ? (
            <p className="text-center font-sans text-sm leading-relaxed text-plum-deep">
              A confirmação de presença ainda não está disponível. Configure o Supabase (.env) ou um número de WhatsApp em
              <code className="mx-1 rounded bg-lavender px-1">invitation.config.ts</code>.
            </p>
          ) : (
            <AnimatePresence mode="wait">
              {status === 'saved' ? (
                <motion.div
                  key="ok"
                  className="text-center"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                >
                  <motion.div
                    className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-lilac to-plum text-white"
                    initial={{ rotate: -90, scale: 0 }}
                    animate={{ rotate: 0, scale: 1 }}
                    transition={{ type: 'spring', delay: 0.2 }}
                  >
                    <Heart fill="currentColor" />
                  </motion.div>
                  <p className="font-script text-5xl text-plum-deep">{form.attending ? 'Obrigada!' : 'Sentiremos sua falta'}</p>
                  <p className="mt-3 font-sans text-base leading-relaxed text-plum-deep">
                    {form.attending
                      ? `${form.name.trim().split(' ')[0]}, sua presença foi confirmada. Mal posso esperar para viver essa noite com você!`
                      : `${form.name.trim().split(' ')[0]}, obrigada por avisar. Você estará no meu coração nessa noite.`}
                  </p>
                  {hasDb && hasWhats && (
                    <a
                      href={whatsappLink(form)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-6 inline-flex items-center gap-2 rounded-full bg-[#25D366] px-6 py-3 font-sans text-sm font-medium tracking-wider text-white shadow-lg"
                    >
                      <MessageCircle size={18} /> ENVIAR TAMBÉM PELO WHATSAPP
                    </a>
                  )}
                  <button
                    onClick={() => {
                      setForm({ name: '', phone: '', attending: true, companions: 0 });
                      setStatus('idle');
                    }}
                    className="mt-5 block w-full font-sans text-xs uppercase tracking-[0.25em] text-plum underline-offset-4 hover:underline"
                  >
                    Confirmar outra pessoa
                  </button>
                </motion.div>
              ) : (
                <motion.form key="form" onSubmit={submit} noValidate exit={{ opacity: 0, y: -10 }} className="space-y-5">
                  <div>
                    <label htmlFor="name" className="mb-1.5 block font-sans text-xs font-semibold uppercase tracking-[0.2em] text-plum-deep">
                      Nome completo
                    </label>
                    <input
                      id="name"
                      className="input-magic"
                      autoComplete="name"
                      placeholder="Ex.: Maria Oliveira"
                      maxLength={120}
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      aria-invalid={!!errors.name}
                    />
                    {errors.name && <p className="mt-1 text-sm font-medium text-rose-600">{errors.name}</p>}
                  </div>

                  <div>
                    <label htmlFor="phone" className="mb-1.5 block font-sans text-xs font-semibold uppercase tracking-[0.2em] text-plum-deep">
                      Telefone / WhatsApp
                    </label>
                    <input
                      id="phone"
                      className="input-magic"
                      type="tel"
                      inputMode="numeric"
                      autoComplete="tel-national"
                      placeholder="(68) 99999-9999"
                      value={formatPhone(form.phone)}
                      onChange={(e) => setForm({ ...form, phone: e.target.value.replace(/\D/g, '').slice(0, 11) })}
                      aria-invalid={!!errors.phone}
                    />
                    {errors.phone && <p className="mt-1 text-sm font-medium text-rose-600">{errors.phone}</p>}
                  </div>

                  <fieldset>
                    <legend className="mb-2 font-sans text-xs font-semibold uppercase tracking-[0.2em] text-plum-deep">
                      Você poderá comparecer?
                    </legend>
                    <div className="grid gap-3">
                      {[
                        { v: true, label: 'SIM, ESTAREI PRESENTE', Icon: Check },
                        { v: false, label: 'NÃO PODEREI COMPARECER', Icon: X },
                      ].map(({ v, label, Icon }) => (
                        <motion.button
                          type="button"
                          key={label}
                          whileTap={{ scale: 0.97 }}
                          onClick={() => setForm({ ...form, attending: v, companions: v ? form.companions : 0 })}
                          className={`flex items-center gap-3 rounded-2xl border-[1.5px] px-4 py-3.5 text-left font-sans text-sm font-medium tracking-wider transition ${
                            form.attending === v
                              ? 'border-plum bg-gradient-to-r from-lavender via-white to-white text-plum-deep shadow-md'
                              : 'border-plum/45 bg-white/90 text-plum-deep/85 hover:border-plum/75 hover:bg-white'
                          }`}
                          aria-pressed={form.attending === v}
                        >
                          <span
                            className={`flex h-6 w-6 items-center justify-center rounded-full ${
                              form.attending === v ? 'bg-plum text-white' : 'bg-lavender text-plum-deep'
                            }`}
                          >
                            <Icon size={14} />
                          </span>
                          {label}
                        </motion.button>
                      ))}
                    </div>
                  </fieldset>

                  {status === 'error' && (
                    <p className="rounded-xl bg-rose-50 p-3 text-center text-sm text-rose-600" role="alert">
                      Não foi possível salvar sua confirmação ({serverError}). Tente novamente
                      {hasWhats ? ' ou confirme pelo WhatsApp.' : '.'}
                    </p>
                  )}

                  <Flourish />

                  <motion.button
                    type="submit"
                    disabled={status === 'sending'}
                    whileTap={{ scale: 0.97 }}
                    className="btn-magic flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-plum to-[#b393de] py-4 font-sans text-sm font-medium tracking-[0.25em] text-white shadow-[0_10px_30px_-8px_rgb(152_117_196/0.8)] disabled:opacity-70"
                  >
                    {status === 'sending' ? <Loader2 className="animate-spin" size={18} /> : <Heart size={16} />}
                    {status === 'sending' ? 'ENVIANDO...' : 'CONFIRMAR'}
                  </motion.button>
                </motion.form>
              )}
            </AnimatePresence>
          )}
        </OrnateFrame>
      </Reveal>
    </Scene>
  );
}
