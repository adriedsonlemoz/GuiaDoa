import React, { useState } from 'react';
import { SYM_CATS } from './data.js';
import { T, C } from './styles.js';

export default function ModoSimbolos({ onInsert, showToast }) {
  const [catIdx, setCatIdx] = useState(0);

  return (
    <div style={T.body}>
      <div style={T.card}>
        <div style={T.cardTitle}>
          <span style={{ color: C.ACCENT }}>✦</span> Símbolos por categoria
        </div>
        <p style={{ fontSize: '0.67rem', color: C.TEXT_MUTED, marginBottom: 12, lineHeight: 1.6 }}>
          Clique em qualquer símbolo para copiar.
        </p>

        {/* Tabs de categoria */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginBottom: 12 }}>
          {SYM_CATS.map((cat, i) => (
            <button key={i} style={T.catTab(catIdx === i)} onClick={() => setCatIdx(i)}>
              {cat.name}
            </button>
          ))}
        </div>

        {/* Grade de símbolos */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
          {SYM_CATS[catIdx].s.map((s, i) => (
            <button key={i} style={T.exSym}
              onClick={() => {
                onInsert(s);
                showToast(`"${s}" copiado!`);
              }}
              title={`Copiar: ${s}`}
            >
              {s}
            </button>
          ))}
        </div>

        {/* Contador */}
        <p style={{ fontSize: '0.62rem', color: C.TEXT_FAINT, marginTop: 10, textAlign: 'right' }}>
          {SYM_CATS[catIdx].s.length} símbolos nesta categoria
        </p>
      </div>
    </div>
  );
}
