import test from 'node:test';
import assert from 'node:assert/strict';
import { obterBootstrapStatus } from '../services/bootstrapStatus.js';

function model(total) {
  return { countDocuments: async () => total };
}

function models(overrides = {}) {
  const base = {
    User: model(1), Tropa: model(10), Nivel: model(10), Dragao: model(5), Edificio: model(12),
    Item: model(0), Pesquisa: model(29), Reino: model(4), CategoriaDica: model(5), Dica: model(0),
  };
  return { ...base, ...overrides };
}

test('bootstrap pede criação de usuário quando não há admin', async () => {
  const status = await obterBootstrapStatus(models({ User: model(0) }), { setupKeyObrigatoria: true });
  assert.equal(status.usuario.necessario, true);
  assert.equal(status.usuario.setupKeyObrigatoria, true);
  assert.equal(status.pronto, false);
});

test('bootstrap detecta apenas módulos essenciais vazios como faltantes', async () => {
  const status = await obterBootstrapStatus(models({ Tropa: model(0), Reino: model(0), Item: model(0) }));
  assert.deepEqual(status.dados.faltantes.sort(), ['reinos', 'tropas']);
  assert.equal(status.dados.necessario, true);
  assert.equal(status.dados.modulos.find(m => m.id === 'itens').vazio, true);
  assert.equal(status.dados.modulos.find(m => m.id === 'itens').essencial, false);
});

test('bootstrap considera pronto mesmo com conteúdos opcionais vazios', async () => {
  const status = await obterBootstrapStatus(models());
  assert.equal(status.usuario.necessario, false);
  assert.equal(status.dados.necessario, false);
  assert.equal(status.pronto, true);
});
