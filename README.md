# Mission Inconnue (titre provisoire)

Un jeu web d'enquête pour découvrir les équations du premier degré et apprendre à les
résoudre. L'équation est une balance à deux plateaux : x est une mallette scellée, les
nombres sont des lingots d'or. On glisse des cartes d'opération qui agissent toujours sur
les deux plateaux ; le but est d'isoler une seule mallette pour découvrir ce que vaut x.

Ambiance : une agence d'espionnage, de nuit. Les mondes sont des dossiers, les niveaux
des missions, les consignes des briefings du QG, et chaque victoire classe l'affaire.
Le nom du jeu n'est écrit que dans `js/config.js` et `index.html`.

Jouer : <https://hugohismans.github.io/algebre/>

HTML, CSS et JavaScript vanilla (modules ES), sans framework ni étape de build :
le dépôt se publie tel quel sur GitHub Pages.

## Lancer en local

Les modules ES demandent un serveur (pas d'ouverture directe du fichier) :

```sh
python3 -m http.server 8000   # puis http://localhost:8000/
```

## Tests

```sh
node tests/engine.test.js     # ou : npm test
```

Ou ouvrir `tests/index.html` dans le navigateur (via le serveur local).
Les tests couvrent le moteur et vérifient aussi chaque niveau : équation lisible,
solution entière, et « par » égal au nombre minimal de coups (calculé par le solveur).

## Organisation

```
index.html            page unique
css/style.css         styles (mobile d'abord)
js/main.js            routage par hash : #/, #/monde/2, #/monde/2/niveau/3
js/engine/            moteur, sans DOM : fractions exactes, équations, opérations,
                      lecture (« 2x+1=9 »), écriture, solveur
js/levels/            mondes et niveaux, en données
js/ui/                balance SVG, cartes, glisser-déposer, effets, écrans
js/config.js          nom du jeu
js/state/             progression (localStorage) et étoiles
tests/                mini-lanceur, tests du moteur et des niveaux
```

## Ajouter un niveau

Dans `js/levels/worldN.js` :

```js
{ id: '2-9', start: '3x+1=10', cards: ['-1', '/3'], par: 2, intro: 'Texte facultatif' }
```

Cartes : `+3` `-3` `*2` `/2` `-x` `-2x` (retirer des mallettes) `+x` `dist` (ouvrir les plis).
Modes : `mode: 'guess'` (devinette, dossier 1, avec `openCase` pour la mallette ouverte),
`mode: 'build'` avec `story` (témoignage à mettre en équation, dossier 7).

Pour tester sans tout jouer : ajouter `?code=007` à l'adresse ouvre tous les dossiers.
Les règles du monde (`negatives`, `fractions`) disent ce que la balance autorise.
Lancer les tests : ils signalent un par faux ou un niveau impossible.

## Étoiles

3 étoiles au par (ou mieux), 2 jusqu'à deux coups de plus, 1 sinon.
Annuler est illimité et sans pénalité.

## Avancement

- [x] Moteur et tests
- [x] Direction artistique : espionnage, enquête
- [x] Dossier 1 : la mallette (devinette, intuition par essais et erreurs)
- [x] Dossier 2 : la règle d'or (une opération)
- [x] Dossier 3 : double fond (deux étapes)
- [x] Dossier 4 : agents doubles (x des deux côtés)
- [x] Dossier 5 : ballons espions (négatifs)
- [x] Dossier 6 : plis scellés (parenthèses, distributivité)
- [x] Dossier 7 : témoignages (mise en équation)
- [ ] Plus tard : mode création, énigme partagée par lien
