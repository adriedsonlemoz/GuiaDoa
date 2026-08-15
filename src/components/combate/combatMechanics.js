export const COMBAT_ROLE_DEFINITIONS = [
  { id:'melee', icon:'⚔️', titleKey:'combat.role.melee.title', bodyKey:'combat.role.melee.body' },
  { id:'ranged', icon:'🏹', titleKey:'combat.role.ranged.title', bodyKey:'combat.role.ranged.body' },
  { id:'speed', icon:'💨', titleKey:'combat.role.speed.title', bodyKey:'combat.role.speed.body' },
  { id:'tank', icon:'🛡️', titleKey:'combat.role.tank.title', bodyKey:'combat.role.tank.body' },
  { id:'supply', icon:'📦', titleKey:'combat.role.supply.title', bodyKey:'combat.role.supply.body' },
];

export const COMBAT_FACTOR_DEFINITIONS = [
  { id:'quantity', icon:'👥', titleKey:'combat.factor.quantity.title', bodyKey:'combat.factor.quantity.body' },
  { id:'attack', icon:'⚔️', titleKey:'combat.factor.attack.title', bodyKey:'combat.factor.attack.body' },
  { id:'durability', icon:'❤️', titleKey:'combat.factor.durability.title', bodyKey:'combat.factor.durability.body' },
  { id:'range', icon:'🎯', titleKey:'combat.factor.range.title', bodyKey:'combat.factor.range.body' },
  { id:'speed', icon:'💨', titleKey:'combat.factor.speed.title', bodyKey:'combat.factor.speed.body' },
  { id:'upgrades', icon:'⬆️', titleKey:'combat.factor.upgrades.title', bodyKey:'combat.factor.upgrades.body' },
  { id:'composition', icon:'🧩', titleKey:'combat.factor.composition.title', bodyKey:'combat.factor.composition.body' },
  { id:'dragon', icon:'🐉', titleKey:'combat.factor.dragon.title', bodyKey:'combat.factor.dragon.body' },
  { id:'general', icon:'🎖️', titleKey:'combat.factor.general.title', bodyKey:'combat.factor.general.body' },
  { id:'research', icon:'🔬', titleKey:'combat.factor.research.title', bodyKey:'combat.factor.research.body' },
  { id:'counters', icon:'🔁', titleKey:'combat.factor.counters.title', bodyKey:'combat.factor.counters.body' },
  { id:'targeting', icon:'◎', titleKey:'combat.factor.targeting.title', bodyKey:'combat.factor.targeting.body' },
];

export const CONFIDENCE_LEVELS = ['confirmado', 'experimental', 'hipotese'];

export function combatEvidenceSummary(troops = []) {
  const summary = { total:0, confirmado:0, experimental:0, hipotese:0 };
  for (const troop of Array.isArray(troops) ? troops : []) {
    const profile = troop?.perfilCombate || {};
    const hasEvidence = Boolean(
      profile.tipoOficial ||
      profile.funcoesTaticas?.length ||
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
    if (!hasEvidence) continue;
    summary.total += 1;
    if (CONFIDENCE_LEVELS.includes(profile.confianca)) summary[profile.confianca] += 1;
  }
  return summary;
}
