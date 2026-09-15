import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';

const read = path => readFileSync(new URL(`../${path}`, import.meta.url), 'utf8');

test('central separada de Mecânicas de Combate foi removida da navegação pública', () => {
  const routes = read('src/app/routes.jsx');
  const tools = read('src/components/home/homeTools.js');
  assert.doesNotMatch(routes, /MecanicasCombate|mecanicas_combate/);
  assert.doesNotMatch(tools, /mecanicas_combate/);
  assert.equal(existsSync(new URL('../src/components/MecanicasCombate.jsx', import.meta.url)), false);
});

test('cold start do Render acontece em segundo plano com backoff progressivo e teto de 60s', () => {
  const startup = read('src/app/StartupGate.jsx');
  const provider = read('src/data/GameDataContext.jsx');
  const sync = read('src/app/useAppSync.js');

  assert.match(provider, /BACKGROUND_RETRY_DELAYS/);
  assert.match(provider, /5000, 15000, 30000, 60000/);
  assert.match(provider, /WAKE_TIMEOUT_MS = 45000/);
  assert.match(provider, /\/api\/health/);
  assert.match(provider, /setTimeout/);
  assert.match(provider, /readGameDataCache/);
  assert.match(provider, /setDataSource\('cache'\)/);
  assert.match(startup, /CONNECTION_TIMEOUT_MS = 45000/);
  assert.doesNotMatch(startup, /DataSyncScene/);
  assert.match(sync, /status === 'cached'|dataSource === 'cache'/);
});
