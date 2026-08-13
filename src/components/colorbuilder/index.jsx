import React, { useEffect, useState } from 'react';
import { T, C } from './styles.js';
import { useBuilder } from './useBuilder.js';
import ModoTexto from './ModoTexto.jsx';
import ModoBandeiras from './ModoBandeiras.jsx';
import ModoFontes from './ModoFontes.jsx';
import ModoPlacar from './ModoPlacar.jsx';
import { useI18n } from '../../hooks/useI18n.jsx';

function Toast({ msg, visible }) {
  return (
    <div style={{
      position: 'fixed', bottom: 28, left: '50%',
      transform: `translateX(-50%) translateY(${visible ? '0' : '12px'})`,
      background: C.BG_HEADER,
      color: C.TEXT_HEADER,
      border: `1px solid ${C.BORDER}`,
      fontFamily: 'inherit', fontSize: '0.75rem',
      padding: '8px 18px', borderRadius: 7,
      opacity: visible ? 1 : 0,
      transition: 'opacity 0.2s, transform 0.2s',
      pointerEvents: 'none', zIndex: 10001,
      boxShadow: '0 4px 18px rgba(15,30,35,0.28)',
      whiteSpace: 'nowrap',
      maxWidth: 'calc(100vw - 28px)',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
    }}>
      {msg}
    </div>
  );
}

const MODOS = [
  { id: 'texto', labelKey: 'builder.nav.text' },
  { id: 'fontes', labelKey: 'builder.nav.fonts' },
  { id: 'bandeiras', labelKey: 'builder.nav.flags' },
  { id: 'placar', labelKey: 'builder.nav.score' },
];

export default function ColorTextBuilder({ onClose }) {
  const { t } = useI18n();
  const [modo, setModo] = useState('texto');
  const {
    activeColor, setActive,
    hexInput, setHexInput,
    cpicker, setCpicker,
    savedColors, saveColor, removeColor,
    toast, toastVis, showToast,
  } = useBuilder();

  useEffect(() => {
    const onKeyDown = event => { if (event.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [onClose]);

  return (
    <div style={T.overlay} onClick={event => { if (event.target === event.currentTarget) onClose(); }}>
      <div style={T.modal}>
        <div style={T.header}>
          <div style={T.headerLeft}>
            <span style={{ fontSize: '1rem' }}>✦</span>
            <span style={{ ...T.headerTitle, letterSpacing: '0.08em' }}>{t('builder.title')}</span>
          </div>
          <button style={T.closeBtn} onClick={onClose} title={t('builder.close_title')}>✕</button>
        </div>
        <div style={T.goldLine} />

        <div style={{
          display: 'flex',
          overflowX: 'auto',
          background: C.BG_CARD_TOP,
          borderBottom: `1px solid ${C.BORDER_SOFT}`,
          padding: '0 8px',
          scrollbarWidth: 'none',
        }}>
          {MODOS.map(item => (
            <button
              key={item.id}
              type="button"
              onClick={() => setModo(item.id)}
              style={{
                flex: '1 0 auto',
                minWidth: 80,
                border: 0,
                borderBottom: modo === item.id ? `3px solid ${C.BG_HEADER}` : '3px solid transparent',
                background: modo === item.id ? 'rgba(47,86,82,0.08)' : 'transparent',
                color: modo === item.id ? C.TEXT_PRIMARY : C.TEXT_MUTED,
                padding: '11px 10px 9px',
                font: 'inherit',
                fontSize: '0.74rem',
                fontWeight: modo === item.id ? 700 : 600,
                cursor: 'pointer',
                whiteSpace: 'nowrap',
              }}
            >
              {t(item.labelKey)}
            </button>
          ))}
        </div>

        {modo === 'texto' && (
          <ModoTexto
            activeColor={activeColor} setActive={setActive}
            hexInput={hexInput} setHexInput={setHexInput}
            cpicker={cpicker} setCpicker={setCpicker}
            savedColors={savedColors} saveColor={saveColor} removeColor={removeColor}
            showToast={showToast}
          />
        )}
        {modo === 'bandeiras' && <ModoBandeiras showToast={showToast} />}
        {modo === 'fontes' && <ModoFontes showToast={showToast} />}
        {modo === 'placar' && <ModoPlacar showToast={showToast} />}

        <Toast msg={toast} visible={toastVis} />
      </div>
    </div>
  );
}
