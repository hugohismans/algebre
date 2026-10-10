/**
 * Balance de Roberval en SVG, en laiton, avec un cadran d'équilibre au centre : deux plateaux qui restent horizontaux, posés sur
 * un fléau qui pivote. Le fléau suit un ressort amorti, d'où l'oscillation douce.
 * Les objets (mallettes x, lingots) s'empilent sur les plateaux ; ceux qui arrivent
 * tombent, ceux qui partent s'envolent.
 *
 *   const b = createBalance();
 *   b.setEquation(eq);          // met à jour les plateaux (animé)
 *   b.reject(['left']);         // penche puis revient (action refusée)
 *   b.lean(angle);              // penche durablement (mode devinette)
 *   b.setBoxContents(4);        // ouvre les mallettes : on voit 4 lingots dedans
 *   b.labelBoxes('4', 'pop');   // mallettes fermées, étiquetées « 4 »
 *   b.reveal(value);            // victoire : montre ce que vaut x
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
const GAUGE_R = 44;       // rayon du cadran central

const ITEM = {
  box: { w: 46, h: 44, gap: 4 },
  unit: { w: 24, h: 13, gap: 2 },
  ten: { w: 50, h: 15, gap: 2 },
  antibox: { w: 46, h: 66, gap: 4 },
  balloon: { w: 22, h: 30, gap: 2 },
  bag: { w: 58, h: 42, gap: 6 },
};

/* ------------------------------------------------------------- dessin des objets */

/** Au-delà, la mallette ouverte n'affiche plus son contenu un par un. */
const MAX_INSIDE = 40;

/** Lingots miniatures rangés au fond de la mallette ouverte, du bas vers le haut. */
function insideLayout(n, iw, ih) {
  if (n <= 0) return [];
  let best = null;
  for (let cols = 1; cols <= n; cols++) {
    const rows = Math.ceil(n / cols);
    const w = Math.min(12, (iw - (cols - 1)) / cols, ((ih - (rows - 1)) / rows) * 1.8);
    // À taille égale, on préfère des rangées larges, comme sur les plateaux.
    if (!best || w >= best.w) best = { cols, w };
  }
  const { cols, w } = best, hgt = w / 1.8;
  const out = [];
  for (let i = 0; i < n; i++) {
    const row = Math.floor(i / cols), col = i % cols;
    const inRow = Math.min(cols, n - row * cols);
    out.push({ x: -((inRow * w + (inRow - 1)) / 2) + col * (w + 1), y: -row * (hgt + 1) - hgt, w, h: hgt });
  }
  return out;
}

/**
 * La mallette x. Scellée, elle porte son étiquette (« x », ou une valeur).
 * Ouverte (contents = nombre), on voit les lingots qu'elle contient : ceux qui
 * arrivent (au-delà de prev) tombent dedans.
 */
function drawBox({ label, contents }, prev = contents) {
  const { w, h } = ITEM.box;
  const handle = s('path', { class: 'case-handle', d: `M-7 ${-h + 7} v-4 q0 -4 4 -4 h6 q4 0 4 4 v4` });
  if (contents == null) {
    return [
      handle,
      s('rect', { class: 'case-body', x: -w / 2, y: -h + 7, width: w, height: h - 7, rx: 4 }),
      s('rect', { class: 'case-band', x: -w / 2, y: -h + 13, width: w, height: 3 }),
      s('rect', { class: 'case-lock', x: -4, y: -h + 10, width: 8, height: 8, rx: 1.5 }),
      s('text', { class: 'box-label', x: 0, y: -5, 'text-anchor': 'middle' }, label),
    ];
  }
  const iw = w - 6, ih = h - 13;
  // Contenu négatif : la mallette est pleine de ballons (elle tire vers le haut).
  const neg = contents < 0;
  const minis = insideLayout(Math.min(Math.abs(contents), MAX_INSIDE), iw, ih).map((m, i) => {
    const el = neg
      ? s('ellipse', { class: 'mini-balloon', cx: m.x + m.w / 2, cy: -3 + m.y + m.h / 2, rx: m.w / 2.4, ry: m.h / 1.3 })
      : s('rect', { class: 'mini-ingot', x: m.x, y: -3 + m.y, width: m.w, height: m.h, rx: 1 });
    if (i >= prev) {
      el.classList.add('mini-new');
      el.style.animationDelay = `${Math.min(i - prev, 12) * 45}ms`;
    }
    return el;
  });
  return [
    handle,
    s('rect', { class: 'case-body', x: -w / 2, y: -h + 7, width: w, height: h - 7, rx: 4 }),
    s('rect', { class: 'case-window', x: -iw / 2, y: -h + 10, width: iw, height: ih + 1, rx: 2 }),
    ...minis,
    s('circle', { class: 'case-badge', cx: w / 2 - 1, cy: -h + 8, r: 8.5 }),
    s('text', { class: 'case-badge-text', x: w / 2 - 1, y: -h + 11.5, 'text-anchor': 'middle' }, neg ? `\u2212${-contents}` : String(contents)),
  ];
}

