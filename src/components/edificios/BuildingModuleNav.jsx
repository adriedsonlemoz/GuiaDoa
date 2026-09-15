import React from 'react';
import { useI18n } from '../../hooks/useI18n.jsx';

export default function BuildingModuleNav({ setRoute, sibling }) {
  const { t } = useI18n();
  return (
    <div className="building-module-nav">
      <button type="button" className="building-category-button" onClick={() => setRoute('edificios')}>
        ← {t('buildings.categories')}
      </button>
      {sibling ? (
        <button type="button" className="building-link-button" onClick={() => setRoute(sibling.route)}>
          {sibling.label} →
        </button>
      ) : null}
    </div>
  );
}
