/**
 * Tests du moteur. Lancer avec `node tests/engine.test.js` (ou `npm test`),
 * ou ouvrir tests/index.html dans un navigateur.
 */
import { test, assert, run } from './run.js';
import {
  F, parseEquation, parseOp, formatEquation, formatOp, formatValue, apply, validate,
  isSolved, solve, equivalent, expand, shortestSolution, equationEquals,
} from '../js/engine/index.js';

const eqn = parseEquation;
const fmt = (e) => formatEquation(e, { ascii: true });
const step = (s, op, rules) => {
  const v = validate(eqn(s), parseOp(op), rules);
  if (!v.ok) throw new Error(`opération refusée (${v.reason})`);
  return fmt(v.result);
};

/* ---------------------------------------------------------------- fractions */
test('fractions : normalisation et signe', () => {
  assert.deepEqual(F.frac(6, -4), { n: -3, d: 2 });
  assert.deepEqual(F.frac(0, 5), { n: 0, d: 1 });
  assert.ok(Object.is(F.frac(0, -3).n, 0), 'pas de zéro négatif');
});
test('fractions : opérations exactes', () => {
  assert.ok(F.eq(F.add(F.frac(1, 3), F.frac(1, 6)), F.frac(1, 2)));
  assert.ok(F.eq(F.sub(1, F.frac(1, 4)), F.frac(3, 4)));
  assert.ok(F.eq(F.mul(F.frac(2, 3), 3), F.frac(2)));
  assert.ok(F.eq(F.div(5, 2), F.frac(5, 2)));
  assert.throws(() => F.div(1, 0));
  assert.equal(F.cmp(F.frac(1, 3), F.frac(1, 2)), -1);
});
test('fractions : lecture et écriture', () => {
  assert.equal(F.toString(F.parseFrac('-6/8')), '-3/4');
  assert.equal(F.parseFrac('abc'), null);
});

/* ---------------------------------------------------------------- lecture / écriture */
test('parse : équations simples', () => {
  assert.equal(fmt(eqn('2x+1=9')), '2x+1=9');
  assert.equal(fmt(eqn(' 3x + 2 = x + 8 ')), '3x+2=x+8');
  assert.equal(fmt(eqn('x + x + 1 = 7')), '2x+1=7');
  assert.equal(fmt(eqn('9 = x + 4')), '9=x+4');
  assert.equal(fmt(eqn('−x − 3 = 5')), '-x-3=5');
  assert.equal(fmt(eqn('1/2x = 3')), '1/2x=3');
});
test('parse : parenthèses', () => {
  const e = eqn('2(x+3) = 14');
  assert.equal(e.left.groups.length, 1);
  assert.equal(fmt(e), '2(x+3)=14');
  assert.equal(fmt(eqn('3(2x-1)+x=-(x+1)')), '3(2x-1)+x=-(x+1)');
});
test('parse : erreurs', () => {
  assert.throws(() => eqn('2x+1'));
  assert.throws(() => eqn('2x+1=3=4'));
  assert.throws(() => eqn('2(x+1=3'));
  assert.throws(() => eqn('2y=4'));
});
test('format : typographie', () => {
  assert.equal(formatEquation(eqn('2x+3=11')), '2x + 3 = 11');
  assert.equal(formatEquation(eqn('-x-3=-5')), '−x − 3 = −5');
  assert.equal(formatEquation(eqn('0=x')), '0 = x');
  assert.equal(formatValue(F.frac(-5, 2)), '−5⁄2');
});
test('cartes : lecture et libellés', () => {
  const labels = ['+3', '-3', '−3', '*2', '×2', '/2', '÷2', '-x', '+x', '-2x', 'dist', '/(-1)']
    .map((s) => formatOp(parseOp(s)));
  assert.deepEqual(labels, ['+3', '−3', '−3', '×2', '×2', '÷2', '÷2', '−x', '+x', '−2x', 'Distribuer', '÷(−1)']);
  assert.throws(() => parseOp('?3'));
});

/* ---------------------------------------------------------------- opérations */
test('opérations : appliquées aux deux plateaux', () => {
  assert.equal(step('2x+1=9', '-1'), '2x=8');
  assert.equal(step('2x=8', '/2'), 'x=4');
  assert.equal(step('3x+2=x+8', '-x'), '2x+2=8');
  assert.equal(step('x+1=4', '+2'), 'x+3=6');
  assert.equal(step('x=3', '*2'), '2x=6');
  assert.equal(step('x=3', '+x'), '2x=x+3');
});
test('opérations : apply ne modifie pas l\'équation d\'origine', () => {
  const e = eqn('2x+1=9');
  apply(e, parseOp('-1'));
  assert.equal(fmt(e), '2x+1=9');
});
test('règles : pas assez de poids', () => {
  const v = validate(eqn('x+3=2x+2'), parseOp('-3'));
  assert.equal(v.ok, false);
  assert.equal(v.reason, 'not-enough-weights');
  assert.deepEqual(v.sides, ['right']);
});
test('règles : pas assez de boîtes', () => {
  const v = validate(eqn('2x+1=9'), parseOp('-x'));
  assert.equal(v.reason, 'not-enough-boxes');
  assert.deepEqual(v.sides, ['right']);
});
test('règles : division impossible sans fractions', () => {
  const v = validate(eqn('3x=12'), parseOp('/2'));
  assert.equal(v.reason, 'not-divisible');
  assert.deepEqual(v.sides, ['left']);
  assert.equal(validate(eqn('3x=12'), parseOp('/2'), { fractions: true }).ok, true);
});
test('règles : ×0 et ÷0 refusés', () => {
  assert.equal(validate(eqn('x=2'), { type: 'mul', n: 0 }).reason, 'zero');
  assert.equal(validate(eqn('x=2'), { type: 'div', n: 0 }).reason, 'zero');
});
test('règles : négatifs permis (ballons)', () => {
  assert.equal(step('x+2=1', '-2', { negatives: true }), 'x=-1');
  assert.equal(validate(eqn('x=2'), parseOp('*-1')).reason, 'negative');
  assert.equal(step('-x=2', '*-1', { negatives: true }), 'x=-2');
});
test('sacs : ÷k ouvre un sac de facteur k', () => {
  assert.equal(step('2(x+3)=14', '/2'), 'x+3=7');
  assert.equal(step('2(x+3)+4=14', '/2'), 'x+5=7');
  assert.equal(step('4(x+1)=12', '/2'), '2(x+1)=6');
});
test('sacs : distribuer', () => {
  assert.equal(step('2(x+3)=14', 'dist'), '2x+6=14');
  assert.equal(validate(eqn('2x=4'), parseOp('dist')).reason, 'nothing-to-distribute');
});
test('sacs : on ne retire pas de poids d\'un sac fermé', () => {
  assert.equal(validate(eqn('2(x+3)=14'), parseOp('-6')).reason, 'not-enough-weights');
});

