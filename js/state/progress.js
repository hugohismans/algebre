/**
 * Progression du joueur, sauvegardée dans localStorage. Tout accès est protégé :
 * en navigation privée ou si le stockage est bloqué, le jeu marche sans mémoire.
 *
 * Forme stockée : { v: 1, levels: { '2-3': { stars: 3, best: 1 } } }
 */
import { WORLDS } from '../levels/index.js';

const KEY = 'equilibre:progress';
const VERSION = 1;

function empty() { return { v: VERSION, levels: {} }; }

function load() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return empty();
    const data = JSON.parse(raw);
    if (!data || data.v !== VERSION || typeof data.levels !== 'object') return empty();
    return { ...empty(), ...data };
  } catch {
    return empty();
  }
}

let state = load();

/** Code agent dans l'URL (?code=007) : ouvre tous les dossiers, pour tester. */
const ALL_ACCESS = typeof location !== 'undefined' && new URLSearchParams(location.search).get('code') === '007';

function save() {
  try { localStorage.setItem(KEY, JSON.stringify(state)); } catch { /* stockage indisponible */ }
}

export function levelResult(id) { return state.levels[id] ?? null; }

/** Enregistre une victoire ; garde le meilleur score. Renvoie true si c'est un record. */
export function recordWin(id, stars, moves) {
  const prev = state.levels[id];
  const better = !prev || stars > prev.stars || moves < prev.best;
  if (better) {
    state.levels[id] = { stars: Math.max(stars, prev?.stars ?? 0), best: Math.min(moves, prev?.best ?? Infinity) };
    save();
  }
  return better;
}

export function worldStars(world) {
  return world.levels.reduce((sum, l) => sum + (state.levels[l.id]?.stars ?? 0), 0);
}
export const worldDone = (world) => world.levels.length > 0 && world.levels.every((l) => state.levels[l.id]);

/** Un monde est ouvert si c'est le premier, ou si le monde précédent est terminé. */
export function worldUnlocked(world) {
  if (world.upcoming) return false;
  if (ALL_ACCESS) return true;
  const i = WORLDS.indexOf(world);
  return i === 0 || worldDone(WORLDS[i - 1]);
}

/** Un niveau est ouvert si son monde l'est et que le niveau précédent est réussi. */
export function levelUnlocked(world, index) {
  if (!worldUnlocked(world)) return false;
  return ALL_ACCESS || index === 0 || !!state.levels[world.levels[index - 1].id];
}

export function totalStars() {
  return WORLDS.reduce((s, w) => s + worldStars(w), 0);
}

export function resetProgress() { state = empty(); save(); }
