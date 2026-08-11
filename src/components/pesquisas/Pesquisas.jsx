import React, { useState, useEffect, useCallback } from 'react';
import { C } from '../../theme.js';
import { getCachedPesquisas, SYNC_KEYS } from '../../data/syncService.js';

const API = import.meta.env.VITE_API_URL || 'http://localhost:3001';

const CATEGORIAS = [
  { id: 'Corpo a Corpo',          icone: '⚔️',  cor: '#C85C5C' },
  { id: 'Ataque à Distância',     icone: '🏹',  cor: '#5C7FA3' },
  { id: 'Produção',               icone: '🌾',  cor: '#5A8A5C' },
  { id: 'Movimento e Construção', icone: '🏃',  cor: '#8B6BAE' },
];

const CatHeader = ({ cat }) => (
  <div style={{
    display: 'flex', alignItems: 'center', gap: 8,
    padding: '10px 0 6px',
  }}>
    <div style={{
      flex: 1, height: 1,
      background: `linear-gradient(90deg,transparent,${cat.cor}60)`,
    }} />
    <span style={{
      fontFamily: '"Nunito",sans-serif', fontWeight: 900,
      fontSize: '0.6rem', letterSpacing: '2.5px',
      color: cat.cor, textTransform: 'uppercase',
    }}>
      {cat.icone} {cat.id}
    </span>
    <div style={{
      flex: 1, height: 1,
      background: `linear-gradient(270deg,transparent,${cat.cor}60)`,
    }} />
  </div>
);

const PesquisaCard = ({ pesquisa, cor, onClick }) => (
  <button
    onClick={onClick}
    style={{
      display: 'flex', alignItems: 'center', gap: 10,
      background: C.BG_CARD,
      border: `1.5px solid rgba(200,168,74,0.2)`,
      borderLeft: `3px solid ${cor}`,
      borderRadius: 10,
      padding: '10px 12px',
      cursor: 'pointer', textAlign: 'left', width: '100%',
      transition: 'transform 0.12s, box-shadow 0.12s',
    }}
    onMouseEnter={e => {
      e.currentTarget.style.transform = 'translateY(-1px)';
      e.currentTarget.style.boxShadow = `0 4px 12px ${cor}25`;
    }}
    onMouseLeave={e => {
      e.currentTarget.style.transform = 'none';
      e.currentTarget.style.boxShadow = 'none';
    }}
    onTouchStart={e => { e.currentTarget.style.transform = 'scale(0.98)'; }}
    onTouchEnd={e => { e.currentTarget.style.transform = 'none'; }}
  >
    {/* Ícone */}
    <div style={{
      width: 38, height: 38, borderRadius: 8, flexShrink: 0,
      background: `${cor}14`,
      border: `1.5px solid ${cor}30`,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: '1.4rem',
    }}>
      {pesquisa.icone}
    </div>

    {/* Nome + nível */}
    <div style={{ flex: 1, minWidth: 0 }}>
      <div style={{
        fontFamily: '"Nunito",sans-serif', fontWeight: 800,
        fontSize: '0.82rem', color: C.TEXT_PRIMARY,
        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
      }}>
        {pesquisa.nome}
      </div>
      <div style={{
        fontFamily: '"Nunito",sans-serif', fontWeight: 600,
        fontSize: '0.62rem', color: C.TEXT_MUTED, marginTop: 2,
      }}>
        {pesquisa.nivelMax === 1 ? 'Nível único' : `Até nível ${pesquisa.nivelMax}`}
      </div>
    </div>

    {/* Seta */}
    <span style={{ color: C.TEXT_FAINT, fontSize: '0.8rem' }}>›</span>
  </button>
);

