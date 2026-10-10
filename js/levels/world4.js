/** Dossier 4 : agents doubles. Des mallettes x des deux côtés : on les rassemble. */
export default {
  id: 4,
  title: 'Agents doubles',
  subtitle: 'Des x des deux côtés',
  briefing: 'Des agents doubles ont glissé des mallettes x sur les deux plateaux. Premier réflexe : rassembler toutes les mallettes du même côté, en retirant les mêmes des deux côtés. Ensuite, tu connais la suite.',
  rules: { negatives: false, fractions: false },
  display: 'full',
  levels: [
    { id: '4-1', start: '2x+5=x+9', cards: ['-x', '-5'], par: 2,
      intro: 'Une mallette de chaque côté : retire-la des deux plateaux, elle ne change rien à l\'équilibre.' },
    { id: '4-2', start: '3x+2=x+8', cards: ['-x', '-2', '/2'], par: 3 },
    { id: '4-3', start: '4x=x+15', cards: ['/4', '-x', '/3'], par: 2 },
    { id: '4-4', start: '5x+1=2x+10', cards: ['-x', '-2x', '-1', '/3'], par: 3,
      intro: 'Nouvelle carte : −2x retire deux mallettes d\'un coup de chaque côté.' },
    { id: '4-5', start: 'x+11=3x+1', cards: ['-x', '-1', '/2'], par: 3,
      intro: 'Cette fois, le plateau de droite a le plus de mallettes. Rassemble-les à droite.' },
    { id: '4-6', start: '4x+3=2x+11', cards: ['-x', '-2x', '-3', '/2', '/4'], par: 3 },
    { id: '4-7', start: '6x+2=3x+20', cards: ['-x', '-3x', '-2', '/3'], par: 3 },
    { id: '4-8', start: '7x+4=4x+25', cards: ['-x', '-2x', '-4', '/3'], par: 4,
      outro: 'Agents doubles neutralisés. Prochaine affaire : des ballons espions qui allègent les plateaux… et des nombres en dessous de zéro.' },
  ],
};
