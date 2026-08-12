import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { C } from '../theme.js';

const API = import.meta.env.VITE_API_URL || 'http://localhost:3001';
const GameDataContext = createContext(null);

const ENDPOINTS = [
  ['tropas', '/api/tropas/todas', d => Array.isArray(d) ? d : []],
  ['niveis', '/api/niveis/todas', d => Array.isArray(d) ? d : []],
  ['dragoes', '/api/dragoes', d => (d.dragoes || []).map(x => ({ ...x, id:x.slug }))],
  ['edificios', '/api/edificios', d => d.edificios || []],
  ['reinos', '/api/reinos', d => d.reinos || []],
  ['pesquisas', '/api/pesquisas', d => d.pesquisas || []],
  ['itens', '/api/itens?limite=500', d => d.itens || []],
];

export function GameDataProvider({ children }) {
  const [dados, setDados] = useState({ tropas:[], niveis:[], dragoes:[], edificios:[], reinos:[], pesquisas:[], itens:[] });
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState('');
  const [progress, setProgress] = useState({ step:0, total:ENDPOINTS.length, label:'MongoDB' });
  const [lastUpdated, setLastUpdated] = useState(null);

  const refresh = useCallback(async () => {
    setLoading(true); setErro(''); setProgress({ step:0, total:ENDPOINTS.length, label:'Conectando ao MongoDB' });
    try {
      let concluidos = 0;
      const entries = await Promise.all(ENDPOINTS.map(async ([key,path,parse]) => {
        const r = await fetch(`${API}${path}`, { signal:AbortSignal.timeout(12000), cache:'no-store' });
        if (!r.ok) throw new Error(`${key}: HTTP ${r.status}`);
        const json = await r.json();
        concluidos += 1; setProgress({ step:concluidos, total:ENDPOINTS.length, label:key });
        return [key, parse(json)];
      }));
      const novo = Object.fromEntries(entries);
      setDados(novo); setLastUpdated(new Date().toISOString());
      return novo;
    } catch (e) {
      setErro(`Não foi possível carregar os dados do MongoDB (${e.message}).`);
      throw e;
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { refresh().catch(()=>{}); }, [refresh]);

  const value = useMemo(() => ({ ...dados, loading, erro, progress, lastUpdated, refresh }), [dados, loading, erro, progress, lastUpdated, refresh]);

  if (loading && !lastUpdated) return (
    <div style={{ minHeight:'100vh', display:'grid', placeItems:'center', background:C.BG_PRIMARY, padding:20 }}>
      <div style={{ textAlign:'center' }}><div style={{ fontSize:40 }}>🗄️</div><div className="font-cinzel" style={{ color:C.TEXT_PRIMARY, marginTop:8 }}>Carregando do MongoDB</div><div className="font-nunito" style={{ color:C.TEXT_MUTED, fontSize:'.75rem', marginTop:5 }}>{progress.label} · {progress.step}/{progress.total}</div></div>
    </div>
  );

  if (erro && !lastUpdated) return (
    <div style={{ minHeight:'100vh', display:'grid', placeItems:'center', background:C.BG_PRIMARY, padding:20 }}>
      <div style={{ textAlign:'center', maxWidth:390 }}><div style={{ fontSize:40 }}>🔴</div><h2 className="font-cinzel" style={{ color:C.ERROR }}>Servidor indisponível</h2><p className="font-nunito" style={{ color:C.TEXT_SECONDARY, fontSize:'.8rem' }}>{erro}</p><p className="font-nunito" style={{ color:C.TEXT_MUTED, fontSize:'.7rem' }}>O GUIA DOA não usa mais dados offline como fallback.</p><button className="btn-gold" onClick={()=>refresh().catch(()=>{})}>Tentar novamente</button></div>
    </div>
  );

  return <GameDataContext.Provider value={value}>{children}</GameDataContext.Provider>;
}

export function useGameData() {
  const ctx = useContext(GameDataContext);
  if (!ctx) throw new Error('useGameData precisa estar dentro de GameDataProvider.');
  return ctx;
}
