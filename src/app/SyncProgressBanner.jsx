import React from 'react';
import { useI18n } from '../hooks/useI18n.jsx';

export default function SyncProgressBanner({ status, progress }) {
  const { t } = useI18n();
  if (status !== 'syncing') return null;
  const pct = progress.total > 0 ? Math.round((progress.step / progress.total) * 100) : 0;

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 9999,
      background: 'linear-gradient(90deg,#2F5652,#3C6863)',
      borderBottom: '1px solid rgba(200,168,74,0.4)',
      padding: '7px 16px 0',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, paddingBottom: 6 }}>
        <span style={{
          fontSize: '0.75rem', animation: 'spin 1.2s linear infinite',
          display: 'inline-block', lineHeight: 1,
        }}>⚙️</span>
        <span style={{
          fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif", fontWeight: 800,
          fontSize: '0.72rem', letterSpacing: '0.5px', color: '#F8F2E0', flex: 1,
        }}>
          {progress.step < progress.total ? t('app.sync.syncing_label', { label: progress.label }) : t('app.sync.finalizing')}
        </span>
        <span style={{
          fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif", fontWeight: 900,
          fontSize: '0.65rem', color: 'rgba(200,168,74,0.85)',
        }}>
          {pct}%
        </span>
      </div>
      <div style={{ height: 3, background: 'rgba(255,255,255,0.12)', overflow: 'hidden' }}>
        <div style={{
          height: '100%', width: `${pct}%`,
          background: 'linear-gradient(90deg,rgba(200,168,74,0.7),rgba(200,168,74,1))',
          transition: 'width 0.4s ease', borderRadius: 2,
        }} />
      </div>
    </div>
  );
}
