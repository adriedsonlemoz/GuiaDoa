// Catálogo canônico de dragões.
// A progressão é preenchida aos poucos: não inferimos níveis/atributos que não foram confirmados.
// Retratos abaixo foram recortados das capturas fornecidas pelo usuário.
import { getDragonCapture, captureSource } from './dragonCapture.js';
import { DRAGON_FEEDING_ITEMS } from './dragonFeeding.js';

const DRAGON_I18N = Object.freeze({
  grande_dragao:{ nome:'Great Dragon', elemento:'Main' },
  dragao_agua:{ nome:'Water Dragon', elemento:'Water' },
  dragao_beladona:{ nome:'Nightshade Dragon', elemento:'Nightshade' },
  dragao_terra:{ nome:'Earth Dragon', elemento:'Earth' },
  dragao_fogo:{ nome:'Fire Dragon', elemento:'Fire' },
  dragao_toxico:{ nome:'Toxic Dragon', elemento:'Toxic' },
  dragao_gelo:{ nome:'Frost Dragon', elemento:'Frost' },
  dragao_espinha_negra:{ nome:'Blackspine Dragon', elemento:'Blackspine' },
  dragao_trovao:{ nome:'Thunder Dragon', elemento:'Thunder' },
  dragao_celestial:{ nome:'Celestial Dragon', elemento:'Celestial' },
  dragao_paradisiaco:{ nome:'Paradise Dragon', elemento:'Paradise' },
  dragao_dourado:{ nome:'Golden Dragon', elemento:'Golden' },
  dragao_tirano:{ nome:'Tyrant Dragon', elemento:'Tyrant' },
  dragao_fada:{ nome:'Faerie Dragon', elemento:'Faerie' },
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

const dragon = ({ id, ordem, nome, elemento, cor, obtencao, habilidades = [], niveis = [] }) => ({
  id,
  ordem,
  nome,
  aliases:[DRAGON_I18N[id]?.nome].filter(Boolean),
  elemento,
  cor,
  emoji: '🐉',
  emojiDragao: '🐉',
  imagem: `/assets/dragons/${id}.webp`,
  raridade: '',
  descricao: '',
  obtencao,
  itensAlimentacao:DRAGON_FEEDING_ITEMS,
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
  { nivel:1, vida:0, defesa:0, ataquePerto:0, ataqueDistante:0, alcance:375, velocidade:0 },
  { nivel:2, vida:5000, defesa:0, ataquePerto:0, ataqueDistante:0, alcance:1400, velocidade:650 },
  { nivel:3, vida:9000, defesa:1000, ataquePerto:2500, ataqueDistante:2500, alcance:1400, velocidade:650 },
  { nivel:4, vida:18000, defesa:2000, ataquePerto:5000, ataqueDistante:5000, alcance:1400, velocidade:650 },
  { nivel:5, vida:25200, defesa:2800, ataquePerto:7000, ataqueDistante:7000, alcance:1400, velocidade:650 },
  { nivel:6, vida:36000, defesa:4000, ataquePerto:10000, ataqueDistante:10000, alcance:1400, velocidade:650 },
  { nivel:7, vida:59351, defesa:6594, ataquePerto:16486, ataqueDistante:16486, alcance:1400, velocidade:650 },
  { nivel:8, vida:82704, defesa:9189, ataquePerto:22973, ataqueDistante:22973, alcance:1400, velocidade:650 },
  { nivel:9, vida:108621, defesa:12069, ataquePerto:30172, ataqueDistante:30172, alcance:1400, velocidade:650 },
  { nivel:10, vida:134537, defesa:14948, ataquePerto:37371, ataqueDistante:37371, alcance:1400, velocidade:650 },
  { nivel:11, vida:162271, defesa:18030, ataquePerto:45075, ataqueDistante:45075, alcance:1400, velocidade:650 },
  { nivel:12, vida:190008, defesa:21112, ataquePerto:52780, ataqueDistante:52780, alcance:1400, velocidade:650 },
  { nivel:13, vida:219178, defesa:24353, ataquePerto:60882, ataqueDistante:60882, alcance:1400, velocidade:650 },
  { nivel:14, vida:248349, defesa:27594, ataquePerto:68985, ataqueDistante:68985, alcance:1400, velocidade:650 },
  { nivel:15, vida:278719, defesa:30968, ataquePerto:77421, ataqueDistante:77421, alcance:1400, velocidade:650 },
  { nivel:16, vida:309088, defesa:34343, ataquePerto:85857, ataqueDistante:85857, alcance:1400, velocidade:650 },
  { nivel:17, vida:340491, defesa:37832, ataquePerto:94580, ataqueDistante:94580, alcance:1400, velocidade:650 },
  { nivel:18, vida:371894, defesa:41321, ataquePerto:103303, ataqueDistante:103303, alcance:1400, velocidade:650 },
  { nivel:19, vida:404209, defesa:44912, ataquePerto:112280, ataqueDistante:112280, alcance:1400, velocidade:650 },
  { nivel:20, vida:436525, defesa:48502, ataquePerto:121256, ataqueDistante:121256, alcance:1400, velocidade:650 },
  { nivel:21, vida:611128, defesa:67903, ataquePerto:169758, ataqueDistante:169758, alcance:1470, velocidade:682 },
  { nivel:22, vida:672242, defesa:74693, ataquePerto:186734, ataqueDistante:186734, alcance:1540, velocidade:715 },
  { nivel:23, vida:739465, defesa:82162, ataquePerto:205407, ataqueDistante:205407, alcance:1610, velocidade:747 },
  { nivel:24, vida:813412, defesa:90379, ataquePerto:225948, ataqueDistante:225948, alcance:1680, velocidade:780 },
  { nivel:25, vida:894754, defesa:99417, ataquePerto:248543, ataqueDistante:248543, alcance:1750, velocidade:812 },
  { nivel:26, vida:984229, defesa:109358, ataquePerto:273397, ataqueDistante:273397, alcance:1820, velocidade:845 },
  { nivel:27, vida:1082653, defesa:120294, ataquePerto:300737, ataqueDistante:300737, alcance:1890, velocidade:877 },
  { nivel:28, vida:1190919, defesa:132324, ataquePerto:330811, ataqueDistante:330811, alcance:1960, velocidade:910 },
  { nivel:29, vida:1310011, defesa:145556, ataquePerto:363892, ataqueDistante:363892, alcance:2030, velocidade:942 },
  { nivel:30, vida:1834016, defesa:203779, ataquePerto:509449, ataqueDistante:509449, alcance:2100, velocidade:975 },
  { nivel:51, vida:20459996, defesa:2169999, ataquePerto:5424999, ataqueDistante:5424999, alcance:3500, velocidade:1625, ataqueElemental:569625, impulsoElemental:1386, barreiraElemental:1386, bombardeioElemental:1260, confrontoElemental:1260, bloqueioElemental:1050, rupturaElemental:1050 }
];

const NIVEIS_DRAGAO_AGUA = [
  { nivel:1, vida:0, defesa:0, ataquePerto:0, ataqueDistante:0, alcance:1800, velocidade:900 },
  { nivel:2, vida:3999, defesa:666, ataquePerto:1999, ataqueDistante:1999, alcance:1800, velocidade:900 },
  { nivel:3, vida:6000, defesa:1000, ataquePerto:3000, ataqueDistante:3000, alcance:1800, velocidade:900 },
  { nivel:4, vida:12000, defesa:2000, ataquePerto:6000, ataqueDistante:6000, alcance:1800, velocidade:900 },
  { nivel:5, vida:16800, defesa:2800, ataquePerto:8400, ataqueDistante:8400, alcance:1800, velocidade:900 },
  { nivel:6, vida:24000, defesa:4000, ataquePerto:12000, ataqueDistante:12000, alcance:1800, velocidade:900 },
  { nivel:7, vida:39567, defesa:6594, ataquePerto:19783, ataqueDistante:19783, alcance:1800, velocidade:900 },
  { nivel:8, vida:55136, defesa:9189, ataquePerto:27568, ataqueDistante:27568, alcance:1800, velocidade:900 },
  { nivel:9, vida:72414, defesa:12069, ataquePerto:36207, ataqueDistante:36207, alcance:1800, velocidade:900 },
  { nivel:10, vida:89691, defesa:14948, ataquePerto:44845, ataqueDistante:44845, alcance:1800, velocidade:900 },
  { nivel:11, vida:108181, defesa:18030, ataquePerto:54090, ataqueDistante:54090, alcance:1800, velocidade:900 },
  { nivel:12, vida:126672, defesa:21112, ataquePerto:63336, ataqueDistante:63336, alcance:1800, velocidade:900 },
  { nivel:13, vida:146119, defesa:24353, ataquePerto:73059, ataqueDistante:73059, alcance:1800, velocidade:900 },
  { nivel:14, vida:165566, defesa:27594, ataquePerto:82783, ataqueDistante:82783, alcance:1800, velocidade:900 },
  { nivel:15, vida:185812, defesa:30968, ataquePerto:92906, ataqueDistante:92906, alcance:1800, velocidade:900 },
  { nivel:16, vida:206059, defesa:34343, ataquePerto:103029, ataqueDistante:103029, alcance:1800, velocidade:900 },
  { nivel:17, vida:226994, defesa:37832, ataquePerto:113497, ataqueDistante:113497, alcance:1800, velocidade:900 },
  { nivel:18, vida:247929, defesa:41321, ataquePerto:123964, ataqueDistante:123964, alcance:1800, velocidade:900 },
  { nivel:19, vida:269473, defesa:44912, ataquePerto:134736, ataqueDistante:134736, alcance:1800, velocidade:900 },
  { nivel:20, vida:291016, defesa:48502, ataquePerto:145508, ataqueDistante:145508, alcance:1800, velocidade:900 },
  { nivel:21, vida:407422, defesa:67903, ataquePerto:203711, ataqueDistante:203711, alcance:1890, velocidade:945 },
  { nivel:22, vida:448164, defesa:74694, ataquePerto:224082, ataqueDistante:224082, alcance:1980, velocidade:990 },
  { nivel:23, vida:492980, defesa:82163, ataquePerto:246490, ataqueDistante:246490, alcance:2070, velocidade:1035 },
  { nivel:24, vida:542278, defesa:90379, ataquePerto:271139, ataqueDistante:271139, alcance:2160, velocidade:1080 },
  { nivel:25, vida:596506, defesa:99417, ataquePerto:298253, ataqueDistante:298253, alcance:2250, velocidade:1125 },
  { nivel:26, vida:656156, defesa:109359, ataquePerto:328078, ataqueDistante:328078, alcance:2340, velocidade:1170 },
  { nivel:27, vida:721772, defesa:120295, ataquePerto:360886, ataqueDistante:360886, alcance:2430, velocidade:1215 },
  { nivel:28, vida:793950, defesa:132325, ataquePerto:396975, ataqueDistante:396975, alcance:2520, velocidade:1260 },
  { nivel:29, vida:873346, defesa:145557, ataquePerto:436673, ataqueDistante:436673, alcance:2610, velocidade:1305 },
  { nivel:30, vida:1222684, defesa:203780, ataquePerto:611342, ataqueDistante:611342, alcance:2700, velocidade:1350 }
];

export const DRAGOES_SEED = [
  dragon({
    id:'grande_dragao', ordem:1, nome:'Grande Dragão', elemento:'Principal', cor:'#B75A35',
    obtencao:{ tipo:'inicial', resumo:'É o dragão principal da cidade e faz parte da progressão inicial da conta. Não precisa ser capturado.', fonte:null, i18n:{ 'en-US':{ resumo:'It is the city’s main dragon and part of the account’s initial progression. It does not need to be captured.' } } },
    habilidades:HABILIDADES_GRANDE_DRAGAO, niveis:NIVEIS_GRANDE_DRAGAO,
  }),
  dragon({ id:'dragao_agua', ordem:2, nome:'Dragão da Água', elemento:'Água', cor:'#2F8DA8', obtencao:waterObtencao(), niveis:NIVEIS_DRAGAO_AGUA }),
  dragon({ id:'dragao_fogo', ordem:3, nome:'Dragão do Fogo', elemento:'Fogo', cor:'#C94B20', obtencao:captureObtencao('dragao_fogo','O Dragão do Fogo') }),
  dragon({ id:'dragao_terra', ordem:4, nome:'Dragão da Terra', elemento:'Terra', cor:'#776548', obtencao:captureObtencao('dragao_terra','O Dragão da Terra') }),
  dragon({ id:'dragao_beladona', ordem:5, nome:'Dragão Beladona', elemento:'Beladona', cor:'#6750A4', obtencao:captureObtencao('dragao_beladona','O Dragão Beladona') }),
  dragon({ id:'dragao_toxico', ordem:6, nome:'Dragão Tóxico', elemento:'Tóxico', cor:'#704D8C', obtencao:captureObtencao('dragao_toxico','O Dragão Tóxico') }),
  dragon({ id:'dragao_espinha_negra', ordem:7, nome:'Dragão da Espinha Negra', elemento:'Espinha Negra', cor:'#463B52', obtencao:captureObtencao('dragao_espinha_negra','O Dragão da Espinha Negra') }),
  dragon({ id:'dragao_gelo', ordem:8, nome:'Dragão do Gelo', elemento:'Gelo', cor:'#75AFC6', obtencao:captureObtencao('dragao_gelo','O Dragão do Gelo') }),
  dragon({ id:'dragao_trovao', ordem:9, nome:'Dragão do Trovão', elemento:'Trovão', cor:'#718A9E', obtencao:captureObtencao('dragao_trovao','O Dragão do Trovão') }),
  dragon({ id:'dragao_celestial', ordem:10, nome:'Dragão Celestial', elemento:'Celestial', cor:'#60A87E', obtencao:captureObtencao('dragao_celestial','O Dragão Celestial') }),
  dragon({ id:'dragao_paradisiaco', ordem:11, nome:'Dragão Paradisíaco', elemento:'Paradisíaco', cor:'#8DA5A0', obtencao:captureObtencao('dragao_paradisiaco','O Dragão Paradisíaco') }),
  dragon({ id:'dragao_dourado', ordem:12, nome:'Dragão Dourado', elemento:'Dourado', cor:'#C79A23', obtencao:captureObtencao('dragao_dourado','O Dragão Dourado') }),
  dragon({ id:'dragao_tirano', ordem:13, nome:'Dragão Tirano', elemento:'Tirano', cor:'#745055', obtencao:captureObtencao('dragao_tirano','O Dragão Tirano') }),
  dragon({ id:'dragao_fada', ordem:14, nome:'Dragão Fada', elemento:'Fada', cor:'#61A9AC', obtencao:captureObtencao('dragao_fada','O Dragão Fada') }),
];
