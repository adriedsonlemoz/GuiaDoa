import React from 'react';
import { C } from '../../theme.js';
import { useI18n } from '../../hooks/useI18n.jsx';

const cards = [
  ['ranged', '🏹', '#2563a8', 'troops.ranged'],
  ['melee', '⚔️', '#a83c2c', 'troops.melee'],
  ['trainable', '🏰', '#7a5a1f', 'troops.trainable'],
  ['special', '✨', '#7452a8', 'troops.special'],
];

export default function TacticalSummary({ summary, activeFilter, onFilter }) {
  const { t } = useI18n();
  return (
    <div style={{ display:'grid', gridTemplateColumns:'repeat(2,minmax(0,1fr))', gap:8 }}>
      {cards.map(([id, icon, color, key]) => {
        const active = activeFilter === id;
        return (
          <button key={id} onClick={() => onFilter(active ? 'all' : id)} style={{
            textAlign:'left', padding:'10px 11px', borderRadius:12, cursor:'pointer',
            background: active ? `${color}12` : C.BG_CARD,
            border:`1.5px solid ${active ? color : 'rgba(200,168,74,.22)'}`,
            boxShadow:'0 2px 8px rgba(62,47,28,.06)',
          }}>
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', gap:8 }}>
              <span style={{ fontSize:'1.15rem' }}>{icon}</span>
              <strong className="font-cinzel" style={{ fontSize:'1.15rem', color }}>{summary[id]}</strong>
            </div>
            <div className="font-nunito font-bold" style={{ fontSize:'.68rem', color:C.TEXT_PRIMARY, marginTop:4 }}>{t(key)}</div>
            <div className="font-nunito" style={{ fontSize:'.57rem', color:C.TEXT_FAINT, marginTop:1 }}>{t('troops.available_in_catalog')}</div>
          </button>
        );
      })}
    </div>
  );
}
