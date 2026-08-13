import React, { useMemo, useState } from 'react';
import { useI18n } from '../../../hooks/useI18n.jsx';
import { ATTRS_BASE, ATTRS_ELEM, fmtDragaoValor } from '../dragaoCompareConfig.js';

const zeroSnapshot = { nivel:0, ...Object.fromEntries([...ATTRS_BASE,...ATTRS_ELEM].map(a=>[a.key,0])) };

const DragaoComparacao = ({ ids, todosDragoes, onRemover }) => {
  const { t, content, locale } = useI18n();
  const dragoes = ids.map(id=>todosDragoes.find(d=>d.id===id)).filter(Boolean);
  const levels = useMemo(() => [...new Set([0, ...dragoes.flatMap(d => (d.niveis || []).map(n=>n.nivel))])].sort((a,b)=>a-b), [dragoes]);
  const [nivel, setNivel] = useState(0);
  if (dragoes.length !== 2) return null;
  const snap = d => nivel === 0 ? zeroSnapshot : (d.niveis || []).find(n=>n.nivel===nivel) || null;
  const rows = nivel >= 51 ? [...ATTRS_BASE,...ATTRS_ELEM] : ATTRS_BASE;
  return (
    <section className="game-panel" style={{ marginTop:8 }}>
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', borderBottom:'1px solid #b59d69' }}>
        {dragoes.map(d => <div key={d.id} style={{ padding:10, textAlign:'center', borderRight:d.id===dragoes[0].id?'1px solid #b59d69':0 }}><img src={d.imagem} alt="" style={{ width:72,height:68,objectFit:'cover',borderRadius:6,border:'1px solid #927a4c' }} /><div style={{ fontWeight:900, marginTop:4 }}>{content(d,'nome')}</div><button type="button" onClick={()=>onRemover(d.id)} className="game-action-button" style={{ marginTop:6, padding:'4px 8px' }}>{t('dragons.remove_compare')}</button></div>)}
      </div>
      <div style={{ padding:'10px 12px', display:'flex', gap:5, overflowX:'auto' }}>{levels.map(l => <button type="button" key={l} className={`game-tab ${nivel===l?'is-active':''}`} onClick={()=>setNivel(l)}>Nv.{l}</button>)}</div>
      <div className="game-info-table" style={{ margin:'0 12px 12px' }}>
        {rows.map(a => {
          const vals = dragoes.map(d => snap(d)?.[a.key]);
          const nums = vals.filter(v => v != null).map(Number);
          const best = nums.length ? Math.max(...nums) : null;
          return <div className="game-info-table-row" key={a.key} style={{ display:'grid', gridTemplateColumns:'1.25fr .9fr .9fr', gap:8 }}><span>{a.icon} {t(a.labelKey)}</span>{dragoes.map((d,i) => <strong key={d.id} style={{ textAlign:'right', color:vals[i] != null && Number(vals[i]) === best && best > 0 ? (d.cor || '#315b56') : undefined }}>{vals[i] == null ? '—' : fmtDragaoValor(vals[i], locale)}</strong>)}</div>;
        })}
      </div>
      {nivel >= 51 ? <p className="game-list-copy" style={{ margin:'0 12px 12px' }}>{t('dragons.elemental_from_51')}</p> : null}
    </section>
  );
};
export default DragaoComparacao;
