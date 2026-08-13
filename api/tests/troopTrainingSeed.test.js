import test from 'node:test';
import assert from 'node:assert/strict';
import { TODAS_TROPAS, TROPAS_ESPECIAIS, TROPAS_TREINAVEIS } from '../seeds/core.js';

test('seed canônico possui 53 tropas reais e treinamento confirmado nas tropas treináveis', () => {
  assert.equal(TODAS_TROPAS.length, 53);
  assert.equal(TROPAS_ESPECIAIS.length, 25);
  assert.equal(TROPAS_TREINAVEIS.length, 28);

  const pendentes = TROPAS_TREINAVEIS.filter(t => !t.treinamento?.dadosCompletos);
  assert.deepEqual(pendentes, []);
  assert.equal(TODAS_TROPAS.some(t => t.nome === 'Hoplitas Imortais'), false);
  assert.ok(TROPAS_ESPECIAIS.every(t => t.treinamento?.obtencao === 'evento' && t.treinamento?.disponivel === false));
});

test('custos pessoais da coluna Possui não fazem parte do seed', () => {
  for (const tropa of TODAS_TROPAS) {
    assert.equal('possui' in (tropa.treinamento || {}), false);
    for (const custo of tropa.treinamento?.custos || []) assert.equal('possui' in custo, false);
  }
});
