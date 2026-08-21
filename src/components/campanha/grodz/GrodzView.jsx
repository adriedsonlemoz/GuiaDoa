import React, { useMemo, useState } from 'react';
import GameHeader from '../../shared/GameHeader.jsx';

function localized(record, field, locale) {
  if (!record) return '';
  if (locale !== 'pt-BR') return record?.i18n?.[locale]?.[field] || record?.[field] || '';
  return record?.[field] || '';
}

function Collapsible({ title, meta = '', defaultOpen = false, children }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <section className={`grodz-fold ${open ? 'is-open' : ''}`}>
      <button type="button" className="grodz-fold-trigger" onClick={() => setOpen(value => !value)} aria-expanded={open}>
        <strong>{title}</strong>
        <span>{meta && <small>{meta}</small>}<b>{open ? '⌃' : '⌄'}</b></span>
      </button>
      {open && <div className="grodz-fold-body">{children}</div>}
    </section>
  );
}

function useNav(setRoute) {
  return (route, key, value) => {
    try { if (key && value) sessionStorage.setItem(key, value); } catch { /* navigation still works */ }
    setRoute?.(route);
  };
}

function TroopLine({ troop, locale, fmt }) {
  return <span><b>{fmt.format(Number(troop.quantidade || 0))}</b> {localized(troop, 'nome', locale)}</span>;
}

function LevelCard({ entry, onOpen, t, locale }) {
  const fmt = useMemo(() => new Intl.NumberFormat(locale), [locale]);
  const total = (entry.tropas || []).reduce((sum, item) => sum + Number(item.quantidade || 0), 0);
  const guide = (entry.guiasAtaque || [])[0];
  const official = entry.grodz?.recomendacaoJogo || [];
  const status = entry.grodz?.composicaoStatus || 'pendente';
  return (
    <button type="button" className={`grodz-level-card status-${status}`} onClick={() => onOpen(entry)}>
      <div className="grodz-level-card-top">
        <span className="grodz-level-number">{t('campaign.level_short')} {entry.nivel}</span>
        <span className={`grodz-data-status is-${status}`}>{t(`campaign.grodz.status_${status}`)}</span>
      </div>
      <strong className="grodz-level-name">{localized(entry, 'nome', locale)}</strong>
      <div className="grodz-level-facts">
        <div><small>{t('campaign.grodz.enemy')}</small><b>{status === 'pendente' ? '—' : fmt.format(total)}</b></div>
        <div><small>{t('campaign.grodz.game_recommends')}</small><b>{official.length ? official.map(item => `${fmt.format(item.quantidade)} ${localized(item, 'nome', locale)}`).join(' + ') : '—'}</b></div>
      </div>
      {guide && (
        <div className={`grodz-guide-preview ${guide.resultado === 'sem_perdas' ? 'is-safe' : 'is-risk'}`}>
          <span>{guide.resultado === 'sem_perdas' ? '✓' : '⚠'}</span>
          <div><small>{t('campaign.grodz.guide_recommends')}</small><strong>{fmt.format(guide.quantidade || 0)} {localized(guide, 'tropaPrincipal', locale)}</strong></div>
        </div>
      )}
      {(entry.recompensas || []).length > 0 && <div className="grodz-reward-chip">🎁 {localized(entry.recompensas[0], 'nome', locale)}</div>}
      <span className="grodz-open-label">{t('campaign.open')} ›</span>
    </button>
  );
}

