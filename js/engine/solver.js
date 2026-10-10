/**
 * Recherche en largeur du plus court chemin vers une balance résolue, avec un
 * jeu de cartes donné. Sert à vérifier le « par » des niveaux dans les tests,
 * et servira aux indices et au futur mode création.
 */
import { validate, magnitude } from './operations.js';
import { isSolved } from './equation.js';
import { formatEquation } from './format.js';

/**
 * Renvoie { moves, path } (path = liste d'opérations) ou null si aucune
 * solution n'existe en au plus maxDepth coups.
 */
export function shortestSolution(start, ops, rules, { maxDepth = 10, maxMagnitude = 200 } = {}) {
  const key = (eq) => formatEquation(eq, { ascii: true });
  if (isSolved(start)) return { moves: 0, path: [] };
  const seen = new Set([key(start)]);
  let frontier = [{ eq: start, path: [] }];
  for (let depth = 1; depth <= maxDepth && frontier.length; depth++) {
    const next = [];
    for (const { eq, path } of frontier) {
      for (const op of ops) {
        const v = validate(eq, op, rules);
        if (!v.ok || magnitude(v.result) > maxMagnitude) continue;
        const k = key(v.result);
        if (seen.has(k)) continue;
        seen.add(k);
        const p = [...path, op];
        if (isSolved(v.result)) return { moves: depth, path: p };
        next.push({ eq: v.result, path: p });
      }
    }
    frontier = next;
  }
  return null;
}
