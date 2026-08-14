const recursos = (stone, metals, wood, gold, food) => [
  { tipo:'stone',  valor:stone.valor,  exibicao:stone.exibicao,  exato:stone.exato ?? true },
  { tipo:'metals', valor:metals.valor, exibicao:metals.exibicao, exato:metals.exato ?? true },
  { tipo:'wood',   valor:wood.valor,   exibicao:wood.exibicao,   exato:wood.exato ?? true },
  { tipo:'gold',   valor:gold.valor,   exibicao:gold.exibicao,   exato:gold.exato ?? true },
  { tipo:'food',   valor:food.valor,   exibicao:food.exibicao,   exato:food.exato ?? false },
];

const tropa = (nome, quantidade) => ({ nome, quantidade });
const r = (valor, exibicao, exato = true) => ({ valor, exibicao, exato });


const ANTHROPUS_COMMUNITY_URL = 'https://dragonsofatlantis.fandom.com/wiki/Anthropus_Camps';

const LBM_TESTE = Object.freeze({
  1:{ arqueiros:60,   carregadores:147,  transportes:33,  met:1, med:1, wc:2 },
  2:{ arqueiros:320,  carregadores:600,  transportes:50,  met:1, med:1, wc:2 },
  3:{ arqueiros:600,  carregadores:1815, transportes:72,  met:4, med:4, wc:5 },
  4:{ arqueiros:2000, carregadores:2420, transportes:100, met:4, med:4, wc:5 },
});

function guiaArqueiros(nivel) {
  const cfg = LBM_TESTE[nivel];
  if (!cfg) return [];
  return [{
    codigo:'arqueiros-lbm',
    titulo:'Arqueiros (LBM)',
    resumo:'Configuração comunitária antiga usada como ponto inicial de teste no mobile. Use uma das opções de transporte, não as duas ao mesmo tempo.',
    status:'validacao',
    tropaPrincipal:'Arqueiros',
    quantidade:cfg.arqueiros,
    apoios:[
      { nome:'Carregadores', quantidade:cfg.carregadores, alternativa:'transporte', i18n:{ 'en-US':{ nome:'Porters' } } },
      { nome:'Transportes Blindados', quantidade:cfg.transportes, alternativa:'transporte', i18n:{ 'en-US':{ nome:'Armored Transports' } } },
    ],
    pesquisas:[
      { nome:'Metalurgia', nivel:cfg.met, i18n:{ 'en-US':{ nome:'Metallurgy' } } },
      { nome:'Medicina', nivel:cfg.med, i18n:{ 'en-US':{ nome:'Medicine' } } },
      { nome:'Calibração de Armas', nivel:cfg.wc, i18n:{ 'en-US':{ nome:'Weapons Calibration' } } },
    ],
    passos:[
      `Envie ${cfg.arqueiros} Arqueiros.`,
      `Escolha apenas um apoio: ${cfg.carregadores} Carregadores OU ${cfg.transportes} Transportes Blindados.`,
      'Confira as pesquisas mínimas antes de atacar.',
    ],
    observacoes:'Estratégia em validação no jogo mobile atual. General, bônus e outras diferenças de conta podem alterar o resultado; teste primeiro antes de tratar como sem perdas garantidas.',
    fonte:{ tipo:'comunidade', url:ANTHROPUS_COMMUNITY_URL, descricao:'Dragons of Atlantis Wiki — Anthropus Camps; valores Nv.1–4 escolhidos pelo usuário para teste no mobile.' },
    i18n:{ 'en-US':{
      titulo:'Longbowmen (LBM)',
      resumo:'Legacy community setup used as an initial mobile test. Use one transport option, not both at the same time.',
      passos:[
        `Send ${cfg.arqueiros} Longbowmen.`,
        `Choose only one support option: ${cfg.carregadores} Porters OR ${cfg.transportes} Armored Transports.`,
        'Check the minimum research levels before attacking.',
      ],
      observacoes:'Strategy under validation in the current mobile game. General, bonuses and account differences may change the result; test it before treating it as guaranteed zero-loss.',
    } },
  }];
}

