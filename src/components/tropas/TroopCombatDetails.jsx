import React from 'react';
import { useI18n } from '../../hooks/useI18n.jsx';
import { explicitTacticalRoles, hasCombatProfile } from './troopCatalogUtils.js';

const ROLE_ICONS = { melee:'⚔️', ranged:'🏹', speed:'💨', tank:'🛡️', supply:'📦' };
const TYPE_KEYS = { supply:'troops.official_type.supply', mounted:'troops.official_type.mounted', foot:'troops.official_type.foot', ranged:'troops.official_type.ranged' };
const CONFIDENCE_KEYS = { confirmado:'troops.confidence.confirmed', experimental:'troops.confidence.experimental', hipotese:'troops.confidence.hypothesis' };

function localizedCombatField(troop, content, profileKey, i18nKey) {
  const profile = troop?.perfilCombate || {};
  return content({ [i18nKey]:profile[profileKey], i18n:troop?.i18n }, i18nKey) || profile[profileKey];
}

function ConfidenceBadge({ value, t }) {
  if (!value || !CONFIDENCE_KEYS[value]) return null;
  const icon = value === 'confirmado' ? '🟢' : value === 'experimental' ? '🟡' : '🔴';
  return <span className={`troop-confidence troop-confidence-${value}`}>{icon} {t(CONFIDENCE_KEYS[value])}</span>;
}

function TextSection({ title, children, confidence, t }) {
  if (!children || (Array.isArray(children) && !children.length)) return null;
  return (
    <div className="troop-combat-block">
      <div className="troop-combat-block-head">
        <strong>{title}</strong>
        <ConfidenceBadge value={confidence} t={t} />
      </div>
      {Array.isArray(children)
        ? <div className="troop-combat-chips">{children.map((item, index) => <span key={`${item}-${index}`}>{item}</span>)}</div>
        : <p>{children}</p>}
    </div>
  );
}

export default function TroopCombatDetails({ troop }) {
  const { t, content } = useI18n();
  if (!hasCombatProfile(troop)) return null;

  const profile = troop.perfilCombate || {};
  const confidence = profile.confiancaCampos || {};
  const roles = explicitTacticalRoles(troop);
  const skills = localizedCombatField(troop, content, 'habilidadesEspeciais', 'combateHabilidades') || [];
  const notes = localizedCombatField(troop, content, 'observacoesEstrategicas', 'combateObservacoesEstrategicas');
  const target = localizedCombatField(troop, content, 'prioridadeAlvo', 'combatePrioridadeAlvo');
  const source = localizedCombatField(troop, content, 'fonteInformacao', 'combateFonteInformacao');

  return (
    <details className="troop-combat-details">
      <summary>
        <span>⚔️ {t('troops.combat_details')}</span>
        <ConfidenceBadge value={profile.confianca} t={t} />
      </summary>
      <div className="troop-combat-body">
        {(profile.tipoOficial || roles.length || profile.tier) ? (
          <div className="troop-combat-summary">
            {profile.tipoOficial ? <span><small>{t('troops.official_type')}</small><b>{t(TYPE_KEYS[profile.tipoOficial])}</b></span> : null}
            {profile.tier ? <span><small>{t('troops.tier')}</small><b>T{profile.tier}</b></span> : null}
            {roles.length ? <span className="is-wide"><small>{t('troops.tactical_roles')}</small><b>{roles.map(role => `${ROLE_ICONS[role]} ${t(`troops.tactical.${role}`)}`).join(' · ')}</b></span> : null}
          </div>
        ) : null}

        <TextSection title={t('troops.special_abilities')} confidence={confidence.habilidades} t={t}>{skills}</TextSection>
        <TextSection title={t('troops.target_priority')} confidence={confidence.prioridadeAlvo} t={t}>{target}</TextSection>
        <TextSection title={t('troops.strategy_notes')} confidence={confidence.observacoesEstrategicas} t={t}>{notes}</TextSection>
        <TextSection title={t('troops.information_source')} t={t}>{source}</TextSection>

        <div className="troop-confidence-legend">
          <span>🟢 {t('troops.confidence.confirmed')}</span>
          <span>🟡 {t('troops.confidence.experimental')}</span>
          <span>🔴 {t('troops.confidence.hypothesis')}</span>
        </div>
      </div>
    </details>
  );
}
