const ANTHROPUS_COMMUNITY_URL = 'https://dragonsofatlantis.fandom.com/wiki/Anthropus_Camps';

export const ANTHROPUS_ATTACK_MARGIN = 0.20;

export const TROOP_CARRY_CAPACITY = Object.freeze({
  'Arqueiros': 25,
  'Lava Jaws (LJ)': 10,
  'Dragões de Ataque Rápido': 100,
  'Carregadores': 200,
  'Transportes Blindados': 5000,
});

const ENEMY_TROOP_EN = Object.freeze({
  'Pirralho':'Runt',
  'Canibal':'Cannibal',
  'Fedor':'Stench',
  'Demônia':'Demoness',
  'Porreteiro':'Clubber',
  'Lançadores':'Throwers',
  'Retalhador':'Slasher',
  'Chefes':'Chieftains',
  'Sanguíneos':'Bloodthirsty',
  'Raivoso':'Enraged',
});

export const enemyTroop = (nome, quantidade) => ({
  nome,
  quantidade,
  i18n:{ 'en-US': { nome:ENEMY_TROOP_EN[nome] || nome } },
});

const I18N_TROOPS = Object.freeze({
  'Arqueiros':'Longbowmen',
  'Carregadores':'Porters',
  'Transportes Blindados':'Armored Transports',
  'Dragões de Ataque Rápido':'Swift Strike Dragons',
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
const apoio = (nome, quantidade, alternativa = 'transporte') => ({ nome, quantidade, alternativa, i18n:enName(nome) });
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
  descricao:'Quantidades-base confirmadas pelo usuário no jogo mobile; o GUIA adiciona 20% de margem e calcula o transporte pelos recursos cadastrados.',
});

/** Quantidades-base confirmadas antes da margem de 20%. */
export const ANTHROPUS_BASE_ATTACKS = Object.freeze({
  lbm:Object.freeze({
    1:{ qty:60, met:1, med:1, wc:2 },
    2:{ qty:320, met:1, med:1, wc:2 },
    3:{ qty:600, met:4, med:4, wc:5 },
    4:{ qty:2000, met:4, med:4, wc:5 },
    5:{ qty:5000, met:6, med:4, wc:7 },
    6:{ qty:7000, met:7, med:7, wc:7 },
    7:{ qty:25000, met:7, med:7, wc:7 },
    8:{ qty:45000, met:6, med:6, wc:8 },
    9:{ qty:70000, met:8, med:6, wc:7 },
    10:{ qty:100000, met:9, med:7, wc:9 },
  }),
  lavaJaws:Object.freeze({
    1:{ qty:2 }, 2:{ qty:15 }, 3:{ qty:35 }, 4:{ qty:45 }, 5:{ qty:100 },
    6:{ qty:250 }, 7:{ qty:425 }, 8:{ qty:800 }, 9:{ qty:2000 }, 10:{ qty:3500 },
  }),
  ssd:Object.freeze({
    1:{ qty:120, met:2, med:3, drag:3 },
    2:{ qty:1800, met:5, med:3, drag:5 },
    3:{ qty:2500, met:5, med:4, drag:3 },
    4:{ qty:5000, met:5, med:4, drag:3 },
    5:{ qty:10000, met:5, med:4, drag:8 },
    6:{ qty:20000, met:5, med:6, drag:8 },
    7:{ qty:30000, met:5, med:6, drag:8 },
    8:{ qty:60000, met:7, med:7, drag:5 },
    9:{ qty:160000, met:10, med:10, drag:10, resultado:'possiveis_perdas' },
    // Nv.10 só possuía evidência combinada com Serpente Mefítica; não inventamos uma quantidade isolada.
    10:null,
  }),
});

export const withAttackMargin = quantidadeBase => Math.ceil(Number(quantidadeBase || 0) * (1 + ANTHROPUS_ATTACK_MARGIN));

export const totalResourceValue = recursos => (Array.isArray(recursos) ? recursos : [])
  .reduce((sum, item) => sum + Math.max(0, Number(item?.valor || 0)), 0);

