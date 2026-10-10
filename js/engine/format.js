/**
 * Écriture d'une équation en texte. Par défaut, typographie soignée
 * (« 2x + 3 = 11 », signe moins U+2212). Avec { ascii: true }, texte relisible
 * par parseEquation (pour les URL et les tests).
 */
import * as F from './fraction.js';

const MINUS = '−';

function fracText(f, ascii) {
  const s = F.toString(F.abs(f));
  return ascii ? s : s.replace('/', '⁄');
}

/** Coefficient devant x ou un sac : 1 → '', 3 → '3', 1/2 → '(1/2)' ou '½'. */
function coefText(f, ascii) {
  const a = F.abs(f);
  if (F.eq(a, F.ONE)) return '';
  if (F.isInt(a)) return String(a.n);
  return ascii ? `${a.n}/${a.d}` : `(${fracText(a, false)})`;
}

/** Termes signés d'un membre, dans l'ordre : sacs, x, constante. */
function terms(m, ascii) {
  const out = [];
  for (const g of m.groups) {
    out.push({ neg: F.sign(g.k) < 0, text: `${coefText(g.k, ascii)}(${formatMember({ x: g.x, c: g.c, groups: [] }, { ascii })})` });
  }
  if (!F.isZero(m.x)) out.push({ neg: F.sign(m.x) < 0, text: `${coefText(m.x, ascii)}x` });
  if (!F.isZero(m.c)) out.push({ neg: F.sign(m.c) < 0, text: fracText(m.c, ascii) });
  return out;
}

export function formatMember(m, { ascii = false } = {}) {
  const ts = terms(m, ascii);
  if (!ts.length) return '0';
  const minus = ascii ? '-' : MINUS;
  return ts.map((t, i) => {
    if (i === 0) return (t.neg ? minus : '') + t.text;
    return ascii ? `${t.neg ? '-' : '+'}${t.text}` : ` ${t.neg ? MINUS : '+'} ${t.text}`;
  }).join('');
}

export function formatEquation(eq, opts = {}) {
  const sep = opts.ascii ? '=' : ' = ';
  return formatMember(eq.left, opts) + sep + formatMember(eq.right, opts);
}

/** Valeur seule : « 4 », « −3 », « 5⁄2 ». */
export function formatValue(f, { ascii = false } = {}) {
  return (F.sign(f) < 0 ? (ascii ? '-' : MINUS) : '') + fracText(f, ascii);
}

/** Libellé court d'une carte : « +3 », « −3 », « ×2 », « ÷2 », « −x », « +2x », « Distribuer ». */
export function formatOp(op) {
  const n = op.n ? fracText(op.n, false) : '';
  const nx = op.n && !F.eq(op.n, F.ONE) ? n : '';
  switch (op.type) {
    case 'add': return `+${n}`;
    case 'sub': return `${MINUS}${n}`;
    case 'mul': return `×${F.sign(op.n) < 0 ? `(${MINUS}${n})` : n}`;
    case 'div': return `÷${F.sign(op.n) < 0 ? `(${MINUS}${n})` : n}`;
    case 'addX': return `+${nx}x`;
    case 'removeX': return `${MINUS}${nx}x`;
    case 'distribute': return 'Distribuer';
    default: return '?';
  }
}
