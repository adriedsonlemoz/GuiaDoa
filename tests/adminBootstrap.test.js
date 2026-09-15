import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const read = path => readFileSync(new URL(`../${path}`, import.meta.url), 'utf8');

test('Admin contém fluxo de primeiro acesso no próprio /admin', () => {
  const html = read('api/admin/index.html');
  assert.match(html, /id="bootstrap-user-card"/);
  assert.match(html, /id="bootstrap-user"/);
  assert.match(html, /id="bootstrap-pass"/);
  assert.match(html, /admin-bootstrap\.js/);
});

test('Admin não depende mais de assistente manual de importação de seeds', () => {
  const js = read('api/admin/js/admin-bootstrap.js');
  assert.doesNotMatch(js, /Importar tudo que falta/);
  assert.doesNotMatch(js, /setup\/importar\/tropas/);
  assert.doesNotMatch(js, /importarModuloBootstrap/);
  assert.match(js, /dados padrão são migrados automaticamente/i);
});
