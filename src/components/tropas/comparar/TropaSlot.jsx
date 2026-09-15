import React from 'react';
import { getIcone, getTipoAtaque, fmtFull } from '../tropaUtils.js';
import { useI18n } from '../../../hooks/useI18n.jsx';

export default function TropaSlot({ tropa, onSelecionar, onRemover, index, cor }) {
  const { t, content, locale } = useI18n();
  if (!tropa) {
    return (
      <button onClick={onSelecionar} className="troop-compare-slot troop-compare-slot-empty" style={{ '--slot-color':cor }}>
        <div className="troop-compare-slot-add">＋</div>
        <div className="troop-compare-slot-empty-label">{t('troops.slot',{number:index+1})}</div>
      </button>
    );
  }

  const tipo = getTipoAtaque(tropa, t);
  const nome = content(tropa, 'nome');
  const handleKeyDown = event => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      onSelecionar();
    }
  };

  return (
    <div
      className="troop-compare-slot troop-compare-slot-active"
      style={{ '--slot-color':cor }}
      role="button"
      tabIndex={0}
      aria-label={`${t('troops.compare_change')}: ${nome}`}
      title={t('troops.compare_change')}
      onClick={onSelecionar}
      onKeyDown={handleKeyDown}
    >
      <button
        onClick={event => { event.stopPropagation(); onRemover(); }}
        aria-label={`${t('common.delete')} ${nome}`}
        className="troop-compare-slot-remove"
      >✕</button>
      <div className="troop-compare-slot-icon">{getIcone(tropa.nome)}</div>
      <div className="troop-compare-slot-name" title={nome}>{nome}</div>
      <div className="troop-compare-slot-type" style={{ color:tipo.color }}>{tipo.label}</div>
      <div className="troop-compare-slot-power">
        <strong>{tropa.poder ? fmtFull(tropa.poder, locale) : '—'}</strong>
        <span>{t('common.power').toUpperCase()}</span>
      </div>
    </div>
  );
}
