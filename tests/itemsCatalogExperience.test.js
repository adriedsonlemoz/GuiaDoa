import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const read = rel => fs.readFileSync(path.join(root,rel),'utf8');

test('Itens mantém um catálogo único com abas e relações de Arcas', () => {
  const ui = read('src/components/Itens.jsx');
  assert.match(ui,/items\.group_speedups/);
  assert.match(ui,/items\.group_resources/);
  assert.match(ui,/items\.group_chests/);
  assert.match(ui,/ItemPrice/);
  assert.match(ui,/ItemContents/);
  assert.match(ui,/buildContainerMap/);
});

test('schema e API suportam grupo, preço e conteúdo relacional', () => {
  const model = read('api/models/Item.js');
  const route = read('api/routes/itens.js');
  assert.match(model,/grupo:/);
  assert.match(model,/preco:/);
  assert.match(model,/conteudo:/);
  assert.match(model,/itemSlug/);
  assert.match(route,/grupo = ''/);
  assert.match(route,/slug\/:slug/);
});

test('Admin expõe campos compactos do catálogo estruturado', () => {
  const html = read('api/admin/index.html');
  assert.match(html,/id="fi-grupo"/);
  assert.match(html,/id="fi-preco"/);
  assert.match(html,/id="fi-preco-original"/);
  assert.match(html,/id="fi-conteudo-lista"/);
});

test('Tutoriais podem referenciar itens por slug sem duplicar cadastro', () => {
  const dica = read('api/models/Dica.js');
  const context = read('src/components/dicas/DicaGameContext.jsx');
  assert.match(dica,/itens:\s*\{ type: \[String\], default: \[\] \}/);
  assert.match(context,/rel\.itens/);
  assert.match(context,/ItemReferenceCard/);
});

test('migração de conteúdo é separada e preservadora', () => {
  const migration = read('api/services/contentMigrations.js');
  assert.match(migration,/content:itens-catalogo:beta-2\.58/);
  assert.match(migration,/mesclarSeed/);
  assert.doesNotMatch(migration,/DATA_MIGRATION_VERSION\s*=\s*['"]1\.0\.0-beta\.2\.58/);
});

test('preço público tem apresentação verde e imagens recortadas existem', () => {
  const css = read('src/index.css');
  assert.match(css,/\.item-ruby-price/);
  const assets = fs.readdirSync(path.join(root,'public/assets/items/catalog')).filter(name => name.endsWith('.webp'));
  assert.ok(assets.length >= 25);
});
