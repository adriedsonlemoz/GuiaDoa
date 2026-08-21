/**
 * Regras confirmadas das Provações da Calamidade (Zyrvorthian).
 * Os horários de batalha NÃO são inferidos entre Reinos. A referência de 19:00
 * vem de Corvith (UTC+0); a interface cruza os horários confirmados do catálogo de Reinos.
 */
export const ZYRVORTHIAN_MECHANICS = Object.freeze({
  nome:'Provações da Calamidade',
  referenciaHorario:{ reinoId:345, reinoNome:'Corvith', fuso:'UTC+0', hora:'19:00', preparacaoMinutos:5 },
  trocaChefe:{ diaSemana:'segunda-feira', hora:'00:00', fuso:'UTC', duracaoDias:7, lojaDisponivelDias:14 },
  aumentar:{ incrementosPercentuais:[5,10,15,20], maximoPercentual:50, somenteEventoAtual:true },
  furia:{ danoAdicionalPercentual:0.1 },
  recompensaAposInicioMinutos:15,
  nivelChefe:{
    minimo:1,
    reduzAposVitoriasConsecutivasDoChefe:2,
    sobeMaisRapidoQuandoDerrotadoRapidamente:true,
    afetaVidaERecompensas:true,
  },
  materiaisExclusivos:true,
  golpeFinalTemBonus:true,
  organizando:{
    envioAutomaticoSeAusente:true,
    envioAutomaticoSeOffline:true,
    desfazAoEntrarManualmente:true,
    liberaAoFimDoEvento:true,
    reposicaoAutomaticaOpcional:true,
  },
  fonte:{ tipo:'screenshots', data:'2026-08-21', descricao:'Telas de ajuda, organização, ranking e Loja de Surpresas do Zyrvorthian.' },
});
