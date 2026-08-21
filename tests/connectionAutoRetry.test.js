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

test('falhas temporárias de conexão usam nova tentativa automática na tela inicial', () => {
  const startup = read('src/app/StartupGate.jsx');
  const provider = read('src/data/GameDataContext.jsx');
  for (const source of [startup, provider]) {
    assert.match(source, /RETRYABLE_CONNECTION_CODES/);
    assert.match(source, /AUTO_RETRY_MS/);
    assert.match(source, /setTimeout/);
  }
  assert.match(provider, /app\.sync\.auto_retry_note/);
  assert.match(startup, /app\.sync\.retry_progress/);
  assert.match(startup, /MAX_AUTO_RETRIES/);
  assert.match(startup, /DataSyncScene/);
  assert.doesNotMatch(startup, /code=\{erro\.code\}[^]*onRetry=\{verificar\}[^]*GD-NET-002/);
});