const Pesquisas = ({ setRoute }) => {
  const [pesquisas, setPesquisas] = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [erro,      setErro]      = useState(null);

  const carregar = useCallback(async () => {
    setLoading(true); setErro(null);

    // 1. Cache imediato
    const cache = getCachedPesquisas();
    if (cache.length > 0) {
      setPesquisas(cache);
      setLoading(false);
    }

    // 2. Atualiza da API em background
    try {
      const ctrl = new AbortController();
      const tid  = setTimeout(() => ctrl.abort(), 8000);
      const r    = await fetch(`${API}/api/pesquisas`, { signal: ctrl.signal });
      clearTimeout(tid);
      if (!r.ok) throw new Error('falha');
      const d = await r.json();
      const arr = d.pesquisas || [];
      if (arr.length > 0) {
        localStorage.setItem(SYNC_KEYS.PESQUISAS, JSON.stringify(arr));
        setPesquisas(arr);
      }
    } catch {
      if (cache.length === 0) setErro('📶 Offline — sem dados de pesquisas em cache. Conecte-se à internet e reabra o módulo.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { carregar(); }, [carregar]);

  if (loading) return (
    <div style={{ padding: 20, textAlign: 'center' }}>
      <div style={{
        background: `linear-gradient(135deg,#1C3A5E,#3B5C8C,#1C3A5E)`,
        borderRadius: '12px 12px 0 0', padding: '10px 16px', textAlign: 'center',
      }}>
        <p style={{
          fontFamily: '"Cinzel",serif', fontWeight: 700, fontSize: '0.85rem',
          letterSpacing: '3px', color: '#F8F2E0', margin: 0, textTransform: 'uppercase',
        }}>
          🔬 Centro de Ciência
        </p>
      </div>
      <div style={{ padding: 24, color: C.TEXT_MUTED, fontSize: '0.8rem' }}>
        Carregando pesquisas…
      </div>
    </div>
  );

  if (erro) return (
    <div style={{ padding: 20, textAlign: 'center', color: C.ERROR }}>
      <div style={{ marginBottom: 8, fontSize: '1.5rem' }}>⚠️</div>
      <p style={{ fontFamily: '"Nunito",sans-serif', fontSize: '0.85rem', margin: 0 }}>
        {erro}
      </p>
    </div>
  );

  return (
    <div style={{ maxWidth: 480, margin: '0 auto', paddingBottom: 16 }}>
      {/* Header */}
      <div style={{
        background: 'linear-gradient(135deg,#1C3A5E,#3B5C8C,#1C3A5E)',
        borderRadius: '12px 12px 0 0', padding: '12px 16px',
        textAlign: 'center', marginBottom: 0,
      }}>
        <div style={{ fontSize: '1.6rem', marginBottom: 4 }}>🔬</div>
        <p style={{
          fontFamily: '"Cinzel",serif', fontWeight: 700, fontSize: '0.85rem',
          letterSpacing: '3px', color: '#F8F2E0', margin: 0,
        }}>
          CENTRO DE CIÊNCIA
        </p>
        <p style={{
          fontFamily: '"Nunito",sans-serif', fontWeight: 600,
          fontSize: '0.62rem', color: 'rgba(200,168,74,0.7)',
          letterSpacing: '1.5px', margin: '4px 0 0',
        }}>
          Nível 30 · {pesquisas.length} pesquisas disponíveis
        </p>
      </div>

      <div style={{
        background: C.BG_SECONDARY,
        border: `1.5px solid ${C.BORDER}`, borderTop: 'none',
        borderRadius: '0 0 12px 12px',
        padding: '8px 10px 10px',
      }}>
        {CATEGORIAS.map(cat => {
          const lista = pesquisas.filter(p => p.categoria === cat.id);
          if (lista.length === 0) return null;
          return (
            <div key={cat.id}>
              <CatHeader cat={cat} />
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {lista.map(p => (
                  <PesquisaCard
                    key={p.slug}
                    pesquisa={p}
                    cor={cat.cor}
                    onClick={() => setRoute(`pesquisa_${p.slug}`)}
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Pesquisas;
