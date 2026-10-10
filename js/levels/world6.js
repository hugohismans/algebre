/**
 * Dossier 6 : plis scellés. Les parenthèses : 2(x + 3), ce sont deux plis
 * identiques qui contiennent chacun une mallette et 3 lingots.
 */
export default {
  id: 6,
  title: 'Plis scellés',
  subtitle: 'Les parenthèses',
  briefing: 'Les messages arrivent maintenant sous pli scellé. Un pli marqué « x + 3 » contient une mallette et 3 lingots ; 2(x + 3), ce sont deux plis identiques. Deux méthodes : partager la balance pour ne garder qu\'un pli, ou ouvrir tous les plis (distribuer) pour vider leur contenu. Ici, la balance s\'efface un peu : fie-toi aussi à l\'écriture.',
  rules: { negatives: true, fractions: false },
  display: 'mixed',
  levels: [
    { id: '6-1', start: '2(x+3)=14', cards: ['/2', '-3'], par: 2,
      intro: 'Deux plis identiques valent 14 lingots. Partage en 2 : il ne reste qu\'un pli, qui s\'ouvre tout seul.' },
    { id: '6-2', start: '3(x+1)=18', cards: ['-1', '/3'], par: 2 },
    { id: '6-3', start: '2(x+4)=x+11', cards: ['/2', 'dist', '-x', '-8'], par: 3,
      intro: 'Partager ne marche pas ici. Ouvre les plis : 2 plis de (x + 4), c\'est 2 mallettes et 8 lingots. C\'est la distributivité : 2(x + 4) = 2x + 8.' },
    { id: '6-4', start: '4(x+2)=2(x+9)', cards: ['dist', '-2x', '-8', '/2'], par: 4 },
    { id: '6-5', start: '3(2x-1)=15', cards: ['/3', '+1', '/2'], par: 3 },
    { id: '6-6', start: '5(x-2)=3(x+2)', cards: ['dist', '-3x', '+10', '/2', '-6'], par: 4 },
    { id: '6-7', start: '2(x+5)+3=17', cards: ['-3', '/2', '-5', 'dist'], par: 3 },
    { id: '6-8', start: '3(x+4)=2(x+4)+5', cards: ['dist', '-2x', '-12', '-x'], par: 3,
      outro: 'Plus aucun pli ne te résiste. Dernière affaire : les témoins. À toi de transformer leurs récits en équations.' },
  ],
};
