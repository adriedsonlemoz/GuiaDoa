import test from 'node:test';
import assert from 'node:assert/strict';
import { calcularSyncStatus, descreverSyncStatus } from '../src/data/syncStatus.js';

test('sync completo fica online/ok', () => {
  assert.equal(calcularSyncStatus({ ok: 3, total: 3 }), 'ok');
  assert.equal(descreverSyncStatus('ok', true).label, 'Online e atualizado');
});

test('cache não é confundido com sincronização online', () => {
  assert.equal(calcularSyncStatus({ ok: 0, total: 3, usouCache: true }), 'cache');
  assert.equal(descreverSyncStatus('cache', false).label, 'Usando cache');
});

test('falha total sem fallback vira erro', () => {
  assert.equal(calcularSyncStatus({ ok: 0, total: 3 }), 'erro');
});
