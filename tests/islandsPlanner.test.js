import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import {
  SLOT_RULES,
  SPECIAL_RESOURCE_BY_ISLAND,
} from '../src/components/ilhas/constants.js';
import { normalSlotLimit, specialSlotLimit } from '../src/components/ilhas/ilhasUtils.js';

const read = file => readFileSync(new URL(`../${file}`, import.meta.url), 'utf8');

test('planejador separa espaços normais dos recursos exclusivos de cada ilha', () => {
  assert.equal(SLOT_RULES['ÁGUA'].normal, 4);
  assert.equal(specialSlotLimit('ÁGUA', {}), 6);
  assert.equal(SPECIAL_RESOURCE_BY_ISLAND['ÁGUA'].expansion, false);

  for (const ilha of ['FOGO','BELLA','TERRA']) {
    assert.equal(normalSlotLimit(ilha, { [ilha]: false }), 6);
    assert.equal(normalSlotLimit(ilha, { [ilha]: true }), 12);
    assert.equal(specialSlotLimit(ilha, { [ilha]: false }), 4);
    assert.equal(specialSlotLimit(ilha, { [ilha]: true }), 8);
  }
});

test('cada ilha especial usa somente seu recurso dedicado', () => {
  assert.equal(SPECIAL_RESOURCE_BY_ISLAND.FOGO.slug, 'FossoDeFogo');
  assert.equal(SPECIAL_RESOURCE_BY_ISLAND.BELLA.slug, 'ViveiroSementes');
  assert.equal(SPECIAL_RESOURCE_BY_ISLAND.TERRA.slug, 'MinaDeGeodos');
  assert.equal(SPECIAL_RESOURCE_BY_ISLAND['ÁGUA'].slug, 'FazendaPerolas');
});

test('Ilhas usa catálogo de Construções, stepper, recomendações e comparação de plano', () => {
  const manager = read('src/components/ilhas/useIlhasManager.js');
  const view = read('src/components/ilhas/IslandPlannerView.jsx');
  const summary = read('src/components/ilhas/IslandPlannerSummary.jsx');
  assert.match(manager, /useGameData/);
  assert.match(manager, /catalogoPrincipal/);
  assert.match(view, /choose_other_building/);
  assert.match(view, /adjustEntry/);
  assert.match(summary, /compare_plan/);
  assert.match(summary, /guide_suggestion/);
});
