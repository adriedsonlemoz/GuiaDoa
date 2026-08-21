import { SAVANA_SEED } from './campos/savana.js';
import { LAGO_SEED } from './campos/lago.js';
import { FLORESTA_SEED } from './campos/floresta.js';
import { MONTANHA_SEED } from './campos/montanha.js';
import { MORRO_SEED } from './campos/morro.js';
import { buildAnthropusAttackGuides, enemyTroop } from './antropos/attackGuides.js';

export { SAVANA_SEED, LAGO_SEED, FLORESTA_SEED, MONTANHA_SEED, MORRO_SEED };

const recursos = (stone, metals, wood, gold, food) => [
  { tipo:'stone',  valor:stone.valor,  exibicao:stone.exibicao,  exato:stone.exato ?? true },
  { tipo:'metals', valor:metals.valor, exibicao:metals.exibicao, exato:metals.exato ?? true },
  { tipo:'wood',   valor:wood.valor,   exibicao:wood.exibicao,   exato:wood.exato ?? true },
  { tipo:'gold',   valor:gold.valor,   exibicao:gold.exibicao,   exato:gold.exato ?? true },
  { tipo:'food',   valor:food.valor,   exibicao:food.exibicao,   exato:food.exato ?? false },
];

const tropa = enemyTroop;
const r = (valor, exibicao, exato = true) => ({ valor, exibicao, exato });


const recompensaAntropos = (codigo, nome, imagem, nomeEn) => ({
  codigo,
  simbolo:'',
  nome,
  imagem,
  quantidade:null,
  nomeConfirmado:true,
  i18n:{ 'en-US': { nome:nomeEn } },
});

const ANTROPOS_REWARDS = Object.freeze({
  AMULETO_NEVOA: recompensaAntropos('amuleto-nevoa-malva', 'Amuleto da Névoa Malva', '/assets/items/anthropus/amuleto-nevoa-malva.webp', 'Mauve Mist Amulet'),
  PEDRA_NEVOA: recompensaAntropos('pedra-nevoa-malva', 'Pedra da Névoa Malva', '/assets/items/anthropus/pedra-nevoa-malva.webp', 'Mauve Mist Stone'),
  AMULETO_SOL: recompensaAntropos('amuleto-brilho-sol', 'Amuleto do Brilho do Sol', '/assets/items/anthropus/amuleto-brilho-sol.webp', 'Sun Radiance Amulet'),
  PEDRA_SOL: recompensaAntropos('pedra-brilho-sol', 'Pedra do Brilho do Sol', '/assets/items/anthropus/pedra-brilho-sol.webp', 'Sun Radiance Stone'),
  AMULETO_OCEANO: recompensaAntropos('amuleto-luz-oceano', 'Amuleto da Luz do Oceano', '/assets/items/anthropus/amuleto-luz-oceano.webp', 'Ocean Light Amulet'),
  PEDRA_OCEANO: recompensaAntropos('pedra-luz-oceano', 'Pedra da Luz do Oceano', '/assets/items/anthropus/pedra-luz-oceano.webp', 'Ocean Light Stone'),
  AMULETO_BOSQUE: recompensaAntropos('amuleto-florescer-bosque', 'Amuleto do Florescer do Bosque', '/assets/items/anthropus/amuleto-florescer-bosque.webp', 'Grove Bloom Amulet'),
  PEDRA_BOSQUE: recompensaAntropos('pedra-florescer-bosque', 'Pedra do Florescer do Bosque', '/assets/items/anthropus/pedra-florescer-bosque.webp', 'Grove Bloom Stone'),
  FAISCA_DOURADA: recompensaAntropos('pedra-faisca-dourada', 'Pedra da Faísca Dourada', '/assets/items/anthropus/pedra-faisca-dourada.webp', 'Golden Spark Stone'),
  OBSIDIANA: recompensaAntropos('obsidiana', 'Obsidiana', '/assets/items/anthropus/obsidiana.webp', 'Obsidian'),
  ESSENCIA_FURIA: recompensaAntropos('essencia-furia', 'Essência da Fúria', '/assets/items/anthropus/essencia-furia.webp', 'Essence of Fury'),
  LEMBRANCAS: recompensaAntropos('lembrancas-antigas', 'Lembranças Antigas', '/assets/items/anthropus/lembrancas-antigas.webp', 'Ancient Memories'),
});

