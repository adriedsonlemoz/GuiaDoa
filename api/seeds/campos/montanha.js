import { createFieldReward, createFieldSeed } from './shared.js';
const rewardImage = file => `/assets/items/fields/mountain/${file}.webp`;
export const MONTANHA_REWARDS = Object.freeze({
  EMBLEMA_FOGO:createFieldReward({ codigo:'emblema-dragao-fogo', nome:'Emblema do Dragão do Fogo', imagem:rewardImage('emblema-dragao-fogo'), categoria:'item-dragao', finalidade:'obtencao-dragao', relacionadoA:'dragao-fogo', tags:['dragao','obtencao','fogo'], i18n:{ 'en-US': { nome:'Fire Dragon Emblem' } } }),
  EMBLEMA_ESPINHA_NEGRA:createFieldReward({ codigo:'emblema-dragao-espinha-negra', nome:'Emblema do Dragão da Espinha Negra', imagem:rewardImage('emblema-dragao-espinha-negra'), categoria:'item-dragao', finalidade:'obtencao-dragao', relacionadoA:'dragao-espinha-negra', tags:['dragao','obtencao','espinha-negra'], i18n:{ 'en-US': { nome:'Black Spine Dragon Emblem' } } }),
  EMBLEMA_TIRANO:createFieldReward({ codigo:'emblema-dragao-tirano', nome:'Emblema do Dragão Tirano', imagem:rewardImage('emblema-dragao-tirano'), categoria:'item-dragao', finalidade:'obtencao-dragao', relacionadoA:'dragao-tirano', tags:['dragao','obtencao','tirano'], i18n:{ 'en-US': { nome:'Tyrant Dragon Emblem' } } }),
  OBSIDIANA:createFieldReward({ codigo:'obsidiana', nome:'Obsidiana', imagem:rewardImage('obsidiana'), categoria:'material-especial', finalidade:'recompensa-campo', tags:['material','nivel-10'], i18n:{ 'en-US': { nome:'Obsidian' } } }),
});
const DRAGON_EMBLEMS=[MONTANHA_REWARDS.EMBLEMA_FOGO,MONTANHA_REWARDS.EMBLEMA_ESPINHA_NEGRA,MONTANHA_REWARDS.EMBLEMA_TIRANO];
export function montanhaRewardsForLevel(nivel){ if(nivel<=5)return[]; if(nivel===10)return[...DRAGON_EMBLEMS,MONTANHA_REWARDS.OBSIDIANA]; return[...DRAGON_EMBLEMS]; }
function tagsForLevel(nivel){ if(nivel<=5)return['sem-recompensas']; if(nivel===10)return['recompensas','obtencao-dragoes','recompensa-especial']; return['recompensas','obtencao-dragoes']; }
export const MONTANHA_SEED=createFieldSeed({ subtipo:'montanha', nome:'Montanha', nameEn:'Mountain', recursoPrincipal:'metals', rewardsForLevel:montanhaRewardsForLevel, rewardStatusForLevel:()=> 'confirmado', tagsForLevel, source:{ tipo:'screenshot', data:'2026-08-20', descricao:'Telas da Montanha Nv.1–10, recompensas e relatórios de batalha enviados pelo usuário', verificado:true } });
