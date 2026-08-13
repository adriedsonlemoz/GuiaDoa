import React from 'react';
import { fmtFull, ATRIBUTOS } from '../tropaUtils.js';
import { SLOT_CORES } from './config.js';
import { useI18n } from '../../../hooks/useI18n.jsx';

export default function TropaComparisonTable({ slots }) {
  const { t, content, locale } = useI18n();
  const tropasAtivas = slots.filter(Boolean);
  if (tropasAtivas.length < 2) return null;

  return (
    <div className="game-info-table-wrap">
      <div className="game-info-table-head" style={{ gridTemplateColumns:`1.1fr repeat(${tropasAtivas.length}, minmax(0,1fr))` }}>
        <span>{t('troops.attribute')}</span>
        {tropasAtivas.map(tropa => (
          <span key={tropa.nome} style={{ overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{content(tropa,'nome').split(' ')[0]}</span>
        ))}
      </div>
      <div className="game-info-table-body">
        {ATRIBUTOS.map(attr => {
          const values = tropasAtivas.map(tropa => Number(tropa[attr.id]) || 0);
          const maxVal = Math.max(...values);
          return (
            <div key={attr.id} className="game-info-table-row" style={{ gridTemplateColumns:`1.1fr repeat(${tropasAtivas.length}, minmax(0,1fr))` }}>
              <span className="game-info-label">{attr.icon} {attr.labelKey ? t(attr.labelKey) : attr.label}</span>
              {tropasAtivas.map(tropa => {
                const value = Number(tropa[attr.id]) || 0;
                const best = value === maxVal && maxVal > 0;
                const color = SLOT_CORES[slots.indexOf(tropa)] || '#3D746B';
                return (
                  <span key={tropa.nome} style={{ textAlign:'center', color:best ? '#FFF08A' : '#F1E4C2', fontWeight:best ? 850 : 650 }}>
                    {value ? fmtFull(value, locale) : '—'}
                    {best ? <span style={{ color, marginLeft:3 }}>▲</span> : null}
                  </span>
                );
              })}
            </div>
          );
        })}
      </div>
    </div>
  );
}
