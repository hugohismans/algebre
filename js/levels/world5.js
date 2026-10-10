/**
 * Dossier 5 : ballons espions. Un ballon tire le plateau vers le haut : il vaut −1.
 * Un ballon et un lingot s'annulent. Une mallette accrochée à un ballon vaut −x.
 */
export default {
  id: 5,
  title: 'Ballons espions',
  subtitle: 'Ils allègent : les nombres négatifs',
  briefing: 'Nouveau gadget de l\'ennemi : des ballons espions. Accroché à un plateau, un ballon le tire vers le haut : il vaut −1. Un ballon et un lingot s\'annulent, comme −1 + 1 = 0. Et attention : une mallette peut maintenant contenir des ballons, donc x peut être négatif.',
  rules: { negatives: true, fractions: false },
  display: 'full',
  levels: [
    { id: '5-1', start: 'x-3=4', cards: ['+3'], par: 1,
      intro: 'Trois ballons tirent la mallette vers le haut. Ajoute 3 lingots de chaque côté : à gauche, chaque lingot annule un ballon.' },
    { id: '5-2', start: 'x-5=1', cards: ['-5', '+5'], par: 1 },
    { id: '5-3', start: 'x+4=1', cards: ['-1', '-4'], par: 1,
      intro: 'Retirer 4 lingots d\'un plateau qui n\'en a qu\'un ? Avec les ballons, c\'est possible : il reste 3 ballons. La mallette vaudra moins que zéro.' },
    { id: '5-4', start: '2x-3=7', cards: ['-3', '+3', '/2'], par: 2 },
    { id: '5-5', start: '3x+5=-4', cards: ['/3', '-5'], par: 2 },
    { id: '5-6', start: '5-x=2', cards: ['-5', '-2', '+x'], par: 2,
      intro: 'Une mallette accrochée à un ballon : elle tire vers le haut, elle compte pour −x. Ajoute une mallette de chaque côté pour l\'annuler.' },
    { id: '5-7', start: '2x-1=x-6', cards: ['-x', '+1', '-1'], par: 2 },
    { id: '5-8', start: '4-2x=x-8', cards: ['+x', '+2x', '+8', '/3'], par: 3,
      outro: 'Les ballons n\'ont plus de secret pour toi. Prochaine affaire : des plis scellés qui contiennent plusieurs objets à la fois.' },
  ],
};
