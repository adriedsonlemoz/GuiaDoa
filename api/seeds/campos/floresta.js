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

function rewardStatusForLevel(nivel) {
  // Os pop-ups enviados confirmam ausência de recompensas nos Nv.1, 2 e 5.
  // Nv.3 e 4 vieram somente em relatórios de batalha; a ausência de itens não é inferida.
  if ([1,2,5].includes(nivel)) return 'confirmado';
  if ([3,4].includes(nivel)) return 'pendente';
  return 'confirmado';
}

function tagsForLevel(nivel) {
  if ([1,2,5].includes(nivel)) return ['sem-recompensas'];
  if ([3,4].includes(nivel)) return ['recompensas-nao-confirmadas'];
  if (nivel === 10) return ['recompensas','obtencao-dragoes','recompensa-especial'];
  return ['recompensas','obtencao-dragoes'];
}

/**
 * Floresta Nv.1–10, estruturada a partir das telas e relatórios enviados em 20/08/2026.
 *
 * Cobertura das referências:
 * - Nv.1, 2, 5–10: pop-up do campo disponível;
 * - Nv.1, 3–10: relatório de batalha disponível;
 * - Nv.3–4: a composição inimiga é confirmada pelo relatório, mas a lista de recompensas
 *   permanece pendente porque não foi enviado o pop-up do campo desses dois níveis;
 * - Nv.2: o recurso/produção são confirmados pelo pop-up e a composição segue a progressão
 *   comum já consolidada em `shared.js` para Campos.
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
    descricao:'Telas da Floresta e relatórios de batalha enviados pelo usuário; Nv.3–4 sem pop-up de recompensas e Nv.2 sem relatório de batalha',
    verificado:true,
  },
});
