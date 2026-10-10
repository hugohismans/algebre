/** Écran d'accueil : les dossiers (mondes) de l'agence. */
import { h, s, star, stamp, redacted } from '../dom.js';
import { WORLDS } from '../../levels/index.js';
import { worldStars, worldUnlocked, worldDone, totalStars, unlockAllEnabled, setUnlockAll } from '../../state/progress.js';
import { GAME_TITLE } from '../../config.js';

/** Logo : une loupe sur l'inconnue x. */
export function logo() {
  return s('svg', { class: 'logo', viewBox: '0 0 64 64', 'aria-hidden': 'true' },
    s('line', { class: 'logo-handle', x1: 39, y1: 39, x2: 56, y2: 56 }),
    s('circle', { class: 'logo-lens', cx: 26, cy: 26, r: 19 }),
    s('text', { class: 'logo-x', x: 26, y: 34, 'text-anchor': 'middle' }, 'x'));
}

const pad = (n) => String(n).padStart(2, '0');

export function worldsScreen(root) {
  const max = WORLDS.reduce((n, w) => n + w.levels.length * 3, 0);
  const list = h('ol', { class: 'folders' });
  for (const w of WORLDS) {
    const open = worldUnlocked(w);
    const done = worldDone(w);
    const status = w.upcoming ? stamp('Bientôt', 'stamp-grey')
      : !open ? stamp('Classifié', 'stamp-grey')
      : done ? stamp('Classé')
      : null;
    const inner = [
      h('span', { class: 'folder-tab' }, `Dossier ${pad(w.id)}`),
      h('span', { class: 'folder-title' }, w.title),
      h('span', { class: 'folder-sub' }, open ? w.subtitle : redacted(w.subtitle)),
      open ? h('span', { class: 'folder-stars' }, star(true), ` ${worldStars(w)} / ${w.levels.length * 3}`) : null,
      status,
    ];
    list.append(h('li', {},
      open
        ? h('a', { class: `folder world-${w.id}${done ? ' done' : ''}`, href: `#/monde/${w.id}` }, inner)
        : h('div', { class: `folder world-${w.id} locked`, 'aria-disabled': 'true' }, inner)));
  }
  const teacher = unlockAllEnabled();
  const toggle = h('input', { type: 'checkbox', role: 'switch', class: 'switch-input', id: 'teacher-mode' });
  toggle.checked = teacher;
  toggle.addEventListener('change', () => {
    setUnlockAll(toggle.checked);
    // On redessine l'accueil sur place, sans perdre la position de défilement.
    const y = window.scrollY;
    root.replaceChildren();
    worldsScreen(root);
    window.scrollTo(0, y);
    document.getElementById('teacher-mode')?.focus();
  });
  root.append(h('main', { class: `screen screen-worlds${teacher ? ' teacher' : ''}` },
    h('header', { class: 'hero' },
      logo(),
      h('p', { class: 'hero-kicker' }, 'Agence des affaires inconnues'),
      h('h1', {}, GAME_TITLE),
      h('p', { class: 'tagline' }, 'Chaque équation cache une inconnue. Ta mission : découvrir ce que vaut x, sans jamais déséquilibrer la balance.'),
      h('p', { class: 'total' }, star(true), ` ${totalStars()} / ${max}`),
      teacher ? h('p', { class: 'teacher-badge' }, stamp('Mode enseignant', 'stamp-teacher')) : null),
    list,
    h('section', { class: 'teacher-panel', 'aria-label': 'Mode enseignant' },
      h('label', { class: 'switch', for: 'teacher-mode' },
        toggle,
        h('span', { class: 'switch-track', 'aria-hidden': 'true' }, h('span', { class: 'switch-thumb' })),
        h('span', { class: 'switch-text' },
          h('strong', {}, 'Mode enseignant'),
          h('span', {}, 'Débloque tous les dossiers et toutes les missions pour tester. La progression est conservée.'))))));
}
