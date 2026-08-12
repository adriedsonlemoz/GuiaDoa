import React from 'react';
import { createPortal } from 'react-dom';
import { C } from '../../../theme.js';
import { getIcone, getTipoAtaque, getAtributosResumo } from '../tropaUtils.js';

const MiniBar = ({ value, max, color }) => {
  const pct = max > 0 ? Math.min(100, (value / max) * 100) : 0;
  return <div className="flex-1 h-1 rounded-full overflow-hidden" style={{ background: 'rgba(62,47,28,0.08)' }}><div style={{ height: '100%', width: `${pct}%`, background: value ? `linear-gradient(90deg,${color}55,${color})` : 'transparent', borderRadius: 2 }} /></div>;
};

const SelectRow = ({ tropa, onClick }) => {
  const tipo = getTipoAtaque(tropa);
  const resumo = getAtributosResumo(tropa);
  return (
    <button onClick={onClick} className="flex items-center gap-2.5 px-3 py-2.5 cursor-pointer rounded-lg transition-all text-left" style={{ border: `1px solid ${C.BORDER_SOFT}`, borderLeft: `3px solid ${C.BORDER}`, background: C.BG_CARD }}>
      <span className="text-3xl leading-none shrink-0 w-8 text-center">{getIcone(tropa.nome)}</span>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 mb-0.5 flex-wrap"><span className="font-nunito font-black text-[0.82rem]" style={{ color: C.ACCENT }}>{tropa.nome}</span><span className="font-nunito font-bold text-[0.65rem] px-1.5 py-0.5 rounded-full shrink-0" style={{ border: `1px solid ${tipo.color}55`, background: `${tipo.color}12`, color: tipo.color }}>{tipo.label}</span></div>
        <div className="flex gap-2 items-center mb-1">{resumo.map((item, index) => <span key={index} className="font-nunito text-[0.6rem] whitespace-nowrap" style={{ color: C.TEXT_SECONDARY }}>{item.icon} {item.val}</span>)}</div>
        <div className="flex gap-1 items-center"><MiniBar value={tropa.vida} max={32000} color={C.HEALTH} /><MiniBar value={tropa.def} max={5000} color={C.DEFENSE} /><MiniBar value={Math.max(tropa.atqPerto, tropa.atqDist)} max={6000} color={C.ATTACK} /><MiniBar value={tropa.vel} max={3000} color={C.ENERGY} /></div>
      </div>
      <div className="text-right shrink-0"><p className="font-nunito font-black text-[0.75rem] leading-none m-0" style={{ color: C.POWER }}>{tropa.poder}</p><p className="font-nunito text-[0.55rem] tracking-wider m-0" style={{ color: C.TEXT_MUTED }}>POD</p></div>
    </button>
  );
};

export default function TropaSelectDrawer({ open, tropas, busca, setBusca, onSelect, onClose }) {
  if (!open) return null;
  return createPortal(
    <div className="fixed inset-0 z-50 flex flex-col" style={{ background: C.BG_MAIN }}>
      <div className="flex items-center gap-3 px-3 py-2.5 sticky top-0 z-10" style={{ background: C.BG_CARD_TOP, borderBottom: `2px solid ${C.BORDER}` }}>
        <button className="w-8 h-8 flex items-center justify-center rounded-lg text-sm cursor-pointer transition-all" style={{ color: C.ACCENT, background: 'transparent', border: `1px solid ${C.BORDER_SOFT}` }} onClick={onClose}>✕</button>
        <p className="font-nunito font-black text-[0.85rem] tracking-wide flex-1 m-0" style={{ color: C.ACCENT }}>Selecionar Unidade</p>
        <span className="font-nunito text-xs" style={{ color: C.TEXT_SECONDARY }}>{tropas.length} un.</span>
      </div>
      <div className="px-3 py-2" style={{ background: C.BG_CARD, borderBottom: `1px solid ${C.BORDER_SOFT}` }}><input className="tw-input" placeholder="Buscar unidade..." value={busca} onChange={event => setBusca(event.target.value)} autoFocus /></div>
      <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-2">{tropas.map(tropa => <SelectRow key={tropa.nome} tropa={tropa} onClick={() => onSelect(tropa)} />)}</div>
    </div>,
    document.body,
  );
}
