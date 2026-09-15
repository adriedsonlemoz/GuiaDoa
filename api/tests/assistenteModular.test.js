import test from 'node:test';
import assert from 'node:assert/strict';
import { detectarIntencao } from '../services/assistente/intent.js';
import { detectarAnalise, buildContextoAnalitico } from '../services/assistente/analytics.js';
import { buildSystemPrompt } from '../services/assistente/prompt.js';

test('detecção de intenção do Assistente ficou isolada em serviço puro', () => {
  assert.equal(detectarIntencao('Qual tropa tem mais velocidade?'), 'tropa');
  assert.equal(detectarIntencao('Qual o fuso do reino 348?'), 'reino');
  assert.equal(detectarIntencao('Como funciona a Torre de Oração?'), 'geral');
});

test('análise numérica de tropas continua pré-calculando ranking', () => {
  const analise = detectarAnalise('Quais são as 2 tropas mais rápidas?');
  const texto = buildContextoAnalitico([
    { nome: 'A', vel: 10, poder: 1 },
    { nome: 'B', vel: 30, poder: 2 },
    { nome: 'C', vel: 20, poder: 3 },
  ], analise);
  assert.match(texto, /TOP 2 MAIORES VELOCIDADE/);
  assert.ok(texto.indexOf('B: Velocidade=30') < texto.indexOf('C: Velocidade=20'));
});

test('montagem do prompt aceita contexto modularizado', () => {
  const prompt = buildSystemPrompt({
    intencao: 'reino', contextoAnalitico: '', tropasTxt: '', itensTxt: '', edificiosTxt: '',
    dragoesTxt: '', pesquisasTxt: '', niveisTxt: '', reinosTxt: 'Reino 348 — Zulanka | UTC-4',
    aprTxt: 'dados de aprimoramento',
  });
  assert.match(prompt, /Dragons of Atlantis/);
  assert.match(prompt, /Reino 348 — Zulanka/);
});
