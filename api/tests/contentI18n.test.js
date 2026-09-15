import test from 'node:test';
import assert from 'node:assert/strict';
import { sanitizeContentI18n, mergeContentI18n } from '../utils/contentI18n.js';
import { validarEntradaAssistente } from '../utils/assistantValidation.js';

test('sanitização mantém apenas locale e campos permitidos', () => {
  const result = sanitizeContentI18n({
    'en-US': { nome:' Water Dragon ', descricao:' Dragon description ', proibido:'x' },
    'es-ES': { nome:'Dragón' },
  }, ['nome','descricao']);
  assert.deepEqual(result, { 'en-US': { nome:'Water Dragon', descricao:'Dragon description' } });
});

test('merge de i18n preserva traduções existentes não alteradas', () => {
  const result = mergeContentI18n(
    { 'en-US': { nome:'Water Dragon', descricao:'Old description' } },
    { 'en-US': { descricao:'New description' } },
    ['nome','descricao'],
  );
  assert.deepEqual(result, { 'en-US': { nome:'Water Dragon', descricao:'New description' } });
});

test('Assistente aceita en-US e normaliza locale desconhecido para pt-BR', () => {
  assert.equal(validarEntradaAssistente({ pergunta:'Best troop?', locale:'en-US' }).locale, 'en-US');
  assert.equal(validarEntradaAssistente({ pergunta:'Melhor tropa?', locale:'fr-FR' }).locale, 'pt-BR');
});

test('mensagem de validação do Assistente acompanha o idioma', () => {
  const en = validarEntradaAssistente({ pergunta:'', locale:'en-US' });
  const pt = validarEntradaAssistente({ pergunta:'', locale:'pt-BR' });
  assert.equal(en.mensagem, 'Invalid question.');
  assert.equal(pt.mensagem, 'Pergunta inválida.');
});