export function calculateTransportSupport({ recursos, tropaPrincipal, quantidade }) {
  const total = totalResourceValue(recursos);
  const capacidadeUnitaria = TROOP_CARRY_CAPACITY[tropaPrincipal] || 0;
  const capacidadePrincipal = Math.max(0, Number(quantidade || 0)) * capacidadeUnitaria;
  const restante = Math.max(0, total - capacidadePrincipal);
  if (!restante) return { totalRecursos:total, capacidadePrincipal, restante:0, apoios:[] };

  const blindados = Math.ceil(restante / TROOP_CARRY_CAPACITY['Transportes Blindados']);
  const carregadores = Math.ceil(restante / TROOP_CARRY_CAPACITY['Carregadores']);
  return {
    totalRecursos:total,
    capacidadePrincipal,
    restante,
    apoios:[
      apoio('Transportes Blindados', blindados),
      apoio('Carregadores', carregadores),
    ],
  };
}

const fmt = (value, locale) => new Intl.NumberFormat(locale).format(Number(value || 0));

function baseGuide({ codigo, titulo, titleEn, tropaPrincipal, quantidade, cfg = {}, recursos = [], resultado = 'sem_perdas', observacoes = '', notesEn = '' }) {
  const transport = quantidade == null
    ? { totalRecursos:totalResourceValue(recursos), capacidadePrincipal:0, restante:0, apoios:[] }
    : calculateTransportSupport({ recursos, tropaPrincipal, quantidade });
  const troopEn = I18N_TROOPS[tropaPrincipal] || tropaPrincipal;
  const baseQty = cfg?.qty ?? null;
  const ptTransport = transport.apoios.length
    ? `Para carregar todos os recursos cadastrados, escolha ${fmt(transport.apoios[0].quantidade, 'pt-BR')} Transportes Blindados OU ${fmt(transport.apoios[1].quantidade, 'pt-BR')} Carregadores.`
    : 'A capacidade de carga da tropa principal já cobre os recursos cadastrados; não é necessário adicionar transporte.';
  const enTransport = transport.apoios.length
    ? `To carry all stored resources, choose ${fmt(transport.apoios[0].quantidade, 'en-US')} Armored Transports OR ${fmt(transport.apoios[1].quantidade, 'en-US')} Porters.`
    : 'The main troop carry capacity already covers the stored resources; no transport support is required.';

  const passos = quantidade == null
    ? ['A quantidade isolada desta tropa ainda não foi confirmada para este nível.']
    : [
        `Envie ${fmt(quantidade, 'pt-BR')} ${tropaPrincipal}.`,
        `A quantidade-base confirmada é ${fmt(baseQty, 'pt-BR')}; o GUIA acrescenta 20% de margem de segurança.`,
        ptTransport,
      ];
  const stepsEn = quantidade == null
    ? ['A standalone amount for this troop has not yet been confirmed for this level.']
    : [
        `Send ${fmt(quantidade, 'en-US')} ${troopEn}.`,
        `The confirmed base amount is ${fmt(baseQty, 'en-US')}; GUIA adds a 20% safety margin.`,
        enTransport,
      ];

  return {
    codigo,
    titulo,
    resumo:quantidade == null
      ? 'Método mantido visível porque pertence às três opções oficiais do GUIA, mas sem inventar uma configuração isolada.'
      : 'Recomendação baseada na configuração confirmada, com 20% de margem na tropa principal e transporte calculado pelos recursos deste nível.',
    status:'confirmado',
    resultado:quantidade == null ? 'incompleto' : resultado,
    tropaPrincipal,
    quantidade,
    apoios:transport.apoios,
    pesquisas:pesquisasPadrao(cfg),
    complemento:'',
    passos,
    observacoes:observacoes || 'Não combine esta tropa com outra tropa ofensiva. Carregadores e Transportes Blindados, quando exibidos, entram somente para transporte de recursos.',
    fonte:COMMUNITY_SOURCE,
    i18n:{ 'en-US':{
      titulo:titleEn,
      resumo:quantidade == null
        ? 'This method remains visible because it is one of GUIA’s three official options, but no standalone setup is invented.'
        : 'Recommendation based on the confirmed setup, with a 20% main-troop margin and transport calculated from this level’s resources.',
      tropaPrincipal:troopEn,
      complemento:'',
      passos:stepsEn,
      observacoes:notesEn || 'Do not combine this troop with another offensive troop. Porters and Armored Transports, when shown, are used only to carry resources.',
    } },
  };
}

