import { createFieldReward, createFieldSeed } from './shared.js';

const SAVANA_REWARDS = Object.freeze({
  TROVAO:createFieldReward({
    codigo:'emblema-dragao-trovao',
    simbolo:'R1',
    nome:'Emblema do Dragão do Trovão',
    imagem:'/assets/items/fields/savanna/emblema-dragao-trovao.webp',
    quantidade:null,
    nomeConfirmado:true,
    categoria:'item-dragao',
    finalidade:'obtencao-dragao',
    relacionadoA:'dragao-trovao',
    tags:['campo','savana','dragao','obtencao','trovao'],
    observacao:'Tooltip confirmado pelo usuário; obtido em Savanas Nv.6–10.',
    i18n:{ 'en-US': { nome:'Thunder Dragon Emblem' } },
  }),
  CARNEIRO:createFieldReward({
    codigo:'savana-r2', simbolo:'R2', nome:'Pedaço de carne carneiro', imagem:'/assets/items/fields/savanna/pedaco-carne-carneiro.webp', quantidade:1, nomeConfirmado:true,
    categoria:'item', finalidade:'treinamento-dragao', xpDragao:100, observacao:'Concede 100 XP ao alimentar um dragão.', tags:['campo','savana','carne','treinamento-dragao'],
    i18n:{ 'en-US': { nome:'Mutton', observacao:'Grants 100 XP when fed to a dragon.' } },
  }),
  BOVINA:createFieldReward({
    codigo:'savana-r3', simbolo:'R3', nome:'Pedaço de carne bovina', imagem:'/assets/items/fields/savanna/pedaco-carne-bovina.webp', quantidade:1, nomeConfirmado:true,
    categoria:'item', finalidade:'treinamento-dragao', xpDragao:200, observacao:'Concede 200 XP ao alimentar um dragão.', tags:['campo','savana','carne','treinamento-dragao'],
    i18n:{ 'en-US': { nome:'Beef', observacao:'Grants 200 XP when fed to a dragon.' } },
  }),
  FRANGO:createFieldReward({
    codigo:'savana-r4', simbolo:'R4', nome:'Pedaço de Frango', imagem:'/assets/items/fields/savanna/pedaco-frango.webp', quantidade:1, nomeConfirmado:true,
    categoria:'item', finalidade:'treinamento-dragao', xpDragao:500, observacao:'Concede 500 XP ao alimentar um dragão.', tags:['campo','savana','carne','treinamento-dragao'],
    i18n:{ 'en-US': { nome:'Chicken', observacao:'Grants 500 XP when fed to a dragon.' } },
  }),
});

const rewardsForLevel = nivel => {
  if (nivel === 10) return [SAVANA_REWARDS.TROVAO, SAVANA_REWARDS.CARNEIRO, SAVANA_REWARDS.BOVINA, SAVANA_REWARDS.FRANGO];
  if (nivel >= 6) return [SAVANA_REWARDS.TROVAO, SAVANA_REWARDS.CARNEIRO, SAVANA_REWARDS.BOVINA];
  return [SAVANA_REWARDS.CARNEIRO];
};

/**
 * Savana Nv.1–10. É o único Campo com recompensa confirmada abaixo do Nv.6.
 * Nv.1–5: carne de carneiro.
 * Nv.6–9: Emblema do Dragão do Trovão + carneiro + carne bovina.
 * Nv.10: os três anteriores + frango.
 */
export const SAVANA_SEED = createFieldSeed({
  subtipo:'savana',
  nome:'Savana',
  nameEn:'Savannah',
  recursoPrincipal:'food',
  rewardsForLevel,
  rewardStatusForLevel:() => 'confirmado',
  tagsForLevel:nivel => nivel <= 5
    ? ['recompensas','recompensas-confirmadas','excecao-recompensa-baixo-nivel']
    : ['recompensas','recompensas-confirmadas', ...(nivel >= 6 ? ['obtencao-dragoes'] : [])],
  source:{
    tipo:'screenshot',
    data:'2026-08-21',
    descricao:'Savana Nv.1–10; tooltip confirma Emblema do Dragão do Trovão nos Nv.6–10 e carnes já identificadas nas evidências anteriores',
    verificado:true,
  },
});
