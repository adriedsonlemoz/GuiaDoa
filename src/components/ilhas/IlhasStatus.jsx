import React from 'react';
import { C } from '../../theme.js';
import { useI18n } from '../../hooks/useI18n.jsx';
import GameHeader from '../shared/GameHeader.jsx';

export function IlhasHeader({ isEditing, onEdit, onRequestAction }) {
  const { t } = useI18n();
  return (
    <div className="tw-card mb-2 island-top-card">
      <GameHeader title={t('islands.management_title')} />
      <div className="island-top-actions">
        <div>
          <strong>{t('islands.planner_title')}</strong>
          <span>{isEditing ? t('islands.status_editing_friendly') : t('islands.status_saved_friendly')}</span>
        </div>
        <div className="island-top-buttons">
          {isEditing
            ? <button className="btn-success btn-sm" onClick={() => onRequestAction('save')}>✓ {t('common.save')}</button>
            : <button className="btn-ghost btn-sm" onClick={onEdit}>✎ {t('common.edit')}</button>}
          <button className="btn-danger btn-sm" onClick={() => onRequestAction('clear')} title={t('common.delete')}>↺</button>
        </div>
      </div>
    </div>
  );
}

// Compatibilidade com imports de versões anteriores. O novo planejador integra a expansão
// diretamente no card de cada ilha e os limites no próprio resumo visual.
export function IlhasExpansoes() { return null; }
export function IlhasLimites() { return null; }
