import { createFieldReward, createFieldSeed } from './shared.js';

const SAVANA_REWARDS = Object.freeze({
  R1:createFieldReward({ codigo:'savana-r1', simbolo:'R1', nomeConfirmado:false }),
  R2:createFieldReward({ codigo:'savana-r2', simbolo:'R2', nomeConfirmado:false }),
  R3:createFieldReward({
    codigo:'savana-r3', simbolo:'R3', nome:'Pedaço de carne bovina', quantidade:1, nomeConfirmado:true,
    categoria:'item', finalidade:'recompensa-campo', tags:['campo','savana'],
    i18n:{ 'en-US': { nome:'Piece of beef' } },
  }),
  R4:createFieldReward({ codigo:'savana-r4', simbolo:'R4', nomeConfirmado:false }),
});

const rewardsForLevel = nivel => {
  if (nivel === 10) return [SAVANA_REWARDS.R1, SAVANA_REWARDS.R2, SAVANA_REWARDS.R3, SAVANA_REWARDS.R4];
  if (nivel >= 6) return [SAVANA_REWARDS.R1, SAVANA_REWARDS.R2, SAVANA_REWARDS.R3];
  return [SAVANA_REWARDS.R2];
};

/**
 * Savana Nv.1–10 preservada da Beta 2.45, agora isolada do seed principal.
 * Recompensas sem nome continuam simbólicas até confirmação explícita.
 */
export const SAVANA_SEED = createFieldSeed({
  subtipo:'savana',
  nome:'Savana',
  nameEn:'Savannah',
  recursoPrincipal:'food',
  rewardsForLevel,
  rewardStatusForLevel:() => 'parcial',
  tagsForLevel:nivel => nivel >= 6 ? ['recompensas'] : [],
  source:{ tipo:'screenshot', data:'2026-08-14', descricao:'Tela do campo e relatório de batalha do jogo', verificado:true },
});
