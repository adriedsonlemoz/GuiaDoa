import React, { useMemo, useState } from 'react';
import { C } from '../../theme.js';
import { useI18n } from '../../hooks/useI18n.jsx';
import { GameActionButton, GamePanel, GameSectionTitle, GameTabs } from '../shared/GameChrome.jsx';
import {
  EXPANSIVEIS,
  ILHA_META,
  ILHAS_NOMES,
  MAIN_RESOURCE_SLUGS,
  NORMAL_CORE,
  REPEATABLE_BUILDINGS,
  RESOURCE_VISUAL,
  SPECIAL_RESOURCE_BY_ISLAND,
} from './constants.js';
import { entryEffect, fmtN, levelsOf, normalSlotLimit, specialSlotLimit } from './ilhasUtils.js';
import { LevelSelect, PlannerRow, SlotMeter, Stepper } from './IslandPlannerControls.jsx';

function islandTabs(t) {
  return ILHAS_NOMES.map(id => ({ id, icon: ILHA_META[id].icon, label: t(ILHA_META[id].labelKey) }));
}

function buildingRowsForIsland(selectedIsland, island, catalog) {
  if (selectedIsland !== 'PRINC') return NORMAL_CORE;
  const active = Object.entries(island.buildings || {}).filter(([, entry]) => Number(entry.qty || 0) > 0).map(([slug]) => slug);
  const known = new Set([...NORMAL_CORE, ...active]);
  const ordered = catalog.map(item => item.slug).filter(slug => known.has(slug));
  NORMAL_CORE.forEach(slug => { if (!ordered.includes(slug)) ordered.unshift(slug); });
  return [...new Set(ordered)];
}

function BuildingList({ manager, t, content, locale }) {
  const { plan, selectedIsland, dbEdificios, catalogoPrincipal, isEditing, selectedMetrics } = manager;
  const island = plan.islands[selectedIsland];
  const rows = buildingRowsForIsland(selectedIsland, island, catalogoPrincipal);
  const [toAdd, setToAdd] = useState('');
  const usedSlugs = new Set(Object.keys(island.buildings || {}).filter(slug => Number(island.buildings[slug]?.qty || 0) > 0));
  const addOptions = catalogoPrincipal.filter(item => !usedSlugs.has(item.slug) && !NORMAL_CORE.includes(item.slug));

  return (
    <GamePanel className="island-section-panel">
      <GameSectionTitle aside={`${selectedMetrics.normalUsed}/${selectedMetrics.normalLimit}`}>{t('islands.city_buildings')}</GameSectionTitle>
      <div className="island-planner-list">
        {rows.map(slug => {
          const meta = dbEdificios[slug] || { slug, nome: slug, icone: '🏗️', descricao: '' };
          const entry = island.buildings[slug] || { qty: 0, level: 1 };
          const maxQty = REPEATABLE_BUILDINGS.has(slug) ? selectedMetrics.normalLimit : 1;
          return (
            <PlannerRow
              key={slug}
              icon={meta.icone || '🏗️'}
              title={content(meta, 'nome') || meta.nome || slug}
              description={content(meta, 'descricao') || meta.descricao}
              effect={entryEffect(dbEdificios, slug, entry, locale)}
              value={Number(entry.qty || 0)}
              optional={!NORMAL_CORE.includes(slug)}
              disabled={!isEditing}
              maxed={Number(entry.qty || 0) >= maxQty || selectedMetrics.normalFree <= 0}
              onMinus={() => manager.adjustEntry('buildings', slug, -1)}
              onPlus={() => manager.adjustEntry('buildings', slug, 1)}
              levelControl={<LevelSelect dbEdificios={dbEdificios} slug={slug} value={entry.level} disabled={!isEditing} onChange={level => manager.changeLevel('buildings', slug, level)} />}
            />
          );
        })}
      </div>

      {selectedIsland === 'PRINC' && addOptions.length > 0 ? (
        <div className="island-add-building">
          <select value={toAdd} disabled={!isEditing} onChange={event => setToAdd(event.target.value)}>
            <option value="">{t('islands.choose_other_building')}</option>
            {addOptions.map(item => <option key={item.slug} value={item.slug}>{content(item, 'nome') || item.nome}</option>)}
          </select>
          <GameActionButton
            tone="blue"
            disabled={!isEditing || !toAdd || selectedMetrics.normalFree <= 0}
            onClick={() => { manager.addMainBuilding(toAdd); setToAdd(''); }}
          >
            + {t('common.add')}
          </GameActionButton>
        </div>
      ) : null}
    </GamePanel>
  );
}

function TerritoryControl({ slug, manager, t }) {
  const qty = Number(manager.plan.territories[slug] || 0);
  return (
    <div className="island-territory-control">
      <span>{t('islands.territories')} <strong>{qty}</strong></span>
      <Stepper value={qty} disabled={!manager.isEditing} maxed={manager.metricas.territoriesFree <= 0} onMinus={() => manager.adjustTerritory(slug, -1)} onPlus={() => manager.adjustTerritory(slug, 1)} />
    </div>
  );
}

