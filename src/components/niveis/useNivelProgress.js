import { useMemo, useRef, useState } from 'react';
import { useGameData } from '../../data/GameDataContext.jsx';
import { useI18n } from '../../hooks/useI18n.jsx';
import { calcularMetaNivel, calcularProgresso, formatNumber, formatSufixo, unformat } from './niveisUtils.js';

const CURRENT_KEY = 'doa_poder_niveis';
const HISTORY_KEY = 'doa_niveis_historico_v2';
const GOAL_KEY = 'doa_niveis_meta_v2';

function readHistory() {
  try {
    const parsed = JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]');
    return Array.isArray(parsed) ? parsed.filter(x => Number(x?.power) > 0).slice(0, 8) : [];
  } catch { return []; }
}

export default function useNivelProgress() {
  const inputRef = useRef(null);
  const { niveis: niveisOnline, loading: carregando } = useGameData();
  const { t, locale } = useI18n();
  const todosNiveis = useMemo(() => niveisOnline.map(item => [item.nivel, item.poderNecessario ?? item.xp ?? null]), [niveisOnline]);
  const [savedPower, setSavedPower] = useState(() => Number(localStorage.getItem(CURRENT_KEY) || 0));
  const [poderAtualText, setPoderAtualText] = useState(() => savedPower ? formatNumber(savedPower, locale) : '');
  const [historico, setHistorico] = useState(readHistory);
  const [metaNivel, setMetaNivel] = useState(() => Number(localStorage.getItem(GOAL_KEY) || 0));
  const [toast, setToast] = useState({ open:false, message:'', severity:'success' });
  const [verTodos, setVerTodos] = useState(false);

  const currentPowerNum = unformat(poderAtualText);
  const diferencaPoder = currentPowerNum - savedPower;
  const isDirty = currentPowerNum > 0 && currentPowerNum !== savedPower;
  const progresso = useMemo(() => calcularProgresso(todosNiveis, currentPowerNum), [todosNiveis, currentPowerNum]);
  const metasConhecidas = useMemo(() => todosNiveis.filter(([, poder]) => poder != null), [todosNiveis]);
  const metaSalvaValida = metasConhecidas.some(([nivel]) => Number(nivel) === Number(metaNivel));
  const metaEfetiva = metaSalvaValida ? metaNivel : (progresso.proximaMeta?.[0] || progresso.ultimoConhecido?.[0] || 0);
  const meta = useMemo(() => calcularMetaNivel(todosNiveis, metaEfetiva, currentPowerNum), [todosNiveis, metaEfetiva, currentPowerNum]);

  const handleInputPower = event => {
    const number = unformat(event.target.value);
    setPoderAtualText(number ? formatNumber(number, locale) : '');
  };
  const handleMeta = event => {
    const value = Number(event.target.value || 0);
    setMetaNivel(value);
    try { localStorage.setItem(GOAL_KEY, String(value)); } catch { /* local */ }
  };
  const handleSave = () => {
    if (!currentPowerNum) return;
    const now = new Date().toISOString();
    const previous = savedPower;
    try { localStorage.setItem(CURRENT_KEY, String(currentPowerNum)); } catch { /* local */ }
    const nextHistory = [{ power:currentPowerNum, at:now }, ...historico.filter(x => Number(x.power) !== currentPowerNum)].slice(0, 8);
    setHistorico(nextHistory);
    try { localStorage.setItem(HISTORY_KEY, JSON.stringify(nextHistory)); } catch { /* local */ }
    setSavedPower(currentPowerNum);
    const message = previous && currentPowerNum !== previous
      ? t(currentPowerNum > previous ? 'levels.saved_gain' : 'levels.saved_loss', { amount:formatSufixo(Math.abs(currentPowerNum - previous), locale) })
      : t('levels.saved');
    setToast({ open:true, message, severity: currentPowerNum < previous ? 'warning' : 'success' });
  };
  const restoreHistory = power => setPoderAtualText(formatNumber(power, locale));

  return {
    inputRef, carregando, todosNiveis, metasConhecidas, metaNivel:metaEfetiva, meta, historico, verTodos, setVerTodos,
    toast, closeToast:()=>setToast(v=>({...v,open:false})), poderAtualText, currentPowerNum, savedPower, diferencaPoder, isDirty,
    ...progresso, handleInputPower, handleMeta, handleSave, restoreHistory,
  };
}
