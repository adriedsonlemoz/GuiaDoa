import React, { useState } from 'react';
import { C } from '../../theme.js';
import { getIcone, getTipoAtaque, fmtFull, ATRIBUTOS, getAtributosResumo } from './tropaUtils.js';

const MiniBar = ({ value, max, color }) => {
  const pct = max > 0 ? Math.min(100, (value / max) * 100) : 0;
  const empty = !value || value === 0;
  return (
    <div className="flex-1 h-1 rounded-full overflow-hidden"
      style={{ background: 'rgba(62,47,28,0.08)', border: '1px solid rgba(62,47,28,0.06)' }}>
      <div style={{
        height: '100%', width: `${pct}%`,
        background: empty ? 'transparent' : `linear-gradient(90deg, ${color}88, ${color})`,
        borderRadius: 3,
      }} />
    </div>
  );
};

const StatRow = ({ icon, label, value, color, max }) => {
  const empty = !value || value === 0;
  const pct = max > 0 ? Math.min(100, (value / max) * 100) : 0;
  return (
    <div className="mb-2.5">
      <div className="flex justify-between items-center mb-1">
        <span className="font-nunito font-bold text-[0.72rem] tracking-wide" style={{ color: C.TEXT_MUTED }}>
          {icon} {label}
        </span>
        <span className="font-nunito font-bold text-[0.75rem]" style={{ color: empty ? C.TEXT_FAINT : color }}>
          {empty ? '—' : fmtFull(value)}
        </span>
      </div>
      <div className="h-1.5 rounded-full overflow-hidden"
        style={{ background: 'rgba(62,47,28,0.07)', border: '1px solid rgba(62,47,28,0.08)' }}>
        <div style={{
          height: '100%', width: `${pct}%`,
          background: empty ? 'transparent' : `linear-gradient(90deg, ${color}55, ${color})`,
          borderRadius: 3, transition: 'width 0.35s ease',
        }} />
      </div>
    </div>
  );
};

