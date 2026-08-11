import React from 'react';
import { KAOMOJI, ASCII_EM } from './data.js';
import { T, C } from './styles.js';

export default function ModoEmoticons({ onInsert, showToast }) {
  return (
    <div style={T.body}>

      {/* Kaomoji */}
      <div style={T.card}>
        <div style={T.cardTitle}>
          <span style={{ color: C.ACCENT }}>ʕ•ᴥ•ʔ</span> Kaomoji japoneses
        </div>
        <p style={{ fontSize: '0.67rem', color: C.TEXT_MUTED, marginBottom: 10, lineHeight: 1.6 }}>
          Clique para copiar direto para a área de transferência.
        </p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
          {KAOMOJI.map((k, i) => (
            <button key={i} style={T.exBtn}
              onClick={() => {
                onInsert(k);
                showToast(`${k} copiado!`);
              }}
            >
              {k}
            </button>
          ))}
        </div>
      </div>

      {/* ASCII */}
      <div style={T.card}>
        <div style={T.cardTitle}>
          <span style={{ color: C.ACCENT }}>:-)</span> ASCII Emoticons
        </div>
        <p style={{ fontSize: '0.67rem', color: C.TEXT_MUTED, marginBottom: 10, lineHeight: 1.6 }}>
          Emoticons clássicos compatíveis com qualquer fonte.
        </p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
          {ASCII_EM.map((e, i) => (
            <button key={i} style={T.exBtn}
              onClick={() => {
                onInsert(e);
                showToast(`${e} copiado!`);
              }}
            >
              {e}
            </button>
          ))}
        </div>
      </div>

    </div>
  );
}
