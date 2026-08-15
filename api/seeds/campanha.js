const recursos = (stone, metals, wood, gold, food) => [
  { tipo:'stone',  valor:stone.valor,  exibicao:stone.exibicao,  exato:stone.exato ?? true },
  { tipo:'metals', valor:metals.valor, exibicao:metals.exibicao, exato:metals.exato ?? true },
  { tipo:'wood',   valor:wood.valor,   exibicao:wood.exibicao,   exato:wood.exato ?? true },
  { tipo:'gold',   valor:gold.valor,   exibicao:gold.exibicao,   exato:gold.exato ?? true },
  { tipo:'food',   valor:food.valor,   exibicao:food.exibicao,   exato:food.exato ?? false },
];

const tropa = (nome, quantidade) => ({ nome, quantidade });
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


const ANTHROPUS_COMMUNITY_URL = 'https://dragonsofatlantis.fandom.com/wiki/Anthropus_Camps';

const I18N_TROOPS = Object.freeze({
  'Arqueiros':'Longbowmen',
  'Carregadores':'Porters',
  'Transportes Blindados':'Armored Transports',
  'Dragões de Ataque Rápido':'Swift Strike Dragons',
  'Dragões de Combate':'Battle Dragons',
  'Grande Dragão / Dragão Elemental (GD/ED)':'Great Dragon / Elemental Dragon (GD/ED)',
  'Serpente Mefítica':'Mephitic Serpent',
  'Dragão do Gelo':'Frost Dragon',
  'Fangtooth (FT)':'Fangtooth (FT)',
  'Lava Jaws (LJ)':'Lava Jaws (LJ)',
});
const I18N_RESEARCH = Object.freeze({
  'Metalurgia':'Metallurgy',
  'Medicina':'Medicine',
  'Calibração de Armas':'Weapons Calibration',
  'Dragoria':'Dragonry',
});
const enName = nome => ({ 'en-US': { nome:I18N_TROOPS[nome] || nome } });
const enResearch = nome => ({ 'en-US': { nome:I18N_RESEARCH[nome] || nome } });
const apoio = (nome, quantidade, alternativa = '') => ({ nome, quantidade, alternativa, i18n:enName(nome) });
const pesquisaGuia = (nome, nivel) => ({ nome, nivel, i18n:enResearch(nome) });
const pesquisasPadrao = ({ met, med, wc, drag } = {}) => [
  met != null ? pesquisaGuia('Metalurgia', met) : null,
  med != null ? pesquisaGuia('Medicina', med) : null,
  wc != null ? pesquisaGuia('Calibração de Armas', wc) : null,
  drag != null ? pesquisaGuia('Dragoria', drag) : null,
].filter(Boolean);

const COMMUNITY_SOURCE = Object.freeze({
  tipo:'usuario+comunidade',
  url:ANTHROPUS_COMMUNITY_URL,
  descricao:'Valores confirmados pelo usuário no jogo mobile; referência histórica: Dragons of Atlantis Wiki — Anthropus Camps.',
});

const LBM = Object.freeze({
  1:{ qty:60, porter:147, at:33, met:1, med:1, wc:2 },
  2:{ qty:320, porter:600, at:50, met:1, med:1, wc:2 },
  3:{ qty:600, porter:1815, at:72, met:4, med:4, wc:5 },
  4:{ qty:2000, porter:2420, at:100, met:4, med:4, wc:5 },
  5:{ qty:5000, at:100, met:6, med:4, wc:7 },
  6:{ qty:7000, at:200, met:7, med:7, wc:7 },
  7:{ qty:25000, at:225, met:7, med:7, wc:7 },
  8:{ qty:45000, at:1000, met:6, med:6, wc:8 },
  9:{ qty:70000, at:2000, met:8, med:6, wc:7 },
  10:{ qty:100000, at:1000, met:9, med:7, wc:9 },
});

