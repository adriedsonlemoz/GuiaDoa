import test from 'node:test';
import assert from 'node:assert/strict';
import { DRAGOES_SEED } from '../seeds/dragoes.js';
import { TODAS_TROPAS } from '../seeds/core.js';
import { SAVANA_SEED } from '../seeds/campos/savana.js';

test('ordem principal dos dragões fica fixa e nomes ingleses usam o jogo', () => {
  assert.deepEqual(DRAGOES_SEED.slice(0,7).map(d => d.id), [
    'grande_dragao','dragao_agua','dragao_fogo','dragao_terra','dragao_beladona','dragao_toxico','dragao_espinha_negra',
  ]);
  assert.deepEqual(DRAGOES_SEED.map(d => d.ordem), Array.from({ length:14 },(_,i)=>i+1));
  const en = Object.fromEntries(DRAGOES_SEED.map(d => [d.id,d.i18n?.['en-US']?.nome]));
  assert.equal(en.dragao_beladona, 'Nightshade Dragon');
  assert.equal(en.dragao_gelo, 'Frost Dragon');
  assert.equal(en.dragao_espinha_negra, 'Blackspine Dragon');
  assert.equal(en.dragao_fada, 'Faerie Dragon');
});

test('Grande Dragão e Dragão da Água têm atributos confirmados 1–30 e níveis enviados', () => {
  const great = DRAGOES_SEED.find(d => d.id === 'grande_dragao');
  const water = DRAGOES_SEED.find(d => d.id === 'dragao_agua');
  for (let nivel=1;nivel<=30;nivel+=1) {
    assert.ok(great.niveis.some(n => n.nivel === nivel), `Grande Dragão Nv.${nivel}`);
    assert.ok(water.niveis.some(n => n.nivel === nivel), `Dragão da Água Nv.${nivel}`);
  }
  assert.deepEqual(great.niveis.find(n=>n.nivel===22), { nivel:22, vida:672242, defesa:74693, ataquePerto:186734, ataqueDistante:186734, alcance:1540, velocidade:715 });
  assert.deepEqual(water.niveis.find(n=>n.nivel===10), { nivel:10, vida:89691, defesa:14948, ataquePerto:44845, ataqueDistante:44845, alcance:1800, velocidade:900 });
  assert.deepEqual(water.niveis.find(n=>n.nivel===29), { nivel:29, vida:873346, defesa:145557, ataquePerto:436673, ataqueDistante:436673, alcance:2610, velocidade:1305 });
  assert.ok(great.niveis.some(n => n.nivel === 51 && n.ataqueElemental === 569625));
});

test('alimentação e Savana compartilham XP confirmado', () => {
  const water = DRAGOES_SEED.find(d => d.id === 'dragao_agua');
  assert.deepEqual(water.itensAlimentacao.map(x=>[x.i18n['en-US'].nome,x.xp]), [['Mutton',100],['Beef',200],['Chicken',500],['Venison',1000]]);
  const sav10 = SAVANA_SEED.find(x => x.nivel === 10);
  const meats = sav10.recompensas.filter(r => r.xpDragao != null);
  assert.deepEqual(meats.map(x=>[x.i18n['en-US'].nome,x.xpDragao]), [['Mutton',100],['Beef',200],['Chicken',500]]);
});

test('todas as tropas possuem nome e descrição oficiais em inglês', () => {
  assert.equal(TODAS_TROPAS.length, 53);
  assert.equal(TODAS_TROPAS.filter(t=>t.i18n?.['en-US']?.nome && t.i18n?.['en-US']?.desc).length, 53);
  const byName = name => TODAS_TROPAS.find(t=>t.nome===name);
  assert.equal(byName('Milicianos').i18n['en-US'].nome, 'Conscripts');
  assert.equal(byName('Arqueiros').i18n['en-US'].nome, 'Longbowmen');
  assert.equal(byName('Magmassauros').i18n['en-US'].nome, 'Lava Jaws');
  assert.ok(byName('Magmassauros').aliases.includes('Lava Jaws'));
});
