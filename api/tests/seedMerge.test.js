import test from 'node:test';
import assert from 'node:assert/strict';
import { mesclarArrayObjetos, mesclarSeed } from '../utils/seedMerge.js';

test('merge de níveis preserva edição existente e adiciona níveis ausentes', () => {
  const atual = [{ nivel: 1, tempo: '5m', bonus: '' }];
  const seed = [{ nivel: 1, tempo: '', bonus: '10%' }, { nivel: 2, tempo: '', bonus: '20%' }];
  const r = mesclarArrayObjetos(atual, seed, 'nivel');
  assert.equal(r[0].tempo, '5m');
  assert.equal(r[0].bonus, '10%');
  assert.equal(r[1].nivel, 2);
  assert.equal(r[1].bonus, '20%');
});

test('merge de seed preenche dados faltantes sem substituir dados cadastrados', async () => {
  const existente = { slug: 'x', nome: 'Nome editado', descricao: '', niveis: [{ nivel: 1, valor: 99 }] };
  let patch = null;
  const model = {
    findOne() { return { lean: async () => existente }; },
    async updateOne(_filtro, update) { patch = update.$set; },
    async create() { throw new Error('não deveria inserir'); },
  };
  const resultado = await mesclarSeed(model, { slug: 'x' }, {
    slug: 'x', nome: 'Nome do seed', descricao: 'Descrição padrão',
    niveis: [{ nivel: 1, valor: 10, extra: 5 }, { nivel: 2, valor: 20 }],
  }, { mergeArrays: { niveis: 'nivel' } });

  assert.equal(resultado.completado, 1);
  assert.equal(patch.descricao, 'Descrição padrão');
  assert.equal(patch.nome, undefined);
  assert.equal(patch.niveis[0].valor, 99);
  assert.equal(patch.niveis[0].extra, 5);
  assert.equal(patch.niveis[1].nivel, 2);
});
