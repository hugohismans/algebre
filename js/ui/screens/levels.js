/** Écran d'un monde : la grille de ses niveaux. */
import { h, stars } from '../dom.js';
import { worldById } from '../../levels/index.js';
import { levelResult, levelUnlocked, worldUnlocked, worldStars } from '../../state/progress.js';
import { parseEquation, formatEquation } from '../../engine/index.js';

export function levelsScreen(root, { world: worldId }) {
  const world = worldById(worldId);
  if (!world || !worldUnlocked(world)) { location.hash = '#/'; return; }
  const grid = h('ol', { class: 'level-grid' });
  world.levels.forEach((l, i) => {
    const open = levelUnlocked(world, i);
    const res = levelResult(l.id);
    const inner = [
      h('span', { class: 'level-num' }, String(i + 1)),
      h('span', { class: 'level-eq' }, formatEquation(parseEquation(l.start))),
      stars(res?.stars ?? 0),
    ];
    grid.append(h('li', {},
      open
        ? h('a', { class: `level-tile${res ? ' done' : ''}`, href: `#/monde/${world.id}/niveau/${i + 1}` }, inner)
        : h('div', { class: 'level-tile locked', 'aria-disabled': 'true' }, h('span', { class: 'level-num' }, '🔒'))));
  });
  root.append(h('main', { class: `screen screen-levels world-${world.id}` },
    h('header', { class: 'topbar' },
      h('a', { class: 'icon-btn', href: '#/', 'aria-label': 'Retour aux mondes' }, '‹'),
      h('div', { class: 'topbar-title' },
        h('span', { class: 'kicker' }, `Monde ${world.id}`),
        h('span', {}, world.title)),
      h('span', { class: 'topbar-stars' }, `${worldStars(world)} / ${world.levels.length * 3} ★`)),
    h('p', { class: 'world-intro' }, world.subtitle),
    grid));
}
