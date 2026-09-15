import React from 'react';
import { useI18n } from '../../hooks/useI18n.jsx';
import { formatNumber } from './niveisUtils.js';

export default function NiveisHistory({ historico, restoreHistory }) {
  const { t, locale } = useI18n();
  if (!historico.length) return null;
  return (
    <details className="game-panel" style={{ marginBottom:10 }}>
      <summary style={{ cursor:'pointer', padding:'10px 12px', fontWeight:800, color:'#334d48' }}>{t('levels.history')} · {historico.length}</summary>
      <div style={{ borderTop:'1px solid rgba(121,96,53,.25)' }}>
        {historico.map((item,index) => (
          <button type="button" key={`${item.at}-${index}`} className="game-list-row" style={{ alignItems:'center', padding:'9px 11px' }} onClick={()=>restoreHistory(item.power)}>
            <div style={{ flex:1 }}>
              <div className="game-list-name">{formatNumber(item.power, locale)}</div>
              <div className="game-list-copy">{new Date(item.at).toLocaleString(locale, { dateStyle:'short', timeStyle:'short' })}</div>
            </div>
            <span style={{ fontWeight:900 }}>↺</span>
          </button>
        ))}
      </div>
    </details>
  );
}
