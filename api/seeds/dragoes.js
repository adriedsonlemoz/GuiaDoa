// Catálogo canônico de dragões.
// A progressão é preenchida aos poucos: não inferimos níveis/atributos que não foram confirmados.
// Retratos abaixo foram recortados das capturas fornecidas pelo usuário.
import { getDragonCapture, captureSource } from './dragonCapture.js';

const DRAGON_I18N = Object.freeze({
  grande_dragao:{ nome:'Great Dragon', elemento:'Main' },
  dragao_agua:{ nome:'Water Dragon', elemento:'Water' },
  dragao_beladona:{ nome:'Belladonna Dragon', elemento:'Belladonna' },
  dragao_terra:{ nome:'Earth Dragon', elemento:'Earth' },
  dragao_fogo:{ nome:'Fire Dragon', elemento:'Fire' },
  dragao_toxico:{ nome:'Toxic Dragon', elemento:'Toxic' },
  dragao_gelo:{ nome:'Ice Dragon', elemento:'Ice' },
  dragao_espinha_negra:{ nome:'Black Spine Dragon', elemento:'Black Spine' },
  dragao_trovao:{ nome:'Thunder Dragon', elemento:'Thunder' },
  dragao_celestial:{ nome:'Celestial Dragon', elemento:'Celestial' },
  dragao_paradisiaco:{ nome:'Paradise Dragon', elemento:'Paradise' },
  dragao_dourado:{ nome:'Golden Dragon', elemento:'Golden' },
  dragao_tirano:{ nome:'Tyrant Dragon', elemento:'Tyrant' },
  dragao_fada:{ nome:'Fairy Dragon', elemento:'Fairy' },
});

function captureObtencao(id, nome) {
  const captura = getDragonCapture(id);
  if (!captura) {
    return {
      tipo:'captura',
      resumo:`${nome} precisa ser capturado. O item de captura ainda não foi cadastrado.`,
      fonte:null,
      captura:null,
      i18n:{ 'en-US': { resumo:`${DRAGON_I18N[id]?.nome || nome} must be captured. Its capture item has not been registered yet.` } },
    };
  }
  const itemEn = captura.item?.i18n?.['en-US']?.nome || captura.item.nome;
  const fieldEn = captura.campo?.i18n?.['en-US']?.nome || captura.campo.nome;
  return {
    tipo:'captura',
    resumo:`Reúna ${captura.quantidade} ${captura.item.nome} atacando ${captura.campo.nome} do Nv.${captura.nivelMin} ao Nv.${captura.nivelMax} para capturar este dragão.`,
    fonte:captureSource(captura),
    captura,
    i18n:{ 'en-US': { resumo:`Collect ${captura.quantidade} ${itemEn} by attacking ${fieldEn} Fields from Lv.${captura.nivelMin} to Lv.${captura.nivelMax} to capture this dragon.` } },
  };
}

function waterObtencao() {
  const captura = getDragonCapture('dragao_agua');
  const itemEn = captura?.item?.i18n?.['en-US']?.nome || captura?.item?.nome || 'Water Dragon Emblems';
  const fieldEn = captura?.campo?.i18n?.['en-US']?.nome || captura?.campo?.nome || 'Lake';
  return {
    tipo:'recompensa_ou_captura',
    dia:2,
    resumo:'Em contas novas ou ao entrar em um Realm novo elegível, o Dragão da Água pode ser recebido como recompensa de novo usuário. Contas antigas que não receberam essa recompensa podem capturá-lo reunindo 100 Emblemas do Dragão da Água em Lagos Nv.6–10.',
    fonte:captureSource(captura),
    captura,
    i18n:{ 'en-US': { resumo:`On new accounts or when entering an eligible new Realm, the Water Dragon may be received as a new-user reward. Older accounts that did not receive it can capture it by collecting 100 ${itemEn} in ${fieldEn} Fields from Lv.6–10.` } },
  };
}

const dragon = ({ id, nome, elemento, cor, obtencao, habilidades = [], niveis = [] }) => ({
  id,
  nome,
  elemento,
  cor,
  emoji: '🐉',
  emojiDragao: '🐉',
  imagem: `/assets/dragons/${id}.webp`,
  raridade: '',
  descricao: '',
  obtencao,
  habilidades,
  niveis,
  i18n:{ 'en-US': { nome:DRAGON_I18N[id]?.nome || nome, elemento:DRAGON_I18N[id]?.elemento || elemento } },
});

