import React from 'react';
import { C } from '../../theme.js';
import { HOME_TOOLS } from './homeTools.js';

export default function HomeToolsGrid({ t, onTool }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 9 }}>
      {HOME_TOOLS.map((tool, index) => (
        <button
          key={tool.id}
          onClick={() => onTool(tool.id)}
          style={{
            background: 'linear-gradient(180deg, rgba(244,236,223,1) 0%, rgba(238,227,208,1) 100%)',
            border: '1.5px solid rgba(184,149,77,0.20)',
            borderRadius: 14,
            padding: '10px 8px 9px',
            textAlign: 'center',
            cursor: 'pointer',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            aspectRatio: '1 / 1',
            overflow: 'hidden',
            position: 'relative',
            animation: `tool-in 0.3s ${0.16 + index * 0.04}s ease both`,
            transition: 'transform 0.12s, box-shadow 0.12s, border-color 0.12s',
            boxShadow: '0 4px 14px rgba(68,51,33,0.05)',
          }}
          onMouseDown={event => { event.currentTarget.style.transform = 'scale(0.97)'; event.currentTarget.style.boxShadow = '0 2px 8px rgba(68,51,33,0.04)'; }}
          onMouseUp={event => { event.currentTarget.style.transform = 'scale(1)'; event.currentTarget.style.boxShadow = `0 8px 18px ${tool.cor}24`; }}
          onTouchStart={event => { event.currentTarget.style.transform = 'scale(0.97)'; event.currentTarget.style.boxShadow = '0 2px 8px rgba(68,51,33,0.04)'; }}
          onTouchEnd={event => { event.currentTarget.style.transform = 'scale(1)'; event.currentTarget.style.boxShadow = `0 8px 18px ${tool.cor}24`; }}
          onMouseEnter={event => { event.currentTarget.style.boxShadow = `0 8px 18px ${tool.cor}24`; event.currentTarget.style.borderColor = 'rgba(184,149,77,0.34)'; }}
          onMouseLeave={event => { event.currentTarget.style.boxShadow = '0 4px 14px rgba(68,51,33,0.05)'; event.currentTarget.style.transform = 'scale(1)'; event.currentTarget.style.borderColor = 'rgba(184,149,77,0.20)'; }}
        >
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: `linear-gradient(90deg,transparent,${tool.cor},transparent)`, opacity: 0.55 }} />
          <div style={{
            width: 58, height: 58, borderRadius: '50%',
            background: `radial-gradient(circle at 30% 30%, #fff8ef 0%, ${tool.cor}12 58%, ${tool.cor}16 100%)`,
            border: `2px solid ${tool.cor}2E`,
            display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 8,
            boxShadow: `0 2px 10px ${tool.cor}20`,
          }}>
            <span style={{ fontSize: '2rem', lineHeight: 1, filter: 'drop-shadow(0 1px 2px rgba(68,51,33,0.15))' }}>{tool.icon}</span>
          </div>
          <span className="font-cinzel font-bold" style={{ fontSize: '0.74rem', color: C.TEXT_PRIMARY, lineHeight: 1.18, letterSpacing: '0.2px' }}>{t(tool.tKey)}</span>
          <span className="font-nunito font-semibold" style={{ fontSize: '0.61rem', color: C.TEXT_MUTED, marginTop: 4, lineHeight: 1.15 }}>{t(tool.subKey)}</span>
        </button>
      ))}
    </div>
  );
}
