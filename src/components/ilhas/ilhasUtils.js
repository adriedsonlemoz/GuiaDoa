import {
  DEFAULT_EXPANSIONS,
  EXCLUDED_MAIN_BUILDINGS,
  FIELD_BONUS_PER_TERRITORY,
  ILHAS_NOMES,
  LEGACY_FIXED_MAIN,
  MAIN_RESOURCE_SLUGS,
  NORMAL_CORE,
  PLAN_STORAGE_KEY,
  REPEATABLE_BUILDINGS,
  SLOT_RULES,
  SPECIAL_RESOURCE_BY_ISLAND,
} from './constants.js';

export const fmtN = (n, locale = 'pt-BR') => Number(n || 0).toLocaleString(locale);
export const asNumber = value => Number.parseInt(value, 10) || 0;

export function buildEdificiosMap(edificios = []) {
  return Object.fromEntries(edificios.map(ed => [ed.slug, ed]));
}

export function levelsOf(dbEdificios, slug) {
  return Array.isArray(dbEdificios?.[slug]?.niveis) ? dbEdificios[slug].niveis : [];
}

export function findNivel(dbEdificios, slug, nivel) {
  const lista = levelsOf(dbEdificios, slug);
  return lista.find(item => Number(item.nivel) === Number(nivel)) || lista[0] || {};
}

export function maxKnownLevel(dbEdificios, slug, fallback = 1) {
  const nums = levelsOf(dbEdificios, slug).map(item => Number(item.nivel)).filter(Number.isFinite);
  return nums.length ? Math.max(...nums) : fallback;
}

export function firstKnownLevel(dbEdificios, slug) {
  const first = levelsOf(dbEdificios, slug).find(item => Number.isFinite(Number(item.nivel)));
  return Number(first?.nivel || 1);
}

export function limiteSitioPrincipal(dbEdificios, nivelFortaleza) {
  let limite = 11;
  const lista = levelsOf(dbEdificios, 'Fortaleza');
  for (let nivel = 1; nivel <= Number(nivelFortaleza || 1); nivel += 1) {
    const atual = lista.find(item => Number(item.nivel) === nivel);
    if (atual) limite += Number(atual.areas || 0);
  }
  return limite;
}

export function normalSlotLimit(ilha, expansions = DEFAULT_EXPANSIONS) {
  const rule = SLOT_RULES[ilha] || { normal: 0 };
  if (rule.normalExpanded && expansions[ilha]) return rule.normalExpanded;
  return rule.normal;
}

export function specialSlotLimit(ilha, expansions = DEFAULT_EXPANSIONS) {
  const rule = SPECIAL_RESOURCE_BY_ISLAND[ilha];
  if (!rule) return 0;
  return expansions[ilha] ? rule.expanded : rule.base;
}

export function limiteIlhaSecundaria(colIndex, expansoes) {
  const ilha = ILHAS_NOMES[colIndex];
  if (!ilha || ilha === 'PRINC') return null;
  return normalSlotLimit(ilha, expansoes);
}

export function emptyEntry(level = 1) {
  return { qty: 0, level };
}

export function createDefaultPlan(dbEdificios = {}) {
  const islands = {};
  ILHAS_NOMES.forEach(ilha => {
    const buildings = {};
    NORMAL_CORE.forEach(slug => { buildings[slug] = emptyEntry(firstKnownLevel(dbEdificios, slug)); });
    const resources = {};
    if (ilha === 'PRINC') {
      MAIN_RESOURCE_SLUGS.forEach(slug => { resources[slug] = emptyEntry(firstKnownLevel(dbEdificios, slug)); });
    } else {
      const special = SPECIAL_RESOURCE_BY_ISLAND[ilha];
      if (special) resources[special.slug] = emptyEntry(firstKnownLevel(dbEdificios, special.slug));
    }
    islands[ilha] = { buildings, resources };
  });
  return {
    schema: 6,
    selectedIsland: 'PRINC',
    fortressLevel: firstKnownLevel(dbEdificios, 'Fortaleza'),
    expansions: { ...DEFAULT_EXPANSIONS },
    focus: 'balanced',
    territories: { Fazenda: 0, Mina: 0, Pedra: 0, Serraria: 0 },
    islands,
  };
}

function legacyRowsMap(rows = []) {
  return Object.fromEntries(rows.map(row => [row.type, row]));
}

