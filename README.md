# Équilibre

Un jeu web pour découvrir les équations du premier degré et apprendre à les résoudre.
L'équation est une balance à deux plateaux : x est une boîte mystère, les nombres sont
des poids. On glisse des cartes d'opération qui agissent toujours sur les deux plateaux ;
le but est d'isoler une seule boîte pour révéler la valeur de x.

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
js/state/             progression (localStorage) et étoiles
tests/                mini-lanceur, tests du moteur et des niveaux
```

## Ajouter un niveau

Dans `js/levels/worldN.js` :

```js
{ id: '2-9', start: '3x+1=10', cards: ['-1', '/3'], par: 2, intro: 'Texte facultatif' }
```

Cartes : `+3` `-3` `*2` `/2` `-x` (retirer une boîte) `+x` `dist` (vider les sacs).
Les règles du monde (`negatives`, `fractions`) disent ce que la balance autorise.
Lancer les tests : ils signalent un par faux ou un niveau impossible.

## Étoiles

3 étoiles au par (ou mieux), 2 jusqu'à deux coups de plus, 1 sinon.
Annuler est illimité et sans pénalité.

## Avancement

- [x] Moteur et tests
- [x] Monde 1 : la boîte mystère (devinette)
- [x] Monde 2 : l'équilibre (une opération)
- [ ] Monde 3 : deux étapes
- [ ] Monde 4 : boîtes des deux côtés
- [ ] Monde 5 : les négatifs (ballons)
- [ ] Monde 6 : les parenthèses (sacs)
- [ ] Monde 7 : mise en équation
- [ ] Plus tard : mode création, énigme partagée par lien
