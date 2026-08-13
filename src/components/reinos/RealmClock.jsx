import React from 'react';
import { C } from '../../theme.js';
import { useI18n } from '../../hooks/useI18n.jsx';
import useRealmClock from './useRealmClock.js';

export default function RealmClock({ realm, fuso, compact = false }) {
  const { t } = useI18n();
  const { time, date } = useRealmClock(fuso);
  if (compact) return (
    <div style={{ marginTop: 7, padding: '6px 8px', borderRadius: 9, background: 'rgba(49,72,74,.045)', border: '1px solid rgba(49,72,74,.11)' }}>
      <div className="font-nunito" style={{ color: C.TEXT_SECONDARY, fontSize: '.68rem', fontWeight: 900, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
        {realm || t('profile.realm')} <span style={{ color: C.TEXT_FAINT }}>•</span> {fuso || 'UTC+0'} <span style={{ color: C.TEXT_FAINT }}>•</span> <span style={{ color: C.BLUE_DARK, fontVariantNumeric: 'tabular-nums' }}>{time}</span>
      </div>
      <div className="font-nunito" style={{ color: C.TEXT_FAINT, fontSize: '.52rem', fontWeight: 800, marginTop: 1, textTransform: 'capitalize' }}>{date}</div>
    </div>
  );
  return (
    <section style={{ marginTop: 10, padding: '10px 12px', borderRadius: 12, background: 'linear-gradient(180deg,#F4ECDF,#EBE1CF)', border: '1px solid rgba(184,149,77,.28)' }}>
      <div className="font-nunito" style={{ color: C.TEXT_MUTED, fontSize: '.55rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: 1.2 }}>{t('profile.realm_clock')}</div>
      <div className="font-nunito" style={{ color: C.TEXT_SECONDARY, fontSize: '.76rem', fontWeight: 900, marginTop: 4 }}>{realm || t('profile.realm')} • {fuso || 'UTC+0'} • <span style={{ color: C.BLUE_DARK }}>{time}</span></div>
    </section>
  );
}
