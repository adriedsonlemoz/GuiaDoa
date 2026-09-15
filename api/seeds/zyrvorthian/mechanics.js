/**
 * Regras confirmadas das Provações da Calamidade (Zyrvorthian).
 * O horário canônico conhecido é 19:00 no servidor base UTC+0 (Corvith).
 * A interface converte esse horário pelo utilitário central de fusos, sempre a partir de UTC+0.
 */
export const ZYRVORTHIAN_MECHANICS = Object.freeze({
  nome:'Provações da Calamidade',
  servidorBase:'UTC+0',
  horarioBaseUtc:'19:00',
  referenciaHorario:{ reinoId:345, reinoNome:'Corvith', fuso:'UTC+0', hora:'19:00', preparacaoMinutos:5 },
  trocaChefe:{ diaSemana:'segunda-feira', hora:'00:00', fuso:'UTC+0', duracaoDias:7, lojaDisponivelDias:14 },
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
