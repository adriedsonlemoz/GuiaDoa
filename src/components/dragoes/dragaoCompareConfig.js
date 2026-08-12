export const ATTRS_BASE = [
  { key: 'vida', labelKey: 'common.health', icon: '❤️' },
  { key: 'defesa', labelKey: 'common.defense', icon: '🛡️' },
  { key: 'ataquePerto', labelKey: 'dragons.attr.melee_attack', icon: '⚔️' },
  { key: 'ataqueDistante', labelKey: 'dragons.attr.ranged_attack', icon: '🏹' },
  { key: 'alcance', labelKey: 'common.range', icon: '🎯' },
  { key: 'velocidade', labelKey: 'common.speed', icon: '⚡' },
];

export const ATTRS_ELEM = [
  { key: 'ataqueElemental', labelKey: 'dragons.attr.elemental_attack', icon: '🔥' },
  { key: 'impulsoElemental', labelKey: 'dragons.attr.elemental_boost', icon: '💥' },
  { key: 'barreiraElemental', labelKey: 'dragons.attr.elemental_barrier', icon: '🔰' },
  { key: 'bombardeioElemental', labelKey: 'dragons.attr.bombardment', icon: '💣' },
  { key: 'confrontoElemental', labelKey: 'dragons.attr.confrontation', icon: '⚡' },
  { key: 'bloqueioElemental', labelKey: 'dragons.attr.block', icon: '🛡' },
  { key: 'rupturaElemental', labelKey: 'dragons.attr.rupture', icon: '💢' },
];

export const fmtDragaoValor = (value, locale = 'pt-BR') => (value == null || value === 0 ? '0' : Number(value).toLocaleString(locale));
