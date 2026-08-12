import { useEffect, useMemo, useState } from 'react';
import { useGameData } from '../../data/GameDataContext.jsx';
import { useI18n } from '../../hooks/useI18n.jsx';
import {
  EXPANSOES_DEFAULT, ILHAS_NOMES, NIVEIS_DEFAULT, ROWS_DEFAULT, TERRITORIOS_DEFAULT,
} from './constants.js';
import { ISLAND_KEY } from './islandLabels.js';
import {
  asNumber, buildEdificiosMap, calcularMetricas, validarDistribuicao,
} from './ilhasUtils.js';

const readJson = (key, fallback) => {
  try {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) : fallback;
  } catch {
    return fallback;
  }
};

export default function useIlhasManager() {
  const { edificios } = useGameData();
  const { t } = useI18n();
  const dbEdificios = useMemo(() => buildEdificiosMap(edificios), [edificios]);
  const [expansoes, setExpansoes] = useState(() => readJson('doa_ilhas_expansoes', EXPANSOES_DEFAULT));
  const [data, setData] = useState(() => {
    const saved = readJson('doa_islands_data_react_v5', []);
    return ROWS_DEFAULT.map(base => saved.find(row => row.type === base.type) || base);
  });
  const [niveis, setNiveis] = useState(() => readJson('doa_islands_niveis_v5', NIVEIS_DEFAULT));
  const [territorios, setTerritorios] = useState(() => readJson('doa_islands_territorios_v5', TERRITORIOS_DEFAULT));
  const [isEditing, setIsEditing] = useState(() => readJson('doa_islands_editing', true));
  const [dialogConfig, setDialogConfig] = useState({ open: false, type: '', title: '', text: '' });
  const [toast, setToast] = useState({ open: false, message: '', severity: 'error' });

  const metricas = useMemo(
    () => calcularMetricas({ data, niveis, territorios, dbEdificios }),
    [data, niveis, territorios, dbEdificios],
  );

  useEffect(() => {
    window.temAlteracoesNaoSalvas = isEditing;
    return () => { window.temAlteracoesNaoSalvas = false; };
  }, [isEditing]);

  useEffect(() => {
    localStorage.setItem('doa_islands_data_react_v5', JSON.stringify(data));
    localStorage.setItem('doa_ilhas_expansoes', JSON.stringify(expansoes));
    localStorage.setItem('doa_islands_niveis_v5', JSON.stringify(niveis));
    localStorage.setItem('doa_islands_territorios_v5', JSON.stringify(territorios));
    localStorage.setItem('doa_islands_editing', JSON.stringify(isEditing));
  }, [data, expansoes, niveis, territorios, isEditing]);

  const showToast = (message, severity = 'error') => setToast({ open: true, message, severity });
  const closeToast = () => setToast(current => ({ ...current, open: false }));

  const requestAction = type => {
    if (type === 'clear') {
      setDialogConfig({ open: true, type: 'clear', title: t('islands.clear_title'), text: t('islands.clear_text') });
    } else if (type === 'save') {
      setDialogConfig({ open: true, type: 'save', title: t('islands.lock_title'), text: t('islands.lock_text') });
    }
  };

  const confirmAction = () => {
    if (dialogConfig.type === 'clear') {
      setData(ROWS_DEFAULT.map(row => ({ ...row, values: [...row.values] })));
      setTerritorios({ ...TERRITORIOS_DEFAULT });
      setIsEditing(true);
      showToast(t('islands.reset_ok'), 'success');
    } else if (dialogConfig.type === 'save') {
      setIsEditing(false);
      showToast(t('islands.lock_ok'), 'success');
    }
    setDialogConfig(current => ({ ...current, open: false }));
  };

  const alteraTerritorio = (tipo, delta) => {
    if (!isEditing) return;
    const atual = territorios[tipo] || 0;
    const novo = atual + delta;
    if (novo < 0) return;
    if (delta > 0 && metricas.terrLivres <= 0) {
      showToast(t('islands.limit_reached', { count: metricas.maxTerritorios }), 'warning');
      return;
    }
    setTerritorios(current => ({ ...current, [tipo]: novo }));
  };

  const handleChange = (rowIndex, colIndex, value) => {
    if (!isEditing || !/^\d*$/.test(value)) return;
    const validation = validarDistribuicao({
      data,
      rowIndex,
      colIndex,
      valNum: asNumber(value),
      expansoes,
      limiteSipioPrinc: metricas.limiteSipioPrinc,
    });
    if (!validation.ok) {
      if (validation.messageKey) {
        const params = { ...(validation.params || {}) };
        if (params.name && ISLAND_KEY[params.name]) params.name = t(ISLAND_KEY[params.name]);
        showToast(t(validation.messageKey, params), validation.severity);
      }
      return;
    }
    setData(current => current.map((row, index) => (
      index === rowIndex
        ? { ...row, values: row.values.map((item, i) => (i === colIndex ? value : item)) }
        : row
    )));
  };

  const toggleExpansao = ilha => {
    if (!isEditing) return;
    const columnIndex = ILHAS_NOMES.indexOf(ilha);
    const total = data.reduce((sum, row) => sum + asNumber(row.values[columnIndex]), 0);
    if (expansoes[ilha] && total > 6) {
      showToast(t('islands.island_has_buildings', { count: total }), 'error');
      return;
    }
    setExpansoes(current => ({ ...current, [ilha]: !current[ilha] }));
  };

  const handleNivelChange = (tipo, valor) => {
    if (isEditing) setNiveis(current => ({ ...current, [tipo]: valor }));
  };

  return {
    data, expansoes, niveis, territorios, isEditing, dialogConfig, toast, metricas,
    setIsEditing, setDialogConfig, closeToast, requestAction, confirmAction,
    alteraTerritorio, handleChange, toggleExpansao, handleNivelChange,
  };
}
