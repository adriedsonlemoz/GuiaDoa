import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { combatClass, inferredRoles, knownUnlocks, matchesTroopFilter, sortTroops, troopSummary } from '../src/components/tropas/tacticalUtils.js';

const read = path => readFileSync(new URL(`../${path}`, import.meta.url), 'utf8');

const troops = [
  { nome:'Arqueiro', combate:'distancia', tipo:'treinavel', atqDist:100, atqPerto:5, vida:50, def:20, vel:250, car:20, poder:4, funcoes:['ataque'] },
  { nome:'Guardião', combate:'corpo_a_corpo', tipo:'especial', atqDist:0, atqPerto:30, vida:5000, def:1200, vel:300, car:30, poder:20, funcoes:['defesa'] },
  { nome:'Transporte', combate:'corpo_a_corpo', tipo:'treinavel', atqDist:0, atqPerto:1, vida:100, def:20, vel:100, car:5000, poder:7, desbloqueio:{fonte:'Fábrica',nivel:6} },
];

test('resumo tático separa alcance e origem das unidades', () => {
  assert.deepEqual(troopSummary(troops), { total:3, ranged:1, melee:2, trainable:2, special:1, fast:0 });
  assert.equal(combatClass(troops[0]), 'ranged');
  assert.equal(matchesTroopFilter(troops[1], 'defense'), true);
  assert.equal(matchesTroopFilter(troops[0], 'ranged'), true);
});

test('função tática explícita tem prioridade e fallback detecta farming', () => {
  assert.deepEqual(inferredRoles(troops[0]), ['ataque']);
  assert.ok(inferredRoles(troops[2]).includes('farming'));
});

test('desbloqueios conhecidos só incluem tropas com requisito cadastrado', () => {
  assert.deepEqual(knownUnlocks(troops).map(t => t.nome), ['Transporte']);
});

test('ordenação tática usa atributos sem alterar a lista original', () => {
  const result = sortTroops(troops, 'power', t => t.nome);
  assert.deepEqual(result.map(t => t.nome), ['Guardião','Transporte','Arqueiro']);
  assert.equal(troops[0].nome, 'Arqueiro');
});

test('Catálogo Tático é modular e substitui a antiga entrada da enciclopédia', () => {
  for (const file of ['TacticalSummary.jsx','TacticalFilters.jsx','TacticalTroopCard.jsx','UnlockProgressPanel.jsx','useUnlockProgress.js','CompareDock.jsx','tacticalUtils.js']) {
    assert.ok(existsSync(new URL(`../src/components/tropas/${file}`, import.meta.url)), file);
  }
  const main = read('src/components/Tropas.jsx');
  assert.match(main, /TacticalSummary/);
  assert.match(main, /CompareDock/);
  assert.ok(main.split('\n').length < 180);
  const routes = read('src/app/routes.jsx');
  assert.match(routes, /case 'tropas_lista': return <Tropas/);
  assert.equal(existsSync(new URL('../src/components/tropas/TropaLista.jsx', import.meta.url)), false);
  assert.match(read('src/components/tropas/TropaModal.jsx'), /RelatedTroopTips/);
  assert.match(read('api/routes/dicas.js'), /relacionados\.tropas/);
});

test('Admin gerencia taxonomia e requisito de desbloqueio da tropa', () => {
  const model = read('api/models/Tropa.js');
  const admin = read('api/admin/js/admin-tropas.js');
  assert.match(model, /categoria:/);
  assert.match(model, /funcoes:/);
  assert.match(model, /desbloqueio:/);
  assert.match(admin, /f-unlock-fonte/);
  assert.match(read('api/admin/index.html'), /f-role-ataque/);
});
