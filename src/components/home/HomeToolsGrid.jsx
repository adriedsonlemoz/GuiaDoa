import React from 'react';
import { C } from '../../theme.js';
import { HOME_TOOLS } from './homeTools.js';

export default function HomeToolsGrid({ t, onTool }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8 }}>
      {HOME_TOOLS.map((tool, index) => (
        <button key={tool.id} onClick={() => onTool(tool.id)} style={{
          background: C.BG_CARD, border: '1.5px solid rgba(200,168,74,0.22)', borderRadius: 13,
          padding: 0, textAlign: 'center', cursor: 'pointer', display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center', aspectRatio: '1 / 1', overflow: 'hidden', position: 'relative',
          animation: `tool-in 0.3s ${0.16 + index * 0.04}s ease both`, transition: 'transform 0.12s, box-shadow 0.12s',
        }}
          onMouseDown={event => { event.currentTarget.style.transform = 'scale(0.95)'; event.currentTarget.style.boxShadow = 'none'; }}
          onMouseUp={event => { event.currentTarget.style.transform = 'scale(1)'; event.currentTarget.style.boxShadow = `0 4px 18px ${tool.cor}30`; }}
          onTouchStart={event => { event.currentTarget.style.transform = 'scale(0.95)'; event.currentTarget.style.boxShadow = 'none'; }}
          onTouchEnd={event => { event.currentTarget.style.transform = 'scale(1)'; event.currentTarget.style.boxShadow = `0 4px 18px ${tool.cor}30`; }}
          onMouseEnter={event => { event.currentTarget.style.boxShadow = `0 4px 18px ${tool.cor}30`; }}
          onMouseLeave={event => { event.currentTarget.style.boxShadow = 'none'; event.currentTarget.style.transform = 'scale(1)'; }}>
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: `linear-gradient(90deg,transparent,${tool.cor},transparent)`, opacity: 0.75 }} />
          <div style={{ width: 56, height: 56, borderRadius: '50%', background: `${tool.cor}16`, border: `2px solid ${tool.cor}35`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 8, boxShadow: `0 2px 10px ${tool.cor}25` }}>
            <span style={{ fontSize: '2rem', lineHeight: 1, filter: `drop-shadow(0 1px 4px ${tool.cor}55)` }}>{tool.icon}</span>
          </div>
          <span className="font-cinzel font-bold" style={{ fontSize: '0.75rem', color: C.TEXT_PRIMARY, lineHeight: 1.2, letterSpacing: '0.3px' }}>{t(tool.tKey)}</span>
          <span className="font-nunito font-semibold" style={{ fontSize: '0.62rem', color: C.TEXT_MUTED, marginTop: 3 }}>{t(tool.subKey)}</span>
        </button>
      ))}
    </div>
  );
}
