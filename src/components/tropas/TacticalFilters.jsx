import React from 'react';
import { C } from '../../theme.js';
import { useI18n } from '../../hooks/useI18n.jsx';
import { TROOP_FILTERS, TROOP_SORTS } from './tacticalUtils.js';

export default function TacticalFilters({ search, setSearch, filter, setFilter, sort, setSort }) {
  const { t } = useI18n();
  return (
    <div style={{ background:C.BG_SECONDARY, border:`1.5px solid ${C.BORDER}`, borderRadius:12, padding:10 }}>
      <div style={{ display:'grid', gridTemplateColumns:'1fr auto', gap:7 }}>
        <input className="tw-input" value={search} onChange={e => setSearch(e.target.value)} placeholder={`🔎  ${t('troops.search')}`} />
        <select className="tw-input" value={sort} onChange={e => setSort(e.target.value)} style={{ width:128, paddingLeft:8 }} aria-label={t('troops.sort.label')}>
          {TROOP_SORTS.map(item => <option key={item.id} value={item.id}>{t(item.key)}</option>)}
        </select>
      </div>
      <div style={{ display:'flex', gap:6, overflowX:'auto', scrollbarWidth:'none', paddingTop:8 }}>
        {TROOP_FILTERS.map(item => {
          const active = filter === item.id;
          return <button key={item.id} onClick={() => setFilter(item.id)} className="font-nunito font-bold" style={{
            flexShrink:0, borderRadius:999, padding:'5px 10px', cursor:'pointer', fontSize:'.66rem',
            background:active ? '#1C3A5E' : C.BG_CARD,
            color:active ? '#F8F2E0' : C.TEXT_MUTED,
            border:`1px solid ${active ? '#1C3A5E' : C.BORDER_SOFT}`,
          }}>{item.icon} {t(item.key)}</button>;
        })}
      </div>
    </div>
  );
}
