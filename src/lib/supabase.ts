import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { invitation } from '../config/invitation.config';

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const key = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

export const supabase: SupabaseClient | null =
  url && key ? createClient(url, key, { auth: { persistSession: true, autoRefreshToken: true } }) : null;

export interface RsvpInput {
  name: string;
  phone: string; // apenas dígitos
  attending: boolean;
  companions: number;
}

export interface RsvpRecord {
  id: string;
  name: string;
  phone: string;
  attending: boolean;
  companions: number;
  created_at: string;
}

export function validateRsvp(input: RsvpInput): Partial<Record<keyof RsvpInput, string>> {
  const errors: Partial<Record<keyof RsvpInput, string>> = {};
  const name = input.name.trim();
  if (name.length < 3 || !name.includes(' ')) errors.name = 'Informe seu nome completo.';
  if (name.length > 120) errors.name = 'Nome muito longo.';
  if (!/^[0-9]{10,11}$/.test(input.phone)) errors.phone = 'Informe um WhatsApp válido com DDD.';
  const max = invitation.rsvp.allowCompanions ? invitation.rsvp.maxCompanions : 0;
  if (input.companions < 0 || input.companions > max) errors.companions = `Máximo de ${max} acompanhante(s).`;
  return errors;
}

/** Grava de verdade no Supabase. Lança erro se falhar — nunca simula sucesso. */
export async function submitRsvp(input: RsvpInput): Promise<void> {
  if (!supabase) throw new Error('Banco de dados não configurado.');
  const { error } = await supabase.from(invitation.rsvp.supabaseTable).insert({
    name: input.name.trim().replace(/\s+/g, ' '),
    phone: input.phone,
    attending: input.attending,
    companions: input.attending ? input.companions : 0,
  });
  if (error) throw new Error(error.message);
}

async function isAuthorizedAdmin(userId: string): Promise<boolean> {
  if (!supabase) return false;
  const { data, error } = await supabase
    .from('admins_bianca15')
    .select('user_id')
    .eq('user_id', userId)
    .maybeSingle();
  return !error && !!data;
}

export async function signInAdmin(email: string, password: string): Promise<void> {
  if (!supabase) throw new Error('Banco de dados não configurado.');
  const { data, error } = await supabase.auth.signInWithPassword({
    email: email.trim(),
    password,
  });
  if (error) {
    if (error.message.toLowerCase().includes('invalid login')) {
      throw new Error('E-mail ou senha inválidos.');
    }
    throw new Error(error.message);
  }
  const user = data.user;
  if (!user || !(await isAuthorizedAdmin(user.id))) {
    await supabase.auth.signOut();
    throw new Error('Esta conta não tem permissão de administrador deste convite.');
  }
}

export async function signOutAdmin(): Promise<void> {
  if (!supabase) return;
  const { error } = await supabase.auth.signOut();
  if (error) throw new Error(error.message);
}

export interface AdminSessionInfo {
  isAdmin: boolean;
  email: string;
}

export async function getAdminSessionInfo(): Promise<AdminSessionInfo> {
  if (!supabase) return { isAdmin: false, email: '' };
  const { data, error } = await supabase.auth.getSession();
  const user = data.session?.user;
  if (error || !user) return { isAdmin: false, email: '' };
  const ok = await isAuthorizedAdmin(user.id);
  if (!ok) {
    await supabase.auth.signOut();
    return { isAdmin: false, email: '' };
  }
  return { isAdmin: true, email: user.email ?? '' };
}

export async function getAdminSession(): Promise<boolean> {
  const info = await getAdminSessionInfo();
  return info.isAdmin;
}

export async function fetchRsvps(): Promise<RsvpRecord[]> {
  if (!supabase) throw new Error('Banco de dados não configurado.');

  const pageSize = 1000;
  const all: RsvpRecord[] = [];
  let from = 0;

  while (true) {
    const { data, error } = await supabase
      .from(invitation.rsvp.supabaseTable)
      .select('id, name, phone, attending, companions, created_at')
      .order('created_at', { ascending: false })
      .order('id', { ascending: false })
      .range(from, from + pageSize - 1);

    if (error) throw new Error(error.message);

    const rows = (data ?? []) as RsvpRecord[];
    all.push(...rows);

    if (rows.length < pageSize) break;
    from += pageSize;
  }

  return all;
}

export async function fetchRsvpsWithLatency(): Promise<{ records: RsvpRecord[]; latencyMs: number }> {
  const start = performance.now();
  const records = await fetchRsvps();
  const latencyMs = Math.max(1, Math.round(performance.now() - start));
  return { records, latencyMs };
}

export async function updateRsvp(id: string, input: RsvpInput): Promise<void> {
  if (!supabase) throw new Error('Banco de dados não configurado.');
  const { error } = await supabase
    .from(invitation.rsvp.supabaseTable)
    .update({
      name: input.name.trim().replace(/\s+/g, ' '),
      phone: input.phone,
      attending: input.attending,
      companions: input.attending ? input.companions : 0,
    })
    .eq('id', id);
  if (error) throw new Error(error.message);
}

export async function deleteRsvp(id: string): Promise<void> {
  if (!supabase) throw new Error('Banco de dados não configurado.');
  const { error } = await supabase.from(invitation.rsvp.supabaseTable).delete().eq('id', id);
  if (error) throw new Error(error.message);
}

/** Formata número brasileiro de 10 ou 11 dígitos como (XX) XXXXX-XXXX. */
export function formatPhone(digits: string): string {
  const d = digits.replace(/\D/g, '').slice(0, 11);
  if (d.length <= 2) return d.length ? `(${d}` : '';
  if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  if (d.length <= 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
}