export function migrateLegacyPlan(dbEdificios = {}) {
  try {
    const existing = JSON.parse(localStorage.getItem(PLAN_STORAGE_KEY) || 'null');
    if (existing?.schema === 6) return existing;

    const rows = JSON.parse(localStorage.getItem('doa_islands_data_react_v5') || '[]');
    const levels = JSON.parse(localStorage.getItem('doa_islands_niveis_v5') || '{}');
    const expansions = JSON.parse(localStorage.getItem('doa_ilhas_expansoes') || 'null');
    const territories = JSON.parse(localStorage.getItem('doa_islands_territorios_v5') || 'null');
    const plan = createDefaultPlan(dbEdificios);
    if (!Array.isArray(rows) || rows.length === 0) return plan;

    const map = legacyRowsMap(rows);
    const indexByIsland = { PRINC: 0, FOGO: 1, 'ÁGUA': 2, BELLA: 3, TERRA: 4 };
    for (const [ilha, col] of Object.entries(indexByIsland)) {
      plan.islands[ilha].buildings.Casa = { qty: asNumber(map.casas?.values?.[col]), level: Number(levels.casas || 1) };
      plan.islands[ilha].buildings.FonteDaCura = { qty: asNumber(map.fontes?.values?.[col]), level: Number(levels.fontes || 1) };
      plan.islands[ilha].buildings.Guarnicao = { qty: asNumber(map.guarnicoes?.values?.[col]), level: 1 };
    }
    for (const [type, slug] of [['fazendas','Fazenda'],['minas','Mina'],['pedreiras','Pedra'],['serrarias','Serraria']]) {
      plan.islands.PRINC.resources[slug] = { qty: asNumber(map[type]?.values?.[0]), level: Number(levels[type] || 1) };
    }
    plan.islands['ÁGUA'].resources.FazendaPerolas = { qty: asNumber(map.perolas?.values?.[2]), level: Number(levels.perolas || 1) };

    // O planejador antigo mostrava estes cinco prédios como 1 fixo na cidade principal.
    // Preservamos o que o usuário via, mas agora eles podem ser removidos livremente.
    LEGACY_FIXED_MAIN.forEach(slug => {
      plan.islands.PRINC.buildings[slug] = { qty: 1, level: firstKnownLevel(dbEdificios, slug) };
    });
    plan.fortressLevel = Number(levels.fortaleza || 1);
    plan.expansions = { ...DEFAULT_EXPANSIONS, ...(expansions || {}) };
    plan.territories = {
      Fazenda: Number(territories?.fazendas || 0),
      Mina: Number(territories?.minas || 0),
      Pedra: Number(territories?.pedreiras || 0),
      Serraria: Number(territories?.serrarias || 0),
    };
    return plan;
  } catch {
    return createDefaultPlan(dbEdificios);
  }
}

export function mainBuildingCatalog(edificios = []) {
  return edificios
    .filter(ed => !EXCLUDED_MAIN_BUILDINGS.has(ed.slug))
    .sort((a, b) => Number(a.ordem || 0) - Number(b.ordem || 0));
}

export function buildingMaxQty(slug, slotLimit) {
  return REPEATABLE_BUILDINGS.has(slug) ? slotLimit : 1;
}

export function entryEffect(dbEdificios, slug, entry, locale = 'pt-BR') {
  const level = findNivel(dbEdificios, slug, entry?.level);
  const qty = Number(entry?.qty || 0);
  if (slug === 'Casa') return `+${fmtN(qty * Number(level.popAumento || 0), locale)} população`;
  if (slug === 'FonteDaCura') return `${fmtN(qty * Number(level.maxTropas || 0), locale)} tropas de capacidade`;
  if (Number(level.prodHora || 0) || Number(level.pop || 0)) {
    return `${fmtN(qty * Number(level.prodHora || 0), locale)}/h · ${fmtN(qty * Number(level.pop || 0), locale)} trabalhadores`;
  }
  return level.desc || dbEdificios?.[slug]?.descricao || '';
}

function sumEntries(entries = {}) {
  return Object.values(entries).reduce((sum, entry) => sum + Number(entry?.qty || 0), 0);
}

function resourceMetrics(dbEdificios, resources = {}) {
  let workers = 0;
  let production = 0;
  let capacity = 0;
  const bySlug = {};
  Object.entries(resources).forEach(([slug, entry]) => {
    const row = findNivel(dbEdificios, slug, entry.level);
    const qty = Number(entry.qty || 0);
    const metric = {
      qty,
      workers: qty * Number(row.pop || 0),
      production: qty * Number(row.prodHora || 0),
      capacity: qty * Number(row.cap || 0),
    };
    bySlug[slug] = metric;
    workers += metric.workers;
    production += metric.production;
    capacity += metric.capacity;
  });
  return { workers, production, capacity, bySlug };
}

