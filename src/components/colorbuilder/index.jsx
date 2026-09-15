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

const TOOLS = [
  { id: 'texto', icon: '🎨', titleKey: 'builder.wizard.text_title', descKey: 'builder.wizard.text_desc', example: '[FF8C00]Shadow' },
  { id: 'fontes', icon: 'Aa', titleKey: 'builder.wizard.letters_title', descKey: 'builder.wizard.letters_desc', example: 'G⊙KU™ · ü ï ñ' },
  { id: 'bandeiras', icon: '🏳', titleKey: 'builder.wizard.flags_title', descKey: 'builder.wizard.flags_desc', example: '🇧🇷  🇫🇷  🇮🇹' },
  { id: 'placar', icon: '⚔', titleKey: 'builder.wizard.score_title', descKey: 'builder.wizard.score_desc', example: 'MID 3-1 LEG' },
];

function WizardHome({ onChoose }) {
  const { t } = useI18n();
  return (
    <div style={{ ...T.body, paddingBottom: 24 }}>
      <div style={{ padding: '4px 2px 12px' }}>
        <div style={{ fontSize: '1rem', fontWeight: 800, color: C.TEXT_PRIMARY, marginBottom: 4 }}>{t('builder.wizard.question')}</div>
        <div style={{ fontSize: '0.72rem', lineHeight: 1.55, color: C.TEXT_MUTED }}>{t('builder.wizard.help')}</div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
        {TOOLS.map(tool => (
          <button
            key={tool.id}
            type="button"
            onClick={() => onChoose(tool.id)}
            style={{
              minHeight: 142,
              padding: '13px 12px',
              textAlign: 'left',
              border: `1px solid ${C.BORDER_SOFT}`,
              borderRadius: 8,
              background: C.BG_SECONDARY,
              color: C.TEXT_PRIMARY,
              font: 'inherit',
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              gap: 7,
            }}
          >
            <span style={{ fontSize: tool.id === 'fontes' ? '1.25rem' : '1.15rem', fontWeight: 900, color: C.BG_HEADER }}>{tool.icon}</span>
            <span style={{ fontSize: '0.78rem', fontWeight: 800 }}>{t(tool.titleKey)}</span>
            <span style={{ fontSize: '.72rem', lineHeight: 1.45, color: C.TEXT_MUTED, flex: 1 }}>{t(tool.descKey)}</span>
            <span style={{ fontSize: '.72rem', color: C.TEXT_FAINT, overflowWrap: 'anywhere' }}>{tool.example}</span>
          </button>
        ))}
      </div>

      <div style={{ marginTop: 12, padding: '10px 11px', background: 'rgba(47,86,82,0.07)', border: `1px solid ${C.BORDER_SOFT}`, borderRadius: 8 }}>
        <div style={{ fontSize: '.72rem', fontWeight: 800, color: C.TEXT_PRIMARY, marginBottom: 3 }}>Aa + ✦ + ☺</div>
        <div style={{ fontSize: '.72rem', lineHeight: 1.5, color: C.TEXT_MUTED }}>{t('builder.wizard.characters_note')}</div>
      </div>
    </div>
  );
}

function ToolBar({ tool, onBack }) {
  const { t } = useI18n();
  const current = TOOLS.find(item => item.id === tool);
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 9,
      padding: '8px 10px', background: C.BG_CARD_TOP,
      borderBottom: `1px solid ${C.BORDER_SOFT}`,
      position: 'sticky', top: 52, zIndex: 8,
    }}>
      <button type="button" onClick={onBack} style={{ ...T.btnOutline, height: 30, padding: '0 9px', textTransform: 'none', letterSpacing: 0 }}>‹ {t('builder.wizard.back')}</button>
      <div style={{ minWidth: 0 }}>
        <div style={{ fontSize: '0.72rem', fontWeight: 800, color: C.TEXT_PRIMARY }}>{current ? t(current.titleKey) : ''}</div>
        <div style={{ fontSize: '.72rem', color: C.TEXT_MUTED }}>{t('builder.wizard.steps')}</div>
      </div>
    </div>
  );
}

export default function ColorTextBuilder({ onClose }) {
  const { t } = useI18n();
  const [modo, setModo] = useState(null);
  const {
    activeColor, setActive,
    hexInput, setHexInput,
    cpicker, setCpicker,
    savedColors, saveColor, removeColor,
    toast, toastVis, showToast,
  } = useBuilder();

  useEffect(() => {
    const onKeyDown = event => {
      if (event.key !== 'Escape') return;
      if (modo) setModo(null);
      else onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [onClose, modo]);

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

        {!modo && <WizardHome onChoose={setModo} />}
        {modo && <ToolBar tool={modo} onBack={() => setModo(null)} />}

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
