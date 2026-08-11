import React, { useState, useEffect } from 'react';
import { T, C } from './styles.js';
import { useBuilder } from './useBuilder.js';
import ModoTexto     from './ModoTexto.jsx';
import ModoBandeiras from './ModoBandeiras.jsx';
import ModoFontes    from './ModoFontes.jsx';
import ModoPlacar    from './ModoPlacar.jsx';

// ─── Toast ────────────────────────────────────────────────────────────────────
function Toast({ msg, visible }) {
  return (
    <div style={{
      position: 'fixed', bottom: 28, left: '50%',
      transform: `translateX(-50%) translateY(${visible ? '0' : '12px'})`,
      background: 'linear-gradient(135deg,#1C3A5E,#2A4C72)',
      color: 'rgba(200,168,74,0.95)',
      border: '1px solid rgba(200,168,74,0.4)',
      fontFamily: 'inherit', fontSize: '0.75rem',
      padding: '8px 20px', borderRadius: 100,
      opacity: visible ? 1 : 0,
      transition: 'opacity 0.2s, transform 0.2s',
      pointerEvents: 'none', zIndex: 10001,
      letterSpacing: '0.05em',
      boxShadow: '0 4px 18px rgba(15,30,53,0.4)',
    }}>
      {msg}
    </div>
  );
}

// ─── Modos da tela inicial ────────────────────────────────────────────────────
const MODOS = [
  {
    id:    'texto',
    icon:  '🎨',
    title: 'Personalizar Texto',
    desc:  'Digite, insira emoticons e símbolos, depois pinte cada caractere com a cor que quiser.',
    cor:   '#9B59B6',
    tags:  ['texto', 'emoticons', 'símbolos', 'cores'],
  },
  {
    id:    'bandeiras',
    icon:  '🏳',
    title: 'Bandeiras',
    desc:  'Bandeiras coloridas com listras verticais prontas para copiar no chat.',
    cor:   '#2980B9',
    tags:  ['bandeiras', 'países', 'listras'],
  },
  {
    id:    'fontes',
    icon:  '𝓐',
    title: 'Fontes & Estilos',
    desc:  'Converta seu texto em 38+ estilos Unicode: gótico, cursivo, duplo contorno, circulado, leet e muito mais.',
    cor:   '#C0392B',
    tags:  ['gótico', 'cursivo', 'unicode', 'leet', 'estilos'],
  },
  {
    id:    'placar',
    icon:  '🏆',
    title: 'Placar de Jogos',
    desc:  'Monte o placar de uma partida com cores por time e destaque automático de quem marcou.',
    cor:   '#16A085',
    tags:  ['placar', 'futebol', 'gol', 'times'],
  },
];

const MODO_HEADERS = {
  texto:     { icon: '🎨', title: 'Personalizar Texto' },
  bandeiras: { icon: '🏳', title: 'Bandeiras'          },
  fontes:    { icon: '𝓐',  title: 'Fontes & Estilos'  },
  placar:    { icon: '🏆', title: 'Placar de Jogos'    },
};