export function calcularMetricas({ plan, dbEdificios, data, niveis, territorios }) {
  // Compatibilidade com dados locais da versão antiga e com testes de regressão.
  let legacyCompat = null;
  if (!plan) {
    const legacyPlan = createDefaultPlan(dbEdificios || {});
    const rows = Array.isArray(data) ? legacyRowsMap(data) : {};
    const typeToSlug = {
      casas: ['buildings', 'Casa'],
      fontes: ['buildings', 'FonteDaCura'],
      guarnicoes: ['buildings', 'Guarnicao'],
      fazendas: ['resources', 'Fazenda'],
      minas: ['resources', 'Mina'],
      pedreiras: ['resources', 'Pedra'],
      serrarias: ['resources', 'Serraria'],
    };
    const totais = { casas:0, fontes:0, guarnicoes:0, fazendas:0, minas:0, pedreiras:0, serrarias:0, perolas:0 };
    for (const [type, [group, slug]] of Object.entries(typeToSlug)) {
      const qty = asNumber(rows[type]?.values?.[0]);
      totais[type] = Array.isArray(rows[type]?.values) ? rows[type].values.reduce((sum, value) => sum + asNumber(value), 0) : qty;
      legacyPlan.islands.PRINC[group][slug] = { qty, level: Number(niveis?.[type] || 1) };
    }
    const pearlTotal = Array.isArray(rows.perolas?.values) ? rows.perolas.values.reduce((sum, value) => sum + asNumber(value), 0) : 0;
    totais.perolas = pearlTotal;
    legacyPlan.islands['ÁGUA'].resources.FazendaPerolas = { qty: asNumber(rows.perolas?.values?.[2]), level: Number(niveis?.perolas || 1) };
    legacyPlan.fortressLevel = Number(niveis?.fortaleza || 1);
    legacyPlan.territories = {
      Fazenda: Number(territorios?.fazendas || 0),
      Mina: Number(territorios?.minas || 0),
      Pedra: Number(territorios?.pedreiras || 0),
      Serraria: Number(territorios?.serrarias || 0),
    };
    legacyCompat = { totais };
    plan = legacyPlan;
  }

  const fortress = findNivel(dbEdificios, 'Fortaleza', plan.fortressLevel);
  const mainFieldLimit = limiteSitioPrincipal(dbEdificios, plan.fortressLevel);
  const maxTerritories = Number(fortress.territorios || 0);
  const territoriesUsed = Object.values(plan.territories || {}).reduce((sum, qty) => sum + Number(qty || 0), 0);

  let population = 0;
  let healing = 0;
  let workers = 0;
  let production = 0;
  const islandMetrics = {};

  ILHAS_NOMES.forEach(ilha => {
    const island = plan.islands?.[ilha] || { buildings: {}, resources: {} };
    const normalUsed = sumEntries(island.buildings);
    const normalLimit = normalSlotLimit(ilha, plan.expansions);
    const resources = resourceMetrics(dbEdificios, island.resources);
    const resourceLimit = ilha === 'PRINC' ? mainFieldLimit : specialSlotLimit(ilha, plan.expansions);
    Object.entries(island.buildings).forEach(([slug, entry]) => {
      const row = findNivel(dbEdificios, slug, entry.level);
      const qty = Number(entry.qty || 0);
      if (slug === 'Casa') population += qty * Number(row.popAumento || 0);
      if (slug === 'FonteDaCura') healing += qty * Number(row.maxTropas || 0);
    });
    workers += resources.workers;
    production += resources.production;
    islandMetrics[ilha] = {
      normalUsed,
      normalLimit,
      normalFree: Math.max(0, normalLimit - normalUsed),
      resourceUsed: resources.qty ?? sumEntries(island.resources),
      resourceLimit,
      resourceFree: Math.max(0, resourceLimit - sumEntries(island.resources)),
      resources,
    };
  });

  // Territórios conquistados afetam apenas os quatro recursos normais.
  const territoryProduction = Object.values(plan.territories || {}).reduce((sum, qty) => sum + Number(qty || 0) * FIELD_BONUS_PER_TERRITORY, 0);
  production += territoryProduction;

  return {
    islandMetrics,
    population,
    workers,
    freePopulation: population - workers,
    healing,
    production,
    fortress,
    mainFieldLimit,
    maxTerritories,
    territoriesUsed,
    territoriesFree: Math.max(0, maxTerritories - territoriesUsed),
    territoryProduction,
    // aliases usados pela versão antiga
    ...(legacyCompat ? {
      totais: legacyCompat.totais,
      limiteSipioPrinc: mainFieldLimit,
      popTotal: population,
      popUsada: workers,
      popLivre: population - workers,
    } : {}),
  };
}

export function snapshotMetrics(metrics, selectedIsland = 'PRINC') {
  const island = metrics.islandMetrics[selectedIsland] || {};
  return {
    population: metrics.population,
    workers: metrics.workers,
    freePopulation: metrics.freePopulation,
    healing: metrics.healing,
    production: metrics.production,
    normalFree: island.normalFree || 0,
    resourceFree: island.resourceFree || 0,
  };
}

export function diffMetrics(current, base) {
  const keys = ['population','workers','freePopulation','healing','production','normalFree','resourceFree'];
  return Object.fromEntries(keys.map(key => [key, Number(current?.[key] || 0) - Number(base?.[key] || 0)]));
}

// Compatibilidade mínima com a tabela antiga, agora não usada pela UI.
export function isAllowed(type, colIndex) {
  if (['fazendas','minas','pedreiras','serrarias'].includes(type)) return colIndex === 0;
  if (type === 'perolas') return colIndex === 1;
  return true;
}

export function validarDistribuicao() {
  return { ok: true };
}
