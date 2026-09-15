import test from 'node:test';
import assert from 'node:assert/strict';
import { EDIFICIOS_META, EDIFICIOS_NIVEIS } from '../seeds/edificios.js';

test('catálogo de construções cobre prédios opcionais e recursos exclusivos das ilhas', () => {
  for (const slug of ['Guarnicao','Forja','Cofre','Teatro','CentroDeCiencia','FossoDeFogo','MinaDeGeodos','ViveiroSementes','FazendaPerolas']) {
    assert.ok(EDIFICIOS_META[slug], `${slug} precisa existir no catálogo canônico`);
  }
  assert.equal(EDIFICIOS_NIVEIS.FossoDeFogo.at(-1).pop, 2100);
  assert.equal(EDIFICIOS_NIVEIS.MinaDeGeodos.at(-1).prodHora, 840);
  assert.equal(EDIFICIOS_NIVEIS.ViveiroSementes.at(-1).cap, 40320);
});
