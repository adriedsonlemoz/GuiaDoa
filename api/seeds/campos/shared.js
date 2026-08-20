const troop = (nome, quantidade) => ({ nome, quantidade });

/**
 * Progressão básica confirmada para Campos no jogo mobile.
 * Mantida em um único lugar para evitar repetir composição/produção em cada subtipo.
 * Novos campos podem reutilizar esta base e sobrescrever somente o que for diferente.
 */
export const FIELD_LEVEL_CONFIG = Object.freeze({
  1:{ producaoHora:2750,  recursoValor:1000,  recursoExibicao:'1.00k', tropas:[troop('Canibal',50)] },
  2:{ producaoHora:5500,  recursoValor:2000,  recursoExibicao:'2.00k', tropas:[troop('Canibal',100),troop('Fedor',50)] },
  3:{ producaoHora:8250,  recursoValor:3000,  recursoExibicao:'3.00k', tropas:[troop('Canibal',200),troop('Fedor',100),troop('Demônia',50)] },
  4:{ producaoHora:11000, recursoValor:4000,  recursoExibicao:'4.00k', tropas:[troop('Canibal',500),troop('Fedor',200),troop('Demônia',100),troop('Porreteiro',50)] },
  5:{ producaoHora:13750, recursoValor:5000,  recursoExibicao:'5.00k', tropas:[troop('Canibal',1000),troop('Fedor',500),troop('Demônia',200),troop('Porreteiro',100),troop('Lançadores',50)] },
  6:{ producaoHora:16500, recursoValor:6000,  recursoExibicao:'6.00k', tropas:[troop('Canibal',2000),troop('Fedor',1000),troop('Demônia',500),troop('Porreteiro',200),troop('Lançadores',100),troop('Retalhador',50)] },
  7:{ producaoHora:19250, recursoValor:7000,  recursoExibicao:'7.00k', tropas:[troop('Canibal',2000),troop('Fedor',1000),troop('Demônia',500),troop('Porreteiro',200),troop('Lançadores',100),troop('Retalhador',50)] },
  8:{ producaoHora:22000, recursoValor:8000,  recursoExibicao:'8.00k', tropas:[troop('Canibal',5000),troop('Fedor',2000),troop('Demônia',1000),troop('Porreteiro',500),troop('Lançadores',200),troop('Retalhador',100),troop('Chefes',50)] },
  9:{ producaoHora:24750, recursoValor:9000,  recursoExibicao:'9.00k', tropas:[troop('Canibal',10000),troop('Fedor',5000),troop('Demônia',2000),troop('Porreteiro',1000),troop('Lançadores',500),troop('Retalhador',200),troop('Chefes',100),troop('Sanguíneos',50)] },
  10:{ producaoHora:27500, recursoValor:10000, recursoExibicao:'10.0k', tropas:[troop('Canibal',20000),troop('Fedor',10000),troop('Demônia',5000),troop('Porreteiro',2000),troop('Lançadores',1000),troop('Retalhador',500),troop('Chefes',200),troop('Sanguíneos',100),troop('Raivoso',50)] },
});

export const createFieldReward = ({
  codigo,
  simbolo = '',
  nome = '',
  imagem = '',
  quantidade = null,
  nomeConfirmado = Boolean(nome),
  observacao = '',
  categoria = '',
  finalidade = '',
  relacionadoA = '',
  tags = [],
  i18n = {},
}) => ({
  codigo,
  simbolo,
  nome,
  imagem,
  quantidade,
  nomeConfirmado,
  observacao,
  categoria,
  finalidade,
  relacionadoA,
  tags,
  i18n,
});

const cloneTroops = tropas => tropas.map(item => ({ ...item }));

/**
 * Factory de Campos. O formato gerado é deliberadamente estruturado para que
 * a mesma fonte possa alimentar cards, detalhes e futuros tutoriais sem copiar texto.
 */
export function createFieldSeed({
  subtipo,
  nome,
  nameEn,
  recursoPrincipal = 'food',
  rewardsForLevel = () => [],
  rewardStatusForLevel = () => 'pendente',
  tagsForLevel = () => [],
  source,
}) {
  return Object.entries(FIELD_LEVEL_CONFIG).map(([nivelTexto, config]) => {
    const nivel = Number(nivelTexto);
    return {
      slug:`campos-${subtipo}-${nivel}`,
      categoria:'campos',
      subtipo,
      nivel,
      ordem:nivel,
      nome:`${nome} — Nv. ${nivel}`,
      ativo:true,
      tropas:cloneTroops(config.tropas),
      recursos:[{
        tipo:recursoPrincipal,
        valor:config.recursoValor,
        exibicao:config.recursoExibicao,
        exato:true,
      }],
      campo:{
        recursoPrincipal,
        producaoHora:config.producaoHora,
        producaoExibicao:`${config.producaoHora}/h`,
      },
      recompensas:rewardsForLevel(nivel).map(item => ({ ...item, tags:[...(item.tags || [])] })),
      recompensasStatus:rewardStatusForLevel(nivel),
      tags:['campo', subtipo, recursoPrincipal, ...tagsForLevel(nivel)],
      i18n:{ 'en-US': { nome:`${nameEn} — Lv. ${nivel}` } },
      estrategia:{ publicada:false, titulo:'', resumo:'', passos:[], requisitos:[], observacoes:'', i18n:{} },
      guiasAtaque:[],
      fonte:{ ...source },
    };
  });
}
