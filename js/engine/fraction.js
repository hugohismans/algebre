/**
 * Fractions exactes. Une fraction est un objet figé { n, d } avec d > 0 et
 * pgcd(|n|, d) = 1. Les entiers suffisent : les valeurs du jeu restent petites.
 */

function gcd(a, b) {
  a = Math.abs(a); b = Math.abs(b);
  while (b) [a, b] = [b, a % b];
  return a || 1;
}

/** Crée une fraction normalisée. Accepte un nombre entier, une fraction ou (n, d). */
export function frac(n, d = 1) {
  if (typeof n === 'object' && n !== null) return n;
  if (!Number.isInteger(n) || !Number.isInteger(d)) throw new TypeError(`frac : entiers attendus (${n}/${d})`);
  if (d === 0) throw new RangeError('frac : dénominateur nul');
  if (d < 0) { n = -n; d = -d; }
  const g = gcd(n, d);
  return Object.freeze({ n: n / g + 0, d: d / g });
}

export const ZERO = frac(0);
export const ONE = frac(1);

export const add = (a, b) => (a = frac(a), b = frac(b), frac(a.n * b.d + b.n * a.d, a.d * b.d));
export const sub = (a, b) => (a = frac(a), b = frac(b), frac(a.n * b.d - b.n * a.d, a.d * b.d));
export const mul = (a, b) => (a = frac(a), b = frac(b), frac(a.n * b.n, a.d * b.d));
export function div(a, b) {
  a = frac(a); b = frac(b);
  if (b.n === 0) throw new RangeError('div : division par zéro');
  return frac(a.n * b.d, a.d * b.n);
}
export const neg = (a) => (a = frac(a), frac(-a.n, a.d));

export const eq = (a, b) => (a = frac(a), b = frac(b), a.n === b.n && a.d === b.d);
export const cmp = (a, b) => Math.sign(sub(a, b).n);
export const sign = (a) => Math.sign(frac(a).n);
export const isZero = (a) => frac(a).n === 0;
export const isInt = (a) => frac(a).d === 1;
export const abs = (a) => (a = frac(a), frac(Math.abs(a.n), a.d));
export const toNumber = (a) => (a = frac(a), a.n / a.d);

/** Texte ASCII : « 3 », « -3 », « 3/4 ». */
export const toString = (a) => (a = frac(a), a.d === 1 ? String(a.n) : `${a.n}/${a.d}`);

/** Lit « 3 », « -3 », « 3/4 ». Renvoie null si la chaîne n'est pas une fraction. */
export function parseFrac(s) {
  const m = /^\s*([+-]?\d+)(?:\s*\/\s*(\d+))?\s*$/.exec(String(s));
  if (!m) return null;
  return frac(parseInt(m[1], 10), m[2] ? parseInt(m[2], 10) : 1);
}
