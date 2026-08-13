import React from 'react';
import { useI18n } from '../../hooks/useI18n.jsx';

const FILTERS = [
  ['all', 'troops.filter.all'],
  ['ranged', 'troops.filter.ranged'],
  ['melee', 'troops.filter.melee'],
  ['special', 'troops.filter.special'],
];

export default function SimpleTroopFilters({ search, setSearch, filter, setFilter }) {
  const { t } = useI18n();
  return (
    <div style={{ display:'grid', gap:7 }}>
      <div className="game-filter-row">
        <span className="game-filter-label">{t('common.filter')}:</span>
        <select className="game-field" value={filter} onChange={event => setFilter(event.target.value)}>
          {FILTERS.map(([id, key]) => <option key={id} value={id}>{t(key)}</option>)}
        </select>
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
