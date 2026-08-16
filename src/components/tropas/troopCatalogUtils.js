export const TACTICAL_ROLE_IDS = ['melee', 'ranged', 'speed', 'tank', 'supply'];
export const TROOP_FILTER_IDS = ['all', 'melee', 'ranged', 'ranged_only', 'hybrid', 'speed', 'tank', 'supply'];

export const TROOP_SORT_IDS = [
  'name', 'life', 'defense', 'speed', 'load', 'ranged_attack', 'melee_attack', 'range', 'power', 'balance',
];

const METRIC_PATHS = {
  life: 'vida',
  defense: 'def',
  speed: 'vel',
  load: 'car',
  ranged_attack: 'atqDist',
  melee_attack: 'atqPerto',
  range: 'alcance',
  power: 'poder',
};

const HIGHLIGHT_METRICS = ['life', 'defense', 'melee_attack', 'ranged_attack', 'speed', 'load', 'range'];
const BALANCE_METRICS = ['life', 'defense', 'main_attack', 'speed'];

const number = value => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

export function troopMetricValue(troop, metric) {
  if (metric === 'main_attack') return Math.max(number(troop?.atqPerto), number(troop?.atqDist));
  const path = METRIC_PATHS[metric];
  return path ? number(troop?.[path]) : 0;
}

export function attackCapabilities(troop) {
  const melee = number(troop?.atqPerto);
  const ranged = number(troop?.atqDist);
  return {
    melee,
    ranged,
    hasMelee: melee > 0,
    hasRanged: ranged > 0,
    pureMelee: melee > 0 && ranged === 0,
    pureRanged: ranged > 0 && melee === 0,
    hybrid: melee > 0 && ranged > 0,
  };
}

/**
 * A tela pública prioriza os ataques numéricos reais. O campo legado `combate`
 * só é usado quando o registro ainda não possui ataque perto/distância cadastrado.
 */
export function combatClass(troop) {
  const attack = attackCapabilities(troop);
  if (attack.hasRanged && attack.ranged > attack.melee) return 'ranged';
  if (attack.hasMelee) return 'melee';
  if (attack.hasRanged) return 'ranged';
  if (troop?.combate === 'distancia') return 'ranged';
  if (troop?.combate === 'corpo_a_corpo') return 'melee';
  return 'support';
}

export function explicitTacticalRoles(troop) {
  const roles = troop?.perfilCombate?.funcoesTaticas;
  return Array.isArray(roles) ? [...new Set(roles.filter(role => TACTICAL_ROLE_IDS.includes(role)))] : [];
}

function sortedPositiveValues(troops, metric) {
  return troops
    .map(troop => troopMetricValue(troop, metric))
    .filter(value => value > 0)
    .sort((a, b) => a - b);
}

function percentileCutoff(values, ratio = .75) {
  if (!values.length) return 0;
  const index = Math.max(0, Math.ceil(values.length * ratio) - 1);
  return values[index];
}

export function buildTroopCatalogAnalysis(troops = []) {
  const safeTroops = Array.isArray(troops) ? troops : [];
  const distributions = {};
  for (const metric of [...new Set([...HIGHLIGHT_METRICS, ...BALANCE_METRICS, 'power'])]) {
    distributions[metric] = sortedPositiveValues(safeTroops, metric);
  }
  return {
    total: safeTroops.length,
    speedCutoff: percentileCutoff(distributions.speed || [], .75),
    distributions,
  };
}

export function metricPercentile(analysis, metric, value) {
  const values = analysis?.distributions?.[metric] || [];
  const target = number(value);
  if (!values.length || target <= 0) return 0;
  let low = 0;
  let high = values.length;
  while (low < high) {
    const mid = Math.floor((low + high) / 2);
    if (values[mid] <= target) low = mid + 1;
    else high = mid;
  }
  return low / values.length;
}

