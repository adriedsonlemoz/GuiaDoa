import React from 'react';
import { C } from '../../../theme.js';
import GameHeader from '../../shared/GameHeader.jsx';
import { fmtFull, getIcone } from '../tropaUtils.js';
import { ATTRS_COMPARAR } from './config.js';
import { useI18n } from '../../../hooks/useI18n.jsx';

const SlotComparar = ({ tropa, label, side, onSelect }) => {
  const { t, content } = useI18n();
  return (
  <button onClick={() => onSelect(side)} className="flex-1 p-3 text-center cursor-pointer rounded-lg transition-all" style={{ border: tropa ? `2px solid ${C.ACCENT_HOVER}` : `2px dashed ${C.BORDER}`, background: tropa ? 'rgba(200,148,10,0.06)' : 'transparent' }}>
    <p className="font-nunito font-black text-[0.72rem] tracking-widest mb-1.5 m-0" style={{ color: C.TEXT_SECONDARY }}>{label}</p>
    <div className="text-3xl mb-1.5 leading-none">{tropa ? getIcone(tropa.nome) : '＋'}</div>
    <p className="font-nunito font-black text-[0.72rem] leading-tight m-0" style={{ color: tropa ? C.ACCENT : C.BORDER }}>{tropa ? content(tropa, 'nome') : t('troops.choose')}</p>
    {tropa && <p className="font-nunito text-[0.72rem] mt-1 m-0" style={{ color: C.POWER }}>⭐ {tropa.poder}</p>}
  </button>
  );
};

export default function ComparePanel({ tropaA, tropaB, onSelect }) {
  const { t, content, locale } = useI18n();
  return (
    <div>
      <div className="flex gap-3 mb-3 items-stretch"><SlotComparar tropa={tropaA} label={`${t('troops.unit')} A`} side="A" onSelect={onSelect} /><div className="flex items-center px-1"><span className="font-nunito font-black text-sm" style={{ color: C.ERROR }}>VS</span></div><SlotComparar tropa={tropaB} label={`${t('troops.unit')} B`} side="B" onSelect={onSelect} /></div>
      {(tropaA || tropaB) ? (
        <div className="tw-card overflow-hidden"><GameHeader title={t('troops.attribute_comparison')} fontSize="0.82rem" /><div className="p-3">
          <div className="grid gap-1 mb-3" style={{ gridTemplateColumns: '1fr 36px 1fr' }}><p className="font-nunito font-black text-[0.75rem] m-0 truncate text-left" style={{ color: C.ACCENT }}>{getIcone(tropaA?.nome || '')} {tropaA ? content(tropaA, 'nome') : '—'}</p><div /><p className="font-nunito font-black text-[0.75rem] m-0 truncate text-right" style={{ color: C.ACCENT }}>{tropaB ? content(tropaB, 'nome') : '—'} {getIcone(tropaB?.nome || '')}</p></div>
          {ATTRS_COMPARAR.map(attr => {
            const valA = tropaA ? (tropaA[attr.id] || 0) : 0;
            const valB = tropaB ? (tropaB[attr.id] || 0) : 0;
            const winA = valA > valB;
            const winB = valB > valA;
            const pctA = attr.max > 0 ? Math.min(100, (valA / attr.max) * 100) : 0;
            const pctB = attr.max > 0 ? Math.min(100, (valB / attr.max) * 100) : 0;
            return (
              <div key={attr.id} className="mb-3"><p className="text-center font-nunito font-black text-[0.72rem] tracking-widest m-0 mb-1" style={{ color: C.TEXT_SECONDARY }}>{attr.icon} {attr.labelKey ? t(attr.labelKey) : attr.label}</p><div className="grid gap-1 items-center" style={{ gridTemplateColumns: '1fr 28px 1fr' }}>
                <div><p className="font-nunito font-black text-[0.78rem] text-right m-0 mb-1" style={{ color: winA ? C.SUCCESS : C.ACCENT }}>{fmtFull(valA, locale)}</p><div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(62,47,28,0.07)', transform: 'scaleX(-1)' }}><div style={{ height: '100%', width: `${pctA}%`, background: winA ? C.SUCCESS : attr.color, borderRadius: 2 }} /></div></div>
                <div className="text-center text-sm">{attr.icon}</div>
                <div><p className="font-nunito font-black text-[0.78rem] text-left m-0 mb-1" style={{ color: winB ? C.SUCCESS : C.ACCENT }}>{fmtFull(valB, locale)}</p><div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(62,47,28,0.07)' }}><div style={{ height: '100%', width: `${pctB}%`, background: winB ? C.SUCCESS : attr.color, borderRadius: 2 }} /></div></div>
              </div></div>
            );
          })}
        </div></div>
      ) : <div className="py-12 text-center rounded-xl opacity-50" style={{ border: `1px dashed ${C.BORDER}` }}><p className="font-nunito text-[0.78rem] tracking-wide m-0" style={{ color: C.TEXT_SECONDARY }}>{t('troops.compare_select_two')}</p></div>}
    </div>
  );
}
