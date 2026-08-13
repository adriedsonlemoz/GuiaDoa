import React from 'react';

const CategoriaChip = ({ cat, ativo, onClick }) => (
  <button
    onClick={onClick}
    className={`game-tab${ativo ? ' is-active' : ''}`}
    style={{ flex:'0 0 auto', minWidth:112, minHeight:35 }}
  >
    <span>{cat.icon}</span> <span>{cat.label}</span>
  </button>
);

export default CategoriaChip;
