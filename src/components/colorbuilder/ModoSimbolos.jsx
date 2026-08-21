import React, { useState } from 'react';
import { SYM_CATS } from './data.js';
import { T, C } from './styles.js';
import { useI18n } from '../../hooks/useI18n.jsx';

export default function ModoSimbolos({ onInsert, showToast }) {
  const { t } = useI18n();
  const [catIdx, setCatIdx] = useState(0);

  return (
    <div style={T.body}>
      <div style={T.card}>
        <div style={T.cardTitle}>
          <span style={{ color: C.ACCENT }}>✦</span> {t('builder.symbols.title')}
        </div>
        <p style={{ fontSize: '.72rem', color: C.TEXT_MUTED, marginBottom: 12, lineHeight: 1.6 }}>
          {t('builder.symbols.help')}
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
                showToast(t('builder.copied',{name:s}));
              }}
              title={t('builder.symbols.copy_title',{value:s})}
            >
              {s}
            </button>
          ))}
        </div>

        {/* Contador */}
        <p style={{ fontSize: '.72rem', color: C.TEXT_FAINT, marginTop: 10, textAlign: 'right' }}>
          {t('builder.symbols.count',{count:SYM_CATS[catIdx].s.length})}
        </p>
      </div>
    </div>
  );
}
