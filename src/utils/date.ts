import { env } from '../config/env';

/** Data de "hoje" (YYYY-MM-DD) no fuso configurado — evita o bug de virar o dia em UTC. */
export function todayStr(): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: env.timezone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date());
}

export function addDays(dateStr: string, days: number): string {
  const [y, m, d] = dateStr.split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, d + days)).toISOString().slice(0, 10);
}

/** Normaliza o valor vindo do banco (string ou Date) para YYYY-MM-DD. */
export function ds(v: unknown): string {
  if (typeof v === 'string') return v.slice(0, 10);
  if (v instanceof Date) return v.toISOString().slice(0, 10);
  return String(v).slice(0, 10);
}

export function isDateStr(v: unknown): v is string {
  return typeof v === 'string' && /^\d{4}-\d{2}-\d{2}/.test(v) && !isNaN(Date.parse(v.slice(0, 10)));
}
