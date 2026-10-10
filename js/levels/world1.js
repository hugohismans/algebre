/**
 * Dossier 1 : la mallette. Pas de cartes : on devine ce que vaut x et la
 * balance réagit. Le « par » compte les essais.
 * openCase : la mallette est ouverte et se remplit de lingots à chaque appui
 * (premières missions, pour voir ce que « x vaut 4 » veut dire). Ensuite,
 * elle reste fermée et on ne voit la valeur qu'au moment de tester.
 */
export default {
  id: 1,
  title: 'La mallette',
  subtitle: 'Essais et erreurs : forge ton intuition',
  briefing: 'Première étape de ta formation, agent : développer ton intuition d\'enquêteur. Ici, pas encore d\'outils. Tu proposes une valeur, la balance te dit si tu fais fausse route, et tu recommences : on avance par essais et erreurs. Plus tard, le QG te confiera des outils bien plus efficaces pour mener l\'enquête.',
  rules: { negatives: false, fractions: false },
  display: 'full',
  levels: [
    { id: '1-1', mode: 'guess', openCase: true, start: 'x+3=5', par: 2,
      intro: 'Bienvenue à l\'Agence, recrue. Pour commencer, on entraîne ton intuition : pas d\'outils, juste des essais. Une mallette a été saisie, nom de code x. Chaque lingot vaut 1 et la balance est à l\'équilibre. Remplis la mallette avec + et −, puis teste : combien vaut-elle ?' },
    { id: '1-2', mode: 'guess', openCase: true, start: 'x+1=7', par: 2,
      intro: 'Se tromper fait partie de l\'enquête : si la balance penche, c\'est un indice. Tiens-en compte et réessaie.' },
    { id: '1-3', mode: 'guess', openCase: true, start: '9=x+4', par: 2,
      intro: 'Cette fois, la mallette est sur le plateau de droite. Même méthode.' },
    { id: '1-4', mode: 'guess', openCase: true, start: 'x+2=10', par: 2 },
    { id: '1-5', mode: 'guess', start: '2x=6', par: 2,
      intro: 'Désormais, les mallettes restent scellées : à toi d\'imaginer ce qu\'il y a dedans. Ici, deux mallettes du même modèle, qui valent exactement la même chose.' },
    { id: '1-6', mode: 'guess', start: '2x+3=11', par: 3 },
    { id: '1-7', mode: 'guess', start: '3x+2=17', par: 3 },
    { id: '1-8', mode: 'guess', start: '2x+2=x+9', par: 3,
      intro: 'Dernière épreuve de ta formation : des mallettes des deux côtés, toutes identiques. Tâtonner devient long, non ? Le QG prépare de quoi t\'aider.',
      outro: 'Intuition validée ! Les essais finissent par payer, mais ils prennent du temps. Dans le dossier suivant, le QG te confie tes premiers vrais outils : les cartes d\'opération.' },
  ],
};
