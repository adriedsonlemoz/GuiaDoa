import test from 'node:test';
import assert from 'node:assert/strict';
import { cacheAgeMs, GAME_DATA_CACHE_FRESH_MS, hasUsableGameData, isGameDataCacheFresh } from '../src/data/dataCache.js';

test('cache de catálogo reconhece snapshot utilizável sem exigir todos os módulos preenchidos', () => {
  assert.equal(hasUsableGameData({ tropas:[{ id:1 }], reinos:[] }), true);
  assert.equal(hasUsableGameData({ tropas:[], reinos:[], eventos:[] }), false);
  assert.equal(hasUsableGameData(null), false);
});

test('TTL do cache é suave e calculado a partir da última atualização', () => {
  const now = Date.parse('2026-08-21T18:00:00.000Z');
  const fresh = { updatedAt:new Date(now - GAME_DATA_CACHE_FRESH_MS + 1000).toISOString() };
  const stale = { updatedAt:new Date(now - GAME_DATA_CACHE_FRESH_MS - 1000).toISOString() };
  assert.equal(isGameDataCacheFresh(fresh, now), true);
  assert.equal(isGameDataCacheFresh(stale, now), false);
  assert.equal(cacheAgeMs(fresh, now), GAME_DATA_CACHE_FRESH_MS - 1000);
});
