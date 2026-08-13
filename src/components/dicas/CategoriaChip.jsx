import React from 'react';
import { C } from '../../theme.js';

const CategoriaChip = ({ cat, ativo, onClick }) => (
  <button
    onClick={onClick}
    style={{
      display: 'inline-flex', alignItems: 'center', gap: 5, flexShrink: 0,
      background: ativo ? `linear-gradient(180deg, ${C.ACCENT}, ${C.ACCENT_HOVER})` : C.BG_CARD,
      border: `1.5px solid ${ativo ? C.BORDER_STRONG : C.BORDER_SOFT}`,
      borderRadius: 100, padding: '6px 13px',
      cursor: 'pointer', transition: 'all 0.14s',
      fontSize: '0.74rem', fontWeight: 700, whiteSpace: 'nowrap',
      color: ativo ? C.TEXT_HEADER : C.TEXT_SECONDARY,
      boxShadow: ativo ? '0 3px 9px rgba(62,47,28,.12)' : 'none',
    }}
  >
    <span>{cat.icon}</span>
    <span>{cat.label}</span>
  </button>
);

export default CategoriaChip;
