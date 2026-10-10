/**
 * Balance de Roberval en SVG : deux plateaux qui restent horizontaux, posés sur
 * un fléau qui pivote. Le fléau suit un ressort amorti, d'où l'oscillation douce.
 * Les objets (boîtes, poids) s'empilent sur les plateaux ; ceux qui arrivent
 * tombent, ceux qui partent s'envolent.
 *
 *   const b = createBalance();
 *   b.setEquation(eq);          // met à jour les plateaux (animé)
 *   b.reject(['left']);         // penche puis revient (action refusée)
 *   b.lean(angle);              // penche durablement (mode devinette)
 *   b.reveal(value);            // montre la valeur dans les boîtes
 */
import { s, reducedMotion } from './dom.js';
import { F, formatMember } from '../engine/index.js';

const W = 380, H = 300;
const PIVOT = { x: 190, y: 214 };
const ARM = 120;           // demi-longueur du fléau
const STEM = 20;           // hauteur des tiges sous les plateaux
const PLATE_W = 132;
const MAX_STACK = 172;     // hauteur disponible au-dessus d'un plateau
const MAX_ANGLE = 13;

const ITEM = {
  box: { w: 36, h: 36, gap: 5 },
  unit: { w: 22, h: 17, gap: 3 },
  ten: { w: 47, h: 17, gap: 3 },
  balloon: { w: 22, h: 26, gap: 3 },
  bag: { w: 60, h: 46, gap: 6 },
};

/* ------------------------------------------------------------- dessin des objets */

function drawBox(label) {
  const { w, h } = ITEM.box;
  return [
    s('rect', { class: 'box-body', x: -w / 2, y: -h, width: w, height: h, rx: 7 }),
    s('rect', { class: 'box-lid', x: -w / 2 - 2, y: -h, width: w + 4, height: 9, rx: 4 }),
    s('text', { class: 'box-label', x: 0, y: -h / 2 + 7, 'text-anchor': 'middle' }, label),
  ];
}

function drawUnit() {
  const { w, h } = ITEM.unit;
  return [
    s('rect', { class: 'unit-body', x: -w / 2, y: -h, width: w, height: h, rx: 5 }),
    s('rect', { class: 'unit-shine', x: -w / 2 + 4, y: -h + 3, width: w - 8, height: 3, rx: 1.5 }),
  ];
}

function drawTen() {
  const { w, h } = ITEM.ten;
  return [
    s('rect', { class: 'unit-body', x: -w / 2, y: -h, width: w, height: h, rx: 5 }),
    s('text', { class: 'unit-label', x: 0, y: -4.5, 'text-anchor': 'middle' }, '10'),
  ];
}

function drawBalloon() {
  return [
    s('path', { class: 'balloon-string', d: 'M0 0 q -3 -4 0 -8' }),
    s('ellipse', { class: 'balloon-body', cx: 0, cy: -17, rx: 10, ry: 11 }),
  ];
}

function drawBag(g) {
  const { w, h } = ITEM.bag;
  const inner = formatMember({ x: g.x, c: g.c, groups: [] });
  const k = F.toString(g.k);
  return [
    s('path', { class: 'bag-body', d: `M${-w / 2 + 6} 0 h${w - 12} q6 0 6 -8 l-4 ${-h + 18} q-1 -6 -8 -6 h${-w + 20} q-7 0 -8 6 l-4 ${h - 18} q0 8 6 8z` }),
    s('path', { class: 'bag-tie', d: `M-8 ${-h + 4} l8 6 l8 -6` }),
    s('text', { class: 'bag-label', x: 0, y: -h / 2 + 4, 'text-anchor': 'middle' }, inner),
    k === '1' ? null : s('text', { class: 'bag-factor', x: w / 2 - 4, y: -h + 8, 'text-anchor': 'middle' }, `×${k}`),
  ];
}

/* ------------------------------------------------------------- contenu d'un plateau */

/**
 * Liste des objets d'un membre, du bas vers le haut, avec une clé stable :
 * en retirant 3 poids sur 7, ce sont les clés u4…u6 (ceux du dessus) qui partent.
 */
