import React from 'react';
import { C } from '../../theme.js';
import { GameActionButton, GameInfoTable, GamePanel, GameSectionTitle } from '../shared/GameChrome.jsx';
import { fmtN } from './ilhasUtils.js';

function Delta({ value, suffix = '' }) {
  if (!value) return <span style={{ color: C.TEXT_FAINT }}>—</span>;
  const positive = value > 0;
  return <span style={{ color: positive ? C.SUCCESS : C.ERROR, fontWeight: 800 }}>{positive ? '+' : ''}{fmtN(value)}{suffix}</span>;
}

export function GlobalPopulationPanel({ metricas, t, locale }) {
  const warning = metricas.freePopulation < 0;
  return (
    <GamePanel className="island-global-summary">
      <GameSectionTitle aside={warning ? t('islands.population_deficit') : t('islands.population_ok')}>{t('islands.kingdom_summary')}</GameSectionTitle>
      <GameInfoTable rows={[
        { key: 'population', icon: '👥', label: t('islands.population'), value: fmtN(metricas.population, locale) },
        { key: 'workers', icon: '🛠️', label: t('islands.workers'), value: fmtN(metricas.workers, locale) },
        { key: 'free', icon: warning ? '⚠️' : '✓', label: t('islands.free_population'), value: fmtN(metricas.freePopulation, locale) },
        { key: 'heal', icon: '💧', label: t('islands.total_healing'), value: fmtN(metricas.healing, locale) },
      ]} />
    </GamePanel>
  );
}

export function RecommendationPanel({ plan, recommendation, onFocus, onApply, canApply, t }) {
  const focuses = [
    ['balanced', t('islands.focus.balanced')],
    ['training', t('islands.focus.training')],
    ['protection', t('islands.focus.protection')],
  ];
  return (
    <GamePanel className="island-recommendation">
      <GameSectionTitle>{t('islands.guide_suggestion')}</GameSectionTitle>
      <div className="island-focus-row">
        {focuses.map(([id, label]) => (
          <button key={id} type="button" className={plan.focus === id ? 'is-active' : ''} onClick={() => onFocus(id)}>{label}</button>
        ))}
      </div>
      <p>{t(recommendation.textKey)}</p>
      {recommendation.slug && canApply ? (
        <GameActionButton tone="green" onClick={onApply}>+ {t('islands.apply_suggestion')}</GameActionButton>
      ) : null}
    </GamePanel>
  );
}

export function ComparisonPanel({ comparison, onStart, onStop, t, locale }) {
  if (!comparison) {
    return (
      <GamePanel className="island-compare-panel">
        <GameSectionTitle>{t('islands.compare_plan')}</GameSectionTitle>
        <p>{t('islands.compare_help')}</p>
        <GameActionButton onClick={onStart}>{t('islands.pin_current_plan')}</GameActionButton>
      </GamePanel>
    );
  }
  const rows = [
    ['islands.population', comparison.diff.population],
    ['islands.workers', comparison.diff.workers],
    ['islands.free_population', comparison.diff.freePopulation],
    ['islands.total_healing', comparison.diff.healing],
    ['islands.production', comparison.diff.production, '/h'],
    ['islands.free_city_slots', comparison.diff.normalFree],
    ['islands.free_resource_slots', comparison.diff.resourceFree],
  ];
  return (
    <GamePanel className="island-compare-panel is-live">
      <GameSectionTitle aside={t('islands.live_comparison')}>{t('islands.compare_plan')}</GameSectionTitle>
      <div className="island-delta-grid">
        {rows.map(([key, value, suffix]) => (
          <div key={key}><span>{t(key)}</span><Delta value={value} suffix={suffix || ''} /></div>
        ))}
      </div>
      <GameActionButton tone="brown" onClick={onStop}>{t('islands.stop_comparison')}</GameActionButton>
    </GamePanel>
  );
}
