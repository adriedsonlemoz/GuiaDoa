import test from 'node:test';
import assert from 'node:assert/strict';
import { DICAS_SEED } from '../seeds/dicas.js';

test('guia inicial de construções está preparado para PT/EN e dados conectados', () => {
  const guia = DICAS_SEED.find(item => item.slug === 'guia-inicial-construcoes');
  assert.ok(guia);
  assert.equal(guia.categoria, 'iniciante');
  assert.equal(guia.tipo, 'guia');
  assert.equal(guia.destaque, true);
  assert.match(guia.conteudo, /\{\{fonte_n35\}\}/);
  assert.match(guia.conteudo, /\{\{fontes_38\}\}/);
  assert.ok(guia.i18n?.['en-US']?.titulo);
  assert.ok(guia.i18n?.['en-US']?.conteudo);
  assert.deepEqual(guia.relacionados.modulos, ['ilhas', 'edificios', 'tropas', 'dragoes']);
});
