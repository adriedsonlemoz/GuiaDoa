import React, { useEffect, useRef, useState } from 'react';
import { C } from '../../theme.js';
import { useGameData } from '../../data/GameDataContext.jsx';
import { useI18n } from '../../hooks/useI18n.jsx';

/* ─── helpers ───────────────────────────────────────────────────────────────── */
// REGIOES agora é calculado dinamicamente dentro do ReinoSelector, a partir dos reinos carregados da API.

const ReinoCard = ({ reino, selecionado, onClick }) => {
  const { content } = useI18n();
  const meta = [content(reino, 'regiao'), content(reino, 'idioma')].filter(Boolean).join(' · ');
  return (
  <button
    type="button"
    onClick={() => onClick(reino)}
    style={{
      display: 'flex', alignItems: 'center', gap: 10,
      width: '100%', textAlign: 'left',
      padding: '9px 12px',
      background: selecionado
        ? 'linear-gradient(90deg,rgba(49,72,74,0.18),rgba(200,168,74,0.10))'
        : 'transparent',
      border: 'none',
      borderBottom: `1px solid rgba(200,168,74,0.12)`,
      borderLeft: selecionado ? '3px solid #C8A84A' : '3px solid transparent',
      cursor: 'pointer',
      transition: 'all 0.15s',
    }}
  >
    {/* Nome + metadados */}
    <span style={{ flex: 1, minWidth: 0 }}>
      <span style={{
        display: 'block',
        fontFamily: '"Nunito",sans-serif', fontWeight: 900,
        fontSize: '0.82rem',
        color: selecionado ? C.TEXT_PRIMARY : C.TEXT_SECONDARY,
        whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
      }}>
        {content(reino, 'nome')}
      </span>
      {meta && <span style={{
        fontFamily: '"Nunito",sans-serif', fontWeight: 600,
        fontSize: '0.62rem', color: C.TEXT_FAINT,
      }}>
        {meta}
      </span>}
    </span>

    {/* Fuso */}
    <span style={{
      fontFamily: 'monospace', fontWeight: 800, fontSize: '0.7rem',
      color: selecionado ? C.ACCENT : C.TEXT_MUTED,
      background: selecionado ? 'rgba(200,168,74,0.15)' : 'rgba(200,168,74,0.06)',
      border: `1px solid ${selecionado ? 'rgba(200,168,74,0.5)' : 'rgba(200,168,74,0.2)'}`,
      borderRadius: 5, padding: '2px 6px', flexShrink: 0,
    }}>
      {reino.fuso}
    </span>
  </button>
  );
};