/**
 * Dados confirmados a partir dos relatórios de batalha enviados em 14/08/2026.
 * As imagens não fazem parte do seed. Quando o jogo abrevia um valor de recurso,
 * `exibicao` preserva literalmente o que aparece no relatório e `exato=false`
 * evita tratar a normalização numérica como um valor oficial preciso.
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
  guiasAtaque:guiaArqueiros(item.nivel),
  recompensas:[],
  fonte:{ tipo:'screenshot', data:'2026-08-14', descricao:'Relatório de batalha do jogo', verificado:true },
}));



const campoRecompensa = (codigo, simbolo, nome = '', quantidade = null, nomeConfirmado = false, i18n = {}) => ({
  codigo, simbolo, nome, quantidade, nomeConfirmado, i18n,
});

const SAVANA_REWARDS = Object.freeze({
  R1: campoRecompensa('savana-r1', 'R1'),
  R2: campoRecompensa('savana-r2', 'R2'),
  R3: campoRecompensa('savana-r3', 'R3', 'Pedaço de carne bovina', 1, true, { 'en-US': { nome:'Piece of beef' } }),
  R4: campoRecompensa('savana-r4', 'R4'),
});

const savanaRewards = (nivel) => {
  if (nivel === 10) return [SAVANA_REWARDS.R1, SAVANA_REWARDS.R2, SAVANA_REWARDS.R3, SAVANA_REWARDS.R4];
  if (nivel >= 6) return [SAVANA_REWARDS.R1, SAVANA_REWARDS.R2, SAVANA_REWARDS.R3];
  return [SAVANA_REWARDS.R2];
};

const savana = (nivel, tropas, producaoHora) => ({
  slug:`campos-savana-${nivel}`,
  categoria:'campos',
  subtipo:'savana',
  nivel,
  ordem:nivel,
  nome:`Savana — Nv. ${nivel}`,
  ativo:true,
  tropas,
  recursos:[{ tipo:'food', valor:nivel * 1000, exibicao:nivel === 10 ? '10.0k' : `${nivel}.00k`, exato:true }],
  campo:{ recursoPrincipal:'food', producaoHora, producaoExibicao:`${producaoHora}/h` },
  recompensas:savanaRewards(nivel),
  i18n:{ 'en-US': { nome:`Savannah — Lv. ${nivel}` } },
  estrategia:{ publicada:false, titulo:'', resumo:'', passos:[], requisitos:[], observacoes:'', i18n:{} },
  guiasAtaque:[],
  fonte:{ tipo:'screenshot', data:'2026-08-14', descricao:'Tela do campo e relatório de batalha do jogo', verificado:true },
});

/**
 * Savana Nv. 1–10 confirmada pelos screenshots enviados em 14/08/2026.
 * A recompensa R3 é a única cujo nome foi aberto no jogo e, por isso, é a única
 * nomeada no seed. R1, R2 e R4 permanecem símbolos visuais até confirmação.
 */
export const SAVANA_SEED = [
  savana(1,[tropa('Canibal',50)],2750),
  savana(2,[tropa('Canibal',100),tropa('Fedor',50)],5500),
  savana(3,[tropa('Canibal',200),tropa('Fedor',100),tropa('Demônia',50)],8250),
  savana(4,[tropa('Canibal',500),tropa('Fedor',200),tropa('Demônia',100),tropa('Porreteiro',50)],11000),
  savana(5,[tropa('Canibal',1000),tropa('Fedor',500),tropa('Demônia',200),tropa('Porreteiro',100),tropa('Lançadores',50)],13750),
  savana(6,[tropa('Canibal',2000),tropa('Fedor',1000),tropa('Demônia',500),tropa('Porreteiro',200),tropa('Lançadores',100),tropa('Retalhador',50)],16500),
  savana(7,[tropa('Canibal',2000),tropa('Fedor',1000),tropa('Demônia',500),tropa('Porreteiro',200),tropa('Lançadores',100),tropa('Retalhador',50)],19250),
  savana(8,[tropa('Canibal',5000),tropa('Fedor',2000),tropa('Demônia',1000),tropa('Porreteiro',500),tropa('Lançadores',200),tropa('Retalhador',100),tropa('Chefes',50)],22000),
  savana(9,[tropa('Canibal',10000),tropa('Fedor',5000),tropa('Demônia',2000),tropa('Porreteiro',1000),tropa('Lançadores',500),tropa('Retalhador',200),tropa('Chefes',100),tropa('Sanguíneos',50)],24750),
  savana(10,[tropa('Canibal',20000),tropa('Fedor',10000),tropa('Demônia',5000),tropa('Porreteiro',2000),tropa('Lançadores',1000),tropa('Retalhador',500),tropa('Chefes',200),tropa('Sanguíneos',100),tropa('Raivoso',50)],27500),
];

export const CAMPO_SUBTIPOS = Object.freeze(['savana','montanha','morro','lago','floresta']);

export const CAMPANHA_CATEGORIAS = Object.freeze(['antropos','campos','zyrvorthian','grodz']);
