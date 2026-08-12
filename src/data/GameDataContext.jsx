import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { C } from '../theme.js';
import AppErrorState from '../ui/AppErrorState.jsx';
import { buildDiagnostic, classifyConnectionError } from '../errors/appErrors.js';

import { API_URL as API } from '../config/api.js';
const GameDataContext = createContext(null);

const ENDPOINTS = [
  ['tropas', 'Tropas', '/api/tropas/todas', d => Array.isArray(d) ? d : []],
  ['niveis', 'Níveis', '/api/niveis/todas', d => Array.isArray(d) ? d : []],
  ['dragoes', 'Dragões', '/api/dragoes', d => (d.dragoes || []).map(x => ({ ...x, id:x.slug }))],
  ['edificios', 'Edifícios', '/api/edificios', d => d.edificios || []],
  ['reinos', 'Reinos', '/api/reinos', d => d.reinos || []],
  ['pesquisas', 'Pesquisas', '/api/pesquisas', d => d.pesquisas || []],
  ['itens', 'Itens', '/api/itens?limite=500', d => d.itens || []],
];

export function GameDataProvider({ children }) {
  const [dados, setDados] = useState({ tropas:[], niveis:[], dragoes:[], edificios:[], reinos:[], pesquisas:[], itens:[] });
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState(null);
  const [progress, setProgress] = useState({ step:0, total:ENDPOINTS.length, label:'Conectando' });
  const [lastUpdated, setLastUpdated] = useState(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setErro(null);
    setProgress({ step:0, total:ENDPOINTS.length, label:'Conectando' });
    try {
      let concluidos = 0;
      const entries = await Promise.all(ENDPOINTS.map(async ([key,label,path,parse]) => {
        const r = await fetch(`${API}${path}`, { signal:AbortSignal.timeout(12000), cache:'no-store' });
        if (!r.ok) throw new Error(`${label}: HTTP ${r.status}`);
        const json = await r.json();
        concluidos += 1;
        setProgress({ step:concluidos, total:ENDPOINTS.length, label });
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
  }, []);

  useEffect(() => { refresh().catch(()=>{}); }, [refresh]);

  const value = useMemo(() => ({ ...dados, loading, erro, progress, lastUpdated, refresh }), [dados, loading, erro, progress, lastUpdated, refresh]);

  if (loading && !lastUpdated) return (
    <div style={{ minHeight:'100vh', display:'grid', placeItems:'center', background:C.BG_PRIMARY, padding:20 }}>
      <div style={{ textAlign:'center' }}>
        <div style={{ fontSize:40 }}>🔄</div>
        <div className="font-cinzel" style={{ color:C.TEXT_PRIMARY, marginTop:8 }}>Sincronizando dados</div>
        <div className="font-nunito" style={{ color:C.TEXT_MUTED, fontSize:'.75rem', marginTop:5 }}>{progress.label} · {progress.step}/{progress.total}</div>
      </div>
    </div>
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