export function isFastTroop(troop, analysis) {
  if (explicitTacticalRoles(troop).includes('speed') || troop?.rapida === true) return true;
  const speed = number(troop?.vel);
  const cutoff = number(analysis?.speedCutoff);
  return speed > 0 && cutoff > 0 && speed >= cutoff;
}

/**
 * Papéis usados na interface/filtros. Não são persistidos como classificação oficial.
 * Melee/Ranged vêm dos ataques cadastrados; Speed usa o quartil superior de
 * velocidade do catálogo carregado; Tank continua dependendo de evidência explícita.
 */
export function tacticalRolesForFilter(troop, analysis) {
  const explicit = explicitTacticalRoles(troop);
  const attack = attackCapabilities(troop);
  const roles = new Set(explicit.filter(role => role === 'tank' || role === 'supply'));

  if (attack.hasMelee || attack.hasRanged) {
    const primary = combatClass(troop);
    if (primary === 'melee' || primary === 'ranged') roles.add(primary);
  } else {
    const explicitAttackRole = explicit.find(role => role === 'melee' || role === 'ranged');
    const fallback = explicitAttackRole || combatClass(troop);
    if (fallback === 'melee' || fallback === 'ranged') roles.add(fallback);
  }
  if (isFastTroop(troop, analysis)) roles.add('speed');
  if (troop?.categoria === 'transporte' || troop?.perfilCombate?.tipoOficial === 'supply') roles.add('supply');

  return TACTICAL_ROLE_IDS.filter(role => roles.has(role));
}

export function matchesTroopFilter(troop, filter, analysis) {
  if (!filter || filter === 'all') return true;
  const attack = attackCapabilities(troop);
  if (filter === 'ranged_only') return attack.pureRanged;
  if (filter === 'hybrid') return attack.hybrid;
  return tacticalRolesForFilter(troop, analysis).includes(filter);
}

export function troopBalanceScore(troop, analysis) {
  const percentiles = BALANCE_METRICS.map(metric => {
    const value = troopMetricValue(troop, metric);
    return metricPercentile(analysis, metric, value);
  });
  if (percentiles.some(value => value <= 0)) return 0;
  const product = percentiles.reduce((total, value) => total * value, 1);
  return Math.pow(product, 1 / percentiles.length);
}

export function strongestAttributeIds(troop, analysis, max = 2) {
  return HIGHLIGHT_METRICS
    .map(metric => ({
      metric,
      value: troopMetricValue(troop, metric),
      percentile: metricPercentile(analysis, metric, troopMetricValue(troop, metric)),
    }))
    .filter(item => item.value > 0)
    .sort((a, b) => b.percentile - a.percentile || b.value - a.value)
    .slice(0, Math.max(1, max))
    .map(item => item.metric);
}

export function sortTroops(troops, sortId, analysis, getName = troop => troop?.nome || '') {
  const list = [...troops];
  const byName = (a, b) => String(getName(a)).localeCompare(String(getName(b)), undefined, { sensitivity:'base' });
  if (!sortId || sortId === 'name') return list.sort(byName);

  return list.sort((a, b) => {
    let aValue;
    let bValue;
    if (sortId === 'balance') {
      aValue = troopBalanceScore(a, analysis);
      bValue = troopBalanceScore(b, analysis);
    } else {
      aValue = troopMetricValue(a, sortId);
      bValue = troopMetricValue(b, sortId);
    }
    return bValue - aValue || byName(a, b);
  });
}

export function hasCombatProfile(troop) {
  const profile = troop?.perfilCombate || {};
  return Boolean(
    profile.tipoOficial ||
    explicitTacticalRoles(troop).length ||
    profile.tier ||
    profile.forteContra?.length ||
    profile.fracoContra?.length ||
    profile.habilidadesEspeciais?.length ||
    profile.funcaoRecomendada ||
    profile.observacoesEstrategicas ||
    profile.prioridadeAlvo ||
    profile.fonteInformacao ||
    profile.confianca
  );
}
