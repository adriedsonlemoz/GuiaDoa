import React from 'react';
import { C } from '../../../theme.js';
import { useI18n } from '../../../hooks/useI18n.jsx';

const DragaoCard = ({ dragao, onClick, selecionado, onToggleComparar, comparando, noSlot }) => {
  const { t, content } = useI18n();
  return (
  <div
    className="flex items-center gap-3 rounded-xl mb-2.5 cursor-pointer transition-all relative overflow-hidden"
    style={{
      padding:'11px 14px',
      border:`1.5px solid ${selecionado ? dragao.cor : C.BORDER_SOFT}`,
      borderLeft:`4px solid ${dragao.cor}`,
      background: selecionado
        ? `linear-gradient(135deg,${dragao.cor}18,${dragao.cor}08)`
        : `linear-gradient(135deg,${C.BG_CARD} 0%,${dragao.corFundo||C.BG_CARD_TOP} 100%)`,
      boxShadow: selecionado ? `0 0 0 1px ${dragao.cor}44` : '0 2px 8px rgba(62,47,28,0.10)',
    }}
  >
    {/* Ícone */}
    <div className="shrink-0 flex items-center justify-center text-3xl rounded-xl"
      style={{ width:48, height:48, background:`linear-gradient(135deg,${dragao.cor}22,${dragao.cor}44)`,
        border:`2px solid ${dragao.cor}66`, boxShadow:`0 2px 8px ${dragao.cor}33` }}>
      {dragao.emojiDragao}
    </div>

    {/* Info — clicável para detalhe */}
    <div className="flex-1 min-w-0" onClick={() => onClick(dragao.id)}>
      <div className="flex items-center gap-1.5 mb-0.5 flex-wrap">
        <span className="font-nunito font-black text-[0.9rem]" style={{ color:C.TEXT_PRIMARY }}>{content(dragao, 'nome')}</span>
        <span className="font-nunito font-bold text-[0.58rem] px-1.5 py-0.5 rounded"
          style={{ background:`${dragao.cor}22`, border:`1px solid ${dragao.cor}55`, color:dragao.cor }}>
          {content(dragao, 'elemento')}
        </span>
      </div>
      <p className="font-nunito text-[0.68rem] font-semibold leading-snug m-0 overflow-hidden"
        style={{ color:C.TEXT_MUTED, display:'-webkit-box', WebkitLineClamp:1, WebkitBoxOrient:'vertical' }}>
        {content(dragao, 'descricao')}
      </p>
    </div>

    {/* Botão comparar */}
    <button
      onClick={e => { e.stopPropagation(); onToggleComparar(dragao.id); }}
      title={selecionado ? t('dragons.remove_compare') : noSlot ? t('dragons.max_three') : t('dragons.add_compare')}
      style={{
        flexShrink:0, width:30, height:30, borderRadius:'50%', border:'none',
        cursor: noSlot && !selecionado ? 'not-allowed' : 'pointer',
        background: selecionado ? dragao.cor : 'rgba(200,168,74,0.1)',
        color: selecionado ? '#FFF8EE' : C.TEXT_MUTED,
        fontSize:'0.75rem', fontWeight:900,
        opacity: noSlot && !selecionado ? 0.35 : 1,
        transition:'all 0.15s',
        display:'flex', alignItems:'center', justifyContent:'center',
      }}
    >
      {selecionado ? '✓' : '+'}
    </button>

    {/* Seta detalhe */}
    <span onClick={() => onClick(dragao.id)}
      className="text-xl leading-none shrink-0" style={{ color:dragao.cor, opacity:0.5 }}>›</span>
  </div>
  );
};

export default DragaoCard;
