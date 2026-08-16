import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { combatClass, explicitTacticalRoles, matchesTroopFilter } from '../src/components/tropas/troopCatalogUtils.js';

const read = path => readFileSync(new URL(`../${path}`, import.meta.url), 'utf8');

const troops = [
  { nome:'Arqueiro', combate:'distancia', tipo:'treinavel', atqDist:100, atqPerto:5 },
  { nome:'Guardião', combate:'corpo_a_corpo', tipo:'especial', atqDist:0, atqPerto:30, perfilCombate:{ funcoesTaticas:['melee','tank'] } },
  { nome:'Transporte', categoria:'transporte', combate:'corpo_a_corpo', tipo:'treinavel' },
  { nome:'Rápida', combate:'corpo_a_corpo', rapida:true, tipo:'treinavel' },
];

test('catálogo filtra pelas novas funções táticas com fallback compatível para registros antigos', () => {
  assert.equal(combatClass(troops[0]), 'ranged');
  assert.deepEqual(explicitTacticalRoles(troops[1]), ['melee','tank']);
  assert.equal(matchesTroopFilter(troops[0], 'ranged'), true);
  assert.equal(matchesTroopFilter(troops[1], 'tank'), true);
  assert.equal(matchesTroopFilter(troops[2], 'supply'), true);
  assert.equal(matchesTroopFilter(troops[3], 'speed'), true);
  assert.equal(matchesTroopFilter(troops[1], 'ranged'), false);
});

test('Tropas mantém lista simples, filtros táticos e comparação rápida sem trazer o simulador para a tela principal', () => {
  for (const file of ['SimpleTroopFilters.jsx','TroopListRow.jsx','TropaModal.jsx','TroopCombatSummary.jsx','TroopCombatDetails.jsx','troopCatalogUtils.js']) {
    assert.ok(existsSync(new URL(`../src/components/tropas/${file}`, import.meta.url)), file);
  }
  const main = read('src/components/Tropas.jsx');
  const filters = read('src/components/tropas/SimpleTroopFilters.jsx');
  const row = read('src/components/tropas/TroopListRow.jsx');
  assert.match(main, /SimpleTroopFilters/);
  assert.match(main, /TroopListRow/);
  assert.match(main, /QUICK_COMPARE_MAX = 2/);
  assert.match(main, /guiadoa_troop_compare/);
  assert.match(main, /tropas_comparar/);
  for (const role of ['melee','ranged','speed','tank','supply']) assert.match(filters, new RegExp(`'${role}'`));
  assert.match(row, /troop-card-tags/);
  assert.match(row, /troop-card-stats/);
  assert.doesNotMatch(main, /calculostropas/);
  assert.doesNotMatch(main, /TacticalSummary|UnlockProgressPanel|CompareDock/);
  assert.ok(main.split('\n').length < 150);
});

test('detalhe mantém descrição, matchups, uso recomendado e seção avançada recolhível', () => {
  const detail = read('src/components/tropas/TropaModal.jsx');
  const summary = read('src/components/tropas/TroopCombatSummary.jsx');
  const combat = read('src/components/tropas/TroopCombatDetails.jsx');
  assert.match(detail, /ATRIBUTOS/);
  assert.match(detail, /troops\.training_requirement/);
  assert.match(detail, /RelatedTroopTips/);
  assert.match(detail, /TroopCombatSummary/);
  assert.match(detail, /TroopCombatDetails/);
  assert.match(detail, /createPortal/);
  assert.match(summary, /troops\.strong_against/);
  assert.match(summary, /troops\.weak_against/);
  assert.match(summary, /troops\.how_to_use/);
  assert.match(combat, /<details/);
  assert.match(combat, /troops\.confidence\.experimental/);
});

test('Admin permite cadastrar perfil de combate sem remover os campos legados', () => {
  const model = read('api/models/Tropa.js');
  const admin = read('api/admin/js/admin-tropas.js');
  const html = read('api/admin/index.html');
  assert.match(model, /perfilCombate:/);
  assert.match(model, /tipoOficial:/);
  assert.match(model, /funcoesTaticas:/);
  assert.match(model, /taxonomiaCombateVersao/);
  assert.match(model, /tipo:\s+\{ type: String, enum: \['treinavel', 'especial'\]/);
  assert.match(html, /f-combat-role-tank/);
  assert.match(admin, /confiancaCampos/);
  assert.match(html, /Dados de combate, counters e evidências/);
  assert.match(html, /f-combat-official/);
  assert.match(html, /English — combate/);
});
