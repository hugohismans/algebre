/**
 * Écran de jeu : la balance, l'équation écrite, les cartes (ou le pavé de
 * devinette du monde 1), annuler / recommencer et la victoire.
 */
import { h, stars, wait, typo, stamp, typewrite } from '../dom.js';
import { createBalance } from '../balance.js';
import { renderHand } from '../cards.js';
import { confetti, toast } from '../fx.js';
import {
  F, parseEquation, parseOp, validate, isSolved, solve, evaluate,
  formatEquation, formatValue, formatOp,
} from '../../engine/index.js';
import { getLevel, WORLDS } from '../../levels/index.js';
import { levelUnlocked, recordWin } from '../../state/progress.js';
import { starsFor } from '../../state/scoring.js';

const WHERE = { left: 'à gauche', right: 'à droite', both: 'des deux côtés' };

function refusal(reason, sides) {
  const where = WHERE[sides.length === 2 ? 'both' : sides[0]] ?? '';
  switch (reason) {
    case 'not-enough-weights': return `Pas assez de lingots ${where}.`;
    case 'not-enough-boxes': return `Pas assez de mallettes ${where}.`;
    case 'not-divisible': return `Impossible de faire des parts égales ${where} sans couper une mallette ou un lingot.`;
    case 'negative': return 'Un plateau ne peut pas peser moins que rien.';
    case 'zero': return 'On ne multiplie pas et on ne divise pas par 0.';
    case 'nothing-to-distribute': return 'Aucun pli scellé à ouvrir.';
    default: return 'Cette carte ne marche pas ici.';
  }
}

/** « 2x + 1 » avec x remplacé par une valeur : « 2 × 4 + 1 ». */
function substitute(m, value) {
  const v = formatValue(value);
  const parts = [];
  if (!F.isZero(m.x)) parts.push(F.eq(m.x, F.ONE) ? v : `${formatValue(m.x)} × ${v}`);
  if (!F.isZero(m.c)) parts.push(formatValue(m.c));
  return parts.join(' + ') || '0';
}

function nextTarget(lvl) {
  const { world, index } = lvl;
  if (index + 1 < world.levels.length) return { href: `#/monde/${world.id}/niveau/${index + 2}`, label: 'Mission suivante' };
  const nextWorld = WORLDS[WORLDS.indexOf(world) + 1];
  if (nextWorld && !nextWorld.upcoming) return { href: `#/monde/${nextWorld.id}`, label: 'Dossier suivant' };
  return { href: '#/', label: 'Retour aux dossiers' };
}

