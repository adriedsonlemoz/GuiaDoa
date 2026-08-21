export const TOURNAMENT_REGISTRY = [
  { id: 'treino_tropa',        icon: '⚔️', catKey: 'tropas',  type: 'calculator' },
  { id: 'aprimoramento_tropa', icon: '🛡️', catKey: 'tropas',  type: 'calculator' },
  { id: 'evolucao_tropas',     icon: '⭐', catKey: 'tropas',  type: 'calculator' },
  { id: 'habilidade_dragao',   icon: '🐉', catKey: 'dragao',  type: 'calculator' },
  { id: 'treinamento_dragao',  icon: '🍖', catKey: 'dragao',  type: 'calculator' },
  { id: 'pocoes_antigas',      icon: '📚', catKey: 'poder',   type: 'calculator' },
  { id: 'talisma',             icon: '🧿', catKey: 'magia',   type: 'calculator' },
  { id: 'aceleracoes',         icon: '⏩', catKey: 'poder',   type: 'calculator' },
  { id: 'general',             icon: '🎖️', catKey: 'poder',   type: 'calculator' },
  { id: 'matar_tropas',        icon: '☠️', catKey: 'combate', type: 'calculator' },
  { id: 'alianca',             icon: '🤝', catKey: 'alianca', type: 'guide' },
  { id: 'poder',               icon: '⚡', catKey: 'poder',   type: 'guide' },
];

export const TOURNAMENT_RECENT_KEY = 'doa_tournament_recent';
export const TOURNAMENT_PLAN_KEY = 'doa_tournament_plans_v1';

export function getTournament(id) {
  return TOURNAMENT_REGISTRY.find(item => item.id === id) || null;
}

export function readRecentTournaments() {
  try {
    const parsed = JSON.parse(localStorage.getItem(TOURNAMENT_RECENT_KEY) || '[]');
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(id => getTournament(id)).slice(0, 3);
  } catch {
    return [];
  }
}

export function pushRecentTournament(id) {
  const next = [id, ...readRecentTournaments().filter(item => item !== id)].slice(0, 3);
  try { localStorage.setItem(TOURNAMENT_RECENT_KEY, JSON.stringify(next)); } catch { /* armazenamento opcional */ }
  return next;
}

export function readTournamentPlan(id) {
  try {
    const all = JSON.parse(localStorage.getItem(TOURNAMENT_PLAN_KEY) || '{}');
    return all?.[id] || { current: '', target: '', note: '' };
  } catch {
    return { current: '', target: '', note: '' };
  }
}

export function saveTournamentPlan(id, plan) {
  try {
    const all = JSON.parse(localStorage.getItem(TOURNAMENT_PLAN_KEY) || '{}');
    localStorage.setItem(TOURNAMENT_PLAN_KEY, JSON.stringify({ ...all, [id]: plan }));
    return true;
  } catch {
    return false;
  }
}
