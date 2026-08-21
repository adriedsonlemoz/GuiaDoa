import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { DRAGOES_SEED } from '../api/seeds/dragoes.js';
import { TODAS_TROPAS } from '../api/seeds/core.js';

const read = path => readFileSync(new URL(`../${path}`, import.meta.url), 'utf8');

test('catálogo progressivo possui 14 dragões e retratos extraídos das capturas', () => {
  assert.equal(DRAGOES_SEED.length, 14);
  const files = readdirSync(new URL('../public/assets/dragons/', import.meta.url)).filter(f => f.endsWith('.webp'));
  assert.equal(files.length, 14);
  for (const d of DRAGOES_SEED) assert.ok(existsSync(new URL(`../public${d.imagem}`, import.meta.url)), d.nome);
});

test('Grande Dragão registra somente snapshots confirmados e elementais do Nv.51', () => {
  const d = DRAGOES_SEED.find(x => x.id === 'grande_dragao');
  assert.deepEqual(d.niveis.map(n => n.nivel), [1, 51]);
  const n51 = d.niveis.find(n => n.nivel === 51);
  assert.equal(n51.vida, 20459996);
  assert.equal(n51.ataqueElemental, 569625);
  assert.equal(n51.rupturaElemental, 1050);
  assert.ok(d.habilidades.every(h => !('nivelAtual' in h) && !('nivelMax' in h) && !('xpConhecida' in h)));
});

test('obtenção dos dragões está conectada aos itens dos Campos', () => {
  const grande = DRAGOES_SEED.find(x => x.id === 'grande_dragao');
  assert.equal(grande.obtencao.tipo, 'inicial');
  assert.equal(grande.obtencao.captura, undefined);

  const agua = DRAGOES_SEED.find(x => x.id === 'dragao_agua');
  assert.equal(agua.obtencao.tipo, 'recompensa_ou_captura');
  assert.equal(agua.obtencao.dia, 2);
  assert.equal(agua.obtencao.captura.quantidade, 100);
  assert.equal(agua.obtencao.captura.campo.subtipo, 'lago');

  const trovao = DRAGOES_SEED.find(x => x.id === 'dragao_trovao');
  assert.equal(trovao.obtencao.tipo, 'captura');
  assert.equal(trovao.obtencao.captura.quantidade, 100);
  assert.equal(trovao.obtencao.captura.item.codigo, 'emblema-dragao-trovao');
  assert.equal(trovao.obtencao.captura.campo.subtipo, 'savana');
  assert.deepEqual(trovao.obtencao.captura.niveis, [6,7,8,9,10]);

  for (const d of DRAGOES_SEED.filter(x => x.id !== 'grande_dragao')) {
    assert.equal(d.obtencao.captura?.quantidade, 100, d.nome);
    assert.equal(d.obtencao.fonte?.modulo, 'campos', d.nome);
    assert.equal(d.obtencao.fonte?.nivelMin, 6, d.nome);
    assert.equal(d.obtencao.fonte?.nivelMax, 10, d.nome);
  }
});

test('frontend de dragões tem Atributos, Habilidades, Como obter e comparação por nível exato', () => {
  const detail = read('src/components/dragoes/DragaoDetalhe.jsx');
  const compare = read('src/components/dragoes/ui/DragaoComparacao.jsx');
  assert.match(detail, /attributes_tab/);
  assert.match(detail, /battle_skills/);
  assert.match(detail, /how_to_get/);
  assert.match(detail, /snapshot\.nivel < 51/);
  assert.match(compare, /nivel >= 51/);
  assert.match(compare, /find\(n=>n\.nivel===nivel\)/);
});

test('Hoplitas Imortais é removida do catálogo canônico', () => {
  assert.equal(TODAS_TROPAS.some(t => t.nome === 'Hoplitas Imortais'), false);
});

test('Como obter oferece item, tutorial e atalho direto para o Campo com PT/EN', () => {
  const detail = read('src/components/dragoes/DragaoDetalhe.jsx');
  const pt = read('src/locales/pt-BR.js');
  const en = read('src/locales/en-US.js');
  assert.match(detail, /obt\.captura/);
  assert.match(detail, /guiadoa_open_tip/);
  assert.match(detail, /tutorial-capturar-dragoes/);
  assert.match(detail, /guiadoa_open_field/);
  assert.match(detail, /captureItemName/);
  assert.match(detail, /captureFieldName/);
  assert.match(pt, /dragons\.required_item/);
  assert.match(en, /dragons\.required_item/);
  assert.match(pt, /dragons\.obtain_reward_or_capture/);
  assert.match(en, /dragons\.obtain_reward_or_capture/);
});
