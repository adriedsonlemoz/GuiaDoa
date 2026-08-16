import React from 'react';
import { useI18n } from '../../hooks/useI18n.jsx';
import { getIcone, getTipoAtaque, fmtFull } from './tropaUtils.js';
import { strongestAttributeIds, tacticalRolesForFilter } from './troopCatalogUtils.js';

const ROLE_ICONS = { melee:'⚔️', ranged:'🏹', speed:'💨', tank:'🛡️', supply:'📦' };
const STAT_METRICS = [
  ['life','❤️','vida'], ['defense','🛡️','def'], ['melee_attack','⚔️','atqPerto'],
  ['ranged_attack','🏹','atqDist'], ['speed','💨','vel'], ['load','📦','car'],
];

export default function TroopListRow({ troop, analysis, onOpen, compareMode = false, selected = false, onSelect }) {
  const { t, content, locale } = useI18n();
  const name = content(troop, 'nome');
  const description = content(troop, 'desc');
  const type = getTipoAtaque(troop, t);
  const unlock = troop.desbloqueio || {};
  const unlockSource = content({ desbloqueioFonte:unlock.fonte, i18n:troop.i18n }, 'desbloqueioFonte') || unlock.fonte;
  const power = Number(troop.poder) || 0;
  const tacticalRoles = tacticalRolesForFilter(troop, analysis);
  const highlights = new Set(strongestAttributeIds(troop, analysis));
  const compactStats = STAT_METRICS.map(([metric, icon, field]) => ({ metric, icon, value:Number(troop[field]) || 0 })).filter(item => item.value > 0);
  const handleClick = () => compareMode ? onSelect?.() : onOpen?.();

  return (
    <button onClick={handleClick} aria-label={compareMode ? `${t('troops.compare')}: ${name}` : `${t('troops.details')}: ${name}`} aria-pressed={compareMode ? selected : undefined} className={`game-list-row${selected ? ' is-selected' : ''}`}>
      <div className="game-thumb">{troop.imagem ? <img src={troop.imagem} alt="" loading="lazy" /> : <span style={{ fontSize:'2.15rem' }}>{getIcone(troop.nome)}</span>}</div>
      <div style={{ flex:1, minWidth:0 }}>
        <div className="game-list-name">{name}</div>
        <div className="game-list-meta">{type.label}{troop.tipo === 'especial' ? ` • ${t('troops.special')}` : ''}</div>
        {tacticalRoles.length ? <div className="troop-card-tags troop-card-role-tags">{tacticalRoles.map(role => <span key={role}>{ROLE_ICONS[role]} {t(`troops.tactical.${role}`)}</span>)}</div> : null}
        {compactStats.length ? <div className="troop-card-stats">{compactStats.map(item => <span title={highlights.has(item.metric) ? t('troops.attribute_highlight') : undefined} className={highlights.has(item.metric) ? 'is-strong' : ''} key={item.metric}>{item.icon} {fmtFull(item.value, locale)}</span>)}</div> : null}
        {description ? <p className="game-list-copy">{description}</p> : null}
        {unlockSource ? <div className="game-badge">🔓 {unlockSource}{unlock.nivel ? ` • ${t('common.level_short')} ${unlock.nivel}` : ''}</div> : null}
      </div>
      <div className="game-row-side">
        <div><span className="game-power-label">{t('common.power')}</span><span className="game-power-value">{power ? fmtFull(power, locale) : '—'}</span></div>
        {compareMode ? <span className="game-compare-mark" aria-hidden="true">{selected ? '✓' : '+'}</span> : <span aria-hidden="true" style={{ color:'#7F8A73', fontSize:'1.25rem' }}>›</span>}
      </div>
    </button>
  );
}