const LBM_DRAGON = Object.freeze({
  5:[{ qty:4000, at:200, met:4, med:6, wc:4, companion:'Grande Dragão / Dragão Elemental (GD/ED) Nv. 9 ou 10', companionEn:'Great Dragon / Elemental Dragon (GD/ED), Lv. 9 or 10' }],
  6:[{ qty:10000, at:200, met:6, med:5, wc:5, companion:'Grande Dragão / Dragão Elemental (GD/ED) Nv. 9 ou 10', companionEn:'Great Dragon / Elemental Dragon (GD/ED), Lv. 9 or 10' }],
  7:[{ qty:12000, at:500, met:6, med:5, wc:7, companion:'Grande Dragão / Dragão Elemental (GD/ED) Nv. 9 ou 10', companionEn:'Great Dragon / Elemental Dragon (GD/ED), Lv. 9 or 10' }],
  8:[{ qty:40000, at:700, met:8, med:6, wc:7, companion:'Grande Dragão / Dragão Elemental (GD/ED) Nv. 9 ou 10', companionEn:'Great Dragon / Elemental Dragon (GD/ED), Lv. 9 or 10' }],
  9:[
    { qty:65000, at:2000, met:7, med:6, wc:8, companion:'Grande Dragão / Dragão Elemental (GD/ED) Nv. 9 ou 10', companionEn:'Great Dragon / Elemental Dragon (GD/ED), Lv. 9 or 10' },
    { qty:38000, at:3500, met:9, med:9, wc:10, companion:'Grande Dragão / Dragão Elemental (GD/ED) Nv. 9 ou 10', companionEn:'Great Dragon / Elemental Dragon (GD/ED), Lv. 9 or 10' },
  ],
  10:[{ qty:89999, at:10000, met:9, med:7, wc:8, companion:'Dragão do Gelo Nv. 9', companionEn:'Frost Dragon Lv. 9' }],
});

const SSD = Object.freeze({
  1:[{ qty:120, met:2, med:3, drag:3 }],
  2:[{ qty:1800, met:5, med:3, drag:5 }],
  3:[{ qty:2500, met:5, med:4, drag:3 }],
  4:[{ qty:5000, met:5, med:4, drag:3 }],
  5:[{ qty:10000, met:5, med:4, drag:8 }],
  6:[{ qty:20000, met:5, med:6, drag:8 }],
  7:[{ qty:30000, met:5, med:6, drag:8 }],
  8:[{ qty:60000, met:7, med:7, drag:5 }],
  9:[
    { qty:160000, met:10, med:10, drag:10, resultado:'possiveis_perdas' },
    { qty:100000, met:8, med:7, drag:6, companion:'Serpente Mefítica', companionEn:'Mephitic Serpent', resultado:'possiveis_perdas' },
  ],
  10:[{ qty:200000, met:10, med:10, drag:9, companion:'Serpente Mefítica', companionEn:'Mephitic Serpent' }],
});

const BD = Object.freeze({
  1:{ qty:50, met:2, med:3, drag:3 },
  2:{ qty:900, met:7, med:8, drag:5 },
  3:{ qty:1000, met:6, med:5, drag:5 },
  4:{ qty:3200, met:3, med:5, drag:3 },
  5:{ qty:6000, met:7, med:7, drag:8 },
  6:{ qty:10000, met:7, med:7, drag:8 },
  7:{ qty:15000, met:8, med:8, drag:8 },
  8:{ qty:30000, met:8, med:8, drag:8 },
  9:{ qty:60000, met:8, med:8, drag:8 },
  10:{ qty:110000, met:10, med:10, drag:10 },
});
const BD_SERPENT = Object.freeze({
  5:{ qty:4600 }, 6:{ qty:8000 }, 7:{ qty:10000 }, 8:{ qty:24000 },
  9:{ qty:50000, met:9, med:7, drag:8, companion:'Serpente Mefítica Nv. 8', companionEn:'Mephitic Serpent Lv. 8' },
  10:{ qty:90000, met:10, med:10, drag:10, companion:'Serpente Mefítica Nv. 9', companionEn:'Mephitic Serpent Lv. 9' },
});

