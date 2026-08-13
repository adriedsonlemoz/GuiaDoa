import React from 'react';
import { C } from '../../theme.js';
import { useI18n } from '../../hooks/useI18n.jsx';
import { fmt, getIcone, getTipoAtaque } from './tropaUtils.js';
import { attackValue, categoryLabelKey, inferredRoles, roleLabelKey } from './tacticalUtils.js';

export default function TacticalTroopCard({ troop, selected, selectionDisabled, onToggleCompare, onOpen }) {
  const { t, content } = useI18n();
  const type = getTipoAtaque(troop, t);
  const roles = inferredRoles(troop).slice(0, 2);
  const name = content(troop, 'nome');
  const unlock = troop.desbloqueio || {};
  const unlockSource = content({ fonte:unlock.fonte, i18n:troop.i18n }, 'desbloqueioFonte') || unlock.fonte;

  return (
    <article style={{ background:C.BG_CARD, border:`1.5px solid ${selected ? '#7c3aed' : 'rgba(200,168,74,.22)'}`, borderRadius:13, overflow:'hidden', boxShadow:'0 2px 9px rgba(62,47,28,.07)' }}>
      <button onClick={onOpen} style={{ width:'100%', textAlign:'left', padding:'11px 12px 9px', cursor:'pointer', background:'transparent', border:0 }}>
        <div style={{ display:'flex', gap:10, alignItems:'flex-start' }}>
          <div style={{ width:43, height:43, borderRadius:11, flexShrink:0, display:'grid', placeItems:'center', fontSize:'1.45rem', background:`${type.color}10`, border:`1px solid ${type.color}30` }}>{getIcone(troop.nome)}</div>
          <div style={{ flex:1, minWidth:0 }}>
            <div style={{ display:'flex', justifyContent:'space-between', gap:8 }}>
              <div style={{ minWidth:0 }}>
                <h3 className="font-cinzel" style={{ fontSize:'.78rem', color:C.TEXT_PRIMARY, margin:0, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{name}</h3>
                <div style={{ display:'flex', gap:4, flexWrap:'wrap', marginTop:5 }}>
                  <span className="font-nunito font-bold" style={{ fontSize:'.55rem', padding:'2px 6px', borderRadius:999, color:type.color, background:`${type.color}10`, border:`1px solid ${type.color}28` }}>{type.label}</span>
                  <span className="font-nunito font-bold" style={{ fontSize:'.55rem', padding:'2px 6px', borderRadius:999, color:C.TEXT_MUTED, background:'rgba(62,47,28,.04)', border:`1px solid ${C.BORDER_SOFT}` }}>{t(categoryLabelKey(troop.categoria || 'outro'))}</span>
                </div>
              </div>
              <div style={{ textAlign:'right', flexShrink:0 }}>
                <strong className="font-cinzel" style={{ display:'block', color:'#7452a8', fontSize:'.95rem' }}>{troop.poder || 0}</strong>
                <span className="font-nunito font-bold" style={{ fontSize:'.48rem', color:C.TEXT_FAINT }}>⭐ {t('common.power').toUpperCase()}</span>
              </div>
            </div>
          </div>
        </div>

        <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:5, marginTop:10 }}>
          {[
            ['🔥', attackValue(troop)], ['🛡️', troop.def], ['❤️', troop.vida], ['⚡', troop.vel],
          ].map(([icon, value]) => <div key={icon} style={{ borderRadius:8, background:'rgba(62,47,28,.035)', padding:'5px 3px', textAlign:'center' }}><span style={{ fontSize:'.7rem' }}>{icon}</span><strong className="font-nunito" style={{ display:'block', fontSize:'.64rem', color:C.TEXT_SECONDARY }}>{fmt(value)}</strong></div>)}
        </div>

        <div style={{ display:'flex', gap:5, flexWrap:'wrap', marginTop:8, minHeight:20 }}>
          {roles.map(role => <span key={role} className="font-nunito font-black" style={{ fontSize:'.54rem', color:role === 'ataque' ? '#a83c2c' : role === 'defesa' ? '#2563a8' : '#7a5a1f' }}>• {t(roleLabelKey(role))}</span>)}
          {unlockSource && <span className="font-nunito font-bold" style={{ marginLeft:'auto', fontSize:'.54rem', color:'#6a5018' }}>🔓 {unlockSource}{unlock.nivel ? ` ${t('common.level_short')} ${unlock.nivel}` : ''}</span>}
        </div>
      </button>
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', borderTop:`1px solid ${C.BORDER_SOFT}` }}>
        <button onClick={onOpen} className="font-nunito font-bold" style={{ border:0, borderRight:`1px solid ${C.BORDER_SOFT}`, background:'transparent', padding:'8px 6px', color:C.TEXT_SECONDARY, cursor:'pointer', fontSize:'.64rem' }}>📊 {t('troops.details')}</button>
        <button disabled={!selected && selectionDisabled} onClick={onToggleCompare} className="font-nunito font-bold" style={{ border:0, background:selected ? 'rgba(124,58,237,.10)' : 'transparent', padding:'8px 6px', color:selected ? '#7452a8' : (!selected && selectionDisabled ? C.TEXT_FAINT : C.TEXT_SECONDARY), cursor:(!selected && selectionDisabled) ? 'not-allowed' : 'pointer', fontSize:'.64rem' }}>{selected ? '✓' : '⚖️'} {selected ? t('troops.compare_selected') : t('troops.compare_add_short')}</button>
      </div>
    </article>
  );
}
