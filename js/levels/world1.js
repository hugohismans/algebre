/**
 * Dossier 1 : la mallette. Pas de cartes : on devine ce que vaut x et la
 * balance réagit. Le « par » compte les essais.
 */
export default {
  id: 1,
  title: 'La mallette',
  subtitle: 'Devine ce que vaut x',
  rules: { negatives: false, fractions: false },
  display: 'full',
  levels: [
    { id: '1-1', mode: 'guess', start: 'x+3=7', par: 2,
      intro: 'Agent, une mallette scellée a été saisie. Nom de code : x. Chaque lingot vaut 1, et la balance est à l\'équilibre. Combien vaut la mallette ?' },
    { id: '1-2', mode: 'guess', start: 'x+1=5', par: 2,
      intro: 'Propose une valeur et teste-la. Si tu te trompes, la balance penche : c\'est un indice.' },
    { id: '1-3', mode: 'guess', start: '6=x+2', par: 2,
      intro: 'Cette fois, la mallette est sur le plateau de droite. Même méthode.' },
    { id: '1-4', mode: 'guess', start: 'x+5=9', par: 2 },
    { id: '1-5', mode: 'guess', start: '2x=8', par: 2,
      intro: 'Deux mallettes du même modèle : elles valent exactement la même chose.' },
    { id: '1-6', mode: 'guess', start: '2x+2=10', par: 3 },
    { id: '1-7', mode: 'guess', start: '3x=12', par: 3 },
    { id: '1-8', mode: 'guess', start: '2x+1=x+5', par: 3,
      intro: 'Des mallettes des deux côtés ! Elles sont toutes identiques.' },
  ],
};
