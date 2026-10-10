/** Main de cartes d'opération. Chaque carte se glisse sur la balance ou se touche. */
import { h } from './dom.js';
import { makeDraggable } from './drag.js';
import { F, formatOp } from '../engine/index.js';

const FAMILY = { add: 'weights', sub: 'weights', mul: 'scale', div: 'scale', addX: 'boxes', removeX: 'boxes', distribute: 'bags' };

function caption(op) {
  const n = op.n ? F.toNumber(op.n) : 0;
  switch (op.type) {
    case 'add': return `ajouter ${n} lingot${n > 1 ? 's' : ''}`;
    case 'sub': return `retirer ${n} lingot${n > 1 ? 's' : ''}`;
    case 'mul': return `multiplier par ${n}`;
    case 'div': return `partager en ${n}`;
    case 'addX': return n === 1 ? 'ajouter une mallette' : `ajouter ${n} mallettes`;
    case 'removeX': return n === 1 ? 'retirer une mallette' : `retirer ${n} mallettes`;
    case 'distribute': return 'ouvrir les plis';
    default: return '';
  }
}

/**
 * renderHand(ops, { zone, onPlay, onHover, enabled }) → élément de la main.
 * onPlay(op, cardEl) est appelé au dépôt sur la balance ou au clic.
 */
export function renderHand(ops, { zone, onPlay, onHover, enabled }) {
  const hand = h('div', { class: 'hand', role: 'group', 'aria-label': 'Cartes d\'opération' });
  for (const op of ops) {
    const label = formatOp(op);
    const card = h('button', {
      class: `card card-${FAMILY[op.type]}${label.length > 4 ? ' card-long' : ''}`, type: 'button',
      'aria-label': `${label} : ${caption(op)} de chaque côté`,
    },
    h('span', { class: 'card-label' }, label),
    h('span', { class: 'card-caption' }, caption(op)));
    // Le glisser d'abord : son écouteur de clic doit passer avant celui du jeu.
    makeDraggable(card, { zone, onHover, enabled, onDrop: () => onPlay(op, card) });
    card.addEventListener('click', () => { if (enabled()) onPlay(op, card); });
    hand.append(card);
  }
  return hand;
}
