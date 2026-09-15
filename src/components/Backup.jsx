import React, { useState } from 'react';
import GameHeader from './shared/GameHeader.jsx';
import Toast from '../ui/Toast.jsx';
import { C } from '../theme.js';
import { useI18n } from '../hooks/useI18n.jsx';

const Backup = () => {
  const [backupCode,  setBackupCode]  = useState('');
  const [restoreCode, setRestoreCode] = useState('');
  const [toast, setToast] = useState({ open: false, message: '', severity: 'success' });
  const { t } = useI18n();

  const showToast  = (msg, sev = 'success') => setToast({ open: true, message: msg, severity: sev });
  const closeToast = () => setToast(t => ({ ...t, open: false }));

  const handleGenerateBackup = () => {
    const keys = Object.keys(localStorage).filter(k => k.startsWith('doa_'));
    const obj  = {};
    keys.forEach(k => { obj[k] = localStorage.getItem(k); });
    const encrypted = btoa(unescape(encodeURIComponent(JSON.stringify(obj))));
    setBackupCode(encrypted);
    showToast(t('backup.generated'), 'success');
  };

  const handleCopyBackup = () => {
    if (!backupCode) return showToast(t('backup.generate_first'), 'warning');
    navigator.clipboard.writeText(backupCode);
    showToast(t('backup.copied'), 'info');
  };

  const handleRestoreBackup = () => {
    if (!restoreCode) return showToast(t('backup.paste_first'), 'warning');
    try {
      const decoded = JSON.parse(decodeURIComponent(escape(atob(restoreCode))));
      Object.keys(decoded).forEach(k => localStorage.setItem(k, decoded[k]));
      showToast(t('backup.restore_success'), 'success');
      setTimeout(() => window.location.reload(), 2000);
    } catch {
      showToast(t('backup.invalid'), 'error');
    }
  };

  return (
    <div className="max-w-md mx-auto pb-4">
      <Toast {...toast} onClose={closeToast} />

      <div className="tw-card mb-3">
        <GameHeader title={t('backup.title')} />

        <div className="p-4 bg-aoe-card">

          {/* SEÇÃO 1 */}
          <p className="font-cinzel font-bold text-xs uppercase tracking-widest mb-1 m-0" style={{ color: C.TEXT_PRIMARY }}>
            {t('backup.create_title')}
          </p>
          <p className="font-nunito text-[0.78rem] font-semibold leading-snug text-justify mb-3 m-0" style={{ color: C.TEXT_SECONDARY }}>
            {t('backup.create_text')}
          </p>

          <div className="flex gap-2 mb-2.5">
            <button className="btn-success flex-1" onClick={handleGenerateBackup}>
              {t('backup.generate')}
            </button>
            <button className="btn-ghost flex-1" onClick={handleCopyBackup}>
              {t('backup.copy')}
            </button>
          </div>

          {backupCode && (
            <textarea
              readOnly
              value={backupCode}
              rows={3}
              className="tw-input font-mono text-xs resize-none mb-3"
              style={{ wordBreak: 'break-all', fontSize: '.72rem', lineHeight: 1.5 }}
            />
          )}

          {/* Divisor */}
          <div className="gold-stripe mb-3 opacity-40" />

          {/* SEÇÃO 2 */}
          <p className="font-cinzel font-bold text-xs uppercase tracking-widest mb-1 m-0" style={{ color: C.TEXT_PRIMARY }}>
            {t('backup.restore_title')}
          </p>
          <p className="font-nunito text-[0.78rem] font-semibold leading-snug text-justify mb-3 m-0" style={{ color: C.TEXT_SECONDARY }}>
            {t('backup.restore_text')}
          </p>

          <textarea
            rows={3}
            className="tw-input font-mono text-xs resize-none mb-2.5"
            style={{ fontSize: '.72rem', lineHeight: 1.5 }}
            placeholder={t('backup.paste_placeholder')}
            value={restoreCode}
            onChange={e => setRestoreCode(e.target.value)}
          />

          <button className="btn-danger w-full" onClick={handleRestoreBackup}>
            {t('backup.restore')}
          </button>

          {/* Aviso */}
          <div
            className="mt-3 p-2.5 rounded-lg"
            style={{ border: `1px dashed ${C.WARNING}`, background: `${C.WARNING}10` }}
          >
            <p className="font-nunito font-bold text-[0.72rem] m-0" style={{ color: C.WARNING }}>
              {t('backup.warning')}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Backup;
