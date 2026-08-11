import React, { useState, useEffect } from 'react';
import { C } from '../../theme.js';
import { getCachedPesquisas } from '../../data/syncService.js';

const API = import.meta.env.VITE_API_URL || 'http://localhost:3001';

const CATEGORIAS_COR = {
  'Corpo a Corpo':          '#C85C5C',
  'Ataque à Distância':     '#5C7FA3',
  'Produção':               '#5A8A5C',
  'Movimento e Construção': '#8B6BAE',
};

const CATEGORIAS_ICONE = {
  'Corpo a Corpo':          '⚔️',
  'Ataque à Distância':     '🏹',
  'Produção':               '🌾',
  'Movimento e Construção': '🏃',
};

// ── Helpers de tempo ──────────────────────────────────────────────────────────
/** Converte string "Xd Yh Zm" → total em minutos */
function parseTempo(str) {
  if (!str || !str.trim()) return 0;
  let min = 0;
  const d = str.match(/(\d+)\s*d/i);
  const h = str.match(/(\d+)\s*h/i);
  const m = str.match(/(\d+)\s*m/i);
  if (d) min += parseInt(d[1]) * 24 * 60;
  if (h) min += parseInt(h[1]) * 60;
  if (m) min += parseInt(m[1]);
  return min;
}

/** Formata minutos → "Xd Yh Zm" legível */
function formatDuracao(totalMin) {
  if (totalMin <= 0) return null;
  const d = Math.floor(totalMin / (24 * 60));
  const h = Math.floor((totalMin % (24 * 60)) / 60);
  const m = totalMin % 60;
  const parts = [];
  if (d > 0) parts.push(`${d}d`);
  if (h > 0) parts.push(`${h}h`);
  if (m > 0) parts.push(`${m}m`);
  return parts.join(' ') || null;
}

