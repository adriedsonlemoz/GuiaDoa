import React from 'react';
import { C } from '../../theme.js';
import { useI18n } from '../../hooks/useI18n.jsx';
import GameHeader from '../shared/GameHeader.jsx';
import { FIXOS, ILHA_META, ILHAS_NOMES, TIPO_COR } from './constants.js';
import { FIXED_KEY, ISLAND_KEY, ROW_KEY } from './islandLabels.js';
import { isAllowed, limiteIlhaSecundaria } from './ilhasUtils.js';

export default function IlhasTabela({ data, expansoes, isEditing, onChange }) {
  const { t } = useI18n();
  return (
    <div className="tw-card mb-3 overflow-hidden" style={{ opacity: isEditing ? 1 : 0.87 }}>
      <GameHeader title={t('islands.distribution')} fontSize="0.82rem" />
      <div className="overflow-x-auto" style={{ scrollbarWidth: 'thin' }}>
        <table className="text-left" style={{ minWidth: 380, tableLayout: 'fixed', width: '100%' }}>
          <thead>
            <tr style={{ background: C.BG_SECONDARY }}>
              <th className="sticky left-0 z-10 py-2 px-2 font-nunito font-black text-[0.58rem] uppercase tracking-wider"
                style={{ width: '22%', minWidth: 82, color: C.TEXT_MUTED, background: C.BG_SECONDARY, borderBottom: `2px solid ${C.BORDER}`, borderRight: `1px solid ${C.BORDER_SOFT}` }}>
                {t('islands.building')}
              </th>
              {ILHAS_NOMES.map((ilha, idx) => {
                const meta = ILHA_META[ilha];
                const limite = limiteIlhaSecundaria(idx, expansoes);
                return (
                  <th key={ilha} align="center" className="py-2 px-1 text-center"
                    style={{ background: C.BG_SECONDARY, borderBottom: `2px solid ${C.BORDER}`, borderLeft: idx === 0 ? 'none' : `1px solid ${C.BORDER_SOFT}`, width: `${78 / 5}%` }}>
                    <p className="text-sm leading-none m-0">{meta.icon}</p>
                    <p className="font-nunito font-black text-[0.6rem] tracking-wide m-0" style={{ color: meta.color }}>{t(ISLAND_KEY[ilha])}</p>
                    {limite !== null && <p className="font-nunito text-[0.5rem] m-0" style={{ color: C.TEXT_FAINT }}>{t('islands.plots', { count: limite })}</p>}
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {data.map((row, rowIndex) => {
              const tipoCor = TIPO_COR[row.type];
              const isRecurso = Boolean(tipoCor);
              const rowBg = isRecurso ? tipoCor.bg : (rowIndex % 2 === 0 ? C.BG_CARD : C.BG_SECONDARY);
              return (
                <tr key={row.id} style={{ background: rowBg }}>
                  <td className="sticky left-0 z-0 font-nunito font-bold text-[0.78rem] py-1.5 px-2 whitespace-nowrap"
                    style={{ background: rowBg, color: isRecurso ? tipoCor.accent : C.TEXT_PRIMARY, borderBottom: `1px solid ${C.BORDER_SOFT}`, borderRight: `1px solid ${C.BORDER_SOFT}`, borderLeft: isRecurso ? `4px solid ${tipoCor.accent}` : '4px solid transparent' }}>
                    {isRecurso && <span className="mr-1">{tipoCor.label}</span>}{t(ROW_KEY[row.type])}
                  </td>
                  {row.values.map((value, colIndex) => (
                    <td key={colIndex} className="text-center p-1" style={{ borderBottom: `1px solid ${C.BORDER_SOFT}`, borderLeft: `1px solid ${C.BORDER_SOFT}` }}>
                      {isAllowed(row.type, colIndex) ? (
                        <input type="text" inputMode="numeric" value={value} disabled={!isEditing}
                          onChange={event => onChange(rowIndex, colIndex, event.target.value)}
                          style={{
                            width: '100%', minWidth: 28, maxWidth: 38,
                            background: isEditing ? C.BG_INPUT : 'transparent',
                            border: isEditing ? `1px solid ${isRecurso ? tipoCor.accent : C.BORDER}` : 'none',
                            color: isRecurso ? tipoCor.accent : C.TEXT_PRIMARY,
                            borderRadius: 4, padding: '4px 2px', textAlign: 'center',
                            outline: 'none', fontWeight: 700, fontFamily: 'monospace', fontSize: '0.82rem',
                          }}
                        />
                      ) : <span className="font-bold text-sm" style={{ color: C.TEXT_FAINT }}>—</span>}
                    </td>
                  ))}
                </tr>
              );
            })}
            {FIXOS.map((nome, index) => (
              <tr key={nome} style={{ background: C.BG_SECONDARY, opacity: 0.75 }}>
                <td className="sticky left-0 font-nunito font-bold italic text-[0.75rem] py-1.5 px-2"
                  style={{ background: C.BG_SECONDARY, color: C.TEXT_MUTED, borderBottom: index === FIXOS.length - 1 ? 'none' : `1px solid ${C.BORDER_SOFT}`, borderRight: `1px solid ${C.BORDER_SOFT}`, borderLeft: '4px solid transparent' }}>
                  {t(FIXED_KEY[nome])}
                </td>
                {ILHAS_NOMES.map((ilha, colIndex) => (
                  <td key={ilha} className="text-center p-1.5"
                    style={{ borderBottom: index === FIXOS.length - 1 ? 'none' : `1px solid ${C.BORDER_SOFT}`, borderLeft: `1px solid ${C.BORDER_SOFT}` }}>
                    <span className="font-mono font-black text-[0.78rem]" style={{ color: colIndex === 0 ? C.ACCENT : C.TEXT_FAINT }}>
                      {colIndex === 0 ? '1' : '—'}
                    </span>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
