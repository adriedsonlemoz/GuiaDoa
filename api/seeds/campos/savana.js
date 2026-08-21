import { createFieldReward, createFieldSeed } from './shared.js';

const SAVANA_REWARDS = Object.freeze({
  // O ícone azul está confirmado nas telas de Nv.6–10, mas o pacote enviado
  // não contém o tooltip com o nome. Mantemos código e imagem estáveis até a identificação.
  R1:createFieldReward({
    codigo:'savana-r1', simbolo:'R1', imagem:'/assets/items/fields/savanna/savana-r1.webp', nomeConfirmado:false,
    categoria:'item', finalidade:'recompensa-campo', tags:['campo','savana','nome-pendente'],
    observacao:'Ícone confirmado nos níveis 6–10; nome ainda não aparece em tooltip nas evidências disponíveis.',
  }),
  R2:createFieldReward({
    codigo:'savana-r2', simbolo:'R2', nome:'Pedaço de carne carneiro', imagem:'/assets/items/fields/savanna/pedaco-carne-carneiro.webp', quantidade:1, nomeConfirmado:true,
    categoria:'item', finalidade:'treinamento-dragao', tags:['campo','savana','carne','treinamento-dragao'],
    i18n:{ 'en-US': { nome:'Piece of ram meat' } },
  }),
  R3:createFieldReward({
    codigo:'savana-r3', simbolo:'R3', nome:'Pedaço de carne bovina', imagem:'/assets/items/fields/savanna/pedaco-carne-bovina.webp', quantidade:1, nomeConfirmado:true,
    categoria:'item', finalidade:'treinamento-dragao', tags:['campo','savana','carne','treinamento-dragao'],
    i18n:{ 'en-US': { nome:'Piece of beef' } },
  }),
  R4:createFieldReward({
    codigo:'savana-r4', simbolo:'R4', nome:'Pedaço de Frango', imagem:'/assets/items/fields/savanna/pedaco-frango.webp', quantidade:1, nomeConfirmado:true,
    categoria:'item', finalidade:'treinamento-dragao', tags:['campo','savana','carne','treinamento-dragao'],
    i18n:{ 'en-US': { nome:'Piece of chicken' } },
  }),
});

const rewardsForLevel = nivel => {
  if (nivel === 10) return [SAVANA_REWARDS.R1, SAVANA_REWARDS.R2, SAVANA_REWARDS.R3, SAVANA_REWARDS.R4];
  if (nivel >= 6) return [SAVANA_REWARDS.R1, SAVANA_REWARDS.R2, SAVANA_REWARDS.R3];
  return [SAVANA_REWARDS.R2];
};

/**
 * Savana Nv.1–10. Recompensas revisadas com screenshots de 20/08/2026.
 * Nv.1–5: carne de carneiro confirmada.
 * Nv.6–9: item azul ainda sem nome + carneiro + carne bovina.
 * Nv.10: os três anteriores + frango.
 */
export const SAVANA_SEED = createFieldSeed({
  subtipo:'savana',
  nome:'Savana',
  nameEn:'Savannah',
  recursoPrincipal:'food',
  rewardsForLevel,
  rewardStatusForLevel:nivel => nivel <= 5 ? 'confirmado' : 'parcial',
  tagsForLevel:nivel => nivel <= 5
    ? ['recompensas','recompensas-confirmadas']
    : ['recompensas','recompensas-parciais','nome-item-pendente'],
  source:{ tipo:'screenshot', data:'2026-08-20', descricao:'Tela do campo Savana Nv.1–10 e tooltips de carneiro, carne bovina e frango', verificado:true },
});
