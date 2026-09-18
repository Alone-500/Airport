export const cx = (...parts: Array<string | false | null | undefined>) => parts.filter(Boolean).join(' ');

/* ---------------- money / locale ---------------- */
export type Currency = 'USD' | 'GHS' | 'NGN' | 'KES' | 'ZAR' | 'EUR' | 'GBP' | 'AED';

/** Indicative fixed conversion rates used by the demo platform. */
export const FX: Record<Currency, { rate: number; locale: string; symbol: string }> = {
  USD: { rate: 1, locale: 'en-US', symbol: '$' },
  GHS: { rate: 15.4, locale: 'en-GH', symbol: 'GH₵' },
  NGN: { rate: 1580, locale: 'en-NG', symbol: '₦' },
  KES: { rate: 129, locale: 'en-KE', symbol: 'KSh' },
  ZAR: { rate: 18.3, locale: 'en-ZA', symbol: 'R' },
  EUR: { rate: 0.92, locale: 'de-DE', symbol: '€' },
  GBP: { rate: 0.78, locale: 'en-GB', symbol: '£' },
  AED: { rate: 3.67, locale: 'en-AE', symbol: 'AED' },
};

export function money(usd: number, currency: Currency = 'USD', opts: { decimals?: boolean } = {}) {
  const { rate, locale } = FX[currency];
  const value = usd * rate;
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    maximumFractionDigits: opts.decimals ? 2 : 0,
    minimumFractionDigits: opts.decimals ? 2 : 0,
  }).format(value);
}

export const compact = (n: number) =>
  new Intl.NumberFormat('en-US', { notation: 'compact', maximumFractionDigits: 1 }).format(n);

export const pct = (n: number, digits = 0) => `${n.toFixed(digits)}%`;

/* ---------------- dates ---------------- */
export const DAY = 86400000;

export const toISODate = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

export const parseISODate = (s: string) => {
  const [y, m, d] = s.split('-').map(Number);
  return new Date(y, (m || 1) - 1, d || 1);
};

export const addDays = (d: Date, n: number) => new Date(d.getTime() + n * DAY);

export const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate());

export const daysBetween = (a: Date, b: Date) =>
  Math.round((startOfDay(b).getTime() - startOfDay(a).getTime()) / DAY);

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const DOW = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
export const monthName = (i: number) => MONTHS[i];
export const dayName = (i: number) => DOW[i];

export function fmtDate(iso: string | Date, style: 'short' | 'medium' | 'long' | 'weekday' = 'medium') {
  const d = typeof iso === 'string' && iso.length <= 11 ? parseISODate(iso) : new Date(iso);
  if (!(d instanceof Date) || Number.isNaN(d.getTime())) {
    if (typeof iso === 'string' && iso.trim()) return iso.replace(/T[\d:.]+Z?$/, '').replace(/-/g, ' ').trim();
    return '—';
  }
  const dd = d.getDate();
  const mon = MONTHS[d.getMonth()].slice(0, 3);
  switch (style) {
    case 'short':
      return `${mon} ${dd}`;
    case 'long':
      return `${MONTHS[d.getMonth()]} ${dd}, ${d.getFullYear()}`;
    case 'weekday':
      return `${DOW[d.getDay()].slice(0, 3)}, ${mon} ${dd}`;
    default:
      return `${dd} ${mon} ${d.getFullYear()}`;
  }
}

export const fmtTime = (d: Date | string) => {
  const date = typeof d === 'string' ? new Date(d) : d;
  return date.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: false });
};

export function durationLabel(min: number) {
  const h = Math.floor(min / 60);
  const m = min % 60;
  return m ? `${h}h ${String(m).padStart(2, '0')}m` : `${h}h 00m`;
}

export function relativeDay(iso: string | Date, from = new Date()) {
  const d = typeof iso === 'string' && iso.length <= 11 ? parseISODate(iso) : new Date(iso);
  const diff = daysBetween(from, d);
  if (diff === 0) return 'Today';
  if (diff === 1) return 'Tomorrow';
  if (diff === -1) return 'Yesterday';
  if (diff > 1 && diff < 7) return DOW[d.getDay()];
  return fmtDate(d, 'medium');
}

/* ---------------- misc ---------------- */
export const pluralize = (n: number, one: string, many = `${one}s`) => `${n} ${n === 1 ? one : many}`;

/** Deterministic 32-bit hash → used to keep mock flight inventory stable per route/date. */
export function hash(str: string) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

export function rng(seed: number) {
  let s = seed || 1;
  return () => {
    s ^= s << 13;
    s ^= s >>> 17;
    s ^= s << 5;
    return ((s >>> 0) % 100000) / 100000;
  };
}

export const pick = <T,>(arr: T[], r: number) => arr[Math.floor(r * arr.length) % arr.length];

/** Airline-style PNR: 6 alphanumeric chars, no ambiguous glyphs. */
export function makePnr(seed?: number) {
  const alphabet = 'ACDEFHJKLMNPRTUVWXY3479';
  const r = rng(seed ?? Math.floor(Math.random() * 1e9));
  return Array.from({ length: 6 }, () => alphabet[Math.floor(r() * alphabet.length)]).join('');
}

export const sleep = (ms: number) => new Promise((res) => setTimeout(res, ms));

export function formatDob(d: Date) {
  return toISODate(d);
}

export function ageFrom(iso: string) {
  if (!iso) return 0;
  const b = parseISODate(iso);
  const now = new Date();
  let a = now.getFullYear() - b.getFullYear();
  const m = now.getMonth() - b.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < b.getDate())) a--;
  return a;
}

/** Simple Luhn check so card validation behaves like a real gateway. */
export function luhnValid(num: string) {
  const digits = num.replace(/\D/g, '');
  if (digits.length < 13) return false;
  let sum = 0;
  let alt = false;
  for (let i = digits.length - 1; i >= 0; i--) {
    let n = Number(digits[i]);
    if (alt) {
      n *= 2;
      if (n > 9) n -= 9;
    }
    sum += n;
    alt = !alt;
  }
  return sum % 10 === 0;
}

export const cardBrand = (num: string) => {
  const d = num.replace(/\D/g, '');
  if (/^4/.test(d)) return 'visa';
  if (/^5[1-5]/.test(d) || /^2[2-7]/.test(d)) return 'mastercard';
  if (/^3[47]/.test(d)) return 'amex';
  if (/^6/.test(d)) return 'discover';
  return 'card';
};

export const maskCard = (num: string) => {
  const d = num.replace(/\D/g, '');
  return d.length >= 8 ? `•••• •••• •••• ${d.slice(-4)}` : num;
};

export function slugify(s: string) {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

export const titleCase = (s: string) =>
  s.replace(/\w\S*/g, (t) => t.charAt(0).toUpperCase() + t.slice(1).toLowerCase());
