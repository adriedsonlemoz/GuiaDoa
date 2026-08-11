import React, { useState, useEffect, useCallback } from 'react';
import { C } from '../theme.js';
import GameHeader from './shared/GameHeader.jsx';

import { getCachedItens, SYNC_KEYS } from '../data/syncService.js';

const API = import.meta.env.VITE_API_URL || 'http://localhost:3001';

// ── Popup de detalhe ──────────────────────────────────────────────────────────
function ItemPopup({ item, onClose }) {
  // Fecha com ESC
  useEffect(() => {
    const fn = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', fn);
    return () => document.removeEventListener('keydown', fn);
  }, [onClose]);

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 9999,
        background: 'rgba(18,40,74,0.65)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '16px',
        backdropFilter: 'blur(2px)',
        animation: 'fadeIn 0.12s ease',
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: C.BG_CARD,
          border: `1.5px solid ${C.BORDER}`,
          borderRadius: '16px',
          padding: '24px 22px',
          maxWidth: '360px',
          width: '100%',
          boxShadow: '0 16px 48px rgba(0,0,0,0.35)',
          animation: 'popIn 0.15s ease',
          position: 'relative',
        }}
      >
        {/* Linha dourada topo */}
        <div style={{
          position: 'absolute', top: 0, left: '10%', right: '10%', height: '2px',
          background: `linear-gradient(90deg, transparent, ${C.BORDER}, transparent)`,
          borderRadius: '2px',
        }} />

        {/* Botão fechar */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute', top: '12px', right: '12px',
            background: 'none', border: 'none', cursor: 'pointer',
            color: C.TEXT_MUTED, fontSize: '1rem', lineHeight: 1,
            padding: '4px 6px', borderRadius: '6px',
            transition: 'color 0.15s',
          }}
          onMouseOver={(e) => e.currentTarget.style.color = C.ERROR}
          onMouseOut={(e)  => e.currentTarget.style.color = C.TEXT_MUTED}
        >✕</button>

        {/* Ícone */}
        <div style={{ textAlign: 'center', marginBottom: '14px' }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            width: '72px', height: '72px', borderRadius: '50%',
            background: `rgba(200,168,74,0.1)`,
            border: `2px solid ${C.BORDER_SOFT}`,
            fontSize: '2.4rem',
            filter: 'drop-shadow(0 2px 6px rgba(62,47,28,0.2))',
          }}>
            {item.icone || '🎒'}
          </div>
        </div>

        {/* Nome */}
        <h2 style={{
          textAlign: 'center',
          fontFamily: 'Cinzel, serif',
          fontWeight: 900,
          fontSize: '1rem',
          color: C.TEXT_PRIMARY,
          letterSpacing: '1px',
          marginBottom: '12px',
        }}>
          {item.nome}
        </h2>

        {/* Divisor */}
        <div style={{
          height: '1px',
          background: `linear-gradient(90deg, transparent, ${C.BORDER_SOFT}, transparent)`,
          marginBottom: '14px',
          opacity: 0.6,
        }} />

        {/* Descrição */}
        <p style={{
          fontFamily: 'Nunito, sans-serif',
          fontSize: '0.85rem',
          color: C.TEXT_SECONDARY,
          lineHeight: 1.7,
          textAlign: 'center',
          fontWeight: 600,
          marginBottom: item.onde ? '14px' : '18px',
        }}>
          {item.descricao || 'Sem descrição disponível.'}
        </p>

        {/* Onde conseguir */}
        {item.onde && (
          <div style={{
            background: `rgba(200,168,74,0.08)`,
            border: `1px solid rgba(200,168,74,0.3)`,
            borderRadius: '10px',
            padding: '10px 14px',
            marginBottom: '18px',
          }}>
            <p style={{
              fontSize: '0.6rem', fontWeight: 900, letterSpacing: '1.5px',
              textTransform: 'uppercase', color: C.TEXT_MUTED, marginBottom: '5px',
            }}>
              📍 Onde Conseguir
            </p>
            <p style={{
              fontSize: '0.8rem', fontWeight: 600, color: C.TEXT_SECONDARY,
              lineHeight: 1.6, margin: 0,
            }}>
              {item.onde}
            </p>
          </div>
        )}

        {/* Botão fechar */}
        <button
          onClick={onClose}
          style={{
            display: 'block', width: '100%',
            background: `linear-gradient(180deg, ${C.BORDER}, ${C.ACCENT_HOVER})`,
            color: '#FFF8EE',
            border: `1px solid ${C.ACCENT_DEEP}`,
            borderRadius: '8px',
            padding: '8px',
            fontWeight: 800,
            fontSize: '0.82rem',
            letterSpacing: '0.5px',
            cursor: 'pointer',
            fontFamily: 'inherit',
          }}
        >
          Fechar
        </button>
      </div>

      <style>{`
        @keyframes fadeIn { from { opacity: 0 } to { opacity: 1 } }
        @keyframes popIn  { from { opacity: 0; transform: scale(0.92) translateY(8px) }
                            to   { opacity: 1; transform: scale(1)    translateY(0)   } }
      `}</style>
    </div>
  );
}

