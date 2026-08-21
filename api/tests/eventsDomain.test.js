import test from 'node:test';
import assert from 'node:assert/strict';
import {
  statusOcorrencia,
  statusFase,
  faseAtual,
  normalizarEventoPayload, alinharOcorrenciasAoPeriodo,
  validarOcorrenciasComReinos,
  normalizarRecompensa,
  resumoExclusaoEvento,
  parseServidorDate,
} from '../utils/eventos.js';
import { calcularIdadeReino, normalizarReinoPayload } from '../utils/reinos.js';
import { EVENTOS_SEED } from '../seeds/eventos.js';
import { REINOS_SEED } from '../seeds/reinos.js';

const realms = [
  { id:345, nome:'Corvith', fuso:'UTC+0' },
  { id:346, nome:'Kenorax', fuso:'UTC-7' },
  { id:347, nome:'Eisenhold', fuso:'UTC+1' },
  { id:348, nome:'Zulanka', fuso:'UTC-4' },
];

function baseEvent(overrides = {}) {
  return {
    slug:'evento-teste', nome:'Evento Teste', inicioServidor:'2026-08-20T00:00', fimServidor:'2026-08-27T00:00',
    servidorFuso:'UTC', horarioReset:'00:00', fases:[], regras:[], recompensas:[], ocorrencias:[], ...overrides,
  };
}

test('status é calculado pelo intervalo oficial UTC e encerra exatamente no reset', () => {
  const occ = { confirmado:true, inicioServidor:'2026-08-20T00:00:00Z', fimServidor:'2026-08-27T00:00:00Z' };
  assert.equal(statusOcorrencia(occ, new Date('2026-08-19T23:59:59Z')), 'proximo');
  assert.equal(statusOcorrencia(occ, new Date('2026-08-21T12:00:00Z')), 'ativo');
  assert.equal(statusOcorrencia(occ, new Date('2026-08-27T00:00:00Z')), 'encerrado');
});

test('ausência ou ocorrência não confirmada nunca vira evento global', () => {
  assert.equal(statusOcorrencia(null), 'nao_confirmado');
  assert.equal(statusOcorrencia({ confirmado:false }), 'nao_confirmado');
});

test('datetime-local do Admin é interpretado como relógio oficial UTC, sem fuso do navegador', () => {
  assert.equal(parseServidorDate('2026-08-21T00:00').toISOString(), '2026-08-21T00:00:00.000Z');
});

test('evento em um único reino usa o período compartilhado sem repetir datas no payload da ocorrência', () => {
  const normalized = normalizarEventoPayload(baseEvent({ ocorrencias:[{ reinoId:348, confirmado:true }] }));
  validarOcorrenciasComReinos(normalized, realms);
  assert.equal(normalized.ocorrencias.length, 1);
  assert.equal(normalized.ocorrencias[0].reinoNome, 'Zulanka');
  assert.equal(normalized.ocorrencias[0].fusoReino, 'UTC-4');
  assert.equal(normalized.ocorrencias[0].inicioServidor.toISOString(), '2026-08-20T00:00:00.000Z');
});

test('mesmo evento aceita quatro ocorrências válidas sem erro de validação', () => {
  const normalized = normalizarEventoPayload(baseEvent({ ocorrencias:realms.map(r => ({ reinoId:r.id, confirmado:true })) }));
  validarOcorrenciasComReinos(normalized, realms);
  assert.deepEqual(normalized.ocorrencias.map(o => o.reinoId), [345,346,347,348]);
  assert.ok(normalized.ocorrencias.every(o => o.inicioServidor.toISOString()==='2026-08-20T00:00:00.000Z'));
  assert.ok(normalized.ocorrencias.every(o => o.fimServidor.toISOString()==='2026-08-27T00:00:00.000Z'));
});

test('edição dos reinos preserva ocorrências existentes e aceita remover/adicionar reino', () => {
  const initial = normalizarEventoPayload(baseEvent({ ocorrencias:[{reinoId:345},{reinoId:348}] }));
  validarOcorrenciasComReinos(initial, realms);
  const edited = normalizarEventoPayload({ ...initial, ocorrencias:[initial.ocorrencias[0], {reinoId:346,confirmado:true}] });
  validarOcorrenciasComReinos(edited, realms);
  assert.deepEqual(edited.ocorrencias.map(o=>o.reinoId), [345,346]);
  assert.equal(edited.ocorrencias[0].reinoNome, 'Corvith');
});

