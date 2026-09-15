import React from 'react';
import { KAOMOJI, ASCII_EM } from './data.js';
import { T, C } from './styles.js';
import { useI18n } from '../../hooks/useI18n.jsx';

export default function ModoEmoticons({ onInsert, showToast }) {
  const { t } = useI18n();
  return (
    <div style={T.body}>

      {/* Kaomoji */}
      <div style={T.card}>
        <div style={T.cardTitle}>
          <span style={{ color: C.ACCENT }}>ʕ•ᴥ•ʔ</span> {t('builder.kaomoji.title')}
        </div>
        <p style={{ fontSize: '.72rem', color: C.TEXT_MUTED, marginBottom: 10, lineHeight: 1.6 }}>
          {t('builder.kaomoji.help')}
        </p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
          {KAOMOJI.map((k, i) => (
            <button key={i} style={T.exBtn}
              onClick={() => {
                onInsert(k);
                showToast(t('builder.copied',{name:k}));
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
          <span style={{ color: C.ACCENT }}>:-)</span> {t('builder.ascii.title')}
        </div>
        <p style={{ fontSize: '.72rem', color: C.TEXT_MUTED, marginBottom: 10, lineHeight: 1.6 }}>
          {t('builder.ascii.help')}
        </p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
          {ASCII_EM.map((e, i) => (
            <button key={i} style={T.exBtn}
              onClick={() => {
                onInsert(e);
                showToast(t('builder.copied',{name:e}));
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
