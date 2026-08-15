import test from 'node:test';
import assert from 'node:assert/strict';
import { normalizeCombatProfile } from '../utils/troopCombatProfile.js';
import { TROOP_COMBAT_EVIDENCE } from '../seeds/tropasCombate.js';

test('perfil de combate aceita campos opcionais, múltiplas funções e saneia enums', () => {
  const profile = normalizeCombatProfile({
    tipoOficial:'ranged',
    funcoesTaticas:['ranged','tank','ranged','invalida'],
    tier:'4',
    forteContra:[' Gigantes ','Gigantes',''],
    fracoContra:['Speed'],
    habilidadesEspeciais:['Congela alvo'],
    confianca:'experimental',
    confiancaCampos:{ funcoesTaticas:'experimental', counters:'hipotese', tier:'invalida' },
  });
  assert.equal(profile.tipoOficial, 'ranged');
  assert.deepEqual(profile.funcoesTaticas, ['ranged','tank']);
  assert.equal(profile.tier, 4);
  assert.deepEqual(profile.forteContra, ['Gigantes']);
  assert.equal(profile.confianca, 'experimental');
  assert.equal(profile.confiancaCampos.counters, 'hipotese');
  assert.equal(profile.confiancaCampos.tier, '');
});

test('evidências iniciais não transformam hipóteses em regras absolutas', () => {
  const beetle = TROOP_COMBAT_EVIDENCE.find(x => x.nome === 'Escaravelho de Guerra');
  const leviathan = TROOP_COMBAT_EVIDENCE.find(x => x.nome === 'Leviatã Ártico');
  const magma = TROOP_COMBAT_EVIDENCE.find(x => x.nome === 'Magmassauros');
  assert.deepEqual(beetle.perfilCombate.funcoesTaticas, ['melee','tank']);
  assert.equal(beetle.perfilCombate.confianca, 'experimental');
  assert.deepEqual(leviathan.perfilCombate.funcoesTaticas, ['ranged']);
  assert.match(leviathan.perfilCombate.observacoesEstrategicas, /não significa que a unidade nunca seja atacada/i);
  assert.equal(magma.perfilCombate.funcoesTaticas, undefined);
  assert.match(magma.perfilCombate.observacoesEstrategicas, /Não há base/i);
});
