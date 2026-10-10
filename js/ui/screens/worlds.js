/** Écran d'accueil : la liste des mondes. */
import { h, s, star } from '../dom.js';
import { WORLDS } from '../../levels/index.js';
import { worldStars, worldUnlocked, worldDone, totalStars } from '../../state/progress.js';

/** Petit logo : une balance stylisée. */
export function logo() {
  return s('svg', { class: 'logo', viewBox: '0 0 48 48', 'aria-hidden': 'true' },
    s('path', { class: 'logo-stand', d: 'M24 14v24M14 40h20' }),
    s('path', { class: 'logo-beam', d: 'M6 14h36' }),
    s('rect', { class: 'logo-box', x: 4, y: 3, width: 10, height: 10, rx: 2 }),
    s('rect', { class: 'logo-weight', x: 34, y: 8, width: 6, height: 5, rx: 1.5 }),
    s('rect', { class: 'logo-weight', x: 34, y: 2.5, width: 6, height: 5, rx: 1.5 }),
    s('circle', { class: 'logo-pivot', cx: 24, cy: 14, r: 3 }));
}

export function worldsScreen(root) {
  const max = WORLDS.reduce((n, w) => n + w.levels.length * 3, 0);
  const list = h('ol', { class: 'world-list' });
  for (const w of WORLDS) {
    const open = worldUnlocked(w);
    const done = worldDone(w);
    const status = w.upcoming
      ? h('span', { class: 'tag' }, 'Bientôt')
      : open
        ? h('span', { class: 'world-stars' }, star(true), ` ${worldStars(w)} / ${w.levels.length * 3}`)
        : h('span', { class: 'tag', title: 'Termine le monde précédent' }, '🔒');
    const inner = [
      h('span', { class: 'world-num' }, String(w.id)),
      h('span', { class: 'world-text' },
        h('span', { class: 'world-title' }, w.title),
        h('span', { class: 'world-sub' }, w.subtitle)),
      status,
    ];
    list.append(h('li', {},
      open
        ? h('a', { class: `world-card world-${w.id}${done ? ' done' : ''}`, href: `#/monde/${w.id}` }, inner)
        : h('div', { class: `world-card world-${w.id} locked`, 'aria-disabled': 'true' }, inner)));
  }
  root.append(h('main', { class: 'screen screen-worlds' },
    h('header', { class: 'hero' },
      logo(),
      h('h1', {}, 'Équilibre'),
      h('p', { class: 'tagline' }, 'Résous les équations en gardant la balance à l\'équilibre.'),
      h('p', { class: 'total' }, star(true), ` ${totalStars()} / ${max}`)),
    list));
}
