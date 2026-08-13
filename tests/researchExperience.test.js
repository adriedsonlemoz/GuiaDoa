import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { parseResearchTime, summarizeResearchRange } from '../src/components/pesquisas/researchTime.js';

const read = path => readFileSync(new URL(`../${path}`, import.meta.url), 'utf8');

test('Pesquisas usa lista única com busca e filtros simples', () => {
  const src = read('src/components/pesquisas/Pesquisas.jsx');
  assert.match(src, /research\.search/);
  assert.match(src, /RESEARCH_FILTERS/);
  assert.match(src, /GameTabs/);
  assert.match(src, /game-list/);
});

test('progresso pessoal e meta ficam locais no dispositivo', () => {
  const detail = read('src/components/pesquisas/PesquisaDetalhe.jsx');
  const progress = read('src/components/pesquisas/researchProgress.js');
  assert.match(detail, /research\.my_level/);
  assert.match(detail, /research\.target_level/);
  assert.match(progress, /localStorage/);
  assert.match(progress, /doa_research_progress_v1/);
});

test('tempo aceita segundos e soma somente níveis conhecidos no intervalo', () => {
  assert.equal(parseResearchTime('4h 5m 47s'), 14747);
  const summary = summarizeResearchRange([
    { nivel:1, tempo:'10m' },
    { nivel:2, tempo:'' },
    { nivel:3, tempo:'1h 30s' },
  ], 0, 3);
  assert.equal(summary.known, 2);
  assert.equal(summary.missing, 1);
  assert.equal(summary.seconds, 4230);
});

test('Admin de Pesquisas acompanha preenchimento parcial sem transformar vazio em zero', () => {
  const admin = read('api/admin/js/admin-pesquisas.js');
  assert.match(admin, /Tempos cadastrados/);
  assert.match(admin, /incompletas/);
  assert.match(admin, /placeholder="ex: 4h 5m 47s"/);
  assert.match(admin, /if \(!str \|\| str === '0' \|\| str === '0m' \|\| str === '0s'\) return ''/);
});
