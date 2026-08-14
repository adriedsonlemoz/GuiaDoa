import React, { useEffect, useMemo, useState } from 'react';
import GameHeader from './shared/GameHeader.jsx';
import AppErrorState from '../ui/AppErrorState.jsx';
import { API_URL as API } from '../config/api.js';
import { useI18n } from '../hooks/useI18n.jsx';

const CATEGORIES = [
  { id:'antropos', icon:'☠️', title:'campaign.category.anthropus', desc:'campaign.category.anthropus.desc' },
  { id:'campos', icon:'🌲', title:'campaign.category.fields', desc:'campaign.category.fields.desc' },
  { id:'zyrvorthian', icon:'🐲', title:'campaign.category.zyrvorthian', desc:'campaign.category.zyrvorthian.desc' },
  { id:'grodz', icon:'🛡️', title:'campaign.category.grodz', desc:'campaign.category.grodz.desc' },
];

const FIELD_TYPES = [
  { id:'savana', icon:'🍞', title:'campaign.field.savannah' },
  { id:'montanha', icon:'◆', title:'campaign.field.mountain' },
  { id:'morro', icon:'◆', title:'campaign.field.hill' },
  { id:'lago', icon:'◆', title:'campaign.field.lake' },
  { id:'floresta', icon:'◆', title:'campaign.field.forest' },
];

const RESOURCE_ICONS = { stone:'🪨', metals:'⛏️', wood:'🪵', gold:'🟡', food:'🍞' };
const RESOURCE_KEYS = {
  stone:'troops.resource.stone', metals:'troops.resource.metals', wood:'troops.resource.wood',
  gold:'troops.resource.gold', food:'troops.resource.food', pearls:'troops.resource.pearls',
  seeds:'troops.resource.seeds', geodes:'troops.resource.geodes', sulfur:'troops.resource.sulfur',
};

function Loading({ t }) {
  return <div className="campaign-loading"><span className="spinner" /> {t('campaign.loading')}</div>;
}

function CategoryLanding({ counts, onSelect, t }) {
  return (
    <>
      <div className="tw-card mb-3">
        <GameHeader title={t('campaign.title')} />
        <div className="campaign-intro">
          <p>{t('campaign.intro')}</p>
          <div className="campaign-source-note">✓ {t('campaign.source_rule')}</div>
        </div>
      </div>
      <div className="campaign-category-grid">
        {CATEGORIES.map(cat => {
          const total = Number(counts?.[cat.id] || 0);
          return (
            <button key={cat.id} type="button" className={`campaign-category-card ${total ? 'is-ready' : 'is-empty'}`} onClick={() => total && onSelect(cat.id)} disabled={!total}>
              <span className="campaign-category-icon">{cat.icon}</span>
              <span className="campaign-category-title">{t(cat.title)}</span>
              <span className="campaign-category-desc">{t(cat.desc)}</span>
              <span className={`campaign-category-status ${total ? 'ready' : ''}`}>
                {total ? t('campaign.entries', { count:total }) : t('campaign.awaiting_data')}
              </span>
            </button>
          );
        })}
      </div>
    </>
  );
}

