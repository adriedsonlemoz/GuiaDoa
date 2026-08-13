import React from 'react';
import { useI18n } from '../../../hooks/useI18n.jsx';

const DragaoCard = ({ dragao, onClick, selecionado, onToggleComparar, noSlot }) => {
  const { t, content } = useI18n();
  return (
    <div className="game-list-row" style={{ cursor:'default' }}>
      <button
        type="button"
        onClick={() => onClick(dragao.id)}
        className="game-thumb"
        style={{ borderColor:`${dragao.cor}88`, fontSize:'2.3rem', cursor:'pointer' }}
      >
        {dragao.emojiDragao}
      </button>
      <div style={{ flex:1, minWidth:0, cursor:'pointer' }} onClick={() => onClick(dragao.id)}>
        <div className="game-list-name">{content(dragao,'nome')}</div>
        <div className="game-list-meta" style={{ color:dragao.cor }}>{content(dragao,'elemento')}</div>
        {content(dragao,'descricao') ? <p className="game-list-copy">{content(dragao,'descricao')}</p> : null}
      </div>
      <button
        type="button"
        onClick={() => onToggleComparar(dragao.id)}
        disabled={noSlot && !selecionado}
        title={selecionado ? t('dragons.remove_compare') : noSlot ? t('dragons.max_three') : t('dragons.add_compare')}
        style={{
          alignSelf:'center', width:34, height:34, borderRadius:4, cursor:'pointer', fontWeight:900,
          border:`1px solid ${selecionado ? dragao.cor : '#8e7344'}`,
          background:selecionado ? dragao.cor : 'linear-gradient(180deg,#47736E,#315B56)',
          color:'#fff4d8', opacity:noSlot && !selecionado ? .35 : 1,
        }}
      >{selecionado ? '✓' : '+'}</button>
    </div>
  );
};

export default DragaoCard;
