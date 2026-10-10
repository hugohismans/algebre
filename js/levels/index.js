/**
 * Catalogue des mondes. Un niveau est une donnée pure :
 *   { id, start: '2x+1=9', cards: ['-1', '/2'], par, intro?, outro?, mode?: 'guess' }
 * intro : briefing affiché au début ; outro : message du rapport de victoire.
 * Le monde peut avoir un briefing (écran des missions). Il fournit les règles
 * (negatives, fractions) et l'affichage
 * ('full' | 'mixed' | 'symbolic'). Un niveau peut surcharger rules et display.
 * Ce format servira tel quel au futur mode création (énigme encodée dans l'URL).
 */
import world1 from './world1.js';
import world2 from './world2.js';

const upcoming = (id, title, subtitle) => ({
  id, title, subtitle, upcoming: true, rules: { negatives: false, fractions: false }, display: 'full', levels: [],
});

export const WORLDS = [
  world1,
  world2,
  upcoming(3, 'Double fond', 'Deux étapes, dans le bon ordre'),
  upcoming(4, 'Agents doubles', 'Des x des deux côtés'),
  upcoming(5, 'Ballons espions', 'Ils allègent : les nombres négatifs'),
  upcoming(6, 'Plis scellés', 'Les parenthèses'),
  upcoming(7, 'Témoignages', 'Du récit à l\'équation'),
];

export const worldById = (id) => WORLDS.find((w) => w.id === Number(id));

/** Niveau enrichi des réglages de son monde : { ...level, world, index, rules, display }. */
export function getLevel(worldId, index) {
  const world = worldById(worldId);
  const level = world?.levels[index];
  if (!level) return null;
  return {
    ...level,
    world,
    index,
    cards: level.cards ?? [],
    rules: { ...world.rules, ...level.rules },
    display: level.display ?? world.display,
  };
}
