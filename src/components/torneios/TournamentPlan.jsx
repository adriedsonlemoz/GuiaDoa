import React, { useMemo, useState } from 'react';
import { C } from '../../theme.js';
import { GameActionButton, GameInfoTable, GamePanel, GameSectionTitle } from '../shared/GameChrome.jsx';
import { readTournamentPlan, saveTournamentPlan } from './tournamentRegistry.js';
import { useI18n } from '../../hooks/useI18n.jsx';

function onlyDigits(value) {
  return String(value || '').replace(/\D/g, '');
}

export default function TournamentPlan({ tournamentId }) {
  const { t, locale } = useI18n();
  const [plan, setPlan] = useState(() => readTournamentPlan(tournamentId));
  const [saved, setSaved] = useState(false);

  const current = Number(onlyDigits(plan.current)) || 0;
  const target = Number(onlyDigits(plan.target)) || 0;
  const remaining = Math.max(0, target - current);
  const margin = target > 0 ? current - target : 0;
  const progress = target > 0 ? Math.min(100, Math.round((current / target) * 100)) : 0;
  const fmt = value => Number(value || 0).toLocaleString(locale);

  const rows = useMemo(() => [
    { key: 'current', label: t('tournament.plan.current'), value: fmt(current) },
    { key: 'target', label: t('tournament.plan.target'), value: fmt(target) },
    { key: 'remaining', label: remaining > 0 ? t('tournament.plan.remaining') : t('tournament.plan.margin'), value: remaining > 0 ? fmt(remaining) : `+${fmt(Math.max(0, margin))}` },
  ], [current, target, remaining, margin, locale, t]);

  const handleSave = () => {
    setSaved(saveTournamentPlan(tournamentId, plan));
    window.setTimeout(() => setSaved(false), 1600);
  };

  return (
    <div className="tournament-plan-stack">
      <GamePanel>
        <GameSectionTitle aside={target > 0 ? `${progress}%` : null}>{t('tournament.plan.title')}</GameSectionTitle>
        <div className="tournament-plan-body">
          <p className="tournament-help-copy">{t('tournament.plan.help')}</p>
          <div className="tournament-plan-fields">
            <label>
              <span>{t('tournament.plan.current')}</span>
              <input className="game-field" inputMode="numeric" value={plan.current} onChange={event => setPlan(p => ({ ...p, current: onlyDigits(event.target.value) }))} placeholder="0" />
            </label>
            <label>
              <span>{t('tournament.plan.target')}</span>
              <input className="game-field" inputMode="numeric" value={plan.target} onChange={event => setPlan(p => ({ ...p, target: onlyDigits(event.target.value) }))} placeholder="0" />
            </label>
          </div>
          <div className="tournament-progress-track" aria-label={`${progress}%`}>
            <div className="tournament-progress-fill" style={{ width: `${progress}%` }} />
          </div>
        </div>
        <GameInfoTable rows={rows} />
      </GamePanel>

      <GamePanel>
        <GameSectionTitle>{t('tournament.plan.notes')}</GameSectionTitle>
        <div className="tournament-plan-body">
          <textarea className="game-field tournament-plan-note" value={plan.note || ''} onChange={event => setPlan(p => ({ ...p, note: event.target.value.slice(0, 500) }))} placeholder={t('tournament.plan.notes_placeholder')} />
          <GameActionButton tone="green" onClick={handleSave}>{saved ? `✓ ${t('tournament.plan.saved')}` : `💾 ${t('tournament.plan.save')}`}</GameActionButton>
        </div>
      </GamePanel>
    </div>
  );
}
