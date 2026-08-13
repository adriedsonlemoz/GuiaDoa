import React from 'react';
import { C } from '../../theme.js';
import { useI18n } from '../../hooks/useI18n.jsx';

const FILTERS = [
  ['all', '⚔️', 'troops.filter.all'],
  ['ranged', '🏹', 'troops.filter.ranged'],
  ['melee', '🛡️', 'troops.filter.melee'],
  ['special', '✨', 'troops.filter.special'],
];

export default function SimpleTroopFilters({ search, setSearch, filter, setFilter }) {
  const { t } = useI18n();
  return (
    <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
      <div style={{ position:'relative' }}>
        <span style={{ position:'absolute', left:12, top:'50%', transform:'translateY(-50%)', opacity:.52 }}>⌕</span>
        <input
          value={search}
          onChange={event => setSearch(event.target.value)}
          placeholder={t('troops.search')}
          className="font-nunito"
          style={{ width:'100%', boxSizing:'border-box', border:`1px solid ${C.BORDER_SOFT}`, borderRadius:11, background:C.BG_CARD, color:C.TEXT_PRIMARY, padding:'10px 12px 10px 34px', fontSize:'.76rem', outline:'none' }}
        />
      </div>
      <div style={{ display:'flex', gap:6, overflowX:'auto', paddingBottom:2, scrollbarWidth:'none' }}>
        {FILTERS.map(([id, icon, key]) => {
          const active = filter === id;
          return (
            <button
              key={id}
              onClick={() => setFilter(id)}
              className="font-nunito font-bold"
              style={{ flex:'0 0 auto', border:`1px solid ${active ? C.ACCENT : C.BORDER_SOFT}`, background:active ? 'rgba(200,168,74,.18)' : C.BG_CARD, color:active ? '#6a5018' : C.TEXT_MUTED, borderRadius:999, padding:'7px 10px', fontSize:'.62rem', cursor:'pointer' }}
            >
              {icon} {t(key)}
            </button>
          );
        })}
      </div>
    </div>
  );
}
