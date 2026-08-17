/**
 * Utilidades de seguridad compartidas y reutilizables.
 * Centraliza helpers antes, la lógica en componentes/test: escapar XSS,
 * sanitizar inputs, comparar secretos a tiempo constante, validar URLs,
 * máscaras de datos personales.
 */

// ─── XSS / escaping ───

const HTML_ESCAPE_MAP: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#x27;',
  '/': '&#x2F;',
  '`': '&#x60;',
};

/** Escapa caracteres peligrosos dentro de HTML (atributos/texto). */
export const escapeHtml = (input: string): string =>
  input.replace(/[&<>"'`/]/g, (char) => HTML_ESCAPE_MAP[char] || char);

export const escapeHtmlFast = (input: string): string =>
  input.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#x27;');

/**
 * Serializa un objeto a JSON-LD seguro de inyectar en un <script>.
 * Escapa `<`/`>`/`&` y separadores de línea para impedir que un valor de
 * usuario (p. ej. nombre de producto) cierre el tag y ejecute JS (XSS).
 */
export const escapeJsonForScript = (value: unknown): string =>
  JSON.stringify(value)
    .replace(/&/g, '\\u0026')
    .replace(/</g, '\\u003c')
    .replace(/>/g, '\\u003e')
    .replace(/\u2028/g, '\\u2028')
    .replace(/\u2029/g, '\\u2029');

/** Elimina < > y limita longitud de texto sin formato. */
export const sanitizeText = (input: string, maxLen = 500): string =>
  input.replace(/[<>]/g, '').trim().slice(0, maxLen);

// ── inputs e IDs ─────────────────────────────

/** Valida que una URL sea http/https (bloquea javascript:, data:text/html, ...). */
export const isValidHttpUrl = (value: string): boolean => {
  try {
    const parsed = new URL(value);
    return ['http:', 'https:'].includes(parsed.protocol);
  } catch {
    return false;
  }
};

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const SAFE_ID_RE = /^[a-zA-Z0-9_-]{1,100}$/;

/** Acepta UUID o identifiers alfanuméricos seguros (bloquea inyección). */
export const isValidId = (value: string): boolean =>
  UUID_RE.test(value) || SAFE_ID_RE.test(value);

/** Convierte a número no negativo y acotado (evita NaN/Infinity/negativos). */
export const sanitizeNumber = (value: string | number, max = 999999): number => {
  const num = typeof value === 'number' ? value : parseFloat(value);
  if (isNaN(num) || !isFinite(num)) return 0;
  return Math.max(0, Math.min(num, max));
};

export const isValidEmail = (email: string): boolean =>
  /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email) && email.length <= 254;

// ── Secretos / constant time ─────────────────

/** Comparación de strings en tiempo casi constante (anti timing attack). */
export const safeCompare = (a: string, b: string): boolean => {
  if (a.length !== b.length) return false;
  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return result === 0;
};

// ── Datos personales (masking) ────────────

export const maskPhone = (phone: string): string => {
  if (phone.length < 7) return phone;
  return phone.slice(0, 4) + phone.slice(4).replace(/./g, '*');
};

export const maskEmail = (email: string): string => {
  const idx = email.indexOf('@');
  if (idx <= 0) return email;
  const local = email.slice(0, idx);
  const domain = email.slice(idx);
  const masked = local.length > 2
    ? local[0] + '*'.repeat(local.length - 2) + local[local.length - 1]
    : '*'.repeat(local.length);
  return masked + domain;
};