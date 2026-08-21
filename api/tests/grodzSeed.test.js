import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { GRODZ_SEED, GRODZ_MECHANICS } from '../seeds/campanha.js';
import { DICAS_SEED } from '../seeds/dicas.js';
import { ITEM_SCREENSHOT_CATALOG } from '../seeds/itensCatalogo.js';

const projectRoot = fileURLToPath(new URL('../../', import.meta.url));

test('Grodz possui 10 níveis e mecânicas diárias confirmadas', () => {
  assert.equal(GRODZ_SEED.length, 10);
  assert.deepEqual(GRODZ_SEED.map(row => row.nivel), [1,2,3,4,5,6,7,8,9,10]);
  assert.equal(GRODZ_MECHANICS.ataqueLimiteDiario, 99);
  assert.equal(GRODZ_MECHANICS.devastarLimiteDiario, 99);
  assert.equal(GRODZ_MECHANICS.tropaPrincipal.nome, 'Magmassauros');
  assert.equal(GRODZ_MECHANICS.tropaPrincipal.quantidade, 1000);
  assert.equal(GRODZ_MECHANICS.nivel10SemPerdas, false);
});

test('níveis 1–9 usam 1.000 Magmassauros como guia principal sem perdas e nível 10 mantém risco', () => {
  for (const level of GRODZ_SEED.filter(row => row.nivel <= 9)) {
    const guide = level.guiasAtaque[0];
    assert.equal(guide.tropaPrincipal, 'Magmassauros');
    assert.equal(guide.quantidade, 1000);
    assert.equal(guide.resultado, 'sem_perdas');
  }
  const level10 = GRODZ_SEED.find(row => row.nivel === 10);
  assert.equal(level10.guiasAtaque.length, 3);
  assert.deepEqual(level10.guiasAtaque.map(row => row.tropaPrincipal), ['Magmassauros','Hoplita','Ogros de Granito']);
  assert.ok(level10.guiasAtaque.every(row => row.quantidade === 5000));
  assert.ok(level10.guiasAtaque.every(row => row.resultado === 'possiveis_perdas'));
  assert.ok(level10.guiasAtaque.every(row => row.status === 'validacao'));
});

test('nível 6 usa os dados do anexo e níveis incompletos permanecem explicitamente parciais/pendentes', () => {
  const level6 = GRODZ_SEED.find(row => row.nivel === 6);
  assert.deepEqual(level6.tropas.map(row => [row.nome,row.quantidade]), [['Dragões de Ataque Rápido',1000]]);
  assert.deepEqual(level6.grodz.recomendacaoJogo.map(row => [row.nome,row.quantidade]), [['Dragões de Ataque Rápido',800]]);
  const level8 = GRODZ_SEED.find(row => row.nivel === 8);
  const level9 = GRODZ_SEED.find(row => row.nivel === 9);
  const level10 = GRODZ_SEED.find(row => row.nivel === 10);
  assert.equal(level8.grodz.composicaoStatus, 'parcial');
  assert.equal(level9.grodz.composicaoStatus, 'parcial');
  assert.match(level8.tropas[0].nome, /…/);
  assert.match(level9.tropas[0].nome, /…/);
  assert.equal(level10.grodz.composicaoStatus, 'pendente');
  assert.equal(level10.tropas.length, 0);
});

test('nível 10 conecta a Arca Superior do Grande Dragão e todos os níveis têm diálogo bilíngue', () => {
  const level10 = GRODZ_SEED.find(row => row.nivel === 10);
  const reward = level10.recompensas[0];
  assert.equal(reward.relacionadoA, 'arca-superior-grande-dragao');
  assert.match(reward.nome, /Arca Superior do Grande Dragão/);
  assert.ok(existsSync(`${projectRoot}public${reward.imagem}`));
  for (const level of GRODZ_SEED) {
    assert.ok(level.grodz.dialogos.length > 0);
    assert.ok(level.grodz.dialogos.every(line => line.i18n?.['en-US']?.texto));
  }
});

test('tutorial e Pergaminho Devastar estão conectados à mesma mecânica', () => {
  const tip = DICAS_SEED.find(row => row.slug === 'tutorial-campanha-grodz');
  const scroll = ITEM_SCREENSHOT_CATALOG.find(row => row.slug === 'pergaminho-devastar');
  assert.ok(tip);
  assert.ok(scroll);
  assert.match(tip.conteudo, /1\.000 Magmassauros/);
  assert.match(tip.conteudo, /99 usos por dia/);
  assert.match(tip.i18n['en-US'].conteudo, /1,000 Magmassaurs/);
  assert.match(scroll.origem, /Zyrvorthians/);
  assert.match(scroll.uso, /Campanha/);
  assert.match(scroll.limites, /99 usos por dia/);
  assert.match(scroll.i18n['en-US'].limites, /99 uses per day/);
});
