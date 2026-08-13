import React from 'react';
import { getIcone, getTipoAtaque, fmtFull } from '../tropaUtils.js';
import { useI18n } from '../../../hooks/useI18n.jsx';

export default function TropaSlot({ tropa, onSelecionar, onRemover, index, cor }) {
  const { t, content, locale } = useI18n();
  if (!tropa) {
    return (
      <button onClick={onSelecionar} style={{
        minWidth:0, padding:'12px 6px', borderRadius:4,
        border:'1px dashed #82907A', background:'rgba(236,229,199,.45)',
        cursor:'pointer', textAlign:'center', color:'#687064',
      }}>
        <div style={{ fontSize:'1.15rem', lineHeight:1 }}>＋</div>
        <div style={{ fontSize:'.58rem', fontWeight:750, marginTop:5 }}>{t('troops.slot',{number:index+1})}</div>
      </button>
    );
  }

  const tipo = getTipoAtaque(tropa, t);
  const nome = content(tropa, 'nome');
  return (
    <div style={{
      minWidth:0, padding:'8px 6px', borderRadius:4, border:`1px solid ${cor}`,
      background:'linear-gradient(180deg,rgba(240,232,204,.9),rgba(220,209,173,.9))', position:'relative',
      boxShadow:`inset 0 3px 0 ${cor}`,
    }}>
      <button onClick={onRemover} aria-label={`${t('common.delete')} ${nome}`} style={{
        position:'absolute', top:4, right:4, width:20, height:20, borderRadius:3,
        background:'rgba(181,35,25,.08)', border:'1px solid rgba(181,35,25,.22)', color:'#A83C2C',
        fontSize:'.58rem', cursor:'pointer', display:'grid', placeItems:'center',
      }}>✕</button>
      <div style={{ fontSize:'1.45rem', lineHeight:1, textAlign:'center', marginTop:3 }}>{getIcone(tropa.nome)}</div>
      <div style={{ marginTop:6, fontSize:'.63rem', fontWeight:780, color:'#2E342F', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', textAlign:'center', padding:'0 10px' }}>{nome}</div>
      <div style={{ marginTop:3, fontSize:'.52rem', fontWeight:700, color:tipo.color, textAlign:'center', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{tipo.label}</div>
      <div style={{ marginTop:7, textAlign:'center' }}>
        <strong style={{ display:'block', color:'#315B56', fontSize:'.82rem' }}>{tropa.poder ? fmtFull(tropa.poder, locale) : '—'}</strong>
        <span style={{ color:'#7B8377', fontSize:'.46rem', fontWeight:800, letterSpacing:'.05em' }}>{t('common.power').toUpperCase()}</span>
      </div>
    </div>
  );
}
