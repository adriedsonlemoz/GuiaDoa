import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { GRODZ_SEED, GRODZ_MECHANICS } from '../seeds/campanha.js';
import { DICAS_SEED } from '../seeds/dicas.js';
import { ITEM_SCREENSHOT_CATALOG } from '../seeds/itensCatalogo.js';

const projectRoot = fileURLToPath(new URL('../../', import.meta.url));

test('Grodz possui 10 níveis e Ataque + Devastar compartilham 99 ações diárias', () => {
  assert.equal(GRODZ_SEED.length, 10);
  assert.deepEqual(GRODZ_SEED.map(row => row.nivel), [1,2,3,4,5,6,7,8,9,10]);
  assert.equal(GRODZ_MECHANICS.limiteDiarioCompartilhado, 99);
  assert.equal(GRODZ_MECHANICS.ataqueLimiteDiario, 99);
  assert.equal(GRODZ_MECHANICS.devastarLimiteDiario, 99);
  assert.equal(GRODZ_MECHANICS.contadorCompartilhado, true);
  assert.equal(GRODZ_MECHANICS.devastarTempoHoras, 6);
  assert.equal(GRODZ_MECHANICS.devastarTempoStatus, 'confirmado');
  assert.equal(GRODZ_MECHANICS.tropaPrincipal.nome, 'Magmassauros');
  assert.equal(GRODZ_MECHANICS.tropaPrincipal.quantidade, 1000);
});

test('níveis 1–9 usam 1.000 Magmassauros como guia principal sem perdas', () => {
  for (const level of GRODZ_SEED.filter(row => row.nivel <= 9)) {
    const guide = level.guiasAtaque[0];
    assert.equal(guide.tropaPrincipal, 'Magmassauros');
    assert.equal(guide.quantidade, 1000);
    assert.equal(guide.resultado, 'sem_perdas');
    assert.equal(guide.status, 'confirmado');
  }
});

test('nível 10 usa barra de vida e recomenda 5.000 Magmassauros + 5.000 Ogros de Granito na mesma marcha', () => {
  const level10 = GRODZ_SEED.find(row => row.nivel === 10);
  assert.equal(level10.grodz.inimigoTipo, 'barra_vida');
  assert.equal(level10.grodz.composicaoStatus, 'confirmado');
  assert.equal(level10.tropas.length, 0);
  assert.match(level10.grodz.observacaoComposicao, /não possui tropas definidas/i);
  assert.equal(level10.guiasAtaque.length, 1);
  const guide = level10.guiasAtaque[0];
  assert.equal(guide.tropaPrincipal, 'Magmassauros');
  assert.equal(guide.quantidade, 5000);
  assert.deepEqual(guide.apoios.map(row => [row.nome,row.quantidade]), [['Ogros de Granito',5000]]);
  assert.equal(guide.resultado, 'possiveis_perdas');
  assert.equal(guide.status, 'confirmado');
  assert.match(guide.observacoes, /Fontes de Recuperação/);
});

test('níveis 1–9 registram o Campo de Grodz e a composição inimiga completa', () => {
  const expected = new Map([
    [1, [['Carregadores',5]]],
    [2, [['Milicianos',25]]],
    [3, [['Carregadores',1000],['Milicianos',400]]],
    [4, [['Alabardeiros',500],['Minotauros',500]]],
    [5, [['Arqueiros',600]]],
    [6, [['Dragões de Ataque Rápido',1000]]],
    [7, [['Arqueiros',1500],['Alabardeiros',1000]]],
    [8, [['Dragões de Combate',500]]],
    [9, [['Dragões de Combate',600],['Gigantes',260]]],
  ]);
  for (const level of GRODZ_SEED.filter(row => row.nivel <= 9)) {
    assert.equal(level.grodz.composicaoStatus, 'confirmado');
    assert.match(level.grodz.inimigoNome, new RegExp(`Campo de Grodz \\(Nv\\. ${level.nivel}\\)`));
    assert.deepEqual(level.tropas.map(row => [row.nome,row.quantidade]), expected.get(level.nivel));
  }
});

test('nível 6 mantém o anexo e níveis 8–9 usam Dragões de Combate confirmados', () => {
  const level6 = GRODZ_SEED.find(row => row.nivel === 6);
  assert.deepEqual(level6.grodz.recomendacaoJogo.map(row => [row.nome,row.quantidade]), [['Dragões de Ataque Rápido',800]]);
  const level8 = GRODZ_SEED.find(row => row.nivel === 8);
  const level9 = GRODZ_SEED.find(row => row.nivel === 9);
  assert.deepEqual(level8.tropas.map(row => [row.nome,row.quantidade]), [['Dragões de Combate',500]]);
  assert.deepEqual(level9.tropas.map(row => [row.nome,row.quantidade]), [['Dragões de Combate',600],['Gigantes',260]]);
  assert.equal(level8.grodz.composicaoStatus, 'confirmado');
  assert.equal(level9.grodz.composicaoStatus, 'confirmado');
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

test('tutorial e Ticket de Campanha de Devastar usam a mesma mecânica e imagem local', () => {
  const tip = DICAS_SEED.find(row => row.slug === 'tutorial-campanha-grodz');
  const ticket = ITEM_SCREENSHOT_CATALOG.find(row => row.slug === 'pergaminho-devastar');
  assert.ok(tip);
  assert.equal(tip.titulo, '🛡️ Como atacar o Grodz e obter armaduras');
  assert.equal(tip.i18n['en-US'].titulo, '🛡️ How to attack Grodz and obtain armor');
  assert.match(tip.conteudo, /1\.000 Magmassauros/);
  assert.match(tip.conteudo, /10 ataques normais \+ 15 usos de Devastar = 25 ações consumidas e 74 restantes/);
  assert.match(tip.conteudo, /5\.000 Magmassauros[\s\S]*5\.000 Ogros de Granito/);
  assert.match(tip.conteudo, /sem tropas definidas/i);
  assert.match(tip.conteudo, /não selecionar nenhum dragão[\s\S]*aleatória/i);
  assert.match(tip.i18n['en-US'].conteudo, /1,000 Lava Jaws/);
  assert.equal(ticket.nome, 'Ticket de Campanha de Devastar');
  assert.equal(ticket.i18n['en-US'].nome, 'Devastate Campaign Ticket');
  assert.match(ticket.origem, /6 horas/);
  assert.match(ticket.origem, /Zyrvorthians/);
  assert.match(ticket.limites, /mesmo limite diário de 99 ações/);
  assert.match(ticket.i18n['en-US'].limites, /same daily limit of 99 actions/);
  assert.ok(ticket.imagem);
  assert.ok(existsSync(`${projectRoot}public${ticket.imagem}`));
});
