import React, { useEffect, useMemo, useState } from 'react';
import GameHeader from './shared/GameHeader.jsx';
import FieldLanding from './campanha/FieldLanding.jsx';
import CollapsibleSection from './campanha/CollapsibleSection.jsx';
import RewardsBlock from './campanha/RewardsBlock.jsx';
import { FIELD_TYPES, RESOURCE_ICONS, RESOURCE_KEYS } from './campanha/fieldConfig.js';
import AppErrorState from '../ui/AppErrorState.jsx';
import { API_URL as API } from '../config/api.js';
import { useI18n } from '../hooks/useI18n.jsx';

const CATEGORIES = [
  { id:'antropos', icon:'☠️', title:'campaign.category.anthropus', desc:'campaign.category.anthropus.desc' },
  { id:'campos', icon:'🌲', title:'campaign.category.fields', desc:'campaign.category.fields.desc' },
  { id:'zyrvorthian', icon:'🐲', title:'campaign.category.zyrvorthian', desc:'campaign.category.zyrvorthian.desc' },
  { id:'grodz', icon:'🛡️', title:'campaign.category.grodz', desc:'campaign.category.grodz.desc' },
];

const SPECIAL_SAFE_TROOPS = [
  { pt:'Fada da Selva', en:'Forest Fairy' },
  { pt:'Centauros Infernais', en:'Infernal Centaurs' },
  { pt:'Sapo Tóxico', en:'Toxic Toad' },
  { pt:'Esmagadores Colossais', en:'Colossal Smashers' },
  { pt:'Caçador de Almas', en:'Soul Hunter' },
  { pt:'Medusa', en:'Snake-headed Maiden' },
];

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

