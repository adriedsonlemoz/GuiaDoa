import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const read = path => readFileSync(new URL(`../${path}`, import.meta.url), 'utf8');

test('sincronização inicial usa o núcleo visual compartilhado e progresso por módulo', () => {
  const gate = read('src/app/StartupGate.jsx');
  const data = read('src/data/GameDataContext.jsx');
  const scene = read('src/app/DataSyncScene.jsx');

  assert.match(gate, /DataSyncScene/);
  assert.match(data, /completedKeys/);
  assert.match(data, /currentKey/);
  assert.match(data, /DataSyncScene/);
  assert.match(scene, /sync-orbit-wrap/);
  assert.match(scene, /sync-route/);
  assert.match(scene, /sync-meter/);
});

test('Sobre oferece atalho administrativo discreto sem poluir o shell público', () => {
  const about = read('src/components/Sobre.jsx');
  const app = read('src/App.jsx');

  assert.match(about, /about-admin-shortcut/);
  assert.match(about, /\/admin/);
  assert.match(about, /about\.admin_access/);
  assert.doesNotMatch(app, /\/admin/);
});
