import { useMemo, useState } from 'react';
import { useTropas } from '../../../hooks/useTropas.js';

export default function useBattleSimulator({ setRoute }) {
  const { tropas } = useTropas();
  const [aba, setAba] = useState('marcha');
  const [tropaA, setTropaA] = useState(null);
  const [tropaB, setTropaB] = useState(null);
  const [esquadroes, setEsquadroes] = useState([]);
  const [selecionandoPara, setSelecionandoPara] = useState(null);
  const [busca, setBusca] = useState('');
  const [confirmDialog, setConfirmDialog] = useState({ open: false, title: '', text: '', acao: null });

  const tropasFiltradas = useMemo(() => {
    const term = busca.toLowerCase();
    return [...tropas].filter(tropa => tropa.nome.toLowerCase().includes(term)).sort((a, b) => a.nome.localeCompare(b.nome));
  }, [busca, tropas]);

  const calcMarcha = useMemo(() => {
    let totTropas = 0;
    let totPoder = 0;
    let totCarga = 0;
    let minVel = Infinity;
    esquadroes.forEach(({ tropa, qtd }) => {
      const quantidade = qtd || 0;
      if (quantidade <= 0) return;
      totTropas += quantidade;
      totPoder += (tropa.poder || 0) * quantidade;
      totCarga += (tropa.car || 0) * quantidade;
      if (tropa.vel < minVel) minVel = tropa.vel;
    });
    return { tropas: totTropas, poder: totPoder, carga: totCarga, velocidade: minVel === Infinity ? 0 : minVel };
  }, [esquadroes]);

  const handleSelect = tropa => {
    if (selecionandoPara === 'A') setTropaA(tropa);
    else if (selecionandoPara === 'B') setTropaB(tropa);
    else if (selecionandoPara === 'MARCHA') setEsquadroes(current => [...current, { tropa, qtd: '' }]);
    setSelecionandoPara(null);
    setBusca('');
  };

  const updateQtd = (index, value) => {
    const number = Number(value.replace(/\D/g, ''));
    setEsquadroes(current => current.map((item, currentIndex) => currentIndex === index ? { ...item, qtd: number || '' } : item));
  };

  const confirmarRemocao = (index, nome) => setConfirmDialog({
    open: true,
    title: 'Remover unidade',
    text: `Retirar ${nome} da formação?`,
    acao: () => setEsquadroes(current => current.filter((_, currentIndex) => currentIndex !== index)),
  });

  const solicitarSaida = () => {
    if (esquadroes.length > 0 || tropaA || tropaB) {
      setConfirmDialog({ open: true, title: 'Sair do simulador', text: 'Os dados da simulação serão perdidos. Confirma a saída?', acao: () => setRoute('tropas') });
    } else setRoute('tropas');
  };

  return {
    tropasFiltradas, aba, setAba, tropaA, tropaB, esquadroes, selecionandoPara, setSelecionandoPara,
    busca, setBusca, confirmDialog, setConfirmDialog, calcMarcha, handleSelect, updateQtd, confirmarRemocao, solicitarSaida,
  };
}
