import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { buildDicaGameVariables } from '../src/components/dicas/dicaGameUtils.js';

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
  const artigo = read('src/components/dicas/DicaArtigo.jsx');
  assert.match(utils, /FonteDaCura/);
  assert.match(utils, /capacidadeFonte35 \* 38/);
  assert.match(utils, /Dragões de Ataque Rápido/);
  assert.match(utils, /dragao_beladona/);
  assert.match(contexto, /campaign\.title/);
  assert.match(contexto, /Explore|explore_modules/);
  assert.match(artigo, /collapsible=.*guia-inicial-construcoes/);
  assert.match(artigo, /tutorial-atacar-antropos/);
});

test('variáveis do tutorial refletem requisitos atuais de tropas e dragões', () => {
  const edificios = [{ slug:'FonteDaCura', niveis:[{ nivel:35, maxTropas:22680 }] }];
  const tropas = [
    { nome:'Dragões de Ataque Rápido', treinamento:{ requisitos:[
      { tipo:'edificio', nome:'Guarnição', nivel:10 }, { tipo:'edificio', nome:'Viveiro', nivel:2 },
      { tipo:'pesquisa', nome:'Formação Rápida', nivel:1 }, { tipo:'pesquisa', nome:'Dragoria', nivel:2 },
    ] } },
    { nome:'Dragões de Combate', treinamento:{ requisitos:[
      { tipo:'edificio', nome:'Guarnição', nivel:14 }, { tipo:'edificio', nome:'Forja', nivel:10 }, { tipo:'edificio', nome:'Viveiro', nivel:10 },
      { tipo:'pesquisa', nome:'Formação Rápida', nivel:5 }, { tipo:'pesquisa', nome:'Dragoria', nivel:3 },
    ] } },
  ];
  const dragoes = [
    { id:'dragao_agua', obtencao:{ dia:2 } },
    { id:'dragao_beladona', obtencao:{ fonte:{ nivelMin:6, nivelMax:10 } } },
  ];
  const vars = buildDicaGameVariables(edificios, tropas, dragoes, 'pt-BR');
  assert.equal(vars.fonte_n35, '22.680');
  assert.equal(vars.agua_dia, 2);
  assert.equal(vars.beladona_min, 6);
  assert.equal(vars.beladona_max, 10);
  assert.equal(vars.ssd_viveiro, 2);
  assert.equal(vars.bd_guarnicao, 14);
  assert.equal(vars.bd_forja, 10);
  assert.equal(vars.bd_dragoria, 3);
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
