/**
 * Mini-lanceur de tests, sans dépendance, pour node comme pour le navigateur.
 *   test('nom', () => { ... });  puis  await run();
 */
const tests = [];

export function test(name, fn) { tests.push({ name, fn }); }

export class AssertionError extends Error {}

export const assert = {
  ok(v, msg = 'valeur fausse') { if (!v) throw new AssertionError(msg); },
  equal(a, b, msg) {
    if (a !== b) throw new AssertionError(msg ?? `attendu ${JSON.stringify(b)}, obtenu ${JSON.stringify(a)}`);
  },
  deepEqual(a, b, msg) {
    const ja = JSON.stringify(a), jb = JSON.stringify(b);
    if (ja !== jb) throw new AssertionError(msg ?? `attendu ${jb}, obtenu ${ja}`);
  },
  throws(fn, msg = 'une erreur était attendue') {
    try { fn(); } catch { return; }
    throw new AssertionError(msg);
  },
};

/** Lance tous les tests. `log(line, ok)` reçoit chaque ligne (par défaut window.__log, sinon la console). */
export async function run(log = globalThis.__log ?? ((line) => console.log(line))) {
  let failed = 0;
  for (const { name, fn } of tests) {
    try {
      await fn();
      log(`✔ ${name}`, true);
    } catch (e) {
      failed++;
      log(`✘ ${name}\n    ${e && e.message}`, false);
    }
  }
  log(`\n${tests.length - failed}/${tests.length} tests réussis`, failed === 0);
  return { total: tests.length, failed };
}
