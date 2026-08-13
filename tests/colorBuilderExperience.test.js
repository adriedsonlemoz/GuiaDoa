import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const read = path => readFileSync(new URL(`../${path}`, import.meta.url), 'utf8');

test('Construtor de Texto abre como wizard unificado com quatro caminhos', () => {
  const root = read('src/components/colorbuilder/index.jsx');
  assert.match(root, /useState\(null\)/);
  assert.match(root, /WizardHome/);
  assert.match(root, /builder\.wizard\.text_title/);
  assert.match(root, /builder\.wizard\.letters_title/);
  assert.match(root, /builder\.wizard\.flags_title/);
  assert.match(root, /builder\.wizard\.score_title/);
  assert.doesNotMatch(root, /builder\.nav\.text/);
});

test('Texto Colorido mantém cor única, gradiente, manual e usa seletor compartilhado de caracteres', () => {
  const text = read('src/components/colorbuilder/ModoTexto.jsx');
  assert.match(text, /styleMode.*single/);
  assert.match(text, /mode_gradient/);
  assert.match(text, /mode_manual/);
  assert.match(text, /CharacterTools/);
  assert.match(text, /ctb_recent_v2/);
  assert.match(text, /position:\s*'sticky'/);
  assert.doesNotMatch(text, />\s*→ Montar\s*</);
});

test('Letras especiais incluem diacríticos e caracteres decorativos como G⊙KU™', () => {
  const chars = read('src/components/colorbuilder/CharacterTools.jsx');
  const fonts = read('src/components/colorbuilder/ModoFontes.jsx');
  assert.match(chars, /⊙/);
  assert.match(chars, /™/);
  assert.match(chars, /ü/);
  assert.match(chars, /ï/);
  assert.match(chars, /LETTER_VARIANTS/);
  assert.match(fonts, /id: 'original'/);
  assert.match(fonts, /CharacterTools/);
});

test('Placar foi simplificado e também aceita caracteres especiais nos nomes', () => {
  const score = read('src/components/colorbuilder/ModoPlacar.jsx');
  assert.match(score, /CharacterTools/);
  assert.match(score, /destaque.*none/);
  assert.match(score, /customize_colors/);
  assert.doesNotMatch(score, /placarAntA/);
  assert.doesNotMatch(score, /placarAntB/);
});

test('Bandeiras mantêm cópia direta e agora possuem busca rápida', () => {
  const flags = read('src/components/colorbuilder/ModoBandeiras.jsx');
  assert.match(flags, /builder\.flags\.search/);
  assert.match(flags, /safeCopy/);
  assert.match(flags, /FLAGS\.filter/);
});


test('Construtor prioriza caracteres aceitos pelo jogo e remove emojis gráficos', () => {
  const data = read('src/components/colorbuilder/data.js');
  const chars = read('src/components/colorbuilder/CharacterTools.jsx');
  const text = read('src/components/colorbuilder/ModoTexto.jsx');
  assert.match(data, /sanitizeGameText/);
  assert.match(data, /hasUnsupportedGameEmoji/);
  assert.doesNotMatch(data, /'⭐'/);
  assert.doesNotMatch(data, /'💫'/);
  assert.doesNotMatch(data, /'✨'/);
  assert.doesNotMatch(data, /'🌟'/);
  assert.match(data, /ε｡♡‿♡｡/);
  assert.match(data, /☆','★|★','☆/);
  assert.match(chars, /game_safe_note/);
  assert.match(text, /emoji_removed/);
});

test('Modelos de General usam estrelas de texto e cores de 5 e 4 estrelas', () => {
  const data = read('src/components/colorbuilder/data.js');
  assert.match(data, /general_5_laranja/);
  assert.match(data, /\[FF8C00\]Nova ★★★★★/);
  assert.match(data, /general_4_roxo/);
  assert.match(data, /\[8A2BE2\]Nova ★★★★/);
  assert.doesNotMatch(data, /General Lendário ⭐/);
});