/* ─── Seletor customizado ───────────────────────────────────────────────────── */
const ReinoSelector = ({ value, onChange }) => {
  const [aberto,   setAberto]   = useState(false);
  const [regiao,   setRegiao]   = useState('');
  const { reinos, loading: carregando } = useGameData();
  const { t, content } = useI18n();
  const painelRef = useRef(null);

  const selecionado = reinos.find(r => r.nome === value) || null;
  const metaSelecionado = selecionado ? [content(selecionado, 'regiao'), content(selecionado, 'idioma')].filter(Boolean).join(' · ') : '';
  const REGIOES = [...new Set(reinos.map(r => r.regiao).filter(Boolean))].sort();

  // Fecha ao clicar fora — sem foco automático em nenhum input (evita abrir teclado)
  useEffect(() => {
    if (!aberto) return;
    const fn = e => {
      if (painelRef.current && !painelRef.current.contains(e.target)) setAberto(false);
    };
    document.addEventListener('mousedown', fn);
    return () => document.removeEventListener('mousedown', fn);
  }, [aberto]);

  const filtrados = reinos
    .filter(r => !regiao || r.regiao === regiao)
    .sort((a, b) => b.id - a.id); // maior ID primeiro

  const selecionar = reino => {
    onChange(reino);
    setAberto(false);
  };

  return (
    <div ref={painelRef} style={{ position: 'relative' }}>
      {/* Trigger */}
      <button
        type="button"
        onClick={() => setAberto(o => !o)}
        style={{
          width: '100%', display: 'flex', alignItems: 'center', gap: 10,
          padding: '9px 12px',
          background: '#F8F4E8',
          border: `1.5px solid ${aberto ? C.ACCENT_DEEP : C.BORDER}`,
          borderRadius: aberto ? '8px 8px 0 0' : 8,
          cursor: 'pointer', textAlign: 'left',
          boxShadow: aberto ? `0 0 0 3px rgba(200,168,74,0.15)` : 'none',
          transition: 'all 0.15s',
        }}
      >
        {selecionado ? (
          <>
            <span style={{ flex: 1 }}>
              <span style={{
                display: 'block', fontFamily: '"Nunito",sans-serif',
                fontWeight: 900, fontSize: '0.85rem', color: C.TEXT_PRIMARY,
              }}>
                {content(selecionado, 'nome')}
              </span>
              {metaSelecionado && <span style={{
                fontFamily: '"Nunito",sans-serif', fontWeight: 600,
                fontSize: '0.62rem', color: C.TEXT_FAINT,
              }}>
                {metaSelecionado}
              </span>}
            </span>
            <span style={{
              fontFamily: 'monospace', fontWeight: 800, fontSize: '0.7rem',
              color: C.ACCENT, background: 'rgba(200,168,74,0.12)',
              border: '1px solid rgba(200,168,74,0.35)',
              borderRadius: 5, padding: '2px 6px', flexShrink: 0,
            }}>{selecionado.fuso}</span>
          </>
        ) : (
          <span style={{
            fontFamily: '"Nunito",sans-serif', fontWeight: 700,
            fontSize: '0.82rem', color: C.TEXT_FAINT, flex: 1,
          }}>
            — {t('profile.select_realm')} —
          </span>
        )}
        <span style={{
          color: C.TEXT_FAINT, fontSize: '0.75rem',
          transform: aberto ? 'rotate(180deg)' : 'none',
          transition: 'transform 0.2s', flexShrink: 0,
        }}>▾</span>
      </button>

      {/* Dropdown */}
      {aberto && (
        <div style={{
          position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 999,
          background: '#F2EADA',
          border: `1.5px solid ${C.BORDER}`,
          borderTop: `1px solid rgba(200,168,74,0.3)`,
          borderRadius: '0 0 10px 10px',
          boxShadow: '0 8px 24px rgba(62,47,28,0.20)',
          overflow: 'hidden',
        }}>
          {/* Filtro de região — select não abre teclado virtual */}
          <div style={{
            padding: '8px 10px', borderBottom: `1px solid rgba(200,168,74,0.2)`,
            background: '#EAE0C8', display: 'flex', gap: 6, alignItems: 'center',
          }}>
            <span style={{
              fontFamily: '"Nunito",sans-serif', fontWeight: 700,
              fontSize: '0.7rem', color: C.TEXT_SECONDARY, flexShrink: 0,
            }}>{t('profile.filter')}:</span>
            <select
              value={regiao}
              onChange={e => setRegiao(e.target.value)}
              style={{
                flex: 1, fontFamily: '"Nunito",sans-serif', fontWeight: 700,
                fontSize: '0.74rem', background: '#F8F4E8',
                border: `1.5px solid ${C.BORDER}`, borderRadius: 6,
                padding: '6px 8px', color: C.TEXT_SECONDARY, cursor: 'pointer',
              }}
            >
              <option value="">{t('profile.all_regions')}</option>
              {REGIOES.map(r => { const ex = reinos.find(item => item.regiao === r); return <option key={r} value={r}>{ex ? content(ex, 'regiao') : r}</option>; })}
            </select>
          </div>

          {/* Lista rolável — sem input de texto, sem teclado */}
          <div style={{ maxHeight: 260, overflowY: 'auto' }}>
            {carregando ? (
              <div style={{
                padding: '18px', textAlign: 'center',
                fontFamily: '"Nunito",sans-serif', fontWeight: 700,
                fontSize: '0.78rem', color: C.TEXT_FAINT,
              }}>
                {t('profile.loading_realms')}
              </div>
            ) : filtrados.length === 0 ? (
              <div style={{
                padding: '18px', textAlign: 'center',
                fontFamily: '"Nunito",sans-serif', fontWeight: 700,
                fontSize: '0.78rem', color: C.TEXT_FAINT,
              }}>
                {t('profile.no_realms')}
              </div>
            ) : filtrados.map(r => (
              <ReinoCard
                key={r.id}
                reino={r}
                selecionado={value === r.nome}
                onClick={selecionar}
              />
            ))}
          </div>

          {/* Rodapé contagem */}
          <div style={{
            padding: '5px 12px', background: '#EAE0C8',
            borderTop: `1px solid rgba(200,168,74,0.2)`,
            fontFamily: '"Nunito",sans-serif', fontWeight: 700,
            fontSize: '0.62rem', color: C.TEXT_FAINT,
          }}>
            {t('profile.realm_count', { shown: filtrados.length, total: reinos.length })}
          </div>
        </div>
      )}
    </div>
  );
};

/* ─── ProfileForm ───────────────────────────────────────────────────────────── */

export default ReinoSelector;
