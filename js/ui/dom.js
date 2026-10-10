/** Petits outils DOM : création d'éléments HTML et SVG. */

const SVG_NS = 'http://www.w3.org/2000/svg';

/** Typographie française : espace fine insécable avant : ; ! ? (pas de retour à la ligne). */
export const typo = (t) => String(t).replace(/ ([:;!?])/g, '\u202F$1');

function build(el, attrs, children) {
  for (const [k, v] of Object.entries(attrs ?? {})) {
    if (v == null || v === false) continue;
    if (k.startsWith('on') && typeof v === 'function') el.addEventListener(k.slice(2), v);
    else if (k === 'text') el.textContent = typo(v);
    else if (k === 'style' && typeof v === 'object') Object.assign(el.style, v);
    else el.setAttribute(k, v === true ? '' : v);
  }
  for (const c of children.flat(Infinity)) {
    if (c == null || c === false) continue;
    el.append(c instanceof Node ? c : document.createTextNode(typo(c)));
  }
  return el;
}

/** h('button', { class: 'card', onclick }, 'texte', autreElement) */
export const h = (tag, attrs, ...children) => build(document.createElement(tag), attrs, children);

/** s('rect', { x: 0, y: 0, width: 10, height: 10 }) */
export const s = (tag, attrs, ...children) => build(document.createElementNS(SVG_NS, tag), attrs, children);

export const reducedMotion = () => window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;

export const wait = (ms) => new Promise((r) => setTimeout(r, reducedMotion() ? Math.min(ms, 60) : ms));

/** Petite icône étoile (pleine ou vide). */
export function star(filled, cls = '') {
  return s('svg', { viewBox: '0 0 24 24', class: `star ${filled ? 'on' : 'off'} ${cls}`, 'aria-hidden': 'true' },
    s('path', { d: 'M12 2.6l2.9 5.9 6.5.9-4.7 4.6 1.1 6.5L12 17.4l-5.8 3.1 1.1-6.5L2.6 9.4l6.5-.9z' }));
}

export function stars(n, total = 3, cls = '') {
  return h('span', { class: `stars ${cls}`, 'aria-label': `${n} étoile${n > 1 ? 's' : ''} sur ${total}` },
    Array.from({ length: total }, (_, i) => star(i < n)));
}