const FT = Object.freeze({
  1:{ qty:15, lbm:1, met:9, med:8, wc:8 },
  2:{ qty:25, lbm:1, met:9, med:8, wc:8 },
  3:{ qty:50, lbm:1, met:9, med:8, wc:8 },
  4:{ qty:null, lbm:1, met:7, med:7, wc:7, resultado:'incompleto' },
  5:{ qty:750, lbm:1, met:9, med:8, wc:8 },
  6:{ qty:1000, lbm:2000, met:9, med:8, wc:8 },
  7:{ qty:2000, lbm:2000, met:9, med:9, wc:9 },
  8:{ qty:11000, lbm:1000, met:8, med:9, wc:9 },
  9:{ qty:20000, lbm:1000, met:9, med:9, wc:9 },
  10:{ qty:24000, lbm:100, met:10, med:10, wc:10 },
});

const LJ = Object.freeze({
  1:{ qty:2, at:50 }, 2:{ qty:15, at:50 }, 3:{ qty:35, at:100 }, 4:{ qty:45, at:100 },
  5:{ qty:100, at:150 }, 6:{ qty:250, at:150 }, 7:{ qty:425, at:200 }, 8:{ qty:800, at:225 },
  9:{ qty:2000, at:225 }, 10:{ qty:3500, at:1000 },
});

function baseGuide({ codigo, titulo, titleEn, tropaPrincipal, troopEn, quantidade, apoios = [], pesquisas = [], complemento = '', complementoEn = '', observacoes = '', notesEn = '', resultado = 'sem_perdas', passos = [], stepsEn = [] }) {
  return {
    codigo,
    titulo,
    resumo:'Configuração confirmada pelo usuário no jogo mobile e mantida como referência prática no GUIA DOA.',
    status:'confirmado',
    resultado,
    tropaPrincipal,
    quantidade,
    apoios,
    pesquisas,
    complemento,
    passos,
    observacoes,
    fonte:COMMUNITY_SOURCE,
    i18n:{ 'en-US':{
      titulo:titleEn,
      resumo:'Setup confirmed by the user in the mobile game and kept as a practical GUIA DOA reference.',
      tropaPrincipal:troopEn || I18N_TROOPS[tropaPrincipal] || tropaPrincipal,
      complemento:complementoEn || complemento,
      passos:stepsEn,
      observacoes:notesEn || observacoes,
    } },
  };
}

function guiaLbm(nivel) {
  const cfg = LBM[nivel];
  if (!cfg) return [];
  const supports = [];
  if (cfg.porter != null) supports.push(apoio('Carregadores', cfg.porter, 'transporte'));
  supports.push(apoio('Transportes Blindados', cfg.at, 'transporte'));
  const hasChoice = cfg.porter != null;
  return [baseGuide({
    codigo:'arqueiros-lbm', titulo:'Arqueiros (LBM)', titleEn:'Longbowmen (LBM)', tropaPrincipal:'Arqueiros', quantidade:cfg.qty,
    apoios:supports, pesquisas:pesquisasPadrao(cfg),
    passos:[
      `Envie ${cfg.qty} Arqueiros (LBM).`,
      hasChoice ? `Use ${cfg.porter} Carregadores OU ${cfg.at} Transportes Blindados; não use os dois juntos.` : `Use ${cfg.at} Transportes Blindados.`,
      'Se optar por Transportes Blindados, até 10% a mais pode ser usado como margem extra de segurança.',
    ],
    stepsEn:[
      `Send ${cfg.qty} Longbowmen (LBM).`,
      hasChoice ? `Use ${cfg.porter} Porters OR ${cfg.at} Armored Transports; do not use both together.` : `Use ${cfg.at} Armored Transports.`,
      'If using Armored Transports, up to 10% extra may be added as an additional safety margin.',
    ],
    observacoes:'Evite misturar tropas de ataque à distância com tropas rápidas de combate corpo a corpo na mesma marcha; essa combinação pode causar perdas nas tropas rápidas. A referência histórica também alerta para RNG e interação com o Dragão do Vento em marchas de LBM.',
    notesEn:'Avoid mixing ranged troops with fast melee troops in the same march; that combination can cause losses among the speed troops. The historical reference also warns about RNG and Wind Dragon interaction in LBM marches.',
  })];
}

