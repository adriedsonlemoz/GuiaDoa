import React, { useMemo } from 'react';
import { C } from '../../../theme.js';
import { fmtN } from './RewardRow.jsx';
import { useGameData } from '../../../data/GameDataContext.jsx';
import { useI18n } from '../../../hooks/useI18n.jsx';
import { GameInfoTable, GamePanel, GameSectionTitle } from '../../shared/GameChrome.jsx';

const TorneioLayout = ({
  title, icon, color = C.ACCENT,
  inventario, totalPts = 0, ptsSufixo = 'pontos',
  metas = [], premios = {}, onPremioChange,
  tropaPremio = '', onTropaChange,
  extraInfo,
}) => {
  const { t, content, locale } = useI18n();
  const { tropas: dbTropas } = useGameData();
  const tropaObj = dbTropas.find(item => item.nome === tropaPremio);
  const poderUnit = tropaObj?.poder || 0;
  const orderedMetas = useMemo(() => [...metas].sort((a, b) => a.reqPts - b.reqPts), [metas]);
  const achieved = orderedMetas.filter(meta => totalPts >= meta.reqPts);
  const nextMeta = orderedMetas.find(meta => totalPts < meta.reqPts) || null;
  const maxTarget = Math.max(0, ...orderedMetas.map(meta => meta.reqPts));
  const progress = maxTarget > 0 ? Math.min(100, Math.round((totalPts / maxTarget) * 100)) : 100;
  const remaining = nextMeta ? Math.max(0, nextMeta.reqPts - totalPts) : 0;

  const totalTropas = achieved.reduce((acc, meta) => {
    const reward = premios[meta.key] || { m: 10, b: 1000 };
    return acc + ((reward.m || 0) * (reward.b || 0));
  }, 0);
  const totalPoder = totalTropas * poderUnit;

  const scoreRows = [
    { key: 'points', label: t('tournament.layout.points_now'), value: fmtN(totalPts, locale) },
    { key: 'achieved', label: t('tournament.layout.rewards_unlocked'), value: `${achieved.length}/${orderedMetas.length}` },
    nextMeta
      ? { key: 'remaining', label: t('tournament.layout.to_next_reward'), value: fmtN(remaining, locale) }
      : { key: 'remaining', label: t('tournament.layout.final_reward'), value: `✓ ${t('tournament.layout.unlocked')}` },
  ];

  return (
    <div className="tournament-calculator-shell">
      <GamePanel>
        <div className="tournament-calculator-hero">
          <span className="tournament-calculator-icon" aria-hidden="true">{icon}</span>
          <div>
            <small>{t('torneio.layout.calculadora')}</small>
            <h2>{title}</h2>
          </div>
          <strong style={{ color }}>{fmtN(totalPts, locale)}</strong>
        </div>
        <div className="tournament-progress-track tournament-progress-main" aria-label={`${progress}%`}>
          <div className="tournament-progress-fill" style={{ width: `${progress}%`, background: color }} />
        </div>
        <GameInfoTable rows={scoreRows} />
      </GamePanel>

      <GamePanel>
        <GameSectionTitle aside={nextMeta ? fmtN(nextMeta.reqPts, locale) : t('tournament.layout.complete')}>
          {t('tournament.layout.progression')}
        </GameSectionTitle>
        <div className="tournament-goal-list">
          {orderedMetas.map((meta, index) => {
            const unlocked = totalPts >= meta.reqPts;
            const current = !unlocked && nextMeta?.key === meta.key;
            return (
              <div key={meta.key} className={`tournament-goal-row${unlocked ? ' is-unlocked' : ''}${current ? ' is-next' : ''}`}>
                <span className="tournament-goal-state">{unlocked ? '✓' : current ? '●' : '○'}</span>
                <div className="tournament-goal-copy">
                  <strong>{meta.label}</strong>
                  <small>{fmtN(meta.reqPts, locale)} {ptsSufixo}</small>
                </div>
                <span className="tournament-goal-index">{index + 1}</span>
              </div>
            );
          })}
        </div>
        <p className="tournament-cumulative-note">{t('tournament.layout.cumulative_note')}</p>
      </GamePanel>

      <GamePanel>
        <GameSectionTitle>{t('torneio.layout.inventario')}</GameSectionTitle>
        <div className="tournament-calculator-body">{inventario}</div>
      </GamePanel>

      {extraInfo ? <div>{extraInfo}</div> : null}

      <GamePanel>
        <GameSectionTitle aside={`${achieved.length}/${orderedMetas.length}`}>{t('torneio.layout.premiacao')}</GameSectionTitle>
        <div className="tournament-calculator-body">
          <label className="tournament-field-label">{t('torneio.layout.tropa_premio')}</label>
          <select className="tw-select" value={tropaPremio} onChange={event => onTropaChange?.(event.target.value)}>
            <option value="">{t('torneio.layout.selecionar_tropa')}</option>
            {dbTropas.map(item => <option key={item.nome} value={item.nome}>{content(item, 'nome')} (⭐ {item.poder})</option>)}
          </select>

          <div className="tournament-reward-editor">
            {orderedMetas.map(meta => {
              const unlocked = totalPts >= meta.reqPts;
              const reward = premios[meta.key] || { m: 10, b: 1000 };
              return (
                <div key={meta.key} className={`tournament-reward-row${unlocked ? ' is-unlocked' : ''}`}>
                  <div className="tournament-reward-copy">
                    <strong>{meta.label}</strong>
                    <small>{unlocked ? t('tournament.layout.reward_counts') : `${fmtN(Math.max(0, meta.reqPts - totalPts), locale)} ${t('tournament.layout.points_missing')}`}</small>
                  </div>
                  <div className="tournament-reward-controls">
                    <button type="button" disabled={!unlocked} onClick={() => onPremioChange?.(meta.key, 'm', Math.max(0, (reward.m || 0) - 1))}>−</button>
                    <span>{reward.m ?? 10}</span>
                    <button type="button" disabled={!unlocked} onClick={() => onPremioChange?.(meta.key, 'm', (reward.m || 0) + 1)}>+</button>
                    <span>×</span>
                    <select value={reward.b ?? 1000} disabled={!unlocked} onChange={event => onPremioChange?.(meta.key, 'b', parseInt(event.target.value, 10))}>
                      {[10,50,100,200,300,500,1000,2000,5000,10000].map(value => <option key={value} value={value}>{fmtN(value, locale)}</option>)}
                    </select>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </GamePanel>

      <GamePanel>
        <GameSectionTitle>{t('torneio.layout.resultados')}</GameSectionTitle>
        <GameInfoTable rows={[
          { key: 'troops', icon: '⚔️', label: t('torneio.layout.total_tropas'), value: fmtN(totalTropas, locale) },
          { key: 'power', icon: '✦', label: t('torneio.layout.poder_total'), value: fmtN(totalPoder, locale) },
        ]} />
      </GamePanel>
    </div>
  );
};

export default TorneioLayout;
