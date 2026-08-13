import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { combatClass, matchesTroopFilter } from '../src/components/tropas/troopCatalogUtils.js';

const read = path => readFileSync(new URL(`../${path}`, import.meta.url), 'utf8');

const troops = [
  { nome:'Arqueiro', combate:'distancia', tipo:'treinavel', atqDist:100, atqPerto:5 },
  { nome:'Guardião', combate:'corpo_a_corpo', tipo:'especial', atqDist:0, atqPerto:30 },
  { nome:'Sem classificação', tipo:'treinavel', atqDist:90, atqPerto:10 },
];

test('catálogo simples separa apenas filtros essenciais de alcance e especiais', () => {
  assert.equal(combatClass(troops[0]), 'ranged');
  assert.equal(combatClass(troops[1]), 'melee');
  assert.equal(combatClass(troops[2]), 'ranged');
  assert.equal(matchesTroopFilter(troops[0], 'ranged'), true);
  assert.equal(matchesTroopFilter(troops[1], 'special'), true);
  assert.equal(matchesTroopFilter(troops[1], 'ranged'), false);
});

test('Tropas mantém lista simples e adiciona comparação rápida sem trazer o simulador para a tela principal', () => {
  for (const file of ['SimpleTroopFilters.jsx','TroopListRow.jsx','TropaModal.jsx','troopCatalogUtils.js']) {
    assert.ok(existsSync(new URL(`../src/components/tropas/${file}`, import.meta.url)), file);
  }
  const main = read('src/components/Tropas.jsx');
  const row = read('src/components/tropas/TroopListRow.jsx');
  assert.match(main, /SimpleTroopFilters/);
  assert.match(main, /TroopListRow/);
  assert.match(main, /QUICK_COMPARE_MAX = 2/);
  assert.match(main, /guiadoa_troop_compare/);
  assert.match(main, /tropas_comparar/);
  assert.match(row, /common\.power/);
  assert.match(row, /game-power-value/);
  assert.doesNotMatch(main, /calculostropas/);
  assert.doesNotMatch(main, /TacticalSummary|UnlockProgressPanel|CompareDock/);
  assert.ok(main.split('\n').length < 150);
});

test('detalhe mantém atributos, requisito e dicas relacionadas', () => {
  const detail = read('src/components/tropas/TropaModal.jsx');
  assert.match(detail, /ATRIBUTOS/);
  assert.match(detail, /troops\.training_requirement/);
  assert.match(detail, /RelatedTroopTips/);
  assert.match(detail, /createPortal/);
});

test('Admin permite cadastrar imagem e requisito sem inventar custo de treinamento', () => {
  const model = read('api/models/Tropa.js');
  const admin = read('api/admin/js/admin-tropas.js');
  const html = read('api/admin/index.html');
  assert.match(model, /imagem:/);
  assert.match(model, /desbloqueio:/);
  assert.match(admin, /f-imagem/);
  assert.match(html, /Imagem da tropa/);
  assert.match(html, /f-unlock-fonte/);
});
