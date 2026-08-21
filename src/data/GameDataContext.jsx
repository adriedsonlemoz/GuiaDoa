import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { C } from '../theme.js';
import AppErrorState from '../ui/AppErrorState.jsx';
import { buildDiagnostic, classifyConnectionError } from '../errors/appErrors.js';
import { useI18n } from '../hooks/useI18n.jsx';
import DataSyncScene from '../app/DataSyncScene.jsx';

import { API_URL as API } from '../config/api.js';
const GameDataContext = createContext(null);
const RETRYABLE_CONNECTION_CODES = new Set(['GD-NET-001', 'GD-NET-002', 'GD-SRV-001']);
const AUTO_RETRY_MS = 3000;

const ENDPOINTS = [
  ['tropas', 'troops.title', '/api/tropas/todas', d => Array.isArray(d) ? d : [], '⚔'],
  ['niveis', 'levels.title', '/api/niveis/todas', d => Array.isArray(d) ? d : [], '↟'],
  ['dragoes', 'dragons.title', '/api/dragoes', d => (d.dragoes || []).map(x => ({ ...x, id:x.slug })), '◆'],
  ['edificios', 'buildings.title', '/api/edificios', d => d.edificios || [], '▦'],
  ['reinos', 'realms.title', '/api/reinos', d => d.reinos || [], '◎'],
  ['pesquisas', 'research.title', '/api/pesquisas', d => d.pesquisas || [], '⌁'],
  ['itens', 'items.title', '/api/itens?limite=500', d => d.itens || [], '✦'],
  ['eventos', 'events.title', '/api/eventos', d => d.eventos || [], '⚡'],
];

export function GameDataProvider({ children }) {
  const { t } = useI18n();
  const [dados, setDados] = useState({ tropas:[], niveis:[], dragoes:[], edificios:[], reinos:[], pesquisas:[], itens:[], eventos:[] });
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState(null);
  const [progress, setProgress] = useState({ step:0, total:ENDPOINTS.length, label:t('app.sync.connecting'), completedKeys:[], currentKey:'' });
  const [lastUpdated, setLastUpdated] = useState(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setErro(null);
    setProgress({ step:0, total:ENDPOINTS.length, label:t('app.sync.connecting'), completedKeys:[], currentKey:'' });
    try {
      let concluidos = 0;
      const entries = await Promise.all(ENDPOINTS.map(async ([key,labelKey,path,parse]) => {
        const r = await fetch(`${API}${path}`, { signal:AbortSignal.timeout(12000), cache:'no-store' });
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
      setDados(novo);
      setLastUpdated(new Date().toISOString());
      return novo;
    } catch (e) {
      const info = classifyConnectionError(e, 'GD-DATA-001');
      setErro({ ...info, raw:e });
      throw e;
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => { refresh().catch(()=>{}); }, [refresh]);

  useEffect(() => {
    if (!erro || lastUpdated || !RETRYABLE_CONNECTION_CODES.has(erro.code)) return undefined;
    const id = setTimeout(() => refresh().catch(()=>{}), AUTO_RETRY_MS);
    return () => clearTimeout(id);
  }, [erro, lastUpdated, refresh]);

  const value = useMemo(() => ({ ...dados, loading, erro, progress, lastUpdated, refresh }), [dados, loading, erro, progress, lastUpdated, refresh]);

  if (loading && !lastUpdated) {
    const syncNodes = ENDPOINTS.map(([key, labelKey, , , icon]) => ({ key, icon, label:t(labelKey) }));
    return (
      <DataSyncScene
        title={t('app.sync.title')}
        subtitle={t('app.sync.scene_subtitle')}
        progress={progress}
        nodes={syncNodes}
        completedKeys={progress.completedKeys || []}
        currentKey={progress.currentKey || ''}
        phase={progress.step >= progress.total ? 'ready' : 'sync'}
      />
    );
  }

  if (erro && !lastUpdated && RETRYABLE_CONNECTION_CODES.has(erro.code)) return (
    <DataSyncScene
      title={t('app.sync.waiting_connection')}
      subtitle={t('app.sync.auto_retry_note')}
      progress={progress}
      phase="connect"
    />
  );

  if (erro && !lastUpdated) return (
    <div style={{ minHeight:'100vh', display:'grid', placeItems:'center', background:C.BG_PRIMARY, padding:20 }}>
      <AppErrorState
        title={erro.title}
        message={erro.message}
        code={erro.code}
        diagnostic={buildDiagnostic({ code:erro.code, error:erro.raw, context:'Sincronização de dados' })}
        onRetry={() => refresh().catch(()=>{})}
      />
    </div>
  );

  return <GameDataContext.Provider value={value}>{children}</GameDataContext.Provider>;
}

export function useGameData() {
  const ctx = useContext(GameDataContext);
  if (!ctx) throw new Error('useGameData precisa estar dentro de GameDataProvider.');
  return ctx;
}
