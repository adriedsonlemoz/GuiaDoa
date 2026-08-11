import React from 'react';
import { C } from '../../theme.js';
import { fmt } from './tropaUtils.js';

const ExercitoBanner = ({ totTropas, totPoder, totalFiltradas }) => {
  const cols = [
    { label: 'EXÉRCITO', value: fmt(totTropas), color: C.TEXT_PRIMARY, icon: '⚔️' },
    { label: 'PODER',    value: fmt(totPoder),  color: C.POWER,        icon: '✦'  },
    { label: 'UNIDADES', value: totalFiltradas, color: C.ACCENT_DEEP,  icon: '📋' },
  ];

  return (
    <div
      className="flex rounded-xl overflow-hidden mb-2.5 relative"
      style={{
        border: `1.5px solid ${C.BORDER}`,
        background: `linear-gradient(180deg, ${C.BG_CARD} 0%, ${C.BG_CARD_TOP} 100%)`,
        boxShadow: '0 2px 8px rgba(62,47,28,0.10)',
      }}
    >
      {/* brilho topo */}
      <div className="absolute top-0 left-[10%] right-[10%] h-px pointer-events-none"
        style={{ background: 'linear-gradient(90deg, transparent, rgba(255,248,230,0.6), transparent)' }} />

      {cols.map(({ label, value, color, icon }, i) => (
        <div
          key={label}
          className="flex-1 text-center py-3 px-1 relative"
          style={{ borderRight: i < 2 ? `1px solid ${C.BORDER_SOFT}` : 'none' }}
        >
          <p className="font-nunito font-bold text-[0.65rem] tracking-widest flex items-center justify-center gap-1 m-0 mb-1" style={{ color: C.TEXT_MUTED }}>
            {icon} {label}
          </p>
          <p className="font-nunito font-bold text-base leading-none m-0" style={{ color }}>
            {value}
          </p>
        </div>
      ))}
    </div>
  );
};

export default ExercitoBanner;
