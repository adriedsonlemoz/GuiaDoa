import React from 'react';
import { C } from '../../../theme.js';
import GameHeader from '../../shared/GameHeader.jsx';
import { fmt, fmtFull, getIcone } from '../tropaUtils.js';
import { useI18n } from '../../../hooks/useI18n.jsx';

export default function MarchaPanel({ esquadroes, calcMarcha, onAdd, onQtd, onRemove }) {
  const { t, content, locale } = useI18n();
  return (
    <div>
      <div className="tw-card mb-2.5"><GameHeader title={t('troops.march_formation')} fontSize="0.82rem" /><div className="p-3 flex flex-col gap-2">
        {esquadroes.length === 0 && <div className="py-6 text-center opacity-50"><p className="font-nunito text-[0.72rem] tracking-widest m-0" style={{ color: C.TEXT_SECONDARY }}>{t('troops.no_units_added')}</p></div>}
        {esquadroes.map((esq, index) => (
          <div key={`${esq.tropa.nome}-${index}`} className="flex items-center gap-2 px-2.5 py-2 rounded-lg" style={{ border: `1px solid ${C.BORDER_SOFT}`, borderLeft: `3px solid ${C.BORDER}`, background: C.BG_CARD }}>
            <span className="text-2xl leading-none shrink-0 w-7 text-center">{getIcone(esq.tropa.nome)}</span>
            <span className="font-nunito font-black text-[0.78rem] flex-1 min-w-0 truncate" style={{ color: C.ACCENT }}>{content(esq.tropa, 'nome')}</span>
            <input className="tw-input text-center font-nunito font-black" style={{ width: 72, padding: '4px 8px', fontSize: '0.75rem' }} placeholder={t('common.quantity')} value={esq.qtd ? esq.qtd.toLocaleString(locale) : ''} onChange={event => onQtd(index, event.target.value)} inputMode="numeric" />
            <button className="shrink-0 w-7 h-7 rounded flex items-center justify-center text-sm transition-all cursor-pointer" style={{ color: C.ERROR, border: `1px solid ${C.ERROR}33`, background: 'transparent' }} onClick={() => onRemove(index, esq.tropa)}>✕</button>
          </div>
        ))}
        <button className="font-nunito font-black text-xs py-2 rounded-lg transition-all cursor-pointer mt-1" style={{ border: `1.5px dashed ${C.BORDER}`, background: 'transparent', color: C.TEXT_MUTED }} onClick={onAdd}>＋ {t('troops.add_unit')}</button>
      </div></div>
      <div className="tw-card overflow-hidden"><GameHeader title={t('troops.report')} fontSize="0.82rem" /><div className="grid grid-cols-2">
        {[
          { label: t('troops.title'), value: fmt(calcMarcha.tropas), color: C.ACCENT, border: C.ACCENT_HOVER },
          { label: t('common.power'), value: fmt(calcMarcha.poder), color: C.POWER, border: C.POWER },
          { label: t('troops.loot'), value: fmt(calcMarcha.carga), color: C.ACCENT_HOVER, border: C.ACCENT_HOVER },
          { label: t('troops.base_speed'), value: fmtFull(calcMarcha.velocidade, locale), color: C.BLUE, border: C.BLUE },
        ].map(({ label, value, color, border }, index) => (
          <div key={label} className="py-3 px-2 text-center" style={{ borderBottom: `3px solid ${border}`, borderRight: index % 2 === 0 ? `1px solid ${C.BORDER_SOFT}` : 'none', borderTop: index >= 2 ? `1px solid ${C.BORDER_SOFT}` : 'none' }}><p className="font-nunito font-bold text-[0.72rem] tracking-widest mb-1 m-0" style={{ color: C.TEXT_SECONDARY }}>{label.toUpperCase()}</p><p className="font-nunito font-black text-lg leading-none m-0" style={{ color }}>{value}</p></div>
        ))}
      </div></div>
    </div>
  );
}
