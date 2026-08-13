import React from 'react';
import { useI18n } from '../../../hooks/useI18n.jsx';

const DragaoCard = ({ dragao, onClick, selecionado, onToggleComparar, noSlot }) => {
  const { t, content } = useI18n();
  const niveis = dragao.niveis?.length || 0;
  const habilidades = dragao.habilidades?.length || 0;
  return (
    <div className="game-list-row" style={{ cursor:'default' }}>
      <button type="button" onClick={() => onClick(dragao.id)} className="game-thumb" style={{ borderColor:`${dragao.cor || '#8e7344'}88`, cursor:'pointer', overflow:'hidden', padding:0 }}>
        {dragao.imagem ? <img src={dragao.imagem} alt="" style={{ width:'100%', height:'100%', objectFit:'cover' }} /> : '🐉'}
      </button>
      <div style={{ flex:1, minWidth:0, cursor:'pointer' }} onClick={() => onClick(dragao.id)}>
        <div className="game-list-name">{content(dragao,'nome')}</div>
        <div className="game-list-meta">{content(dragao,'elemento') || 'Dragão'} · {niveis} {t('dragons.known_levels_short')} · {habilidades} {t('dragons.skills_short')}</div>
        {dragao.obtencao?.resumo ? <p className="game-list-copy">{dragao.obtencao.resumo}</p> : null}
      </div>
      <button type="button" onClick={() => onToggleComparar(dragao.id)} disabled={noSlot && !selecionado} title={selecionado ? t('dragons.remove_compare') : t('dragons.add_compare')} style={{ alignSelf:'center', width:34, height:34, borderRadius:4, cursor:'pointer', fontWeight:900, border:`1px solid ${selecionado ? (dragao.cor || '#4b7771') : '#8e7344'}`, background:selecionado ? (dragao.cor || '#4b7771') : 'linear-gradient(180deg,#47736E,#315B56)', color:'#fff4d8', opacity:noSlot && !selecionado ? .35 : 1 }}>{selecionado ? '✓' : '+'}</button>
    </div>
  );
};
export default DragaoCard;
