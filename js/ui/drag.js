/**
 * Glisser-déposer au doigt comme à la souris, avec les Pointer Events.
 * Un fantôme de l'élément suit le pointeur ; lâché sur la zone de dépôt, il
 * déclenche onDrop, sinon il revient à sa place. Un simple appui (ou Entrée au
 * clavier) reste un clic ordinaire : le jeu l'écoute à part.
 *
 *   makeDraggable(card, { zone: () => stageEl, onDrop, onHover, enabled })
 */
const THRESHOLD = 8;

export function makeDraggable(el, { zone, onDrop, onHover = () => {}, enabled = () => true }) {
  let start = null, ghost = null, over = false, suppressClick = false;

  const isOver = (x, y) => {
    const r = zone().getBoundingClientRect();
    return x >= r.left && x <= r.right && y >= r.top && y <= r.bottom;
  };

  function begin(e) {
    const r = el.getBoundingClientRect();
    ghost = el.cloneNode(true);
    ghost.classList.add('drag-ghost');
    ghost.removeAttribute('id');
    ghost.setAttribute('aria-hidden', 'true');
    Object.assign(ghost.style, { left: `${r.left}px`, top: `${r.top}px`, width: `${r.width}px`, height: `${r.height}px` });
    document.body.append(ghost);
    el.classList.add('drag-source');
    start.offset = { x: e.clientX - r.left, y: e.clientY - r.top, left: r.left, top: r.top };
  }

  function move(e) {
    const dx = e.clientX - start.x, dy = e.clientY - start.y;
    ghost.style.transform = `translate(${dx}px, ${dy}px) rotate(${Math.max(-8, Math.min(8, dx / 25))}deg) scale(1.08)`;
    const now = isOver(e.clientX, e.clientY);
    if (now !== over) { over = now; onHover(over); }
  }

  function end(dropped) {
    el.classList.remove('drag-source');
    if (over) onHover(false);
    const g = ghost;
    ghost = null; start = null; over = false;
    if (!g) return;
    if (dropped) {
      g.classList.add('drag-drop');
      setTimeout(() => g.remove(), 220);
    } else {
      g.classList.add('drag-return');
      g.style.transform = 'translate(0, 0)';
      setTimeout(() => g.remove(), 260);
    }
  }

  el.addEventListener('pointerdown', (e) => {
    if (e.button !== 0 || !enabled()) return;
    start = { x: e.clientX, y: e.clientY, id: e.pointerId };
    el.setPointerCapture(e.pointerId);
  });
  el.addEventListener('pointermove', (e) => {
    if (!start || e.pointerId !== start.id) return;
    if (!ghost) {
      if (Math.hypot(e.clientX - start.x, e.clientY - start.y) < THRESHOLD) return;
      begin(e);
    }
    move(e);
  });
  el.addEventListener('pointerup', (e) => {
    if (!start || e.pointerId !== start.id) return;
    if (!ghost) { start = null; return; } // simple appui : le clic suivra
    suppressClick = true;
    const dropped = over && enabled();
    end(dropped);
    if (dropped) onDrop();
  });
  el.addEventListener('pointercancel', () => { if (start) end(false); });
  // Après un glisser, le navigateur peut émettre un clic : on l'ignore.
  el.addEventListener('click', (e) => {
    if (suppressClick) { suppressClick = false; e.stopImmediatePropagation(); e.preventDefault(); }
  }, true);
}
