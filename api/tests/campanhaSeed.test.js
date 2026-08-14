import test from 'node:test';
import assert from 'node:assert/strict';
import { ANTROPOS_SEED, SAVANA_SEED, CAMPANHA_CATEGORIAS, CAMPO_SUBTIPOS } from '../seeds/campanha.js';

test('Antropos contém os 10 níveis confirmados e categorias futuras sem dados inventados', () => {
  assert.equal(ANTROPOS_SEED.length, 10);
  assert.deepEqual(ANTROPOS_SEED.map(x => x.nivel), [1,2,3,4,5,6,7,8,9,10]);
  assert.deepEqual(CAMPANHA_CATEGORIAS, ['antropos','campos','zyrvorthian','grodz']);
  assert.deepEqual(CAMPO_SUBTIPOS, ['savana','montanha','morro','lago','floresta']);
  assert.ok(ANTROPOS_SEED.every(x => x.categoria === 'antropos' && x.fonte?.verificado));
});

test('Antropos Nv.10 reproduz composição e recursos do relatório', () => {
  const n10 = ANTROPOS_SEED.find(x => x.nivel === 10);
  assert.equal(n10.tropas.find(x => x.nome === 'Pirralho').quantidade, 250000);
  assert.equal(n10.tropas.find(x => x.nome === 'Raivoso').quantidade, 1000);
  assert.equal(n10.tropas.reduce((sum, x) => sum + x.quantidade, 0), 852000);
  assert.equal(n10.recursos.find(x => x.tipo === 'wood').exibicao, '50.0k');
  assert.equal(n10.recursos.find(x => x.tipo === 'food').exibicao, '1.12m');
  assert.equal(n10.recursos.find(x => x.tipo === 'food').exato, false);
});

test('Savana contém Nv.1–10, menos tropas que Antropos e produção confirmada', () => {
  assert.equal(SAVANA_SEED.length, 10);
  assert.deepEqual(SAVANA_SEED.map(x => x.nivel), [1,2,3,4,5,6,7,8,9,10]);
  assert.ok(SAVANA_SEED.every(x => x.categoria === 'campos' && x.subtipo === 'savana' && x.campo?.recursoPrincipal === 'food'));
  assert.equal(SAVANA_SEED.find(x => x.nivel === 6).campo.producaoHora, 16500);
  assert.equal(SAVANA_SEED.find(x => x.nivel === 10).campo.producaoHora, 27500);
  assert.equal(SAVANA_SEED.find(x => x.nivel === 10).recursos[0].valor, 10000);
  assert.equal(SAVANA_SEED.find(x => x.nivel === 10).tropas.reduce((s,x)=>s+x.quantidade,0), 38850);
});

test('recompensas da Savana ficam simbólicas quando o nome não foi confirmado', () => {
  const n5 = SAVANA_SEED.find(x => x.nivel === 5);
  const n6 = SAVANA_SEED.find(x => x.nivel === 6);
  const n10 = SAVANA_SEED.find(x => x.nivel === 10);
  assert.deepEqual(n5.recompensas.map(x=>x.simbolo), ['R2']);
  assert.deepEqual(n6.recompensas.map(x=>x.simbolo), ['R1','R2','R3']);
  assert.deepEqual(n10.recompensas.map(x=>x.simbolo), ['R1','R2','R3','R4']);
  const beef = n6.recompensas.find(x => x.codigo === 'savana-r3');
  assert.equal(beef.nome, 'Pedaço de carne bovina');
  assert.equal(beef.quantidade, 1);
  assert.equal(beef.nomeConfirmado, true);
  assert.ok(n10.recompensas.filter(x=>!x.nomeConfirmado).every(x=>!x.nome));
});

test('estratégias começam vazias e não são inventadas pelo seed', () => {
  assert.ok([...ANTROPOS_SEED,...SAVANA_SEED].every(x => x.estrategia?.publicada === false));
  assert.ok([...ANTROPOS_SEED,...SAVANA_SEED].every(x => x.estrategia?.passos?.length === 0));
});
