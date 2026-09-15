import React from 'react';
import { useI18n } from '../../hooks/useI18n.jsx';
import GameHeader from '../shared/GameHeader.jsx';

function HubCard({ image, icon, title, subtitle, meta, onClick }) {
  return (
    <button type="button" className="building-hub-card" onClick={onClick}>
      <div className="building-hub-thumb">
        {image ? <img src={image} alt="" /> : <span>{icon}</span>}
      </div>
      <div className="building-hub-copy">
        <strong>{title}</strong>
        <span>{subtitle}</span>
        {meta ? <small>{meta}</small> : null}
      </div>
      <span className="building-hub-chevron" aria-hidden="true">›</span>
    </button>
  );
}

export default function BuildingHub({ normalCount, gruta, basilica, setRoute }) {
  const { t, content } = useI18n();
  return (
    <div style={{ maxWidth:620, margin:'0 auto', paddingBottom:18 }}>
      <GameHeader title={t('buildings.hub_title')} subtitle={t('buildings.hub_subtitle')} />
      <div className="building-hub-grid">
        <HubCard
          icon="🏠"
          title={t('buildings.normal_title')}
          subtitle={t('buildings.normal_subtitle')}
          meta={t('buildings.normal_count', { count:normalCount })}
          onClick={() => setRoute('edificios_normais')}
        />
        <HubCard
          image={gruta?.imagem}
          icon="🕳️"
          title={gruta ? content(gruta,'nome') : t('buildings.cave_title')}
          subtitle={t('buildings.cave_card_subtitle')}
          meta={t('buildings.special_system')}
          onClick={() => setRoute('edificios_gruta')}
        />
        <HubCard
          image={basilica?.imagem}
          icon="⛪"
          title={basilica ? content(basilica,'nome') : t('buildings.basilica_title')}
          subtitle={t('buildings.basilica_card_subtitle')}
          meta={t('buildings.cave_dependency')}
          onClick={() => setRoute('edificios_basilica')}
        />
      </div>
      <div className="building-system-flow">
        <span>🕳️ {t('buildings.flow.cave')}</span>
        <b>→</b>
        <span>💠 {t('buildings.flow.orbs')}</span>
        <b>→</b>
        <span>💎 {t('buildings.flow.stones')}</span>
        <b>→</b>
        <span>⛪ {t('buildings.flow.basilica')}</span>
      </div>
    </div>
  );
}
