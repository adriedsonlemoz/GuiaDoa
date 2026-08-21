import React from 'react';
import { useI18n } from '../../hooks/useI18n.jsx';
import GameHeader from '../shared/GameHeader.jsx';
import { GamePanel, GameSectionTitle } from '../shared/GameChrome.jsx';
import BuildingModuleNav from './BuildingModuleNav.jsx';
import SpiritStoneGrid from './SpiritStoneGrid.jsx';

export default function GrutaView({ gruta, basilica, setRoute }) {
  const { t, content, locale } = useI18n();
  const levels = gruta?.niveis || [];
  const data = gruta?.dadosEspeciais || {};
  const stones = basilica?.dadosEspeciais?.pedras || [];
  const pct = value => `${Number(value).toLocaleString(locale)}%`;

  return (
    <div style={{ maxWidth:620, margin:'0 auto', paddingBottom:18 }}>
      <BuildingModuleNav setRoute={setRoute} sibling={{ route:'edificios_basilica', label:t('buildings.open_basilica') }} />
      <GameHeader title={content(gruta,'nome') || t('buildings.cave_title')} subtitle={content(gruta,'descricao') || t('buildings.cave_card_subtitle')} />

      <div className="building-requirement-alert">
        <b>⚠️ {t('buildings.cave.requirement_title')}</b>
        <span>{t('buildings.cave.requirement_text')}</span>
      </div>

      <GamePanel>
        <div className="special-building-hero">
          <img src={gruta?.imagem || '/assets/edificios/especiais/gruta.webp'} alt="" />
          <div>
            <span className="special-building-kicker">{t('buildings.special_building')}</span>
            <h2>{content(gruta,'nome') || t('buildings.cave_title')}</h2>
            <p>{t('buildings.cave.hero_text')}</p>
          </div>
        </div>
        <div className="special-building-stat-grid">
          <div><b>{data.nivelMax || 10}</b><span>{t('buildings.max_level')}</span></div>
          <div><b>+{data.bonusPorNivelPct || 50}%</b><span>{t('buildings.cave.per_level')}</span></div>
          <div><b>{data.exploracaoHoras || 4}h</b><span>{t('buildings.cave.exploration')}</span></div>
          <div><b>{data.orbitasPorPedraNivel1 || 100}</b><span>{t('buildings.cave.orbs_per_stone')}</span></div>
        </div>
      </GamePanel>

      <section className="game-panel special-building-section">
        <GameSectionTitle aside={`${levels.length}/10`}>{t('buildings.cave.levels_title')}</GameSectionTitle>
        <p className="special-building-note">{t('buildings.cave.levels_note')}</p>
        <div className="compact-level-grid">
          {levels.map(row => (
            <div key={row.nivel} className={`compact-level-row${row.nivelMax ? ' is-max' : ''}`}>
              <span>{t('common.level')} {row.nivel}</span>
              <b>{pct(row.bonusOrbitasPct)}</b>
              {row.nivelMax ? <small>{t('buildings.maximum')}</small> : null}
            </div>
          ))}
        </div>
      </section>

      <section className="game-panel special-building-section">
        <GameSectionTitle>{t('buildings.cave.how_title')}</GameSectionTitle>
        <div className="building-rule-list">
          <p><b>1.</b> {t('buildings.cave.rule_1')}</p>
          <p><b>2.</b> {t('buildings.cave.rule_2')}</p>
          <p><b>3.</b> {t('buildings.cave.rule_3', { count:data.ajudasComRecompensa || 5 })}</p>
          <p><b>4.</b> {t('buildings.cave.rule_4')}</p>
          <p><b>5.</b> {t('buildings.cave.rule_5')}</p>
        </div>
      </section>

      <section className="game-panel special-building-section">
        <GameSectionTitle>{t('buildings.cave.exchange_title')}</GameSectionTitle>
        <div className="orb-exchange-banner"><b>💠 {data.orbitasPorPedraNivel1 || 100}</b><span>→</span><b>💎 1 {t('buildings.stone.level1')}</b></div>
        <p className="special-building-note">{t('buildings.cave.exchange_note')}</p>
        <SpiritStoneGrid stones={stones} />
        <button type="button" className="building-primary-action" onClick={() => setRoute('edificios_basilica')}>⛪ {t('buildings.open_basilica')}</button>
      </section>
    </div>
  );
}
