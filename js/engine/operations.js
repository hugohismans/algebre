/**
 * Opérations sur la balance. Une opération s'applique toujours aux deux plateaux.
 *
 *   { type: 'add', n }       ajouter n poids de chaque côté
 *   { type: 'sub', n }       retirer n poids de chaque côté
 *   { type: 'mul', n }       multiplier chaque plateau par n
 *   { type: 'div', n }       partager chaque plateau en n et n'en garder qu'une part
 *   { type: 'addX', n }      ajouter n boîtes de chaque côté
 *   { type: 'removeX', n }   retirer n boîtes de chaque côté
 *   { type: 'distribute' }   vider les sacs : k(ax + b) devient kax + kb
 *
 * Les règles du niveau disent ce que la balance « physique » autorise :
 *   negatives : quantités négatives permises (ballons, monde 5 et suivants) ;
 *   fractions : morceaux de boîte ou de poids permis.
 */
import * as F from './fraction.js';
import { SIDES, member, expand, values } from './equation.js';

export const DEFAULT_RULES = Object.freeze({ negatives: false, fractions: false });

function mapMember(m, fx, fc, fk) {
  return member({
    x: fx(m.x),
    c: fc(m.c),
    groups: m.groups.map((g) => ({ k: fk(g.k), x: g.x, c: g.c })),
  });
}

/** Un sac de facteur 1 n'est plus un sac : son contenu rejoint le plateau. */
function openUnitGroups(m) {
  if (!m.groups.some((g) => F.eq(g.k, F.ONE))) return m;
  let { x, c } = m;
  const groups = [];
  for (const g of m.groups) {
    if (F.eq(g.k, F.ONE)) { x = F.add(x, g.x); c = F.add(c, g.c); }
    else groups.push(g);
  }
  return member({ x, c, groups });
}

function applyToMember(m, op) {
  const id = (v) => v;
  switch (op.type) {
    case 'add': return mapMember(m, id, (c) => F.add(c, op.n), id);
    case 'sub': return mapMember(m, id, (c) => F.sub(c, op.n), id);
    case 'addX': return mapMember(m, (x) => F.add(x, op.n ?? F.ONE), id, id);
    case 'removeX': return mapMember(m, (x) => F.sub(x, op.n ?? F.ONE), id, id);
    case 'mul': return mapMember(m, (x) => F.mul(x, op.n), (c) => F.mul(c, op.n), (k) => F.mul(k, op.n));
    case 'div': return openUnitGroups(mapMember(m, (x) => F.div(x, op.n), (c) => F.div(c, op.n), (k) => F.div(k, op.n)));
    case 'distribute': return member(expand(m));
    default: throw new TypeError(`opération inconnue : ${op.type}`);
  }
}

/** Applique l'opération sans vérifier les règles (voir validate). */
export function apply(eq, op) {
  op = normalizeOp(op);
  return { left: applyToMember(eq.left, op), right: applyToMember(eq.right, op) };
}

export function normalizeOp(op) {
  if (op.type === 'distribute') return op;
  return { ...op, n: F.frac(op.n ?? 1) };
}

function memberHasNegative(m) {
  return F.sign(m.x) < 0 || F.sign(m.c) < 0 || m.groups.some((g) => F.sign(g.k) < 0 || F.sign(g.x) < 0 || F.sign(g.c) < 0);
}
function memberHasFraction(m) {
  return !F.isInt(m.x) || !F.isInt(m.c) || m.groups.some((g) => !F.isInt(g.k));
}

/**
 * Vérifie qu'une opération est permise. Renvoie
 *   { ok: true, result }
 *   { ok: false, reason, sides }  où sides liste les plateaux qui posent problème.
 *
 * Raisons : 'zero' (×0 ou ÷0), 'not-enough-weights', 'not-enough-boxes',
 * 'negative', 'not-divisible', 'nothing-to-distribute'.
 */
export function validate(eq, op, rules = DEFAULT_RULES) {
  op = normalizeOp(op);
  rules = { ...DEFAULT_RULES, ...rules };
  if ((op.type === 'mul' || op.type === 'div') && F.isZero(op.n)) return { ok: false, reason: 'zero', sides: [...SIDES] };
  if (op.type === 'distribute' && !SIDES.some((s) => eq[s].groups.length)) {
    return { ok: false, reason: 'nothing-to-distribute', sides: [] };
  }
  const result = apply(eq, op);
  if (!rules.negatives) {
    const sides = SIDES.filter((s) => memberHasNegative(result[s]));
    if (sides.length) {
      const reason = op.type === 'sub' ? 'not-enough-weights' : op.type === 'removeX' ? 'not-enough-boxes' : 'negative';
      return { ok: false, reason, sides };
    }
  }
  if (!rules.fractions) {
    const sides = SIDES.filter((s) => memberHasFraction(result[s]));
    if (sides.length) return { ok: false, reason: 'not-divisible', sides };
  }
  return { ok: true, result };
}

/** Plus grande valeur absolue présente (utile pour borner une recherche). */
export function magnitude(eq) {
  let max = 0;
  for (const v of values(eq)) max = Math.max(max, Math.abs(F.toNumber(v)));
  return max;
}
