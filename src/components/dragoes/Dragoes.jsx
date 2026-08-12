import React, { useMemo, useState } from 'react';
import { useGameData } from '../../data/GameDataContext.jsx';
import { C } from '../../theme.js';
import DragaoCard from './ui/DragaoCard.jsx';
import DragaoComparacao from './ui/DragaoComparacao.jsx';
import SectionDivider from './ui/SectionDivider.jsx';

const Dragoes = ({ setRoute }) => {
  const { dragoes } = useGameData();
  const [busca, setBusca] = useState('');
  const [comparando, setComparando] = useState([]);
  const [nivelIdx, setNivelIdx] = useState(0);
  const [aba, setAba] = useState('lista');
  const apiDataMap = useMemo(() => Object.fromEntries(dragoes.map(dragao => [dragao.id, dragao])), [dragoes]);
  const dragoesFiltrados = useMemo(() => {
    const term = busca.trim().toLowerCase();
    return dragoes.filter(dragao => dragao.nome?.toLowerCase().includes(term) || dragao.elemento?.toLowerCase().includes(term));
  }, [dragoes, busca]);
  const elementos = useMemo(() => [...new Set(dragoes.map(dragao => dragao.elemento).filter(Boolean))].sort(), [dragoes]);

  const toggleComparar = id => {
    setComparando(current => {
      if (current.includes(id)) return current.filter(value => value !== id);
      if (current.length >= 3) return current;
      return [...current, id];
    });
  };
  const removerComparacao = id => setComparando(current => current.filter(value => value !== id));

  return (
    <div className="max-w-lg mx-auto pb-4" style={{ animation: 'reveal-up 0.4s ease both' }}>
      <div className="text-center px-4 py-3 rounded-xl mb-3 relative overflow-hidden" style={{ background: 'linear-gradient(135deg,#1C3A5E 0%,#3B5C8C 60%,#1C3A5E 100%)' }}>
        <p className="font-cinzel font-bold text-base tracking-widest uppercase text-aoe-cream m-0">🐉 Grimório dos Dragões</p>
        <p className="font-nunito text-[0.65rem] tracking-widest text-aoe-cream/50 m-0 mt-0.5">Enciclopédia Dracônica</p>
      </div>

      <div className="flex gap-2 mb-3" style={{ borderBottom: `1.5px solid ${C.BORDER_SOFT}`, paddingBottom: 0 }}>
        {[
          { id: 'lista', label: '📋 Lista' },
          { id: 'comparar', label: `⚔️ Comparar${comparando.length > 0 ? ` (${comparando.length})` : ''}` },
        ].map(item => (
          <button key={item.id} onClick={() => setAba(item.id)} style={{
            flex: 1, padding: '8px 4px', fontFamily: 'inherit', fontWeight: 800,
            fontSize: '0.75rem', border: 'none', cursor: 'pointer', background: 'transparent',
            color: aba === item.id ? C.ACCENT_DEEP : C.TEXT_MUTED,
            borderBottom: aba === item.id ? `2.5px solid ${C.ACCENT}` : '2.5px solid transparent', transition: 'all 0.15s',
          }}>{item.label}</button>
        ))}
      </div>

      {aba === 'comparar' && (
        comparando.length === 0 ? (
          <div style={{ padding: '32px 20px', textAlign: 'center', borderRadius: 12, border: `2px dashed ${C.BORDER}`, background: C.BG_CARD }}>
            <p style={{ fontSize: '2.5rem', marginBottom: 10 }}>⚔️</p>
            <p className="font-cinzel font-bold text-sm m-0 mb-2" style={{ color: C.TEXT_PRIMARY }}>Nenhum dragão selecionado</p>
            <p className="font-nunito text-xs m-0" style={{ color: C.TEXT_MUTED, lineHeight: 1.6 }}>
              Vá para a aba <strong>Lista</strong> e clique no botão <strong>+</strong> em até 3 dragões para comparar os atributos lado a lado.
            </p>
          </div>
        ) : (
          <DragaoComparacao ids={comparando} nivelIdx={nivelIdx} setNivelIdx={setNivelIdx} apiDataMap={apiDataMap}
            onRemover={removerComparacao} todosDragoes={dragoes} />
        )
      )}

      {aba === 'lista' && (
        <>
          <input className="tw-input mb-3" placeholder="🔍  Buscar dragão ou elemento..." value={busca} onChange={event => setBusca(event.target.value)} />
          {comparando.length > 0 && (
            <div style={{ padding: '8px 12px', borderRadius: 10, marginBottom: 10, background: `${C.ACCENT}0F`, border: `1px solid ${C.ACCENT}30`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
              <span className="font-nunito font-bold text-xs" style={{ color: C.ACCENT_DEEP }}>⚔️ {comparando.length} dragão{comparando.length > 1 ? 'ões' : ''} selecionado{comparando.length > 1 ? 's' : ''}</span>
              <button onClick={() => setAba('comparar')} style={{ padding: '4px 10px', borderRadius: 6, border: `1px solid ${C.ACCENT}44`, background: `${C.ACCENT}22`, color: C.ACCENT_DEEP, fontSize: '0.7rem', fontWeight: 800, cursor: 'pointer', fontFamily: 'inherit' }}>Ver comparação →</button>
            </div>
          )}
          {elementos.map(elemento => {
            const lista = dragoesFiltrados.filter(dragao => dragao.elemento === elemento);
            if (lista.length === 0) return null;
            return (
              <div key={elemento}>
                <SectionDivider label={elemento.toUpperCase()} />
                {lista.map(dragao => (
                  <DragaoCard key={dragao.id} dragao={dragao} onClick={id => setRoute(`dragao_${id}`)}
                    selecionado={comparando.includes(dragao.id)} onToggleComparar={toggleComparar} noSlot={comparando.length >= 3} />
                ))}
              </div>
            );
          })}
          {dragoesFiltrados.length === 0 && (
            <div className="py-10 text-center rounded-xl" style={{ border: `1px dashed ${C.BORDER}`, background: C.BG_CARD }}>
              <p className="text-4xl mb-2 m-0">🐉</p><p className="font-nunito italic text-xs m-0" style={{ color: C.TEXT_MUTED }}>Nenhum dragão encontrado</p>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Dragoes;
