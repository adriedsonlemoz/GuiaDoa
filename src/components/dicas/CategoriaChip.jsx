import React from 'react';
import { C } from '../../theme.js';

const CategoriaChip = ({ cat, ativo, onClick }) => (
  <button onClick={onClick}
    style={{
      display: 'inline-flex', alignItems: 'center', gap: 5, flexShrink: 0,
      background: ativo ? C.BG_HEADER : C.BG_CARD,
      border: `1.5px solid ${ativo ? C.BG_HEADER : C.BORDER_SOFT}`,
      borderRadius: 100, padding: '6px 13px',
      cursor: 'pointer', transition: 'all 0.14s',
      fontSize: '0.74rem', fontWeight: 700, whiteSpace: 'nowrap',
      color: ativo ? '#F8F2E0' : C.TEXT_SECONDARY,
    }}
  >
    <span>{cat.icon}</span>
    <span>{cat.label}</span>
  </button>
);


export default CategoriaChip;
