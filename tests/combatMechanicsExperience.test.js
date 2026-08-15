import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { combatEvidenceSummary, COMBAT_FACTOR_DEFINITIONS, COMBAT_ROLE_DEFINITIONS } from '../src/components/combate/combatMechanics.js';

const read = path => readFileSync(new URL(`../${path}`, import.meta.url), 'utf8');

test('Mecânicas de Combate possui rota, entrada na Home e estrutura modular', () => {
  assert.ok(existsSync(new URL('../src/components/MecanicasCombate.jsx', import.meta.url)));
  assert.ok(existsSync(new URL('../src/components/combate/combatMechanics.js', import.meta.url)));
  const routes = read('src/app/routes.jsx');
  const tools = read('src/components/home/homeTools.js');
  assert.match(routes, /case 'mecanicas_combate'/);
  assert.match(routes, /MecanicasCombate/);
  assert.match(tools, /id: 'mecanicas_combate'/);
});

test('página cobre funções e fatores sem criar fórmula de bônus do atacante', () => {
  assert.deepEqual(COMBAT_ROLE_DEFINITIONS.map(x => x.id), ['melee','ranged','speed','tank','supply']);
  for (const id of ['quantity','attack','durability','range','speed','upgrades','composition','dragon','general','research','counters','targeting']) {
    assert.ok(COMBAT_FACTOR_DEFINITIONS.some(x => x.id === id), id);
  }
  const page = read('src/components/MecanicasCombate.jsx');
  const pt = read('src/locales/pt-BR.js');
  assert.match(page, /combat\.case\.attacker\.warning/);
  assert.match(pt, /ainda não há confirmação de um bônus matemático/);
  assert.doesNotMatch(page, /attackBonus|attackerBonus|bonusAtacante/);
});

test('resumo de evidências considera somente perfis realmente preenchidos', () => {
  const summary = combatEvidenceSummary([
    { nome:'A', perfilCombate:{ funcoesTaticas:['tank'], confianca:'experimental' } },
    { nome:'B', perfilCombate:{ tipoOficial:'ranged', confianca:'confirmado' } },
    { nome:'C', perfilCombate:{ observacoesEstrategicas:'Em investigação', confianca:'hipotese' } },
    { nome:'D', perfilCombate:{} },
    { nome:'E' },
  ]);
  assert.deepEqual(summary, { total:3, confirmado:1, experimental:1, hipotese:1 });
});

test('evidências da página vêm do catálogo online e respeitam PT/EN', () => {
  const page = read('src/components/MecanicasCombate.jsx');
  const pt = read('src/locales/pt-BR.js');
  const en = read('src/locales/en-US.js');
  assert.match(page, /useTropas/);
  assert.match(page, /perfilCombate/);
  assert.match(page, /combateObservacoesEstrategicas/);
  assert.match(pt, /'combat\.title': 'Mecânicas de Combate'/);
  assert.match(en, /'combat\.title': 'Combat Mechanics'/);
});
