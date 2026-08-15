import test from 'node:test';
import assert from 'node:assert/strict';
import { ANTROPOS_SEED, SAVANA_SEED, CAMPANHA_CATEGORIAS, CAMPO_SUBTIPOS } from '../seeds/campanha.js';

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

test('recompensas da Savana ficam simbólicas quando o nome não foi confirmado', () => {
  const n5 = SAVANA_SEED.find(x => x.nivel === 5);
  const n6 = SAVANA_SEED.find(x => x.nivel === 6);
  const n10 = SAVANA_SEED.find(x => x.nivel === 10);
  assert.deepEqual(n5.recompensas.map(x=>x.simbolo), ['R2']);
  assert.deepEqual(n6.recompensas.map(x=>x.simbolo), ['R1','R2','R3']);
  assert.deepEqual(n10.recompensas.map(x=>x.simbolo), ['R1','R2','R3','R4']);
  const beef = n6.recompensas.find(x => x.codigo === 'savana-r3');
  assert.equal(beef.nome, 'Pedaço de carne bovina');
  assert.equal(beef.quantidade, 1);
  assert.equal(beef.nomeConfirmado, true);
  assert.ok(n10.recompensas.filter(x=>!x.nomeConfirmado).every(x=>!x.nome));
});

test('estratégias começam vazias e não são inventadas pelo seed', () => {
  assert.ok([...ANTROPOS_SEED,...SAVANA_SEED].every(x => x.estrategia?.publicada === false));
  assert.ok([...ANTROPOS_SEED,...SAVANA_SEED].every(x => x.estrategia?.passos?.length === 0));
});


test('Antropos Nv.1–10 recebem estratégias confirmadas e não criam Nv.11', () => {
  assert.deepEqual(ANTROPOS_SEED.map(x => x.nivel), [1,2,3,4,5,6,7,8,9,10]);
  assert.equal(ANTROPOS_SEED.some(x => x.nivel === 11), false);
  assert.ok(ANTROPOS_SEED.every(x => x.guiasAtaque.length >= 5));
  assert.ok(ANTROPOS_SEED.flatMap(x => x.guiasAtaque).every(g => g.status === 'confirmado'));

  const lbmExpected = { 1:60,2:320,3:600,4:2000,5:5000,6:7000,7:25000,8:45000,9:70000,10:100000 };
  for (const [nivelStr, qty] of Object.entries(lbmExpected)) {
    const entry = ANTROPOS_SEED.find(x => x.nivel === Number(nivelStr));
    const guide = entry.guiasAtaque.find(x => x.codigo === 'arqueiros-lbm');
    assert.equal(guide.quantidade, qty);
    assert.equal(guide.resultado, 'sem_perdas');
    assert.equal(guide.tropaPrincipal, 'Arqueiros');
  }

  const n1 = ANTROPOS_SEED.find(x => x.nivel === 1);
  const lbm1 = n1.guiasAtaque.find(x => x.codigo === 'arqueiros-lbm');
  assert.equal(lbm1.apoios.find(x=>x.nome==='Carregadores').quantidade, 147);
  assert.equal(lbm1.apoios.find(x=>x.nome==='Transportes Blindados').quantidade, 33);
  assert.equal(lbm1.pesquisas.find(x=>x.nome==='Calibração de Armas').nivel, 2);

  const n9 = ANTROPOS_SEED.find(x => x.nivel === 9);
  const risky = n9.guiasAtaque.filter(x => x.resultado === 'possiveis_perdas');
  assert.equal(risky.length, 2);
  assert.ok(risky.every(x => x.codigo.startsWith('dragoes-ataque-rapido-ssd')));
  assert.equal(n9.guiasAtaque.find(x=>x.codigo==='arqueiros-lbm-dragao-alt-2').quantidade, 38000);

  const n10 = ANTROPOS_SEED.find(x => x.nivel === 10);
  assert.equal(n10.guiasAtaque.find(x=>x.codigo==='arqueiros-lbm-dragao').quantidade, 89999);
  assert.equal(n10.guiasAtaque.find(x=>x.codigo==='lava-jaws-lj8').quantidade, 3500);
  assert.equal(n10.guiasAtaque.find(x=>x.codigo==='dragoes-combate-bd').quantidade, 110000);
});

test('Fangtooth Nv.4 preserva quantidade ausente em vez de inventar dado', () => {
  const guide = ANTROPOS_SEED.find(x => x.nivel === 4).guiasAtaque.find(x => x.codigo === 'fangtooth-ft');
  assert.equal(guide.quantidade, null);
  assert.equal(guide.resultado, 'incompleto');
  assert.match(guide.passos[0], /não foi informada/i);
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