// ─── Tela de boas-vindas ──────────────────────────────────────────────────────
function TelaBoas({ onEscolher }) {
  return (
    <div style={T.body}>

      {/* Saudação */}
      <div style={{
        textAlign: 'center', padding: '8px 0 20px',
        borderBottom: `1px solid rgba(200,168,74,0.15)`,
        marginBottom: 20,
      }}>
        <div style={{ fontSize: '2.2rem', marginBottom: 8 }}>✦</div>
        <p style={{ fontSize: '0.85rem', color: C.TEXT_PRIMARY, fontWeight: 600, marginBottom: 4, fontFamily: "'Cinzel', serif" }}>
          O que você quer fazer hoje?
        </p>
        <p style={{ fontSize: '0.72rem', color: C.TEXT_MUTED, lineHeight: 1.6 }}>
          Escolha uma das opções abaixo para começar
        </p>
      </div>

      {/* Cards de modo */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {MODOS.map((modo) => (
          <button key={modo.id} onClick={() => onEscolher(modo.id)}
            style={{
              background: C.BG_CARD,
              border: `1.5px solid rgba(200,168,74,0.22)`,
              borderRadius: 14, padding: '18px 16px',
              cursor: 'pointer', textAlign: 'left',
              display: 'flex', alignItems: 'center', gap: 16,
              transition: 'all 0.14s', position: 'relative', overflow: 'hidden',
              width: '100%',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.borderColor = modo.cor + '80';
              e.currentTarget.style.boxShadow = `0 4px 20px ${modo.cor}25`;
              e.currentTarget.style.transform = 'translateY(-2px)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.borderColor = 'rgba(200,168,74,0.22)';
              e.currentTarget.style.boxShadow = 'none';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
            onMouseDown={e  => { e.currentTarget.style.transform = 'scale(0.98)'; }}
            onMouseUp={e    => { e.currentTarget.style.transform = 'translateY(-2px)'; }}
            onTouchStart={e => { e.currentTarget.style.transform = 'scale(0.98)'; }}
            onTouchEnd={e   => { e.currentTarget.style.transform = 'translateY(0)'; }}
          >
            {/* Borda colorida esquerda */}
            <div style={{
              position: 'absolute', top: 0, left: 0, bottom: 0, width: 3,
              background: `linear-gradient(180deg,transparent,${modo.cor},transparent)`,
              opacity: 0.8,
            }} />

            {/* Ícone */}
            <div style={{
              width: 56, height: 56, borderRadius: 14, flexShrink: 0,
              background: `${modo.cor}18`,
              border: `2px solid ${modo.cor}35`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: `0 2px 10px ${modo.cor}25`,
            }}>
              <span style={{ fontSize: '1.8rem', lineHeight: 1 }}>{modo.icon}</span>
            </div>

            {/* Texto */}
            <div style={{ flex: 1 }}>
              <div style={{
                fontFamily: "'Cinzel', serif", fontWeight: 700,
                fontSize: '0.85rem', color: C.TEXT_PRIMARY,
                marginBottom: 5, letterSpacing: '0.3px',
              }}>
                {modo.title}
              </div>
              <div style={{ fontSize: '0.7rem', color: C.TEXT_MUTED, lineHeight: 1.6 }}>
                {modo.desc}
              </div>
              {/* Tags */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginTop: 8 }}>
                {modo.tags.map(tag => (
                  <span key={tag} style={{
                    fontSize: '0.58rem', padding: '2px 7px',
                    background: `${modo.cor}15`,
                    border: `1px solid ${modo.cor}30`,
                    borderRadius: 100, color: C.TEXT_MUTED,
                    letterSpacing: '0.05em', textTransform: 'uppercase',
                  }}>{tag}</span>
                ))}
              </div>
            </div>

            {/* Seta */}
            <span style={{ fontSize: '1.1rem', color: 'rgba(200,168,74,0.4)', flexShrink: 0 }}>›</span>
          </button>
        ))}
      </div>
    </div>
  );
}

// ═════════════════════════════════════════════════════════════════════════════
// RAIZ
// ═════════════════════════════════════════════════════════════════════════════
export default function ColorTextBuilder({ onClose }) {
  const [modo, setModo] = useState(null);

  const {
    activeColor, setActive,
    hexInput, setHexInput,
    cpicker, setCpicker,
    savedColors, saveColor, removeColor,
    toast, toastVis, showToast,
  } = useBuilder();

  // ESC: dentro de modo → volta; fora → fecha
  useEffect(() => {
    const fn = (e) => { if (e.key === 'Escape') { modo ? setModo(null) : onClose(); } };
    window.addEventListener('keydown', fn);
    return () => window.removeEventListener('keydown', fn);
  }, [modo, onClose]);

  const header = modo ? MODO_HEADERS[modo] : null;

  return (
    <div style={T.overlay} onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div style={T.modal}>

        {/* HEADER */}
        <div style={T.header}>
          <div style={T.headerLeft}>
            {modo && (
              <button style={T.backBtn} onClick={() => setModo(null)} title="Voltar (ESC)">←</button>
            )}
            <span style={{ fontSize: '1.1rem' }}>{header ? header.icon : '🎨'}</span>
            <span style={T.headerTitle}>
              {header ? `◆ ${header.title} ◆` : '◆ Construtor de Texto ◆'}
            </span>
          </div>
          <button style={T.closeBtn} onClick={onClose} title="Fechar (ESC)">✕</button>
        </div>
        <div style={T.goldLine} />

        {/* CONTEÚDO */}
        {!modo && <TelaBoas onEscolher={setModo} />}

        {modo === 'texto' && (
          <ModoTexto
            activeColor={activeColor} setActive={setActive}
            hexInput={hexInput} setHexInput={setHexInput}
            cpicker={cpicker} setCpicker={setCpicker}
            savedColors={savedColors} saveColor={saveColor} removeColor={removeColor}
            showToast={showToast}
          />
        )}

        {modo === 'bandeiras' && (
          <ModoBandeiras showToast={showToast} />
        )}

        {modo === 'fontes' && (
          <ModoFontes showToast={showToast} />
        )}

        {modo === 'placar' && (
          <ModoPlacar showToast={showToast} />
        )}

        <Toast msg={toast} visible={toastVis} />
      </div>
    </div>
  );
}
