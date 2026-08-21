import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { ANTROPOS_SEED, SAVANA_SEED, LAGO_SEED, FLORESTA_SEED, MONTANHA_SEED, MORRO_SEED, CAMPANHA_CATEGORIAS, CAMPO_SUBTIPOS } from '../seeds/campanha.js';

test('Antropos contém os 10 níveis confirmados e categorias futuras sem dados inventados', () => {
  assert.equal(ANTROPOS_SEED.length, 10);
  assert.deepEqual(ANTROPOS_SEED.map(x => x.nivel), [1,2,3,4,5,6,7,8,9,10]);
  assert.deepEqual(CAMPANHA_CATEGORIAS, ['antropos','campos','zyrvorthian','grodz']);
  assert.deepEqual(CAMPO_SUBTIPOS, ['savana','montanha','morro','lago','floresta']);
  assert.ok(ANTROPOS_SEED.every(x => x.categoria === 'antropos' && x.fonte?.verificado));
});

test('Antropos Nv.10 reproduz composição e recursos do relatório', () => {
  const n10 = ANTROPOS_SEED.find(x => x.nivel === 10);
  assert.equal(n10.tropas.find(x => x.nome === 'Pirralho').quantidade, 250000);
  assert.equal(n10.tropas.find(x => x.nome === 'Raivoso').quantidade, 1000);
  assert.equal(n10.tropas.reduce((sum, x) => sum + x.quantidade, 0), 852000);
  assert.equal(n10.recursos.find(x => x.tipo === 'wood').exibicao, '50.0k');
  assert.equal(n10.recursos.find(x => x.tipo === 'food').exibicao, '1.12m');
  assert.equal(n10.recursos.find(x => x.tipo === 'food').exato, false);
});

test('Savana contém Nv.1–10, menos tropas que Antropos e produção confirmada', () => {
  assert.equal(SAVANA_SEED.length, 10);
  assert.deepEqual(SAVANA_SEED.map(x => x.nivel), [1,2,3,4,5,6,7,8,9,10]);
  assert.ok(SAVANA_SEED.every(x => x.categoria === 'campos' && x.subtipo === 'savana' && x.campo?.recursoPrincipal === 'food'));
  assert.equal(SAVANA_SEED.find(x => x.nivel === 6).campo.producaoHora, 16500);
  assert.equal(SAVANA_SEED.find(x => x.nivel === 10).campo.producaoHora, 27500);
  assert.equal(SAVANA_SEED.find(x => x.nivel === 10).recursos[0].valor, 10000);
  assert.equal(SAVANA_SEED.find(x => x.nivel === 10).tropas.reduce((s,x)=>s+x.quantidade,0), 38850);
});


test('Lago contém Nv.1–10 com progressão de tropas, recurso e produção estruturada', () => {
  assert.equal(LAGO_SEED.length, 10);
  assert.deepEqual(LAGO_SEED.map(x => x.nivel), [1,2,3,4,5,6,7,8,9,10]);
  assert.ok(LAGO_SEED.every(x => x.categoria === 'campos' && x.subtipo === 'lago' && x.campo?.recursoPrincipal === 'food'));
  assert.ok(LAGO_SEED.every(x => x.fonte?.verificado && x.fonte?.data === '2026-08-20'));
  assert.equal(LAGO_SEED.find(x => x.nivel === 1).campo.producaoHora, 2750);
  assert.equal(LAGO_SEED.find(x => x.nivel === 6).campo.producaoHora, 16500);
  assert.equal(LAGO_SEED.find(x => x.nivel === 10).campo.producaoHora, 27500);
  assert.equal(LAGO_SEED.find(x => x.nivel === 10).recursos[0].valor, 10000);
  assert.equal(LAGO_SEED.find(x => x.nivel === 10).tropas.reduce((s,x)=>s+x.quantidade,0), 38850);
});

