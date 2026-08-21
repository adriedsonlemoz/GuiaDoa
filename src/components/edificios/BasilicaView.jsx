import React, { useMemo } from 'react';
import { useI18n } from '../../hooks/useI18n.jsx';
import GameHeader from '../shared/GameHeader.jsx';
import { GamePanel, GameSectionTitle } from '../shared/GameChrome.jsx';
import BuildingModuleNav from './BuildingModuleNav.jsx';
import SpiritStoneGrid from './SpiritStoneGrid.jsx';

function buildProjection(confirmUntil = 4, maxLevel = 10) {
  const rows = [];
  for (let level = 1; level <= maxLevel; level += 1) {
    const total = 3 ** (level - 1);
    const additional = level === 1 ? 0 : 2 * (3 ** (level - 2));
    const bonus = 0.5 * (2 ** (level - 1));
    rows.push({ level, total, additional, orbs:total * 100, bonus, estimated:level > confirmUntil });
  }
  return rows;
}

export default function BasilicaView({ basilica, setRoute }) {
  const { t, content, locale } = useI18n();
  const levels = basilica?.niveis || [];
  const data = basilica?.dadosEspeciais || {};
  const stones = data.pedras || [];
  const formula = data.combinacao?.projecaoFormula || {};
  const projection = useMemo(() => buildProjection(formula.confirmadaAteNivel || 4, formula.nivelMaxExistente || 10), [formula.confirmadaAteNivel, formula.nivelMaxExistente]);
  const fmt = n => Number(n).toLocaleString(locale);
  const pct = n => `${Number(n).toLocaleString(locale, { maximumFractionDigits:2 })}%`;

  return (
    <div style={{ maxWidth:620, margin:'0 auto', paddingBottom:18 }}>
      <BuildingModuleNav setRoute={setRoute} sibling={{ route:'edificios_gruta', label:t('buildings.open_cave') }} />
      <GameHeader title={content(basilica,'nome') || t('buildings.basilica_title')} subtitle={content(basilica,'descricao') || t('buildings.basilica_card_subtitle')} />

      <div className="building-dependency-banner">🕳️ <b>{t('buildings.basilica.dependency_title')}</b><span>{t('buildings.basilica.dependency_text')}</span></div>

      <GamePanel>
        <div className="special-building-hero">
          <img src={basilica?.imagem || '/assets/edificios/especiais/basilica.webp'} alt="" />
          <div>
            <span className="special-building-kicker">{t('buildings.special_building')}</span>
            <h2>{content(basilica,'nome') || t('buildings.basilica_title')}</h2>
            <p>{t('buildings.basilica.hero_text')}</p>
          </div>
        </div>
        <div className="special-building-stat-grid">
          <div><b>{data.nivelMax || 20}</b><span>{t('buildings.max_level')}</span></div>
          <div><b>{data.ranhurasMax || 24}</b><span>{t('buildings.basilica.max_slots')}</span></div>
          <div><b>{data.gruposCompletosMax || 4}</b><span>{t('buildings.basilica.full_sets')}</span></div>
          <div><b>Lv. {formula.nivelMaxExistente || 10}</b><span>{t('buildings.basilica.max_stone')}</span></div>
        </div>
      </GamePanel>

      <section className="game-panel special-building-section">
        <GameSectionTitle aside="1–20">{t('buildings.basilica.levels_title')}</GameSectionTitle>
        <p className="special-building-note">{t('buildings.basilica.levels_note')}</p>
        <div className="basilica-level-table">
          <div className="basilica-level-head"><span>{t('common.level')}</span><span>{t('buildings.basilica.slots')}</span><span>{t('buildings.basilica.stone_limit')}</span></div>
          {levels.map(row => <div className={`basilica-level-row${row.nivelMax?' is-max':''}`} key={row.nivel}><b>{row.nivel}</b><span>{row.ranhuras}</span><span>Lv. {row.nivelMaxPedra}</span></div>)}
        </div>
      </section>

      <section className="game-panel special-building-section">
        <GameSectionTitle>{t('buildings.stones_title')}</GameSectionTitle>
        <p className="special-building-note">{t('buildings.stones_intro')}</p>
        <SpiritStoneGrid stones={stones} />
      </section>

      <section className="game-panel special-building-section">
        <GameSectionTitle>{t('buildings.stone_upgrade_title')}</GameSectionTitle>
        <div className="stone-rule-highlight"><b>3 ×</b><span>{t('buildings.stone_upgrade_rule')}</span></div>
        <div className="stone-projection-table">
          <div className="stone-projection-head"><span>Lv.</span><span>{t('buildings.stone.add')}</span><span>{t('buildings.stone.total')}</span><span>{t('buildings.stone.orbs')}</span></div>
          {projection.map(row => (
            <div className={`stone-projection-row${row.estimated?' is-estimated':''}`} key={row.level}>
              <b>{row.level}</b>
              <span>{row.level === 1 ? '—' : `+${fmt(row.additional)}`}</span>
              <span>{fmt(row.total)}</span>
              <span>{fmt(row.orbs)}</span>
              {row.estimated ? <small>{t('buildings.estimated')}</small> : <small>{t('buildings.confirmed')}</small>}
            </div>
          ))}
        </div>
        <p className="special-building-warning">⚠️ {t('buildings.stone_projection_warning')}</p>
        <div className="stone-bonus-sequence">
          <b>{t('buildings.observed_bonus')}</b>
          {projection.slice(0,4).map(row => <span key={row.level}>Lv.{row.level}: {pct(row.bonus)}</span>)}
        </div>
      </section>

      <section className="game-panel special-building-section">
        <GameSectionTitle>{t('buildings.set_bonus_title')}</GameSectionTitle>
        <div className="set-bonus-card">
          <b>6 × Lv. {data.bonusConjuntoConfirmado?.nivelMinimoPedras || 1}</b>
          <span>{t('buildings.set_bonus_text', { value:String(data.bonusConjuntoConfirmado?.bonusPctPorAtributo || 1.5).replace('.', locale === 'pt-BR' ? ',' : '.') })}</span>
        </div>
        <p className="special-building-note">{t('buildings.set_bonus_lowest')}</p>
        <button type="button" className="building-primary-action" onClick={() => setRoute('edificios_gruta')}>🕳️ {t('buildings.open_cave')}</button>
      </section>
    </div>
  );
}
