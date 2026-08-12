import test from 'node:test';
import assert from 'node:assert/strict';
import { calcularSyncStatus, descreverSyncStatus } from '../src/data/syncStatus.js';

test('carga completa representa MongoDB conectado', () => {
  assert.equal(calcularSyncStatus({ ok: 3, total: 3 }), 'ok');
  assert.equal(descreverSyncStatus('ok', true).label, 'MongoDB conectado');
});

test('carga parcial é explicitamente incompleta, sem fallback de cache', () => {
  assert.equal(calcularSyncStatus({ ok: 2, total: 3 }), 'parcial');
  assert.equal(descreverSyncStatus('parcial', true).label, 'Dados incompletos');
});

test('falha total vira erro e não estado de cache', () => {
  assert.equal(calcularSyncStatus({ ok: 0, total: 3 }), 'erro');
  assert.equal(descreverSyncStatus('erro', false).label, 'Sem conexão');
});
