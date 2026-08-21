import { createFieldReward, createFieldSeed } from './shared.js';

const rewardImage = file => `/assets/items/fields/lake/${file}.webp`;

export const LAGO_REWARDS = Object.freeze({
  EMBLEMA_AGUA:createFieldReward({
    codigo:'emblema-dragao-agua',
    nome:'Emblema do Dragão da Água',
    imagem:rewardImage('emblema-dragao-agua'),
    categoria:'item-dragao',
    finalidade:'obtencao-dragao',
    relacionadoA:'dragao-agua',
    tags:['dragao','obtencao','agua'],
    i18n:{ 'en-US': { nome:'Water Dragon Emblem' } },
  }),
  EMBLEMA_GELO:createFieldReward({
    codigo:'emblema-dragao-gelo',
    nome:'Emblema do Dragão do Gelo',
    imagem:rewardImage('emblema-dragao-gelo'),
    categoria:'item-dragao',
    finalidade:'obtencao-dragao',
    relacionadoA:'dragao-gelo',
    tags:['dragao','obtencao','gelo'],
    i18n:{ 'en-US': { nome:'Frost Dragon Emblem' } },
  }),
  EMBLEMA_PARADISIACO:createFieldReward({
    codigo:'emblema-dragao-paradisiaco',
    nome:'Emblema do Dragão Paradisíaco',
    imagem:rewardImage('emblema-dragao-paradisiaco'),
    categoria:'item-dragao',
    finalidade:'obtencao-dragao',
    relacionadoA:'dragao-paradisiaco',
    tags:['dragao','obtencao','paradisiaco'],
    i18n:{ 'en-US': { nome:'Paradise Dragon Emblem' } },
  }),
  NUCLEO_SOMBRIO:createFieldReward({
    codigo:'nucleo-sombrio',
    nome:'Núcleo Sombrio',
    imagem:rewardImage('nucleo-sombrio'),
    categoria:'material-especial',
    finalidade:'recompensa-campo',
    tags:['material','nivel-10'],
    i18n:{ 'en-US': { nome:'Dark Core' } },
  }),
});

const DRAGON_EMBLEMS = [
  LAGO_REWARDS.EMBLEMA_AGUA,
  LAGO_REWARDS.EMBLEMA_GELO,
  LAGO_REWARDS.EMBLEMA_PARADISIACO,
];

export function lagoRewardsForLevel(nivel) {
  if (nivel <= 5) return [];
  if (nivel === 10) return [...DRAGON_EMBLEMS, LAGO_REWARDS.NUCLEO_SOMBRIO];
  return [...DRAGON_EMBLEMS];
}

/**
 * Lago Nv.1–10, transcrito das telas e relatórios enviados em 20/08/2026.
 * - Nv.1–5: ausência de recompensas confirmada pelas telas.
 * - Nv.6–9: três emblemas ligados à obtenção de dragões.
 * - Nv.10: os três emblemas + Núcleo Sombrio.
 *
 * `categoria`, `finalidade`, `relacionadoA` e `tags` das recompensas são dados
 * semânticos para permitir gerar tutoriais posteriormente sem depender do JSX.
 */
export const LAGO_SEED = createFieldSeed({
  subtipo:'lago',
  nome:'Lago',
  nameEn:'Lake',
  recursoPrincipal:'food',
  rewardsForLevel:lagoRewardsForLevel,
  rewardStatusForLevel:() => 'confirmado',
  tagsForLevel:nivel => nivel >= 6
    ? ['recompensas','obtencao-dragoes', ...(nivel === 10 ? ['recompensa-especial'] : [])]
    : ['sem-recompensas'],
  source:{
    tipo:'screenshot',
    data:'2026-08-20',
    descricao:'Telas do Lago, recompensas e relatórios de batalha enviados pelo usuário',
    verificado:true,
  },
});
