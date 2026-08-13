import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const read = path => readFileSync(new URL(`../${path}`, import.meta.url), 'utf8');

test('edição de pesquisa preserva categoria e aceita i18n no Admin', () => {
  const route = read('routes/pesquisas.js');
  const admin = read('admin/js/admin-pesquisas.js');
  assert.match(route, /categoria, nivelMax, ordem, i18n/);
  assert.match(route, /categoria: categoria \|\| p\.categoria/);
  assert.match(admin, /categoria,nivelMax,ordem,i18n/);
});

test('Admin oferece seletor de categoria e editor de tempos progressivo', () => {
  const html = read('admin/index.html');
  const admin = read('admin/js/admin-pesquisas.js');
  assert.match(html, /id="pe-categoria"/);
  assert.match(html, /Campos vazios continuam como desconhecidos/);
  assert.match(admin, /pe-tempo-/);
  assert.match(admin, /tempo:normalizarTempoAdmin/);
});
