import React from 'react';
import { C } from '../../theme.js';
import { useI18n } from '../../hooks/useI18n.jsx';
import { getIcone } from './tropaUtils.js';
import useUnlockProgress from './useUnlockProgress.js';

function LevelInput({ icon, label, value, onChange }) {
  return <label style={{ display:'grid', gridTemplateColumns:'auto 1fr 58px', alignItems:'center', gap:7, padding:'6px 8px', borderRadius:9, background:C.BG_CARD, border:`1px solid ${C.BORDER_SOFT}` }}>
    <span>{icon}</span><span className="font-nunito font-bold" style={{ fontSize:'.63rem', color:C.TEXT_SECONDARY }}>{label}</span>
    <input className="tw-input" inputMode="numeric" type="number" min="0" max="99" value={value} onChange={e=>onChange(e.target.value)} style={{ padding:'4px 5px', textAlign:'center', minWidth:0 }} />
  </label>;
}

export default function UnlockProgressPanel({ troops, onOpen }) {
  const { t, content } = useI18n();
  const { levels, setLevel, known, available, next } = useUnlockProgress(troops);
  if (!known.length) return null;

  return <section style={{ border:`1px solid ${C.BORDER_SOFT}`, background:'linear-gradient(145deg,rgba(200,168,74,.08),rgba(248,242,224,.5))', borderRadius:12, padding:10 }}>
    <div className="font-cinzel font-bold" style={{ fontSize:'.7rem', color:C.TEXT_PRIMARY }}>🎯 {t('troops.unlock_progress')}</div>
    <p className="font-nunito" style={{ margin:'3px 0 8px', fontSize:'.56rem', color:C.TEXT_FAINT, lineHeight:1.4 }}>{t('troops.unlock_progress_desc')}</p>
    <div style={{ display:'grid', gridTemplateColumns:'repeat(2,minmax(0,1fr))', gap:6 }}>
      <LevelInput icon="🏭" label={t('troops.factory')} value={levels.fabrica} onChange={v=>setLevel('fabrica',v)} />
      <LevelInput icon="🥚" label={t('troops.nursery')} value={levels.viveiro} onChange={v=>setLevel('viveiro',v)} />
    </div>
    <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:6, marginTop:7 }}>
      <div style={{ borderRadius:9, padding:'7px 8px', background:'rgba(58,126,88,.08)', border:'1px solid rgba(58,126,88,.18)' }}>
        <div className="font-nunito font-black" style={{ fontSize:'.9rem', color:'#3a7e58' }}>{available.length}</div>
        <div className="font-nunito font-bold" style={{ fontSize:'.54rem', color:C.TEXT_MUTED }}>{t('troops.unlocked_by_progress')}</div>
      </div>
      <div style={{ borderRadius:9, padding:'7px 8px', background:'rgba(184,150,90,.08)', border:'1px solid rgba(184,150,90,.2)' }}>
        <div className="font-nunito font-black" style={{ fontSize:'.9rem', color:'#8a671f' }}>{next.length}</div>
        <div className="font-nunito font-bold" style={{ fontSize:'.54rem', color:C.TEXT_MUTED }}>{t('troops.next_unlocks')}</div>
      </div>
    </div>
    {next.length > 0 && <div style={{ display:'flex', gap:6, overflowX:'auto', scrollbarWidth:'none', marginTop:7 }}>
      {next.slice(0,4).map(({troop,required}) => <button key={troop._id||troop.nome} onClick={()=>onOpen(troop)} style={{ minWidth:132, textAlign:'left', borderRadius:9, padding:'7px 8px', border:`1px solid ${C.BORDER_SOFT}`, background:C.BG_CARD, cursor:'pointer' }}>
        <div className="font-nunito font-bold" style={{ fontSize:'.61rem', color:C.TEXT_PRIMARY, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{getIcone(troop.nome)} {content(troop,'nome')}</div>
        <div className="font-nunito" style={{ fontSize:'.53rem', color:'#7a5a1f', marginTop:3 }}>{content({ desbloqueioFonte:troop.desbloqueio.fonte, i18n:troop.i18n },'desbloqueioFonte') || troop.desbloqueio.fonte} · {t('common.level_short')} {required}</div>
      </button>)}
    </div>}
  </section>;
}
