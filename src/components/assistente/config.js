export { API_URL } from '../../config/api.js';
export const COR = '#5C7FA3';
export const COR_DRK = '#1A3050';

export const SUGESTOES = [
  { emoji: '⚡', key: 'assistant.suggestion.fastest' },
  { emoji: '❤️', key: 'assistant.suggestion.health' },
  { emoji: '🛡️', key: 'assistant.suggestion.defense' },
  { emoji: '📦', key: 'assistant.suggestion.load' },
  { emoji: '🏹', key: 'assistant.suggestion.ranged' },
  { emoji: '⚔️', key: 'assistant.suggestion.damage' },
  { emoji: '🏆', key: 'assistant.suggestion.topfast' },
  { emoji: '🔄', key: 'assistant.suggestion.compare' },
  { emoji: '🐉', key: 'assistant.suggestion.dragon' },
  { emoji: '🏆', key: 'assistant.suggestion.meat' },
  { emoji: '🧿', key: 'assistant.suggestion.talisman' },
  { emoji: '🎖️', key: 'assistant.suggestion.generals' },
  { emoji: '☠️', key: 'assistant.suggestion.kill' },
  { emoji: '🔬', key: 'assistant.suggestion.research' },
  { emoji: '⏩', key: 'assistant.suggestion.speedup' },
  { emoji: '🔮', key: 'assistant.suggestion.enhance' },
];

export const shuffleSugestoes = (t) => [...SUGESTOES]
  .sort(() => Math.random() - 0.5)
  .slice(0, 8)
  .map(item => ({ ...item, texto: t(item.key) }));

export const INTENCAO_LABEL = {
  tropa: { emoji: '⚔️', key: 'assistant.intent.tropa' },
  dragao: { emoji: '🐉', key: 'assistant.intent.dragao' },
  edificio: { emoji: '🏗️', key: 'assistant.intent.edificio' },
  pesquisa: { emoji: '🔬', key: 'assistant.intent.pesquisa' },
  nivel: { emoji: '🏰', key: 'assistant.intent.nivel' },
  reino: { emoji: '🌍', key: 'assistant.intent.reino' },
  aprimoramento: { emoji: '🔮', key: 'assistant.intent.aprimoramento' },
  torneio: { emoji: '🏆', key: 'assistant.intent.torneio' },
  ilha: { emoji: '🏝️', key: 'assistant.intent.ilha' },
  geral: { emoji: '💬', key: 'assistant.intent.geral' },
};

export const PENSANDO_KEYS = [
  'assistant.thinking.data',
  'assistant.thinking.strategy',
  'assistant.thinking.online',
  'assistant.thinking.points',
  'assistant.thinking.info',
];
