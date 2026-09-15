import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { DRAGON_CAPTURE_MAP, DRAGON_CAPTURE_ITEM_COUNT } from '../seeds/dragonCapture.js';
import { DRAGOES_SEED } from '../seeds/dragoes.js';
import { SAVANA_SEED, LAGO_SEED, FLORESTA_SEED, MONTANHA_SEED, MORRO_SEED } from '../seeds/campanha.js';

test('todos os dragões capturáveis usam 100 itens e Campos Nv.6–10', () => {
  assert.equal(DRAGON_CAPTURE_ITEM_COUNT, 100);
  assert.equal(Object.keys(DRAGON_CAPTURE_MAP).length, 13);
  for (const capture of Object.values(DRAGON_CAPTURE_MAP)) {
    assert.equal(capture.quantidade, 100);
    assert.deepEqual(capture.niveis, [6,7,8,9,10]);
    assert.equal(capture.nivelMin, 6);
    assert.equal(capture.nivelMax, 10);
  }
});

test('Dragão do Trovão usa Emblema do Dragão do Trovão da Savana Nv.6–10', () => {
  const thunder = DRAGON_CAPTURE_MAP.dragao_trovao;
  assert.ok(thunder);
  assert.equal(thunder.item.codigo, 'emblema-dragao-trovao');
  assert.equal(thunder.item.nome, 'Emblema do Dragão do Trovão');
  assert.equal(thunder.campo.subtipo, 'savana');
  assert.equal(thunder.item.i18n?.['en-US']?.nome, 'Thunder Dragon Emblem');
  assert.equal(existsSync(new URL(`../../public${thunder.item.imagem}`, import.meta.url)), true);
});

test('Dragão da Água permite recompensa de novo usuário ou captura no Lago', () => {
  const water = DRAGOES_SEED.find(d => d.id === 'dragao_agua');
  assert.equal(water.obtencao.tipo, 'recompensa_ou_captura');
  assert.equal(water.obtencao.dia, 2);
  assert.equal(water.obtencao.captura.quantidade, 100);
  assert.equal(water.obtencao.captura.campo.subtipo, 'lago');
  assert.match(water.obtencao.resumo, /Contas antigas/);
  assert.ok(water.obtencao.i18n?.['en-US']?.resumo);
});

test('Grande Dragão continua inicial e os demais possuem captura conectada', () => {
  const great = DRAGOES_SEED.find(d => d.id === 'grande_dragao');
  assert.equal(great.obtencao.tipo, 'inicial');
  assert.equal(great.obtencao.captura, undefined);
  for (const dragon of DRAGOES_SEED.filter(d => d.id !== 'grande_dragao')) {
    assert.equal(dragon.obtencao.captura?.quantidade, 100, dragon.nome);
  }
});

test('somente a Savana possui recompensas nos níveis 1–5', () => {
  for (const level of [1,2,3,4,5]) {
    assert.ok(SAVANA_SEED.find(e => e.nivel === level).recompensas.length > 0);
  }
  for (const seed of [LAGO_SEED,FLORESTA_SEED,MONTANHA_SEED,MORRO_SEED]) {
    for (const level of [1,2,3,4,5]) {
      const entry = seed.find(e => e.nivel === level);
      assert.equal(entry.recompensasStatus, 'confirmado');
      assert.deepEqual(entry.recompensas, []);
    }
  }
});