test('Lago Nv.1–5 confirma ausência de recompensas; Nv.6–9 traz emblemas e Nv.10 acrescenta Núcleo Sombrio', () => {
  for (const nivel of [1,2,3,4,5]) {
    const entry = LAGO_SEED.find(x => x.nivel === nivel);
    assert.equal(entry.recompensasStatus, 'confirmado');
    assert.deepEqual(entry.recompensas, []);
    assert.ok(entry.tags.includes('sem-recompensas'));
  }

  const expectedEmblems = ['emblema-dragao-agua','emblema-dragao-gelo','emblema-dragao-paradisiaco'];
  for (const nivel of [6,7,8,9]) {
    const entry = LAGO_SEED.find(x => x.nivel === nivel);
    assert.deepEqual(entry.recompensas.map(x => x.codigo), expectedEmblems);
    assert.ok(entry.recompensas.every(x => x.finalidade === 'obtencao-dragao'));
    assert.ok(entry.recompensas.every(x => x.relacionadoA.startsWith('dragao-')));
  }

  const n10 = LAGO_SEED.find(x => x.nivel === 10);
  assert.deepEqual(n10.recompensas.map(x => x.codigo), [...expectedEmblems, 'nucleo-sombrio']);
  assert.equal(n10.recompensas.find(x => x.codigo === 'nucleo-sombrio').nome, 'Núcleo Sombrio');
  assert.ok(n10.tags.includes('recompensa-especial'));
  assert.ok(n10.recompensas.every(x => x.nomeConfirmado && x.nome));
  assert.ok(n10.recompensas.every(x => x.quantidade == null));
  assert.ok(n10.recompensas.every(x => x.imagem.startsWith('/assets/items/fields/lake/')));
  for (const reward of n10.recompensas) assert.equal(existsSync(`../public${reward.imagem}`), true);
});



test('Floresta contém Nv.1–10 com madeira, produção e progressão de tropas estruturadas', () => {
  assert.equal(FLORESTA_SEED.length, 10);
  assert.deepEqual(FLORESTA_SEED.map(x => x.nivel), [1,2,3,4,5,6,7,8,9,10]);
  assert.ok(FLORESTA_SEED.every(x => x.categoria === 'campos' && x.subtipo === 'floresta' && x.campo?.recursoPrincipal === 'wood'));
  assert.ok(FLORESTA_SEED.every(x => x.fonte?.verificado && x.fonte?.data === '2026-08-20'));
  assert.equal(FLORESTA_SEED.find(x => x.nivel === 1).campo.producaoHora, 2750);
  assert.equal(FLORESTA_SEED.find(x => x.nivel === 6).campo.producaoHora, 16500);
  assert.equal(FLORESTA_SEED.find(x => x.nivel === 10).campo.producaoHora, 27500);
  assert.equal(FLORESTA_SEED.find(x => x.nivel === 10).recursos[0].tipo, 'wood');
  assert.equal(FLORESTA_SEED.find(x => x.nivel === 10).recursos[0].valor, 10000);
  assert.equal(FLORESTA_SEED.find(x => x.nivel === 10).tropas.reduce((sum,item)=>sum+item.quantidade,0), 38850);
});

test('Floresta confirma ausência de recompensas no Nv.1–5 e registra o relatório do Nv.2', () => {
  for (const nivel of [1,2,3,4,5]) {
    const entry = FLORESTA_SEED.find(x => x.nivel === nivel);
    assert.equal(entry.recompensasStatus, 'confirmado');
    assert.deepEqual(entry.recompensas, []);
    assert.ok(entry.tags.includes('sem-recompensas'));
  }
  const n2 = FLORESTA_SEED.find(x => x.nivel === 2);
  assert.deepEqual(n2.tropas.map(x => [x.nome,x.quantidade]), [['Canibal',100],['Fedor',50]]);

  const expectedEmblems = ['emblema-dragao-beladona','emblema-dragao-toxico','emblema-dragao-fada'];
  for (const nivel of [6,7,8,9]) {
    const entry = FLORESTA_SEED.find(x => x.nivel === nivel);
    assert.equal(entry.recompensasStatus, 'confirmado');
    assert.deepEqual(entry.recompensas.map(x => x.codigo), expectedEmblems);
    assert.ok(entry.recompensas.every(x => x.finalidade === 'obtencao-dragao'));
  }
  const n10 = FLORESTA_SEED.find(x => x.nivel === 10);
  assert.deepEqual(n10.recompensas.map(x => x.codigo), [...expectedEmblems, 'essencia-furia']);
  assert.equal(n10.recompensas.find(x => x.codigo === 'essencia-furia').nome, 'Essência da Fúria');
  for (const reward of n10.recompensas) assert.equal(existsSync(`../public${reward.imagem}`), true);
});

test('Montanha contém Nv.1–10 com metais e recompensas confirmadas pelas telas', () => {
  assert.equal(MONTANHA_SEED.length,10); assert.deepEqual(MONTANHA_SEED.map(x=>x.nivel),[1,2,3,4,5,6,7,8,9,10]);
  assert.ok(MONTANHA_SEED.every(x=>x.subtipo==='montanha' && x.campo?.recursoPrincipal==='metals'));
  for(const nivel of [1,2,3,4,5]){ const e=MONTANHA_SEED.find(x=>x.nivel===nivel); assert.equal(e.recompensasStatus,'confirmado'); assert.deepEqual(e.recompensas,[]); }
  const expected=['emblema-dragao-fogo','emblema-dragao-espinha-negra','emblema-dragao-tirano'];
  for(const nivel of [6,7,8,9]) assert.deepEqual(MONTANHA_SEED.find(x=>x.nivel===nivel).recompensas.map(x=>x.codigo),expected);
  const n10=MONTANHA_SEED.find(x=>x.nivel===10); assert.deepEqual(n10.recompensas.map(x=>x.codigo),[...expected,'obsidiana']);
  for(const reward of n10.recompensas) assert.equal(existsSync(`../public${reward.imagem}`),true);
});

