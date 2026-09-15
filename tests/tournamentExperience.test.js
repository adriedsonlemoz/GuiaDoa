import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';

const read = path => readFileSync(new URL(`../${path}`, import.meta.url), 'utf8');

test('Torneios usa registro central, filtros e recentes em vez de categorias fixas na tela', () => {
  const hub = read('src/components/Torneios.jsx');
  const registry = read('src/components/torneios/tournamentRegistry.js');
  assert.match(hub, /TOURNAMENT_REGISTRY/);
  assert.match(hub, /readRecentTournaments/);
  assert.match(hub, /GameTabs/);
  assert.doesNotMatch(hub, /ORDEM_CATEGORIAS/);
  assert.match(registry, /type: 'calculator'/);
  assert.match(registry, /type: 'guide'/);
});

test('detalhe de torneio oferece resumo, conteúdo e plano local', () => {
  const hub = read('src/components/Torneios.jsx');
  const plan = read('src/components/torneios/TournamentPlan.jsx');
  assert.match(hub, /tournament\.detail\.summary/);
  assert.match(hub, /tournament\.detail\.plan/);
  assert.match(plan, /saveTournamentPlan/);
  assert.match(plan, /tournament-progress-track/);
});

test('layout compartilhado mostra progressão acumulativa e não duplica prêmio principal', () => {
  const layout = read('src/components/torneios/shared/TorneioLayout.jsx');
  assert.match(layout, /tournament-goal-list/);
  assert.match(layout, /cumulative_note/);
  assert.match(layout, /achieved\.reduce/);
  assert.doesNotMatch(layout, /\+ \(\(premios\.princ/);
});

test('componentes estruturais do centro de torneios existem', () => {
  [
    'src/components/torneios/tournamentRegistry.js',
    'src/components/torneios/TournamentPlan.jsx',
    'src/components/torneios/TournamentTurnover.jsx',
  ].forEach(path => assert.ok(existsSync(new URL(`../${path}`, import.meta.url)), path));
});
