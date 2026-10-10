/**
 * Équations du premier degré, sous forme de deux membres.
 *
 * Un membre vaut { x, c, groups } :
 *   - x : coefficient de l'inconnue (nombre de boîtes posées librement) ;
 *   - c : constante (poids unitaires, ou ballons si elle est négative) ;
 *   - groups : sacs fermés k(ax + b), écrits [{ k, x, c }] (vide hors monde 6).
 * Toutes les valeurs sont des fractions exactes (voir fraction.js).
 * Une équation vaut { left, right }. Les objets ne sont jamais modifiés en place.
 */
import * as F from './fraction.js';

/** Crée un membre ; accepte des nombres ou des fractions. */
export function member({ x = 0, c = 0, groups = [] } = {}) {
  return {
    x: F.frac(x),
    c: F.frac(c),
    groups: groups.map((g) => ({ k: F.frac(g.k), x: F.frac(g.x ?? 0), c: F.frac(g.c ?? 0) })),
  };
}

export function equation(left, right) {
  return { left: member(left), right: member(right) };
}

export const SIDES = ['left', 'right'];

/** Forme développée d'un membre : { x, c } une fois les sacs vidés. */
export function expand(m) {
  let x = m.x, c = m.c;
  for (const g of m.groups) {
    x = F.add(x, F.mul(g.k, g.x));
    c = F.add(c, F.mul(g.k, g.c));
  }
  return { x, c };
}

export function memberEquals(a, b) {
  return F.eq(a.x, b.x) && F.eq(a.c, b.c) && a.groups.length === b.groups.length &&
    a.groups.every((g, i) => F.eq(g.k, b.groups[i].k) && F.eq(g.x, b.groups[i].x) && F.eq(g.c, b.groups[i].c));
}

export const equationEquals = (a, b) => memberEquals(a.left, b.left) && memberEquals(a.right, b.right);

/** Valeur numérique d'un membre pour une valeur donnée de x (fraction). */
export function evaluate(m, value) {
  const e = expand(m);
  return F.add(F.mul(e.x, value), e.c);
}

/**
 * Solution de l'équation, indépendamment de l'état de la balance :
 *   { kind: 'one', value } | { kind: 'none' } | { kind: 'all' }.
 */
export function solve(eq) {
  const l = expand(eq.left), r = expand(eq.right);
  const a = F.sub(l.x, r.x), b = F.sub(r.c, l.c);
  if (F.isZero(a)) return { kind: F.isZero(b) ? 'all' : 'none' };
  return { kind: 'one', value: F.div(b, a) };
}

/**
 * Le niveau est gagné quand une boîte seule est isolée d'un côté et que l'autre
 * côté ne contient que des poids. Renvoie { side, value } ou null.
 */
export function isSolved(eq) {
  for (const side of SIDES) {
    const m = eq[side], o = eq[side === 'left' ? 'right' : 'left'];
    const lone = m.groups.length === 0 && F.eq(m.x, F.ONE) && F.isZero(m.c);
    const onlyWeights = o.groups.length === 0 && F.isZero(o.x);
    if (lone && onlyWeights) return { side, value: o.c };
  }
  return null;
}

/** Deux équations sont équivalentes si elles ont exactement les mêmes solutions. */
export function equivalent(a, b) {
  const sa = solve(a), sb = solve(b);
  if (sa.kind !== sb.kind) return false;
  return sa.kind !== 'one' || F.eq(sa.value, sb.value);
}

/** Toutes les valeurs (coefficients, constantes, facteurs de sacs) d'une équation. */
export function* values(eq) {
  for (const side of SIDES) {
    const m = eq[side];
    yield m.x; yield m.c;
    for (const g of m.groups) { yield g.k; yield g.x; yield g.c; }
  }
}
