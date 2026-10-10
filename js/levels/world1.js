/**
 * Monde 1 : la boîte mystère. Pas de cartes : on devine la valeur de x et la
 * balance réagit. Le « par » compte les essais.
 */
export default {
  id: 1,
  title: 'La boîte mystère',
  subtitle: 'Devine combien pèse la boîte',
  rules: { negatives: false, fractions: false },
  display: 'full',
  levels: [
    { id: '1-1', mode: 'guess', start: 'x+3=7', par: 2,
      intro: 'La boîte mystère pèse x. Chaque petit poids pèse 1. La balance est à l\'équilibre : combien pèse la boîte ?' },
    { id: '1-2', mode: 'guess', start: 'x+1=5', par: 2,
      intro: 'Choisis une valeur et essaie : si la boîte est trop lourde ou trop légère, la balance penche.' },
    { id: '1-3', mode: 'guess', start: '6=x+2', par: 2,
      intro: 'La boîte peut aussi être sur le plateau de droite.' },
    { id: '1-4', mode: 'guess', start: 'x+5=9', par: 2 },
    { id: '1-5', mode: 'guess', start: '2x=8', par: 2,
      intro: 'Deux boîtes mystère : elles sont identiques, donc elles pèsent le même poids.' },
    { id: '1-6', mode: 'guess', start: '2x+2=10', par: 3 },
    { id: '1-7', mode: 'guess', start: '3x=12', par: 3 },
    { id: '1-8', mode: 'guess', start: '2x+1=x+5', par: 3,
      intro: 'Des boîtes des deux côtés ! Elles pèsent toutes la même chose.' },
  ],
};