/* ---------------------------------------------------------------- résolution */
test('isSolved : boîte seule d\'un côté', () => {
  assert.ok(F.eq(isSolved(eqn('x=4')).value, 4));
  assert.equal(isSolved(eqn('7=x')).side, 'right');
  assert.equal(isSolved(eqn('2x=8')), null);
  assert.equal(isSolved(eqn('x=x+0')), null);
  assert.equal(isSolved(eqn('x+0=1(x+2)')), null);
  assert.equal(isSolved(eqn('x+1=5')), null);
});
test('solve : une, aucune ou toutes les solutions', () => {
  assert.ok(F.eq(solve(eqn('3x+2=x+8')).value, 3));
  assert.ok(F.eq(solve(eqn('2(x+3)=14')).value, 4));
  assert.ok(F.eq(solve(eqn('2x=5')).value, F.frac(5, 2)));
  assert.equal(solve(eqn('x+1=x+2')).kind, 'none');
  assert.equal(solve(eqn('2x+2=2(x+1)')).kind, 'all');
});
test('les opérations valides préservent la solution', () => {
  const ops = ['+3', '-1', '*2', '/2', '+x', '-x', 'dist'].map(parseOp);
  const rules = { negatives: true, fractions: true };
  for (const s of ['2x+1=9', '3x+2=x+8', '2(x+3)=x+10', '5-x=2']) {
    const e = eqn(s);
    for (const op of ops) {
      const v = validate(e, op, rules);
      if (v.ok) assert.ok(equivalent(e, v.result), `${s} puis ${formatOp(op)}`);
    }
  }
});
test('expand et égalité', () => {
  const e = expand(eqn('2(x+3)+x=0').left);
  assert.ok(F.eq(e.x, 3) && F.eq(e.c, 6));
  assert.ok(equationEquals(eqn('x+1=2'), eqn('1+x=2')));
});
test('solveur : chemin le plus court', () => {
  const ops = ['-1', '-2', '/2', '/3', '-x'].map(parseOp);
  const r = shortestSolution(eqn('3x+2=x+8'), ops, {});
  assert.equal(r.moves, 3);
  assert.equal(shortestSolution(eqn('3x=12'), [parseOp('/2')], {}), null);
});

/* ---------------------------------------------------------------- niveaux */
const { WORLDS } = await import('../js/levels/index.js');
const { starsFor } = await import('../js/state/scoring.js');

test('niveaux : identifiants uniques et données lisibles', () => {
  const ids = new Set();
  for (const w of WORLDS) for (const l of w.levels) {
    assert.ok(!ids.has(l.id), `id en double : ${l.id}`);
    ids.add(l.id);
    eqn(l.start);
    (l.cards ?? []).forEach(parseOp);
    assert.ok(Number.isInteger(l.par) && l.par >= 1, `${l.id} : par invalide`);
  }
});
test('niveaux : solution entière et positive dans les mondes sans fractions', () => {
  for (const w of WORLDS) for (const l of w.levels) {
    const s = solve(eqn(l.start));
    assert.equal(s.kind, 'one', `${l.id} : une seule solution attendue`);
    if (!w.rules.fractions) assert.ok(F.isInt(s.value), `${l.id} : solution non entière`);
    if (!w.rules.negatives) assert.ok(F.sign(s.value) >= 0, `${l.id} : solution négative`);
  }
});
test('niveaux : le par est exactement le nombre minimal de coups', () => {
  for (const w of WORLDS) for (const l of w.levels) {
    if (l.mode === 'guess') continue;
    const r = shortestSolution(eqn(l.start), l.cards.map(parseOp), w.rules);
    assert.ok(r, `${l.id} : niveau impossible`);
    assert.equal(r.moves, l.par, `${l.id} : par ${l.par}, minimum réel ${r.moves}`);
  }
});
test('étoiles : 3 au par, 2 jusqu\'à par + 2, sinon 1', () => {
  assert.deepEqual([1, 2, 3, 4, 5].map((m) => starsFor(m, 2)), [3, 3, 2, 2, 1]);
});

const { failed } = await run();
if (typeof process !== 'undefined' && failed) process.exitCode = 1;
