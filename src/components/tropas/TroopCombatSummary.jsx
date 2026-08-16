import React from 'react';
import { useI18n } from '../../hooks/useI18n.jsx';
import { tacticalRolesForFilter } from './troopCatalogUtils.js';

const ROLE_ICONS = { melee:'⚔️', ranged:'🏹', speed:'💨', tank:'🛡️', supply:'📦' };

function localizedCombatField(troop, content, profileKey, i18nKey) {
  const profile = troop?.perfilCombate || {};
  return content({ [i18nKey]:profile[profileKey], i18n:troop?.i18n }, i18nKey) || profile[profileKey];
}

export default function TroopCombatSummary({ troop, analysis }) {
  const { t, content } = useI18n();
  const roles = tacticalRolesForFilter(troop, analysis);
  const strong = localizedCombatField(troop, content, 'forteContra', 'combateForteContra') || [];
  const weak = localizedCombatField(troop, content, 'fracoContra', 'combateFracoContra') || [];
  const recommended = localizedCombatField(troop, content, 'funcaoRecomendada', 'combateFuncaoRecomendada');

  return (
    <div className="troop-combat-inline">
      {roles.length ? (
        <div className="troop-combat-inline-roles" aria-label={t('troops.tactical_roles')}>
          {roles.map(role => <span key={role}>{ROLE_ICONS[role]} {t(`troops.tactical.${role}`)}</span>)}
        </div>
      ) : null}

      <div className="troop-matchup-grid">
        <div className={`troop-matchup is-strong${strong.length ? '' : ' is-unknown'}`}>
          <small>✅ {t('troops.strong_against')}</small>
          {strong.length
            ? <div>{strong.map((item, index) => <span key={`${item}-${index}`}>{item}</span>)}</div>
            : <p>{t('troops.matchup_unknown')}</p>}
        </div>
        <div className={`troop-matchup is-weak${weak.length ? '' : ' is-unknown'}`}>
          <small>⚠️ {t('troops.weak_against')}</small>
          {weak.length
            ? <div>{weak.map((item, index) => <span key={`${item}-${index}`}>{item}</span>)}</div>
            : <p>{t('troops.matchup_unknown')}</p>}
        </div>
      </div>

      {recommended ? (
        <div className="troop-use-note">
          <small>{t('troops.how_to_use')}</small>
          <p>{recommended}</p>
        </div>
      ) : null}
    </div>
  );
}
