export const TACTICAL_ROLE_IDS = ['melee', 'ranged', 'speed', 'tank', 'supply'];

export function combatClass(troop) {
  if (troop?.combate === 'distancia') return 'ranged';
  if (troop?.combate === 'corpo_a_corpo') return 'melee';
  const ranged = Number(troop?.atqDist) || 0;
  const melee = Number(troop?.atqPerto) || 0;
  return ranged > melee ? 'ranged' : 'melee';
}

export function explicitTacticalRoles(troop) {
  const roles = troop?.perfilCombate?.funcoesTaticas;
  return Array.isArray(roles) ? [...new Set(roles.filter(role => TACTICAL_ROLE_IDS.includes(role)))] : [];
}

/**
 * Compatibilidade: registros antigos ainda podem ser filtrados por dados já existentes
 * sem transformar essas inferências em uma nova classificação persistida no backend.
 */
export function tacticalRolesForFilter(troop) {
  const explicit = explicitTacticalRoles(troop);
  if (explicit.length) return explicit;
  const fallback = [combatClass(troop)];
  if (troop?.rapida) fallback.push('speed');
  if (troop?.categoria === 'transporte') fallback.push('supply');
  return [...new Set(fallback)];
}

export function matchesTroopFilter(troop, filter) {
  if (!filter || filter === 'all') return true;
  return tacticalRolesForFilter(troop).includes(filter);
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
