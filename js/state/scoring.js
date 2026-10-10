/** Étoiles, comme au golf : 3 au par (ou mieux), 2 jusqu'à deux coups de plus, sinon 1. */
export const STAR_MARGIN = 2;

export function starsFor(moves, par) {
  if (moves <= par) return 3;
  if (moves <= par + STAR_MARGIN) return 2;
  return 1;
}