function itemsOf(m) {
  const items = [];
  m.groups.forEach((g, i) => items.push({ key: `g${i}`, kind: 'bag', group: g }));
  const nx = Math.max(0, Math.floor(F.toNumber(m.x)));
  for (let i = 0; i < nx; i++) items.push({ key: `x${i}`, kind: 'box' });
  const c = Math.floor(F.toNumber(m.c));
  if (c > 0) {
    // Au-delà de 20 poids, on regroupe par dix pour rester lisible.
    const tens = c > 20 ? Math.floor(c / 10) : 0;
    for (let i = 0; i < tens; i++) items.push({ key: `t${i}`, kind: 'ten' });
    for (let i = 0; i < c - tens * 10; i++) items.push({ key: `u${i}`, kind: 'unit' });
  } else {
    for (let i = 0; i < -c; i++) items.push({ key: `b${i}`, kind: 'balloon' });
  }
  return items;
}

/** Range les objets en rangées centrées, du plateau vers le haut. */
function layout(items) {
  const rows = [];
  let row = null;
  for (const it of items) {
    const d = ITEM[it.kind];
    if (!row || row.kind !== it.kind || row.width + d.gap + d.w > PLATE_W - 8) {
      row = { kind: it.kind, items: [], width: -d.gap, height: d.h };
      rows.push(row);
    }
    row.items.push(it);
    row.width += d.gap + d.w;
  }
  const pos = new Map();
  let y = -3;
  for (const r of rows) {
    const d = ITEM[r.kind];
    let x = -r.width / 2 + d.w / 2;
    for (const it of r.items) { pos.set(it.key, { x, y }); x += d.w + d.gap; }
    y -= r.height + 2;
  }
  const height = -y;
  return { pos, scale: height > MAX_STACK ? MAX_STACK / height : 1 };
}

/* ------------------------------------------------------------- balance */

