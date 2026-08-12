import test from 'node:test';
import assert from 'node:assert/strict';
import { novosReinos12Ago2026, garantirNovosReinos } from '../utils/seedOfficialRealms.js';

const ESPERADOS = [
  { id: 345, nome: 'Corvith', fuso: 'UTC+0' },
  { id: 346, nome: 'Kenorax', fuso: 'UTC-7' },
  { id: 347, nome: 'Eisenhold', fuso: 'UTC+1' },
  { id: 348, nome: 'Zulanka', fuso: 'UTC-4' },
];

test('lista oficial de 12/08/2026 contém os quatro novos reinos', () => {
  const atual = novosReinos12Ago2026().map(({ id, nome, fuso }) => ({ id, nome, fuso }));
  assert.deepEqual(atual, ESPERADOS);
});

test('seed dos novos reinos é idempotente e usa upsert por ID', async () => {
  const docs = new Map([[345, { id: 345, nome: 'Corvith antigo', regiao: 'Personalizada', idioma: 'Inglês' }]]);
  const operacoes = [];
  const model = {
    findOne({ id }) {
      return { lean: async () => docs.get(id) || null };
    },
    async findOneAndUpdate(filtro, update, options) {
      operacoes.push({ filtro, update, options });
      const anterior = docs.get(filtro.id) || {};
      const proximo = {
        ...update.$setOnInsert,
        ...anterior,
        ...update.$set,
        id: filtro.id,
      };
      docs.set(filtro.id, proximo);
      return proximo;
    },
  };

  const dataFixa = new Date('2026-08-12T00:00:00.000Z');
  const resultado = await garantirNovosReinos({ model, agora: () => dataFixa });

  assert.equal(resultado.total, 4);
  assert.equal(resultado.inseridos, 3);
  assert.equal(resultado.atualizados, 1);
  assert.equal(operacoes.length, 4);
  assert.ok(operacoes.every(op => op.options.upsert === true));
  assert.deepEqual(operacoes.map(op => op.filtro.id), [345, 346, 347, 348]);
  assert.equal(docs.get(345).regiao, 'Personalizada');
  assert.equal(docs.get(345).idioma, 'Inglês');
  assert.equal(docs.get(348).nome, 'Zulanka');
  assert.equal(docs.get(348).fuso, 'UTC-4');
});
