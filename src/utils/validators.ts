import { AppError } from './AppError';

export function reqString(v: unknown, field: string, max = 255): string {
  if (typeof v !== 'string' || !v.trim()) throw new AppError(`${field} é obrigatório`, 400);
  const t = v.trim();
  if (t.length > max) throw new AppError(`${field} deve ter no máximo ${max} caracteres`, 400);
  return t;
}

export function optString(v: unknown, field: string, max = 5000): string | null {
  if (v === undefined || v === null || v === '') return null;
  if (typeof v !== 'string') throw new AppError(`${field} inválido`, 400);
  const t = v.trim();
  if (t.length > max) throw new AppError(`${field} deve ter no máximo ${max} caracteres`, 400);
  return t || null;
}

export function toId(v: unknown, field = 'id'): number {
  const n = Number(v);
  if (!Number.isInteger(n) || n <= 0) throw new AppError(`${field} inválido`, 400);
  return n;
}

export function optId(v: unknown, field: string): number | null {
  if (v === undefined || v === null || v === '') return null;
  return toId(v, field);
}

export function posInt(v: unknown, field: string, min = 1, max = 1_000_000): number {
  const n = Number(v);
  if (!Number.isInteger(n) || n < min || n > max) {
    throw new AppError(`${field} deve ser um número inteiro entre ${min} e ${max}`, 400);
  }
  return n;
}

export function num(v: unknown, field: string): number {
  const n = Number(v);
  if (v === null || v === '' || v === undefined || !Number.isFinite(n)) throw new AppError(`${field} inválido`, 400);
  return n;
}

/** RN-13: cor hexadecimal completa com prefixo # (ex.: #3b82f6). */
export function hexColor(v: unknown, field: string): string {
  if (typeof v !== 'string' || !/^#[0-9a-fA-F]{6}$/.test(v)) {
    throw new AppError(`${field} deve ser uma cor hexadecimal completa com # (ex.: #3b82f6)`, 400);
  }
  return v;
}

export const has = (body: any, key: string): boolean => !!body && Object.prototype.hasOwnProperty.call(body, key);
