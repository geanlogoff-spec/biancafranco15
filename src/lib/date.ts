import { useEffect, useState } from 'react';
import { invitation } from '../config/invitation.config';

export const eventDate = new Date(invitation.event.dateISO);

function fmt(opts: Intl.DateTimeFormatOptions) {
  return new Intl.DateTimeFormat('pt-BR', { timeZone: invitation.event.timeZone, ...opts }).format(eventDate);
}

const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

export const eventParts = {
  weekday: cap(fmt({ weekday: 'long' })),
  day: fmt({ day: '2-digit' }),
  month: cap(fmt({ month: 'long' })),
  year: fmt({ year: 'numeric' }),
  time: fmt({ hour: '2-digit', minute: '2-digit', hour12: false }).replace(':', 'h'),
};

export function useCountdown() {
  const calc = () => {
    const diff = Math.max(0, eventDate.getTime() - Date.now());
    return {
      done: diff === 0,
      days: Math.floor(diff / 86_400_000),
      hours: Math.floor((diff / 3_600_000) % 24),
      minutes: Math.floor((diff / 60_000) % 60),
      seconds: Math.floor((diff / 1000) % 60),
    };
  };
  const [state, setState] = useState(calc);
  useEffect(() => {
    const id = setInterval(() => setState(calc()), 1000);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return state;
}

