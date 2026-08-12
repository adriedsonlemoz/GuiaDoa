import React from 'react';
import { C } from '../../theme.js';
import { useI18n } from '../../hooks/useI18n.jsx';
import GameHeader from '../shared/GameHeader.jsx';
import { EXPANSIVEIS, ILHA_META, LIMITES } from './constants.js';
import { ISLAND_KEY } from './islandLabels.js';

export function IlhasHeader({ isEditing, onEdit, onRequestAction }) {
  const { t } = useI18n();
  return (
    <div className="tw-card mb-2">
      <GameHeader title={t('islands.management_title')} />
      <div className="flex items-center justify-between px-3 py-2" style={{ background: C.BG_SECONDARY, borderTop: `1px solid ${C.BORDER_SOFT}` }}>
        <div className="flex items-center gap-2.5">
          <span className="text-2xl leading-none">🏝️</span>
          <div>
            <p className="font-nunito font-black text-[0.55rem] uppercase tracking-widest m-0" style={{ color: C.TEXT_MUTED }}>{t('common.status')}</p>
            <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded"
              style={{ background: isEditing ? 'rgba(200,122,44,0.12)' : 'rgba(90,138,92,0.12)', border: `1px solid ${isEditing ? C.WARNING : C.SUCCESS}` }}>
              <span className="w-1.5 h-1.5 rounded-full shrink-0"
                style={{ background: isEditing ? C.WARNING : C.SUCCESS, boxShadow: `0 0 4px ${isEditing ? C.WARNING : C.SUCCESS}` }} />
              <span className="font-nunito font-black text-[0.65rem]" style={{ color: isEditing ? C.WARNING : C.SUCCESS }}>
                {isEditing ? t('islands.status_editing') : t('islands.status_locked')}
              </span>
            </div>
          </div>
        </div>
        <div className="flex gap-1.5">
          {isEditing
            ? <button className="btn-navy btn-sm" onClick={() => onRequestAction('save')}>{t('islands.lock')}</button>
            : <button className="btn-ghost btn-sm" onClick={onEdit}>✏ {t('common.edit')}</button>}
          <button className="btn-danger btn-sm" onClick={() => onRequestAction('clear')} title={t('common.delete')}>🗑</button>
        </div>
      </div>
    </div>
  );
}

export function IlhasExpansoes({ expansoes, isEditing, onToggle }) {
  const { t } = useI18n();
  return (
    <div className="tw-card mb-2 p-3">
      <p className="font-nunito font-black text-[0.72rem] uppercase tracking-widest mb-2 m-0" style={{ color: C.TEXT_MUTED }}>{t('islands.expansions')}</p>
      <div className="flex gap-2 overflow-x-auto pb-0.5" style={{ scrollbarWidth: 'none' }}>
        {EXPANSIVEIS.map(ilha => {
          const meta = ILHA_META[ilha];
          const ativo = expansoes[ilha];
          const islandName = t(ISLAND_KEY[ilha]);
          return (
            <button key={ilha} type="button"
              className="shrink-0 flex items-center gap-2 px-3 py-1.5 rounded-lg cursor-pointer transition-all text-left"
              style={{
                border: `1.5px solid ${ativo ? meta.color : C.BORDER_SOFT}`,
                background: ativo ? meta.lightBg : C.BG_SECONDARY,
                opacity: isEditing ? 1 : 0.75,
                boxShadow: ativo ? `0 0 8px ${meta.color}30` : 'none',
              }}
              onClick={() => onToggle(ilha)} disabled={!isEditing}
            >
              <span className="text-lg leading-none">{meta.icon}</span>
              <span>
                <span className="block font-nunito font-black text-[0.68rem] m-0 leading-tight" style={{ color: ativo ? meta.color : C.TEXT_MUTED }}>
                  {t('islands.island_of', { name: islandName })}
                </span>
                <span className="block font-nunito font-bold text-[0.62rem] m-0" style={{ color: ativo ? meta.color : C.TEXT_FAINT }}>
                  {ativo ? t('islands.unlocked') : t('islands.locked')}
                </span>
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function IlhasLimites({ metricas }) {
  const { t } = useI18n();
  const cards = [
    { label: t('islands.limit.main_city'), val: metricas.cidPrinc, max: LIMITES.cidadePrincipal, icon: '🏙' },
    { label: t('islands.limit.main_field'), val: metricas.sitPrinc, max: metricas.limiteSipioPrinc, icon: '🌾' },
    { label: t('islands.limit.water_city'), val: metricas.cidAgua, max: LIMITES.cidadeAgua, icon: '🌊' },
    { label: t('islands.limit.water_field'), val: metricas.sitAgua, max: LIMITES.sitioAgua, icon: '🔮' },
  ];
  return (
    <div className="flex flex-wrap gap-1.5 mb-2">
      {cards.map(({ label, val, max, icon }) => {
        const cheio = val >= max;
        return (
          <div key={label} className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg"
            style={{ background: cheio ? 'rgba(200,122,44,0.08)' : C.BG_CARD, border: `1px solid ${cheio ? C.WARNING : C.BORDER_SOFT}` }}>
            <span className="text-sm leading-none">{icon}</span>
            <div>
              <p className="font-nunito font-black text-[0.52rem] uppercase tracking-wide m-0 leading-none" style={{ color: C.TEXT_MUTED }}>{label}</p>
              <p className="font-mono font-black text-[0.75rem] leading-tight m-0" style={{ color: cheio ? C.WARNING : C.TEXT_PRIMARY }}>
                {val}/{max}{cheio && <span className="text-[0.6rem] ml-1">{t('islands.full')}</span>}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
