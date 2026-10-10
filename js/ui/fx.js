/** Effets : confettis de victoire, petit message éphémère. */
import { h, reducedMotion } from './dom.js';

const COLORS = ['#f2c14e', '#e8d9b0', '#c8372d', '#f7e7b4', '#2f3542'];

/** Pluie de confettis (paillettes d'or et bouts de papier) partant d'un point. */
export function confetti(x, y, count = 36) {
  if (reducedMotion()) return;
  const layer = h('div', { class: 'confetti', 'aria-hidden': 'true' });
  for (let i = 0; i < count; i++) {
    const a = (Math.random() * Math.PI) + Math.PI; // vers le haut
    const v = 120 + Math.random() * 220;
    const p = h('i', { style: {
      left: `${x}px`, top: `${y}px`, background: COLORS[i % COLORS.length],
      animationDelay: `${Math.random() * 80}ms`,
    } });
    p.style.setProperty('--dx', `${Math.cos(a) * v}px`);
    p.style.setProperty('--dy', `${Math.sin(a) * v}px`);
    p.style.setProperty('--r', `${Math.random() * 720 - 360}deg`);
    layer.append(p);
  }
  document.body.append(layer);
  setTimeout(() => layer.remove(), 1600);
}

/** Message éphémère (refus d'une carte, indice). Un seul à la fois par conteneur. */
export function toast(container, text, kind = 'info', title = '') {
  container.querySelector('.toast')?.remove();
  const t = h('div', { class: `toast toast-${kind}`, role: 'status' },
    title ? h('strong', { class: 'toast-title' }, title) : null, text);
  container.append(t);
  setTimeout(() => t.classList.add('out'), 2600);
  setTimeout(() => t.remove(), 3000);
}
