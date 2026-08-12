import React from 'react';
import { C } from '../../theme.js';
import { useI18n } from '../../hooks/useI18n.jsx';
import useRealmClock from './useRealmClock.js';

export default function RealmClock({ realm, fuso, compact = false }) {
  const { t } = useI18n();
  const { time, date } = useRealmClock(fuso);

  if (compact) {
    return (
      <div style={{
        marginTop: 5, padding: '12px 13px', borderRadius: 12,
        background: 'linear-gradient(135deg,rgba(28,58,94,.07),rgba(200,168,74,.075))',
        border: '1px solid rgba(28,58,94,.13)',
        display: 'grid', gridTemplateColumns: '1fr auto', alignItems: 'center', gap: 12,
      }}>
        <div style={{ minWidth: 0 }}>
          <div className="font-nunito" style={{ color: C.TEXT_MUTED, fontSize: '.58rem', fontWeight: 900, letterSpacing: 1.35, textTransform: 'uppercase' }}>
            {t('profile.realm_clock')}
          </div>
          <div className="font-nunito" style={{ color: C.TEXT_SECONDARY, fontSize: '.68rem', fontWeight: 800, marginTop: 3, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {realm || t('profile.realm')} · {fuso || 'UTC+0'}
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <strong className="font-nunito" style={{ display: 'block', color: C.BLUE_DARK, fontSize: '1.1rem', fontWeight: 1000, fontVariantNumeric: 'tabular-nums', letterSpacing: '.035em' }}>{time}</strong>
          <span className="font-nunito" style={{ color: C.TEXT_FAINT, fontSize: '.58rem', fontWeight: 800, textTransform: 'capitalize' }}>{date}</span>
        </div>
      </div>
    );
  }

  return (
    <section style={{
      position: 'relative', overflow: 'hidden', marginTop: 12, borderRadius: 16,
      background: 'linear-gradient(145deg,#172F4D 0%,#1C3A5E 58%,#2A4C72 100%)',
      border: '1px solid rgba(200,168,74,.42)', boxShadow: '0 10px 24px rgba(28,58,94,.16)',
    }}>
      <div aria-hidden="true" style={{ position: 'absolute', width: 120, height: 120, right: -38, top: -58, borderRadius: '50%', background: 'radial-gradient(circle,rgba(200,168,74,.12),transparent 68%)' }} />
      <div style={{ padding: '13px 15px 14px', position: 'relative' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
          <div>
            <div className="font-nunito" style={{ color: 'rgba(200,168,74,.82)', fontSize: '.56rem', fontWeight: 1000, letterSpacing: 1.6, textTransform: 'uppercase' }}>
              {t('profile.realm_clock')}
            </div>
            <div className="font-nunito" style={{ marginTop: 3, color: 'rgba(248,242,224,.68)', fontSize: '.66rem', fontWeight: 800 }}>
              {realm || t('profile.realm')}
            </div>
          </div>
          <span className="font-nunito" style={{
            padding: '3px 8px', borderRadius: 999, color: C.ACCENT, fontSize: '.58rem', fontWeight: 900,
            background: 'rgba(200,168,74,.09)', border: '1px solid rgba(200,168,74,.25)',
          }}>{fuso || 'UTC+0'}</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 12, marginTop: 8 }}>
          <time className="font-nunito" style={{ color: C.TEXT_HEADER, fontSize: '2rem', lineHeight: 1, fontWeight: 1000, fontVariantNumeric: 'tabular-nums', letterSpacing: '.055em' }}>
            {time}
          </time>
          <div style={{ textAlign: 'right', paddingBottom: 2 }}>
            <div className="font-nunito" style={{ color: 'rgba(248,242,224,.58)', fontSize: '.62rem', fontWeight: 800, textTransform: 'capitalize' }}>{date}</div>
            <div className="font-nunito" style={{ color: 'rgba(111,163,107,.95)', fontSize: '.54rem', fontWeight: 900, marginTop: 3, letterSpacing: .7 }}>
              ● {t('profile.realm_clock_live')}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
