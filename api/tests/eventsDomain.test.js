import test from 'node:test';
import assert from 'node:assert/strict';
import { statusOcorrencia, faseAtual } from '../utils/eventos.js';
import { EVENTOS_SEED } from '../seeds/eventos.js';

test('status é calculado pelo intervalo oficial UTC', () => {
  const occ = { confirmado:true, inicioServidor:'2026-08-20T00:00:00Z', fimServidor:'2026-08-27T00:00:00Z' };
  assert.equal(statusOcorrencia(occ, new Date('2026-08-19T23:59:59Z')), 'proximo');
  assert.equal(statusOcorrencia(occ, new Date('2026-08-21T12:00:00Z')), 'ativo');
  assert.equal(statusOcorrencia(occ, new Date('2026-08-27T00:00:00Z')), 'encerrado');
});

test('ausência ou ocorrência não confirmada não vira evento global', () => {
  assert.equal(statusOcorrencia(null), 'nao_confirmado');
  assert.equal(statusOcorrencia({ confirmado:false }), 'nao_confirmado');
});

test('Corrida Armamentista possui cronograma de sete dias e ocorrência inicial', () => {
  const event = EVENTOS_SEED[0];
  assert.equal(event.fases[0].diaInicio, 1);
  assert.equal(event.fases.at(-1).diaFim, 7);
  assert.equal(event.ocorrencias.length, 1);
  assert.equal(event.ocorrencias[0].reinoId, 348);
  assert.equal(event.recompensas.length, 4);
  assert.equal(event.recompensas.at(-1).classificacao, '11-20');
  assert.equal(event.fases.find(f => f.codigo === 'fase-4').recompensas.find(r => r.requisito === 1000).itens.length, 3);
  const phase = faseAtual(event, event.ocorrencias[0], new Date('2026-08-21T01:30:00Z'));
  assert.equal(phase.codigo, 'fase-1');
});
