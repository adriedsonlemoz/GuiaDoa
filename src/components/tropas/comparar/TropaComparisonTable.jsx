import React from 'react';
import { fmtFull, ATRIBUTOS } from '../tropaUtils.js';
import { SLOT_CORES } from './config.js';
import { useI18n } from '../../../hooks/useI18n.jsx';

export default function TropaComparisonTable({ slots }) {
  const { t, content, locale } = useI18n();
  const tropasAtivas = slots.filter(Boolean);
  if (tropasAtivas.length < 2) return null;

  return (
    <div className="troop-compare-table-block">
      <div className="game-info-table-wrap troop-compare-table">
        <div className="game-info-table-head troop-compare-grid">
          <span className="troop-compare-attribute-head">{t('troops.attribute')}</span>
          {slots.map((tropa, index) => (
            <span
              key={`head-${index}`}
              className={`troop-compare-column-head${tropa ? '' : ' is-empty'}`}
              style={{ '--slot-color': SLOT_CORES[index] }}
              title={tropa ? content(tropa, 'nome') : t('troops.slot', { number:index + 1 })}
            >
              {tropa ? content(tropa, 'nome') : t('troops.slot', { number:index + 1 })}
            </span>
          ))}
        </div>

        <div className="game-info-table-body troop-compare-table-body">
          {ATRIBUTOS.map(attr => {
            const values = slots.map(tropa => (tropa ? Number(tropa[attr.id]) || 0 : null));
            const activeValues = values.filter(value => value !== null);
            const maxVal = Math.max(...activeValues, 0);

            return (
              <div key={attr.id} className="game-info-table-row troop-compare-grid troop-compare-row">
                <span className="game-info-label troop-compare-attribute-label">{attr.icon} {attr.labelKey ? t(attr.labelKey) : attr.label}</span>
                {slots.map((tropa, index) => {
                  if (!tropa) {
                    return <span key={`empty-${index}`} className="troop-compare-empty-value" aria-hidden="true">—</span>;
                  }

                  const value = values[index];
                  const best = value === maxVal && maxVal > 0;
                  return (
                    <span key={`${tropa.nome}-${index}`} className={`troop-compare-value${best ? ' is-best' : ''}`}>
                      {value ? fmtFull(value, locale) : '—'}
                      {best ? <span className="troop-compare-best-marker" style={{ color:SLOT_CORES[index] }}>▲</span> : null}
                    </span>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>
      <p className="troop-compare-legend">{t('troops.compare_best_legend')}</p>
    </div>
  );
}