function guiasLbmDragao(nivel) {
  const configs = LBM_DRAGON[nivel] || [];
  return configs.map((cfg, index) => baseGuide({
    codigo:index ? `arqueiros-lbm-dragao-alt-${index + 1}` : 'arqueiros-lbm-dragao',
    titulo:index ? 'Arqueiros (LBM) + Dragão — alternativa' : 'Arqueiros (LBM) + Dragão',
    titleEn:index ? 'Longbowmen (LBM) + Dragon — alternative' : 'Longbowmen (LBM) + Dragon',
    tropaPrincipal:'Arqueiros', quantidade:cfg.qty,
    apoios:[apoio('Transportes Blindados', cfg.at, 'transporte')], pesquisas:pesquisasPadrao(cfg),
    complemento:cfg.companion, complementoEn:cfg.companionEn,
    passos:[`Envie ${cfg.qty} Arqueiros + ${cfg.at} Transportes Blindados.`, `Inclua ${cfg.companion}.`],
    stepsEn:[`Send ${cfg.qty} Longbowmen + ${cfg.at} Armored Transports.`, `Include ${cfg.companionEn}.`],
    observacoes:'Método alternativo com dragão. Evite combinar esta marcha à distância com SSD/BD/Banshees na mesma batalha. A referência histórica alerta para RNG e Dragão do Vento em LBM.',
    notesEn:'Alternative dragon method. Avoid combining this ranged march with SSD/BD/Banshees in the same battle. The historical reference warns about RNG and Wind Dragon interaction with LBM.',
  }));
}

function guiasSsd(nivel) {
  return (SSD[nivel] || []).map((cfg, index) => baseGuide({
    codigo:index ? `dragoes-ataque-rapido-ssd-alt-${index + 1}` : 'dragoes-ataque-rapido-ssd',
    titulo:index ? 'Dragões de Ataque Rápido (SSD) + Serpente' : 'Dragões de Ataque Rápido (SSD)',
    titleEn:index ? 'Swift Strike Dragons (SSD) + Serpent' : 'Swift Strike Dragons (SSD)',
    tropaPrincipal:'Dragões de Ataque Rápido', quantidade:cfg.qty,
    pesquisas:pesquisasPadrao(cfg), complemento:cfg.companion || '', complementoEn:cfg.companionEn || '',
    resultado:cfg.resultado || 'sem_perdas',
    passos:[`Envie ${cfg.qty} Dragões de Ataque Rápido (SSD).`, ...(cfg.companion ? [`Inclua ${cfg.companion}.`] : [])],
    stepsEn:[`Send ${cfg.qty} Swift Strike Dragons (SSD).`, ...(cfg.companionEn ? [`Include ${cfg.companionEn}.`] : [])],
    observacoes:cfg.resultado === 'possiveis_perdas' ? 'A própria referência alerta para possíveis perdas neste nível; não trate como marcha de perdas zero.' : 'Não combine SSD com tropas de ataque à distância na mesma marcha.',
    notesEn:cfg.resultado === 'possiveis_perdas' ? 'The reference itself warns about possible losses at this level; do not treat this as a zero-loss march.' : 'Do not combine SSD with ranged troops in the same march.',
  }));
}

function guiasBd(nivel) {
  const cfg = BD[nivel];
  if (!cfg) return [];
  const guides = [baseGuide({
    codigo:'dragoes-combate-bd', titulo:'Dragões de Combate (BD)', titleEn:'Battle Dragons (BD)',
    tropaPrincipal:'Dragões de Combate', quantidade:cfg.qty, pesquisas:pesquisasPadrao(cfg),
    passos:[`Envie ${cfg.qty} Dragões de Combate (BD).`], stepsEn:[`Send ${cfg.qty} Battle Dragons (BD).`],
    observacoes:'Não combine BD com tropas de ataque à distância na mesma marcha.', notesEn:'Do not combine BD with ranged troops in the same march.',
  })];
  const serpent = BD_SERPENT[nivel];
  if (serpent) guides.push(baseGuide({
    codigo:'dragoes-combate-bd-serpente', titulo:'Dragões de Combate (BD) + Serpente', titleEn:'Battle Dragons (BD) + Serpent',
    tropaPrincipal:'Dragões de Combate', quantidade:serpent.qty, pesquisas:pesquisasPadrao(serpent),
    complemento:serpent.companion || 'Serpente Mefítica Nv. 9 ou 10', complementoEn:serpent.companionEn || 'Mephitic Serpent Lv. 9 or 10',
    passos:[`Envie ${serpent.qty} Dragões de Combate (BD).`, `Inclua ${serpent.companion || 'Serpente Mefítica Nv. 9 ou 10'}.`],
    stepsEn:[`Send ${serpent.qty} Battle Dragons (BD).`, `Include ${serpent.companionEn || 'Mephitic Serpent Lv. 9 or 10'}.`],
  }));
  return guides;
}

