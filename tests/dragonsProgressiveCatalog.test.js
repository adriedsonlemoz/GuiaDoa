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

test('obtenção já prepara ligação futura com Campos sem inventar origens desconhecidas', () => {
  const agua = DRAGOES_SEED.find(x => x.id === 'dragao_agua');
  assert.equal(agua.obtencao.tipo, 'recompensa');
  assert.equal(agua.obtencao.dia, 2);
  const bela = DRAGOES_SEED.find(x => x.id === 'dragao_beladona');
  assert.equal(bela.obtencao.fonte.modulo, 'campos');
  assert.equal(bela.obtencao.fonte.nivelMin, 6);
  assert.equal(bela.obtencao.fonte.nivelMax, 10);
  const fogo = DRAGOES_SEED.find(x => x.id === 'dragao_fogo');
  assert.equal(fogo.obtencao.tipo, 'captura');
  assert.equal(fogo.obtencao.fonte, null);
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