/** Mallette-ballon : une mallette x accrochée à un ballon espion, elle compte pour −x. */
function drawAntiBox() {
  const { w } = ITEM.box, h = ITEM.box.h;
  return [
    s('path', { class: 'balloon-string', d: `M0 ${-h - 2} q -4 -7 0 -14` }),
    s('ellipse', { class: 'balloon-body', cx: 0, cy: -h - 24, rx: 9, ry: 10 }),
    s('ellipse', { class: 'balloon-shine', cx: -3, cy: -h - 28, rx: 2.5, ry: 3.5 }),
    s('path', { class: 'case-handle', d: `M-7 ${-h + 7} v-4 q0 -4 4 -4 h6 q4 0 4 4 v4` }),
    s('rect', { class: 'case-body anti', x: -w / 2, y: -h + 7, width: w, height: h - 7, rx: 4 }),
    s('rect', { class: 'case-band', x: -w / 2, y: -h + 13, width: w, height: 3 }),
    s('text', { class: 'box-label', x: 0, y: -5, 'text-anchor': 'middle' }, '\u2212x'),
  ];
}

/** Un lingot d'or, qui vaut 1. */
function drawUnit() {
  const { w, h } = ITEM.unit;
  return [
    s('path', { class: 'ingot-body', d: `M${-w / 2} 0 h${w} l-4 ${-h} h${-w + 8}z` }),
    s('path', { class: 'ingot-top', d: `M${-w / 2 + 4} ${-h} h${w - 8} l-1.5 3 h${-w + 11}z` }),
  ];
}

/** Un gros lingot qui vaut 10 (au-delà de 20 lingots). */
function drawTen() {
  const { w, h } = ITEM.ten;
  return [
    s('path', { class: 'ingot-body', d: `M${-w / 2} 0 h${w} l-4 ${-h} h${-w + 8}z` }),
    s('text', { class: 'ingot-label', x: 0, y: -4.5, 'text-anchor': 'middle' }, '10'),
  ];
}

/** Un ballon espion : il tire le plateau vers le haut, il vaut −1. */
function drawBalloon() {
  return [
    s('path', { class: 'balloon-string', d: 'M0 0 q -4 -5 0 -10' }),
    s('ellipse', { class: 'balloon-body', cx: 0, cy: -20, rx: 9.5, ry: 10.5 }),
    s('ellipse', { class: 'balloon-shine', cx: -3, cy: -24, rx: 2.5, ry: 3.5 }),
  ];
}

/**
 * Un pli scellé (parenthèses) : une enveloppe qui contient « x + 3 ».
 * 2(x + 3) se dessine comme deux enveloppes identiques ; un facteur qui ne se
 * compte pas en enveloppes s'écrit dessus (×1/2…).
 */
function drawEnvelope(g, factor) {
  const { w, h } = ITEM.bag;
  return [
    s('rect', { class: 'env-body', x: -w / 2, y: -h, width: w, height: h, rx: 3 }),
    s('path', { class: 'env-flap', d: `M${-w / 2 + 1} ${-h + 1} L0 ${-h + 17} L${w / 2 - 1} ${-h + 1}` }),
    s('circle', { class: 'env-seal', cx: 0, cy: -h + 16, r: 5 }),
    s('text', { class: 'env-label', x: 0, y: -7, 'text-anchor': 'middle' }, formatMember({ x: g.x, c: g.c, groups: [] })),
    factor ? s('text', { class: 'env-factor', x: w / 2 - 3, y: -h - 3, 'text-anchor': 'end' }, `×${factor}`) : null,
  ];
}

