import { createFieldReward, createFieldSeed } from './shared.js';

const rewardImage = file => `/assets/items/fields/forest/${file}.webp`;

export const FLORESTA_REWARDS = Object.freeze({
  EMBLEMA_BELADONA:createFieldReward({
    codigo:'emblema-dragao-beladona',
    nome:'Emblema do Dragão Beladona',
    imagem:rewardImage('emblema-dragao-beladona'),
    categoria:'item-dragao',
    finalidade:'obtencao-dragao',
    relacionadoA:'dragao-beladona',
    tags:['dragao','obtencao','beladona'],
    i18n:{ 'en-US': { nome:'Belladonna Dragon Emblem' } },
  }),
  EMBLEMA_TOXICO:createFieldReward({
    codigo:'emblema-dragao-toxico',
    nome:'Emblema do Dragão Tóxico',
    imagem:rewardImage('emblema-dragao-toxico'),
    categoria:'item-dragao',
    finalidade:'obtencao-dragao',
    relacionadoA:'dragao-toxico',
    tags:['dragao','obtencao','toxico'],
    i18n:{ 'en-US': { nome:'Toxic Dragon Emblem' } },
  }),
  EMBLEMA_FADA:createFieldReward({
    codigo:'emblema-dragao-fada',
    nome:'Emblema do Dragão Fada',
    imagem:rewardImage('emblema-dragao-fada'),
    categoria:'item-dragao',
    finalidade:'obtencao-dragao',
    relacionadoA:'dragao-fada',
    tags:['dragao','obtencao','fada'],
    i18n:{ 'en-US': { nome:'Fairy Dragon Emblem' } },
  }),
  ESSENCIA_FURIA:createFieldReward({
    codigo:'essencia-furia',
    nome:'Essência da Fúria',
    imagem:rewardImage('essencia-furia'),
    categoria:'material-especial',
    finalidade:'recompensa-campo',
    tags:['material','nivel-10'],
    i18n:{ 'en-US': { nome:'Essence of Fury' } },
  }),
});

const DRAGON_EMBLEMS = [
  FLORESTA_REWARDS.EMBLEMA_BELADONA,
  FLORESTA_REWARDS.EMBLEMA_TOXICO,
  FLORESTA_REWARDS.EMBLEMA_FADA,
];

export function florestaRewardsForLevel(nivel) {
  if (nivel <= 5) return [];
  if (nivel === 10) return [...DRAGON_EMBLEMS, FLORESTA_REWARDS.ESSENCIA_FURIA];
  return [...DRAGON_EMBLEMS];
}

function rewardStatusForLevel() {
  // Regra confirmada pelo usuário: a Savana é o único Campo com recompensas abaixo do Nv.6.
  // Portanto Floresta Nv.1–5 confirma ausência de recompensas mesmo sem pop-up individual dos Nv.3–4.
  return 'confirmado';
}

function tagsForLevel(nivel) {
  if (nivel <= 5) return ['sem-recompensas'];
  if (nivel === 10) return ['recompensas','obtencao-dragoes','recompensa-especial'];
  return ['recompensas','obtencao-dragoes'];
}

/**
 * Floresta Nv.1–10, estruturada a partir das telas e relatórios enviados em 20/08/2026.
 *
 * Cobertura das referências:
 * - Nv.1–10: progressão estrutural cadastrada;
 * - Nv.2: novo relatório de batalha confirma 100 Canibais + 50 Fedor;
 * - Regra global confirmada pelo usuário: somente a Savana possui recompensas nos Nv.1–5;
 * - Nv.6–10: os emblemas e o item especial seguem as telas já enviadas.
 *
 * Os recortes locais são derivados diretamente das imagens fornecidas; nenhuma arte foi gerada.
 */
export const FLORESTA_SEED = createFieldSeed({
  subtipo:'floresta',
  nome:'Floresta',
  nameEn:'Forest',
  recursoPrincipal:'wood',
  rewardsForLevel:florestaRewardsForLevel,
  rewardStatusForLevel,
  tagsForLevel,
  source:{
    tipo:'screenshot',
    data:'2026-08-20',
    descricao:'Telas da Floresta e relatórios de batalha enviados pelo usuário; Nv.2 confirmado com 100 Canibais + 50 Fedor e ausência de recompensas confirmada nos Nv.1–5',
    verificado:true,
  },
});
