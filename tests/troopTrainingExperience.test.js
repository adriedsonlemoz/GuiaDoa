import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { TODAS_TROPAS } from '../api/seeds/core.js';

const read = path => readFileSync(new URL(`../${path}`, import.meta.url), 'utf8');

test('catálogo canônico de tropas inclui treinamento, aliases, retratos e Escevóforo', () => {
  assert.equal(TODAS_TROPAS.length, 53);
  const escev = TODAS_TROPAS.find(t => t.nome === 'Escevóforo');
  assert.ok(escev);
  assert.equal(escev.poder, 2);
  assert.equal(escev.treinamento?.populacao, 1);
  assert.ok(escev.aliases?.includes('Skeuophoroi'));
  assert.match(escev.imagem, /^\/assets\/troops\/.+\.webp$/);

  const veneno = TODAS_TROPAS.find(t => t.nome === 'Dragão do Veneno');
  assert.equal(veneno?.treinamento?.custos?.find(c => c.id === 'venom_crystal')?.quantidade, 50);
  assert.equal(veneno?.treinamento?.requisitos?.find(r => r.nome === 'Guarnição')?.nivel, 32);

  assert.equal(TODAS_TROPAS.some(t => t.nome === 'Hoplitas Imortais'), false);
});

test('retratos extraídos ficam como assets locais e não dependem de geração de imagem', () => {
  const dir = new URL('../public/assets/troops/', import.meta.url);
  const images = readdirSync(dir).filter(name => name.endsWith('.webp'));
  assert.equal(images.length, 53);
  assert.ok(existsSync(new URL('../public/assets/troops/dragao-do-veneno.webp', import.meta.url)));
  assert.ok(existsSync(new URL('../public/assets/troops/assassino-real.webp', import.meta.url)));
  assert.ok(existsSync(new URL('../public/assets/troops/lorde-do-inverno.webp', import.meta.url)));
});

test('detalhe possui simulador de custos e atalho para o Torneio de Treino', () => {
  const planner = read('src/components/tropas/TroopTrainingPlanner.jsx');
  const modal = read('src/components/tropas/TropaModal.jsx');
  const tropas = read('src/components/Tropas.jsx');
  assert.match(planner, /qty \* power/);
  assert.match(planner, /item\.quantidade[^\n]*\* qty/);
  assert.match(planner, /use_in_training_tournament/);
  assert.match(modal, /TroopTrainingPlanner/);
  assert.match(tropas, /guiadoa_tournament_prefill/);
});

test('Torneio de Treino usa slug estável, aliases e mantém fallback pelo nome antigo', () => {
  const source = read('src/components/torneios/TorneioTreinoTropa.jsx');
  assert.match(source, /row\.tropaId/);
  assert.match(source, /item\.slug/);
  assert.match(source, /item\.aliases/);
  assert.match(source, /item\.nome === row\.tropa/);
  assert.match(source, /guiadoa_tournament_prefill/);
});
