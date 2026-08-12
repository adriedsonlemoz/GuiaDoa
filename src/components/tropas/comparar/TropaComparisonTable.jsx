import React from 'react';
import { C } from '../../../theme.js';
import { fmtFull, ATRIBUTOS } from '../tropaUtils.js';
import { SLOT_CORES } from './config.js';
import { useI18n } from '../../../hooks/useI18n.jsx';

export default function TropaComparisonTable({ slots }) {
  const { t, content, locale } = useI18n();
  const tropasAtivas = slots.filter(Boolean);
  if (tropasAtivas.length < 2) return null;
  return (
    <div style={{ background: C.BG_CARD, border: '1.5px solid rgba(200,168,74,0.22)', borderRadius: 12, overflow: 'hidden' }}>
      <div style={{ display: 'grid', gridTemplateColumns: `1fr repeat(${tropasAtivas.length}, minmax(0,1fr))`, background: 'rgba(200,168,74,0.1)', borderBottom: '1px solid rgba(200,168,74,0.2)', padding: '6px 10px' }}>
        <span className="font-nunito font-black uppercase" style={{ fontSize: '0.58rem', color: C.TEXT_MUTED, letterSpacing: '1.5px' }}>{t('troops.attribute')}</span>
        {tropasAtivas.map(tropa => (
          <span key={tropa.nome} className="font-nunito font-black text-center" style={{ fontSize: '0.58rem', color: SLOT_CORES[slots.indexOf(tropa)], letterSpacing: '0.5px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{content(tropa, 'nome').split(' ')[0]}</span>
        ))}
      </div>
      {ATRIBUTOS.map((attr, rowIndex) => {
        const values = tropasAtivas.map(tropa => tropa[attr.id] || 0);
        const maxVal = Math.max(...values);
        return (
          <div key={attr.id} style={{ display: 'grid', gridTemplateColumns: `1fr repeat(${tropasAtivas.length}, minmax(0,1fr))`, padding: '7px 10px', borderBottom: rowIndex < ATRIBUTOS.length - 1 ? '1px solid rgba(200,168,74,0.1)' : 'none', background: rowIndex % 2 === 0 ? 'transparent' : 'rgba(200,168,74,0.03)', alignItems: 'center' }}>
            <span className="font-nunito font-semibold" style={{ fontSize: '0.65rem', color: C.TEXT_MUTED }}>{attr.icon} {attr.labelKey ? t(attr.labelKey) : attr.label}</span>
            {tropasAtivas.map(tropa => {
              const val = tropa[attr.id] || 0;
              const best = val === maxVal && maxVal > 0;
              const color = SLOT_CORES[slots.indexOf(tropa)];
              return (
                <div key={tropa.nome} style={{ textAlign: 'center' }}>
                  <span className="font-nunito font-black" style={{ fontSize: '0.75rem', color: best ? color : C.TEXT_FAINT, fontWeight: best ? 900 : 600 }}>{val === 0 ? '—' : fmtFull(val, locale)}</span>
                  <div style={{ marginTop: 2, height: 3, borderRadius: 2, overflow: 'hidden', background: 'rgba(62,47,28,0.07)' }}>
                    <div style={{ height: '100%', width: maxVal > 0 ? `${(val / maxVal) * 100}%` : '0%', background: best ? `linear-gradient(90deg,${color}80,${color})` : 'rgba(120,100,60,0.25)', borderRadius: 2, transition: 'width 0.4s ease' }} />
                  </div>
                </div>
              );
            })}
          </div>
        );
      })}
    </div>
  );
}
