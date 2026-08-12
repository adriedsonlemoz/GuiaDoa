import { useGameData } from '../data/GameDataContext.jsx';

/**
 * Tropas são carregadas exclusivamente do MongoDB pelo GameDataProvider.
 */
export const useTropas = () => {
  const { tropas, loading } = useGameData();
  return { tropas, carregando: loading, origem: 'mongo' };
};
