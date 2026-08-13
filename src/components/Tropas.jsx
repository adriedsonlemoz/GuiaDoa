import React, { useMemo, useState } from 'react';
import { useTropas } from '../hooks/useTropas.js';
import { useI18n } from '../hooks/useI18n.jsx';
import GameHeader from './shared/GameHeader.jsx';
import SimpleTroopFilters from './tropas/SimpleTroopFilters.jsx';
import TroopListRow from './tropas/TroopListRow.jsx';
import TropaModal from './tropas/TropaModal.jsx';
import { matchesTroopFilter } from './tropas/troopCatalogUtils.js';
import { GameActionButton } from './shared/GameChrome.jsx';

const QUICK_COMPARE_MAX = 2;

export default function Tropas({ setRoute }) {
  const { tropas, carregando } = useTropas();
  const { t, content } = useI18n();
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [detail, setDetail] = useState(null);
  const [compareMode, setCompareMode] = useState(false);
  const [compareNames, setCompareNames] = useState([]);

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

  const toggleCompareMode = () => {
    setCompareMode(current => {
      if (current) setCompareNames([]);
      return !current;
    });
  };

  const toggleTroopCompare = troop => {
    const name = troop.nome;
    setCompareNames(current => {
      if (current.includes(name)) return current.filter(item => item !== name);
      if (current.length >= QUICK_COMPARE_MAX) return [current[1], name];
      return [...current, name];
    });
  };

  const openComparison = () => {
    if (compareNames.length < 2) return;
    sessionStorage.setItem('guiadoa_troop_compare', JSON.stringify(compareNames));
    setRoute('tropas_comparar');
  };

  return (
    <>
      {detail && <TropaModal tropa={detail} onFechar={() => setDetail(null)} onOpenTips={() => { setDetail(null); setRoute('dicas'); }} />}
      <div style={{ maxWidth:620, margin:'0 auto', paddingBottom:16, animation:'reveal-up .25s ease both' }}>
        <GameHeader title={t('troops.encyclopedia')} subtitle={t('troops.simple_intro')} />
        <SimpleTroopFilters search={search} setSearch={setSearch} filter={filter} setFilter={setFilter} />

        <div className="game-list-toolbar">
          <span>{t('troops.count_badge',{count:shown.length})}</span>
          <button
            type="button"
            className={`game-compare-toggle${compareMode ? ' is-active' : ''}`}
            onClick={toggleCompareMode}
            aria-pressed={compareMode}
          >
            ⚖ {compareMode ? `${t('troops.compare')} ${compareNames.length}/${QUICK_COMPARE_MAX}` : t('troops.compare')}
          </button>
        </div>

        <section className="game-list">
          {carregando ? <div style={{ padding:24, textAlign:'center', color:'#687064', fontSize:'.72rem' }}>⟳ {t('troops.loading_units')}</div> : null}
          {!carregando ? shown.map(troop => (
            <TroopListRow
              key={troop._id || troop.nome}
              troop={troop}
              compareMode={compareMode}
              selected={compareNames.includes(troop.nome)}
              onSelect={() => toggleTroopCompare(troop)}
              onOpen={() => setDetail(troop)}
            />
          )) : null}
          {!carregando && !shown.length ? <div style={{ padding:30, textAlign:'center', color:'#687064', fontSize:'.72rem' }}>🔎 {t('troops.no_results')}</div> : null}
        </section>

        {compareMode ? (
          <div className="game-compare-bar">
            <div className="game-compare-bar-copy">
              {compareNames.length < 2
                ? t('troops.compare_select_two')
                : `${compareNames.length} ${t('troops.compare_selected').toLowerCase()}`}
            </div>
            <GameActionButton tone="green" disabled={compareNames.length < 2} onClick={openComparison}>
              ⚖ {t('troops.compare')}
            </GameActionButton>
          </div>
        ) : null}
      </div>
    </>
  );
}
