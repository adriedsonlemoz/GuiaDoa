import React, { useMemo, useState } from 'react';
import { C } from '../theme.js';
import { useTropas } from '../hooks/useTropas.js';
import { useI18n } from '../hooks/useI18n.jsx';
import SimpleTroopFilters from './tropas/SimpleTroopFilters.jsx';
import TroopListRow from './tropas/TroopListRow.jsx';
import TropaModal from './tropas/TropaModal.jsx';
import { matchesTroopFilter } from './tropas/troopCatalogUtils.js';

export default function Tropas({ setRoute }) {
  const { tropas, carregando } = useTropas();
  const { t, content } = useI18n();
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [detail, setDetail] = useState(null);

  const shown = useMemo(() => {
    const query = search.trim().toLocaleLowerCase();
    return tropas
      .filter(troop => {
        if (!matchesTroopFilter(troop, filter)) return false;
        if (!query) return true;
        return `${content(troop, 'nome')} ${content(troop, 'desc')}`.toLocaleLowerCase().includes(query);
      })
      .sort((a, b) => content(a, 'nome').localeCompare(content(b, 'nome')));
  }, [tropas, search, filter, content]);

  return (
    <>
      {detail && <TropaModal tropa={detail} onFechar={() => setDetail(null)} onOpenTips={() => { setDetail(null); setRoute('dicas'); }} />}
      <div style={{ maxWidth:540, margin:'0 auto', paddingBottom:20, animation:'reveal-up .25s ease both' }}>
        <section style={{ padding:'7px 4px 12px', borderBottom:`1px solid ${C.BORDER_SOFT}` }}>
          <div className="font-nunito font-black" style={{ color:'#8a6a22', letterSpacing:'1.8px', textTransform:'uppercase', fontSize:'.55rem' }}>{t('troops.encyclopedia')}</div>
          <div style={{ display:'flex', alignItems:'baseline', justifyContent:'space-between', gap:10, marginTop:2 }}>
            <h1 className="font-cinzel" style={{ color:C.TEXT_PRIMARY, margin:0, fontSize:'1.08rem' }}>{t('troops.title')}</h1>
            <span className="font-nunito font-bold" style={{ color:C.TEXT_FAINT, fontSize:'.61rem' }}>{t('troops.count_badge',{count:tropas.length})}</span>
          </div>
          <p className="font-nunito" style={{ color:C.TEXT_MUTED, margin:'4px 0 0', fontSize:'.68rem', lineHeight:1.45 }}>{t('troops.simple_intro')}</p>
        </section>

        <div style={{ padding:'10px 4px 0' }}>
          <SimpleTroopFilters search={search} setSearch={setSearch} filter={filter} setFilter={setFilter} />
        </div>

        <section style={{ marginTop:10, background:C.BG_CARD, border:`1px solid ${C.BORDER_SOFT}`, borderRadius:12, padding:'0 10px', boxShadow:'0 2px 9px rgba(62,47,28,.055)' }}>
          {carregando && <div className="font-nunito" style={{ padding:'22px 8px', color:C.TEXT_MUTED, textAlign:'center', fontSize:'.72rem' }}>⟳ {t('troops.loading_units')}</div>}
          {!carregando && shown.map(troop => <TroopListRow key={troop._id || troop.nome} troop={troop} onOpen={() => setDetail(troop)} />)}
          {!carregando && !shown.length && <div style={{ padding:'30px 12px', textAlign:'center' }}><div style={{ fontSize:'1.5rem' }}>🔎</div><div className="font-nunito" style={{ color:C.TEXT_MUTED, fontSize:'.72rem', marginTop:6 }}>{t('troops.no_results')}</div></div>}
        </section>
      </div>
    </>
  );
}
