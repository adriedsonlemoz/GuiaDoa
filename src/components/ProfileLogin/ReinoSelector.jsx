import React, { useEffect, useRef, useState } from 'react';
import { C } from '../../theme.js';
import { useGameData } from '../../data/GameDataContext.jsx';
import { useI18n } from '../../hooks/useI18n.jsx';

const realmIcon = reino => reino?.tipoEspecial === 'idade_dragao' ? '🐉 ' : reino?.tipoEspecial === 'hardcore' ? '⚔️ ' : '';

const ReinoCard = ({ reino, selecionado, onClick }) => {
  const { content, t } = useI18n();
  return (
    <button
      type="button"
      onClick={() => onClick(reino)}
      style={{
        display:'flex', alignItems:'center', gap:10, width:'100%', textAlign:'left', padding:'10px 12px',
        background:selecionado ? 'linear-gradient(90deg,rgba(49,72,74,.18),rgba(200,168,74,.10))' : 'transparent',
        border:'none', borderBottom:'1px solid rgba(200,168,74,.12)', borderLeft:selecionado ? '3px solid #C8A84A' : '3px solid transparent',
        cursor:'pointer', transition:'all .15s',
      }}
    >
      <span style={{ flex:1, minWidth:0 }}>
        <span style={{ display:'block', fontFamily:"system-ui,-apple-system,'Segoe UI',Roboto,Arial,sans-serif", fontWeight:900, fontSize:'.84rem', color:selecionado?C.TEXT_PRIMARY:C.TEXT_SECONDARY, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>
          {realmIcon(reino)}{content(reino, 'nome')}
        </span>
        <span style={{ display:'block', fontFamily:"system-ui,-apple-system,'Segoe UI',Roboto,Arial,sans-serif", fontWeight:700, fontSize:'.68rem', color:C.TEXT_FAINT, marginTop:1 }}>
          {reino.tipoEspecial === 'idade_dragao' ? t('realms.type_dragon_age') : reino.tipoEspecial === 'hardcore' ? t('realms.type_hardcore') : reino.fuso || ''}
        </span>
      </span>
      <span style={{ fontFamily:'monospace', fontWeight:800, fontSize:'.72rem', color:selecionado?C.ACCENT:C.TEXT_MUTED, background:selecionado?'rgba(200,168,74,.15)':'rgba(200,168,74,.06)', border:`1px solid ${selecionado?'rgba(200,168,74,.5)':'rgba(200,168,74,.2)'}`, borderRadius:5, padding:'3px 6px', flexShrink:0 }}>
        {reino.fuso || 'UTC?'}
      </span>
    </button>
  );
};

const ReinoSelector = ({ value, onChange }) => {
  const [aberto, setAberto] = useState(false);
  const { reinos, loading: carregando } = useGameData();
  const { t, content } = useI18n();
  const painelRef = useRef(null);
  const selecionado = reinos.find(r => r.nome === value) || null;
  const ordenados = [...reinos].sort((a, b) => b.id - a.id);

  useEffect(() => {
    if (!aberto) return undefined;
    const fn = event => {
      if (painelRef.current && !painelRef.current.contains(event.target)) setAberto(false);
    };
    document.addEventListener('mousedown', fn);
    return () => document.removeEventListener('mousedown', fn);
  }, [aberto]);

  const selecionar = reino => {
    onChange(reino);
    setAberto(false);
  };

  return (
    <div ref={painelRef} style={{ position:'relative' }}>
      <button type="button" onClick={() => setAberto(open => !open)} style={{ width:'100%', display:'flex', alignItems:'center', gap:10, padding:'9px 12px', background:'#F8F4E8', border:`1.5px solid ${aberto?C.ACCENT_DEEP:C.BORDER}`, borderRadius:aberto?'8px 8px 0 0':8, cursor:'pointer', textAlign:'left', boxShadow:aberto?'0 0 0 3px rgba(200,168,74,.15)':'none', transition:'all .15s' }}>
        {selecionado ? <>
          <span style={{ flex:1, minWidth:0 }}>
            <span style={{ display:'block', fontFamily:"system-ui,-apple-system,'Segoe UI',Roboto,Arial,sans-serif", fontWeight:900, fontSize:'.86rem', color:C.TEXT_PRIMARY, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{realmIcon(selecionado)}{content(selecionado,'nome')}</span>
          </span>
          <span style={{ fontFamily:'monospace', fontWeight:800, fontSize:'.72rem', color:C.ACCENT, background:'rgba(200,168,74,.12)', border:'1px solid rgba(200,168,74,.35)', borderRadius:5, padding:'3px 6px', flexShrink:0 }}>{selecionado.fuso || 'UTC?'}</span>
        </> : <span style={{ fontFamily:"system-ui,-apple-system,'Segoe UI',Roboto,Arial,sans-serif", fontWeight:700, fontSize:'.84rem', color:C.TEXT_FAINT, flex:1 }}>— {t('profile.select_realm')} —</span>}
        <span style={{ color:C.TEXT_FAINT, fontSize:'.76rem', transform:aberto?'rotate(180deg)':'none', transition:'transform .2s', flexShrink:0 }}>▾</span>
      </button>

      {aberto && <div style={{ position:'absolute', top:'100%', left:0, right:0, zIndex:999, background:'#F2EADA', border:`1.5px solid ${C.BORDER}`, borderTop:'1px solid rgba(200,168,74,.3)', borderRadius:'0 0 10px 10px', boxShadow:'0 8px 24px rgba(62,47,28,.20)', overflow:'hidden' }}>
        <div style={{ padding:'7px 11px', background:'#EAE0C8', borderBottom:'1px solid rgba(200,168,74,.2)', fontFamily:"system-ui,-apple-system,'Segoe UI',Roboto,Arial,sans-serif", fontWeight:800, fontSize:'.68rem', color:C.TEXT_SECONDARY }}>
          {t('profile.realm_count', { shown:ordenados.length, total:reinos.length })}
        </div>
        <div style={{ maxHeight:300, overflowY:'auto' }}>
          {carregando ? <div style={{ padding:18, textAlign:'center', fontFamily:"system-ui,-apple-system,'Segoe UI',Roboto,Arial,sans-serif", fontWeight:700, fontSize:'.8rem', color:C.TEXT_FAINT }}>{t('profile.loading_realms')}</div>
            : ordenados.length === 0 ? <div style={{ padding:18, textAlign:'center', fontFamily:"system-ui,-apple-system,'Segoe UI',Roboto,Arial,sans-serif", fontWeight:700, fontSize:'.8rem', color:C.TEXT_FAINT }}>{t('profile.no_realms')}</div>
              : ordenados.map(reino => <ReinoCard key={`realm-${reino.slug || reino.nome}`} reino={reino} selecionado={value===reino.nome} onClick={selecionar} />)}
        </div>
      </div>}
    </div>
  );
};

export default ReinoSelector;