const recompensasAntropos = (nivel) => ({
  1:[ANTROPOS_REWARDS.AMULETO_NEVOA, ANTROPOS_REWARDS.PEDRA_NEVOA, ANTROPOS_REWARDS.LEMBRANCAS],
  2:[ANTROPOS_REWARDS.PEDRA_NEVOA, ANTROPOS_REWARDS.LEMBRANCAS],
  3:[ANTROPOS_REWARDS.AMULETO_SOL, ANTROPOS_REWARDS.PEDRA_SOL, ANTROPOS_REWARDS.LEMBRANCAS],
  4:[ANTROPOS_REWARDS.PEDRA_SOL, ANTROPOS_REWARDS.LEMBRANCAS],
  5:[ANTROPOS_REWARDS.PEDRA_OCEANO, ANTROPOS_REWARDS.LEMBRANCAS],
  6:[ANTROPOS_REWARDS.AMULETO_OCEANO, ANTROPOS_REWARDS.PEDRA_OCEANO, ANTROPOS_REWARDS.LEMBRANCAS],
  7:[ANTROPOS_REWARDS.PEDRA_OCEANO, ANTROPOS_REWARDS.LEMBRANCAS],
  8:[ANTROPOS_REWARDS.PEDRA_BOSQUE, ANTROPOS_REWARDS.LEMBRANCAS],
  9:[ANTROPOS_REWARDS.AMULETO_BOSQUE, ANTROPOS_REWARDS.PEDRA_BOSQUE, ANTROPOS_REWARDS.LEMBRANCAS],
  10:[ANTROPOS_REWARDS.FAISCA_DOURADA, ANTROPOS_REWARDS.OBSIDIANA, ANTROPOS_REWARDS.ESSENCIA_FURIA, ANTROPOS_REWARDS.LEMBRANCAS],
}[nivel] || []);


/**
 * Dados confirmados a partir dos relatórios de batalha e telas de recompensa
 * enviados em 14/08/2026. Os screenshots completos não fazem parte do projeto:
 * somente recortes dos ícones dos itens foram preservados como assets locais.
 * Quando o jogo abrevia um valor de recurso, `exibicao` preserva literalmente
 * o que aparece no relatório e `exato=false` evita tratar a normalização
 * numérica como um valor oficial preciso.
 */
