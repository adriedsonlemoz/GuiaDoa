import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';

const read = path => readFileSync(path, 'utf8');

test('Admin móvel usa listas compactas e seções recolhíveis', () => {
  const html = read('api/admin/index.html');
  const css = read('api/admin/css/admin.css');
  const ui = read('api/admin/js/admin-ui.js');

  assert.match(html, /admin-ui\.js/);
  assert.match(css, /admin-mobile-list/);
  assert.match(css, /admin-card-toggle/);
  assert.match(css, /admin-summary-toggle/);
  assert.match(ui, /compactAction/);
  assert.match(ui, /Ferramentas/);
  assert.match(ui, /MutationObserver/);
});

test('Admin compartilha a linguagem verde-petróleo e pergaminho do frontend', () => {
  const css = read('api/admin/css/admin.css');
  const html = read('api/admin/index.html');
  assert.match(css, /--navy:#2F5652/);
  assert.match(css, /--bg:#D8CDA9/);
  assert.match(css, /linear-gradient\(180deg,#3C6863,#2F5652\)/);
  assert.match(html, /\/img\/app-icon\.png/);
  assert.match(html, /https:\/\/guia-doa\.vercel\.app\//);
});

test('API serve assets do frontend para imagens usadas pelo Admin', () => {
  const app = read('api/app.js');
  assert.match(app, /app\.use\('\/assets', express\.static/);
  assert.match(app, /app\.use\('\/img', express\.static/);
  assert.equal(existsSync('public/assets/dragons/grande_dragao.webp'), true);
  assert.equal(existsSync('public/img/app-icon.png'), true);
});
