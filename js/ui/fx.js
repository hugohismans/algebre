/** Effets : confettis de victoire, petit message éphémère. */
import { h, reducedMotion } from './dom.js';

const COLORS = ['#7c5cff', '#ff9f43', '#12b5a5', '#ff5d73', '#ffd23f'];

/** Pluie de confettis partant d'un point de l'écran. */
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
export function toast(container, text, kind = 'info') {
  container.querySelector('.toast')?.remove();
  const t = h('div', { class: `toast toast-${kind}`, role: 'status' }, text);
  container.append(t);
  setTimeout(() => t.classList.add('out'), 2600);
  setTimeout(() => t.remove(), 3000);
}