test('erro de ocorrência informa causa, campo e índice em vez de mensagem genérica', () => {
  assert.throws(
    () => validarOcorrenciasComReinos(normalizarEventoPayload(baseEvent({ ocorrencias:[{reinoId:345},{reinoId:999}] })), realms),
    err => err.codigo==='REINO_NAO_ENCONTRADO' && err.detalhes?.campo==='reinoId' && err.detalhes?.indice===1 && /#999/.test(err.message),
  );
});

test('reino duplicado no mesmo evento é rejeitado explicitamente', () => {
  assert.throws(
    () => normalizarEventoPayload(baseEvent({ ocorrencias:[{reinoId:348},{reinoId:348}] })),
    err => err.codigo==='REINO_DUPLICADO' && err.detalhes?.campo==='ocorrencias',
  );
});

test('fases calculam status por início/término e fase atual pela data', () => {
  const event = normalizarEventoPayload(baseEvent({
    fases:[
      { codigo:'fase-1', nome:'Fase 1', inicioServidor:'2026-08-21T00:00', fimServidor:'2026-08-22T00:00' },
      { codigo:'fase-2', nome:'Fase 2', inicioServidor:'2026-08-22T00:00', fimServidor:'2026-08-23T00:00' },
    ],
    ocorrencias:[{reinoId:348}],
  }));
  const occ=event.ocorrencias[0];
  assert.equal(statusFase(event.fases[0],occ,new Date('2026-08-20T12:00Z')),'proximo');
  assert.equal(statusFase(event.fases[0],occ,new Date('2026-08-21T12:00Z')),'ativo');
  assert.equal(statusFase(event.fases[0],occ,new Date('2026-08-22T00:00Z')),'encerrado');
  assert.equal(faseAtual(event,occ,new Date('2026-08-22T12:00Z')).codigo,'fase-2');
});

test('dia relativo das fases é derivado das datas, não digitado como texto', () => {
  const event = normalizarEventoPayload(baseEvent({ fases:[{codigo:'fase-1',nome:'Fase 1',inicioServidor:'2026-08-22T00:00',fimServidor:'2026-08-23T00:00'}] }));
  assert.equal(event.fases[0].diaInicio, 3);
  assert.equal(event.fases[0].diaFim, 3);
});

test('recompensas individuais aceitam metas ilimitáveis pelo modelo e múltiplos itens', () => {
  const reward = normalizarRecompensa({ tipo:'individual', requisito:1500, itens:[{nome:'Item A',quantidade:10},{nome:'Item B',quantidade:5},{nome:'Item C',quantidade:1}] });
  assert.equal(reward.tipo,'individual');
  assert.equal(reward.requisito,1500);
  assert.equal(reward.itens.length,3);
});

test('ranking aceita posição única e faixa sem exigir Top 20 completo', () => {
  const first=normalizarRecompensa({tipo:'ranking',posicaoInicio:1,posicaoFim:1,itens:[{nome:'A',quantidade:1}]});
  const range=normalizarRecompensa({tipo:'ranking',classificacao:'11-20',itens:[{nome:'B',quantidade:1}]});
  assert.deepEqual([first.posicaoInicio,first.posicaoFim],[1,1]);
  assert.deepEqual([range.posicaoInicio,range.posicaoFim],[11,20]);
});

test('item de recompensa preserva referência interna estruturada para tropa', () => {
  const reward=normalizarRecompensa({tipo:'ranking',classificacao:'1',itens:[{nome:'1000 Gigantes',quantidade:10,tipoReferencia:'tropa',referenciaSlug:'Gigantes'}]});
  assert.equal(reward.itens[0].tipoReferencia,'tropa');
  assert.equal(reward.itens[0].referenciaSlug,'Gigantes');
});

test('regra legada em string é normalizada sem perder conteúdo', () => {
  const event=normalizarEventoPayload(baseEvent({regras:['Ataque os campos indicados.']}));
  assert.equal(event.regras[0].texto,'Ataque os campos indicados.');
  assert.equal(event.regras[0].ordem,0);
});

test('impacto de exclusão contabiliza ocorrências, reinos, fases, recompensas e histórico', () => {
  const impact=resumoExclusaoEvento({ocorrencias:[{reinoId:345},{reinoId:348}],fases:[{recompensas:[{},{}]}],recompensas:[{}],historico:[{}]});
  assert.deepEqual(impact,{ocorrencias:2,reinos:2,fases:1,recompensas:3,historico:1});
});

