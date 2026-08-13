import React from 'react';
import { C } from '../../theme.js';
import { useI18n } from '../../hooks/useI18n.jsx';
import { getIcone, getTipoAtaque } from './tropaUtils.js';

export default function TroopListRow({ troop, onOpen }) {
  const { t, content } = useI18n();
  const name = content(troop, 'nome');
  const description = content(troop, 'desc');
  const type = getTipoAtaque(troop, t);
  const unlock = troop.desbloqueio || {};
  const unlockSource = content({ desbloqueioFonte:unlock.fonte, i18n:troop.i18n }, 'desbloqueioFonte') || unlock.fonte;

  return (
    <button
      onClick={onOpen}
      aria-label={`${t('troops.details')}: ${name}`}
      style={{ width:'100%', border:0, borderBottom:`1px solid ${C.BORDER_SOFT}`, background:'transparent', padding:'12px 4px', display:'flex', alignItems:'flex-start', gap:11, textAlign:'left', cursor:'pointer' }}
    >
      <div style={{ width:72, height:72, flex:'0 0 72px', borderRadius:9, overflow:'hidden', display:'grid', placeItems:'center', background:'linear-gradient(145deg,rgba(200,168,74,.16),rgba(242,234,218,.9))', border:`1px solid ${C.BORDER_SOFT}`, boxShadow:'inset 0 0 0 1px rgba(255,255,255,.35)' }}>
        {troop.imagem ? (
          <img src={troop.imagem} alt="" loading="lazy" style={{ width:'100%', height:'100%', objectFit:'cover' }} />
        ) : (
          <span style={{ fontSize:'2.1rem' }}>{getIcone(troop.nome)}</span>
        )}
      </div>

      <div style={{ flex:1, minWidth:0, paddingTop:1 }}>
        <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', gap:8 }}>
          <h3 className="font-cinzel" style={{ margin:0, color:C.TEXT_PRIMARY, fontSize:'.86rem', lineHeight:1.25 }}>{name}</h3>
          <span style={{ color:C.TEXT_FAINT, fontSize:'.9rem', lineHeight:1 }}>›</span>
        </div>

        <div style={{ display:'flex', gap:5, flexWrap:'wrap', marginTop:4 }}>
          <span className="font-nunito font-bold" style={{ fontSize:'.55rem', color:type.color, background:`${type.color}0d`, border:`1px solid ${type.color}2b`, padding:'2px 6px', borderRadius:999 }}>{type.label}</span>
          {troop.tipo === 'especial' && <span className="font-nunito font-bold" style={{ fontSize:'.55rem', color:'#785f27', background:'rgba(200,168,74,.11)', border:'1px solid rgba(200,168,74,.28)', padding:'2px 6px', borderRadius:999 }}>✨ {t('troops.special')}</span>}
        </div>

        {description && <p className="font-nunito" style={{ margin:'5px 0 0', color:C.TEXT_SECONDARY, fontSize:'.67rem', lineHeight:1.4, display:'-webkit-box', WebkitLineClamp:3, WebkitBoxOrient:'vertical', overflow:'hidden' }}>{description}</p>}

        {unlockSource && (
          <div className="font-nunito font-bold" style={{ marginTop:5, color:C.TEXT_MUTED, fontSize:'.57rem' }}>
            🔓 {unlockSource}{unlock.nivel ? ` · ${t('common.level_short')} ${unlock.nivel}` : ''}
          </div>
        )}
      </div>
    </button>
  );
}
