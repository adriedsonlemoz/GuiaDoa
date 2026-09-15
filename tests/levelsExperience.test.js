import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { calcularMetaNivel, calcularProgresso } from '../src/components/niveis/niveisUtils.js';

const read = path => readFileSync(new URL(`../${path}`, import.meta.url), 'utf8');

test('Níveis distingue nível confirmado de lacunas desconhecidas', () => {
  const result = calcularProgresso([[1,62],[2,76],[3,null],[4,196],[5,356]], 150);
  assert.equal(result.nivelConfirmado, 2);
  assert.equal(result.temLacuna, true);
  assert.deepEqual(result.possiveis, [3]);
  assert.equal(result.nivelPossivelMax, 3);
  assert.deepEqual(result.proximaMeta, [4,196]);
});

test('meta de nível calcula somente poder conhecido e faltante', () => {
  assert.deepEqual(calcularMetaNivel([[1,62],[2,100],[3,null]], 2, 70), { nivel:2, poder:100, faltam:30, atingida:false });
  assert.equal(calcularMetaNivel([[1,62],[2,100],[3,null]], 3, 70).poder, null);
});

test('tela de Níveis usa um único poder, meta e histórico local', () => {
  const hook = read('src/components/niveis/useNivelProgress.js');
  const panel = read('src/components/niveis/NiveisPowerPanel.jsx');
  assert.match(hook, /doa_niveis_historico_v2/);
  assert.match(hook, /doa_niveis_meta_v2/);
  assert.doesNotMatch(panel, /poderAntigoText|handleInputAntigo/);
  assert.match(panel, /levels\.goal/);
});

test('Dragões aplica painel oliva aos atributos e traduz rótulos internos', () => {
  const css = read('src/index.css');
  const detail = read('src/components/dragoes/DragaoDetalhe.jsx');
  assert.match(css, /\.game-info-table\s*\{/);
  assert.match(detail, /dragons\.skill_type_common/);
  assert.match(detail, /dragons\.obtain_fragments/);
  assert.match(detail, /common\.level_short/);
});
