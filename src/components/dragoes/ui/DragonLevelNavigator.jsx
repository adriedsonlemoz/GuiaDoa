import React from 'react';
import { useI18n } from '../../../hooks/useI18n.jsx';

const DragonLevelNavigator = ({ levels = [], value, onChange, compact = false, label }) => {
  const { t } = useI18n();
  const normalized = [...new Set((levels || []).map(Number).filter(Number.isFinite))].sort((a,b)=>a-b);
  if (!normalized.length) return null;
  const currentIndex = Math.max(0, normalized.indexOf(Number(value)));
  const current = normalized[currentIndex] ?? normalized[0];
  const prev = normalized[currentIndex - 1];
  const next = normalized[currentIndex + 1];

  return (
    <div className={`dragon-level-nav${compact ? ' is-compact' : ''}`}>
      <button
        type="button"
        className="dragon-level-arrow"
        onClick={() => prev != null && onChange?.(prev)}
        disabled={prev == null}
        aria-label={t('dragons.previous_level')}
      >
        ‹
      </button>

      <label className="dragon-level-picker">
        <span>{label || t('dragons.attributes_at_level')}</span>
        <select value={current} onChange={e => onChange?.(Number(e.target.value))} aria-label={t('dragons.select_level')}>
          {normalized.map(level => (
            <option key={level} value={level}>{t('common.level_short')}{level}</option>
          ))}
        </select>
        {!compact ? <small>{t('dragons.confirmed_levels_count').replace('{count}', normalized.length)}</small> : null}
      </label>

      <button
        type="button"
        className="dragon-level-arrow"
        onClick={() => next != null && onChange?.(next)}
        disabled={next == null}
        aria-label={t('dragons.next_level')}
      >
        ›
      </button>
    </div>
  );
};

export default DragonLevelNavigator;
