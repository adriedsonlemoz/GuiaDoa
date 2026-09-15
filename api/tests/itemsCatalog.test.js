import test from 'node:test';
import assert from 'node:assert/strict';
import { ITEM_SCREENSHOT_CATALOG } from '../seeds/itensCatalogo.js';

const bySlug = new Map(ITEM_SCREENSHOT_CATALOG.map(item => [item.slug,item]));

test('catálogo de screenshots tem slugs únicos e grupos válidos', () => {
  assert.ok(ITEM_SCREENSHOT_CATALOG.length >= 60);
  assert.equal(bySlug.size, ITEM_SCREENSHOT_CATALOG.length);
  const grupos = new Set(['recursos','aceleracoes','geral','arcas']);
  for (const item of ITEM_SCREENSHOT_CATALOG) {
    assert.ok(item.slug);
    assert.ok(item.nome);
    assert.ok(grupos.has(item.grupo), `${item.slug} possui grupo inválido`);
    if (item.preco?.valor != null) assert.ok(item.preco.valor >= 0);
  }
});

test('Bolsa de Cronos mantém conteúdo estruturado observado', () => {
  const item = bySlug.get('bolsa-de-cronos');
  assert.equal(item.preco.valor,345);
  assert.deepEqual(item.conteudo.map(row => [row.itemSlug,row.quantidade]), [
    ['aceleracao-1-minuto',10],['aceleracao-5-minutos',9],['aceleracao-15-minutos',8],
    ['aceleracao-1-hora',6],['aceleracao-2-5-horas',4],['aceleracao-8-horas',3],
    ['aceleracao-15-horas',2],['nulificador-de-massa',5],
  ]);
});

test('Arca do Início referencia itens do próprio catálogo', () => {
  const item = bySlug.get('arca-do-inicio');
  assert.equal(item.preco.valor,250);
  assert.ok(item.conteudo.length >= 8);
  for (const row of item.conteudo) assert.ok(bySlug.has(row.itemSlug), `item relacionado ausente: ${row.itemSlug}`);
});

test('preço promocional do Anniversary Premium preserva preço anterior', () => {
  const item = bySlug.get('13th-anniversary-chest-iv-premium');
  assert.equal(item.preco.valor,49);
  assert.equal(item.preco.valorOriginal,55);
  assert.equal(item.conteudo, undefined);
  assert.match(item.conteudoObservacao,/aleat/i);
});

test('conteúdo aleatório não é transformado em relação exata sem evidência', () => {
  for (const slug of ['13th-anniversary-chest-iv','13th-anniversary-chest-iv-premium','arca-superior-grande-dragao','arca-superior-dragao-agua','arca-superior-dragao-terra','arca-superior-dragao-fogo']) {
    const item = bySlug.get(slug);
    assert.ok(item.conteudoObservacao);
    assert.equal(item.conteudo, undefined);
  }
});
