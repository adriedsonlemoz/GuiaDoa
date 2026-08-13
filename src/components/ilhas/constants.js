import { C } from '../../theme.js';

export const ILHAS_NOMES = ['PRINC', 'ÁGUA', 'FOGO', 'BELLA', 'TERRA'];
export const EXPANSIVEIS = ['FOGO', 'BELLA', 'TERRA'];

export const ILHA_META = {
  PRINC: { icon: '🏰', labelKey: 'islands.island.main_full', color: C.ACCENT_DEEP },
  'ÁGUA': { icon: '💧', labelKey: 'islands.island.water_full', color: '#557D83' },
  FOGO: { icon: '🔥', labelKey: 'islands.island.fire_full', color: '#A85E3D' },
  BELLA: { icon: '🌿', labelKey: 'islands.island.bella_full', color: '#6D8060' },
  TERRA: { icon: '⛰️', labelKey: 'islands.island.earth_full', color: '#807052' },
};

export const NORMAL_CORE = ['Casa', 'FonteDaCura', 'Guarnicao'];
export const REPEATABLE_BUILDINGS = new Set(NORMAL_CORE);
export const MAIN_RESOURCE_SLUGS = ['Fazenda', 'Mina', 'Pedra', 'Serraria'];
export const EXCLUDED_MAIN_BUILDINGS = new Set([
  'Fortaleza', ...MAIN_RESOURCE_SLUGS,
  'FazendaPerolas', 'FossoDeFogo', 'MinaDeGeodos', 'ViveiroSementes',
]);

export const SPECIAL_RESOURCE_BY_ISLAND = {
  'ÁGUA': { slug: 'FazendaPerolas', labelKey: 'islands.special.pearls', resourceKey: 'islands.pearls', base: 6, expanded: 6, expansion: false },
  FOGO: { slug: 'FossoDeFogo', labelKey: 'islands.special.fire_pit', resourceKey: 'islands.brimstone', base: 4, expanded: 8, expansion: true },
  BELLA: { slug: 'ViveiroSementes', labelKey: 'islands.special.nursery', resourceKey: 'islands.seeds', base: 4, expanded: 8, expansion: true },
  TERRA: { slug: 'MinaDeGeodos', labelKey: 'islands.special.geode_mine', resourceKey: 'islands.geodes', base: 4, expanded: 8, expansion: true },
};

export const SLOT_RULES = {
  PRINC: { normal: 25 },
  'ÁGUA': { normal: 4 },
  FOGO: { normal: 6, normalExpanded: 12 },
  BELLA: { normal: 6, normalExpanded: 12 },
  TERRA: { normal: 6, normalExpanded: 12 },
};

export const DEFAULT_EXPANSIONS = { FOGO: false, BELLA: false, TERRA: false };
export const DEFAULT_FOCUS = 'balanced';

export const FIELD_BONUS_PER_TERRITORY = 2750;

export const LEGACY_FIXED_MAIN = ['Viveiro', 'Forja', 'Fabrica', 'Cofre', 'Sentinela'];

export const PLAN_STORAGE_KEY = 'doa_islands_planner_v6';
export const EDITING_STORAGE_KEY = 'doa_islands_editing_v6';

export const RESOURCE_VISUAL = {
  Fazenda: { icon: '🌾', color: '#6E7E45', labelKey: 'islands.farms', outputKey: 'islands.food' },
  Mina: { icon: '⛏️', color: '#66767A', labelKey: 'islands.mines', outputKey: 'islands.iron' },
  Pedra: { icon: '🪨', color: '#7D735F', labelKey: 'islands.quarries', outputKey: 'islands.stone' },
  Serraria: { icon: '🪵', color: '#7D6747', labelKey: 'islands.sawmills', outputKey: 'islands.wood' },
  FazendaPerolas: { icon: '🫧', color: '#557D83', labelKey: 'islands.special.pearls', outputKey: 'islands.pearls' },
  FossoDeFogo: { icon: '🔥', color: '#A85E3D', labelKey: 'islands.special.fire_pit', outputKey: 'islands.brimstone' },
  ViveiroSementes: { icon: '🌱', color: '#6D8060', labelKey: 'islands.special.nursery', outputKey: 'islands.seeds' },
  MinaDeGeodos: { icon: '💎', color: '#786A82', labelKey: 'islands.special.geode_mine', outputKey: 'islands.geodes' },
};
