import React, { useMemo, useState } from 'react';
import { C } from '../../theme.js';
import { useI18n } from '../../hooks/useI18n.jsx';
import { useGameData } from '../../data/GameDataContext.jsx';

const fmt=(n,locale)=>Number(n||0).toLocaleString(locale);
const row=()=>({id:Date.now()+Math.random(),tropa:'',qtd:''});

export default function TorneioMatarTropas(){
  const { t,content,locale }=useI18n(); const { tropas=[] }=useGameData();
  const sorted=useMemo(()=>[...tropas].filter(x=>Number(x.poder)>0).sort((a,b)=>content(a,'nome').localeCompare(content(b,'nome'))),[tropas,content]);
  const [rows,setRows]=useState([row(),row()]);
  const total=rows.reduce((sum,r)=>{const tr=sorted.find(x=>x.slug===r.tropa||x.nome===r.tropa);return sum+(parseInt(String(r.qtd).replace(/\D/g,''))||0)*Number(tr?.poder||0);},0);
  const update=(id,k,v)=>setRows(all=>all.map(r=>r.id===id?{...r,[k]:v}:r));
  return <div className="max-w-md mx-auto pb-4" style={{animation:'reveal-up .4s ease both'}}>
    <div className="rounded-xl overflow-hidden mb-3" style={{border:`1.5px solid ${C.BORDER}`}}><div className="px-4 py-3" style={{background:'linear-gradient(135deg,#2A0A0A,#5A1A1A)'}}><p className="font-nunito font-bold text-[0.72rem] uppercase m-0" style={{color:'rgba(255,210,200,.7)'}}>{t('torneio.matar_tropas.badge')}</p><p className="font-nunito font-black m-0 mt-1" style={{fontSize:'1.15rem',color:'#F0A090'}}>☠️ {t('torneio.titulo.matar_tropas')}</p></div><div className="px-4 py-3" style={{background:C.BG_CARD}}><p className="m-0 font-nunito font-semibold text-[0.78rem]" style={{color:C.TEXT_SECONDARY}}>{t('torneio.matar_tropas.calc_help')}</p></div></div>
    <div className="rounded-xl overflow-hidden mb-3" style={{border:`1px solid ${C.BORDER_SOFT}`,background:C.BG_CARD}}><div className="px-4 py-3" style={{background:C.NAVY,color:'#fff'}}><small className="font-nunito font-bold uppercase">{t('torneio.aceleracoes.total_pontos')}</small><strong className="block font-nunito font-black text-3xl">{fmt(total,locale)}</strong></div><div className="p-3 grid gap-2">{rows.map((r,i)=>{const tr=sorted.find(x=>x.slug===r.tropa||x.nome===r.tropa);const pts=(parseInt(String(r.qtd).replace(/\D/g,''))||0)*Number(tr?.poder||0);return <div className="tournament-kill-row" key={r.id}><select className="tw-input" value={r.tropa} onChange={e=>update(r.id,'tropa',e.target.value)}><option value="">{t('torneio.matar_tropas.select_troop')}</option>{sorted.map(x=><option key={x.slug||x.nome} value={x.slug||x.nome}>{content(x,'nome')} · ⭐ {x.poder}</option>)}</select><input className="tw-input" inputMode="numeric" placeholder={t('torneio.matar_tropas.eliminated_qty')} value={r.qtd} onChange={e=>update(r.id,'qtd',e.target.value.replace(/\D/g,''))}/><div><small>{tr?`${fmt(tr.poder,locale)} × ${fmt(parseInt(r.qtd)||0,locale)}`:'—'}</small><strong>{fmt(pts,locale)} pts</strong></div>{rows.length>1?<button className="btn-ghost btn-sm" onClick={()=>setRows(x=>x.filter(y=>y.id!==r.id))}>×</button>:null}</div>})}<button className="btn-ghost btn-sm" onClick={()=>setRows(x=>[...x,row()])}>＋ {t('torneio.matar_tropas.add_troop')}</button></div></div>
    <div className="rounded-xl p-3" style={{border:`1px solid ${C.BORDER_SOFT}`,background:C.BG_CARD}}><strong className="font-nunito text-sm">{t('torneio.label.como_funciona')}</strong><p className="font-nunito text-[0.76rem] leading-relaxed" style={{color:C.TEXT_SECONDARY}}>{t('torneio.matar_tropas.formula')}</p><p className="font-nunito text-[0.72rem]" style={{color:C.TEXT_MUTED}}>{t('torneio.matar_tropas.examples')}</p></div>
  </div>;
}
