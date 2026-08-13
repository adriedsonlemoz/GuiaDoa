import { useEffect, useMemo, useState } from 'react';
import { useGameData } from '../../data/GameDataContext.jsx';
import { useI18n } from '../../hooks/useI18n.jsx';
import {
  DEFAULT_FOCUS,
  EDITING_STORAGE_KEY,
  EXPANSIVEIS,
  MAIN_RESOURCE_SLUGS,
  NORMAL_CORE,
  PLAN_STORAGE_KEY,
  REPEATABLE_BUILDINGS,
  SPECIAL_RESOURCE_BY_ISLAND,
} from './constants.js';
import {
  buildEdificiosMap,
  buildingMaxQty,
  calcularMetricas,
  createDefaultPlan,
  diffMetrics,
  firstKnownLevel,
  mainBuildingCatalog,
  migrateLegacyPlan,
  normalSlotLimit,
  snapshotMetrics,
  specialSlotLimit,
} from './ilhasUtils.js';

function readEditing() {
  try {
    const parsed = JSON.parse(localStorage.getItem(EDITING_STORAGE_KEY) || 'true');
    return parsed !== false;
  } catch {
    return true;
  }
}

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

export default function useIlhasManager() {
  const { edificios } = useGameData();
  const { t } = useI18n();
  const dbEdificios = useMemo(() => buildEdificiosMap(edificios), [edificios]);
  const catalogoPrincipal = useMemo(() => mainBuildingCatalog(edificios), [edificios]);
  const [plan, setPlan] = useState(() => migrateLegacyPlan(dbEdificios));
  const [isEditing, setIsEditing] = useState(readEditing);
  const [dialogConfig, setDialogConfig] = useState({ open: false, type: '', title: '', text: '' });
  const [toast, setToast] = useState({ open: false, message: '', severity: 'error' });
  const [comparisonBase, setComparisonBase] = useState(null);

  // Quando o catálogo chega da API depois do primeiro render, garante níveis iniciais válidos.
  useEffect(() => {
    if (!edificios.length) return;
    setPlan(current => {
      const next = clone(current?.schema === 6 ? current : createDefaultPlan(dbEdificios));
      for (const [ilha, island] of Object.entries(next.islands || {})) {
        for (const group of ['buildings','resources']) {
          for (const [slug, entry] of Object.entries(island[group] || {})) {
            if (!entry.level) entry.level = firstKnownLevel(dbEdificios, slug);
          }
        }
      }
      if (!next.fortressLevel) next.fortressLevel = firstKnownLevel(dbEdificios, 'Fortaleza');
      return next;
    });
  }, [edificios.length, dbEdificios]);

  const metricas = useMemo(() => calcularMetricas({ plan, dbEdificios }), [plan, dbEdificios]);
  const selectedIsland = plan.selectedIsland || 'PRINC';
  const selectedMetrics = metricas.islandMetrics[selectedIsland] || {};
  const comparison = useMemo(() => {
    if (!comparisonBase) return null;
    const current = snapshotMetrics(metricas, selectedIsland);
    return { base: comparisonBase, current, diff: diffMetrics(current, comparisonBase) };
  }, [comparisonBase, metricas, selectedIsland]);

  useEffect(() => {
    localStorage.setItem(PLAN_STORAGE_KEY, JSON.stringify(plan));
    localStorage.setItem(EDITING_STORAGE_KEY, JSON.stringify(isEditing));
  }, [plan, isEditing]);

  useEffect(() => {
    window.temAlteracoesNaoSalvas = isEditing;
    return () => { window.temAlteracoesNaoSalvas = false; };
  }, [isEditing]);

  const showToast = (message, severity = 'error') => setToast({ open: true, message, severity });
  const closeToast = () => setToast(current => ({ ...current, open: false }));

  const updatePlan = updater => {
    if (!isEditing) return;
    setPlan(current => updater(clone(current)));
  };

  const setSelectedIsland = ilha => setPlan(current => ({ ...current, selectedIsland: ilha }));
  const setFocus = focus => setPlan(current => ({ ...current, focus }));

  const adjustEntry = (group, slug, delta, ilha = selectedIsland) => {
    updatePlan(next => {
      const island = next.islands[ilha];
      const entries = island[group];
      if (!entries[slug]) entries[slug] = { qty: 0, level: firstKnownLevel(dbEdificios, slug) };
      const currentQty = Number(entries[slug].qty || 0);
      const nextQty = Math.max(0, currentQty + delta);
      if (group === 'buildings') {
        const limit = normalSlotLimit(ilha, next.expansions);
        const used = Object.values(entries).reduce((sum, entry) => sum + Number(entry.qty || 0), 0);
        const maxQty = buildingMaxQty(slug, limit);
        if (nextQty > maxQty) {
          showToast(t('islands.only_one_building'), 'warning');
          return next;
        }
        if (delta > 0 && used >= limit) {
          showToast(t('islands.normal_slots_full', { count: limit }), 'warning');
          return next;
        }
      } else {
        const limit = ilha === 'PRINC' ? metricas.mainFieldLimit : specialSlotLimit(ilha, next.expansions);
        const used = Object.values(entries).reduce((sum, entry) => sum + Number(entry.qty || 0), 0);
        if (delta > 0 && used >= limit) {
          showToast(t('islands.resource_slots_full', { count: limit }), 'warning');
          return next;
        }
      }
      entries[slug].qty = nextQty;
      return next;
    });
  };

  const changeLevel = (group, slug, level, ilha = selectedIsland) => {
    updatePlan(next => {
      const entries = next.islands[ilha][group];
      if (!entries[slug]) entries[slug] = { qty: 0, level };
      entries[slug].level = Number(level);
      return next;
    });
  };

  const addMainBuilding = slug => {
    if (!slug) return;
    updatePlan(next => {
      const entries = next.islands.PRINC.buildings;
      if (!entries[slug]) entries[slug] = { qty: 0, level: firstKnownLevel(dbEdificios, slug) };
      const used = Object.values(entries).reduce((sum, entry) => sum + Number(entry.qty || 0), 0);
      const limit = normalSlotLimit('PRINC', next.expansions);
      if (used >= limit) {
        showToast(t('islands.normal_slots_full', { count: limit }), 'warning');
        return next;
      }
      if (!REPEATABLE_BUILDINGS.has(slug) && entries[slug].qty >= 1) return next;
      entries[slug].qty += 1;
      return next;
    });
  };

  const setFortressLevel = level => updatePlan(next => {
    next.fortressLevel = Number(level);
    return next;
  });

  const adjustTerritory = (slug, delta) => {
    if (!MAIN_RESOURCE_SLUGS.includes(slug)) return;
    updatePlan(next => {
      const current = Number(next.territories[slug] || 0);
      if (delta > 0 && metricas.territoriesFree <= 0) {
        showToast(t('islands.limit_reached', { count: metricas.maxTerritories }), 'warning');
        return next;
      }
      next.territories[slug] = Math.max(0, current + delta);
      return next;
    });
  };

  const toggleExpansion = ilha => {
    if (!EXPANSIVEIS.includes(ilha)) return;
    updatePlan(next => {
      const isOn = Boolean(next.expansions[ilha]);
      if (isOn) {
        const normalUsed = Object.values(next.islands[ilha].buildings).reduce((sum, entry) => sum + Number(entry.qty || 0), 0);
        const resourceUsed = Object.values(next.islands[ilha].resources).reduce((sum, entry) => sum + Number(entry.qty || 0), 0);
        if (normalUsed > 6 || resourceUsed > 4) {
          showToast(t('islands.expansion_in_use', { normal: normalUsed, resources: resourceUsed }), 'warning');
          return next;
        }
      }
      next.expansions[ilha] = !isOn;
      return next;
    });
  };

  const requestAction = type => {
    if (type === 'clear') setDialogConfig({ open: true, type, title: t('islands.clear_title'), text: t('islands.clear_text') });
    if (type === 'save') setDialogConfig({ open: true, type, title: t('islands.lock_title'), text: t('islands.lock_text') });
  };

  const confirmAction = () => {
    if (dialogConfig.type === 'clear') {
      setPlan(createDefaultPlan(dbEdificios));
      setComparisonBase(null);
      setIsEditing(true);
      showToast(t('islands.reset_ok'), 'success');
    }
    if (dialogConfig.type === 'save') {
      setIsEditing(false);
      showToast(t('islands.lock_ok'), 'success');
    }
    setDialogConfig(current => ({ ...current, open: false }));
  };

  const startComparison = () => setComparisonBase(snapshotMetrics(metricas, selectedIsland));
  const stopComparison = () => setComparisonBase(null);

  const recommendation = useMemo(() => {
    const focus = plan.focus || DEFAULT_FOCUS;
    const free = selectedMetrics.normalFree || 0;
    if (free <= 0) return { textKey: 'islands.recommend.full', slug: null };
    if (focus === 'training') return { textKey: 'islands.recommend.training', slug: 'Guarnicao' };
    if (focus === 'protection') return { textKey: 'islands.recommend.protection', slug: 'FonteDaCura' };
    if (metricas.freePopulation < 0 || metricas.freePopulation < Math.max(500, metricas.population * 0.15)) {
      return { textKey: 'islands.recommend.population', slug: 'Casa' };
    }
    return { textKey: 'islands.recommend.balanced', slug: 'FonteDaCura' };
  }, [plan.focus, selectedMetrics.normalFree, metricas.freePopulation, metricas.population]);

  const applyRecommendation = () => {
    if (recommendation.slug) adjustEntry('buildings', recommendation.slug, 1);
  };

  return {
    plan, isEditing, dialogConfig, toast, metricas, selectedIsland, selectedMetrics,
    dbEdificios, catalogoPrincipal, comparison, recommendation,
    setIsEditing, setDialogConfig, closeToast, setSelectedIsland, setFocus,
    adjustEntry, changeLevel, addMainBuilding, setFortressLevel, adjustTerritory,
    toggleExpansion, requestAction, confirmAction, startComparison, stopComparison,
    applyRecommendation,
  };
}
