import React, { useState, useEffect } from 'react';
import { dbDragoes } from '../../data/dragoes.js';
import { C } from '../../theme.js';

const API = import.meta.env.VITE_API_URL || 'http://localhost:3001';

// ── Atributos para comparação ─────────────────────────────────────────────────
const ATTRS_BASE = [
  { key:'vida',           label:'Vida',          icon:'❤️'  },
  { key:'defesa',         label:'Defesa',        icon:'🛡️'  },
  { key:'ataquePerto',    label:'Atq. Perto',    icon:'⚔️'  },
  { key:'ataqueDistante', label:'Atq. Distante', icon:'🏹'  },
  { key:'alcance',        label:'Alcance',       icon:'🎯'  },
  { key:'velocidade',     label:'Velocidade',    icon:'⚡'  },
];
const ATTRS_ELEM = [
  { key:'ataqueElemental',     label:'Atq. Elem.',     icon:'🔥' },
  { key:'impulsoElemental',    label:'Impulso Elem.',  icon:'💥' },
  { key:'barreiraElemental',   label:'Barreira Elem.', icon:'🔰' },
  { key:'bombardeioElemental', label:'Bombardeio',     icon:'💣' },
  { key:'confrontoElemental',  label:'Confronto',      icon:'⚡' },
  { key:'bloqueioElemental',   label:'Bloqueio',       icon:'🛡' },
  { key:'rupturaElemental',    label:'Ruptura',        icon:'💢' },
];
const TODOS_ATTRS = [...ATTRS_BASE, ...ATTRS_ELEM];

const fmt = v => (v == null || v === 0) ? '0' : Number(v).toLocaleString('pt-BR');

// ── SectionDivider ────────────────────────────────────────────────────────────
const SectionDivider = ({ label }) => (
  <div className="flex items-center gap-2 my-3">
    <div className="flex-1 h-px" style={{ background:`linear-gradient(90deg,transparent,${C.BORDER})` }} />
    <span style={{ color:C.ACCENT, fontSize:'0.7rem' }}>◆</span>
    <span className="font-nunito font-bold text-[0.65rem] tracking-widest whitespace-nowrap uppercase" style={{ color:C.TEXT_MUTED }}>{label}</span>
    <span style={{ color:C.ACCENT, fontSize:'0.7rem' }}>◆</span>
    <div className="flex-1 h-px" style={{ background:`linear-gradient(270deg,transparent,${C.BORDER})` }} />
  </div>
);