export function gameScreen(root, params) {
  const lvl = getLevel(params.world, params.level - 1);
  if (!lvl || !levelUnlocked(lvl.world, lvl.index)) { location.hash = '#/'; return; }

  const start = parseEquation(lvl.start);
  const ops = lvl.cards.map(parseOp);
  const guess = lvl.mode === 'guess';
  const solution = solve(start).value;

  let history = [start];
  let played = [];
  let tries = 0;
  let busy = false, won = false;
  const current = () => history[history.length - 1];
  const moves = () => (guess ? tries : played.length);

  /* ---------------------------------------------------------------- DOM */
  const balance = createBalance();
  // Premières devinettes : mallettes ouvertes et vides, que le joueur remplit.
  const openCase = guess && !!lvl.openCase;
  if (openCase) balance.setBoxContents(0);
  const stage = h('div', { class: 'stage' }, balance.el);
  const counter = h('span', { class: 'counter', 'aria-live': 'polite' });
  const undoBtn = h('button', { class: 'icon-btn', type: 'button', 'aria-label': 'Annuler le dernier coup', title: 'Annuler (Z)', onclick: undo }, '↶');
  const restartBtn = h('button', { class: 'icon-btn', type: 'button', 'aria-label': 'Recommencer le niveau', title: 'Recommencer (R)', onclick: restart }, '⟲');

  const eqPrev = h('div', { class: 'eq-prev' });
  const eqCurrent = h('div', { class: 'eq-current', 'aria-live': 'polite' });
  const eqNote = h('div', { class: 'eq-note' });
  const eqPanel = h('section', { class: 'equation', 'aria-label': 'Équation' },
    h('span', { class: 'paper-label', 'aria-hidden': 'true' }, 'Rapport'), eqPrev, eqCurrent, eqNote);

  const intro = lvl.intro
    ? h('div', { class: 'intro', role: 'note' },
      h('div', { class: 'intro-text' },
        h('span', { class: 'paper-label' }, 'Briefing'),
        h('p', {}, lvl.intro)),
      h('button', { class: 'intro-ok', type: 'button', onclick: () => intro.remove() }, 'Compris'))
    : null;

  const controls = guess ? guessPanel() : renderHand(ops, {
    zone: () => stage,
    enabled: () => !busy && !won,
    onHover: (on) => stage.classList.toggle('drop-hover', on),
    onPlay: play,
  });

  const screen = h('main', { class: `screen screen-game world-${lvl.world.id} display-${lvl.display}${guess ? ' mode-guess' : ''}` },
    h('header', { class: 'topbar' },
      h('a', { class: 'icon-btn', href: `#/monde/${lvl.world.id}`, 'aria-label': 'Retour aux missions' }, '‹'),
      h('div', { class: 'topbar-title' },
        h('span', { class: 'kicker' }, `Dossier ${String(lvl.world.id).padStart(2, '0')} · ${lvl.world.title}`),
        h('span', {}, `Mission ${lvl.index + 1}`)),
      guess ? null : undoBtn,
      guess ? null : restartBtn),
    h('div', { class: 'play' },
      intro,
      stage,
      eqPanel,
      h('div', { class: 'status' }, counter),
      controls));
  root.append(screen);

  /* ---------------------------------------------------------------- état → écran */
  function update({ animateEq = true } = {}) {
    const eq = current();
    balance.setEquation(eq);
    if (animateEq) typewrite(eqCurrent, formatEquation(eq));
    else { eqCurrent.__typing = (eqCurrent.__typing ?? 0) + 1; eqCurrent.textContent = formatEquation(eq); }
    if (!guess && played.length) {
      eqPrev.textContent = formatEquation(history[history.length - 2]);
      eqNote.textContent = `${formatOp(played[played.length - 1])} des deux côtés`;
    } else {
      eqPrev.textContent = '';
      if (!guess) eqNote.textContent = '';
    }
    counter.textContent = typo(guess
      ? `Essais : ${tries} · Par : ${lvl.par}`
      : `Coups : ${played.length} · Par : ${lvl.par}`);
    undoBtn.disabled = played.length === 0 || won;
    restartBtn.disabled = won;
  }

  /* ---------------------------------------------------------------- cartes */
  function play(op, card) {
    if (busy || won) return;
    const v = validate(current(), op, lvl.rules);
    if (!v.ok) {
      balance.reject(v.sides);
      toast(stage, refusal(v.reason, v.sides), 'warn', 'Refusé');
      card.classList.remove('nope'); void card.offsetWidth; card.classList.add('nope');
      return;
    }
    stage.querySelector('.toast')?.remove();
    history.push(v.result);
    played.push(op);
    update();
    const solved = isSolved(v.result);
    if (solved) win(solved.value);
  }

  function undo() {
    if (busy || won || !played.length) return;
    history.pop(); played.pop();
    update();
  }

  function restart() {
    if (busy || won) return;
    history = [start]; played = [];
    update();
  }

  /* ---------------------------------------------------------------- devinette */
  function guessPanel() {
    let value = 0;
    const out = h('output', { class: 'guess-value', 'aria-live': 'polite' }, '0');
    // Mallette ouverte : chaque appui la remplit (ou la vide). Fermée : elle
    // redevient « x » jusqu'au prochain test.
    const set = (v) => {
      const next = Math.max(0, Math.min(40, v));
      if (next === value || busy || won) return;
      value = next;
      out.textContent = String(value);
      if (openCase) balance.setBoxContents(value);
      else balance.labelBoxes('x');
      balance.settle();
    };
    const btn = (label, aria, d) => h('button', { class: 'round-btn', type: 'button', 'aria-label': aria, onclick: () => set(value + d) }, label);
    const tryBtn = h('button', { class: 'primary', type: 'button', onclick: () => tryValue(value) }, 'Tester');
    const panel = h('div', { class: 'guess' },
      h('div', { class: 'guess-row' },
        h('span', { class: 'guess-x' }, 'x ='),
        btn('−', 'Diminuer', -1), out, btn('+', 'Augmenter', 1)),
      tryBtn);
    panel.reset = () => { value = 0; out.textContent = '0'; };
    return panel;
  }

  async function tryValue(value) {
    if (busy || won) return;
    busy = true;
    tries++;
    const v = F.frac(value);
    const eq = current();
    const l = evaluate(eq.left, v), r = evaluate(eq.right, v);
    const c = F.cmp(l, r);
    if (openCase) balance.pulseBoxes();
    else balance.labelBoxes(String(value), 'pop');
    eqPrev.textContent = formatEquation(eq);
    typewrite(eqCurrent, `${substitute(eq.left, v)} ${c < 0 ? '<' : c > 0 ? '>' : '='} ${substitute(eq.right, v)}`);
    eqNote.textContent = `${formatValue(l)} ${c === 0 ? 'et' : 'contre'} ${formatValue(r)}`;
    counter.textContent = typo(`Essais : ${tries} · Par : ${lvl.par}`);
    if (c === 0) {
      balance.settle();
      await win(v);
      return;
    }
    balance.lean(F.toNumber(F.sub(r, l)));
    toast(stage, `Le plateau ${c > 0 ? 'de gauche' : 'de droite'} est plus lourd. Essaie une valeur plus ${F.cmp(v, solution) > 0 ? 'petite' : 'grande'}.`, 'info', 'Fausse piste');
    busy = false;
  }

  /* ---------------------------------------------------------------- victoire */
  async function win(value) {
    won = true; busy = true;
    intro?.remove(); // le briefing se replie : la balance remonte
    update({ animateEq: false });
    if (guess) typewrite(eqCurrent, `x = ${formatValue(value)}`);
    await wait(550);
    balance.reveal(value);
    eqCurrent.classList.add('solved');
    const r = stage.getBoundingClientRect();
    confetti(r.left + r.width / 2, r.top + r.height * 0.45);
    await wait(900);
    const n = moves();
    const earned = starsFor(n, lvl.par);
    recordWin(lvl.id, earned, n);
    showVictory(value, earned, n);
  }

  function showVictory(value, earned, n) {
    const next = nextTarget(lvl);
    const unit = guess ? (n > 1 ? 'essais' : 'essai') : (n > 1 ? 'coups' : 'coup');
    const advice = earned < 3
      ? h('p', { class: 'advice' }, `Le QG l'a résolu en ${lvl.par} ${guess ? 'essai' : 'coup'}${lvl.par > 1 ? 's' : ''}. Sauras-tu faire aussi bien ?`)
      : null;
    const worth = F.isInt(value) && F.toNumber(F.abs(value)) <= 1 ? 'lingot' : 'lingots';
    // Panneau qui monte du bas, sans voile : la balance résolue reste visible.
    const overlay = h('div', { class: 'overlay', role: 'dialog', 'aria-label': 'Affaire classée' },
      h('div', { class: 'victory' },
        h('div', { class: 'victory-head' },
          h('div', {},
            h('span', { class: 'paper-label' }, 'Rapport final'),
            h('p', { class: 'victory-solution' }, `x = ${formatValue(value)}`),
            h('p', { class: 'victory-worth' }, `La mallette vaut ${formatValue(value)} ${worth}.`)),
          stamp('Affaire classée', 'stamp-big')),
        h('div', { class: 'victory-score' },
          stars(earned, 3, 'big'),
          h('p', { class: 'victory-moves' }, `${guess ? 'Trouvé' : 'Résolu'} en ${n} ${unit}`)),
        advice,
        lvl.outro ? h('p', { class: 'victory-outro' }, lvl.outro) : null,
        h('div', { class: 'victory-actions' },
          h('button', { class: 'secondary', type: 'button', onclick: () => { overlay.remove(); replay(); } }, 'Rejouer'),
          h('a', { class: 'primary', href: next.href }, next.label))));
    screen.append(overlay);
    screen.classList.add('won');
    // Laisse de quoi faire défiler la page au-dessus du panneau sur les petits écrans.
    screen.style.setProperty('--sheet', `${overlay.firstChild.offsetHeight + 16}px`);
    overlay.querySelector('.primary').focus({ preventScroll: true });
  }

  function replay() {
    won = false; busy = false;
    screen.classList.remove('won');
    history = [start]; played = []; tries = 0;
    balance.resetBoxes(openCase ? 0 : null);
    if (guess) controls.reset();
    eqCurrent.classList.remove('solved');
    eqNote.textContent = '';
    update();
  }

  /* ---------------------------------------------------------------- clavier */
  function onKey(e) {
    if (e.target.closest?.('input, textarea') || e.ctrlKey && e.key !== 'z' || e.altKey || e.metaKey) return;
    if (!guess && (e.key === 'z' || e.key === 'Z')) { e.preventDefault(); undo(); }
    if (!guess && (e.key === 'r' || e.key === 'R')) restart();
  }
  document.addEventListener('keydown', onKey);

  update({ animateEq: false });
  return () => document.removeEventListener('keydown', onKey);
}
