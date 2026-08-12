export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
export const COR = '#5C7FA3';
export const COR_DRK = '#1A3050';

export const SUGESTOES = [
  { emoji: '⚡', texto: 'Qual é a tropa mais rápida?' },
  { emoji: '❤️', texto: 'Qual tropa possui mais vida?' },
  { emoji: '🛡️', texto: 'Qual tem a maior defesa?' },
  { emoji: '📦', texto: 'Qual tropa carrega mais recursos?' },
  { emoji: '🏹', texto: 'Qual tem o maior ataque à distância?' },
  { emoji: '⚔️', texto: 'Qual causa mais dano?' },
  { emoji: '🏆', texto: 'Quais são as 5 tropas mais rápidas?' },
  { emoji: '🔄', texto: 'Compare o Minotauro com o Arqueiro' },
  { emoji: '🐉', texto: 'Qual dragão é mais forte?' },
  { emoji: '🏆', texto: 'Qual carne vale mais no torneio?' },
  { emoji: '🧿', texto: 'Como funciona o torneio de talismã?' },
  { emoji: '🎖️', texto: 'Como treinar meus generais?' },
  { emoji: '☠️', texto: 'Estratégia para matar tropas?' },
  { emoji: '🔬', texto: 'Quais pesquisas aumentam meu ataque?' },
  { emoji: '⏩', texto: 'Qual aceleração dá mais pontos no torneio?' },
  { emoji: '🔮', texto: 'Quanto custa aprimorar uma tropa Épica?' },
];

export const shuffleSugestoes = () => [...SUGESTOES].sort(() => Math.random() - 0.5).slice(0, 8);

export const INTENCAO_LABEL = {
  tropa: { emoji: '⚔️', label: 'Tropas' },
  dragao: { emoji: '🐉', label: 'Dragões' },
  edificio: { emoji: '🏗️', label: 'Edifícios' },
  pesquisa: { emoji: '🔬', label: 'Pesquisas' },
  nivel: { emoji: '🏰', label: 'Níveis' },
  reino: { emoji: '🌍', label: 'Reinos' },
  aprimoramento: { emoji: '🔮', label: 'Aprimoramento' },
  torneio: { emoji: '🏆', label: 'Torneio' },
  ilha: { emoji: '🏝️', label: 'Ilhas' },
  geral: { emoji: '💬', label: 'Geral' },
};

export const PENSANDO_MSGS = [
  'Consultando os dados do jogo…',
  'Analisando estratégias…',
  'Verificando o banco de dados…',
  'Calculando pontos…',
  'Buscando informações…',
];