function ResourceList({ manager, t, content, locale }) {
  const { plan, selectedIsland, selectedMetrics, dbEdificios, isEditing } = manager;
  const island = plan.islands[selectedIsland];
  const slugs = selectedIsland === 'PRINC'
    ? MAIN_RESOURCE_SLUGS
    : [SPECIAL_RESOURCE_BY_ISLAND[selectedIsland]?.slug].filter(Boolean);

  return (
    <GamePanel className="island-section-panel">
      <GameSectionTitle aside={`${selectedMetrics.resourceUsed}/${selectedMetrics.resourceLimit}`}>
        {selectedIsland === 'PRINC' ? t('islands.resource_fields') : t('islands.exclusive_resources')}
      </GameSectionTitle>
      <div className="island-planner-list">
        {slugs.map(slug => {
          const meta = dbEdificios[slug] || { slug, nome: slug, icone: RESOURCE_VISUAL[slug]?.icon || '🌾', descricao: '' };
          const visual = RESOURCE_VISUAL[slug] || {};
          const entry = island.resources[slug] || { qty: 0, level: 1 };
          const level = levelsOf(dbEdificios, slug).find(row => Number(row.nivel) === Number(entry.level)) || {};
          const qty = Number(entry.qty || 0);
          const effect = `${fmtN(qty * Number(level.prodHora || 0), locale)}/h · ${fmtN(qty * Number(level.pop || 0), locale)} ${t('islands.workers').toLowerCase()}`;
          return (
            <div key={slug} className="island-resource-row-wrap">
              <PlannerRow
                icon={meta.icone || visual.icon || '🌾'}
                title={content(meta, 'nome') || meta.nome || t(visual.labelKey)}
                description={content(meta, 'descricao') || meta.descricao}
                effect={effect}
                value={qty}
                accent={visual.color}
                disabled={!isEditing}
                maxed={selectedMetrics.resourceFree <= 0}
                onMinus={() => manager.adjustEntry('resources', slug, -1)}
                onPlus={() => manager.adjustEntry('resources', slug, 1)}
                levelControl={<LevelSelect dbEdificios={dbEdificios} slug={slug} value={entry.level} disabled={!isEditing} onChange={levelValue => manager.changeLevel('resources', slug, levelValue)} />}
              />
              {selectedIsland === 'PRINC' ? <TerritoryControl slug={slug} manager={manager} t={t} /> : null}
            </div>
          );
        })}
      </div>
      {selectedIsland !== 'PRINC' ? (
        <p className="island-special-note">{t('islands.special_resource_note')}</p>
      ) : (
        <p className="island-special-note">{t('islands.fortress_field_note', { count: manager.metricas.mainFieldLimit })}</p>
      )}
    </GamePanel>
  );
}

function IslandRules({ manager, t }) {
  const { plan, selectedIsland, selectedMetrics, dbEdificios, isEditing } = manager;
  const meta = ILHA_META[selectedIsland];
  const special = SPECIAL_RESOURCE_BY_ISLAND[selectedIsland];
  const expansionOn = Boolean(plan.expansions[selectedIsland]);
  return (
    <GamePanel className="island-overview-panel">
      <div className="island-overview-title">
        <span aria-hidden="true">{meta.icon}</span>
        <div>
          <strong>{t(meta.labelKey)}</strong>
          <span>{t('islands.plan_this_island')}</span>
        </div>
      </div>
      <div className="island-meter-grid">
        <SlotMeter used={selectedMetrics.normalUsed} max={selectedMetrics.normalLimit} label={t('islands.normal_slots')} />
        <SlotMeter used={selectedMetrics.resourceUsed} max={selectedMetrics.resourceLimit} label={selectedIsland === 'PRINC' ? t('islands.resource_slots') : t('islands.exclusive_slots')} />
      </div>

      {selectedIsland === 'PRINC' ? (
        <div className="island-fortress-control">
          <div>
            <strong>🏰 {t('islands.fortress')}</strong>
            <span>{t('islands.fortress_controls_fields')}</span>
          </div>
          <LevelSelect dbEdificios={dbEdificios} slug="Fortaleza" value={plan.fortressLevel} disabled={!isEditing} onChange={manager.setFortressLevel} />
        </div>
      ) : null}

      {EXPANSIVEIS.includes(selectedIsland) ? (
        <button type="button" className={`island-expansion-toggle${expansionOn ? ' is-on' : ''}`} disabled={!isEditing} onClick={() => manager.toggleExpansion(selectedIsland)}>
          <span>{expansionOn ? '✓' : '+'}</span>
          <div>
            <strong>{t('islands.expansion')}</strong>
            <small>{expansionOn ? t('islands.expansion_active') : t('islands.expansion_unlocks')}</small>
          </div>
        </button>
      ) : special && !special.expansion ? (
        <div className="island-no-expansion">💧 {t('islands.water_no_expansion')}</div>
      ) : null}
    </GamePanel>
  );
}

export default function IslandPlannerView({ manager }) {
  const { t, content, locale } = useI18n();
  const tabs = useMemo(() => islandTabs(t), [t]);
  return (
    <>
      <GameTabs tabs={tabs} value={manager.selectedIsland} onChange={manager.setSelectedIsland} compact />
      <IslandRules manager={manager} t={t} />
      <BuildingList manager={manager} t={t} content={content} locale={locale} />
      <ResourceList manager={manager} t={t} content={content} locale={locale} />
    </>
  );
}
