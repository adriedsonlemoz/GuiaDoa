import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const read = path => readFileSync(new URL(`../${path}`, import.meta.url), 'utf8');

test('Texto Colorido abre direto e mantém as outras ferramentas em abas compactas', () => {
  const root = read('src/components/colorbuilder/index.jsx');
  assert.match(root, /useState\('texto'\)/);
  assert.match(root, /builder\.nav\.text/);
  assert.match(root, /builder\.nav\.fonts/);
  assert.match(root, /builder\.nav\.flags/);
  assert.match(root, /builder\.nav\.score/);
  assert.doesNotMatch(root, /TelaBoas/);
});

test('fluxo rápido oferece cor única, gradiente e manual sem botão Montar', () => {
  const text = read('src/components/colorbuilder/ModoTexto.jsx');
  assert.match(text, /styleMode.*single/);
  assert.match(text, /mode_gradient/);
  assert.match(text, /mode_manual/);
  assert.match(text, /gradientStart/);
  assert.match(text, /manual_brush/);
  assert.doesNotMatch(text, />\s*→ Montar\s*</);
});

test('Texto Colorido possui inserção rápida, prévia, código recolhível e recentes locais', () => {
  const text = read('src/components/colorbuilder/ModoTexto.jsx');
  assert.match(text, /ctb_recent_v2/);
  assert.match(text, /insertPanel/);
  assert.match(text, /previewDark/);
  assert.match(text, /showCode/);
  assert.match(text, /position:\s*'sticky'/);
  assert.match(text, /copy_colored/);
});
