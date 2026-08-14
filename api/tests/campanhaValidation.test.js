import test from 'node:test';
import assert from 'node:assert/strict';
import { normalizarCampanhaPayload, resumoCategorias } from '../utils/campanha.js';

test('normaliza registro de campanha sem transformar abreviação em valor exato', () => {
  const out = normalizarCampanhaPayload({ categoria:'antropos', nivel:10, nome:'Campo de Antropos — Nv. 10', tropas:[{nome:'Pirralho',quantidade:250000}], recursos:[{tipo:'food',valor:1120000,exibicao:'1.12m',exato:false}] });
  assert.equal(out.slug, 'antropos-10');
  assert.equal(out.recursos[0].exato, false);
});

test('campo usa subtipo no slug e aceita domínio/recompensa simbólica', () => {
  const out = normalizarCampanhaPayload({
    categoria:'campos', subtipo:'Savana', nivel:6, nome:'Savana — Nv. 6',
    tropas:[{nome:'Canibal',quantidade:2000}], recursos:[{tipo:'food',valor:6000,exibicao:'6.00k'}],
    campo:{recursoPrincipal:'food',producaoHora:16500,producaoExibicao:'16500/h'},
    recompensas:[{codigo:'savana-r1',simbolo:'R1'},{codigo:'savana-r3',simbolo:'R3',nome:'Pedaço de carne bovina',quantidade:1,nomeConfirmado:true}],
  });
  assert.equal(out.slug, 'campos-savana-6');
  assert.equal(out.subtipo, 'savana');
  assert.equal(out.campo.producaoHora, 16500);
  assert.equal(out.recompensas[0].nomeConfirmado, false);
  assert.equal(out.recompensas[1].nomeConfirmado, true);
});

test('rejeita campo sem subtipo válido e recompensas duplicadas', () => {
  assert.throws(() => normalizarCampanhaPayload({categoria:'campos',nivel:1,nome:'X'}), /subtipo válido/i);
  assert.throws(() => normalizarCampanhaPayload({categoria:'campos',subtipo:'deserto',nivel:1,nome:'X'}), /subtipo válido/i);
  assert.throws(() => normalizarCampanhaPayload({categoria:'campos',subtipo:'savana',nivel:1,nome:'X',recompensas:[{codigo:'r1'},{codigo:'r1'}]}), /duplicada/i);
});

test('rejeita quantidade de tropa inválida e estratégia publicada vazia', () => {
  assert.throws(() => normalizarCampanhaPayload({categoria:'antropos',nivel:1,nome:'X',tropas:[{nome:'Pirralho',quantidade:-1}]}), /Tropa inválida/);
  assert.throws(() => normalizarCampanhaPayload({categoria:'antropos',nivel:1,nome:'X',estrategia:{publicada:true}}), /estratégia publicada/i);
});

test('resume categorias futuras com zero sem criar registros falsos', () => {
  assert.deepEqual(resumoCategorias([{categoria:'antropos'},{categoria:'antropos'},{categoria:'campos'}]), {antropos:2,campos:1,zyrvorthian:0,grodz:0});
});


test('normaliza guia estruturado de ataque com apoios e pesquisas', () => {
  const out = normalizarCampanhaPayload({
    categoria:'antropos', nivel:1, nome:'Campo de Antropos — Nv. 1',
    guiasAtaque:[{
      codigo:'arqueiros-lbm', titulo:'Arqueiros (LBM)', status:'confirmado', resultado:'sem_perdas', complemento:'Grande Dragão', tropaPrincipal:'Arqueiros', quantidade:60,
      apoios:[{nome:'Carregadores',quantidade:147,alternativa:'transporte'},{nome:'Transportes Blindados',quantidade:33,alternativa:'transporte'}],
      pesquisas:[{nome:'Metalurgia',nivel:1},{nome:'Medicina',nivel:1},{nome:'Calibração de Armas',nivel:2}],
      passos:['Teste primeiro.'], fonte:{tipo:'comunidade',url:'https://example.com',descricao:'Fonte de teste'},
    }],
  });
  assert.equal(out.guiasAtaque.length, 1);
  assert.equal(out.guiasAtaque[0].codigo, 'arqueiros-lbm');
  assert.equal(out.guiasAtaque[0].apoios.length, 2);
  assert.equal(out.guiasAtaque[0].pesquisas[2].nivel, 2);
  assert.equal(out.guiasAtaque[0].status, 'confirmado');
  assert.equal(out.guiasAtaque[0].resultado, 'sem_perdas');
  assert.equal(out.guiasAtaque[0].complemento, 'Grande Dragão');
});

test('rejeita guia estruturado sem título ou com pesquisa inválida', () => {
  assert.throws(() => normalizarCampanhaPayload({categoria:'antropos',nivel:1,nome:'X',guiasAtaque:[{codigo:'x'}]}), /Guia de ataque inválido/i);
  assert.throws(() => normalizarCampanhaPayload({categoria:'antropos',nivel:1,nome:'X',guiasAtaque:[{titulo:'X',pesquisas:[{nome:'Metalurgia',nivel:-1}]}]}), /Pesquisa inválida/i);
});
