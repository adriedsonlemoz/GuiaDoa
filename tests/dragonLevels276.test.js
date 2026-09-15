import test from 'node:test';
import assert from 'node:assert/strict';
import { DRAGOES_SEED } from '../api/seeds/dragoes.js';
import { readFileSync } from 'node:fs';

const byId = id => DRAGOES_SEED.find(d => d.id === id);
const levels = Array.from({ length: 30 }, (_, i) => i + 1);

test('Fogo, Terra e Beladona possuem exatamente os níveis confirmados 1–30', () => {
  for (const id of ['dragao_fogo', 'dragao_terra', 'dragao_beladona']) {
    assert.deepEqual(byId(id).niveis.map(n => n.nivel), levels, id);
  }
});

test('as três progressões permanecem separadas', () => {
  assert.deepEqual(byId('dragao_fogo').niveis.find(n => n.nivel === 30), {
    nivel:30, vida:1467219, defesa:122268, ataquePerto:855878, ataqueDistante:855878, alcance:2700, velocidade:1425,
  });
  assert.deepEqual(byId('dragao_terra').niveis.find(n => n.nivel === 30), {
    nivel:30, vida:2913008, defesa:364126, ataquePerto:364126, ataqueDistante:364126, alcance:2550, velocidade:975,
  });
  assert.deepEqual(byId('dragao_beladona').niveis.find(n => n.nivel === 30), {
    nivel:30, vida:2122572, defesa:272111, ataquePerto:571384, ataqueDistante:1061286, alcance:1050, velocidade:1500,
  });
});


test('migração 2.76 publica somente os níveis dos três dragões no MongoDB existente', () => {
  const migrations = readFileSync(new URL('../api/services/contentMigrations.js', import.meta.url), 'utf8');
  assert.match(migrations, /content:dragoes-niveis:beta-2\.76/);
  assert.match(migrations, /const slugs = \['dragao_fogo', 'dragao_terra', 'dragao_beladona'\]/);
  assert.match(migrations, /\$set:\{ niveis:seed\.niveis \|\| \[\], atualizadoEm:new Date\(\) \}/);
  assert.match(migrations, /await migrarDragoesNiveis276\(\)/);
});