export function createBalance() {
  const plateGroups = {}, stacks = {}, current = { left: new Map(), right: new Map() };

  const beam = s('g', { class: 'beam' },
    s('rect', { class: 'beam-bar', x: PIVOT.x - ARM - 6, y: PIVOT.y - 5, width: ARM * 2 + 12, height: 10, rx: 5 }),
  );
  const svg = s('svg', { class: 'balance', viewBox: `0 0 ${W} ${H}`, role: 'img', 'aria-label': 'Balance' },
    s('ellipse', { class: 'shadow', cx: PIVOT.x, cy: H - 10, rx: 120, ry: 8 }),
    s('path', { class: 'stand', d: `M${PIVOT.x - 70} ${H - 12} q0 -16 16 -18 h108 q16 2 16 18z` }),
    s('rect', { class: 'stand', x: PIVOT.x - 7, y: PIVOT.y, width: 14, height: H - 30 - PIVOT.y + 4 }),
    beam,
  );
  for (const side of ['left', 'right']) {
    const stack = s('g', { class: 'stack' });
    const g = s('g', { class: `plate plate-${side}` },
      s('rect', { class: 'stem', x: -4, y: 0, width: 8, height: STEM }),
      s('path', { class: 'plate-dish', d: `M${-PLATE_W / 2} 0 h${PLATE_W} q-6 9 -16 9 h${-PLATE_W + 32} q-10 0 -16 -9z` }),
      stack,
    );
    plateGroups[side] = g; stacks[side] = stack;
    svg.append(g);
  }
  svg.append(s('circle', { class: 'pivot', cx: PIVOT.x, cy: PIVOT.y, r: 8 }));

  /* ---- ressort amorti du fléau */
  let angle = -7, velocity = 0, target = 0, raf = 0, last = 0;

  function place() {
    const rad = (angle * Math.PI) / 180, cos = Math.cos(rad), sin = Math.sin(rad);
    beam.setAttribute('transform', `rotate(${angle.toFixed(3)} ${PIVOT.x} ${PIVOT.y})`);
    for (const [side, dir] of [['left', -1], ['right', 1]]) {
      const x = PIVOT.x + dir * ARM * cos, y = PIVOT.y + dir * ARM * sin - STEM;
      plateGroups[side].setAttribute('transform', `translate(${x.toFixed(2)} ${y.toFixed(2)})`);
    }
  }

  function tick(now) {
    const dt = Math.min(0.032, (now - last) / 1000 || 0.016);
    last = now;
    const acc = -70 * (angle - target) - 6.5 * velocity;
    velocity += acc * dt;
    angle += velocity * dt;
    place();
    if (Math.abs(angle - target) < 0.02 && Math.abs(velocity) < 0.02) {
      angle = target; place(); raf = 0; return;
    }
    raf = requestAnimationFrame(tick);
  }

  function setTarget(a) {
    target = Math.max(-MAX_ANGLE, Math.min(MAX_ANGLE, a));
    if (reducedMotion()) { angle = target; velocity = 0; place(); return; }
    if (!raf) { last = performance.now(); raf = requestAnimationFrame(tick); }
  }

  place();
  setTarget(0);

  /* ---- objets */
  function render(side, m, labels) {
    const items = itemsOf(m);
    const { pos, scale } = layout(items);
    const stack = stacks[side];
    stack.setAttribute('transform', `scale(${scale.toFixed(3)})`);
    const before = current[side], after = new Map();
    let delay = 0;
    for (const it of items) {
      const p = pos.get(it.key);
      let el = before.get(it.key);
      if (el && el.dataset.kind === it.kind && it.kind !== 'bag') {
        before.delete(it.key);
        el.style.transitionDelay = '0ms';
      } else {
        if (el) { before.delete(it.key); el.remove(); }
        const parts = it.kind === 'box' ? drawBox(labels.box)
          : it.kind === 'unit' ? drawUnit()
          : it.kind === 'ten' ? drawTen()
          : it.kind === 'balloon' ? drawBalloon()
          : drawBag(it.group);
        el = s('g', { class: `item item-${it.kind}`, 'data-kind': it.kind }, parts);
        el.style.transform = `translate(${p.x}px, ${p.y - 140}px)`;
        el.style.opacity = '0';
        stack.append(el);
        // Lecture forcée pour que la transition parte de la position de départ.
        el.getBoundingClientRect();
        el.style.transitionDelay = `${delay}ms`;
        delay += 35;
        el.classList.add('falling');
      }
      el.style.transform = `translate(${p.x}px, ${p.y}px)`;
      el.style.opacity = '1';
      after.set(it.key, el);
    }
    for (const el of before.values()) {
      el.classList.add('leaving');
      const t = el.style.transform.replace(/translate\(([^,]+), ([-\d.]+)px\)/, (_, x, y) => `translate(${x}, ${Number(y) - 70}px)`);
      el.style.transitionDelay = '0ms';
      el.style.transform = t;
      el.style.opacity = '0';
      setTimeout(() => el.remove(), 450);
    }
    current[side] = after;
  }

  let labels = { box: '?' };

  return {
    el: svg,
    setEquation(eq) {
      render('left', eq.left, labels);
      render('right', eq.right, labels);
    },
    /** Action refusée : le côté fautif s'enfonce, puis la balance revient. */
    reject(sides) {
      const dir = sides.length === 1 ? (sides[0] === 'left' ? -1 : 1) : 0;
      if (dir) setTarget(dir * MAX_ANGLE);
      else { velocity += 90; setTarget(0); }
      svg.classList.remove('shake'); svg.getBoundingClientRect(); svg.classList.add('shake');
      setTimeout(() => setTarget(0), 650);
    },
    /** Penche selon l'écart de poids (droite − gauche). */
    lean(diff) { setTarget(Math.sign(diff) * Math.min(MAX_ANGLE, 4 + Math.abs(diff) * 2.5)); },
    settle() { setTarget(0); },
    /** Écrit une valeur dans les boîtes (devinette ou victoire). */
    setBoxLabel(text, cls) {
      labels = { box: text };
      for (const side of ['left', 'right']) {
        for (const el of current[side].values()) {
          if (el.dataset.kind !== 'box') continue;
          el.querySelector('.box-label').textContent = text;
          el.classList.remove('pop', 'revealed');
          el.getBoundingClientRect();
          if (cls) el.classList.add(cls);
        }
      }
    },
  };
}