test('Morro contém Nv.1–10 com pedra e dois itens extras no Nv.10', () => {
  assert.equal(MORRO_SEED.length,10); assert.deepEqual(MORRO_SEED.map(x=>x.nivel),[1,2,3,4,5,6,7,8,9,10]);
  assert.ok(MORRO_SEED.every(x=>x.subtipo==='morro' && x.campo?.recursoPrincipal==='stone'));
  for(const nivel of [1,2,3,4,5]){ const e=MORRO_SEED.find(x=>x.nivel===nivel); assert.equal(e.recompensasStatus,'confirmado'); assert.deepEqual(e.recompensas,[]); }
  const expected=['brasao-dragao-terra','emblema-dragao-celestial','emblema-dragao-dourado'];
  for(const nivel of [6,7,8,9]) assert.deepEqual(MORRO_SEED.find(x=>x.nivel===nivel).recompensas.map(x=>x.codigo),expected);
  const n10=MORRO_SEED.find(x=>x.nivel===10); assert.deepEqual(n10.recompensas.map(x=>x.codigo),[...expected,'pedra-faisca-dourada','pedra-florescer-bosque']);
  for(const reward of n10.recompensas) assert.equal(existsSync(`../public${reward.imagem}`),true);
});

test('Savana confirma carnes e Emblema do Dragão do Trovão no Nv.6–10', () => {
  for (const nivel of [1,2,3,4,5]) {
    const entry = SAVANA_SEED.find(x => x.nivel === nivel);
    assert.equal(entry.recompensasStatus, 'confirmado');
    assert.deepEqual(entry.recompensas.map(x => x.codigo), ['savana-r2']);
    assert.equal(entry.recompensas[0].nome, 'Pedaço de carne carneiro');
  }
  for (const nivel of [6,7,8,9,10]) {
    const entry = SAVANA_SEED.find(x => x.nivel === nivel);
    assert.equal(entry.recompensasStatus, 'confirmado');
    const thunder = entry.recompensas.find(x => x.codigo === 'emblema-dragao-trovao');
    assert.equal(thunder.nome, 'Emblema do Dragão do Trovão');
    assert.equal(thunder.nomeConfirmado, true);
    assert.equal(thunder.finalidade, 'obtencao-dragao');
    assert.equal(thunder.relacionadoA, 'dragao-trovao');
    assert.ok(thunder.imagem.endsWith('/emblema-dragao-trovao.webp'));
  }
  const n10 = SAVANA_SEED.find(x => x.nivel === 10);
  assert.deepEqual(n10.recompensas.map(x=>x.codigo), ['emblema-dragao-trovao','savana-r2','savana-r3','savana-r4']);
  assert.equal(n10.recompensas.find(x => x.codigo === 'savana-r4').nome, 'Pedaço de Frango');
  for (const reward of n10.recompensas) assert.equal(existsSync(`../public${reward.imagem}`), true);
});

test('estratégias começam vazias e não são inventadas pelo seed', () => {
  assert.ok([...ANTROPOS_SEED,...SAVANA_SEED,...LAGO_SEED,...FLORESTA_SEED,...MONTANHA_SEED,...MORRO_SEED].every(x => x.estrategia?.publicada === false));
  assert.ok([...ANTROPOS_SEED,...SAVANA_SEED,...LAGO_SEED,...FLORESTA_SEED,...MONTANHA_SEED,...MORRO_SEED].every(x => x.estrategia?.passos?.length === 0));
});


