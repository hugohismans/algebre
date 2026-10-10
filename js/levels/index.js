/**
 * Catalogue des mondes. Un niveau est une donnée pure :
 *   { id, start: '2x+1=9', cards: ['-1', '/2'], par, intro?, outro?, mode?: 'guess' | 'build', story? }
 * intro : briefing affiché au début ; outro : message du rapport de victoire ;
 * story : témoignage à mettre en équation (mode « build »).
 * Le monde peut avoir un briefing (écran des missions). Il fournit les règles
 * (negatives, fractions) et l'affichage
 * ('full' | 'mixed' | 'symbolic'). Un niveau peut surcharger rules et display.
 * Ce format servira tel quel au futur mode création (énigme encodée dans l'URL).
 */
import world1 from './world1.js';
import world2 from './world2.js';
import world3 from './world3.js';
import world4 from './world4.js';
import world5 from './world5.js';
import world6 from './world6.js';
import world7 from './world7.js';

export const WORLDS = [world1, world2, world3, world4, world5, world6, world7];

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
