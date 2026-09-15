import React from 'react';
import { useI18n } from '../../hooks/useI18n.jsx';
import { formatNumber, formatSufixo } from './niveisUtils.js';

export default function NiveisPowerPanel({ inputRef, poderAtualText, handleInputPower, isDirty, handleSave, diferencaPoder, savedPower, metasConhecidas, metaNivel, handleMeta, meta }) {
  const { t, locale } = useI18n();
  return (
    <section className="game-panel" style={{ marginBottom:10 }}>
      <div className="game-section-title">{t('levels.update_power')}</div>
      <div style={{ padding:12, display:'grid', gap:12 }}>
        <div>
          <label className="game-filter-label" htmlFor="level-power">{t('levels.current_power')}</label>
          <div style={{ display:'flex', gap:7, marginTop:5 }}>
            <input id="level-power" ref={inputRef} className="game-field" inputMode="numeric" value={poderAtualText} onChange={handleInputPower} placeholder={t('levels.power_placeholder')} />
            <button type="button" className="game-action game-action-green" style={{ minHeight:38, padding:'7px 14px' }} disabled={!isDirty} onClick={handleSave}>{t('common.save')}</button>
          </div>
          {savedPower > 0 && diferencaPoder !== 0 ? (
            <div className="game-badge" style={{ marginTop:7 }}>
              {diferencaPoder > 0 ? '▲' : '▼'} {formatSufixo(Math.abs(diferencaPoder), locale)} {t(diferencaPoder > 0 ? 'levels.since_last_gain' : 'levels.since_last_loss')}
            </div>
          ) : savedPower > 0 ? <p className="game-list-copy" style={{ marginTop:6 }}>{t('levels.last_saved', { amount:formatNumber(savedPower, locale) })}</p> : null}
        </div>

        <div style={{ borderTop:'1px solid rgba(121,96,53,.25)', paddingTop:10 }}>
          <label className="game-filter-label" htmlFor="level-goal">{t('levels.goal')}</label>
          <select id="level-goal" className="game-field" value={metaNivel || ''} onChange={handleMeta} style={{ marginTop:5 }}>
            {metasConhecidas.map(([nivel,poder]) => <option key={nivel} value={nivel}>Nv.{nivel} · {formatNumber(poder, locale)}</option>)}
          </select>
          <div className="game-info-table" style={{ marginTop:8 }}>
            <div className="game-info-table-row"><span>{t('levels.goal_power')}</span><strong>{formatNumber(meta.poder, locale)}</strong></div>
            <div className="game-info-table-row"><span>{meta.atingida ? t('levels.goal_status') : t('levels.goal_remaining')}</span><strong>{meta.atingida ? `✓ ${t('levels.goal_reached')}` : formatNumber(meta.faltam, locale)}</strong></div>
          </div>
        </div>
      </div>
    </section>
  );
}
