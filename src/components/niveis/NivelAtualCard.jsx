import React from 'react';
import { useI18n } from '../../hooks/useI18n.jsx';
import { formatNumber } from './niveisUtils.js';

export default function NivelAtualCard({ carregando, poderAtualText, nivelConfirmado, nivelPossivelMax, temLacuna, progressoNivel, proximaMeta, faltamParaMeta, atingiuMax }) {
  const { t, locale } = useI18n();
  if (carregando) return <div className="game-panel" style={{ padding:24, textAlign:'center' }}>{t('levels.loading')}</div>;

  return (
    <section className="game-panel" style={{ marginBottom:10 }}>
      <div className="game-section-title"><span>{t('levels.progress_summary')}</span><span className="game-section-title-aside">{poderAtualText || '—'}</span></div>
      <div style={{ padding:'14px 14px 12px' }}>
        {!poderAtualText ? (
          <p className="game-list-copy" style={{ margin:0, textAlign:'center' }}>{t('levels.enter_power_help')}</p>
        ) : (
          <>
            <div style={{ display:'flex', justifyContent:'space-between', gap:12, alignItems:'flex-end' }}>
              <div>
                <div style={{ fontSize:'.74rem', fontWeight:800, color:'#667064', textTransform:'uppercase', letterSpacing:'.04em' }}>{t('levels.confirmed_level')}</div>
                <div style={{ fontSize:'2rem', lineHeight:1, fontWeight:900, color:'#294b47', marginTop:3 }}>Nv.{nivelConfirmado || 0}</div>
                {temLacuna ? <div style={{ fontSize:'.76rem', color:'#765f34', marginTop:5, fontWeight:700 }}>{t('levels.possible_until', { level:nivelPossivelMax })}</div> : null}
              </div>
              {proximaMeta ? (
                <div style={{ textAlign:'right' }}>
                  <div style={{ fontSize:'.74rem', fontWeight:800, color:'#667064', textTransform:'uppercase' }}>{t('levels.next_known')}</div>
                  <div style={{ fontSize:'1.15rem', fontWeight:900, color:'#425f57' }}>Nv.{proximaMeta[0]}</div>
                  <div style={{ fontSize:'.76rem', color:'#5d655b', marginTop:2 }}>{t('levels.remaining_short', { amount:formatNumber(faltamParaMeta, locale) })}</div>
                </div>
              ) : null}
            </div>
            {!atingiuMax && proximaMeta ? (
              <div style={{ marginTop:12 }}>
                <div style={{ height:8, overflow:'hidden', background:'rgba(92,102,83,.18)', border:'1px solid rgba(106,91,55,.32)', borderRadius:2 }}>
                  <div style={{ height:'100%', width:`${Math.max(0,Math.min(100,progressoNivel))}%`, background:'linear-gradient(90deg,#496f69,#2f5a55)' }} />
                </div>
                <div style={{ display:'flex', justifyContent:'space-between', marginTop:4, color:'#697166', fontSize:'.74rem', fontWeight:700 }}>
                  <span>Nv.{nivelConfirmado || 0}</span><span>{Math.round(progressoNivel)}%</span><span>Nv.{proximaMeta[0]}</span>
                </div>
                {temLacuna ? <p className="game-list-copy" style={{ marginTop:8 }}>{t('levels.unknown_gap_help')}</p> : null}
              </div>
            ) : null}
            {atingiuMax ? <div className="game-badge" style={{ marginTop:10 }}>{t('levels.max_reached')}</div> : null}
          </>
        )}
      </div>
    </section>
  );
}
