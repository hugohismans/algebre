/**
 * Lecture d'une équation écrite en texte : « 2x+1=9 », « 3x + 2 = x + 8 »,
 * « 2(x+3) = 14 », « -x - 3 = 5 », « 1/2x = 3 ». Les signes − (U+2212), × et ÷
 * sont acceptés. Pratique pour écrire les niveaux et, plus tard, pour les URL.
 */
import * as F from './fraction.js';
import { member } from './equation.js';

const NORMALIZE = [[/−/g, '-'], [/[×·*]/g, ''], [/\s+/g, ''], [/X/g, 'x']];

function normalize(s) {
  return NORMALIZE.reduce((acc, [re, rep]) => acc.replace(re, rep), String(s));
}

/** Coupe « 2x+3-x » en termes signés : ['+2x', '+3', '-x']. Respecte les parenthèses. */
function splitTerms(s) {
  const terms = [];
  let depth = 0, cur = '';
  for (const ch of s) {
    if (ch === '(') depth++;
    if (ch === ')') depth--;
    if (depth < 0) throw new SyntaxError('parenthèse fermante en trop');
    if ((ch === '+' || ch === '-') && depth === 0 && cur !== '' && cur !== '+' && cur !== '-') {
      terms.push(cur); cur = '';
    }
    cur += ch;
  }
  if (depth !== 0) throw new SyntaxError('parenthèse non fermée');
  if (cur) terms.push(cur);
  return terms;
}

/** Coefficient écrit devant x ou une parenthèse : '' → 1, '-' → -1, '3/4' → 3/4. */
function coef(s, term) {
  if (s === '' || s === '+') return F.ONE;
  if (s === '-') return F.frac(-1);
  const f = F.parseFrac(s);
  if (!f) throw new SyntaxError(`terme illisible : « ${term} »`);
  return f;
}

function parseMember(s, { allowGroups = true } = {}) {
  if (!s) throw new SyntaxError('membre vide');
  let x = F.ZERO, c = F.ZERO;
  const groups = [];
  for (const term of splitTerms(s)) {
    let m;
    if ((m = /^([+-]?[\d/]*)\((.+)\)$/.exec(term))) {
      if (!allowGroups) throw new SyntaxError('parenthèses imbriquées non prises en charge');
      const inner = parseMember(m[2], { allowGroups: false });
      groups.push({ k: coef(m[1], term), x: inner.x, c: inner.c });
    } else if ((m = /^([+-]?[\d/]*)x$/.exec(term))) {
      x = F.add(x, coef(m[1], term));
    } else {
      const f = F.parseFrac(term);
      if (!f) throw new SyntaxError(`terme illisible : « ${term} »`);
      c = F.add(c, f);
    }
  }
  return member({ x, c, groups });
}

export function parseEquation(text) {
  const parts = normalize(text).split('=');
  if (parts.length !== 2) throw new SyntaxError(`une équation doit contenir un seul « = » : « ${text} »`);
  return { left: parseMember(parts[0]), right: parseMember(parts[1]) };
}

/**
 * Lit une carte d'opération écrite en raccourci :
 *   '+3' '-3' '*2' '/2' (aussi × ÷ −), '-x' (retirer une boîte), '+x', '-2x', 'dist'.
 */
export function parseOp(text) {
  const s = String(text).replace(/\u2212/g, '-').replace(/×/g, '*').replace(/÷/g, '/').replace(/\s+/g, '').replace(/X/g, 'x');
  if (s === 'dist' || s === 'distribute') return { type: 'distribute' };
  let m;
  if ((m = /^([+-])(\d*)x$/.exec(s))) {
    const n = F.frac(m[2] ? parseInt(m[2], 10) : 1);
    return { type: m[1] === '+' ? 'addX' : 'removeX', n };
  }
  if ((m = /^([*/])\(?(-?\d+(?:\/\d+)?)\)?$/.exec(s))) return { type: m[1] === '*' ? 'mul' : 'div', n: F.parseFrac(m[2]) };
  if ((m = /^([+-])(\d+(?:\/\d+)?)$/.exec(s))) return { type: m[1] === '+' ? 'add' : 'sub', n: F.parseFrac(m[2]) };
  throw new SyntaxError(`carte illisible : « ${text} »`);
}
