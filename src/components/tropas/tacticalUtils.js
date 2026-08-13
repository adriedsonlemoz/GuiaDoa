export const TROOP_FILTERS = [
  { id: 'all', icon: '⚔️', key: 'common.all' },
  { id: 'ranged', icon: '🏹', key: 'troops.ranged' },
  { id: 'melee', icon: '🛡️', key: 'troops.melee' },
  { id: 'trainable', icon: '🏰', key: 'troops.trainable' },
  { id: 'special', icon: '✨', key: 'troops.special' },
  { id: 'attack', icon: '🔥', key: 'troops.role.attack' },
  { id: 'defense', icon: '🛡️', key: 'troops.role.defense' },
  { id: 'fast', icon: '⚡', key: 'troops.fast_plural' },
];

export const TROOP_SORTS = [
  { id: 'name', key: 'troops.sort.name' },
  { id: 'attack', key: 'troops.sort.attack' },
  { id: 'defense', key: 'troops.sort.defense' },
  { id: 'speed', key: 'troops.sort.speed' },
  { id: 'load', key: 'troops.sort.load' },
  { id: 'power', key: 'troops.sort.power' },
];

export function combatClass(tropa) {
  if (tropa?.combate === 'distancia') return 'ranged';
  if (tropa?.combate === 'corpo_a_corpo') return 'melee';
  const ranged = Number(tropa?.atqDist) || 0;
  const melee = Number(tropa?.atqPerto) || 0;
  return ranged > melee ? 'ranged' : 'melee';
}

export function attackValue(tropa) {
  return Math.max(Number(tropa?.atqPerto) || 0, Number(tropa?.atqDist) || 0);
}

export function inferredRoles(tropa) {
  const explicit = Array.isArray(tropa?.funcoes) ? tropa.funcoes.filter(Boolean) : [];
  if (explicit.length) return explicit;

  const attack = attackValue(tropa);
  const durability = (Number(tropa?.vida) || 0) / 4 + (Number(tropa?.def) || 0) * 2;
  const load = Number(tropa?.car) || 0;
  const roles = [];

  if (attack >= durability * 0.65 || attack >= 1800) roles.push('ataque');
  if (durability >= attack * 1.35 || (Number(tropa?.def) || 0) >= 900) roles.push('defesa');
  if (load >= 700) roles.push('farming');
  if (!roles.length) roles.push('equilibrada');
  return roles;
}

export function troopCategory(tropa) {
  if (tropa?.categoria) return tropa.categoria;
  const nome = String(tropa?.nome || '').toLowerCase();
  if (/drag[aã]o|dragonete/.test(nome)) return 'dragao';
  if (/arqueir|mago|espelho|canh[aã]o/.test(nome)) return 'distancia';
  if (/cavaleir|biga|centauro|montad/.test(nome)) return 'cavalaria';
  if (/transporte|carregador/.test(nome)) return 'transporte';
  if (/gigante|ogro|golem|tit[aã]|minotauro/.test(nome)) return 'pesada';
  if (tropa?.tipo === 'especial') return 'outro';
  return 'infantaria';
}

export function matchesTroopFilter(tropa, filter) {
  if (filter === 'all') return true;
  if (filter === 'ranged') return combatClass(tropa) === 'ranged';
  if (filter === 'melee') return combatClass(tropa) === 'melee';
  if (filter === 'trainable') return tropa?.tipo === 'treinavel';
  if (filter === 'special') return tropa?.tipo === 'especial';
  if (filter === 'fast') return Boolean(tropa?.rapida) || (Number(tropa?.vel) || 0) >= 1000;
  if (filter === 'attack') return inferredRoles(tropa).includes('ataque');
  if (filter === 'defense') return inferredRoles(tropa).includes('defesa');
  return true;
}

export function sortTroops(list, sort, localizedName = (t) => t?.nome || '') {
  const out = [...list];
  if (sort === 'name') return out.sort((a, b) => localizedName(a).localeCompare(localizedName(b)));
  const selectors = {
    attack: attackValue,
    defense: (t) => (Number(t?.vida) || 0) + (Number(t?.def) || 0) * 4,
    speed: (t) => Number(t?.vel) || 0,
    load: (t) => Number(t?.car) || 0,
    power: (t) => Number(t?.poder) || 0,
  };
  const select = selectors[sort] || selectors.power;
  return out.sort((a, b) => select(b) - select(a) || localizedName(a).localeCompare(localizedName(b)));
}

export function troopSummary(troops) {
  const summary = { total: troops.length, ranged: 0, melee: 0, trainable: 0, special: 0, fast: 0 };
  for (const troop of troops) {
    summary[combatClass(troop)] += 1;
    if (troop?.tipo === 'treinavel') summary.trainable += 1;
    if (troop?.tipo === 'especial') summary.special += 1;
    if (troop?.rapida || (Number(troop?.vel) || 0) >= 1000) summary.fast += 1;
  }
  return summary;
}

export function knownUnlocks(troops) {
  return troops
    .filter((t) => t?.desbloqueio?.fonte || t?.desbloqueio?.nivel)
    .sort((a, b) => (Number(a.desbloqueio?.nivel) || 999) - (Number(b.desbloqueio?.nivel) || 999));
}

export function roleLabelKey(role) {
  return {
    ataque: 'troops.role.attack',
    defesa: 'troops.role.defense',
    farming: 'troops.role.farming',
    suporte: 'troops.role.support',
    equilibrada: 'troops.role.balanced',
  }[role] || 'troops.role.balanced';
}

export function categoryLabelKey(category) {
  return `troops.category.${category || 'outro'}`;
}