test('Antropos Nv.1–10 usam somente LBM, Lava Jaws e SSD com margem de 20%', () => {
  assert.deepEqual(ANTROPOS_SEED.map(x => x.nivel), [1,2,3,4,5,6,7,8,9,10]);
  assert.equal(ANTROPOS_SEED.some(x => x.nivel === 11), false);
  assert.ok(ANTROPOS_SEED.every(x => x.guiasAtaque.length === 3));
  const codigos = ['arqueiros-lbm','lava-jaws-lj8','dragoes-ataque-rapido-ssd'];
  for (const entry of ANTROPOS_SEED) {
    assert.deepEqual(entry.guiasAtaque.map(x => x.codigo), codigos);
    assert.ok(entry.guiasAtaque.every(x => !x.complemento));
  }

  const lbmExpected = { 1:72,2:384,3:720,4:2400,5:6000,6:8400,7:30000,8:54000,9:84000,10:120000 };
  for (const [nivelStr, qty] of Object.entries(lbmExpected)) {
    const guide = ANTROPOS_SEED.find(x => x.nivel === Number(nivelStr)).guiasAtaque.find(x => x.codigo === 'arqueiros-lbm');
    assert.equal(guide.quantidade, qty);
    assert.equal(guide.resultado, 'sem_perdas');
  }

  const n1 = ANTROPOS_SEED.find(x => x.nivel === 1);
  assert.equal(n1.guiasAtaque.find(x=>x.codigo==='arqueiros-lbm').apoios.find(x=>x.nome==='Transportes Blindados').quantidade, 24);
  assert.equal(n1.guiasAtaque.find(x=>x.codigo==='arqueiros-lbm').apoios.find(x=>x.nome==='Carregadores').quantidade, 594);

  const n9ssd = ANTROPOS_SEED.find(x => x.nivel === 9).guiasAtaque.find(x => x.codigo === 'dragoes-ataque-rapido-ssd');
  assert.equal(n9ssd.quantidade, 192000);
  assert.equal(n9ssd.resultado, 'possiveis_perdas');

  const n10ssd = ANTROPOS_SEED.find(x => x.nivel === 10).guiasAtaque.find(x => x.codigo === 'dragoes-ataque-rapido-ssd');
  assert.equal(n10ssd.quantidade, null);
  assert.equal(n10ssd.resultado, 'incompleto');
  assert.match(n10ssd.observacoes, /não confirmada/i);
});

test('Antropos não publica combinações ofensivas nem métodos removidos', () => {
  const guides = ANTROPOS_SEED.flatMap(x => x.guiasAtaque);
  assert.ok(guides.every(g => ['arqueiros-lbm','lava-jaws-lj8','dragoes-ataque-rapido-ssd'].includes(g.codigo)));
  assert.ok(guides.every(g => !g.complemento));
  assert.ok(guides.every(g => (g.apoios || []).every(a => ['Carregadores','Transportes Blindados'].includes(a.nome))));
});


test('Antropos Nv.1–10 registram recompensas confirmadas sem fixar quantidade de drop', () => {
  const expected = {
    1:['amuleto-nevoa-malva','pedra-nevoa-malva','lembrancas-antigas'],
    2:['pedra-nevoa-malva','lembrancas-antigas'],
    3:['amuleto-brilho-sol','pedra-brilho-sol','lembrancas-antigas'],
    4:['pedra-brilho-sol','lembrancas-antigas'],
    5:['pedra-luz-oceano','lembrancas-antigas'],
    6:['amuleto-luz-oceano','pedra-luz-oceano','lembrancas-antigas'],
    7:['pedra-luz-oceano','lembrancas-antigas'],
    8:['pedra-florescer-bosque','lembrancas-antigas'],
    9:['amuleto-florescer-bosque','pedra-florescer-bosque','lembrancas-antigas'],
    10:['pedra-faisca-dourada','obsidiana','essencia-furia','lembrancas-antigas'],
  };
  for (const entry of ANTROPOS_SEED) {
    assert.deepEqual(entry.recompensas.map(x => x.codigo), expected[entry.nivel]);
    assert.ok(entry.recompensas.every(x => x.quantidade == null));
    assert.ok(entry.recompensas.every(x => x.nomeConfirmado && x.nome));
    assert.ok(entry.recompensas.every(x => x.imagem?.startsWith('/assets/items/anthropus/')));
  }
  assert.ok(ANTROPOS_SEED.every(x => x.recompensas.some(r => r.codigo === 'lembrancas-antigas')));
});


test('descrições oficiais da Beta 2.50 removem referências opcionais a dragões e mantêm marchas confirmadas', () => {
  const guides = ANTROPOS_SEED.flatMap(x => x.guiasAtaque);
  assert.ok(guides.every(g => g.status === 'confirmado'));
  assert.ok(guides.every(g => !/Dragão do Vento|Wind Dragon|Dragões compatíveis|Compatible dragons/i.test(`${g.observacoes || ''} ${g.i18n?.['en-US']?.observacoes || ''}`)));
  const lava = guides.find(g => g.codigo === 'lava-jaws-lj8');
  assert.equal(lava.complemento || '', '');
  assert.equal(lava.passos.some(x => /Grande Dragão|Dragão Elemental/i.test(x)), false);
});
