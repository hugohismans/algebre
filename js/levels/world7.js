/**
 * Dossier 7 : témoignages. Mise en équation : on lit un témoignage, on construit
 * la balance correspondante (mode « build »), puis on la résout. Le par ne compte
 * que les coups de résolution.
 */
export default {
  id: 7,
  title: 'Témoignages',
  subtitle: 'Du récit à l\'équation',
  briefing: 'Dernier dossier, agent. Plus de balance toute prête : les témoins racontent, et c\'est à toi de traduire leur récit en équation. Place les mallettes et les lingots sur chaque plateau, fais valider par le QG, puis résous l\'affaire.',
  rules: { negatives: true, fractions: false },
  display: 'symbolic',
  levels: [
    { id: '7-1', mode: 'build', start: 'x+3=11', cards: ['-3', '-1'], par: 1,
      story: 'Sur la balance, la mallette et 3 lingots pesaient autant que 11 lingots.',
      intro: 'Lis le témoignage, puis construis la balance avec les boutons + et −. Quand elle correspond au récit, appuie sur Valider.' },
    { id: '7-2', mode: 'build', start: '2x=18', cards: ['/2', '-2'], par: 1,
      story: 'Deux mallettes identiques équilibraient 18 lingots.' },
    { id: '7-3', mode: 'build', start: '3x+2=17', cards: ['/3', '-2'], par: 2,
      story: 'J\'ai vu trois mallettes et 2 lingots d\'un côté, 17 lingots de l\'autre. La balance était droite.' },
    { id: '7-4', mode: 'build', start: '4x=x+12', cards: ['-x', '/3', '/4'], par: 2,
      story: 'Sur un plateau, quatre mallettes. Sur l\'autre, une seule mallette avec 12 lingots. Parfait équilibre.' },
    { id: '7-5', mode: 'build', start: '3x+1=2x+6', cards: ['-x', '-2x', '-1'], par: 2,
      story: 'L\'agent Rouge avait trois mallettes et un lingot. L\'agent Bleu, deux mallettes et 6 lingots. Leurs bagages pesaient exactement pareil.' },
    { id: '7-6', mode: 'build', start: 'x-4=2', cards: ['+4', '-4'], par: 1,
      story: 'Une mallette, tirée vers le haut par 4 ballons espions, équilibrait 2 lingots.',
      intro: 'Des ballons : diminue les lingots en dessous de zéro pour en accrocher.' },
    { id: '7-7', mode: 'build', start: '2x+5=21', cards: ['-5', '/2'], par: 2,
      story: 'Le double de x, plus 5, ça fait 21.',
      intro: 'Ce témoin parle comme un mathématicien. « Le double de x », ce sont deux mallettes.' },
    { id: '7-8', mode: 'build', start: '3x+6=x+20', cards: ['-x', '-2x', '-6', '/2'], par: 3,
      story: 'Si j\'ajoute 6 au triple de x, j\'obtiens autant que x plus 20.',
      outro: 'Affaire après affaire, tu es passé de l\'intuition aux outils de l\'algèbre. Le QG te nomme agent confirmé. Félicitations !' },
  ],
};
