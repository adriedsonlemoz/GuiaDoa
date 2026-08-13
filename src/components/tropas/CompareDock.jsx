import React from 'react';
import { C } from '../../theme.js';
import { useI18n } from '../../hooks/useI18n.jsx';
import { getIcone } from './tropaUtils.js';

export default function CompareDock({ selected, onClear, onCompare }) {
  const { t, content } = useI18n();
  if (!selected.length) return null;
  return (
    <div style={{ position:'sticky', bottom:8, zIndex:20, marginTop:10, background:'rgba(28,58,94,.97)', border:'1px solid rgba(200,168,74,.5)', borderRadius:13, padding:'8px 9px', boxShadow:'0 8px 28px rgba(20,30,45,.28)', backdropFilter:'blur(8px)' }}>
      <div style={{ display:'flex', alignItems:'center', gap:7 }}>
        <div style={{ display:'flex', gap:4, flex:1, minWidth:0 }}>
          {selected.map(troop => <div key={troop.nome} title={content(troop,'nome')} style={{ width:31, height:31, borderRadius:8, display:'grid', placeItems:'center', background:'rgba(248,242,224,.09)', border:'1px solid rgba(248,242,224,.14)', fontSize:'1rem' }}>{getIcone(troop.nome)}</div>)}
          <div className="font-nunito" style={{ paddingLeft:4, alignSelf:'center', color:'rgba(248,242,224,.75)', fontSize:'.58rem' }}>{t('troops.compare_count',{count:selected.length})}</div>
        </div>
        <button onClick={onClear} style={{ border:0, background:'transparent', color:'rgba(248,242,224,.6)', cursor:'pointer', fontSize:'.62rem' }}>{t('common.clear')}</button>
        <button onClick={onCompare} disabled={selected.length < 2} className="font-nunito font-black" style={{ borderRadius:8, border:'1px solid rgba(200,168,74,.65)', background:selected.length >= 2 ? '#C8A84A' : 'rgba(248,242,224,.08)', color:selected.length >= 2 ? '#1C3A5E' : 'rgba(248,242,224,.35)', padding:'7px 10px', cursor:selected.length >= 2 ? 'pointer':'not-allowed', fontSize:'.63rem' }}>⚖️ {t('troops.compare')}</button>
      </div>
    </div>
  );
}
