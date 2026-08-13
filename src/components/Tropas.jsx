import React, { useMemo, useState } from 'react';
import { useTropas } from '../hooks/useTropas.js';
import { useI18n } from '../hooks/useI18n.jsx';
import GameHeader from './shared/GameHeader.jsx';
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
      <div style={{ maxWidth:620, margin:'0 auto', paddingBottom:16, animation:'reveal-up .25s ease both' }}>
        <GameHeader title={t('troops.encyclopedia')} subtitle={t('troops.simple_intro')} />
        <SimpleTroopFilters search={search} setSearch={setSearch} filter={filter} setFilter={setFilter} />
        <div style={{ margin:'8px 2px 6px', color:'#765f3c', fontSize:'.62rem', fontWeight:900 }}>
          {t('troops.count_badge',{count:shown.length})}
        </div>
        <section className="game-list">
          {carregando ? <div style={{ padding:24, textAlign:'center', color:'#7e6948', fontSize:'.72rem' }}>⟳ {t('troops.loading_units')}</div> : null}
          {!carregando ? shown.map(troop => <TroopListRow key={troop._id || troop.nome} troop={troop} onOpen={() => setDetail(troop)} />) : null}
          {!carregando && !shown.length ? <div style={{ padding:30, textAlign:'center', color:'#7e6948', fontSize:'.72rem' }}>🔎 {t('troops.no_results')}</div> : null}
        </section>
      </div>
    </>
  );
}
