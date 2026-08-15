import React, { useMemo } from 'react';
import { useI18n } from '../hooks/useI18n.jsx';
import { useTropas } from '../hooks/useTropas.js';
import GameHeader from './shared/GameHeader.jsx';
import { GameActionButton, GameSectionTitle } from './shared/GameChrome.jsx';
import { explicitTacticalRoles, hasCombatProfile } from './tropas/troopCatalogUtils.js';
import { COMBAT_FACTOR_DEFINITIONS, COMBAT_ROLE_DEFINITIONS, combatEvidenceSummary } from './combate/combatMechanics.js';

const ROLE_ICONS = { melee:'⚔️', ranged:'🏹', speed:'💨', tank:'🛡️', supply:'📦' };
const CONFIDENCE_META = {
  confirmado:{ icon:'🟢', key:'combat.confidence.confirmed' },
  experimental:{ icon:'🟡', key:'combat.confidence.experimental' },
  hipotese:{ icon:'🔴', key:'combat.confidence.hypothesis' },
};

function ConfidenceBadge({ value, t }) {
  const meta = CONFIDENCE_META[value];
  if (!meta) return null;
  return <span className={`combat-confidence is-${value}`}>{meta.icon} {t(meta.key)}</span>;
}

function localizedProfileField(troop, content, profileKey, i18nKey) {
  const profile = troop?.perfilCombate || {};
  return content({ [i18nKey]:profile[profileKey], i18n:troop?.i18n }, i18nKey) || profile[profileKey] || '';
}