// ── Skeleton loader ───────────────────────────────────────────────────────────
function Skeleton() {
  return (
    <div style={{
      background: C.BG_CARD_TOP,
      border: `1px solid rgba(200,168,74,0.2)`,
      borderRadius: '10px',
      padding: '12px 14px',
      display: 'flex', alignItems: 'center', gap: '12px',
      animation: 'pulse 1.4s ease infinite',
    }}>
      <div style={{ width: '38px', height: '38px', borderRadius: '50%', background: 'rgba(200,168,74,0.15)' }} />
      <div style={{ height: '14px', flex: 1, borderRadius: '6px', background: 'rgba(200,168,74,0.12)' }} />
      <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.5} }`}</style>
    </div>
  );
}

// ── Componente principal ──────────────────────────────────────────────────────
const Itens = () => {
  const [itens,    setItens]    = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [erro,     setErro]     = useState(null);
  const [busca,    setBusca]    = useState('');
  const [selecionado, setSelecionado] = useState(null);

  const carregar = useCallback(async (q = '') => {
    setLoading(true);
    setErro(null);

    // 1. Carrega cache imediatamente (sem piscar)
    const cache = getCachedItens();
    const filtrado = q
      ? cache.filter(i =>
          i.nome?.toLowerCase().includes(q.toLowerCase()) ||
          i.categoria?.toLowerCase().includes(q.toLowerCase())
        )
      : cache;
    if (filtrado.length > 0) {
      setItens(filtrado);
      setLoading(false);
    }

    // 2. Tenta atualizar da API em background
    try {
      const ctrl = new AbortController();
      const tid  = setTimeout(() => ctrl.abort(), 8000);
      const url  = `${API}/api/itens?limite=500${q ? `&busca=${encodeURIComponent(q)}` : ''}`;
      const r    = await fetch(url, { signal: ctrl.signal });
      clearTimeout(tid);
      if (!r.ok) throw new Error('falha');
      const d   = await r.json();
      const arr  = d.itens || [];
      if (arr.length > 0) {
        // Atualiza cache global (sem busca ativa, salva tudo)
        if (!q) localStorage.setItem(SYNC_KEYS.ITENS, JSON.stringify(arr));
        setItens(arr);
      }
    } catch {
      // Se já mostrou cache, não mostra erro — usuário vê os dados normalmente
      if (filtrado.length === 0) setErro('📶 Offline — sem dados de itens em cache. Conecte-se à internet e reabra o módulo.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { carregar(); }, [carregar]);

  // Debounce busca
  useEffect(() => {
    const t = setTimeout(() => carregar(busca), 300);
    return () => clearTimeout(t);
  }, [busca, carregar]);

  return (
    <div className="max-w-2xl mx-auto pb-4">
      <GameHeader title="Armazém de Itens" />

      {/* Barra de busca */}
      <div style={{ margin: '12px 0 10px', position: 'relative' }}>
        <span style={{
          position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)',
          fontSize: '0.9rem', pointerEvents: 'none',
        }}>🔍</span>
        <input
          type="text"
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          placeholder="Buscar item..."
          style={{
            width: '100%',
            background: C.BG_INPUT,
            border: `1.5px solid ${C.BORDER}`,
            borderRadius: '10px',
            padding: '9px 12px 9px 36px',
            fontFamily: 'inherit',
            fontSize: '0.88rem',
            fontWeight: 600,
            color: C.TEXT_PRIMARY,
            outline: 'none',
          }}
          onFocus={(e)  => e.target.style.borderColor = C.ACCENT_DEEP}
          onBlur={(e)   => e.target.style.borderColor = C.BORDER}
        />
      </div>

      {/* Estado: erro */}
      {erro && (
        <div style={{
          padding: '12px 14px', borderRadius: '10px', marginBottom: '10px',
          background: 'rgba(168,60,44,0.1)', border: `1px solid rgba(168,60,44,0.3)`,
          color: C.ERROR, fontSize: '0.82rem', fontWeight: 700,
        }}>
          ✕ {erro}
        </div>
      )}

      {/* Estado: carregando */}
      {loading && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {[...Array(6)].map((_, i) => <Skeleton key={i} />)}
        </div>
      )}

      {/* Estado: vazio */}
      {!loading && !erro && itens.length === 0 && (
        <div style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center',
          textAlign: 'center', padding: '40px 16px', borderRadius: '14px',
          border: `2px dashed ${C.BORDER}`, background: C.BG_CARD,
          marginTop: '8px',
        }}>
          <p style={{ fontSize: '3rem', marginBottom: '10px', filter: 'drop-shadow(1px 2px 2px rgba(62,47,28,0.2))' }}>🎒</p>
          <p className="font-cinzel font-bold text-base uppercase tracking-wider"
             style={{ color: C.TEXT_PRIMARY, marginBottom: '6px' }}>
            {busca ? 'Nenhum item encontrado' : 'Armazém Vazio'}
          </p>
          <p className="font-nunito font-semibold text-sm leading-relaxed"
             style={{ color: C.TEXT_SECONDARY, maxWidth: '260px' }}>
            {busca
              ? `Nenhum item corresponde a "${busca}".`
              : 'Os itens cadastrados no painel admin aparecerão aqui.'}
          </p>
        </div>
      )}

      {/* Lista de itens */}
      {!loading && itens.length > 0 && (
        <>
          <p style={{ fontSize: '0.63rem', fontWeight: 800, letterSpacing: '1.5px',
                      color: C.TEXT_MUTED, textTransform: 'uppercase', marginBottom: '8px' }}>
            {itens.length} {itens.length === 1 ? 'item' : 'itens'}
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '7px' }}>
            {itens.map((item) => (
              <button
                key={item._id}
                onClick={() => setSelecionado(item)}
                style={{
                  display: 'flex', alignItems: 'center', gap: '12px',
                  padding: '11px 14px',
                  background: C.BG_CARD,
                  border: `1px solid rgba(200,168,74,0.28)`,
                  borderRadius: '10px',
                  cursor: 'pointer',
                  textAlign: 'left',
                  width: '100%',
                  transition: 'all 0.15s',
                  fontFamily: 'inherit',
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.borderColor = C.BORDER;
                  e.currentTarget.style.transform   = 'translateX(3px)';
                  e.currentTarget.style.boxShadow   = `0 2px 12px rgba(62,47,28,0.12)`;
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(200,168,74,0.28)';
                  e.currentTarget.style.transform   = 'none';
                  e.currentTarget.style.boxShadow   = 'none';
                }}
              >
                {/* Ícone */}
                <div style={{
                  width: '40px', height: '40px', flexShrink: 0,
                  borderRadius: '50%',
                  background: `rgba(200,168,74,0.1)`,
                  border: `1px solid ${C.BORDER_SOFT}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '1.3rem',
                }}>
                  {item.icone || '🎒'}
                </div>

                {/* Nome */}
                <span style={{
                  fontFamily: 'Cinzel, serif',
                  fontSize: '0.85rem',
                  fontWeight: 700,
                  color: C.TEXT_PRIMARY,
                  flex: 1,
                }}>
                  {item.nome}
                </span>

                {/* Seta */}
                <span style={{ color: C.TEXT_FAINT, fontSize: '0.8rem' }}>›</span>
              </button>
            ))}
          </div>
        </>
      )}

      {/* Popup de detalhe */}
      {selecionado && (
        <ItemPopup item={selecionado} onClose={() => setSelecionado(null)} />
      )}
    </div>
  );
};

export default Itens;