function LevelList({ category, entries, onOpen, onBack, t, locale, content, title }) {
  const cat = CATEGORIES.find(c => c.id === category);
  const fmt = useMemo(() => new Intl.NumberFormat(locale), [locale]);
  return (
    <div>
      <button type="button" className="campaign-back" onClick={onBack}>↩ {category === 'campos' ? t('campaign.field_types') : t('campaign.categories')}</button>
      <div className="tw-card mb-3">
        <GameHeader title={title || `${cat?.icon || '◆'} ${t(cat?.title || 'campaign.title')}`} />
        <div className="campaign-section-copy">{category === 'campos' ? t('campaign.field_levels_intro') : t(cat?.desc || 'campaign.intro')}</div>
      </div>
      <div className="campaign-level-grid">
        {entries.map(entry => {
          const totalTroops = (entry.tropas || []).reduce((sum, troop) => sum + Number(troop.quantidade || 0), 0);
          const fedor = (entry.tropas || []).find(troop => troop.nome === 'Fedor');
          const sampleResources = (entry.recursos || []).slice(0, 5);
          const rewards = entry.recompensas || [];
          const rewardPreview = rewards.slice(0, 4);
          const safeGuides = (entry.guiasAtaque || []).filter(guide => guide.resultado === 'sem_perdas').length;
          const riskyGuides = (entry.guiasAtaque || []).filter(guide => guide.resultado === 'possiveis_perdas').length;
          return (
            <button type="button" className="campaign-level-card" key={entry.slug} onClick={() => onOpen(entry)}>
              <div className="campaign-level-top">
                <span className="campaign-level-badge">{t('campaign.level_short')} {entry.nivel ?? '—'}</span>
                {entry.fonte?.verificado && <span className="campaign-verified" title={t('campaign.verified')}>✓</span>}
              </div>
              <strong>{content(entry, 'nome')}</strong>
              <span className="campaign-enemy-total">☠️ {fmt.format(totalTroops)} {t('campaign.enemy_troops_short')}</span>
              {fedor && <span className="campaign-fedor-mini">⚠ {t('campaign.fedor')}: {fmt.format(fedor.quantidade)}</span>}
              {sampleResources.length > 0 && (
                <div className="campaign-card-preview">
                  <small>{t('campaign.resources')}</small>
                  <div className="campaign-resource-mini">
                    {sampleResources.map(r => <span key={r.tipo}>{RESOURCE_ICONS[r.tipo] || '◆'} {r.exibicao}</span>)}
                    {entry.campo?.producaoHora != null && <span>↗ {fmt.format(entry.campo.producaoHora)}/h</span>}
                  </div>
                </div>
              )}
              {rewards.length > 0 && (
                <div className="campaign-card-preview campaign-item-preview">
                  <small>{t('campaign.items_preview')}</small>
                  <div className="campaign-reward-preview">
                    {rewardPreview.map((reward, index) => {
                      const translated = locale !== 'pt-BR' ? reward?.i18n?.[locale] || {} : {};
                      const name = translated.nome || reward.nome || t('campaign.reward_unknown');
                      return reward.imagem
                        ? <img key={reward.codigo || index} src={reward.imagem} alt={name} title={name} loading="lazy" />
                        : <span key={reward.codigo || index} title={name}>{reward.simbolo || `R${index + 1}`}</span>;
                    })}
                    {rewards.length > rewardPreview.length && <b>+{rewards.length - rewardPreview.length}</b>}
                  </div>
                </div>
              )}
              {(safeGuides > 0 || riskyGuides > 0) && <div className="campaign-guide-mini-row">{safeGuides > 0 && <span className="campaign-guide-mini-safe">✓ {t('campaign.zero_loss_count', { count:safeGuides })}</span>}{riskyGuides > 0 && <span className="campaign-guide-mini-risk">⚠ {t('campaign.risk_count', { count:riskyGuides })}</span>}</div>}
              <span className="campaign-open">{t('campaign.open')} ›</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}


function FedorTactic({ entry, t, locale }) {
  const fmt = useMemo(() => new Intl.NumberFormat(locale), [locale]);
  const fedor = (entry.tropas || []).find(troop => troop.nome === 'Fedor');
  if (!fedor?.quantidade) return null;
  return (
    <div className="campaign-guide-card campaign-guide-fedor">
      <div className="campaign-guide-head">
        <strong>🕵️ {t('campaign.fedor_tactic')}</strong>
        <span className="campaign-guide-status is-confirmed">{t('campaign.confirmed')}</span>
      </div>
      <p>{t('campaign.fedor_explain', { count:fmt.format(fedor.quantidade) })}</p>
      <div className="campaign-guide-formula">
        <span><b>{fmt.format(fedor.quantidade)}+</b><small>{t('campaign.spies')}</small></span>
        <i>→</i>
        <span><b>1</b><small>{t('campaign.spy')}</small></span>
        <i>+</i>
        <span><b>{t('campaign.offensive_troop')}</b><small>{t('campaign.attack')}</small></span>
      </div>
      <p className="campaign-guide-note">{t('campaign.fedor_note')}</p>
    </div>
  );
}

function SpecialTroopsTactic({ t, locale }) {
  return (
    <div className="campaign-guide-card">
      <div className="campaign-guide-head">
        <strong>✨ {t('campaign.special_troops')}</strong>
        <span className="campaign-guide-result is-safe">✓ {t('campaign.zero_loss')}</span>
      </div>
      <p>{t('campaign.special_troops_intro')}</p>
      <div className="campaign-special-list">
        {SPECIAL_SAFE_TROOPS.map(item => <span key={item.pt}>500 · {locale === 'pt-BR' ? item.pt : item.en}</span>)}
      </div>
      <div className="campaign-research-chips">
        <span>{locale === 'pt-BR' ? 'Metalurgia' : 'Metallurgy'} 4+</span><span>{locale === 'pt-BR' ? 'Medicina' : 'Medicine'} 4+</span><span>{locale === 'pt-BR' ? 'Calibração de Armas' : 'Weapons Calibration'} 4+</span>
      </div>
      <p className="campaign-guide-note">{t('campaign.special_troops_note')}</p>
      <p className="campaign-guide-note">{t('campaign.recovery_note')}</p>
    </div>
  );
}

function AttackGuide({ guide, t, locale }) {
  const translated = locale !== 'pt-BR' ? guide?.i18n?.[locale] || {} : {};
  const title = translated.titulo || guide.titulo;
  const summary = translated.resumo || guide.resumo;
  const steps = translated.passos || guide.passos || [];
  const notes = translated.observacoes || guide.observacoes;
  const mainTroop = translated.tropaPrincipal || guide.tropaPrincipal;
  const complement = translated.complemento || guide.complemento || '';
  const fmt = useMemo(() => new Intl.NumberFormat(locale), [locale]);
  const displayName = item => (locale !== 'pt-BR' ? item?.i18n?.[locale]?.nome : '') || item?.nome || '';
  const resultMeta = guide.resultado === 'sem_perdas'
    ? { key:'campaign.zero_loss', icon:'✓', cls:'is-safe' }
    : guide.resultado === 'possiveis_perdas'
      ? { key:'campaign.possible_losses', icon:'⚠', cls:'is-risk' }
      : guide.resultado === 'incompleto'
        ? { key:'campaign.incomplete_method', icon:'!', cls:'is-incomplete' }
        : null;
  return (
    <div className={`campaign-guide-card ${resultMeta?.cls || ''}`}>
      <div className="campaign-guide-head">
        <strong>⚔️ {title}</strong>
        {resultMeta
          ? <span className={`campaign-guide-result ${resultMeta.cls}`}>{resultMeta.icon} {t(resultMeta.key)}</span>
          : <span className={`campaign-guide-status ${guide.status === 'confirmado' ? 'is-confirmed' : ''}`}>{guide.status === 'confirmado' ? t('campaign.confirmed') : t('campaign.validation')}</span>}
      </div>
      {summary && <p>{summary}</p>}
      {mainTroop && (
        <div className="campaign-main-march">
          <span>{t('campaign.main_troop')}</span>
          <strong>{guide.quantidade == null ? t('campaign.quantity_pending') : fmt.format(guide.quantidade)} · {mainTroop}</strong>
        </div>
      )}
      {complement && <div className="campaign-guide-companion"><span>{t('campaign.companion')}</span><strong>{complement}</strong></div>}
      {(guide.apoios || []).length > 0 && (
        <div className="campaign-support-options">
          <small>{guide.apoios.length > 1 ? t('campaign.choose_one_support') : t('campaign.support')}</small>
          <div>{guide.apoios.map((x,i) => <React.Fragment key={`${x.nome}-${i}`}><span><b>{fmt.format(x.quantidade)}</b> {displayName(x)}</span>{i < guide.apoios.length - 1 && <em>{t('campaign.or')}</em>}</React.Fragment>)}</div>
        </div>
      )}
      {(guide.pesquisas || []).length > 0 && <div className="campaign-research-chips">{guide.pesquisas.map((x,i)=><span key={`${x.nome}-${i}`}>{displayName(x)} {x.nivel}+</span>)}</div>}
      {steps.length > 0 && <div className="campaign-guide-list"><strong>{t('campaign.steps')}</strong>{steps.map((x,i)=><span key={i}>{i+1}. {x}</span>)}</div>}
      {notes && <p className="campaign-guide-note">{notes}</p>}
      {guide.fonte?.descricao && <p className="campaign-community-source">{t('campaign.community_source')}: {guide.fonte?.tipo === 'usuario+comunidade' ? t('campaign.confirmed_community_source') : guide.fonte.descricao}</p>}
    </div>
  );
}

function AttackGuidesBlock({ entry, t, locale }) {
  const guides = entry.guiasAtaque || [];
  const showCommon = entry.categoria === 'antropos' || entry.categoria === 'campos';
  if (!guides.length && !showCommon) return null;
  const safeGuides = guides.filter(guide => guide.resultado === 'sem_perdas');
  const otherGuides = guides.filter(guide => guide.resultado !== 'sem_perdas');
  const risky = guides.filter(guide => guide.resultado === 'possiveis_perdas').length;
  const meta = [safeGuides.length ? `${safeGuides.length} ✓` : '', risky ? `${risky} ⚠` : ''].filter(Boolean).join(' · ');
  return (
    <CollapsibleSection title={t('campaign.how_to_attack')} meta={meta} className="campaign-attack-section">
      {showCommon && <SpecialTroopsTactic t={t} locale={locale} />}
      {safeGuides.map(guide => <AttackGuide key={guide.codigo} guide={guide} t={t} locale={locale} />)}
      {showCommon && <FedorTactic entry={entry} t={t} locale={locale} />}
      {otherGuides.map(guide => <AttackGuide key={guide.codigo} guide={guide} t={t} locale={locale} />)}
      {entry.categoria === 'antropos' && <div className="campaign-combat-warning">⚠ {t('campaign.ranged_speed_warning')}</div>}
    </CollapsibleSection>
  );
}

function StrategyBlock({ strategy, t, locale, hasGuides = false }) {
  const translated = locale !== 'pt-BR' ? strategy?.i18n?.[locale] || {} : {};
  const published = Boolean(strategy?.publicada);
  const title = translated.titulo || strategy?.titulo || t('campaign.how_to_attack');
  const summary = translated.resumo || strategy?.resumo || '';
  const steps = translated.passos || strategy?.passos || [];
  const requirements = translated.requisitos || strategy?.requisitos || [];
  const notes = translated.observacoes || strategy?.observacoes || '';
  if (!published && hasGuides) return null;
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

function Detail({ entry, onBack, t, locale, content }) {
  const fmt = useMemo(() => new Intl.NumberFormat(locale), [locale]);
  const totalTroops = (entry.tropas || []).reduce((sum, troop) => sum + Number(troop.quantidade || 0), 0);
  const rewards = entry.recompensas || [];
  const principal = entry.campo?.recursoPrincipal || '';
  return (
    <div>
      <button type="button" className="campaign-back" onClick={onBack}>↩ {t('campaign.levels')}</button>
      <div className="campaign-report-card">
        <div className="campaign-report-ribbon">{content(entry, 'nome')}</div>
        <div className="campaign-report-summary">
          <div><span>☠️</span><strong>{fmt.format(totalTroops)}</strong><small>{t('campaign.enemy_total')}</small></div>
          <div><span>⚔️</span><strong>{(entry.tropas || []).length}</strong><small>{t('campaign.troop_types')}</small></div>
          <div><span>◇</span><strong>{entry.recompensasStatus === 'confirmado' ? rewards.length : (rewards.length || '—')}</strong><small>{t('campaign.rewards')}</small></div>
        </div>

        {entry.categoria === 'campos' && (principal || entry.campo?.producaoHora != null) && (
          <CollapsibleSection title={t('campaign.field_domain')} defaultOpen>
            <div className="campaign-domain-card">
              <span className="campaign-domain-icon">{RESOURCE_ICONS[principal] || '◆'}</span>
              <div>
                <small>{principal ? t(RESOURCE_KEYS[principal] || 'campaign.resource') : t('campaign.resource')}</small>
                <strong>{entry.campo?.producaoHora != null ? `${fmt.format(entry.campo.producaoHora)}/h` : '—'}</strong>
                <span>{t('campaign.production_when_conquered')}</span>
              </div>
            </div>
          </CollapsibleSection>
        )}

        <AttackGuidesBlock entry={entry} t={t} locale={locale} />

        <CollapsibleSection title={t('campaign.resources')} meta={String((entry.recursos || []).length)}>
          <div className="campaign-resources-grid">
            {(entry.recursos || []).map(resource => (
              <div className="campaign-resource" key={resource.tipo}>
                <span className="campaign-resource-icon">{RESOURCE_ICONS[resource.tipo] || '◆'}</span>
                <span className="campaign-resource-copy"><small>{t(RESOURCE_KEYS[resource.tipo] || 'campaign.resource')}</small><strong>{resource.exato ? '' : '≈ '}{resource.exibicao}</strong></span>
              </div>
            ))}
          </div>
          {(entry.recursos || []).some(r => !r.exato) && <p className="campaign-abbrev-note">{t('campaign.abbrev_note')}</p>}
        </CollapsibleSection>

        <RewardsBlock rewards={rewards} status={entry.recompensasStatus} t={t} locale={locale} />

        <CollapsibleSection title={t('campaign.enemy_composition')} meta={fmt.format(totalTroops)}>
          <div className="campaign-troop-table">
            <div className="campaign-troop-head"><span>{t('campaign.troop')}</span><span>{t('campaign.quantity')}</span></div>
            {(entry.tropas || []).map((troop, index) => (
              <div className="campaign-troop-row" key={`${troop.nome}-${index}`}><span>{troop.nome}</span><strong>{fmt.format(troop.quantidade)}</strong></div>
            ))}
          </div>
        </CollapsibleSection>

        <StrategyBlock strategy={entry.estrategia} t={t} locale={locale} hasGuides={(entry.guiasAtaque || []).length > 0 || entry.categoria === 'antropos' || entry.categoria === 'campos'} />
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