export default function MecanicasCombate({ setRoute }) {
  const { tropas, carregando } = useTropas();
  const { t, content } = useI18n();

  const evidence = useMemo(() => (Array.isArray(tropas) ? tropas : [])
    .filter(hasCombatProfile)
    .map(troop => ({
      troop,
      roles: explicitTacticalRoles(troop),
      note: localizedProfileField(troop, content, 'observacoesEstrategicas', 'combateObservacoesEstrategicas'),
      recommended: localizedProfileField(troop, content, 'funcaoRecomendada', 'combateFuncaoRecomendada'),
    }))
    .filter(item => item.roles.length || item.note || item.recommended)
    .sort((a, b) => content(a.troop, 'nome').localeCompare(content(b.troop, 'nome')))
    .slice(0, 8), [tropas, content]);

  const summary = useMemo(() => combatEvidenceSummary(tropas), [tropas]);

  return (
    <div className="combat-page">
      <GameHeader title={t('combat.title')} subtitle={t('combat.subtitle')} />

      <section className="combat-methodology-card">
        <div className="combat-methodology-head"><span>🧪</span><strong>{t('combat.method.title')}</strong></div>
        <p>{t('combat.method.body')}</p>
        <div className="combat-confidence-legend">
          <ConfidenceBadge value="confirmado" t={t} />
          <ConfidenceBadge value="experimental" t={t} />
          <ConfidenceBadge value="hipotese" t={t} />
        </div>
      </section>

      <GameSectionTitle>{t('combat.roles.title')}</GameSectionTitle>
      <section className="combat-role-grid">
        {COMBAT_ROLE_DEFINITIONS.map(role => (
          <article key={role.id} className="combat-role-card">
            <span className="combat-role-icon" aria-hidden="true">{role.icon}</span>
            <div><strong>{t(role.titleKey)}</strong><p>{t(role.bodyKey)}</p></div>
          </article>
        ))}
      </section>

      <GameSectionTitle>{t('combat.factors.title')}</GameSectionTitle>
      <section className="combat-factor-list">
        {COMBAT_FACTOR_DEFINITIONS.map((factor, index) => (
          <details key={factor.id} className="combat-factor-card" open={index < 2}>
            <summary><span aria-hidden="true">{factor.icon}</span><strong>{t(factor.titleKey)}</strong><span className="combat-chevron">⌄</span></summary>
            <p>{t(factor.bodyKey)}</p>
          </details>
        ))}
      </section>

      <GameSectionTitle>{t('combat.groups.title')}</GameSectionTitle>
      <section className="combat-evidence-callout is-experimental">
        <div className="combat-evidence-callout-head"><strong>{t('combat.groups.card_title')}</strong><ConfidenceBadge value="experimental" t={t} /></div>
        <p>{t('combat.groups.body')}</p>
        <p>{t('combat.groups.warning')}</p>
      </section>

      <GameSectionTitle aside={carregando ? '…' : t('combat.evidence.count', { count:summary.total })}>{t('combat.evidence.title')}</GameSectionTitle>
      <section className="combat-evidence-summary" aria-label={t('combat.evidence.title')}>
        <span><b>{summary.total}</b><small>{t('combat.evidence.profiled')}</small></span>
        <span><b>{summary.confirmado}</b><small>🟢 {t('combat.confidence.confirmed_short')}</small></span>
        <span><b>{summary.experimental}</b><small>🟡 {t('combat.confidence.experimental_short')}</small></span>
        <span><b>{summary.hipotese}</b><small>🔴 {t('combat.confidence.hypothesis_short')}</small></span>
      </section>

      {evidence.length ? (
        <section className="combat-troop-evidence-list">
          {evidence.map(({ troop, roles, note, recommended }) => (
            <article key={troop._id || troop.nome} className="combat-troop-evidence-card">
              <div className="combat-troop-evidence-head">
                <div className="combat-troop-name-wrap">
                  {troop.imagem ? <img src={troop.imagem} alt="" loading="lazy" /> : <span className="combat-troop-placeholder">⚔️</span>}
                  <div><strong>{content(troop, 'nome')}</strong><div className="combat-role-tags">{roles.map(role => <span key={role}>{ROLE_ICONS[role]} {t(`troops.tactical.${role}`)}</span>)}</div></div>
                </div>
                <ConfidenceBadge value={troop.perfilCombate?.confianca} t={t} />
              </div>
              {note ? <p>{note}</p> : recommended ? <p>{recommended}</p> : null}
            </article>
          ))}
        </section>
      ) : !carregando ? <p className="combat-empty">{t('combat.evidence.empty')}</p> : null}

      <section className="combat-case-grid">
        <article className="combat-case-card">
          <div className="combat-case-head"><div><span className="combat-kicker">{t('combat.case.kicker')}</span><strong>{t('combat.case.crusader.title')}</strong></div><ConfidenceBadge value="experimental" t={t} /></div>
          <p>{t('combat.case.crusader.body')}</p>
          <div className="combat-case-stats">
            <span><b>≈3.066</b><small>{t('combat.case.attacker_troops')}</small></span>
            <span><b>≈2.283</b><small>{t('combat.case.attacker_losses')}</small></span>
            <span><b>≈74,5%</b><small>{t('combat.case.loss_rate')}</small></span>
            <span><b>≈1.969</b><small>{t('combat.case.defender_troops')}</small></span>
          </div>
          <p className="combat-case-conclusion">{t('combat.case.crusader.conclusion')}</p>
        </article>

        <article className="combat-case-card is-hypothesis">
          <div className="combat-case-head"><div><span className="combat-kicker">{t('combat.case.kicker')}</span><strong>{t('combat.case.attacker.title')}</strong></div><ConfidenceBadge value="hipotese" t={t} /></div>
          <p>{t('combat.case.attacker.body')}</p>
          <p className="combat-case-conclusion">{t('combat.case.attacker.warning')}</p>
        </article>
      </section>

      <GameSectionTitle>{t('combat.read_report.title')}</GameSectionTitle>
      <ol className="combat-report-steps">
        {[1,2,3,4,5,6].map(step => <li key={step}><span>{step}</span><p>{t(`combat.read_report.step${step}`)}</p></li>)}
      </ol>

      <div className="combat-actions">
        <GameActionButton tone="green" onClick={() => setRoute('tropas')}>⚔️ {t('combat.open_troops')}</GameActionButton>
        <GameActionButton tone="blue" onClick={() => setRoute('tropas_comparar')}>⚖️ {t('combat.compare_troops')}</GameActionButton>
      </div>
    </div>
  );
}
