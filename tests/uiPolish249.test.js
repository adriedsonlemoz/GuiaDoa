import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const read = path => readFileSync(new URL(`../${path}`, import.meta.url), 'utf8');

test('Home organiza módulos em grupos lógicos e mantém Sobre por último', () => {
  const tools = read('src/components/home/homeTools.js');
  const expected = ['tropas','dragoes','edificios','pesquisas','itens','campanha','ilhas','niveis','torneios','dicas','modal:color_builder','sobre'];
  let previous = -1;
  for (const id of expected) {
    const index = tools.indexOf(`id: '${id}'`);
    assert.ok(index > previous, `${id} deve respeitar a nova ordem da Home`);
    previous = index;
  }
  assert.equal((tools.match(/id: /g) || []).length, expected.length);
});

test('Sobre mantém atualização recolhível, mostra só as cinco novidades atuais e preserva a chave PIX', () => {
  const about = read('src/components/Sobre.jsx');
  const css = read('src/index.css');
  assert.match(about, /<details/);
  assert.match(about, /about-changelog-summary/);
  assert.match(about, /about-changelog-chevron/);
  assert.match(css, /about-changelog-entry\[open\]/);
  assert.match(about, /adriedson@outlook\.com/);
  assert.doesNotMatch(about, /37991260524/);
  assert.match(about, /key: 'latest'.*count: 5/);
  assert.doesNotMatch(about, /history\.2_48/);
});

test('Login Admin é um formulário compatível com autocomplete e lembra apenas o usuário', () => {
  const html = read('api/admin/index.html');
  const auth = read('api/admin/js/admin-auth.js');
  const shell = read('api/admin/js/admin-shell.js');
  assert.match(html, /<form id="login-form" autocomplete="on">/);
  assert.match(html, /name="username"[^>]*autocomplete="username"/);
  assert.match(html, /name="password"[^>]*autocomplete="current-password"/);
  assert.match(html, /id="remember-user"/);
  assert.match(auth, /guiadoa_admin_remembered_user/);
  assert.match(auth, /localStorage\.setItem\(ADMIN_REMEMBER_USER_KEY, usuario\)/);
  assert.doesNotMatch(auth, /localStorage\.setItem\([^\n]*(?:senha|password)/i);
  assert.match(shell, /loginForm\.addEventListener\('submit'/);
});

test('Home do Admin usa três módulos por linha e Ver Projeto abre a Home da Vercel', () => {
  const css = read('api/admin/css/admin.css');
  const html = read('api/admin/index.html');
  const shell = read('api/admin/js/admin-shell.js');
  assert.match(css, /\.modulos-grid\{grid-template-columns:repeat\(3,minmax\(0,1fr\)\)/);
  assert.match(css, /@media\(max-width:720px\)[\s\S]*\.modulos-grid\{grid-template-columns:repeat\(3,minmax\(0,1fr\)\)/);
  assert.match(html, /https:\/\/guia-doa\.vercel\.app\/#\//);
  assert.match(shell, /https:\/\/guia-doa\.vercel\.app\/#\//);
  assert.doesNotMatch(shell, /<a href="\/" target="_blank" class="projeto-link">/);
});
