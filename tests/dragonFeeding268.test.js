import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const read = path => readFileSync(new URL(`../${path}`, import.meta.url), 'utf8');

test('detalhe do dragão oferece evolução e atalho para Savana', () => {
  const source = read('src/components/dragoes/DragaoDetalhe.jsx');
  assert.match(source, /id:'evoluir'/);
  assert.match(source, /itensAlimentacao/);
  assert.match(source, /guiadoa_open_field', 'savana'/);
  assert.match(source, /level_xp_pending/);
});

test('Savana exibe XP do dragão nas recompensas', () => {
  const source = read('src/components/CampanhaMapa.jsx');
  assert.match(source, /reward\.xpDragao/);
  assert.match(source, /campaign\.dragon_xp/);
});
