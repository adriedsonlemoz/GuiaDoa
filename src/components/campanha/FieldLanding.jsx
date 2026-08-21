import React from 'react';
import GameHeader from '../shared/GameHeader.jsx';
import { FIELD_TYPES, RESOURCE_ICONS, RESOURCE_KEYS } from './fieldConfig.js';

export default function FieldLanding({ entries, onSelect, onBack, t }) {
  return (
    <div>
      <button type="button" className="campaign-back" onClick={onBack}><span>←</span> {t('campaign.categories')}</button>
      <div className="tw-card mb-3">
        <GameHeader title={`🌲 ${t('campaign.category.fields')}`} />
        <div className="campaign-section-copy">{t('campaign.fields_intro')}</div>
      </div>
      <div className="campaign-field-grid">
        {FIELD_TYPES.map(field => {
          const matches = entries.filter(x => x.subtipo === field.id);
          const principal = matches.find(x => x.campo?.recursoPrincipal)?.campo?.recursoPrincipal || '';
          const ready = matches.length > 0;
          return (
            <button key={field.id} type="button" className={`campaign-field-card ${ready ? 'is-ready' : 'is-empty'}`} disabled={!ready} onClick={() => ready && onSelect(field.id)}>
              <span className="campaign-field-icon">{principal ? (RESOURCE_ICONS[principal] || field.icon) : field.icon}</span>
              <strong>{t(field.title)}</strong>
              <small>{ready ? t('campaign.level_count', { count:matches.length }) : t('campaign.awaiting_data')}</small>
              {principal && <span className="campaign-field-resource">{t(RESOURCE_KEYS[principal] || 'campaign.resource')}</span>}
            </button>
          );
        })}
      </div>
    </div>
  );
}
