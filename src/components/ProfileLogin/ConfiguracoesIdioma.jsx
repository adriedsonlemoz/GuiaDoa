import React from 'react';
import { C } from '../../theme.js';
import { useI18n, LOCALES_DISPONIVEIS } from '../../hooks/useI18n.jsx';

export default function ConfiguracoesIdioma({ onVoltar }) {
  const { locale, setLocale, carregando } = useI18n();

  const handleEscolher = (code) => {
    setLocale(code);
  };

  return (
    <div style={{
      minHeight: '100dvh', display: 'flex', flexDirection: 'column',
      background: C.BG_MAIN,
    }}>

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div style={{
        background: 'linear-gradient(135deg,#1C3A5E,#2A4C72)',
        borderBottom: '2px solid rgba(200,168,74,0.4)',
        padding: '12px 16px',
        display: 'flex', alignItems: 'center', gap: 12,
        position: 'sticky', top: 0, zIndex: 10,
      }}>
        <button onClick={onVoltar} style={{
          width: 34, height: 34, background: 'transparent',
          border: '1.5px solid rgba(200,168,74,0.3)', borderRadius: 8,
          color: 'rgba(200,168,74,0.8)', fontSize: '1rem',
          cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0,
        }}>←</button>
        <div style={{ flex: 1 }}>
          <p style={{
            fontFamily: '"Cinzel",serif', fontWeight: 700,
            fontSize: '0.82rem', letterSpacing: '2px',
            color: 'rgba(200,168,74,0.9)', textTransform: 'uppercase', margin: 0,
          }}>◆ Idioma / Language ◆</p>
        </div>
        <span style={{ fontSize: '1.4rem' }}>🌐</span>
      </div>
      <div style={{ height: 2, background: 'linear-gradient(90deg,transparent,rgba(200,168,74,0.5),transparent)' }} />

      {/* ── Corpo ──────────────────────────────────────────────────────────── */}
      <div style={{ flex: 1, padding: '24px 16px', maxWidth: 480, width: '100%', margin: '0 auto' }}>

        {/* Status atual */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 10,
          padding: '12px 16px', marginBottom: 24,
          background: 'linear-gradient(90deg,rgba(28,58,94,0.1),rgba(200,168,74,0.06))',
          border: '1.5px solid rgba(200,168,74,0.3)',
          borderRadius: 12,
        }}>
          <span style={{ fontSize: '1.5rem' }}>
            {LOCALES_DISPONIVEIS.find(l => l.code === locale)?.flag || '🌐'}
          </span>
          <div>
            <p style={{
              fontFamily: '"Nunito",sans-serif', fontWeight: 900,
              fontSize: '0.65rem', color: C.TEXT_MUTED,
              textTransform: 'uppercase', letterSpacing: '1px', margin: '0 0 2px',
            }}>Idioma atual / Current language</p>
            <p style={{
              fontFamily: '"Nunito",sans-serif', fontWeight: 700,
              fontSize: '0.88rem', color: C.TEXT_PRIMARY, margin: 0,
            }}>
              {LOCALES_DISPONIVEIS.find(l => l.code === locale)?.nativo || locale}
            </p>
          </div>
          {carregando && (
            <span style={{
              marginLeft: 'auto', fontSize: '0.68rem', color: C.TEXT_MUTED,
              fontFamily: '"Nunito",sans-serif',
            }}>carregando…</span>
          )}
        </div>

        {/* Lista de idiomas */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {LOCALES_DISPONIVEIS.map(loc => {
            const ativo = locale === loc.code;
            return (
              <button key={loc.code}
                onClick={() => handleEscolher(loc.code)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 16,
                  padding: '16px 18px',
                  background: ativo
                    ? 'linear-gradient(90deg,rgba(28,58,94,0.12),rgba(200,168,74,0.08))'
                    : C.BG_CARD,
                  border: `1.5px solid ${ativo ? 'rgba(200,168,74,0.55)' : 'rgba(200,168,74,0.22)'}`,
                  borderLeft: `4px solid ${ativo ? C.ACCENT : 'transparent'}`,
                  borderRadius: 12, cursor: 'pointer', textAlign: 'left',
                  transition: 'all 0.15s', width: '100%',
                  boxShadow: ativo ? '0 2px 14px rgba(200,168,74,0.12)' : 'none',
                }}
                onMouseEnter={e => {
                  if (!ativo) e.currentTarget.style.borderColor = 'rgba(200,168,74,0.45)';
                  e.currentTarget.style.transform = 'translateX(2px)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.borderColor = ativo ? 'rgba(200,168,74,0.55)' : 'rgba(200,168,74,0.22)';
                  e.currentTarget.style.transform = 'none';
                }}
              >
                {/* Bandeira */}
                <span style={{ fontSize: '2rem', lineHeight: 1, flexShrink: 0 }}>{loc.flag}</span>

                {/* Nome */}
                <div style={{ flex: 1 }}>
                  <span style={{
                    display: 'block',
                    fontFamily: '"Nunito",sans-serif', fontWeight: 900,
                    fontSize: '1rem', color: C.TEXT_PRIMARY,
                  }}>{loc.nativo}</span>
                  <span style={{
                    fontFamily: '"Nunito",sans-serif', fontWeight: 600,
                    fontSize: '0.7rem', color: C.TEXT_MUTED,
                  }}>{loc.label}</span>
                </div>

                {/* Indicadores */}
                {ativo ? (
                  <div style={{
                    display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0,
                  }}>
                    <span style={{
                      fontSize: '0.62rem', padding: '2px 8px',
                      background: 'rgba(200,168,74,0.15)',
                      border: '1px solid rgba(200,168,74,0.4)',
                      borderRadius: 100, color: C.ACCENT,
                      fontFamily: '"Nunito",sans-serif', fontWeight: 700,
                      textTransform: 'uppercase', letterSpacing: '0.05em',
                    }}>Ativo</span>
                    <span style={{ color: C.ACCENT, fontSize: '1.1rem' }}>✓</span>
                  </div>
                ) : (
                  <span style={{ color: C.TEXT_FAINT, fontSize: '1rem', flexShrink: 0 }}>›</span>
                )}
              </button>
            );
          })}
        </div>

        {/* Nota */}
        <div style={{
          marginTop: 28, padding: '12px 16px',
          background: 'rgba(200,168,74,0.05)',
          border: '1px dashed rgba(200,168,74,0.3)',
          borderRadius: 10,
        }}>
          <p style={{
            fontFamily: '"Nunito",sans-serif', fontWeight: 700,
            fontSize: '0.68rem', color: C.TEXT_MUTED,
            lineHeight: 1.6, margin: 0,
          }}>
            💡 Traduções em inglês são geradas automaticamente e revisadas pelo administrador.
            Alguns termos específicos do jogo podem aparecer em português.
          </p>
        </div>

      </div>
    </div>
  );
}
