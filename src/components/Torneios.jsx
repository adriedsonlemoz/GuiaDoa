import React, { useEffect, useMemo, useRef, useState } from 'react';
import { getProfile } from '../utils/storage.js';
import { useTorneioTimer } from '../hooks/useTorneioTimer.js';
import { useI18n } from '../hooks/useI18n.jsx';
import { C } from '../theme.js';
import { GameActionButton, GamePanel, GameSectionTitle, GameTabs } from './shared/GameChrome.jsx';
import TutorialCopyButton from './shared/TutorialCopyButton.jsx';
import EvolucaoTropas            from './torneios/EvolucaoTropas.jsx';
import PontosTalisma             from './torneios/PontosTalisma.jsx';
import TorneioPoder              from './torneios/TorneioPoder.jsx';
import TorneioAlianca            from './torneios/TorneioAlianca.jsx';
import TorneioMatarTropas        from './torneios/TorneioMatarTropas.jsx';
import TorneioTreinoTropa        from './torneios/TorneioTreinoTropa.jsx';
import TorneioHabilidadeDragao   from './torneios/TorneioHabilidadeDragao.jsx';
import TorneioGeneral            from './torneios/TorneioGeneral.jsx';
import TorneioAprimoramentoTropa from './torneios/TorneioAprimoramentoTropa.jsx';
import TreinamentoDoDragao       from './torneios/TreinamentoDoDragao.jsx';
import TorneioAceleracoes        from './torneios/TorneioAceleracoes.jsx';
import TorneioPocoes             from './torneios/TorneioPocoes.jsx';
import TournamentTurnover from './torneios/TournamentTurnover.jsx';
import TournamentPlan from './torneios/TournamentPlan.jsx';
import {
  TOURNAMENT_REGISTRY,
  getTournament,
  pushRecentTournament,
  readRecentTournaments,
} from './torneios/tournamentRegistry.js';

const MODULES = {
  evolucao_tropas:      <EvolucaoTropas />,
  talisma:              <PontosTalisma />,
  poder:                <TorneioPoder />,
  habilidade_dragao:    <TorneioHabilidadeDragao />,
  alianca:              <TorneioAlianca />,
  matar_tropas:         <TorneioMatarTropas />,
  treino_tropa:         <TorneioTreinoTropa />,
  general:              <TorneioGeneral />,
  aprimoramento_tropa:  <TorneioAprimoramentoTropa />,
  treinamento_dragao:   <TreinamentoDoDragao />,
  aceleracoes:          <TorneioAceleracoes />,
  pocoes_antigas:       <TorneioPocoes />,
};

function TournamentRow({ item, t, onOpen }) {
  const calculator = item.type === 'calculator';
  return (
    <button type="button" className="tournament-list-row" onClick={() => onOpen(item.id)}>
      <span className="tournament-list-icon" aria-hidden="true">{item.icon}</span>
      <span className="tournament-list-main">
        <strong>{t(`torneio.titulo.${item.id}`)}</strong>
        <span>{t(`torneio.desc.${item.id}`)}</span>
        <small>{t(`torneio.cat.${item.catKey}`)}</small>
      </span>
      <span className={`tournament-type-badge ${calculator ? 'is-calculator' : 'is-guide'}`}>
        {calculator ? t('tournament.type.calculator') : t('tournament.type.guide')}
      </span>
      <span className="tournament-chevron" aria-hidden="true">›</span>
    </button>
  );
}

function TournamentSummary({ tournament, t, onContinue, turnoverProps }) {
  const calculator = tournament.type === 'calculator';
  return (
    <div className="tournament-detail-stack">
      <GamePanel>
        <GameSectionTitle>{t('tournament.summary.title')}</GameSectionTitle>
        <div className="tournament-summary-body">
          <div className="tournament-summary-icon" aria-hidden="true">{tournament.icon}</div>
          <div>
            <h2>{t(`torneio.titulo.${tournament.id}`)}</h2>
            <p>{t(`torneio.desc.${tournament.id}`)}</p>
            <div className="tournament-summary-tags">
              <span>{t(`torneio.cat.${tournament.catKey}`)}</span>
              <span>{calculator ? t('tournament.type.calculator') : t('tournament.type.guide')}</span>
            </div>
          </div>
        </div>
      </GamePanel>

      <TournamentTurnover {...turnoverProps} />

      <GamePanel>
        <GameSectionTitle>{t('tournament.summary.what_you_can_do')}</GameSectionTitle>
        <div className="tournament-summary-actions">
          <p>{calculator ? t('tournament.summary.calculator_help') : t('tournament.summary.guide_help')}</p>
          <GameActionButton tone="blue" onClick={onContinue}>
            {calculator ? t('tournament.summary.open_calculator') : t('tournament.summary.open_guide')}
          </GameActionButton>
        </div>
      </GamePanel>
    </div>
  );
}

