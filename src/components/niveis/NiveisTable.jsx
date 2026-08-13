import React, { useMemo } from 'react';
import { useI18n } from '../../hooks/useI18n.jsx';
import { formatNumber } from './niveisUtils.js';

export default function NiveisTable({ carregando, todosNiveis, currentPowerNum, nivelConfirmado, nivelPossivelMax, proximaMeta, verTodos, setVerTodos }) {
  const { t, locale } = useI18n();
  const rows = useMemo(() => {
    if (verTodos) return todosNiveis;
    if (!todosNiveis.length) return [];
    if (!currentPowerNum) return todosNiveis.slice(0, 8);
    const start = Math.max(1, (nivelConfirmado || 1) - 2);
    const next = proximaMeta?.[0] || nivelPossivelMax || nivelConfirmado || 1;
    const end = Math.min(todosNiveis.at(-1)?.[0] || next + 5, Math.max((nivelConfirmado || 1) + 5, next + 2));
    return todosNiveis.filter(([nivel]) => nivel >= start && nivel <= end);
  }, [todosNiveis, verTodos, currentPowerNum, nivelConfirmado, nivelPossivelMax, proximaMeta]);

  return (
    <section className="game-panel">
      <div className="game-section-title"><span>{t('levels.table')}</span><button type="button" onClick={()=>setVerTodos(v=>!v)} style={{ border:0, background:'transparent', color:'#f1cf67', fontWeight:800, cursor:'pointer' }}>{t(verTodos ? 'levels.show_nearby' : 'levels.show_all')}</button></div>
      {carregando ? <div style={{ padding:24, textAlign:'center' }}>{t('levels.loading')}</div> : (
        <div style={{ overflowX:'auto' }}>
          <table className="w-full text-left">
            <thead><tr><th className="tw-th text-center">{t('common.level')}</th><th className="tw-th text-center">{t('levels.required_power')}</th><th className="tw-th text-center">{t('common.status')}</th></tr></thead>
            <tbody>{rows.map(([nivel,poder]) => {
              const unknown = poder == null;
              const confirmed = currentPowerNum > 0 && nivel === nivelConfirmado;
              const possible = currentPowerNum > 0 && unknown && nivel > nivelConfirmado && nivel <= nivelPossivelMax;
              const nextKnown = proximaMeta?.[0] === nivel;
              const done = currentPowerNum > 0 && nivel < nivelConfirmado;
              const status = confirmed ? 'levels.status_confirmed' : possible ? 'levels.status_possible' : nextKnown ? 'levels.status_next_known' : done ? 'levels.status_done' : unknown ? 'levels.status_unknown' : 'levels.status_pending';
              return <tr key={nivel} style={{ background:confirmed?'rgba(54,91,87,.11)':possible?'rgba(157,128,65,.09)':nextKnown?'rgba(63,108,102,.07)':undefined }}>
                <td className="tw-td text-center" style={{ fontWeight:900, color:confirmed?'#2d5550':'#343b35' }}>Nv.{nivel}</td>
                <td className="tw-td text-center" style={{ fontVariantNumeric:'tabular-nums', color:unknown?'#8a806b':'#444c44' }}>{unknown?t('levels.unknown'):formatNumber(poder, locale)}</td>
                <td className="tw-td text-center"><span className="game-badge" style={{ margin:0 }}>{t(status)}</span></td>
              </tr>;
            })}</tbody>
          </table>
        </div>
      )}
    </section>
  );
}
