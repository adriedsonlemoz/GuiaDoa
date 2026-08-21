import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { classifyConnectionError } from '../errors/appErrors.js';
import { useI18n } from '../hooks/useI18n.jsx';
import { API_URL as API, API_CONFIGURED } from '../config/api.js';
import { hasUsableGameData, readGameDataCache, writeGameDataCache } from './dataCache.js';

const GameDataContext = createContext(null);
const RETRYABLE_CONNECTION_CODES = new Set(['GD-NET-001', 'GD-NET-002', 'GD-SRV-001']);
const BACKGROUND_RETRY_DELAYS = [5000, 15000, 30000, 60000];
const WAKE_TIMEOUT_MS = 45000;
const DATA_TIMEOUT_MS = 18000;

const EMPTY_DATA = Object.freeze({ tropas:[], niveis:[], dragoes:[], edificios:[], reinos:[], pesquisas:[], itens:[], eventos:[] });

const ENDPOINTS = [
  ['tropas', 'troops.title', '/api/tropas/todas', d => Array.isArray(d) ? d : []],
  ['niveis', 'levels.title', '/api/niveis/todas', d => Array.isArray(d) ? d : []],
  ['dragoes', 'dragons.title', '/api/dragoes', d => (d.dragoes || []).map(x => ({ ...x, id:x.slug }))],
  ['edificios', 'buildings.title', '/api/edificios', d => d.edificios || []],
  ['reinos', 'realms.title', '/api/reinos', d => d.reinos || []],
  ['pesquisas', 'research.title', '/api/pesquisas', d => d.pesquisas || []],
  ['itens', 'items.title', '/api/itens?limite=500', d => d.itens || []],
  ['eventos', 'events.title', '/api/eventos', d => d.eventos || []],
];

async function wakeBackend() {
  if (!API_CONFIGURED) {
    const err = new Error('VITE_API_URL não foi configurada para este build.');
    err.name = 'ApiConfigurationError';
    throw err;
  }
  const response = await fetch(`${API}/api/health`, {
    signal:AbortSignal.timeout(WAKE_TIMEOUT_MS),
    cache:'no-store',
  });
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
}

export function GameDataProvider({ children }) {
  const { t } = useI18n();
  const [dados, setDados] = useState(() => ({ ...EMPTY_DATA }));
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState(null);
  const [progress, setProgress] = useState({ step:0, total:ENDPOINTS.length, label:t('app.sync.connecting'), completedKeys:[], currentKey:'' });
  const [lastUpdated, setLastUpdated] = useState(null);
  const [dataSource, setDataSource] = useState('empty');
  const [retryAttempt, setRetryAttempt] = useState(0);

  const refresh = useCallback(async ({ wake = true } = {}) => {
    setLoading(true);
    setErro(null);
    setProgress({ step:0, total:ENDPOINTS.length, label:wake ? t('app.sync.waking_backend') : t('app.sync.connecting'), completedKeys:[], currentKey:'' });
    try {
      if (wake) await wakeBackend();
      let concluidos = 0;
      const entries = await Promise.all(ENDPOINTS.map(async ([key,labelKey,path,parse]) => {
        const r = await fetch(`${API}${path}`, { signal:AbortSignal.timeout(DATA_TIMEOUT_MS), cache:'no-store' });
        if (!r.ok) throw new Error(`${t(labelKey)}: HTTP ${r.status}`);
        const json = await r.json();
        concluidos += 1;
        setProgress(current => ({
          step:concluidos,
          total:ENDPOINTS.length,
          label:t(labelKey),
          currentKey:key,
          completedKeys:[...new Set([...(current.completedKeys || []), key])],
        }));
        return [key, parse(json)];
      }));
      const novo = Object.fromEntries(entries);
      const updatedAt = new Date().toISOString();
      setDados(novo);
      setLastUpdated(updatedAt);
      setDataSource('online');
      setRetryAttempt(0);
      await writeGameDataCache(novo, { updatedAt }).catch(() => false);
      return novo;
    } catch (e) {
      const info = e?.name === 'ApiConfigurationError'
        ? { code:'GD-CONFIG-001', title:t('app.setup.api_missing_title'), message:t('app.setup.api_missing_message') }
        : classifyConnectionError(e, 'GD-DATA-001');
      setErro({ ...info, raw:e });
      if (RETRYABLE_CONNECTION_CODES.has(info.code)) setRetryAttempt(current => current + 1);
      throw e;
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    let active = true;
    (async () => {
      const snapshot = await readGameDataCache().catch(() => null);
      if (!active) return;
      if (snapshot?.data && hasUsableGameData(snapshot.data)) {
        setDados(snapshot.data);
        setLastUpdated(snapshot.updatedAt || null);
        setDataSource('cache');
      }
      refresh().catch(() => {});
    })();
    return () => { active = false; };
  }, [refresh]);

  useEffect(() => {
    if (!erro || loading || !RETRYABLE_CONNECTION_CODES.has(erro.code)) return undefined;
    const index = Math.max(0, Math.min(retryAttempt - 1, BACKGROUND_RETRY_DELAYS.length - 1));
    if (retryAttempt <= 0) return undefined;
    const id = setTimeout(() => refresh().catch(() => {}), BACKGROUND_RETRY_DELAYS[index]);
    return () => clearTimeout(id);
  }, [erro, loading, retryAttempt, refresh]);

  useEffect(() => {
    const retryWhenOnline = () => refresh().catch(() => {});
    if (typeof window !== 'undefined') window.addEventListener('online', retryWhenOnline);
    return () => { if (typeof window !== 'undefined') window.removeEventListener('online', retryWhenOnline); };
  }, [refresh]);

  const hasData = useMemo(() => hasUsableGameData(dados), [dados]);
  const value = useMemo(() => ({
    ...dados,
    loading,
    erro,
    progress,
    lastUpdated,
    refresh,
    dataSource,
    hasData,
    retryAttempt,
  }), [dados, loading, erro, progress, lastUpdated, refresh, dataSource, hasData, retryAttempt]);

  // Beta 2.73: a interface nunca fica presa atrás do backend. O catálogo salvo
  // aparece imediatamente e a sincronização com o serviço online acontece ao fundo.
  // No primeiro uso sem cache, o shell também abre e recebe os dados quando a API acordar.
  return <GameDataContext.Provider value={value}>{children}</GameDataContext.Provider>;
}

export function useGameData() {
  const ctx = useContext(GameDataContext);
  if (!ctx) throw new Error('useGameData precisa estar dentro de GameDataProvider.');
  return ctx;
}
