import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const read = path => fs.readFileSync(new URL(`../${path}`, import.meta.url), 'utf8');

test('Dicas usam biblioteca visual, busca e leitura estruturada', () => {
  const tela = read('src/components/Dicas.jsx');
  const artigo = read('src/components/dicas/DicaArtigo.jsx');
  assert.match(tela, /tips\.library/);
  assert.match(tela, /search_placeholder/);
  assert.match(artigo, /GuideContentRenderer/);
  assert.match(artigo, /DicaGameContext/);
});

test('guia inicial cruza dados atuais do jogo sem fixar números no frontend', () => {
  const utils = read('src/components/dicas/dicaGameUtils.js');
  const contexto = read('src/components/dicas/DicaGameContext.jsx');
  assert.match(utils, /FonteDaCura/);
  assert.match(utils, /capacidadeFonte35 \* 38/);
  assert.match(contexto, /Explore|explore_modules/);
});

test('Admin de dicas gerencia resumo, tipo, leitura, idiomas e relações', () => {
  const admin = read('api/admin/js/admin-dicas.js');
  for (const token of ['di-resumo', 'di-tipo', 'di-leitura', 'di-en-resumo', 'data-di-modulo', 'di-rel-edificios', 'di-rel-tropas', 'di-rel-dragoes']) {
    assert.match(admin, new RegExp(token));
  }
});


test('Dicas seguem paleta de pergaminho e não exibem botão de voltar duplicado', () => {
  const tela = read('src/components/Dicas.jsx');
  const card = read('src/components/dicas/DicaCard.jsx');
  const artigo = read('src/components/dicas/DicaArtigo.jsx');
  const contexto = read('src/components/dicas/DicaGameContext.jsx');
  assert.doesNotMatch(tela, /setRoute\('home'\)/);
  assert.doesNotMatch(tela + card + contexto, /BG_HEADER|#294f7a|#274d78/);
  assert.match(artigo, /createPortal/);
  assert.match(artigo, /document\.body/);
});