const HABILIDADES_GRANDE_DRAGAO = [
  {
    id: 'orbe_protecao',
    nome: 'Orbe de Proteção',
    tipo: 'batalha',
    descricao: 'Cria um escudo ao redor do Grande Dragão, diminuindo o dano recebido e refletindo ataques. Apenas na Batalha dos Dragões.',
  },
  {
    id: 'grande_inferno',
    nome: 'Grande Inferno',
    tipo: 'batalha',
    descricao: 'Fortalece tropas dracônicas em combate. Os valores exatos variam com a evolução da habilidade e serão cadastrados somente quando confirmados.',
  },
  {
    id: 'protecao',
    nome: 'Proteção',
    tipo: 'batalha',
    descricao: 'Limita o dano recebido pelo Grande Dragão a cada rodada. Os valores exatos variam com a evolução da habilidade.',
  },
  {
    id: 'disparo_fogo',
    nome: 'Disparo de Fogo',
    tipo: 'batalha',
    descricao: 'Habilidade ofensiva do Grande Dragão que atinge tropas inimigas. Os valores exatos por nível não são armazenados no guia.',
  },
  {
    id: 'fortaleza_inexpugnavel',
    nome: 'Fortaleza Inexpugnável',
    tipo: 'batalha',
    descricao: 'Habilidade defensiva do Grande Dragão com efeito de batalha e efeito em campo.',
  },
  {
    id: 'touro_vermelho',
    nome: 'Touro Vermelho',
    tipo: 'comum',
    descricao: 'Aumenta o Ataque do Dragão por 24 horas.',
  },
  {
    id: 'ossos_roxos',
    nome: 'Ossos Roxos',
    tipo: 'comum',
    descricao: 'Melhora a Defesa do Dragão por 24 horas.',
  },
  {
    id: 'transformar',
    nome: 'Transformar',
    tipo: 'comum',
    descricao: 'Permite alterar a forma visual do Dragão.',
  },
  {
    id: 'chamado_dragao',
    nome: 'Chamado do Dragão',
    tipo: 'comum',
    descricao: 'Aumenta temporariamente a população da primeira cidade.',
  },
];

const NIVEIS_GRANDE_DRAGAO = [
  {
    nivel: 1,
    vida: 0,
    defesa: 0,
    ataquePerto: 0,
    ataqueDistante: 0,
    alcance: 375,
    velocidade: 0,
    ataqueElemental: 0,
    impulsoElemental: 0,
    barreiraElemental: 0,
    bombardeioElemental: 0,
    confrontoElemental: 0,
    bloqueioElemental: 0,
    rupturaElemental: 0,
  },
  {
    // Snapshot confirmado pela tela de atributos do Nv.51.
    nivel: 51,
    vida: 20459996,
    defesa: 2169999,
    ataquePerto: 5424999,
    ataqueDistante: 5424999,
    alcance: 3500,
    velocidade: 1625,
    ataqueElemental: 569625,
    impulsoElemental: 1386,
    barreiraElemental: 1386,
    bombardeioElemental: 1260,
    confrontoElemental: 1260,
    bloqueioElemental: 1050,
    rupturaElemental: 1050,
  },
];

export const DRAGOES_SEED = [
  dragon({
    id: 'grande_dragao',
    nome: 'Grande Dragão',
    elemento: 'Principal',
    cor: '#B75A35',
    obtencao: {
      tipo: 'inicial',
      resumo: 'É o dragão principal da cidade e faz parte da progressão inicial da conta. Não precisa ser capturado.',
      fonte: null,
      i18n:{ 'en-US': { resumo:'It is the city’s main dragon and part of the account’s initial progression. It does not need to be captured.' } },
    },
    habilidades: HABILIDADES_GRANDE_DRAGAO,
    niveis: NIVEIS_GRANDE_DRAGAO,
  }),
  dragon({ id:'dragao_agua', nome:'Dragão da Água', elemento:'Água', cor:'#2F8DA8', obtencao:waterObtencao() }),
  dragon({ id:'dragao_beladona', nome:'Dragão Beladona', elemento:'Beladona', cor:'#6750A4', obtencao:captureObtencao('dragao_beladona','O Dragão Beladona') }),
  dragon({ id:'dragao_terra', nome:'Dragão da Terra', elemento:'Terra', cor:'#776548', obtencao:captureObtencao('dragao_terra','O Dragão da Terra') }),
  dragon({ id:'dragao_fogo', nome:'Dragão do Fogo', elemento:'Fogo', cor:'#C94B20', obtencao:captureObtencao('dragao_fogo','O Dragão do Fogo') }),
  dragon({ id:'dragao_toxico', nome:'Dragão Tóxico', elemento:'Tóxico', cor:'#704D8C', obtencao:captureObtencao('dragao_toxico','O Dragão Tóxico') }),
  dragon({ id:'dragao_gelo', nome:'Dragão do Gelo', elemento:'Gelo', cor:'#75AFC6', obtencao:captureObtencao('dragao_gelo','O Dragão do Gelo') }),
  dragon({ id:'dragao_espinha_negra', nome:'Dragão da Espinha Negra', elemento:'Espinha Negra', cor:'#463B52', obtencao:captureObtencao('dragao_espinha_negra','O Dragão da Espinha Negra') }),
  dragon({ id:'dragao_trovao', nome:'Dragão do Trovão', elemento:'Trovão', cor:'#718A9E', obtencao:captureObtencao('dragao_trovao','O Dragão do Trovão') }),
  dragon({ id:'dragao_celestial', nome:'Dragão Celestial', elemento:'Celestial', cor:'#60A87E', obtencao:captureObtencao('dragao_celestial','O Dragão Celestial') }),
  dragon({ id:'dragao_paradisiaco', nome:'Dragão Paradisíaco', elemento:'Paradisíaco', cor:'#8DA5A0', obtencao:captureObtencao('dragao_paradisiaco','O Dragão Paradisíaco') }),
  dragon({ id:'dragao_dourado', nome:'Dragão Dourado', elemento:'Dourado', cor:'#C79A23', obtencao:captureObtencao('dragao_dourado','O Dragão Dourado') }),
  dragon({ id:'dragao_tirano', nome:'Dragão Tirano', elemento:'Tirano', cor:'#745055', obtencao:captureObtencao('dragao_tirano','O Dragão Tirano') }),
  dragon({ id:'dragao_fada', nome:'Dragão Fada', elemento:'Fada', cor:'#61A9AC', obtencao:captureObtencao('dragao_fada','O Dragão Fada') }),
];
