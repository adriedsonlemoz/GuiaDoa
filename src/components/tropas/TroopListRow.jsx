import React from 'react';
import { useI18n } from '../../hooks/useI18n.jsx';
import { getIcone, getTipoAtaque, fmtFull } from './tropaUtils.js';

export default function TroopListRow({ troop, onOpen, compareMode = false, selected = false, onSelect }) {
  const { t, content, locale } = useI18n();
  const name = content(troop, 'nome');
  const description = content(troop, 'desc');
  const type = getTipoAtaque(troop, t);
  const unlock = troop.desbloqueio || {};
  const unlockSource = content({ desbloqueioFonte:unlock.fonte, i18n:troop.i18n }, 'desbloqueioFonte') || unlock.fonte;
  const power = Number(troop.poder) || 0;

  const handleClick = () => {
    if (compareMode) onSelect?.();
    else onOpen?.();
  };

  return (
    <button
      onClick={handleClick}
      aria-label={compareMode ? `${t('troops.compare')}: ${name}` : `${t('troops.details')}: ${name}`}
      aria-pressed={compareMode ? selected : undefined}
      className={`game-list-row${selected ? ' is-selected' : ''}`}
    >
      <div className="game-thumb">
        {troop.imagem
          ? <img src={troop.imagem} alt="" loading="lazy" />
          : <span style={{ fontSize:'2.15rem' }}>{getIcone(troop.nome)}</span>}
      </div>

      <div style={{ flex:1, minWidth:0 }}>
        <div className="game-list-name">{name}</div>
        <div className="game-list-meta">
          {type.label}{troop.tipo === 'especial' ? ` • ${t('troops.special')}` : ''}
        </div>
        {description ? <p className="game-list-copy">{description}</p> : null}
        {unlockSource ? (
          <div className="game-badge">🔓 {unlockSource}{unlock.nivel ? ` • ${t('common.level_short')} ${unlock.nivel}` : ''}</div>
        ) : null}
      </div>

      <div className="game-row-side">
        <div>
          <span className="game-power-label">{t('common.power')}</span>
          <span className="game-power-value">{power ? fmtFull(power, locale) : '—'}</span>
        </div>
        {compareMode
          ? <span className="game-compare-mark" aria-hidden="true">{selected ? '✓' : '+'}</span>
          : <span aria-hidden="true" style={{ color:'#7F8A73', fontSize:'1.25rem' }}>›</span>}
      </div>
    </button>
  );
}
