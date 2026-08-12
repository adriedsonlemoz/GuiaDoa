import React from 'react';
import { C } from '../../theme.js';
import { useI18n } from '../../hooks/useI18n.jsx';
import { formatNumber, formatSufixo } from './niveisUtils.js';

export default function NiveisPowerPanel(props) {
  const { t, locale } = useI18n();
  const {
    inputRef, poderAntigoText, poderAtualText, handleInputAntigo, handleInputPower,
    diferencaPoder, isPositivo, isDirty, handleSave, proximaMeta, proximoMarco,
    atingiuMax, faltamParaMeta, faltamParaMarco, carregando, totalNiveis,
  } = props;
  const stats = [
    { label: t('levels.next_level'), value: proximaMeta ? `${t('common.level')} ${proximaMeta[0]}` : atingiuMax ? 'MAX' : '—', sub: proximaMeta && poderAtualText ? formatNumber(faltamParaMeta, locale) : null, color: C.ACCENT_DEEP },
    { label: t('levels.milestone'), value: proximoMarco ? `${t('common.level')} ${proximoMarco[0]}` : atingiuMax ? 'MAX' : '—', sub: proximoMarco && poderAtualText ? formatNumber(faltamParaMarco, locale) : null, color: C.POWER },
    { label: t('levels.total_levels'), value: carregando ? '…' : String(totalNiveis), sub: null, color: C.BLUE },
  ];
  return (
    <div className="flex gap-2 mb-3">
      <div className="tw-card flex-1 p-3">
        <p className="font-nunito font-bold text-[0.62rem] tracking-widest uppercase m-0 mb-1.5" style={{ color: C.TEXT_MUTED }}>{t('levels.previous_power')}</p>
        <input className="tw-input text-center font-mono mb-3" placeholder="500,000" value={poderAntigoText} onChange={handleInputAntigo} inputMode="numeric" />
        <div className="gold-stripe mb-3 opacity-30" />
        <div className="flex items-center justify-between mb-1.5">
          <p className="font-nunito font-bold text-[0.62rem] tracking-widest uppercase m-0" style={{ color: C.ACCENT_DEEP }}>{t('levels.current_power')}</p>
          {diferencaPoder !== 0 && poderAntigoText && poderAtualText && (
            <span className="font-nunito font-black text-[0.65rem] px-1.5 py-0.5 rounded" style={{ color: isPositivo ? C.SUCCESS : C.ERROR, background: isPositivo ? `${C.SUCCESS}18` : `${C.ERROR}18`, border: `1px solid ${isPositivo ? C.SUCCESS : C.ERROR}` }}>
              {isPositivo ? '📈 +' : '📉 '}{formatSufixo(diferencaPoder, locale)}
            </span>
          )}
        </div>
        <div className="flex gap-1.5">
          <input ref={inputRef} className="tw-input text-center font-mono flex-1" placeholder={t('levels.power_placeholder')} value={poderAtualText} onChange={handleInputPower} inputMode="numeric" />
          <button className={isDirty ? 'btn-success btn-sm shrink-0' : 'btn-ghost btn-sm shrink-0'} onClick={handleSave} disabled={!isDirty}>{t('common.save')}</button>
        </div>
        {isDirty && <p className="font-nunito font-bold text-[0.65rem] mt-1.5 m-0" style={{ color: C.WARNING }}>{t('levels.unsaved')}</p>}
      </div>
      <div className="flex flex-col gap-1.5" style={{ minWidth: 92 }}>
        {stats.map(stat => (
          <div key={stat.label} className="tw-card flex-1 flex flex-col items-center justify-center text-center py-2 px-1.5">
            <p className="font-nunito font-bold text-[0.58rem] uppercase tracking-wide m-0 mb-0.5 leading-tight" style={{ color: C.TEXT_MUTED }}>{stat.label}</p>
            <p className="font-nunito font-black text-sm leading-none m-0" style={{ color: stat.color }}>{stat.value}</p>
            {stat.sub && <p className="font-nunito font-semibold text-[0.58rem] leading-tight m-0 mt-0.5" style={{ color: C.TEXT_FAINT }}>-{stat.sub}</p>}
          </div>
        ))}
      </div>
    </div>
  );
}