/* ------------------------------------------------------------- contenu d'un plateau */

/**
 * Liste des objets d'un membre, du bas vers le haut, avec une clé stable :
 * en retirant 3 poids sur 7, ce sont les clés u4…u6 (ceux du dessus) qui partent.
 */
function itemsOf(m) {
  const items = [];
  m.groups.forEach((g, i) => {
    const sig = `bag:${formatMember({ x: g.x, c: g.c, groups: [] })}`;
    const k = F.toNumber(g.k);
    if (F.isInt(g.k) && k > 0 && k <= 6) {
      for (let j = 0; j < k; j++) items.push({ key: `g${i}-${j}`, kind: 'bag', sig, group: g });
    } else {
      items.push({ key: `g${i}`, kind: 'bag', sig: `${sig}×${F.toString(g.k)}`, group: g, factor: F.toString(g.k) });
    }
  });
  const nx = Math.floor(F.toNumber(m.x));
  for (let i = 0; i < nx; i++) items.push({ key: `x${i}`, kind: 'box' });
  const c = Math.floor(F.toNumber(m.c));
  if (c > 0) {
    // Au-delà de 20 poids, on regroupe par dix pour rester lisible.
    const tens = c > 20 ? Math.floor(c / 10) : 0;
    for (let i = 0; i < tens; i++) items.push({ key: `t${i}`, kind: 'ten' });
    for (let i = 0; i < c - tens * 10; i++) items.push({ key: `u${i}`, kind: 'unit' });
  }
  // Ce qui tire vers le haut se range au-dessus : mallettes-ballons, puis ballons.
  for (let i = 0; i < -nx; i++) items.push({ key: `a${i}`, kind: 'antibox' });
  for (let i = 0; i < -c; i++) items.push({ key: `b${i}`, kind: 'balloon' });
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
    s('path', { class: 'needle', d: `M${PIVOT.x - 3} ${PIVOT.y} L${PIVOT.x} ${PIVOT.y - GAUGE_R + 4} L${PIVOT.x + 3} ${PIVOT.y}z` }),
    s('rect', { class: 'beam-bar', x: PIVOT.x - ARM - 6, y: PIVOT.y - 5, width: ARM * 2 + 12, height: 10, rx: 5 }),
  );
  // Cadran gradué derrière l'aiguille : l'équilibre se lit au centre.
  const ticks = [];
  for (let a = -30; a <= 30; a += 7.5) {
    const r = (a - 90) * Math.PI / 180, long = a === 0;
    const r1 = GAUGE_R - (long ? 10 : 6), r2 = GAUGE_R;
    ticks.push(s('line', {
      class: long ? 'tick tick-zero' : 'tick',
      x1: PIVOT.x + r1 * Math.cos(r), y1: PIVOT.y + r1 * Math.sin(r),
      x2: PIVOT.x + r2 * Math.cos(r), y2: PIVOT.y + r2 * Math.sin(r),
    }));
  }
  const arc = (rad) => {
    const p = (a) => [PIVOT.x + rad * Math.cos((a - 90) * Math.PI / 180), PIVOT.y + rad * Math.sin((a - 90) * Math.PI / 180)];
    const [x1, y1] = p(-36), [x2, y2] = p(36);
    return `M${x1} ${y1} A${rad} ${rad} 0 0 1 ${x2} ${y2}`;
  };
  const gauge = s('g', { class: 'gauge' },
    s('path', { class: 'gauge-face', d: `${arc(GAUGE_R + 6)} L${PIVOT.x} ${PIVOT.y}z` }),
    ticks);
  const svg = s('svg', { class: 'balance', viewBox: `0 0 ${W} ${H}`, role: 'img', 'aria-label': 'Balance' },
    s('ellipse', { class: 'shadow', cx: PIVOT.x, cy: H - 10, rx: 120, ry: 8 }),
    s('path', { class: 'stand', d: `M${PIVOT.x - 70} ${H - 12} q0 -16 16 -18 h108 q16 2 16 18z` }),
    s('rect', { class: 'stand', x: PIVOT.x - 7, y: PIVOT.y, width: 14, height: H - 30 - PIVOT.y + 4 }),
    gauge,
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
  function render(side, m) {
    const items = itemsOf(m);
    const { pos, scale } = layout(items);
    const stack = stacks[side];
    stack.setAttribute('transform', `scale(${scale.toFixed(3)})`);
    const before = current[side], after = new Map();
    let delay = 0;
    for (const it of items) {
      const p = pos.get(it.key);
      let el = before.get(it.key);
      if (el && el.dataset.sig === (it.sig ?? it.kind)) {
        before.delete(it.key);
        el.style.transitionDelay = '0ms';
      } else {
        if (el) { before.delete(it.key); el.remove(); }
        const parts = it.kind === 'box' ? drawBox(box)
          : it.kind === 'antibox' ? drawAntiBox()
          : it.kind === 'unit' ? drawUnit()
          : it.kind === 'ten' ? drawTen()
          : it.kind === 'balloon' ? drawBalloon()
          : drawEnvelope(it.group, it.factor);
        el = s('g', { class: `item item-${it.kind}`, 'data-kind': it.kind, 'data-sig': it.sig ?? it.kind }, parts);
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
      // Les ballons s'envolent haut (ils annulent un lingot) ; le reste s'efface en montant.
      const rise = el.dataset.kind === 'balloon' ? 180 : 70;
      const t = el.style.transform.replace(/translate\(([^,]+), ([-\d.]+)px\)/, (_, x, y) => `translate(${x}, ${Number(y) - rise}px)`);
      el.style.transitionDelay = '0ms';
      el.style.transform = t;
      el.style.opacity = '0';
      setTimeout(() => el.remove(), 750);
    }
    current[side] = after;
  }

  /** État commun à toutes les mallettes (elles sont identiques). */
  const box = { label: 'x', contents: null };
  function eachBox(fn) {
    for (const side of ['left', 'right']) {
      for (const el of current[side].values()) if (el.dataset.kind === 'box') fn(el);
    }
  }
  function repaintBoxes(prev, cls) {
    eachBox((el) => {
      el.replaceChildren(...drawBox(box, prev));
      el.classList.remove('pop', 'revealed');
      el.getBoundingClientRect();
      if (cls) el.classList.add(cls);
    });
  }

  return {
    el: svg,
    setEquation(eq) {
      render('left', eq.left);
      render('right', eq.right);
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
    /**
     * Ouvre les mallettes et y montre n lingots (null : les referme).
     * Les lingots ajoutés depuis l'appel précédent tombent dedans.
     */
    setBoxContents(n, cls) {
      const prev = box.contents ?? 0;
      box.contents = n;
      repaintBoxes(n == null ? 0 : prev, cls);
    },
    /** Mallettes scellées avec une étiquette (« x », ou la valeur qu'on teste). */
    labelBoxes(text, cls) {
      box.contents = null;
      box.label = text;
      repaintBoxes(0, cls);
    },
    /** Victoire : on ouvre les mallettes, ou on écrit la valeur si elle ne se compte pas en lingots. */
    reveal(value) {
      if (F.isInt(value) && Math.abs(F.toNumber(value)) <= MAX_INSIDE) {
        this.setBoxContents(F.toNumber(value), 'revealed');
      } else {
        box.contents = null;
        box.label = F.toString(value).replace('-', '\u2212');
        repaintBoxes(0, 'revealed');
      }
    },
    /** Remet les mallettes dans leur état de départ (scellées, ou ouvertes avec n lingots). */
    resetBoxes(contents = null) {
      box.label = 'x';
      box.contents = contents;
      repaintBoxes(contents ?? 0);
    },
    /** Petit sursaut des mallettes (au moment de peser). */
    pulseBoxes() {
      eachBox((el) => { el.classList.remove('pop'); el.getBoundingClientRect(); el.classList.add('pop'); });
    },
  };
}
