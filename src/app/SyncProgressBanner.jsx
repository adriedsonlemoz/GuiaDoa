import React from 'react';
import { useI18n } from '../hooks/useI18n.jsx';

export default function SyncProgressBanner({ status, progress }) {
  const { t } = useI18n();
  if (status !== 'syncing') return null;
  const pct = progress.total > 0 ? Math.round((progress.step / progress.total) * 100) : 0;

  return (
    <div className="sync-live-dock" role="status" aria-live="polite">
      <div className="sync-live-dock-main">
        <div className="sync-live-glyph" aria-hidden="true">DOA</div>
        <div className="sync-live-copy">
          <b>{progress.step < progress.total ? t('app.sync.syncing_label', { label: progress.label }) : t('app.sync.finalizing')}</b>
          <small>{t('app.sync.background_note')}</small>
        </div>
        <span className="sync-live-pct">{pct}%</span>
      </div>
      <div className="sync-live-track"><div style={{ width:`${pct}%` }} /></div>
    </div>
  );
}
