import React, { useMemo, useState } from 'react';
import { C } from '../theme.js';
import { useTropas } from '../hooks/useTropas.js';
import { useI18n } from '../hooks/useI18n.jsx';
import TacticalSummary from './tropas/TacticalSummary.jsx';
import TacticalFilters from './tropas/TacticalFilters.jsx';
import TacticalTroopCard from './tropas/TacticalTroopCard.jsx';
import UnlockProgressPanel from './tropas/UnlockProgressPanel.jsx';
import CompareDock from './tropas/CompareDock.jsx';
import TropaModal from './tropas/TropaModal.jsx';
import { matchesTroopFilter, sortTroops, troopSummary } from './tropas/tacticalUtils.js';

const MAX_COMPARE = 3;

export default function Tropas({ setRoute }) {
  const { tropas, carregando } = useTropas();
  const { t, content } = useI18n();
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [sort, setSort] = useState('name');
  const [detail, setDetail] = useState(null);
  const [compare, setCompare] = useState([]);

  const summary = useMemo(() => troopSummary(tropas), [tropas]);
  const shown = useMemo(() => {
    const query = search.trim().toLocaleLowerCase();
    const filtered = tropas.filter(troop => {
      if (!matchesTroopFilter(troop, filter)) return false;
      if (!query) return true;
      return `${content(troop, 'nome')} ${content(troop, 'desc')}`.toLocaleLowerCase().includes(query);
    });
    return sortTroops(filtered, sort, troop => content(troop, 'nome'));
  }, [tropas, search, filter, sort, content]);

  const toggleCompare = troop => setCompare(current => {
    const exists = current.some(item => item._id === troop._id || item.nome === troop.nome);
    if (exists) return current.filter(item => !(item._id === troop._id || item.nome === troop.nome));
    if (current.length >= MAX_COMPARE) return current;
    return [...current, troop];
  });

  const openCompare = () => {
    sessionStorage.setItem('guiadoa_troop_compare', JSON.stringify(compare.map(item => item.nome)));
    setRoute('tropas_comparar');
  };

  return (
    <>
      {detail && <TropaModal tropa={detail} onFechar={() => setDetail(null)} onOpenTips={() => { setDetail(null); setRoute('dicas'); }} />}
      <div style={{ maxWidth:520, margin:'0 auto', paddingBottom:18, animation:'reveal-up .3s ease both' }}>
        <header style={{ background:'linear-gradient(145deg,#173554,#294d73 62%,#183a5d)', borderRadius:15, padding:'15px 15px 14px', color:'#F8F2E0', boxShadow:'0 7px 20px rgba(28,58,94,.17)', position:'relative', overflow:'hidden' }}>
          <div style={{ position:'absolute', right:-18, top:-30, fontSize:'6rem', opacity:.055 }}>⚔️</div>
          <div style={{ position:'relative' }}>
            <div className="font-nunito font-black" style={{ fontSize:'.56rem', color:'rgba(200,168,74,.85)', letterSpacing:'2px', textTransform:'uppercase' }}>{t('troops.tactical_catalog')}</div>
            <h1 className="font-cinzel" style={{ margin:'3px 0 4px', fontSize:'1.15rem', letterSpacing:'.4px' }}>{t('troops.title')}</h1>
            <p className="font-nunito" style={{ margin:0, maxWidth:390, color:'rgba(248,242,224,.73)', fontSize:'.68rem', lineHeight:1.45 }}>{t('troops.tactical_intro')}</p>
            <div style={{ display:'flex', gap:6, flexWrap:'wrap', marginTop:10 }}>
              <span className="font-nunito font-bold" style={{ fontSize:'.58rem', padding:'3px 7px', borderRadius:999, background:'rgba(248,242,224,.08)', border:'1px solid rgba(248,242,224,.12)' }}>⚔️ {t('troops.unit_count_short',{count:summary.total})}</span>
              <span className="font-nunito font-bold" style={{ fontSize:'.58rem', padding:'3px 7px', borderRadius:999, background:'rgba(248,242,224,.08)', border:'1px solid rgba(248,242,224,.12)' }}>⚡ {summary.fast} {t('troops.fast_plural').toLowerCase()}</span>
              <button onClick={() => setRoute('calculostropas')} className="font-nunito font-bold" style={{ fontSize:'.58rem', padding:'3px 7px', borderRadius:999, background:'rgba(200,168,74,.14)', border:'1px solid rgba(200,168,74,.36)', color:'#F3D779', cursor:'pointer' }}>🧮 {t('troops.simulator')}</button>
            </div>
          </div>
        </header>

        <div style={{ display:'flex', flexDirection:'column', gap:10, marginTop:10 }}>
          <TacticalSummary summary={summary} activeFilter={filter} onFilter={setFilter} />
          <UnlockProgressPanel troops={tropas} onOpen={setDetail} />
          <TacticalFilters search={search} setSearch={setSearch} filter={filter} setFilter={setFilter} sort={sort} setSort={setSort} />

          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', gap:8, padding:'0 2px' }}>
            <div className="font-nunito font-bold" style={{ fontSize:'.64rem', color:C.TEXT_MUTED }}>
              {carregando ? `⟳ ${t('app.sync.syncing_short')}` : t('troops.list_count',{shown:shown.length,total:tropas.length})}
            </div>
            {filter !== 'all' && <button onClick={() => setFilter('all')} className="font-nunito font-bold" style={{ border:0, background:'transparent', color:'#6a5018', cursor:'pointer', fontSize:'.6rem' }}>{t('troops.clear_filter')}</button>}
          </div>

          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(220px,1fr))', gap:8 }}>
            {shown.map(troop => {
              const selected = compare.some(item => item._id === troop._id || item.nome === troop.nome);
              return <TacticalTroopCard key={troop._id || troop.nome} troop={troop} selected={selected} selectionDisabled={compare.length >= MAX_COMPARE} onToggleCompare={() => toggleCompare(troop)} onOpen={() => setDetail(troop)} />;
            })}
          </div>

          {!shown.length && !carregando && <div style={{ padding:'28px 16px', textAlign:'center', border:`1px dashed ${C.BORDER_SOFT}`, borderRadius:12, background:C.BG_CARD }}><div style={{ fontSize:'1.7rem' }}>🔎</div><div className="font-nunito" style={{ color:C.TEXT_MUTED, fontSize:'.74rem', marginTop:6 }}>{t('troops.no_results')}</div></div>}

          <CompareDock selected={compare} onClear={() => setCompare([])} onCompare={openCompare} />
        </div>
      </div>
    </>
  );
}
