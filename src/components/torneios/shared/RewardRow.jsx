import React from 'react';
import { C } from '../../../theme.js';

export const LISTA_QTDS = [10, 50, 100, 200, 300, 500, 1000, 2000, 5000, 10000];
export const fmtN = n => (n === null || n === undefined ? '—' : Number(n).toLocaleString('pt-BR'));

/**
 * RewardRow — linha de prêmio reutilizável em todos os torneios.
 * Props: label, dataKey, reqPts, totalPts, premios, onChange
 */
const RewardRow = ({ label, dataKey, reqPts, totalPts, premios, onChange }) => {
  const disabled = totalPts < reqPts;
  const p = premios[dataKey] || { m: 10, b: 1000 };
  return (
    <div
      className="flex items-center justify-between p-2 rounded-lg mb-1.5 transition-all"
      style={{
        background: disabled ? 'transparent' : C.BG_CARD,
        border: `1px solid ${disabled ? 'rgba(166,131,77,0.25)' : C.BORDER}`,
        boxShadow: disabled ? 'none' : 'inset 0 1px 3px rgba(0,0,0,0.06)',
        opacity: disabled ? 0.55 : 1,
      }}
    >
      <span className="font-nunito font-black text-[0.75rem]" style={{ color: disabled ? C.TEXT_MUTED : C.TEXT_PRIMARY, width: '35%' }}>
        {label}
      </span>

      <div className="flex items-center gap-1.5">
        {/* − */}
        <button
          className="w-7 h-7 rounded flex items-center justify-center font-black text-base border-none cursor-pointer transition-all"
          style={{ background: C.BG_SECONDARY, border: `1px solid ${C.BORDER}`, color: C.TEXT_PRIMARY }}
          disabled={disabled}
          onClick={() => onChange(dataKey, 'm', Math.max(0, p.m - 1))}
        >−</button>

        {/* Multiplicador */}
        <span className="font-nunito font-black text-[0.9rem] text-center" style={{ color: C.ACCENT_DEEP, minWidth: 24 }}>
          {p.m}
        </span>

        {/* + */}
        <button
          className="w-7 h-7 rounded flex items-center justify-center font-black text-base border-none cursor-pointer transition-all"
          style={{ background: C.BG_SECONDARY, border: `1px solid ${C.BORDER}`, color: C.TEXT_PRIMARY }}
          disabled={disabled}
          onClick={() => onChange(dataKey, 'm', p.m + 1)}
        >+</button>

        <span className="font-nunito font-bold text-sm mx-0.5" style={{ color: C.TEXT_SECONDARY }}>×</span>

        {/* Select base */}
        <select
          className="tw-select-sm"
          value={p.b}
          disabled={disabled}
          onChange={e => onChange(dataKey, 'b', parseInt(e.target.value))}
        >
          {LISTA_QTDS.map(v => (
            <option key={v} value={v}>{fmtN(v)}</option>
          ))}
        </select>
      </div>
    </div>
  );
};

export default RewardRow;
