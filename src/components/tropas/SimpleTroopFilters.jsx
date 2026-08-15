import React from 'react';
import { useI18n } from '../../hooks/useI18n.jsx';

const FILTERS = [
  ['all', 'troops.filter.all'],
  ['melee', 'troops.tactical.melee'],
  ['ranged', 'troops.tactical.ranged'],
  ['speed', 'troops.tactical.speed'],
  ['tank', 'troops.tactical.tank'],
  ['supply', 'troops.tactical.supply'],
];

export default function SimpleTroopFilters({ search, setSearch, filter, setFilter }) {
  const { t } = useI18n();
  return (
    <div className="troop-filter-stack">
      <div className="troop-role-filters" role="group" aria-label={t('common.filter')}>
        {FILTERS.map(([id, key]) => (
          <button
            key={id}
            type="button"
            className={`troop-role-filter${filter === id ? ' is-active' : ''}`}
            onClick={() => setFilter(id)}
            aria-pressed={filter === id}
          >
            {t(key)}
          </button>
        ))}
      </div>
      <div className="game-filter-row">
        <span aria-hidden="true" style={{ color:'#6b5431' }}>⌕</span>
        <input
          value={search}
          onChange={event => setSearch(event.target.value)}
          placeholder={t('troops.search')}
          className="game-field"
        />
      </div>
    </div>
  );
}
