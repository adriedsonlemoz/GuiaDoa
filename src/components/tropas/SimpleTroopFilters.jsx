import React from 'react';
import { useI18n } from '../../hooks/useI18n.jsx';

const FILTERS = [
  ['all', 'troops.filter.all'],
  ['melee', 'troops.tactical.melee'],
  ['ranged', 'troops.tactical.ranged'],
  ['ranged_only', 'troops.filter.ranged_only'],
  ['hybrid', 'troops.filter.hybrid'],
  ['speed', 'troops.tactical.speed'],
  ['tank', 'troops.tactical.tank'],
  ['supply', 'troops.tactical.supply'],
];

const SORTS = [
  ['name', 'troops.sort.name'],
  ['life', 'troops.sort.life'],
  ['defense', 'troops.sort.defense'],
  ['speed', 'troops.sort.speed'],
  ['load', 'troops.sort.load'],
  ['ranged_attack', 'troops.sort.ranged_attack'],
  ['melee_attack', 'troops.sort.melee_attack'],
  ['range', 'troops.sort.range'],
  ['power', 'troops.sort.power'],
  ['balance', 'troops.sort.balance'],
];

export default function SimpleTroopFilters({ search, setSearch, filter, setFilter, sort, setSort, counts = {} }) {
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
            {t(key)}{Number.isFinite(counts[id]) ? <small>{counts[id]}</small> : null}
          </button>
        ))}
      </div>

      <div className="troop-filter-tools">
        <div className="game-filter-row troop-search-row">
          <span aria-hidden="true" style={{ color:'#6b5431' }}>⌕</span>
          <input value={search} onChange={event => setSearch(event.target.value)} placeholder={t('troops.search')} className="game-field" />
        </div>
        <label className="troop-sort-control">
          <span>↕ {t('troops.sort.label')}</span>
          <select value={sort} onChange={event => setSort(event.target.value)} aria-label={t('troops.sort.label')}>
            {SORTS.map(([id, key]) => <option key={id} value={id}>{t(key)}</option>)}
          </select>
        </label>
      </div>

      {sort === 'balance' ? <p className="troop-sort-note">{t('troops.sort.balance_note')}</p> : null}
    </div>
  );
}