export function GrodzLanding({ entries, mechanics = {}, onOpen, onBack, setRoute, t, locale }) {
  const nav = useNav(setRoute);
  const fmt = useMemo(() => new Intl.NumberFormat(locale), [locale]);
  const primary = mechanics.tropaPrincipal || { quantidade:1000, nivelMaxSemPerdas:9 };
  return (
    <div className="grodz-page">
      <button type="button" className="campaign-back" onClick={onBack}>↩ {t('campaign.categories')}</button>
      <div className="tw-card mb-3 grodz-hero-card">
        <GameHeader title={`🛡️ ${t('campaign.category.grodz')}`} />
        <div className="grodz-hero-copy">
          <p>{t('campaign.grodz.intro')}</p>
          <div className="grodz-stat-grid">
            <div><b>{mechanics.ataqueLimiteDiario ?? 99}</b><span>{t('campaign.grodz.attacks_day')}</span></div>
            <div><b>{mechanics.devastarLimiteDiario ?? 99}</b><span>{t('campaign.grodz.devastate_day')}</span></div>
            <div><b>{fmt.format(primary.quantidade || 1000)}</b><span>{t('campaign.grodz.magmassaurs')}</span></div>
          </div>
        </div>
      </div>

      <div className="grodz-mechanics-grid">
        <article className="grodz-mechanic-card">
          <span className="grodz-mechanic-icon">🐉</span>
          <div><strong>{t('campaign.grodz.armor_title')}</strong><p>{t('campaign.grodz.armor_text')}</p><small>⚠ {t('campaign.grodz.duplicate_parts')}</small></div>
        </article>
        <article className="grodz-mechanic-card">
          <span className="grodz-mechanic-icon">💥</span>
          <div><strong>{t('campaign.grodz.devastate_title')}</strong><p>{t('campaign.grodz.devastate_text', { count:mechanics.devastarLimiteDiario ?? 99 })}</p><small>⏳ {t('campaign.grodz.devastate_time', { hours:mechanics.devastarTempoHoras ?? 6 })}</small></div>
        </article>
      </div>

      <div className="grodz-linked-actions">
        <button type="button" onClick={() => nav('dicas', 'guiadoa_open_tip', 'tutorial-campanha-grodz')}>📖 {t('campaign.grodz.open_tutorial')}</button>
        <button type="button" onClick={() => nav('tropas', 'guiadoa_open_troop', 'Magmassauros')}>🔥 {t('campaign.grodz.open_magmassaurs')}</button>
        <button type="button" onClick={() => nav('itens', 'guiadoa_open_item', mechanics.pergaminhoItemSlug || 'pergaminho-devastar')}>📜 {t('campaign.grodz.open_scroll')}</button>
        <button type="button" onClick={() => nav('dragoes')}>🐲 {t('campaign.grodz.open_dragons')}</button>
      </div>

      <div className="grodz-section-heading">
        <div><small>{t('campaign.grodz.progression')}</small><strong>{t('campaign.grodz.levels_title')}</strong></div>
        <span>{entries.length}/10</span>
      </div>
      <div className="grodz-level-grid">
        {entries.map(entry => <LevelCard key={entry.slug} entry={entry} onOpen={onOpen} t={t} locale={locale} />)}
      </div>
    </div>
  );
}

function GuideCard({ guide, t, locale, fmt, onOpenTroop }) {
  const safe = guide.resultado === 'sem_perdas';
  const steps = localized(guide, 'passos', locale) || guide.passos || [];
  return (
    <article className={`grodz-attack-guide ${safe ? 'is-safe' : 'is-risk'}`}>
      <div className="grodz-attack-guide-head"><strong>{localized(guide, 'titulo', locale)}</strong><span>{safe ? `✓ ${t('campaign.zero_loss')}` : `⚠ ${t('campaign.possible_losses')}`}</span></div>
      <p>{localized(guide, 'resumo', locale)}</p>
      <button type="button" className="grodz-main-troop" onClick={() => onOpenTroop(guide.tropaPrincipal)}>
        <small>{t('campaign.main_troop')}</small><strong>{fmt.format(guide.quantidade || 0)} {localized(guide, 'tropaPrincipal', locale)}</strong><span>›</span>
      </button>
      {steps.length > 0 && <div className="grodz-steps">{steps.map((step, index) => <span key={index}>{index + 1}. {step}</span>)}</div>}
      {localized(guide, 'observacoes', locale) && <p className="grodz-guide-note">{localized(guide, 'observacoes', locale)}</p>}
    </article>
  );
}