function FieldLanding({ entries, onSelect, onBack, t }) {
  return (
    <div>
      <button type="button" className="campaign-back" onClick={onBack}>‹ {t('campaign.categories')}</button>
      <div className="tw-card mb-3">
        <GameHeader title={`🌲 ${t('campaign.category.fields')}`} />
        <div className="campaign-section-copy">{t('campaign.fields_intro')}</div>
      </div>
      <div className="campaign-field-grid">
        {FIELD_TYPES.map(field => {
          const matches = entries.filter(x => x.subtipo === field.id);
          const principal = matches.find(x => x.campo?.recursoPrincipal)?.campo?.recursoPrincipal || '';
          const ready = matches.length > 0;
          return (
            <button key={field.id} type="button" className={`campaign-field-card ${ready ? 'is-ready' : 'is-empty'}`} disabled={!ready} onClick={() => ready && onSelect(field.id)}>
              <span className="campaign-field-icon">{principal ? (RESOURCE_ICONS[principal] || field.icon) : field.icon}</span>
              <strong>{t(field.title)}</strong>
              <small>{ready ? t('campaign.level_count', { count:matches.length }) : t('campaign.awaiting_data')}</small>
              {principal && <span className="campaign-field-resource">{t(RESOURCE_KEYS[principal] || 'campaign.resource')}</span>}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function LevelList({ category, entries, onOpen, onBack, t, locale, content, title }) {
  const cat = CATEGORIES.find(c => c.id === category);
  const fmt = useMemo(() => new Intl.NumberFormat(locale), [locale]);
  return (
    <div>
      <button type="button" className="campaign-back" onClick={onBack}>‹ {category === 'campos' ? t('campaign.field_types') : t('campaign.categories')}</button>
      <div className="tw-card mb-3">
        <GameHeader title={title || `${cat?.icon || '◆'} ${t(cat?.title || 'campaign.title')}`} />
        <div className="campaign-section-copy">{category === 'campos' ? t('campaign.field_levels_intro') : t(cat?.desc || 'campaign.intro')}</div>
      </div>
      <div className="campaign-level-grid">
        {entries.map(entry => {
          const totalTroops = (entry.tropas || []).reduce((sum, troop) => sum + Number(troop.quantidade || 0), 0);
          const sampleResources = (entry.recursos || []).slice(0, 5);
          const rewards = entry.recompensas || [];
          return (
            <button type="button" className="campaign-level-card" key={entry.slug} onClick={() => onOpen(entry)}>
              <div className="campaign-level-top">
                <span className="campaign-level-badge">{t('campaign.level_short')} {entry.nivel ?? '—'}</span>
                {entry.fonte?.verificado && <span className="campaign-verified" title={t('campaign.verified')}>✓</span>}
              </div>
              <strong>{content(entry, 'nome')}</strong>
              <span className="campaign-enemy-total">☠️ {fmt.format(totalTroops)} {t('campaign.enemy_troops_short')}</span>
              <div className="campaign-resource-mini">
                {sampleResources.map(r => <span key={r.tipo}>{RESOURCE_ICONS[r.tipo] || '◆'} {r.exibicao}</span>)}
                {entry.campo?.producaoHora != null && <span>↗ {fmt.format(entry.campo.producaoHora)}/h</span>}
              </div>
              {rewards.length > 0 && <span className="campaign-reward-mini">◇ {t('campaign.reward_count', { count:rewards.length })}</span>}
              <span className="campaign-open">{t('campaign.open')} ›</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function StrategyBlock({ strategy, t, locale }) {
  const translated = locale !== 'pt-BR' ? strategy?.i18n?.[locale] || {} : {};
  const published = Boolean(strategy?.publicada);
  const title = translated.titulo || strategy?.titulo || t('campaign.how_to_attack');
  const summary = translated.resumo || strategy?.resumo || '';
  const steps = translated.passos || strategy?.passos || [];
  const requirements = translated.requisitos || strategy?.requisitos || [];
  const notes = translated.observacoes || strategy?.observacoes || '';
  if (!published) {
    return (
      <div className="campaign-strategy campaign-strategy-pending">
        <div className="campaign-strategy-title">⚔️ {t('campaign.how_to_attack')}</div>
        <p>{t('campaign.strategy_pending')}</p>
        <button type="button" disabled className="campaign-strategy-button">{t('campaign.how_to_attack')} · {t('campaign.soon')}</button>
      </div>
    );
  }
  return (
    <div className="campaign-strategy">
      <div className="campaign-strategy-title">⚔️ {title}</div>
      {summary && <p>{summary}</p>}
      {requirements.length > 0 && <div className="campaign-guide-list"><strong>{t('campaign.requirements')}</strong>{requirements.map((x,i)=><span key={i}>• {x}</span>)}</div>}
      {steps.length > 0 && <div className="campaign-guide-list"><strong>{t('campaign.steps')}</strong>{steps.map((x,i)=><span key={i}>{i+1}. {x}</span>)}</div>}
      {notes && <p className="campaign-guide-note">{notes}</p>}
    </div>
  );
}

function RewardsBlock({ rewards, t, locale }) {
  return (
    <section className="campaign-report-section">
      <h3>{t('campaign.possible_rewards')}</h3>
      {rewards.length ? (
        <div className="campaign-reward-grid">
          {rewards.map((reward, index) => {
            const translated = locale !== 'pt-BR' ? reward?.i18n?.[locale] || {} : {};
            const name = translated.nome || reward.nome || '';
            return (
              <div className={`campaign-reward ${reward.nomeConfirmado ? 'is-named' : 'is-symbolic'}`} key={reward.codigo || index}>
                <span className="campaign-reward-symbol">{reward.simbolo || `R${index + 1}`}</span>
                <div>
                  <strong>{name || t('campaign.reward_unknown')}</strong>
                  {reward.quantidade != null && <small>× {reward.quantidade}</small>}
                  {!reward.nomeConfirmado && <small>{t('campaign.reward_name_pending')}</small>}
                </div>
              </div>
            );
          })}
        </div>
      ) : <p className="campaign-reward-empty">{t('campaign.rewards_pending')}</p>}
      <p className="campaign-reward-note">{t('campaign.reward_note')}</p>
    </section>
  );
}

function Detail({ entry, onBack, t, locale, content }) {
  const fmt = useMemo(() => new Intl.NumberFormat(locale), [locale]);
  const totalTroops = (entry.tropas || []).reduce((sum, troop) => sum + Number(troop.quantidade || 0), 0);
  const rewards = entry.recompensas || [];
  const principal = entry.campo?.recursoPrincipal || '';
  return (
    <div>
      <button type="button" className="campaign-back" onClick={onBack}>‹ {t('campaign.levels')}</button>
      <div className="campaign-report-card">
        <div className="campaign-report-ribbon">{content(entry, 'nome')}</div>
        <div className="campaign-report-summary">
          <div><span>☠️</span><strong>{fmt.format(totalTroops)}</strong><small>{t('campaign.enemy_total')}</small></div>
          <div><span>⚔️</span><strong>{(entry.tropas || []).length}</strong><small>{t('campaign.troop_types')}</small></div>
          <div><span>◇</span><strong>{rewards.length || '—'}</strong><small>{t('campaign.rewards')}</small></div>
        </div>

        {entry.categoria === 'campos' && (principal || entry.campo?.producaoHora != null) && (
          <section className="campaign-report-section campaign-domain-section">
            <h3>{t('campaign.field_domain')}</h3>
            <div className="campaign-domain-card">
              <span className="campaign-domain-icon">{RESOURCE_ICONS[principal] || '◆'}</span>
              <div>
                <small>{principal ? t(RESOURCE_KEYS[principal] || 'campaign.resource') : t('campaign.resource')}</small>
                <strong>{entry.campo?.producaoHora != null ? `${fmt.format(entry.campo.producaoHora)}/h` : '—'}</strong>
                <span>{t('campaign.production_when_conquered')}</span>
              </div>
            </div>
          </section>
        )}

        <section className="campaign-report-section">
          <h3>{t('campaign.resources')}</h3>
          <div className="campaign-resources-grid">
            {(entry.recursos || []).map(resource => (
              <div className="campaign-resource" key={resource.tipo}>
                <span className="campaign-resource-icon">{RESOURCE_ICONS[resource.tipo] || '◆'}</span>
                <span className="campaign-resource-copy"><small>{t(RESOURCE_KEYS[resource.tipo] || 'campaign.resource')}</small><strong>{resource.exato ? '' : '≈ '}{resource.exibicao}</strong></span>
              </div>
            ))}
          </div>
          {(entry.recursos || []).some(r => !r.exato) && <p className="campaign-abbrev-note">{t('campaign.abbrev_note')}</p>}
        </section>

        <RewardsBlock rewards={rewards} t={t} locale={locale} />

        <section className="campaign-report-section">
          <div className="campaign-section-heading"><h3>{t('campaign.enemy_composition')}</h3><span>{fmt.format(totalTroops)}</span></div>
          <div className="campaign-troop-table">
            <div className="campaign-troop-head"><span>{t('campaign.troop')}</span><span>{t('campaign.quantity')}</span></div>
            {(entry.tropas || []).map((troop, index) => (
              <div className="campaign-troop-row" key={`${troop.nome}-${index}`}><span>{troop.nome}</span><strong>{fmt.format(troop.quantidade)}</strong></div>
            ))}
          </div>
        </section>

        <StrategyBlock strategy={entry.estrategia} t={t} locale={locale} />
        <div className="campaign-source-foot">{t('campaign.source')}: {entry.fonte?.descricao || t('campaign.source_screenshot')} · {entry.fonte?.data || '—'}</div>
      </div>
    </div>
  );
}

export default function CampanhaMapa() {
  const { t, locale, content } = useI18n();
  const [data, setData] = useState({ locais:[], categorias:{} });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [category, setCategory] = useState(null);
  const [fieldType, setFieldType] = useState(null);
  const [selected, setSelected] = useState(null);

  const load = async () => {
    setLoading(true); setError(null);
    try {
      const response = await fetch(`${API}/api/campanha`, { cache:'no-store', signal:AbortSignal.timeout(12000) });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      setData(await response.json());
    } catch (err) { setError(err); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const categoryEntries = useMemo(() => (data.locais || []).filter(x => x.categoria === category), [data.locais, category]);
  const entries = useMemo(() => categoryEntries
    .filter(x => category !== 'campos' || !fieldType || x.subtipo === fieldType)
    .sort((a,b) => Number(a.nivel || 0) - Number(b.nivel || 0)), [categoryEntries, category, fieldType]);
  const fieldConfig = FIELD_TYPES.find(x => x.id === fieldType);

  if (loading) return <Loading t={t} />;
  if (error) return <AppErrorState title={t('campaign.load_error')} message={t('campaign.load_error_help')} code="CAMPAIGN-DATA-001" diagnostic={error.message} onRetry={load} />;
  if (selected) return <Detail entry={selected} onBack={() => setSelected(null)} t={t} locale={locale} content={content} />;
  if (category === 'campos' && !fieldType) return <FieldLanding entries={categoryEntries} onSelect={setFieldType} onBack={() => setCategory(null)} t={t} />;
  if (category) return <LevelList category={category} entries={entries} onOpen={setSelected} onBack={() => category === 'campos' ? setFieldType(null) : setCategory(null)} t={t} locale={locale} content={content} title={category === 'campos' && fieldConfig ? `${fieldConfig.icon} ${t(fieldConfig.title)}` : null} />;
  return <CategoryLanding counts={data.categorias} onSelect={cat => { setCategory(cat); setFieldType(null); }} t={t} />;
}
