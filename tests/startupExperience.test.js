import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const read = path => readFileSync(new URL(`../${path}`, import.meta.url), 'utf8');

test('inicialização é offline-first e não prende o shell atrás do Render', () => {
  const gate = read('src/app/StartupGate.jsx');
  const data = read('src/data/GameDataContext.jsx');
  const cache = read('src/data/dataCache.js');
  const banner = read('src/app/SyncProgressBanner.jsx');

  assert.match(gate, /return children/);
  assert.match(gate, /Erros de rede\/cold start nunca bloqueiam/);
  assert.match(data, /readGameDataCache/);
  assert.match(data, /writeGameDataCache/);
  assert.match(data, /wakeBackend/);
  assert.match(data, /return <GameDataContext\.Provider/);
  assert.match(cache, /indexedDB/);
  assert.match(cache, /GAME_DATA_CACHE_FRESH_MS/);
  assert.match(banner, /cached_title/);
});

test('Sobre oferece atalho administrativo discreto sem poluir o shell público', () => {
  const about = read('src/components/Sobre.jsx');
  const app = read('src/App.jsx');

  assert.match(about, /about-admin-shortcut/);
  assert.match(about, /\/admin/);
  assert.match(about, /about\.admin_access/);
  assert.doesNotMatch(app, /\/admin\//);
});