export function GrodzDetail({ entry, mechanics = {}, onBack, setRoute, t, locale }) {
  const nav = useNav(setRoute);
  const fmt = useMemo(() => new Intl.NumberFormat(locale), [locale]);
  const total = (entry.tropas || []).reduce((sum, item) => sum + Number(item.quantidade || 0), 0);
  const status = entry.grodz?.composicaoStatus || 'pendente';
  const official = entry.grodz?.recomendacaoJogo || [];
  const dialogues = [...(entry.grodz?.dialogos || [])].sort((a,b) => Number(a.ordem || 0) - Number(b.ordem || 0));
  const rewards = entry.recompensas || [];
  const openTroop = name => nav('tropas', 'guiadoa_open_troop', name);
  return (
    <div className="grodz-page">
      <button type="button" className="campaign-back" onClick={onBack}>↩ {t('campaign.grodz.levels_title')}</button>
      <article className="grodz-detail-card">
        <div className="grodz-detail-ribbon"><span>{t('campaign.level_short')} {entry.nivel}</span><strong>{localized(entry, 'nome', locale)}</strong></div>
        <div className="grodz-detail-summary">
          <div><span>☠️</span><b>{status === 'pendente' ? '—' : fmt.format(total)}</b><small>{t('campaign.enemy_total')}</small></div>
          <div><span>🎯</span><b>{official.length || '—'}</b><small>{t('campaign.grodz.game_recommends')}</small></div>
          <div><span>🎁</span><b>{rewards.length || '—'}</b><small>{t('campaign.rewards')}</small></div>
        </div>

        <section className="grodz-highlight-section">
          <div className="grodz-section-label">🎯 {t('campaign.grodz.game_recommendation')}</div>
          {official.length ? <div className="grodz-official-list">{official.map((troop, index) => <TroopLine key={`${troop.nome}-${index}`} troop={troop} locale={locale} fmt={fmt} />)}</div> : <p className="grodz-muted">{t('campaign.grodz.no_game_recommendation')}</p>}
        </section>

        <section className="grodz-highlight-section is-guide">
          <div className="grodz-section-label">🔥 {t('campaign.grodz.guide_recommendation')}</div>
          <div className="grodz-guide-stack">{(entry.guiasAtaque || []).map(guide => <GuideCard key={guide.codigo} guide={guide} t={t} locale={locale} fmt={fmt} onOpenTroop={openTroop} />)}</div>
        </section>

        <Collapsible title={t('campaign.enemy_composition')} meta={status === 'pendente' ? t('campaign.grodz.status_pendente') : fmt.format(total)} defaultOpen={entry.nivel <= 3}>
          {status !== 'confirmado' && <div className={`grodz-data-warning is-${status}`}>⚠ {localized(entry.grodz, 'observacaoComposicao', locale) || t(`campaign.grodz.status_${status}_help`)}</div>}
          {(entry.tropas || []).length ? <div className="grodz-troop-table">{entry.tropas.map((troop,index) => <div key={`${troop.nome}-${index}`}><span>{localized(troop, 'nome', locale)}</span><b>{fmt.format(troop.quantidade)}</b></div>)}</div> : <p className="grodz-muted">{t('campaign.grodz.enemy_pending')}</p>}
        </Collapsible>

        {rewards.length > 0 && <Collapsible title={t('campaign.possible_rewards')} meta={String(rewards.length)} defaultOpen>
          <div className="grodz-rewards">{rewards.map((reward,index) => <button type="button" key={reward.codigo || index} onClick={() => nav('itens','guiadoa_open_item',reward.relacionadoA || reward.codigo)}>{reward.imagem ? <img src={reward.imagem} alt="" /> : <span>🎁</span>}<div><strong>{localized(reward,'nome',locale)}</strong><small>{localized(reward,'observacao',locale) || reward.observacao}</small></div><b>›</b></button>)}</div>
        </Collapsible>}

        <Collapsible title={`📖 ${t('campaign.grodz.story_dialogue')}`} meta={String(dialogues.length)} defaultOpen={false}>
          <p className="grodz-dialogue-help">{t('campaign.grodz.dialogue_help')}</p>
          <div className="grodz-dialogue-list">{dialogues.map(line => <div key={`${line.ordem}-${line.personagem}`}><strong>{localized(line,'personagem',locale)}</strong><p>{localized(line,'texto',locale)}</p></div>)}</div>
        </Collapsible>

        <div className="grodz-detail-actions">
          <button type="button" onClick={() => nav('dicas','guiadoa_open_tip','tutorial-campanha-grodz')}>📖 {t('campaign.grodz.open_tutorial')}</button>
          <button type="button" onClick={() => nav('itens','guiadoa_open_item',mechanics.pergaminhoItemSlug || 'pergaminho-devastar')}>📜 {t('campaign.grodz.open_scroll')}</button>
        </div>
        <div className="campaign-source-foot">{t('campaign.source')}: {entry.fonte?.descricao || t('campaign.source_screenshot')} · {entry.fonte?.data || '—'}</div>
      </article>
    </div>
  );
}