const PesquisaDetalhe = ({ slug }) => {
  const [pesquisa, setPesquisa] = useState(null);
  const [loading,  setLoading]  = useState(true);
  const [erro,     setErro]     = useState(null);

  useEffect(() => {
    setLoading(true); setErro(null);

    // 1. Tenta cache imediato
    const cache = getCachedPesquisas();
    const cached = cache.find(p => p.slug === slug);
    if (cached) {
      setPesquisa(cached);
      setLoading(false);
    }

    // 2. Atualiza da API em background
    const ctrl = new AbortController();
    const tid  = setTimeout(() => ctrl.abort(), 8000);
    fetch(`${API}/api/pesquisas/${slug}`, { signal: ctrl.signal })
      .then(r => {
        clearTimeout(tid);
        if (!r.ok) throw new Error('Pesquisa não encontrada');
        return r.json();
      })
      .then(d => { setPesquisa(d); setLoading(false); })
      .catch(() => {
        clearTimeout(tid);
        if (!cached) setErro('Sem conexão e pesquisa não encontrada no cache.');
        setLoading(false);
      });

    return () => { ctrl.abort(); clearTimeout(tid); };
  }, [slug]);

  if (loading) return (
    <div style={{ padding: 20, textAlign: 'center', color: C.TEXT_MUTED, fontSize: '0.85rem' }}>
      Carregando…
    </div>
  );

  if (erro || !pesquisa) return (
    <div style={{ padding: 20, textAlign: 'center', color: C.ERROR }}>
      <div style={{ fontSize: '1.5rem', marginBottom: 8 }}>⚠️</div>
      <p style={{ fontFamily: '"Nunito",sans-serif', fontSize: '0.85rem', margin: 0 }}>
        {erro || 'Pesquisa não encontrada.'}
      </p>
    </div>
  );

  const cor        = CATEGORIAS_COR[pesquisa.categoria]   || C.ACCENT;
  const catIcone   = CATEGORIAS_ICONE[pesquisa.categoria] || '🔬';
  const temTempos  = pesquisa.niveis.some(n => n.tempo && n.tempo.trim() !== '');
  const nivelUnico = pesquisa.nivelMax === 1;

  // Duração total: soma de todos os níveis com tempo informado
  const totalMinutos  = pesquisa.niveis.reduce((acc, n) => acc + parseTempo(n.tempo), 0);
  const duracaoTotal  = formatDuracao(totalMinutos);
  const niveisComTempo = pesquisa.niveis.filter(n => parseTempo(n.tempo) > 0).length;

  return (
    <div style={{ maxWidth: 480, margin: '0 auto', paddingBottom: 24 }}>

      {/* ── Hero ───────────────────────────────────────────────────────── */}
      <div style={{
        background: `linear-gradient(135deg, ${cor}22, ${cor}08)`,
        border: `1.5px solid ${cor}40`,
        borderRadius: 14,
        padding: '20px 16px 16px',
        textAlign: 'center',
        marginBottom: 12,
      }}>
        {/* Ícone grande */}
        <div style={{
          width: 72, height: 72, borderRadius: 18, margin: '0 auto 12px',
          background: `${cor}18`,
          border: `2px solid ${cor}40`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '2.4rem',
          boxShadow: `0 4px 20px ${cor}30`,
        }}>
          {pesquisa.icone}
        </div>

        {/* Nome */}
        <h1 style={{
          fontFamily: '"Cinzel",serif', fontWeight: 700,
          fontSize: '1.1rem', color: C.TEXT_PRIMARY,
          margin: '0 0 8px', lineHeight: 1.3,
        }}>
          {pesquisa.nome}
        </h1>

        {/* Badge categoria */}
        <span style={{
          display: 'inline-flex', alignItems: 'center', gap: 4,
          fontFamily: '"Nunito",sans-serif', fontWeight: 800,
          fontSize: '0.62rem', letterSpacing: '1.5px',
          padding: '3px 10px', borderRadius: 20,
          background: `${cor}18`, border: `1px solid ${cor}50`,
          color: cor,
        }}>
          {catIcone} {pesquisa.categoria.toUpperCase()}
        </span>
      </div>

      {/* ── Descrição ──────────────────────────────────────────────────── */}
      <div style={{
        background: C.BG_CARD,
        border: `1.5px solid rgba(200,168,74,0.22)`,
        borderRadius: 12,
        padding: '12px 14px',
        marginBottom: 12,
      }}>
        <p style={{
          fontFamily: '"Nunito",sans-serif', fontWeight: 600,
          fontSize: '0.83rem', color: C.TEXT_SECONDARY,
          lineHeight: 1.6, margin: 0,
        }}>
          {pesquisa.descricao || 'Descrição não disponível.'}
        </p>
      </div>

      {/* ── Duração Total ───────────────────────────────────────────────── */}
      {duracaoTotal && (
        <div style={{
          background: `linear-gradient(135deg, ${C.BG_HEADER}f0, #0f2540f0)`,
          border: `1.5px solid ${C.BORDER}`,
          borderRadius: 12,
          padding: '12px 16px',
          marginBottom: 12,
          display: 'flex',
          alignItems: 'center',
          gap: 14,
        }}>
          {/* Ícone */}
          <div style={{
            width: 44, height: 44, borderRadius: 10, flexShrink: 0,
            background: `${C.ACCENT}22`,
            border: `1.5px solid ${C.ACCENT}50`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '1.5rem',
          }}>
            ⏱️
          </div>

          {/* Texto */}
          <div style={{ flex: 1 }}>
            <p style={{
              fontFamily: '"Nunito",sans-serif', fontWeight: 700,
              fontSize: '0.58rem', letterSpacing: '2px',
              color: `${C.ACCENT}99`, textTransform: 'uppercase',
              margin: '0 0 2px',
            }}>
              Duração Total da Pesquisa
            </p>
            <p style={{
              fontFamily: '"Cinzel",serif', fontWeight: 700,
              fontSize: '1.25rem', color: C.ACCENT,
              margin: 0, lineHeight: 1,
            }}>
              {duracaoTotal}
            </p>
            {niveisComTempo < pesquisa.nivelMax && (
              <p style={{
                fontFamily: '"Nunito",sans-serif', fontWeight: 600,
                fontSize: '0.6rem', color: `${C.ACCENT}66`,
                margin: '3px 0 0', fontStyle: 'italic',
              }}>
                {niveisComTempo} de {pesquisa.nivelMax} níveis com tempo informado
              </p>
            )}
          </div>

          {/* Divisores de tempo */}
          {(() => {
            const d = Math.floor(totalMinutos / (24 * 60));
            const h = Math.floor((totalMinutos % (24 * 60)) / 60);
            const m = totalMinutos % 60;
            return [
              { v: d, l: 'dias' },
              { v: h, l: 'horas' },
              { v: m, l: 'min' },
            ].filter(x => x.v > 0).map(x => (
              <div key={x.l} style={{ textAlign: 'center', flexShrink: 0 }}>
                <p style={{
                  fontFamily: '"Cinzel",serif', fontWeight: 700,
                  fontSize: '1rem', color: C.ACCENT,
                  margin: 0, lineHeight: 1,
                }}>
                  {x.v}
                </p>
                <p style={{
                  fontFamily: '"Nunito",sans-serif', fontWeight: 700,
                  fontSize: '0.55rem', color: `${C.ACCENT}77`,
                  textTransform: 'uppercase', letterSpacing: '1px',
                  margin: '2px 0 0',
                }}>
                  {x.l}
                </p>
              </div>
            ));
          })()}
        </div>
      )}

      {/* ── Níveis ─────────────────────────────────────────────────────── */}
      <div style={{
        background: C.BG_CARD,
        border: `1.5px solid rgba(200,168,74,0.22)`,
        borderRadius: 12,
        overflow: 'hidden',
      }}>
        {/* Cabeçalho */}
        <div style={{
          background: 'rgba(200,168,74,0.1)',
          borderBottom: `1px solid rgba(200,168,74,0.2)`,
          padding: '8px 14px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <span style={{
            fontFamily: '"Cinzel",serif', fontWeight: 700,
            fontSize: '0.7rem', color: C.TEXT_PRIMARY,
            letterSpacing: '1px',
          }}>
            {nivelUnico ? 'APRIMORAMENTO' : `NÍVEIS (1 – ${pesquisa.nivelMax})`}
          </span>
          <span style={{
            fontFamily: '"Nunito",sans-serif', fontWeight: 700,
            fontSize: '0.6rem', color: C.TEXT_MUTED,
          }}>
            ⏱ TEMPO
          </span>
        </div>

        {/* Linhas */}
        {pesquisa.niveis.map((nv, i) => {
          const temTempo = nv.tempo && nv.tempo.trim() !== '';
          return (
            <div
              key={nv.nivel}
              style={{
                display: 'flex', alignItems: 'center',
                padding: '9px 14px',
                borderBottom: i < pesquisa.niveis.length - 1
                  ? `1px solid rgba(200,168,74,0.1)` : 'none',
                background: i % 2 === 0 ? 'transparent' : 'rgba(200,168,74,0.04)',
              }}
            >
              {/* Badge nível */}
              <div style={{
                width: 30, height: 30, borderRadius: 8, flexShrink: 0,
                background: `${cor}18`,
                border: `1.5px solid ${cor}35`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontFamily: '"Nunito",sans-serif', fontWeight: 900,
                fontSize: '0.78rem', color: cor,
                marginRight: 12,
              }}>
                {nv.nivel}
              </div>

              {/* Label */}
              <span style={{
                flex: 1,
                fontFamily: '"Nunito",sans-serif', fontWeight: 600,
                fontSize: '0.78rem', color: C.TEXT_SECONDARY,
              }}>
                {nivelUnico ? 'Aprimoramento único' : `Nível ${nv.nivel}`}
              </span>

              {/* Tempo */}
              {temTempo ? (
                <span style={{
                  fontFamily: '"Nunito",sans-serif', fontWeight: 800,
                  fontSize: '0.78rem', color: C.TEXT_PRIMARY,
                  background: 'rgba(200,168,74,0.12)',
                  border: '1px solid rgba(200,168,74,0.28)',
                  borderRadius: 6, padding: '2px 8px',
                }}>
                  {nv.tempo}
                </span>
              ) : (
                <span style={{
                  fontFamily: '"Nunito",sans-serif', fontWeight: 600,
                  fontSize: '0.72rem', color: C.TEXT_FAINT,
                  fontStyle: 'italic',
                }}>
                  —
                </span>
              )}
            </div>
          );
        })}

        {/* Rodapé informativo se sem tempos */}
        {!temTempos && (
          <div style={{
            padding: '8px 14px',
            borderTop: '1px solid rgba(200,168,74,0.12)',
            textAlign: 'center',
          }}>
            <span style={{
              fontFamily: '"Nunito",sans-serif', fontWeight: 600,
              fontSize: '0.65rem', color: C.TEXT_FAINT, fontStyle: 'italic',
            }}>
              Tempos serão adicionados em breve via Admin
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default PesquisaDetalhe;
