import React from 'react';
import { useI18n } from '../../hooks/useI18n.jsx';
import useRealmClock from './useRealmClock.js';

export default function RealmClock({ realm, fuso, compact = false }) {
  const { t } = useI18n();
  const { time, date } = useRealmClock(fuso);

  if (compact) return (
    <div className="game-realm-line" title={date}>
      {realm || t('profile.realm')} <span>•</span> {fuso || 'UTC+0'} <span>•</span> <span className="game-realm-time">{time}</span>
    </div>
  );

  return (
    <section className="game-panel" style={{ marginTop:10 }}>
      <div className="game-section-title">{t('profile.realm_clock')}</div>
      <div style={{ padding:'10px 12px', fontFamily:'Georgia, serif', fontSize:'.78rem', color:'#5d482d', fontWeight:700 }}>
        {realm || t('profile.realm')} • {fuso || 'UTC+0'} • <span className="game-realm-time">{time}</span>
        <div style={{ marginTop:3, color:'#8a7654', fontSize:'.61rem', textTransform:'capitalize' }}>{date}</div>
      </div>
    </section>
  );
}
