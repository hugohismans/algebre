/**
 * Dossier 2 : la règle d'or. Les cartes arrivent ; une seule opération suffit
 * par mission, parfois avec des cartes pièges pour apprendre à choisir.
 */
export default {
  id: 2,
  title: 'La règle d\'or',
  subtitle: 'Ce qu\'on fait d\'un côté, on le fait de l\'autre',
  briefing: 'Fini les essais au hasard : le QG te confie des cartes d\'opération. Chaque carte agit sur les deux plateaux à la fois, pour que la balance reste à l\'équilibre. Ton objectif : laisser une mallette seule sur un plateau. Les lingots en face donnent alors sa valeur.',
  rules: { negatives: false, fractions: false },
  display: 'full',
  levels: [
    { id: '2-1', start: 'x+3=9', cards: ['-3'], par: 1,
      intro: 'Fini le tâtonnement : voici ton premier outil, une carte. Règle d\'or : ce que tu fais d\'un côté, tu le fais de l\'autre. Glisse la carte sur la balance (ou touche-la) : elle retire 3 lingots de chaque plateau. Objectif : laisser la mallette seule.' },
    { id: '2-2', start: 'x+5=7', cards: ['-2', '-5'], par: 1,
      intro: 'Choisis la bonne carte. Tu peux annuler autant que tu veux, sans pénalité.' },
    { id: '2-3', start: 'x+4=11', cards: ['-6', '-4'], par: 1,
      intro: 'Certaines cartes sont impossibles : on ne retire pas plus de lingots qu\'il n\'y en a. Essaie, la balance te le dira !' },
    { id: '2-4', start: '8=x+3', cards: ['-8', '-3'], par: 1 },
    { id: '2-5', start: 'x+1=4', cards: ['+2', '-1'], par: 1,
      intro: 'Ajouter des lingots des deux côtés garde aussi l\'équilibre… mais est-ce que ça démasque x ?' },
    { id: '2-6', start: '2x=16', cards: ['/2'], par: 1,
      intro: 'Nouvelle carte : ÷2 partage chaque plateau en deux parts égales et n\'en garde qu\'une.' },
    { id: '2-7', start: '3x=12', cards: ['/2', '/3', '/4'], par: 1,
      intro: 'On ne partage que si chaque plateau se coupe en parts égales, sans couper de mallette.' },
    { id: '2-8', start: '2x=x+1', cards: ['/2', '-x'], par: 1,
      intro: 'La carte −x retire une mallette de chaque côté. Ça marche parce que toutes les mallettes valent pareil.',
      outro: 'Tu maîtrises la règle d\'or. Les prochaines affaires se cachent derrière un double fond : il faudra plusieurs cartes, dans le bon ordre.' },
  ],
};