function guiasFt(nivel) {
  const cfg = FT[nivel];
  if (!cfg) return [];
  const incomplete = cfg.resultado === 'incompleto';
  return [baseGuide({
    codigo:'fangtooth-ft', titulo:'Fangtooth (FT) + Arqueiros', titleEn:'Fangtooth (FT) + Longbowmen',
    tropaPrincipal:'Fangtooth (FT)', quantidade:cfg.qty,
    apoios:[apoio('Arqueiros', cfg.lbm, 'alcance')], pesquisas:pesquisasPadrao(cfg), resultado:cfg.resultado || 'sem_perdas',
    passos:[incomplete ? 'A quantidade de Fangtooth não foi informada para este nível na tabela fornecida.' : `Envie ${cfg.qty} Fangtooth (FT).`, `Inclua ${cfg.lbm} Arqueiro(s) para estender o campo de batalha.`],
    stepsEn:[incomplete ? 'The Fangtooth amount was not provided for this level in the supplied table.' : `Send ${cfg.qty} Fangtooth (FT).`, `Include ${cfg.lbm} Longbowmen to extend the battlefield.`],
    observacoes:'Dragões compatíveis na referência: Grande, Terra/Pedra, Fogo, Gelo e Helio. Incompatíveis: Água, Vento e Serpente. A quantidade do Nv.4 permanece pendente e não foi inventada.',
    notesEn:'Compatible dragons in the reference: Great, Stone, Fire, Frost and Helio. Incompatible: Water, Wind and Serpent. The Lv.4 FT amount remains pending and was not invented.',
  })];
}

function guiasLj(nivel) {
  const cfg = LJ[nivel];
  if (!cfg) return [];
  return [baseGuide({
    codigo:'lava-jaws-lj8', titulo:'Lava Jaws (LJ)', titleEn:'Lava Jaws (LJ)',
    tropaPrincipal:'Lava Jaws (LJ)', quantidade:cfg.qty,
    apoios:[apoio('Transportes Blindados', cfg.at, 'transporte')],
    complemento:'GD/ED opcional', complementoEn:'Optional GD/ED',
    passos:[`Envie ${cfg.qty} Lava Jaws + ${cfg.at} Transportes Blindados.`, 'Grande Dragão ou Dragão Elemental pode ser adicionado com segurança segundo a referência.'],
    stepsEn:[`Send ${cfg.qty} Lava Jaws + ${cfg.at} Armored Transports.`, 'A Great Dragon or Elemental Dragon may be added safely according to the reference.'],
    observacoes:'A referência indica pesquisas relevantes nos níveis 9 ou 10, sem detalhar nesta tabela quais pesquisas correspondem a cada marcha. O GUIA não inventa esse detalhe.',
    notesEn:'The reference says relevant research should be level 9 or 10 but does not specify the exact research mix in this table. GUIA does not invent that detail.',
  })];
}

function guiasAntropos(nivel) {
  return [
    ...guiaLbm(nivel),
    ...guiasLbmDragao(nivel),
    ...guiasSsd(nivel),
    ...guiasBd(nivel),
    ...guiasFt(nivel),
    ...guiasLj(nivel),
  ];
}

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
  guiasAtaque:guiasAntropos(item.nivel),
  recompensas:recompensasAntropos(item.nivel),
  fonte:{ tipo:'screenshot', data:'2026-08-14', descricao:'Relatório de batalha + tela de recompensas do jogo', verificado:true },
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
