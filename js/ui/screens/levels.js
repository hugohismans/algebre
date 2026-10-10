/** Écran d'un dossier : ses missions, comme des étiquettes de pièces à conviction. */
import { h, stars, redacted } from '../dom.js';
import { worldById } from '../../levels/index.js';
import { levelResult, levelUnlocked, worldUnlocked, worldStars } from '../../state/progress.js';
import { parseEquation, formatEquation } from '../../engine/index.js';

export function levelsScreen(root, { world: worldId }) {
  const world = worldById(worldId);
  if (!world || !worldUnlocked(world)) { location.hash = '#/'; return; }
  const grid = h('ol', { class: 'tags' });
  world.levels.forEach((l, i) => {
    const open = levelUnlocked(world, i);
    const res = levelResult(l.id);
    const eq = formatEquation(parseEquation(l.start));
    const inner = [
      h('span', { class: 'tag-hole', 'aria-hidden': 'true' }),
      h('span', { class: 'tag-num' }, `N° ${i + 1}`),
      h('span', { class: 'tag-eq' }, open ? eq : redacted(eq)),
      open ? stars(res?.stars ?? 0) : h('span', { class: 'tag-locked' }, 'Verrouillé'),
    ];
    grid.append(h('li', {},
      open
        ? h('a', { class: `evidence${res ? ' done' : ''}`, href: `#/monde/${world.id}/niveau/${i + 1}`, 'aria-label': `Mission ${i + 1} : ${eq}` }, inner)
        : h('div', { class: 'evidence locked', 'aria-disabled': 'true' }, inner)));
  });
  root.append(h('main', { class: `screen screen-levels world-${world.id}` },
    h('header', { class: 'topbar' },
      h('a', { class: 'icon-btn', href: '#/', 'aria-label': 'Retour aux dossiers' }, '‹'),
      h('div', { class: 'topbar-title' },
        h('span', { class: 'kicker' }, `Dossier ${String(world.id).padStart(2, '0')}`),
        h('span', {}, world.title)),
      h('span', { class: 'topbar-stars' }, `${worldStars(world)} / ${world.levels.length * 3} ★`)),
    world.briefing
      ? h('div', { class: 'world-briefing', role: 'note' },
        h('span', { class: 'paper-label' }, 'Briefing du dossier'),
        h('p', {}, world.briefing))
      : h('p', { class: 'world-intro' }, world.subtitle),
    grid));
}
