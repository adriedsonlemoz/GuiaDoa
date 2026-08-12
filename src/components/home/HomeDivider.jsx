import React from 'react';
import { C } from '../../theme.js';

export default function HomeDivider({ label, extra }) {
  return (
    <div className="flex items-center gap-1.5" style={{ padding: '8px 0 5px' }}>
      <div style={{ flex: 1, height: 1, background: `linear-gradient(90deg,transparent,${C.BORDER})`, opacity: 0.3 }} />
      <span style={{ color: C.ACCENT, fontSize: '0.72rem' }}>◆</span>
      <span className="font-nunito font-black uppercase tracking-widest" style={{ fontSize: '0.62rem', color: C.TEXT_MUTED }}>{label}</span>
      <span style={{ color: C.ACCENT, fontSize: '0.72rem' }}>◆</span>
      <div style={{ flex: 1, height: 1, background: `linear-gradient(270deg,transparent,${C.BORDER})`, opacity: 0.3 }} />
      {extra && <div style={{ flexShrink: 0 }}>{extra}</div>}
    </div>
  );
}
