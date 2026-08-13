import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import ptBR from '../src/locales/pt-BR.js';
import enUS from '../src/locales/en-US.js';

const projectRoot = fileURLToPath(new URL('../', import.meta.url));
const srcRoot = join(projectRoot, 'src');
const read = path => readFileSync(join(projectRoot, path), 'utf8');

function walk(dir) {
  const out = [];
  for (const name of readdirSync(dir)) {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) out.push(...walk(path));
    else if (/\.(?:js|jsx)$/.test(name)) out.push(path);
  }
  return out;
}

test('PT-BR e EN-US possuem exatamente o mesmo conjunto de chaves', () => {
  assert.deepEqual(Object.keys(enUS).sort(), Object.keys(ptBR).sort());
  assert.ok(Object.keys(ptBR).length > 800, 'esperado catálogo amplo de interface');
});

test('todas as chamadas literais t(...) do frontend existem nos dois idiomas', () => {
  const refs = new Set();
  const regex = /\bt\(\s*['"]([^'"]+)['"]/g;
  for (const file of walk(srcRoot)) {
    const source = readFileSync(file, 'utf8');
    let match;
    while ((match = regex.exec(source))) refs.add(match[1]);
  }
  for (const key of refs) {
    assert.ok(Object.prototype.hasOwnProperty.call(ptBR, key), `chave PT ausente: ${key}`);
    assert.ok(Object.prototype.hasOwnProperty.call(enUS, key), `chave EN ausente: ${key}`);
  }
});

test('idiomas fixos são locais e não dependem de API externa de tradução', () => {
  const hook = read('src/hooks/useI18n.jsx');
  assert.doesNotMatch(hook, /fetch\s*\(/);
  assert.doesNotMatch(hook, /\/api\/traducoes|MyMemory|MYMEMORY/i);
  assert.match(hook, /pt-BR\.js/);
  assert.match(hook, /en-US\.js/);
});

test('módulo antigo de traduções do Admin foi removido', () => {
  const removed = [
    'api/routes/traducoes.js',
    'api/models/Traducao.js',
    'api/admin/traducoes.html',
    'api/admin/js/admin-traducoes.js',
    'api/admin/js/admin-traducoes-editor.js',
    'api/admin/js/admin-traducoes-catalogo.js',
  ];
  for (const file of removed) assert.equal(existsSync(join(projectRoot, file)), false, file);
  const app = read('api/app.js');
  assert.doesNotMatch(app, /traducoes/i);
});

test('conteúdo administrável guarda inglês no próprio documento', () => {
  const models = ['Tropa','Dragao','Item','Edificio','Pesquisa','Reino','Dica','CategoriaDica'];
  for (const name of models) assert.match(read(`api/models/${name}.js`), /\bi18n\s*:/, name);
  const routes = ['tropas','dragoes','itens','edificios','pesquisas','reinos','dicas'];
  for (const name of routes) assert.match(read(`api/routes/${name}.js`), /sanitizeContentI18n/, name);
});

test('Admin oferece English opcional no mesmo cadastro dos conteúdos principais', () => {
  const files = [
    'api/admin/js/admin-tropas.js',
    'api/admin/js/admin-dragoes.js',
    'api/admin/js/admin-edificios.js',
    'api/admin/js/admin-itens.js',
    'api/admin/js/admin-pesquisas.js',
    'api/admin/js/admin-reinos.js',
    'api/admin/js/admin-dicas.js',
  ];
  for (const file of files) assert.match(read(file), /en-US/, `${file} deve salvar en-US`);
  const adminHtml = read('api/admin/index.html');
  assert.match(adminHtml, /i18n-title/);
  assert.match(adminHtml, /English/i);
  assert.match(adminHtml, /opcional/i);
});

test('migração de dados avança quando o catálogo canônico realmente muda', () => {
  assert.match(read('api/utils/migrationPolicy.js'), /DATA_MIGRATION_VERSION\s*=\s*['"]1\.0\.0-beta\.2\.10['"]/);
  assert.match(read('api/services/autoMigration.js'), /EDIFICIOS_META/);
});