test('idade do reino é calculada da abertura e nunca precisa ser armazenada', () => {
  assert.equal(calcularIdadeReino('2026-08-12T00:00:00Z',new Date('2026-08-21T12:00:00Z')),9);
});

test('cadastro de reino aceita horários e tipo especial sem recriar idioma/região', () => {
  const realm=normalizarReinoPayload({id:325,nome:'Gibia',fuso:'UTC+0',tipoEspecial:'hardcore',horarios:{torneiosFim:'22:00',zyrvorthian:'18:00',batalhaDragao:'20:00'},regiao:'x',idioma:'y'});
  assert.equal(realm.tipoEspecial,'hardcore');
  assert.equal(realm.horarios.torneiosFim,'22:00');
  assert.equal('regiao' in realm,false);
  assert.equal('idioma' in realm,false);
});

test('seed Corrida Armamentista mantém sete dias e confirma somente os quatro reinos informados', () => {
  const event = EVENTOS_SEED[0];
  assert.equal(event.fases[0].diaInicio, 1);
  assert.equal(event.fases.at(-1).diaFim, 7);
  assert.deepEqual(event.ocorrencias.map(o=>o.reinoId),[345,346,347,348]);
  assert.equal(event.recompensas.length, 4);
  assert.equal(event.recompensas.at(-1).classificacao, '11-20');
  assert.equal(event.fases.find(f => f.codigo === 'fase-4').recompensas.find(r => r.requisito === 1000).itens.length, 3);
  const phase = faseAtual(event, event.ocorrencias.find(o=>o.reinoId===348), new Date('2026-08-21T01:30:00Z'));
  assert.equal(phase.codigo, 'fase-1');
});

test('seed canônico contém somente os 33 reinos informados, com IDs reais e datas confirmadas', () => {
  const byId=new Map(REINOS_SEED.map(r=>[r.id,r]));
  assert.equal(REINOS_SEED.length,33);
  assert.equal(new Set(REINOS_SEED.map(r=>r.id)).size,33);
  assert.equal(REINOS_SEED.some(r=>r.nome==='Fabrica'),false);
  for (const id of [345,346,347,348]) assert.equal(byId.get(id)?.aberturaEm,'2026-08-12T00:00:00.000Z');
  for (const id of [341,342,343,344]) assert.equal(byId.get(id)?.aberturaEm,'2025-08-12T00:00:00.000Z');
  for (const id of [337,338,339,340]) assert.equal(byId.get(id)?.aberturaEm,'2024-08-12T00:00:00.000Z');
  assert.equal(byId.get(336)?.aberturaEm,undefined);
  assert.equal(byId.get(287)?.fuso,'UTC-7');
  assert.equal(byId.get(291)?.fuso,'UTC+0');
  assert.equal(byId.get(323)?.nome,'Mamre');
  assert.equal(byId.get(320)?.fuso,'UTC-7');
  assert.equal(byId.get(325)?.tipoEspecial,'hardcore');
  assert.equal(byId.get(286)?.tipoEspecial,'idade_dragao');
  assert.equal(byId.get(287)?.tipoEspecial,'idade_dragao');
  assert.equal(byId.get(291)?.tipoEspecial,'idade_dragao');
});


test('período central do evento realinha todas as ocorrências ao mesmo reset', () => {
  const occurrences = [
    { reinoId:345, inicioServidor:'2026-08-20T00:00:00.000Z', fimServidor:'2026-08-27T00:00:00.000Z' },
    { reinoId:346, inicioServidor:'2026-08-20T00:00:00.000Z', fimServidor:'2026-08-27T00:00:00.000Z' },
    { reinoId:347, inicioServidor:'2026-08-20T00:00:00.000Z', fimServidor:'2026-08-27T00:00:00.000Z' },
    { reinoId:348, inicioServidor:'2026-08-20T00:00:00.000Z', fimServidor:'2026-08-27T00:00:00.000Z' },
  ];
  const aligned = alinharOcorrenciasAoPeriodo(occurrences, '2026-08-21T00:00', '2026-08-28T00:00');
  assert.equal(aligned.length, 4);
  for (const occurrence of aligned) {
    assert.equal(occurrence.inicioServidor.toISOString(), '2026-08-21T00:00:00.000Z');
    assert.equal(occurrence.fimServidor.toISOString(), '2026-08-28T00:00:00.000Z');
  }
});