function lbmGuide(nivel, recursos) {
  const cfg = ANTHROPUS_BASE_ATTACKS.lbm[nivel];
  if (!cfg) return null;
  return baseGuide({
    codigo:'arqueiros-lbm',
    titulo:'Arqueiros (LBM)',
    titleEn:'Longbowmen (LBM)',
    tropaPrincipal:'Arqueiros',
    quantidade:withAttackMargin(cfg.qty),
    cfg,
    recursos,
  });
}

function lavaJawsGuide(nivel, recursos) {
  const cfg = ANTHROPUS_BASE_ATTACKS.lavaJaws[nivel];
  if (!cfg) return null;
  return baseGuide({
    codigo:'lava-jaws-lj8',
    titulo:'Lava Jaws / Magmassauros (LJ)',
    titleEn:'Lava Jaws (LJ)',
    tropaPrincipal:'Lava Jaws (LJ)',
    quantidade:withAttackMargin(cfg.qty),
    cfg,
    recursos,
    observacoes:'Não combine Lava Jaws com outra tropa ofensiva. A referência original recomenda pesquisas de combate altas (9–10), mas não detalha a combinação exata; o GUIA não inventa esse requisito.',
    notesEn:'Do not combine Lava Jaws with another offensive troop. The original reference recommends high combat research (9–10) but does not specify the exact mix; GUIA does not invent that requirement.',
  });
}

function ssdGuide(nivel, recursos) {
  const cfg = ANTHROPUS_BASE_ATTACKS.ssd[nivel];
  if (!cfg) {
    if (Number(nivel) !== 10) return null;
    return baseGuide({
      codigo:'dragoes-ataque-rapido-ssd',
      titulo:'Dragões de Ataque Rápido (SSD)',
      titleEn:'Swift Strike Dragons (SSD)',
      tropaPrincipal:'Dragões de Ataque Rápido',
      quantidade:null,
      cfg:{},
      recursos,
      observacoes:'No Nv.10, a evidência anterior usa SSD combinado com Serpente Mefítica. Como combinações ofensivas foram removidas, a quantidade de SSD sozinho permanece não confirmada.',
      notesEn:'At Lv.10, the previous evidence uses SSD combined with a Mephitic Serpent. Since offensive combinations were removed, the standalone SSD amount remains unconfirmed.',
    });
  }
  return baseGuide({
    codigo:'dragoes-ataque-rapido-ssd',
    titulo:'Dragões de Ataque Rápido (SSD)',
    titleEn:'Swift Strike Dragons (SSD)',
    tropaPrincipal:'Dragões de Ataque Rápido',
    quantidade:withAttackMargin(cfg.qty),
    cfg,
    recursos,
    resultado:cfg.resultado || 'sem_perdas',
    observacoes:cfg.resultado === 'possiveis_perdas'
      ? 'A referência do Nv.9 alerta para possíveis perdas mesmo na configuração-base. O +20% é margem, não transforma esta marcha em garantia de perdas zero.'
      : 'Não combine SSD com outra tropa ofensiva. Transportes, quando necessários, servem apenas para carregar recursos.',
    notesEn:cfg.resultado === 'possiveis_perdas'
      ? 'The Lv.9 reference warns about possible losses even with the base setup. The +20% margin does not turn this into a guaranteed zero-loss march.'
      : 'Do not combine SSD with another offensive troop. Transport support, when needed, is only for carrying resources.',
  });
}

export function buildAnthropusAttackGuides(nivel, recursos = []) {
  return [
    lbmGuide(nivel, recursos),
    lavaJawsGuide(nivel, recursos),
    ssdGuide(nivel, recursos),
  ].filter(Boolean);
}
