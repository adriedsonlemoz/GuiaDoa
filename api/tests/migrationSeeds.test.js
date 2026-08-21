import test from 'node:test';
import assert from 'node:assert/strict';
import { TODAS_TROPAS, NIVEIS_DATA } from '../seeds/core.js';
import { DRAGOES_SEED } from '../seeds/dragoes.js';
import { EDIFICIOS_META, EDIFICIOS_NIVEIS } from '../seeds/edificios.js';
import { PESQUISAS_SEED } from '../seeds/pesquisas.js';
import { REINOS_SEED } from '../seeds/reinos.js';
import { CATS_PADRAO } from '../seeds/categoriasDicas.js';
import { ITENS_SEED } from '../seeds/itens.js';

test('migração automática possui todos os conjuntos essenciais atuais', () => {
  assert.ok(TODAS_TROPAS.length >= 40);
  assert.ok(NIVEIS_DATA.length >= 60);
  assert.ok(DRAGOES_SEED.length > 0);
  assert.ok(Object.keys(EDIFICIOS_META).length >= 10);
  assert.ok(Object.values(EDIFICIOS_NIVEIS).every(v => Array.isArray(v)));
  assert.ok(PESQUISAS_SEED.length > 0);
  assert.ok(REINOS_SEED.length > 0);
  assert.ok(CATS_PADRAO.length > 0);
  assert.ok(ITENS_SEED.length >= 6);
});

test('catálogo canônico de reinos usa os 33 IDs reais confirmados', () => {
  const map = new Map(REINOS_SEED.map(r => [r.id, r]));
  assert.equal(REINOS_SEED.length, 33);
  assert.equal(map.get(345)?.nome, 'Corvith');
  assert.equal(map.get(346)?.fuso, 'UTC-7');
  assert.equal(map.get(347)?.nome, 'Eisenhold');
  assert.equal(map.get(348)?.fuso, 'UTC-4');
  assert.equal(map.get(287)?.fuso, 'UTC-7');
  assert.equal(map.get(291)?.fuso, 'UTC+0');
  assert.equal(map.has(5), false);
  assert.equal(REINOS_SEED.some(r => r.nome === 'Fabrica'), false);
});


test('catálogo inicial de itens possui metadados úteis para o Armazém', () => {
  const pergaminhos = ITENS_SEED.find(i => i.nome === '10.000 Pergaminhos de Cura');
  assert.equal(pergaminhos?.categoria, 'Cura');
  assert.equal(pergaminhos?.quantidade, 10000);
  assert.ok(ITENS_SEED.every(i => i.nome && i.categoria && i.descricao));
});
