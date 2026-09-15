import React from 'react';
import { useI18n } from '../../hooks/useI18n.jsx';
import RealmClock from '../reinos/RealmClock.jsx';

export default function HomeProfileCard({ profile, onLanguage, onEdit }) {
  const { t } = useI18n();
  return (
    <section className="game-profile-card" style={{ animation:'reveal-up .35s .06s ease both' }}>
      <div className="game-profile-emblem" aria-hidden="true">🎖️</div>
      <div style={{ minWidth:0 }}>
        <h1 className="game-profile-name">{profile.nome}</h1>
        <RealmClock realm={profile.reino} fuso={profile.fuso} compact />
      </div>
      <div className="game-profile-actions">
        <button className="game-icon-button" onClick={onLanguage} title={t('language.title')} aria-label={t('language.title')}>文</button>
        <button className="game-icon-button" onClick={onEdit} title={t('home.perfil.editar')} aria-label={t('home.perfil.editar')}>✎</button>
      </div>
    </section>
  );
}
