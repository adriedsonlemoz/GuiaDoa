import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const read = p => fs.readFileSync(p, 'utf8');

test('Beta 2.70 inclui módulo público de eventos e destaque por reino', () => {
  const routes = read('src/app/routes.jsx');
  const home = read('src/components/Home.jsx');
  const eventos = read('src/components/Eventos.jsx');
  assert.match(routes, /case 'eventos'/);
  assert.match(home, /EventHomeHighlight/);
  assert.match(read('src/components/eventos/EventHomeHighlight.jsx'), /events\.confirmed_in/);
  assert.match(eventos, /occurrenceForRealm/);
  assert.match(eventos, /final_ranking_rewards/);
  assert.match(eventos, /not_confirmed_rule/);
});

test('eventos usam reset global separado do fuso do reino', () => {
  const seed = read('api/seeds/eventos.js');
  const utils = read('api/utils/eventos.js');
  assert.match(seed, /servidorFuso:'UTC'/);
  assert.match(seed, /horarioReset:'00:00'/);
  assert.match(seed, /reinoId:348/);
  assert.match(utils, /statusOcorrencia/);
});

test('Admin oferece eventos e ocorrências por reino', () => {
  const state = read('api/admin/js/admin-state.js');
  const shell = read('api/admin/js/admin-shell.js');
  const admin = read('api/admin/js/admin-eventos.js');
  assert.match(state, /id:'eventos'/);
  assert.match(shell, /carregarEventos/);
  assert.match(admin, /Ocorrências confirmadas por reino/);
  assert.match(admin, /Ausência de ocorrência não significa/);
  assert.match(admin, /me-recompensas/);
  assert.match(admin, /fonte:EVENTO_FONTE/);
});

test('Sobre e conteúdo secundário foram agrupados em Extras', () => {
  const tools = read('src/components/home/homeTools.js');
  const extras = read('src/components/Extras.jsx');
  assert.doesNotMatch(tools, /id: 'sobre'/);
  assert.doesNotMatch(tools, /modal:color_builder/);
  assert.match(tools, /id: 'extras'/);
  assert.match(extras, /setRoute\('sobre'\)/);
});
