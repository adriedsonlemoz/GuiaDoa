import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';

const read = path => readFileSync(new URL(`../${path}`, import.meta.url), 'utf8');

test('nova linguagem visual do jogo fica centralizada em componentes e estilos reutilizáveis', () => {
  assert.ok(existsSync(new URL('../src/components/shared/GameChrome.jsx', import.meta.url)));
  const css = read('src/index.css');
  const app = read('src/App.jsx');
  assert.match(css, /game-topbar/);
  assert.match(css, /game-tabs/);
  assert.match(css, /game-info-table/);
  assert.match(app, /game-topbar/);
});

test('Tropas, Pesquisas, Construções, Dragões e Itens compartilham a nova linguagem visual', () => {
  const files = ['Tropas.jsx','Edificios.jsx','Itens.jsx','pesquisas/Pesquisas.jsx','dragoes/Dragoes.jsx'];
  const source = files.map(file => read(`src/components/${file}`)).join('\n');
  assert.match(source, /GameHeader/);
  assert.match(source, /GameTabs/);
  assert.match(source, /game-list/);
});

test('regressão Vercel: Armazém não contém mais o JSX malformado que quebrava o esbuild', () => {
  const itens = read('src/components/Itens.jsx');
  assert.doesNotMatch(itens, /flexShrink:\s*0,\s*\}>\{item\.imagem/);
  assert.match(itens, /function ItemVisual/);
});

test('Beta 2.21 usa tipografia nativa, verde estrutural e ícones da Home sem círculos', () => {
  const css = read('src/index.css');
  const tailwind = read('tailwind.config.js');
  const profile = read('src/components/home/HomeProfileCard.jsx');
  assert.match(css, /--ui-font:\s*system-ui/);
  assert.doesNotMatch(css, /font-family:\s*Georgia/);
  assert.match(css, /\.game-tab[\s\S]*#47736E/);
  assert.match(css, /\.game-home-tool-icon\s*\{[\s\S]*font-size:\s*2\.05rem/);
  assert.doesNotMatch(css, /\.game-home-tool-icon\s*\{[\s\S]{0,260}border-radius:50%/);
  assert.match(tailwind, /cinzel:\s*\['system-ui'/);
  assert.match(profile, />文<\/button>/);
});
