import React, { useState } from 'react';
import GameHeader from './shared/GameHeader.jsx';
import Toast from '../ui/Toast.jsx';
import { C } from '../theme.js';

const Backup = () => {
  const [backupCode,  setBackupCode]  = useState('');
  const [restoreCode, setRestoreCode] = useState('');
  const [toast, setToast] = useState({ open: false, message: '', severity: 'success' });

  const showToast  = (msg, sev = 'success') => setToast({ open: true, message: msg, severity: sev });
  const closeToast = () => setToast(t => ({ ...t, open: false }));

  const handleGenerateBackup = () => {
    const keys = Object.keys(localStorage).filter(k => k.startsWith('doa_'));
    const obj  = {};
    keys.forEach(k => { obj[k] = localStorage.getItem(k); });
    const encrypted = btoa(unescape(encodeURIComponent(JSON.stringify(obj))));
    setBackupCode(encrypted);
    showToast('Cópia de segurança gerada com sucesso!', 'success');
  };

  const handleCopyBackup = () => {
    if (!backupCode) return showToast('Gere o backup primeiro!', 'warning');
    navigator.clipboard.writeText(backupCode);
    showToast('Código de backup copiado para a área de transferência.', 'info');
  };

  const handleRestoreBackup = () => {
    if (!restoreCode) return showToast('Cole o código de backup primeiro!', 'warning');
    try {
      const decoded = JSON.parse(decodeURIComponent(escape(atob(restoreCode))));
      Object.keys(decoded).forEach(k => localStorage.setItem(k, decoded[k]));
      showToast('Sucesso! Dados restaurados. A reiniciar o sistema...', 'success');
      setTimeout(() => window.location.reload(), 2000);
    } catch {
      showToast('Erro! Código de backup inválido ou corrompido.', 'error');
    }
  };

  return (
    <div className="max-w-md mx-auto pb-4">
      <Toast {...toast} onClose={closeToast} />

      <div className="tw-card mb-3">
        <GameHeader title="💾 Backup e Restauração" />

        <div className="p-4 bg-aoe-card">

          {/* SEÇÃO 1 */}
          <p className="font-cinzel font-bold text-xs uppercase tracking-widest mb-1 m-0" style={{ color: C.TEXT_PRIMARY }}>
            1. Criar Cópia de Segurança
          </p>
          <p className="font-nunito text-[0.78rem] font-semibold leading-snug text-justify mb-3 m-0" style={{ color: C.TEXT_SECONDARY }}>
            Gere um código criptografado com todo o seu progresso (perfil, fuso, preferências) para guardar num local seguro.
          </p>

          <div className="flex gap-2 mb-2.5">
            <button className="btn-success flex-1" onClick={handleGenerateBackup}>
              🗄️ Gerar Backup
            </button>
            <button className="btn-ghost flex-1" onClick={handleCopyBackup}>
              📋 Copiar Código
            </button>
          </div>

          {backupCode && (
            <textarea
              readOnly
              value={backupCode}
              rows={3}
              className="tw-input font-mono text-xs resize-none mb-3"
              style={{ wordBreak: 'break-all', fontSize: '0.62rem', lineHeight: 1.5 }}
            />
          )}

          {/* Divisor */}
          <div className="gold-stripe mb-3 opacity-40" />

          {/* SEÇÃO 2 */}
          <p className="font-cinzel font-bold text-xs uppercase tracking-widest mb-1 m-0" style={{ color: C.TEXT_PRIMARY }}>
            2. Restaurar Dados
          </p>
          <p className="font-nunito text-[0.78rem] font-semibold leading-snug text-justify mb-3 m-0" style={{ color: C.TEXT_SECONDARY }}>
            Cole o código de backup gerado anteriormente e restaure todos os seus dados.
          </p>

          <textarea
            rows={3}
            className="tw-input font-mono text-xs resize-none mb-2.5"
            style={{ fontSize: '0.62rem', lineHeight: 1.5 }}
            placeholder="Cole o código de backup aqui..."
            value={restoreCode}
            onChange={e => setRestoreCode(e.target.value)}
          />

          <button className="btn-danger w-full" onClick={handleRestoreBackup}>
            🔄 Restaurar Dados
          </button>

          {/* Aviso */}
          <div
            className="mt-3 p-2.5 rounded-lg"
            style={{ border: `1px dashed ${C.WARNING}`, background: `${C.WARNING}10` }}
          >
            <p className="font-nunito font-bold text-[0.7rem] m-0" style={{ color: C.WARNING }}>
              ⚠️ Atenção: A restauração sobrescreve todos os dados actuais. Esta ação não pode ser desfeita.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Backup;
