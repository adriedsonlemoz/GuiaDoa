import React from 'react';
import { C } from '../../theme.js';
import { useI18n } from '../../hooks/useI18n.jsx';
import RealmClock from '../reinos/RealmClock.jsx';

export default function HomeProfileCard({ profile, onLanguage, onEdit }) {
  const { t } = useI18n();

  return (
    <section className="tw-card mb-3" style={{ overflow: 'hidden', animation: 'reveal-up 0.4s 0.08s ease both' }}>
      <div className="flex items-center justify-between px-4" style={{
        background: 'linear-gradient(135deg,#1C3A5E,#2A4C72)',
        borderBottom: '1px solid rgba(200,168,74,0.3)', minHeight: 38,
      }}>
        <span className="font-cinzel font-bold uppercase" style={{ fontSize: '0.58rem', color: 'rgba(200,168,74,0.78)', letterSpacing: '2.6px' }}>
          ◆ {t('profile.hq')} ◆
        </span>
        <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
          <button onClick={onLanguage} className="flex items-center justify-center rounded-md" style={{ width: 29, height: 29, background: 'rgba(248,242,224,.035)', cursor: 'pointer', border: '1px solid rgba(200,168,74,0.28)', color: 'rgba(248,242,224,0.65)', fontSize: '0.84rem' }} title={t('language.title')}>🌐</button>
          <button onClick={onEdit} className="flex items-center justify-center rounded-md" style={{ width: 29, height: 29, background: 'rgba(248,242,224,.035)', cursor: 'pointer', border: '1px solid rgba(200,168,74,0.28)', color: 'rgba(248,242,224,0.58)', fontSize: '0.9rem' }} title={t('home.perfil.editar')}>✎</button>
        </div>
      </div>

      <div style={{ background: C.BG_CARD_TOP, padding: '14px 14px 15px' }}>
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center shrink-0" style={{
            width: 54, height: 54, borderRadius: 15,
            background: 'linear-gradient(145deg,#F8F4E8,#E6D9BC)',
            border: '1.5px solid rgba(200,168,74,0.45)', fontSize: '1.7rem', position: 'relative',
            boxShadow: '0 5px 14px rgba(62,47,28,0.10)',
          }}>
            🎖️
            <span style={{ position: 'absolute', bottom: -3, right: -3, width: 11, height: 11, borderRadius: '50%', background: C.ENERGY, border: `2px solid ${C.BG_CARD_TOP}`, animation: 'online-pulse 3s ease-in-out infinite' }} />
          </div>

          <div className="flex-1 min-w-0">
            <p className="font-nunito font-black m-0 leading-tight truncate" style={{ fontSize: '1.12rem', color: C.TEXT_PRIMARY }}>{profile.nome}</p>
            <div className="flex gap-1.5 mt-2 flex-wrap">
              <span className="font-nunito font-extrabold" style={{
                fontSize: '0.67rem', padding: '3px 9px', borderRadius: 999,
                border: '1px solid rgba(200,168,74,0.34)', color: C.TEXT_SECONDARY,
                background: 'rgba(184,150,90,0.09)',
              }}>{profile.reino}</span>
              {profile.fuso && <span className="font-nunito font-extrabold" style={{
                fontSize: '0.62rem', padding: '3px 8px', borderRadius: 999,
                border: '1px solid rgba(28,58,94,0.12)', color: C.TEXT_MUTED,
                background: 'rgba(28,58,94,0.045)',
              }}>{profile.fuso}</span>}
            </div>
          </div>
        </div>

        <RealmClock realm={profile.reino} fuso={profile.fuso} />
      </div>
    </section>
  );
}
