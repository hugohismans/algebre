/**
 * Monde 2 : l'équilibre. Les cartes arrivent ; une seule opération suffit par
 * niveau, parfois avec des cartes pièges pour apprendre à choisir.
 */
export default {
  id: 2,
  title: 'L\'équilibre',
  subtitle: 'Une carte agit sur les deux plateaux',
  rules: { negatives: false, fractions: false },
  display: 'full',
  levels: [
    { id: '2-1', start: 'x+3=7', cards: ['-3'], par: 1,
      intro: 'Glisse la carte sur la balance (ou touche-la). Elle retire 3 poids de chaque côté : l\'équilibre est conservé. But : laisser la boîte toute seule.' },
    { id: '2-2', start: 'x+5=9', cards: ['-2', '-5'], par: 1,
      intro: 'Choisis la bonne carte. Tu peux toujours annuler, sans pénalité.' },
    { id: '2-3', start: 'x+4=6', cards: ['-6', '-4'], par: 1,
      intro: 'Certaines cartes sont impossibles : on ne peut pas retirer plus de poids qu\'il n\'y en a. Essaie, la balance te le dira !' },
    { id: '2-4', start: '8=x+3', cards: ['-8', '-3'], par: 1 },
    { id: '2-5', start: 'x+1=4', cards: ['+2', '-1'], par: 1,
      intro: 'Ajouter des poids des deux côtés garde aussi l\'équilibre… mais est-ce que ça isole la boîte ?' },
    { id: '2-6', start: '2x=8', cards: ['/2'], par: 1,
      intro: 'Nouvelle carte : ÷2 partage chaque plateau en deux parts égales et n\'en garde qu\'une.' },
    { id: '2-7', start: '3x=12', cards: ['/2', '/3', '/4'], par: 1,
      intro: 'On ne peut partager que si chaque plateau se coupe en parts égales, sans casser une boîte.' },
    { id: '2-8', start: '2x=x+5', cards: ['/2', '-x'], par: 1,
      intro: 'La carte −x retire une boîte de chaque côté. Elle marche car toutes les boîtes pèsent pareil.' },
  ],
};
