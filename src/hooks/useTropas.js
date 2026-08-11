import { useState, useEffect } from 'react';
import { carregarTropas, dbTropasLocal } from '../data/tropas.js';

/**
 * Hook que carrega tropas da API (ou fallback local).
 * Retorna { tropas, carregando, origem }
 * origem: 'api' | 'cache' | 'local'
 */
export const useTropas = () => {
  const [tropas,     setTropas]     = useState(dbTropasLocal); // mostra dados locais imediatamente
  const [carregando, setCarregando] = useState(true);
  const [origem,     setOrigem]     = useState('local');

  useEffect(() => {
    let cancelado = false;
    carregarTropas().then(dados => {
      if (cancelado) return;
      setTropas(dados);
      setOrigem(dados === dbTropasLocal ? 'local' : 'api');
      setCarregando(false);
    });
    return () => { cancelado = true; };
  }, []);

  return { tropas, carregando, origem };
};