const TropaCard = ({ tropa, quantidade, onQuantidadeChange, onFecharTeclado }) => {
  const [aberto, setAberto] = useState(false);
  const tipo   = getTipoAtaque(tropa);
  const resumo = getAtributosResumo(tropa);

  return (
    <div
      className="rounded-lg overflow-hidden transition-all"
      style={{
        border: `1.5px solid ${aberto ? C.BORDER : C.BORDER_SOFT}`,
        borderLeft: `3px solid ${aberto ? C.ACCENT : C.BORDER}`,
        background: aberto
          ? `linear-gradient(180deg, #FAF3E0 0%, ${C.BG_CARD} 100%)`
          : `linear-gradient(180deg, ${C.BG_CARD} 0%, ${C.BG_CARD_TOP} 100%)`,
        boxShadow: aberto ? '0 3px 14px rgba(62,47,28,0.14)' : '0 1px 5px rgba(62,47,28,0.08)',
      }}
    >
      {/* ── Header clicável ── */}
      <div
        onClick={() => setAberto(v => !v)}
        className="flex items-center gap-2.5 px-3 py-2.5 cursor-pointer"
      >
        {/* Ícone */}
        <div className="text-3xl leading-none shrink-0 w-8 text-center"
          style={{ filter: 'drop-shadow(0 1px 2px rgba(62,47,28,0.2))' }}>
          {getIcone(tropa.nome)}
        </div>

        {/* Nome + stats */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 mb-1 flex-wrap">
            <span className="font-nunito font-bold text-[0.82rem] leading-none" style={{ color: C.TEXT_PRIMARY }}>
              {tropa.nome}
            </span>
            <span
              className="font-nunito font-bold text-[0.68rem] px-1.5 py-0.5 rounded-full shrink-0"
              style={{ border: `1px solid ${tipo.color}55`, background: `${tipo.color}12`, color: tipo.color }}
            >
              {tipo.label}
            </span>
          </div>
          {/* Mini resumo */}
          <div className="flex gap-2 items-center mb-1">
            {resumo.map((s, i) => (
              <span key={i} className="font-nunito text-[0.58rem] whitespace-nowrap" style={{ color: C.TEXT_MUTED }}>
                {s.icon} {s.val}
              </span>
            ))}
          </div>
          {/* Mini barras */}
          <div className="flex gap-1 items-center">
            <MiniBar value={tropa.vida}  max={32000} color={C.HEALTH}  />
            <MiniBar value={tropa.def}   max={5000}  color={C.DEFENSE} />
            <MiniBar value={Math.max(tropa.atqPerto, tropa.atqDist)} max={6000} color={C.ATTACK} />
            <MiniBar value={tropa.vel}   max={3000}  color={C.ENERGY}  />
          </div>
        </div>

        {/* Poder + seta */}
        <div className="text-right shrink-0">
          <p className="font-nunito font-bold text-[0.82rem] leading-none m-0" style={{ color: C.POWER }}>{tropa.poder}</p>
          <p className="font-nunito text-[0.55rem] tracking-widest mb-1 m-0" style={{ color: C.TEXT_FAINT }}>POD</p>
          <span
            className="inline-block text-base transition-transform leading-none"
            style={{
              color: aberto ? C.ACCENT : C.BORDER,
              transform: aberto ? 'rotate(90deg)' : 'none',
            }}
          >
            ›
          </span>
        </div>
      </div>

      {/* ── Detalhe expandido ── */}
      {aberto && (
        <div style={{ borderTop: `1px solid ${C.BORDER_SOFT}` }}>

          {/* Descrição */}
          {tropa.desc && (
            <div className="px-3 py-2" style={{ borderBottom: `1px solid ${C.BORDER_SOFT}`, background: 'rgba(225,207,163,0.2)' }}>
              <p className="font-nunito italic text-[0.78rem] leading-relaxed m-0" style={{ color: C.TEXT_SECONDARY }}>
                {tropa.desc}
              </p>
            </div>
          )}

          {/* Atributos */}
          <div className="px-3 pt-2.5 pb-1">
            {/* Título */}
            <div className="flex items-center gap-2 mb-2.5">
              <div className="flex-1 h-px" style={{ background: `linear-gradient(90deg, transparent, ${C.BORDER_SOFT})` }} />
              <span className="font-nunito font-bold text-[0.68rem] tracking-widest" style={{ color: C.TEXT_MUTED }}>ATRIBUTOS</span>
              <div className="flex-1 h-px" style={{ background: `linear-gradient(270deg, transparent, ${C.BORDER_SOFT})` }} />
            </div>
            <div className="grid grid-cols-2 gap-x-3.5">
              {ATRIBUTOS.map(attr => (
                <StatRow key={attr.id} icon={attr.icon} label={attr.label}
                  value={tropa[attr.id]} color={attr.color} max={attr.max} />
              ))}
            </div>
          </div>

          {/* Seções futuras */}
          <div className="px-3 pb-2.5 flex gap-1.5">
            {[{ icon: '📋', title: 'REQUISITOS' }, { icon: '🔮', title: 'AMULETOS' }].map(sec => (
              <div key={sec.title}
                className="flex-1 py-2 px-1 rounded-md text-center"
                style={{ border: `1px dashed ${C.BORDER_SOFT}`, background: 'rgba(184,150,90,0.04)' }}
              >
                <p className="font-nunito font-bold text-[0.68rem] tracking-wide block m-0" style={{ color: C.TEXT_MUTED }}>
                  {sec.icon} {sec.title}
                </p>
                <p className="font-nunito italic text-[0.68rem] m-0 mt-0.5" style={{ color: C.TEXT_FAINT }}>Em breve</p>
              </div>
            ))}
          </div>

          {/* Campo quantidade */}
          <div
            className="px-3 pb-3 pt-2.5"
            style={{ borderTop: `1px solid ${C.BORDER_SOFT}`, background: 'rgba(225,207,163,0.15)' }}
          >
            <p className="font-nunito font-bold text-[0.68rem] tracking-widest mb-1.5 m-0" style={{ color: C.TEXT_MUTED }}>
              EM POSSE
            </p>
            <div className="flex gap-1.5">
              <input
                className="tw-input text-center flex-1"
                placeholder="0"
                value={quantidade ? quantidade.toLocaleString('pt-BR') : ''}
                onChange={e => onQuantidadeChange(tropa.nome, e.target.value)}
                inputMode="numeric"
                onClick={e => e.stopPropagation()}
              />
              <button
                className="btn-navy btn-sm shrink-0 px-4"
                onClick={e => { e.stopPropagation(); onFecharTeclado(); }}
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TropaCard;
