import { useEffect, useMemo, useRef, useState } from 'react';
import { useGameData } from '../../data/GameDataContext.jsx';
import { calcularProgresso, formatNumber, formatSufixo, unformat } from './niveisUtils.js';

export default function useNivelProgress() {
  const tabelaRef = useRef(null);
  const inputRef = useRef(null);
  const nivelAtualRef = useRef(null);
  const { niveis: niveisOnline, loading: carregando } = useGameData();
  const todosNiveis = useMemo(() => niveisOnline.map(item => [item.nivel, item.xp ?? null]), [niveisOnline]);

  const [promptAberto, setPromptAberto] = useState(true);
  const [resultadoDialog, setResultadoDialog] = useState({ open: false, titulo: '', mensagem: '', tipo: 'success' });
  const [toast, setToast] = useState({ open: false, message: '', severity: 'success' });
  const [isDirty, setIsDirty] = useState(false);
  const [poderAtualText, setPoderAtualText] = useState(() => {
    const saved = localStorage.getItem('doa_poder_niveis');
    return saved ? formatNumber(saved) : '';
  });
  const [poderAntigoText, setPoderAntigoText] = useState(() => {
    const saved = localStorage.getItem('doa_poder_antigo');
    return saved ? formatNumber(saved) : '';
  });

  useEffect(() => {
    window.temAlteracoesNaoSalvas = isDirty;
    const handleBeforeUnload = event => {
      if (isDirty) {
        event.preventDefault();
        event.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.temAlteracoesNaoSalvas = false;
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [isDirty]);

  const currentPowerNum = unformat(poderAtualText);
  const oldPowerNum = unformat(poderAntigoText);
  const diferencaPoder = currentPowerNum - oldPowerNum;
  const progresso = useMemo(() => calcularProgresso(todosNiveis, currentPowerNum), [todosNiveis, currentPowerNum]);

  useEffect(() => {
    if (!carregando && progresso.nivelExato > 0 && nivelAtualRef.current && tabelaRef.current) {
      const timer = setTimeout(() => nivelAtualRef.current?.scrollIntoView({ block: 'center', behavior: 'smooth' }), 400);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [carregando, progresso.nivelExato]);

  const closeToast = () => setToast(current => ({ ...current, open: false }));
  const handleInputPower = event => {
    const number = unformat(event.target.value);
    setPoderAtualText(number === 0 ? '' : formatNumber(number));
    setIsDirty(true);
  };
  const handleInputAntigo = event => {
    const number = unformat(event.target.value);
    setPoderAntigoText(number === 0 ? '' : formatNumber(number));
    setIsDirty(true);
  };

  const handleSave = () => {
    localStorage.setItem('doa_poder_niveis', currentPowerNum);
    localStorage.setItem('doa_poder_antigo', oldPowerNum);
    setIsDirty(false);
    if (diferencaPoder > 0 && oldPowerNum > 0) {
      setResultadoDialog({ open: true, titulo: '🎖️ Relatório de Progresso', mensagem: `Parabéns, Comandante! O seu poder aumentou ${formatSufixo(diferencaPoder)}!`, tipo: 'success' });
    } else if (diferencaPoder < 0 && oldPowerNum > 0) {
      setResultadoDialog({ open: true, titulo: '⚠️ Alerta de Baixas', mensagem: `Atenção: O seu poder diminuiu ${formatSufixo(Math.abs(diferencaPoder))}. Reorganize as suas defesas!`, tipo: 'warning' });
    } else {
      setToast({ open: true, message: 'Progresso salvo com sucesso!', severity: 'success' });
    }
  };

  const handleAtualizarSim = () => {
    if (poderAtualText) {
      setPoderAntigoText(poderAtualText);
      setPoderAtualText('');
      setIsDirty(true);
    }
    setPromptAberto(false);
    setTimeout(() => inputRef.current?.focus(), 300);
  };

  return {
    tabelaRef, inputRef, nivelAtualRef, carregando, todosNiveis,
    promptAberto, setPromptAberto, resultadoDialog, setResultadoDialog, toast, closeToast,
    poderAtualText, poderAntigoText, isDirty, currentPowerNum, diferencaPoder,
    isPositivo: diferencaPoder > 0, ...progresso,
    handleInputPower, handleInputAntigo, handleSave, handleAtualizarSim,
  };
}
