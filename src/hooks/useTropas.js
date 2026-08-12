import { useGameData } from '../data/GameDataContext.jsx';

/**
 * Tropas são carregadas exclusivamente pelo serviço de dados online.
 */
export const useTropas = () => {
  const { tropas, loading } = useGameData();
  return { tropas, carregando: loading, origem: 'online' };
};