// ── DragaoCard ────────────────────────────────────────────────────────────────
const DragaoCard = ({ dragao, onClick, selecionado, onToggleComparar, comparando, noSlot }) => (
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
        <span className="font-nunito font-black text-[0.9rem]" style={{ color:C.TEXT_PRIMARY }}>{dragao.nome}</span>
        <span className="font-nunito font-bold text-[0.58rem] px-1.5 py-0.5 rounded"
          style={{ background:`${dragao.cor}22`, border:`1px solid ${dragao.cor}55`, color:dragao.cor }}>
          {dragao.elemento}
        </span>
      </div>
      <p className="font-nunito text-[0.68rem] font-semibold leading-snug m-0 overflow-hidden"
        style={{ color:C.TEXT_MUTED, display:'-webkit-box', WebkitLineClamp:1, WebkitBoxOrient:'vertical' }}>
        {dragao.descricao}
      </p>
    </div>

    {/* Botão comparar */}
    <button
      onClick={e => { e.stopPropagation(); onToggleComparar(dragao.id); }}
      title={selecionado ? 'Remover da comparação' : noSlot ? 'Máximo de 3 dragões' : 'Adicionar à comparação'}
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

// ── Painel de Comparação ──────────────────────────────────────────────────────
const PainelComparacao = ({ ids, nivelIdx, setNivelIdx, apiDataMap, onRemover }) => {
  const dragoes = ids.map(id => dbDragoes.find(d => d.id === id)).filter(Boolean);
  if (dragoes.length === 0) return null;

  // Calcula o nível máximo disponível entre os dragões selecionados
  const maxNiveis = Math.max(...ids.map(id => (apiDataMap[id]?.niveis?.length || 0)));

  // Valor do atributo de um dragão no nível atual
  const getVal = (id, key) => {
    const niveis = apiDataMap[id]?.niveis;
    if (!niveis || niveis.length === 0) return null;
    const nv = niveis[nivelIdx] || niveis[niveis.length - 1];
    return nv?.[key] ?? 0;
  };

  // Quem tem o maior valor em cada atributo
  const melhor = (key) => {
    let maxVal = -Infinity, melhorId = null;
    ids.forEach(id => {
      const v = getVal(id, key);
      if (v !== null && v > maxVal) { maxVal = v; melhorId = id; }
    });
    return melhorId;
  };

  const temDados = ids.some(id => (apiDataMap[id]?.niveis?.length || 0) > 0);

  return (
    <div style={{
      background:C.BG_CARD, border:`1.5px solid ${C.BORDER}`,
      borderRadius:14, overflow:'hidden', marginBottom:16,
    }}>
      {/* Cabeçalho */}
      <div style={{
        background:`linear-gradient(135deg,#1C3A5E,#2A4C72)`,
        padding:'10px 14px',
        display:'flex', alignItems:'center', justifyContent:'space-between',
      }}>
        <span className="font-cinzel font-bold text-sm tracking-wider" style={{ color:'#F8F2E0' }}>
          ⚔️ Comparação
        </span>
        <span className="font-nunito font-bold text-xs" style={{ color:'rgba(248,242,224,0.5)' }}>
          {dragoes.length}/3 dragões
        </span>
      </div>

      {/* Chips dos dragões selecionados */}
      <div style={{ display:'flex', gap:6, padding:'10px 14px', flexWrap:'wrap', borderBottom:`1px solid ${C.BORDER_SOFT}` }}>
        {dragoes.map(d => (
          <div key={d.id} style={{
            display:'flex', alignItems:'center', gap:6, padding:'5px 10px',
            background:`${d.cor}15`, border:`1.5px solid ${d.cor}44`, borderRadius:20,
          }}>
            <span style={{ fontSize:'1rem' }}>{d.emojiDragao}</span>
            <span className="font-nunito font-bold text-xs" style={{ color:d.cor }}>{d.nome}</span>
            <button onClick={() => onRemover(d.id)} style={{
              background:'none', border:'none', cursor:'pointer',
              color:`${d.cor}99`, fontSize:'0.75rem', padding:'0 2px', lineHeight:1,
            }}>✕</button>
          </div>
        ))}
        {ids.length < 3 && (
          <div style={{
            display:'flex', alignItems:'center', gap:4, padding:'5px 10px',
            border:`1.5px dashed ${C.BORDER}`, borderRadius:20,
          }}>
            <span className="font-nunito text-xs" style={{ color:C.TEXT_FAINT }}>+ até {3 - ids.length} dragão{3 - ids.length > 1 ? 'ões' : ''}</span>
          </div>
        )}
      </div>

      {!temDados ? (
        <div style={{ padding:'20px', textAlign:'center' }}>
          <p className="font-nunito text-xs italic m-0" style={{ color:C.TEXT_MUTED }}>
            Nenhum atributo cadastrado nos dragões selecionados.<br/>
            <span style={{ fontSize:'0.65rem' }}>Admin → Dragões → Atributos para cadastrar.</span>
          </p>
        </div>
      ) : (
        <>
          {/* Seletor de nível */}
          {maxNiveis > 0 && (
            <div style={{ padding:'10px 14px', borderBottom:`1px solid ${C.BORDER_SOFT}`,
              display:'flex', alignItems:'center', gap:10 }}>
              <span className="font-nunito font-bold text-xs" style={{ color:C.TEXT_MUTED, whiteSpace:'nowrap' }}>
                Nível:
              </span>
              <div style={{ display:'flex', gap:4, overflowX:'auto', scrollbarWidth:'none', flex:1 }}>
                {Array.from({ length: maxNiveis }, (_, i) => {
                  const anyNivel = ids.some(id => (apiDataMap[id]?.niveis?.[i]));
                  if (!anyNivel) return null;
                  const nivelNum = apiDataMap[ids.find(id => apiDataMap[id]?.niveis?.[i])]?.niveis?.[i]?.nivel;
                  return (
                    <button key={i} onClick={() => setNivelIdx(i)} style={{
                      flexShrink:0, minWidth:32, height:30, borderRadius:7, border:'none',
                      cursor:'pointer', fontWeight:900, fontFamily:'monospace', fontSize:'0.7rem',
                      background: i === nivelIdx ? `linear-gradient(135deg,${C.ACCENT},${C.ACCENT_HOVER})` : C.BG_SECONDARY,
                      color: i === nivelIdx ? '#FFF8EE' : C.TEXT_MUTED,
                      transform: i === nivelIdx ? 'translateY(-1px)' : 'none',
                      boxShadow: i === nivelIdx ? `0 2px 8px ${C.ACCENT}44` : 'none',
                      transition:'all 0.12s',
                    }}>{nivelNum ?? i+1}</button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Tabela de atributos */}
          <div style={{ overflowX:'auto' }}>
            <table style={{ width:'100%', borderCollapse:'collapse', fontSize:'0.75rem' }}>
              <thead>
                <tr style={{ background:C.BG_SECONDARY }}>
                  <th style={{ padding:'7px 10px', textAlign:'left', fontSize:'0.58rem',
                    letterSpacing:'1px', color:C.TEXT_MUTED, fontWeight:900, whiteSpace:'nowrap' }}>
                    ATRIBUTO
                  </th>
                  {dragoes.map(d => (
                    <th key={d.id} style={{ padding:'7px 10px', textAlign:'center',
                      fontSize:'0.65rem', color:d.cor, fontWeight:900, whiteSpace:'nowrap' }}>
                      {d.emojiDragao} {d.nome.split(' ')[0]}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {/* Separador Base */}
                <tr><td colSpan={dragoes.length + 1} style={{ padding:'4px 10px',
                  fontSize:'0.55rem', fontWeight:900, letterSpacing:'2px', color:C.ACCENT_DEEP,
                  textTransform:'uppercase', background:`${C.ACCENT}08` }}>
                  ⚔ Base
                </td></tr>

                {ATTRS_BASE.map((a, i) => {
                  const melhorId = melhor(a.key);
                  return (
                    <tr key={a.key} style={{ borderBottom:`1px solid ${C.BORDER_SOFT}`,
                      background: i%2===0 ? C.BG_CARD : C.BG_SECONDARY }}>
                      <td style={{ padding:'7px 10px', color:C.TEXT_MUTED, fontWeight:700, whiteSpace:'nowrap' }}>
                        {a.icon} {a.label}
                      </td>
                      {ids.map(id => {
                        const v = getVal(id, a.key);
                        const isBest = id === melhorId && v > 0;
                        const dragao = dragoes.find(d => d.id === id);
                        return (
                          <td key={id} style={{ padding:'7px 10px', textAlign:'center', fontFamily:'monospace',
                            fontWeight: isBest ? 900 : 700,
                            color: v === null ? C.TEXT_FAINT : isBest ? dragao.cor : C.TEXT_PRIMARY,
                          }}>
                            {v === null ? '—' : (
                              <span style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:1 }}>
                                <span>{fmt(v)}</span>
                                {isBest && <span style={{ fontSize:'0.5rem', color:dragao.cor, fontFamily:'sans-serif' }}>▲ melhor</span>}
                              </span>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}

                {/* Separador Elementais */}
                <tr><td colSpan={dragoes.length + 1} style={{ padding:'4px 10px',
                  fontSize:'0.55rem', fontWeight:900, letterSpacing:'2px', color:'#8B6BAE',
                  textTransform:'uppercase', background:'rgba(139,107,174,0.08)' }}>
                  ✨ Elementais
                </td></tr>

                {ATTRS_ELEM.map((a, i) => {
                  const melhorId = melhor(a.key);
                  return (
                    <tr key={a.key} style={{ borderBottom:`1px solid ${C.BORDER_SOFT}`,
                      background: i%2===0 ? C.BG_CARD : C.BG_SECONDARY }}>
                      <td style={{ padding:'7px 10px', color:'#8B6BAE', fontWeight:700, whiteSpace:'nowrap' }}>
                        {a.icon} {a.label}
                      </td>
                      {ids.map(id => {
                        const v = getVal(id, a.key);
                        const isBest = id === melhorId && v > 0;
                        const dragao = dragoes.find(d => d.id === id);
                        return (
                          <td key={id} style={{ padding:'7px 10px', textAlign:'center', fontFamily:'monospace',
                            fontWeight: isBest ? 900 : 700,
                            color: v === null ? C.TEXT_FAINT : isBest ? dragao.cor : C.TEXT_PRIMARY,
                          }}>
                            {v === null ? '—' : (
                              <span style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:1 }}>
                                <span>{fmt(v)}</span>
                                {isBest && <span style={{ fontSize:'0.5rem', color:dragao.cor, fontFamily:'sans-serif' }}>▲ melhor</span>}
                              </span>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
};

// ── Componente principal ──────────────────────────────────────────────────────
const Dragoes = ({ setRoute }) => {
  const [busca,      setBusca]      = useState('');
  const [comparando, setComparando] = useState([]);   // até 3 ids
  const [nivelIdx,   setNivelIdx]   = useState(0);
  const [apiDataMap, setApiDataMap] = useState({});   // { [id]: { niveis: [...] } }
  const [aba,        setAba]        = useState('lista'); // 'lista' | 'comparar'

  // Carrega atributos de um dragão da API quando adicionado à comparação
  const carregarApiDragao = async (id) => {
    if (apiDataMap[id]) return;
    try {
      const r = await fetch(`${API}/api/dragoes/${id}`);
      if (!r.ok) return;
      const d = await r.json();
      setApiDataMap(prev => ({ ...prev, [id]: d }));
    } catch { /* sem dados da API, tabela mostra '—' */ }
  };

  const toggleComparar = (id) => {
    setComparando(prev => {
      if (prev.includes(id)) return prev.filter(x => x !== id);
      if (prev.length >= 3) return prev;
      carregarApiDragao(id);
      return [...prev, id];
    });
  };

  const removerComparacao = (id) => setComparando(prev => prev.filter(x => x !== id));

  const dragoesFiltrados = dbDragoes.filter(d =>
    d.nome.toLowerCase().includes(busca.toLowerCase()) ||
    d.elemento.toLowerCase().includes(busca.toLowerCase())
  );
  const elementos = [...new Set(dbDragoes.map(d => d.elemento))].sort();

  return (
    <div className="max-w-lg mx-auto pb-4" style={{ animation:'reveal-up 0.4s ease both' }}>

      {/* Header */}
      <div className="text-center px-4 py-3 rounded-xl mb-3 relative overflow-hidden"
        style={{ background:'linear-gradient(135deg,#1C3A5E 0%,#3B5C8C 60%,#1C3A5E 100%)' }}>
        <p className="font-cinzel font-bold text-base tracking-widest uppercase text-aoe-cream m-0">🐉 Grimório dos Dragões</p>
        <p className="font-nunito text-[0.65rem] tracking-widest text-aoe-cream/50 m-0 mt-0.5">Enciclopédia Dracônica</p>
      </div>

      {/* Abas */}
      <div className="flex gap-2 mb-3" style={{ borderBottom:`1.5px solid ${C.BORDER_SOFT}`, paddingBottom:0 }}>
        {[
          { id:'lista',   label:'📋 Lista'    },
          { id:'comparar', label:`⚔️ Comparar${comparando.length > 0 ? ` (${comparando.length})` : ''}` },
        ].map(a => (
          <button key={a.id} onClick={() => setAba(a.id)} style={{
            flex:1, padding:'8px 4px', fontFamily:'inherit', fontWeight:800,
            fontSize:'0.75rem', border:'none', cursor:'pointer',
            background:'transparent',
            color: aba === a.id ? C.ACCENT_DEEP : C.TEXT_MUTED,
            borderBottom: aba === a.id ? `2.5px solid ${C.ACCENT}` : '2.5px solid transparent',
            transition:'all 0.15s',
          }}>{a.label}</button>
        ))}
      </div>

      {/* ABA: COMPARAÇÃO */}
      {aba === 'comparar' && (
        <>
          {comparando.length === 0 ? (
            <div style={{ padding:'32px 20px', textAlign:'center', borderRadius:12,
              border:`2px dashed ${C.BORDER}`, background:C.BG_CARD }}>
              <p style={{ fontSize:'2.5rem', marginBottom:10 }}>⚔️</p>
              <p className="font-cinzel font-bold text-sm m-0 mb-2" style={{ color:C.TEXT_PRIMARY }}>
                Nenhum dragão selecionado
              </p>
              <p className="font-nunito text-xs m-0" style={{ color:C.TEXT_MUTED, lineHeight:1.6 }}>
                Vá para a aba <strong>Lista</strong> e clique no botão <strong>+</strong> em até 3 dragões para comparar os atributos lado a lado.
              </p>
            </div>
          ) : (
            <PainelComparacao
              ids={comparando}
              nivelIdx={nivelIdx}
              setNivelIdx={setNivelIdx}
              apiDataMap={apiDataMap}
              onRemover={removerComparacao}
            />
          )}
        </>
      )}

      {/* ABA: LISTA */}
      {aba === 'lista' && (
        <>
          {/* Busca */}
          <input
            className="tw-input mb-3"
            placeholder="🔍  Buscar dragão ou elemento..."
            value={busca}
            onChange={e => setBusca(e.target.value)}
          />

          {/* Hint comparação */}
          {comparando.length > 0 && (
            <div style={{ padding:'8px 12px', borderRadius:10, marginBottom:10,
              background:`${C.ACCENT}0F`, border:`1px solid ${C.ACCENT}30`,
              display:'flex', alignItems:'center', justifyContent:'space-between', gap:8 }}>
              <span className="font-nunito font-bold text-xs" style={{ color:C.ACCENT_DEEP }}>
                ⚔️ {comparando.length} dragão{comparando.length > 1 ? 'ões' : ''} selecionado{comparando.length > 1 ? 's' : ''}
              </span>
              <button onClick={() => setAba('comparar')} style={{
                padding:'4px 10px', borderRadius:6, border:`1px solid ${C.ACCENT}44`,
                background:`${C.ACCENT}22`, color:C.ACCENT_DEEP,
                fontSize:'0.7rem', fontWeight:800, cursor:'pointer', fontFamily:'inherit',
              }}>Ver comparação →</button>
            </div>
          )}

          {/* Lista por elemento */}
          {elementos.map(elem => {
            const lista = dragoesFiltrados.filter(d => d.elemento === elem);
            if (lista.length === 0) return null;
            return (
              <div key={elem}>
                <SectionDivider label={elem.toUpperCase()} />
                {lista.map(d => (
                  <DragaoCard
                    key={d.id}
                    dragao={d}
                    onClick={id => setRoute(`dragao_${id}`)}
                    selecionado={comparando.includes(d.id)}
                    onToggleComparar={toggleComparar}
                    noSlot={comparando.length >= 3}
                  />
                ))}
              </div>
            );
          })}

          {dragoesFiltrados.length === 0 && (
            <div className="py-10 text-center rounded-xl" style={{ border:`1px dashed ${C.BORDER}`, background:C.BG_CARD }}>
              <p className="text-4xl mb-2 m-0">🐉</p>
              <p className="font-nunito italic text-xs m-0" style={{ color:C.TEXT_MUTED }}>Nenhum dragão encontrado</p>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Dragoes;
