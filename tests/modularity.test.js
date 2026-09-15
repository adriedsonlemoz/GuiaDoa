import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';

const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url), 'utf8');

test('Admin permanece sem lógica ou CSS inline concentrados', () => {
  const html = read('api/admin/index.html');
  assert.doesNotMatch(html, /<style[>\s]/i);
  assert.doesNotMatch(html, /<script>(?:.|\n)*?<\/script>/i);

  const modulos = [
    'admin-auth.js', 'admin-diagnostic.js', 'admin-bootstrap.js', 'admin-shell.js', 'admin-tropas.js',
    'admin-niveis.js', 'admin-dragoes.js', 'admin-edificios.js', 'admin-itens.js',
    'admin-pesquisas.js', 'admin-reinos.js', 'admin-dicas.js',
  ];
  for (const modulo of modulos) {
    assert.ok(existsSync(new URL(`../api/admin/js/${modulo}`, import.meta.url)), `${modulo} deve existir`);
  }
});

test('App e Assistente usam módulos dedicados', () => {
  const app = read('src/App.jsx');
  const assistente = read('src/components/AssistenteTatico.jsx');
  assert.match(app, /useHashRouter/);
  assert.match(app, /useAppSync/);
  assert.match(app, /renderRoute/);
  assert.match(assistente, /useAssistente/);
  assert.match(assistente, /AssistenteModal/);
});


test('módulos do Admin carregam suas próprias constantes de domínio', () => {
  const niveis = read('api/admin/js/admin-niveis.js');
  const dragoes = read('api/admin/js/admin-dragoes.js');
  const edificios = read('api/admin/js/admin-edificios.js');
  const itens = read('api/admin/js/admin-itens.js');
  assert.doesNotMatch(niveis, /const ATTRS_BASE/);
  assert.match(dragoes, /const ATTRS_BASE/);
  assert.doesNotMatch(dragoes, /const EMOJIS_EDIFICIOS/);
  assert.match(edificios, /const EMOJIS_EDIFICIOS/);
  assert.doesNotMatch(edificios, /const EMOJIS_ITENS/);
  assert.match(itens, /const EMOJIS_ITENS/);
});
