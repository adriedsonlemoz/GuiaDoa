import React from 'react';
import { C } from '../../theme.js';
import { useI18n } from '../../hooks/useI18n.jsx';
import RealmClock from '../reinos/RealmClock.jsx';

export default function HomeProfileCard({ profile, onLanguage, onEdit }) {
  const { t } = useI18n();
  return (
    <section className="tw-card mb-3" style={{ overflow: 'hidden', animation: 'reveal-up 0.4s 0.08s ease both' }}>
      <div style={{ background: 'linear-gradient(180deg,#EBE1CF 0%,#F4ECDF 100%)', padding: '12px 13px' }}>
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center shrink-0" style={{ width: 54, height: 54, borderRadius: 14, background: 'linear-gradient(145deg,#FAF5EC,#E8DABD)', border: '1.5px solid rgba(184,149,77,.45)', fontSize: '1.65rem', boxShadow: '0 4px 12px rgba(68,51,33,.08)' }}>🎖️</div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-8">
              <div className="min-w-0">
                <p className="font-nunito font-black m-0 truncate" style={{ fontSize: '1.08rem', color: C.TEXT_PRIMARY }}>{profile.nome}</p>
                <p className="font-nunito m-0" style={{ color: C.TEXT_MUTED, fontSize: '.6rem', fontWeight: 900, letterSpacing: 1.2, textTransform: 'uppercase', marginTop: 3 }}>{t('profile.hq')}</p>
              </div>
              <div style={{ display: 'flex', gap: 5, flexShrink: 0 }}>
                <button onClick={onLanguage} style={{ width: 28, height: 28, borderRadius: 8, background: 'rgba(49,72,74,.045)', border: '1px solid rgba(49,72,74,.12)', cursor: 'pointer' }} title={t('language.title')}>🌐</button>
                <button onClick={onEdit} style={{ width: 28, height: 28, borderRadius: 8, background: 'rgba(49,72,74,.045)', border: '1px solid rgba(49,72,74,.12)', cursor: 'pointer', color: C.TEXT_SECONDARY }} title={t('home.perfil.editar')}>✎</button>
              </div>
            </div>
            <RealmClock realm={profile.reino} fuso={profile.fuso} compact />
          </div>
        </div>
      </div>
    </section>
  );
}
