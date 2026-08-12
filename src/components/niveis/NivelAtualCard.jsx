import React from 'react';
import { C } from '../../theme.js';
import { useI18n } from '../../hooks/useI18n.jsx';
import { formatNumber } from './niveisUtils.js';

const ProgressBar = ({ pct, color = C.ACCENT }) => (
  <div style={{ height: 6, borderRadius: 99, background: `${C.BORDER_SOFT}55`, overflow: 'hidden', border: `1px solid ${C.BORDER_SOFT}` }}>
    <div style={{ height: '100%', width: `${Math.min(pct, 100)}%`, background: `linear-gradient(90deg, ${color}99, ${color})`, borderRadius: 99, transition: 'width 0.5s ease' }} />
  </div>
);

export default function NivelAtualCard({ carregando, poderAtualText, nivelExato, maxNivel, progressoNivel, proximaMeta, faltamParaMeta, atingiuMax }) {
  const { t, locale } = useI18n();
  const pct = Math.min(progressoNivel, 100);
  return (
    <div className="tw-card mb-3 overflow-hidden" style={{ background: `linear-gradient(135deg, ${C.BG_HEADER} 0%, #0f2540 100%)`, border: `2px solid ${C.BORDER}` }}>
      <div className="flex items-center justify-between px-4 pt-4 pb-2">
        <div>
          <p className="font-nunito font-bold text-[0.6rem] uppercase tracking-widest m-0 mb-0.5" style={{ color: `${C.ACCENT}99` }}>{t('levels.current_level')}</p>
          {carregando
            ? <p className="font-cinzel font-bold text-4xl m-0" style={{ color: C.ACCENT }}>…</p>
            : <p className="font-cinzel font-bold text-5xl leading-none m-0" style={{ color: C.ACCENT }}>{poderAtualText ? (nivelExato > 0 ? nivelExato : '0') : '—'}</p>}
          {!carregando && nivelExato > 0 && <p className="font-nunito font-semibold text-xs m-0 mt-1" style={{ color: `${C.ACCENT}88` }}>{t('levels.of_levels', { count: maxNivel })}</p>}
        </div>
        <div className="relative flex items-center justify-center" style={{ width: 72, height: 72 }}>
          <svg width="72" height="72" style={{ transform: 'rotate(-90deg)' }}>
            <circle cx="36" cy="36" r="30" fill="none" stroke={`${C.ACCENT}22`} strokeWidth="6" />
            <circle cx="36" cy="36" r="30" fill="none" stroke={C.ACCENT} strokeWidth="6" strokeLinecap="round"
              strokeDasharray={`${2 * Math.PI * 30}`} strokeDashoffset={`${2 * Math.PI * 30 * (1 - pct / 100)}`} style={{ transition: 'stroke-dashoffset 0.6s ease' }} />
          </svg>
          <span className="absolute font-nunito font-black text-sm" style={{ color: C.ACCENT }}>{poderAtualText ? `${Math.round(pct)}%` : '—'}</span>
        </div>
      </div>
      {poderAtualText && !atingiuMax && (
        <div className="px-4 pb-3">
          <div className="flex justify-between mb-1">
            <span className="font-nunito font-semibold text-[0.6rem]" style={{ color: `${C.ACCENT}88` }}>{t('levels.level_label', { level: nivelExato })}</span>
            <span className="font-nunito font-semibold text-[0.6rem]" style={{ color: `${C.ACCENT}88` }}>{t('levels.level_label', { level: proximaMeta?.[0] ?? '—' })}</span>
          </div>
          <ProgressBar pct={progressoNivel} />
          <p className="font-nunito font-semibold text-[0.65rem] text-center mt-1 m-0" style={{ color: `${C.ACCENT}77` }}>
            {t('levels.remaining_to_level', { amount: formatNumber(faltamParaMeta, locale), level: proximaMeta?.[0] ?? '—' })}
          </p>
        </div>
      )}
      {poderAtualText && atingiuMax && <div className="px-4 pb-3 text-center"><p className="font-cinzel font-bold text-sm m-0" style={{ color: C.ACCENT }}>{t('levels.max_reached')}</p></div>}
    </div>
  );
}
