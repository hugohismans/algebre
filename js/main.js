/**
 * Démarrage et routage par le hash de l'URL (compatible GitHub Pages) :
 *   #/                       les mondes
 *   #/monde/2                les niveaux du monde 2
 *   #/monde/2/niveau/3       le niveau 3 du monde 2
 * Le futur mode création ajoutera une route du type #/enigme/<équation>.
 */
import { worldsScreen } from './ui/screens/worlds.js';
import { levelsScreen } from './ui/screens/levels.js';
import { gameScreen } from './ui/screens/game.js';

const ROUTES = [
  { re: /^#\/monde\/(\d+)\/niveau\/(\d+)\/?$/, screen: gameScreen, params: (m) => ({ world: +m[1], level: +m[2] }) },
  { re: /^#\/monde\/(\d+)\/?$/, screen: levelsScreen, params: (m) => ({ world: +m[1] }) },
  { re: /^(#\/?)?$/, screen: worldsScreen, params: () => ({}) },
];

const app = document.getElementById('app');
let cleanup = null;

function route() {
  if (typeof cleanup === 'function') cleanup();
  cleanup = null;
  document.querySelectorAll('.drag-ghost, .confetti').forEach((el) => el.remove());
  app.replaceChildren();
  const hash = location.hash;
  for (const r of ROUTES) {
    const m = r.re.exec(hash);
    if (m) {
      cleanup = r.screen(app, r.params(m));
      window.scrollTo(0, 0);
      return;
    }
  }
  location.replace('#/');
}

window.addEventListener('hashchange', route);
route();