const Torneios = () => {
  const { t } = useI18n();
  const [activeId, setActiveId] = useState(null);
  const [hubTab, setHubTab] = useState('all');
  const [detailTab, setDetailTab] = useState('summary');
  const [recent, setRecent] = useState(() => readRecentTournaments());
  const tutorialContentRef = useRef(null);
  const profile = getProfile() || {};
  const { horaSomente, countdown, isUrgente, resetLocal, resetDayDelta } = useTorneioTimer(profile.fuso || 'UTC+0');
  const active = getTournament(activeId);

  const filtered = useMemo(() => {
    if (hubTab === 'calculator') return TOURNAMENT_REGISTRY.filter(item => item.type === 'calculator');
    if (hubTab === 'guide') return TOURNAMENT_REGISTRY.filter(item => item.type === 'guide');
    return TOURNAMENT_REGISTRY;
  }, [hubTab]);

  const recentItems = useMemo(() => recent.map(getTournament).filter(Boolean), [recent]);

  useEffect(() => {
    try {
      const requested = sessionStorage.getItem('guiadoa_open_tournament');
      if (!requested || !getTournament(requested)) return;
      sessionStorage.removeItem('guiadoa_open_tournament');
      setRecent(pushRecentTournament(requested));
      setActiveId(requested);
      setDetailTab(getTournament(requested)?.type === 'calculator' ? 'calculator' : 'guide');
      window.scrollTo({ top: 0, behavior: 'auto' });
    } catch {}
  }, []);

  const turnoverProps = {
    realm: profile.reino,
    fuso: profile.fuso,
    countdown,
    time: horaSomente,
    urgent: isUrgente,
    label: t('tournament.turnover.next'),
    resetLocal,
    resetDayDelta,
    previousDayLabel: t('realms.previous_day'),
    nextDayLabel: t('realms.next_day'),
    nowLabel: t('tournament.turnover.now'),
    baseLabel: t('tournament.turnover.base'),
  };

  const openTournament = id => {
    const item = getTournament(id);
    if (!item) return;
    setRecent(pushRecentTournament(id));
    setActiveId(id);
    setDetailTab('summary');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const closeTournament = () => {
    setActiveId(null);
    setDetailTab('summary');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (active) {
    const calculator = active.type === 'calculator';
    const contentTabId = calculator ? 'calculator' : 'guide';
    const detailTabs = [
      { id: 'summary', label: t('tournament.detail.summary') },
      { id: contentTabId, label: calculator ? t('tournament.detail.calculate') : t('tournament.detail.guide') },
      { id: 'plan', label: t('tournament.detail.plan') },
    ];

    return (
      <div className="tournament-page">
        <button type="button" className="tournament-back-link" onClick={closeTournament}>‹ {t('tournament.back_to_all')}</button>

        <div className="tournament-active-heading">
          <span aria-hidden="true">{active.icon}</span>
          <div>
            <small>{calculator ? t('tournament.type.calculator') : t('tournament.type.guide')}</small>
            <strong>{t(`torneio.titulo.${active.id}`)}</strong>
          </div>
        </div>

        <GameTabs tabs={detailTabs} value={detailTab} onChange={setDetailTab} />

        <div className="tournament-detail-content">
          {detailTab === 'summary' ? (
            <TournamentSummary tournament={active} t={t} onContinue={() => setDetailTab(contentTabId)} turnoverProps={turnoverProps} />
          ) : detailTab === 'plan' ? (
            <TournamentPlan tournamentId={active.id} />
          ) : (
            <>
              {!calculator ? <div className="tournament-tutorial-copy"><TutorialCopyButton getText={() => tutorialContentRef.current?.innerText || ''} /></div> : null}
              <div ref={tutorialContentRef}>{MODULES[active.id] || null}</div>
            </>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="tournament-page">
      <GamePanel className="tournament-hub-intro">
        <GameSectionTitle>{t('tournament.hub.title')}</GameSectionTitle>
        <p>{t('tournament.hub.help')}</p>
      </GamePanel>

      <TournamentTurnover {...turnoverProps} />

      <GameTabs
        tabs={[
          { id: 'all', label: t('tournament.filter.all') },
          { id: 'calculator', label: t('tournament.filter.calculators') },
          { id: 'guide', label: t('tournament.filter.guides') },
        ]}
        value={hubTab}
        onChange={setHubTab}
      />

      {hubTab === 'all' && recentItems.length > 0 ? (
        <section className="tournament-section">
          <div className="tournament-section-label">{t('tournament.recent')}</div>
          <div className="tournament-list">
            {recentItems.map(item => <TournamentRow key={`recent-${item.id}`} item={item} t={t} onOpen={openTournament} />)}
          </div>
        </section>
      ) : null}

      <section className="tournament-section">
        <div className="tournament-section-label">
          {hubTab === 'all' ? t('tournament.all_events') : hubTab === 'calculator' ? t('tournament.filter.calculators') : t('tournament.filter.guides')}
          <span>{filtered.length}</span>
        </div>
        <div className="tournament-list">
          {filtered.map(item => <TournamentRow key={item.id} item={item} t={t} onOpen={openTournament} />)}
        </div>
      </section>

      <p className="tournament-footnote" style={{ color: C.TEXT_MUTED }}>{t('tournament.turnover.note')}</p>
    </div>
  );
};

export default Torneios;
