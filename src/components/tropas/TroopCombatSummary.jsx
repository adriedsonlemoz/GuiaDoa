import React from 'react';
import { useI18n } from '../../hooks/useI18n.jsx';
import { explicitTacticalRoles, hasCombatProfile } from './troopCatalogUtils.js';

const ROLE_ICONS = { melee:'⚔️', ranged:'🏹', speed:'💨', tank:'🛡️', supply:'📦' };

function localizedCombatField(troop, content, profileKey, i18nKey) {
  const profile = troop?.perfilCombate || {};
  return content({ [i18nKey]:profile[profileKey], i18n:troop?.i18n }, i18nKey) || profile[profileKey];
}

export default function TroopCombatSummary({ troop }) {
  const { t, content } = useI18n();
  if (!hasCombatProfile(troop)) return null;

  const roles = explicitTacticalRoles(troop);
  const strong = localizedCombatField(troop, content, 'forteContra', 'combateForteContra') || [];
  const weak = localizedCombatField(troop, content, 'fracoContra', 'combateFracoContra') || [];
  const recommended = localizedCombatField(troop, content, 'funcaoRecomendada', 'combateFuncaoRecomendada');

  if (!roles.length && !strong.length && !weak.length && !recommended) return null;

  return (
    <div className="troop-combat-inline">
      {roles.length ? (
        <div className="troop-combat-inline-roles" aria-label={t('troops.tactical_roles')}>
          {roles.map(role => <span key={role}>{ROLE_ICONS[role]} {t(`troops.tactical.${role}`)}</span>)}
        </div>
      ) : null}

      {(strong.length || weak.length) ? (
        <div className="troop-matchup-grid">
          {strong.length ? (
            <div className="troop-matchup is-strong">
              <small>{t('troops.strong_against')}</small>
              <div>{strong.map((item, index) => <span key={`${item}-${index}`}>{item}</span>)}</div>
            </div>
          ) : null}
          {weak.length ? (
            <div className="troop-matchup is-weak">
              <small>{t('troops.weak_against')}</small>
              <div>{weak.map((item, index) => <span key={`${item}-${index}`}>{item}</span>)}</div>
            </div>
          ) : null}
        </div>
      ) : null}

      {recommended ? (
        <div className="troop-use-note">
          <small>{t('troops.how_to_use')}</small>
          <p>{recommended}</p>
        </div>
      ) : null}
    </div>
  );
}
