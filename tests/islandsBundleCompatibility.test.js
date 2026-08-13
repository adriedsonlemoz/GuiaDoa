import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const read = path => readFileSync(new URL(`../${path}`, import.meta.url), 'utf8');

test('Dicas usa as regras atuais de espaços de Ilhas sem importar LIMITES legado', () => {
  const dica = read('src/components/dicas/DicaGameContext.jsx');
  assert.match(dica, /import \{ SLOT_RULES \} from '\.\.\/ilhas\/constants\.js'/);
  assert.doesNotMatch(dica, /import \{ LIMITES \}/);
  assert.match(dica, /SLOT_RULES\.PRINC\.normal/);
  assert.match(dica, /SLOT_RULES\['ÁGUA'\]\.normal/);
});

test('constantes de Ilhas mantêm exports de compatibilidade para componentes legados', () => {
  const constants = read('src/components/ilhas/constants.js');
  assert.match(constants, /export const LIMITES/);
  assert.match(constants, /export const FIXOS/);
  assert.match(constants, /export const TIPO_COR/);
});