export const ANTROPOS_SEED = [
  {
    slug:'antropos-1', categoria:'antropos', nivel:1, ordem:1, nome:'Campo de Antropos — Nv. 1', ativo:true,
    tropas:[tropa('Pirralho',500),tropa('Canibal',500)],
    recursos:recursos(r(500,'500'),r(500,'500'),r(5000,'5.00k'),r(2500,'2.50k'),r(112000,'112k',false)),
  },
  {
    slug:'antropos-2', categoria:'antropos', nivel:2, ordem:2, nome:'Campo de Antropos — Nv. 2', ativo:true,
    tropas:[tropa('Pirralho',1000),tropa('Canibal',1000),tropa('Fedor',500),tropa('Demônia',500)],
    recursos:recursos(r(1000,'1.00k'),r(1000,'1.00k'),r(10000,'10.0k'),r(5000,'5.00k'),r(225000,'225k',false)),
  },
  {
    slug:'antropos-3', categoria:'antropos', nivel:3, ordem:3, nome:'Campo de Antropos — Nv. 3', ativo:true,
    tropas:[tropa('Pirralho',2000),tropa('Canibal',2000),tropa('Fedor',1000),tropa('Demônia',1000),tropa('Porreteiro',500)],
    recursos:recursos(r(1500,'1.50k'),r(1500,'1.50k'),r(15000,'15.0k'),r(7500,'7.50k'),r(337000,'337k',false)),
  },
  {
    slug:'antropos-4', categoria:'antropos', nivel:4, ordem:4, nome:'Campo de Antropos — Nv. 4', ativo:true,
    tropas:[tropa('Pirralho',5000),tropa('Canibal',5000),tropa('Fedor',2000),tropa('Demônia',2000),tropa('Porreteiro',1000),tropa('Lançadores',500)],
    recursos:recursos(r(2000,'2.00k'),r(2000,'2.00k'),r(20000,'20.0k'),r(10000,'10.0k'),r(450000,'450k',false)),
  },
  {
    slug:'antropos-5', categoria:'antropos', nivel:5, ordem:5, nome:'Campo de Antropos — Nv. 5', ativo:true,
    tropas:[tropa('Pirralho',10000),tropa('Canibal',10000),tropa('Fedor',5000),tropa('Demônia',5000),tropa('Porreteiro',2000),tropa('Lançadores',1000),tropa('Retalhador',500)],
    recursos:recursos(r(2500,'2.50k'),r(2500,'2.50k'),r(25000,'25.0k'),r(12500,'12.5k'),r(562000,'562k',false)),
  },
  {
    slug:'antropos-6', categoria:'antropos', nivel:6, ordem:6, nome:'Campo de Antropos — Nv. 6', ativo:true,
    tropas:[tropa('Pirralho',15000),tropa('Canibal',15000),tropa('Fedor',10000),tropa('Demônia',10000),tropa('Porreteiro',5000),tropa('Lançadores',2000),tropa('Retalhador',1000)],
    recursos:recursos(r(3000,'3.00k'),r(3000,'3.00k'),r(30000,'30.0k'),r(15000,'15.0k'),r(675000,'675k',false)),
  },
  {
    slug:'antropos-7', categoria:'antropos', nivel:7, ordem:7, nome:'Campo de Antropos — Nv. 7', ativo:true,
    tropas:[tropa('Pirralho',30000),tropa('Canibal',30000),tropa('Fedor',15000),tropa('Demônia',15000),tropa('Porreteiro',10000),tropa('Lançadores',5000),tropa('Retalhador',2000),tropa('Chefes',500)],
    recursos:recursos(r(3500,'3.50k'),r(3500,'3.50k'),r(35000,'35.0k'),r(17500,'17.5k'),r(787000,'787k',false)),
  },
  {
    slug:'antropos-8', categoria:'antropos', nivel:8, ordem:8, nome:'Campo de Antropos — Nv. 8', ativo:true,
    tropas:[tropa('Pirralho',60000),tropa('Canibal',60000),tropa('Fedor',30000),tropa('Demônia',30000),tropa('Porreteiro',15000),tropa('Lançadores',10000),tropa('Retalhador',5000),tropa('Chefes',1000)],
    recursos:recursos(r(4000,'4.00k'),r(4000,'4.00k'),r(40000,'40.0k'),r(20000,'20.0k'),r(900000,'900k',false)),
  },
  {
    slug:'antropos-9', categoria:'antropos', nivel:9, ordem:9, nome:'Campo de Antropos — Nv. 9', ativo:true,
    tropas:[tropa('Pirralho',120000),tropa('Canibal',120000),tropa('Fedor',60000),tropa('Demônia',60000),tropa('Porreteiro',30000),tropa('Lançadores',15000),tropa('Retalhador',10000),tropa('Chefes',2000),tropa('Sanguíneos',1000)],
    recursos:recursos(r(4500,'4.50k'),r(4500,'4.50k'),r(45000,'45.0k'),r(22500,'22.5k'),r(1010000,'1.01m',false)),
  },
  {
    slug:'antropos-10', categoria:'antropos', nivel:10, ordem:10, nome:'Campo de Antropos — Nv. 10', ativo:true,
    tropas:[tropa('Pirralho',250000),tropa('Canibal',250000),tropa('Fedor',120000),tropa('Demônia',120000),tropa('Porreteiro',60000),tropa('Lançadores',30000),tropa('Retalhador',15000),tropa('Chefes',4000),tropa('Sanguíneos',2000),tropa('Raivoso',1000)],
    recursos:recursos(r(5000,'5.00k'),r(5000,'5.00k'),r(50000,'50.0k'),r(25000,'25.0k'),r(1120000,'1.12m',false)),
  },
].map(item => ({
  ...item,
  i18n:{ 'en-US': { nome:`Anthropus Camp — Lv. ${item.nivel}` } },
  estrategia:{ publicada:false, titulo:'', resumo:'', passos:[], requisitos:[], observacoes:'', i18n:{} },
  guiasAtaque:buildAnthropusAttackGuides(item.nivel, item.recursos),
  recompensas:recompensasAntropos(item.nivel),
  fonte:{ tipo:'screenshot', data:'2026-08-14', descricao:'Relatório de batalha + tela de recompensas do jogo', verificado:true },
}));




export const CAMPO_SUBTIPOS = Object.freeze(['savana','montanha','morro','lago','floresta']);

export const CAMPANHA_CATEGORIAS = Object.freeze(['antropos','campos','zyrvorthian','grodz']);
