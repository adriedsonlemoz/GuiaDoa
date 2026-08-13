import React from 'react';
import { useI18n } from '../../hooks/useI18n.jsx';
import { getIcone, getTipoAtaque } from './tropaUtils.js';

export default function TroopListRow({ troop, onOpen }) {
  const { t, content } = useI18n();
  const name = content(troop, 'nome');
  const description = content(troop, 'desc');
  const type = getTipoAtaque(troop, t);
  const unlock = troop.desbloqueio || {};
  const unlockSource = content({ desbloqueioFonte:unlock.fonte, i18n:troop.i18n }, 'desbloqueioFonte') || unlock.fonte;

  return (
    <button onClick={onOpen} aria-label={`${t('troops.details')}: ${name}`} className="game-list-row">
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
      <span aria-hidden="true" style={{ color:'#9b7d40', fontSize:'1.4rem', alignSelf:'center' }}>›</span>
    </button>
  );
}
