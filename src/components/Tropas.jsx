import React, { useMemo, useState } from 'react';
import { useTropas } from '../hooks/useTropas.js';
import { useI18n } from '../hooks/useI18n.jsx';
import GameHeader from './shared/GameHeader.jsx';
import SimpleTroopFilters from './tropas/SimpleTroopFilters.jsx';
import TroopListRow from './tropas/TroopListRow.jsx';
import TropaModal from './tropas/TropaModal.jsx';
import { buildTroopCatalogAnalysis, matchesTroopFilter, sortTroops, TROOP_FILTER_IDS } from './tropas/troopCatalogUtils.js';
import { GameActionButton } from './shared/GameChrome.jsx';

const QUICK_COMPARE_MAX = 2;

export default function Tropas({ setRoute }) {
  const { tropas, carregando } = useTropas();
  const { t, content } = useI18n();
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [sort, setSort] = useState('name');
  const [detail, setDetail] = useState(null);
  const [compareMode, setCompareMode] = useState(false);
  const [compareNames, setCompareNames] = useState([]);
  const analysis = useMemo(() => buildTroopCatalogAnalysis(tropas), [tropas]);

  const counts = useMemo(() => Object.fromEntries(
    TROOP_FILTER_IDS.map(id => [id, tropas.filter(troop => matchesTroopFilter(troop, id, analysis)).length]),
  ), [tropas, analysis]);

  const shown = useMemo(() => {
    const query = search.trim().toLocaleLowerCase();
    const filtered = tropas.filter(troop => {
      if (!matchesTroopFilter(troop, filter, analysis)) return false;
      if (!query) return true;
      const aliases = Array.isArray(troop.aliases) ? troop.aliases.join(' ') : '';
      return `${content(troop, 'nome')} ${aliases} ${content(troop, 'desc')}`.toLocaleLowerCase().includes(query);
    });
    return sortTroops(filtered, sort, analysis, troop => content(troop, 'nome'));
  }, [tropas, search, filter, sort, analysis, content]);

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

  const openTrainingTournament = (troop, quantity) => {
    try {
      sessionStorage.setItem('guiadoa_tournament_prefill', JSON.stringify({
        tournamentId: 'treino_tropa', troopId: troop.slug || troop.nome, troopName: troop.nome,
        quantity: Math.max(1, Number(quantity) || 1),
      }));
      sessionStorage.setItem('guiadoa_open_tournament', 'treino_tropa');
    } catch {}
    setDetail(null);
    setRoute('torneios');
  };

  const openComparison = () => {
    if (compareNames.length < 2) return;
    sessionStorage.setItem('guiadoa_troop_compare', JSON.stringify(compareNames));
    setRoute('tropas_comparar');
  };

  return (
    <>
      {detail && <TropaModal tropa={detail} analysis={analysis} onFechar={() => setDetail(null)} onOpenTips={() => { setDetail(null); setRoute('dicas'); }} onOpenTournament={openTrainingTournament} />}
      <div style={{ maxWidth:620, margin:'0 auto', paddingBottom:16, animation:'reveal-up .25s ease both' }}>
        <GameHeader title={t('troops.encyclopedia')} subtitle={t('troops.simple_intro')} />
        <SimpleTroopFilters search={search} setSearch={setSearch} filter={filter} setFilter={setFilter} sort={sort} setSort={setSort} counts={counts} />
        <div className="game-list-toolbar">
          <span>{t('troops.count_badge',{count:shown.length})}</span>
          <button type="button" className={`game-compare-toggle${compareMode ? ' is-active' : ''}`} onClick={toggleCompareMode} aria-pressed={compareMode}>⚖ {compareMode ? `${t('troops.compare')} ${compareNames.length}/${QUICK_COMPARE_MAX}` : t('troops.compare')}</button>
        </div>
        <section className="game-list">
          {carregando ? <div style={{ padding:24, textAlign:'center', color:'#687064', fontSize:'.72rem' }}>⟳ {t('troops.loading_units')}</div> : null}
          {!carregando ? shown.map(troop => <TroopListRow key={troop._id || troop.nome} troop={troop} analysis={analysis} compareMode={compareMode} selected={compareNames.includes(troop.nome)} onSelect={() => toggleTroopCompare(troop)} onOpen={() => setDetail(troop)} />) : null}
          {!carregando && !shown.length ? <div style={{ padding:30, textAlign:'center', color:'#687064', fontSize:'.72rem' }}>🔎 {t('troops.no_results')}</div> : null}
        </section>
        {compareMode ? <div className="game-compare-bar"><div className="game-compare-bar-copy">{compareNames.length < 2 ? t('troops.compare_select_two') : `${compareNames.length} ${t('troops.compare_selected').toLowerCase()}`}</div><GameActionButton tone="green" disabled={compareNames.length < 2} onClick={openComparison}>⚖ {t('troops.compare')}</GameActionButton></div> : null}
      </div>
    </>
  );
}
