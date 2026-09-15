import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { buildTroopCatalogAnalysis, combatClass, explicitTacticalRoles, matchesTroopFilter, sortTroops, strongestAttributeIds } from '../src/components/tropas/troopCatalogUtils.js';

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



test('filtros derivados priorizam atributos numéricos, detectam velocidade e distinguem híbridas de ranged puro', () => {
  const catalog = [
    { nome:'Stale ranged', combate:'corpo_a_corpo', atqPerto:0, atqDist:900, vel:100 },
    { nome:'Ranged dominante', combate:'corpo_a_corpo', atqPerto:100, atqDist:900, vel:200 },
    { nome:'Melee híbrido', combate:'distancia', atqPerto:1000, atqDist:800, vel:300 },
    { nome:'Rápida', combate:'corpo_a_corpo', atqPerto:500, atqDist:0, vel:1500 },
  ];
  const analysis = buildTroopCatalogAnalysis(catalog);
  assert.equal(combatClass(catalog[0]), 'ranged');
  assert.equal(matchesTroopFilter(catalog[0], 'ranged_only', analysis), true);
  assert.equal(matchesTroopFilter(catalog[1], 'ranged', analysis), true);
  assert.equal(matchesTroopFilter(catalog[1], 'hybrid', analysis), true);
  assert.equal(matchesTroopFilter(catalog[2], 'melee', analysis), true);
  assert.equal(matchesTroopFilter(catalog[2], 'ranged', analysis), false);
  assert.equal(matchesTroopFilter(catalog[3], 'speed', analysis), true);
});

test('ordenação de tropas cobre atributos e equilíbrio sem comparar escalas brutas entre campos', () => {
  const catalog = [
    { nome:'A', vida:100, def:100, atqPerto:100, atqDist:0, vel:100, car:10, alcance:0, poder:1 },
    { nome:'B', vida:300, def:20, atqPerto:500, atqDist:0, vel:50, car:900, alcance:0, poder:2 },
    { nome:'C', vida:180, def:180, atqPerto:180, atqDist:0, vel:180, car:100, alcance:0, poder:3 },
  ];
  const analysis = buildTroopCatalogAnalysis(catalog);
  assert.equal(sortTroops(catalog, 'life', analysis)[0].nome, 'B');
  assert.equal(sortTroops(catalog, 'load', analysis)[0].nome, 'B');
  assert.equal(sortTroops(catalog, 'speed', analysis)[0].nome, 'C');
  assert.equal(sortTroops(catalog, 'balance', analysis)[0].nome, 'C');
  assert.ok(strongestAttributeIds(catalog[1], analysis).includes('load'));
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
  for (const role of ['melee','ranged','ranged_only','hybrid','speed','tank','supply']) assert.match(filters, new RegExp(`'${role}'`));
  for (const sortId of ['life','speed','load','ranged_attack','melee_attack','balance']) assert.match(filters, new RegExp(`'${sortId}'`));
  assert.match(row, /troop-card-tags/);
  assert.match(row, /troop-card-stats/);
  assert.match(row, /strongestAttributeIds/);
  assert.match(main, /buildTroopCatalogAnalysis/);
  assert.match(main, /sortTroops/);
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


test('troop detail always exposes good/weak matchup state', () => {
  const summary = read('src/components/tropas/TroopCombatSummary.jsx');
  const pt = read('src/locales/pt-BR.js');
  const admin = read('api/admin/index.html');
  assert.match(summary, /troops\.matchup_unknown/);
  assert.match(summary, /troops\.strong_against/);
  assert.match(summary, /troops\.weak_against/);
  assert.match(pt, /'troops\.strong_against': 'Bom contra'/);
  assert.match(pt, /'troops\.matchup_unknown': 'Ainda não identificado'/);
  assert.match(admin, />Bom contra </);
});
