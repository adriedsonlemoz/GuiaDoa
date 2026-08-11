import React, { useEffect } from 'react';
import { C } from '../../theme.js';
import { getIcone, getTipoAtaque, fmtFull, ATRIBUTOS } from './tropaUtils.js';

/* ── Barra de atributo ───────────────────────────────────────────────────── */
const StatRow = ({ icon, label, value, color, max }) => {
  const empty = !value || value === 0;
  const pct   = max > 0 ? Math.min(100, (value / max) * 100) : 0;
  return (
    <div style={{ marginBottom: 10 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
        <span className="font-nunito font-bold"
          style={{ fontSize: '0.7rem', color: C.TEXT_MUTED }}>
          {icon} {label}
        </span>
        <span className="font-nunito font-bold"
          style={{ fontSize: '0.78rem', color: empty ? C.TEXT_FAINT : color }}>
          {empty ? '—' : fmtFull(value)}
        </span>
      </div>
      <div style={{
        height: 8, borderRadius: 4, overflow: 'hidden',
        background: 'rgba(62,47,28,0.07)',
        border: '1px solid rgba(62,47,28,0.08)',
      }}>
        <div style={{
          height: '100%', width: `${pct}%`,
          background: empty ? 'transparent' : `linear-gradient(90deg, ${color}55, ${color})`,
          borderRadius: 4, transition: 'width 0.35s ease',
        }} />
      </div>
    </div>
  );
};

/* ── Modal ───────────────────────────────────────────────────────────────── */
const TropaModal = ({ tropa, onFechar }) => {
  // Fecha com ESC no desktop
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onFechar(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onFechar]);

  // Trava scroll do body
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  if (!tropa) return null;

  const tipo = getTipoAtaque(tropa);

  return (
    /* Backdrop */
    <div
      onClick={onFechar}
      style={{
        position: 'fixed', inset: 0, zIndex: 1000,
        background: 'rgba(20,14,8,0.72)',
        display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
        padding: '0',
        animation: 'fadeIn 0.18s ease',
      }}
    >
      {/* Sheet — clique interno não fecha */}
      <div
        onClick={e => e.stopPropagation()}
        style={{
          width: '100%', maxWidth: 480,
          maxHeight: '88vh',
          background: C.BG_MAIN,
          borderRadius: '18px 18px 0 0',
          overflow: 'hidden',
          display: 'flex', flexDirection: 'column',
          animation: 'slideUp 0.22s ease',
          boxShadow: '0 -8px 32px rgba(0,0,0,0.4)',
        }}
      >
        {/* ── Handle + Header ──────────────────────────────────────────── */}
        <div style={{
          background: 'linear-gradient(135deg,#1C3A5E,#2A4C72)',
          padding: '10px 16px 14px',
          borderBottom: `1px solid rgba(200,168,74,0.3)`,
          flexShrink: 0,
        }}>
          {/* Handle visual */}
          <div style={{
            width: 40, height: 4, borderRadius: 2,
            background: 'rgba(248,242,224,0.3)',
            margin: '0 auto 12px',
          }} />

          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            {/* Ícone grande */}
            <div style={{
              width: 54, height: 54, borderRadius: 13, flexShrink: 0,
              background: `${tipo.color}18`,
              border: `2px solid ${tipo.color}40`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '2rem',
              boxShadow: `0 2px 12px ${tipo.color}30`,
            }}>
              {getIcone(tropa.nome)}
            </div>

            <div style={{ flex: 1, minWidth: 0 }}>
              <h2 className="font-cinzel font-bold m-0"
                style={{ fontSize: '1rem', color: '#F8F2E0', lineHeight: 1.2, marginBottom: 5 }}>
                {tropa.nome}
              </h2>
              <div style={{ display: 'flex', gap: 6, alignItems: 'center', flexWrap: 'wrap' }}>
                <span className="font-nunito font-black"
                  style={{
                    fontSize: '0.62rem', padding: '2px 8px', borderRadius: 10,
                    background: `${tipo.color}22`, border: `1px solid ${tipo.color}55`,
                    color: tipo.color,
                  }}>
                  {tipo.label}
                </span>
                <span className="font-nunito font-black"
                  style={{
                    fontSize: '0.68rem', padding: '2px 10px', borderRadius: 10,
                    background: 'rgba(124,58,237,0.18)', border: '1px solid rgba(124,58,237,0.4)',
                    color: '#a78bfa',
                  }}>
                  ⭐ {tropa.poder} poder
                </span>
              </div>
            </div>

            {/* Botão fechar */}
            <button
              onClick={onFechar}
              style={{
                width: 32, height: 32, borderRadius: 8, flexShrink: 0,
                background: 'rgba(248,242,224,0.1)',
                border: '1px solid rgba(248,242,224,0.2)',
                color: 'rgba(248,242,224,0.7)', fontSize: '1rem',
                cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
              ✕
            </button>
          </div>
        </div>

        {/* ── Corpo com scroll ─────────────────────────────────────────── */}
        <div style={{ overflowY: 'auto', flex: 1, padding: '14px 16px 24px' }}>

          {/* Descrição */}
          {tropa.desc && (
            <div style={{
              background: 'rgba(200,168,74,0.08)',
              border: `1px solid rgba(200,168,74,0.22)`,
              borderRadius: 10, padding: '10px 12px', marginBottom: 14,
            }}>
              <p className="font-nunito font-semibold m-0"
                style={{ fontSize: '0.8rem', color: C.TEXT_SECONDARY, lineHeight: 1.6, fontStyle: 'italic' }}>
                {tropa.desc}
              </p>
            </div>
          )}

          {/* Atributos */}
          <div style={{ marginBottom: 4 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
              <div style={{ flex: 1, height: 1, background: `linear-gradient(90deg,transparent,${C.BORDER_SOFT})` }} />
              <span className="font-nunito font-black uppercase tracking-widest"
                style={{ fontSize: '0.6rem', color: C.TEXT_MUTED }}>
                Atributos
              </span>
              <div style={{ flex: 1, height: 1, background: `linear-gradient(270deg,transparent,${C.BORDER_SOFT})` }} />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
              {ATRIBUTOS.map(attr => (
                <StatRow key={attr.id}
                  icon={attr.icon} label={attr.label}
                  value={tropa[attr.id]} color={attr.color} max={attr.max}
                />
              ))}
            </div>
          </div>

          {/* Seções futuras */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            {[{ icon: '📋', title: 'REQUISITOS' }, { icon: '🔮', title: 'AMULETOS' }].map(sec => (
              <div key={sec.title} style={{
                padding: '10px 8px', borderRadius: 8, textAlign: 'center',
                border: `1px dashed ${C.BORDER_SOFT}`,
                background: 'rgba(184,150,90,0.04)',
              }}>
                <span className="font-nunito font-bold block"
                  style={{ fontSize: '0.65rem', color: C.TEXT_MUTED, letterSpacing: '1px' }}>
                  {sec.icon} {sec.title}
                </span>
                <span className="font-nunito"
                  style={{ fontSize: '0.65rem', color: C.TEXT_FAINT, fontStyle: 'italic' }}>
                  Em breve
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TropaModal;
