import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { ZYRVORTHIAN_SEED, ZYRVORTHIAN_MECHANICS } from '../seeds/campanha.js';
import { ITEM_SCREENSHOT_CATALOG } from '../seeds/itensCatalogo.js';
import { DRAGOES_SEED } from '../seeds/dragoes.js';
import { DICAS_SEED } from '../seeds/dicas.js';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const byItem = new Map(ITEM_SCREENSHOT_CATALOG.map(item => [item.slug,item]));

test('Zyrvorthian cadastra Astrax e Aetherion sem inventar dados ausentes', () => {
  assert.equal(ZYRVORTHIAN_SEED.length, 2);
  const astrax = ZYRVORTHIAN_SEED.find(row => row.zyrvorthian?.chefeId === 'astrax');
  const aetherion = ZYRVORTHIAN_SEED.find(row => row.zyrvorthian?.chefeId === 'aetherion');
  assert.equal(astrax.zyrvorthian.dadosStatus, 'confirmado');
  assert.equal(astrax.zyrvorthian.habilidades[0].descricao.includes('30%'), true);
  assert.deepEqual(astrax.zyrvorthian.ranking.map(r => [r.posicaoMin,r.posicaoMax,r.quantidade]), [[1,1,50],[2,3,40],[4,10,30],[11,30,20]]);
  assert.equal(astrax.zyrvorthian.ranking.some(r => r.posicaoMin >= 31), false);
  assert.equal(aetherion.zyrvorthian.dadosStatus, 'parcial');
  assert.equal(aetherion.zyrvorthian.habilidades.length, 0);
  const treaty = aetherion.zyrvorthian.receitas.find(r => r.resultadoItemSlug === 'tratado-cessar-fogo');
  assert.deepEqual(treaty.ingredientes.map(i => [i.itemSlug,i.quantidade]), [['pena-aetherion',20],['garra-trovao-aetherion',1]]);
});

test('mecânica global mantém horário de Corvith apenas como referência', () => {
  assert.equal(ZYRVORTHIAN_MECHANICS.referenciaHorario.reinoId, 345);
  assert.equal(ZYRVORTHIAN_MECHANICS.referenciaHorario.hora, '19:00');
  assert.equal(ZYRVORTHIAN_MECHANICS.trocaChefe.hora, '00:00');
  assert.equal(ZYRVORTHIAN_MECHANICS.trocaChefe.duracaoDias, 7);
  assert.equal(ZYRVORTHIAN_MECHANICS.trocaChefe.lojaDisponivelDias, 14);
  assert.equal(ZYRVORTHIAN_MECHANICS.aumentar.maximoPercentual, 50);
});

test('itens defensivos preservam preços, durações e imagens recortadas', () => {
  assert.equal(byItem.get('teleportador-sombrio').preco.valor, 30);
  assert.equal(byItem.get('teleportador-direcionado').preco.valor, 75);
  assert.equal(byItem.get('paz-do-dragao').preco.valor, 40);
  assert.equal(byItem.get('paz-do-dragao').efeito.valor, 3);
  assert.equal(byItem.get('paz-do-dragao').efeito.unidade, 'dias');
  assert.equal(byItem.get('tratado-cessar-fogo').efeito.valor, 12);
  assert.match(byItem.get('protecao-do-dragao').origem, /2 Proteções do Dragão por dia/);
  for (const slug of ['teleportador-sombrio','teleportador-direcionado','paz-do-dragao','protecao-do-dragao','tratado-cessar-fogo']) {
    const item = byItem.get(slug);
    assert.ok(item?.imagem);
    assert.equal(fs.existsSync(path.join(root,'public',item.imagem.replace(/^\//,''))), true, `${slug} sem asset`);
  }
});

test('Dragão da Água recebe Paz do Dragão e tutorial de defesa existe', () => {
  const water = DRAGOES_SEED.find(row => row.id === 'dragao_agua');
  const paz = water.habilidades.find(skill => skill.id === 'paz_do_dragao');
  assert.ok(paz);
  assert.match(paz.descricao, /3 dias/);
  assert.match(paz.descricao, /40 Rubis/);
  const tutorial = DICAS_SEED.find(row => row.slug === 'tutorial-defesa-inimigos');
  assert.ok(tutorial);
  assert.match(tutorial.conteudo, /2 Proteções do Dragão \+ 100\.000 Pedra \+ 100\.000 Ouro/);
  assert.match(tutorial.conteudo, /Teleportador Sombrio custa 30 Rubis/);
  assert.match(tutorial.conteudo, /Teleportador Direcionado custa 75 Rubis/);
});
