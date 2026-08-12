import React from 'react';
import { C } from '../theme.js';
import { descreverSyncStatus } from '../data/syncStatus.js';
import { formatarUltimaSyncPt } from '../data/syncService.js';

export default function SyncStatusBar({ status, isOffline, syncInfo, onSync }) {
  if (!status || status === 'syncing') return null;
  const visual = descreverSyncStatus(status, !isOffline);
  const ultima = formatarUltimaSyncPt(syncInfo.ts);
  const bg = visual.nivel === 'ok' ? 'rgba(55,105,65,0.28)'
    : visual.nivel === 'erro' ? 'rgba(130,45,35,0.30)'
    : 'rgba(150,110,25,0.28)';

  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 8,
      padding: '5px 10px', background: bg,
      borderTop: '1px solid rgba(200,168,74,0.18)',
    }}>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div className="font-nunito font-black text-[0.67rem]" style={{ color: C.TEXT_HEADER }}>
          {visual.emoji} {visual.label}
        </div>
        <div className="font-nunito text-[0.56rem] truncate" style={{ color: '#B9B0A0' }}>
          Dados carregados: {ultima}
        </div>
      </div>
      <button
        onClick={onSync}
        className="font-nunito font-black text-[0.6rem] rounded-md px-2 py-1"
        style={{
          color: C.ACCENT,
          background: 'rgba(200,168,74,0.08)',
          border: '1px solid rgba(200,168,74,0.35)',
          whiteSpace: 'nowrap',
        }}
      >
        ↻ Atualizar do MongoDB
      </button>
    </div>
  );
}
