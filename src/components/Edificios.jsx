import React, { useState, useEffect } from 'react';
import { C } from '../theme.js';
import GameHeader from './shared/GameHeader.jsx';

import { useGameData } from '../data/GameDataContext.jsx';

const COLUMN_LABELS = {
  desc: 'Efeito', pop: 'Pop.', prodHora: 'Prod./h', cap: 'Cap. Máx.',
  maxTropas: 'Máx. Tropas', popAumento: 'Aumento Pop.', territorios: 'Territórios',
  reforcos: 'Reforços', areas: 'Áreas', marchas: 'Marchas', tropasPorMarcha: 'Tropas/Marcha',
};

const fmt = v =>
  v === null || v === undefined ? '—'
  : typeof v === 'number' ? v.toLocaleString('pt-BR') : v;

const Edificios = () => {
  const { edificios } = useGameData();
  const [sel, setSel] = useState(null);
  const [aba, setAba] = useState('tabela');
  const [nivel, setNivel] = useState('1');
  const [qtd, setQtd] = useState('1');

  useEffect(() => {
    if (!sel && edificios.length > 0) setSel(edificios[0].slug);
  }, [edificios, sel]);

  const ed    = edificios.find(e => e.slug === sel);
  const dados = ed?.niveis || [];
  const colunas = ed?.colunas?.length
    ? ed.colunas
    : dados.length > 0
      ? Object.keys(dados[0]).filter(k => k !== 'nivel').map(k => ({ key: k, label: COLUMN_LABELS[k] || k.toUpperCase(), tipo: 'number' }))
      : [];
  const isDescOnly = colunas.length === 1 && colunas[0]?.key === 'desc';
  const nivelNum   = parseInt(nivel, 10) || 1;
  const nivelFim   = Math.min(nivelNum + (parseInt(qtd, 10) || 1) - 1, dados.length);
  const nAtual     = dados.find(r => String(r.nivel) === String(nivelNum));
  const nFim       = dados.find(r => r.nivel === nivelFim);

  if (edificios.length === 0) return (
    <div className="max-w-2xl mx-auto pb-4">
      <GameHeader title="Construções" />
      <div style={{ padding:'40px 20px', textAlign:'center', background:C.BG_CARD, borderRadius:12, border:`2px dashed ${C.BORDER}` }}>
        <p style={{ fontSize:'2.5rem', marginBottom:10 }}>🏗️</p>
        <p className="font-cinzel font-bold" style={{ color:C.TEXT_PRIMARY, marginBottom:8 }}>Nenhum edifício cadastrado</p>
        <p style={{ fontSize:'0.78rem', color:C.TEXT_SECONDARY, lineHeight:1.6 }}>
          Nenhum edifício foi encontrado no MongoDB. Verifique o estado da migração automática no Admin.
        </p>
      </div>
    </div>
  );

  return (
    <div className="max-w-2xl mx-auto pb-4">
      <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:0.5}}`}</style>

      <div className="rounded-t-xl px-4 py-2.5 text-center overflow-hidden mb-0"
        style={{ background:'linear-gradient(135deg,#1C3A5E 0%,#3B5C8C 50%,#1C3A5E 100%)' }}>
        <p className="font-cinzel font-bold text-sm tracking-widest uppercase text-aoe-cream m-0">🏗️ Construções</p>
        <p className="font-nunito text-[0.65rem] tracking-widest text-aoe-cream/50 m-0 mt-0.5">Engenharia da Cidade</p>
      </div>

      {/* Selector */}
      <div className="flex gap-1.5 overflow-x-auto py-2.5 px-2 mb-3"
        style={{ background:C.BG_SECONDARY, border:`1.5px solid ${C.BORDER}`, borderTop:'none', borderRadius:'0 0 10px 10px', scrollbarWidth:'none' }}>
        {edificios.map(e => {
          const active = sel === e.slug;
          return (
            <button key={e.slug}
              onClick={() => { setSel(e.slug); setAba('tabela'); setNivel('1'); setQtd('1'); }}
              className="flex flex-col items-center gap-0.5 rounded-xl shrink-0 transition-all border-none cursor-pointer"
              style={{
                padding:'7px 10px', minWidth:58,
                background: active ? `linear-gradient(135deg,${C.ACCENT},${C.ACCENT_HOVER})` : C.BG_CARD,
                border:`2px solid ${active ? C.ACCENT_DEEP : C.BORDER_SOFT}`,
                boxShadow: active ? '0 2px 8px rgba(168,132,74,0.4)' : 'none',
                transform: active ? 'translateY(-1px)' : 'none',
              }}>
              <span className="text-xl leading-none">{e.icone || '🏗️'}</span>
              <span className="font-nunito font-bold text-center leading-tight" style={{ fontSize:9, color: active ? '#FFF8EE' : C.TEXT_MUTED }}>{e.nome}</span>
              <span className="font-nunito font-bold rounded" style={{ fontSize:8, padding:'1px 4px', background: active ? 'rgba(255,255,255,0.2)' : C.BG_SECONDARY, color: active ? 'rgba(255,248,238,0.8)' : C.TEXT_FAINT }}>{e.tag || '—'}</span>
            </button>
          );
        })}
      </div>

      {/* Card edifício */}
      {ed && (
        <div className="tw-card mb-3">
          <div className="flex items-center gap-3 p-3" style={{ borderBottom:`1px solid ${C.BORDER_SOFT}` }}>
            <div className="w-14 h-14 shrink-0 flex items-center justify-center text-4xl rounded-xl"
              style={{ background:C.BG_SECONDARY, border:`2px solid ${C.BORDER}` }}>
              {ed.icone || '🏗️'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-cinzel font-bold text-sm m-0" style={{ color:C.TEXT_PRIMARY }}>{ed.nome}</p>
              <span className="font-nunito font-bold text-[0.65rem] px-1.5 py-0.5 rounded"
                style={{ background:`${C.ACCENT}20`, border:`1px solid ${C.BORDER_SOFT}`, color:C.ACCENT_DEEP }}>
                {ed.tag || '—'}
              </span>
              {ed.descricao && <p className="font-nunito text-[0.72rem] leading-snug mt-1 m-0" style={{ color:C.TEXT_SECONDARY }}>{ed.descricao}</p>}
            </div>
          </div>

          {/* Abas */}
          <div className="flex" style={{ borderBottom:`1.5px solid ${C.BORDER_SOFT}` }}>
            {['tabela','ganhos'].map(a => (
              <button key={a} onClick={() => setAba(a)}
                className="flex-1 font-nunito font-bold text-xs py-2 tracking-wide transition-all border-none cursor-pointer"
                style={{ background: aba===a ? C.BG_CARD : C.BG_SECONDARY, color: aba===a ? C.ACCENT_DEEP : C.TEXT_MUTED, borderBottom: aba===a ? `2px solid ${C.ACCENT}` : '2px solid transparent' }}>
                {a === 'tabela' ? '📋 Tabela' : '📊 Ganhos'}
              </button>
            ))}
          </div>

          {/* Tabela */}
          {aba === 'tabela' && dados.length === 0 && (
            <p style={{ padding:24, textAlign:'center', color:C.TEXT_MUTED, fontSize:'0.8rem' }}>Nenhum nível cadastrado.</p>
          )}
          {aba === 'tabela' && dados.length > 0 && (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr>
                    <th className="tw-th" style={{ minWidth:40 }}>Nível</th>
                    {colunas.map(c => <th key={c.key} className="tw-th" style={{ minWidth: isDescOnly ? 180 : 80 }}>{c.label}</th>)}
                  </tr>
                </thead>
                <tbody>
                  {dados.map((row, i) => (
                    <tr key={i} style={{ background: String(row.nivel)===String(nivel) ? `${C.ACCENT}12` : 'transparent' }}>
                      <td className="tw-td font-bold text-center" style={{ color:C.ACCENT_DEEP }}>{row.nivel}</td>
                      {colunas.map(c => <td key={c.key} className="tw-td" style={{ color:C.TEXT_SECONDARY }}>{fmt(row[c.key])}</td>)}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Ganhos */}
          {aba === 'ganhos' && (
            <div className="p-3">
              <div className="flex gap-2 mb-3">
                <div className="flex-1">
                  <label className="font-nunito font-bold text-[0.68rem] tracking-wider block mb-1" style={{ color:C.TEXT_MUTED }}>NÍVEL INICIAL</label>
                  <input type="number" min={1} max={dados.length} className="tw-input text-center" value={nivel} onChange={e => setNivel(e.target.value)} />
                </div>
                <div className="flex-1">
                  <label className="font-nunito font-bold text-[0.68rem] tracking-wider block mb-1" style={{ color:C.TEXT_MUTED }}>QTD. NÍVEIS</label>
                  <input type="number" min={1} className="tw-input text-center" value={qtd} onChange={e => setQtd(e.target.value)} />
                </div>
              </div>
              {nAtual && nFim ? (
                <div className="space-y-1.5">
                  {colunas.filter(c => c.key !== 'desc').map(c => {
                    const de=nAtual[c.key], para=nFim[c.key];
                    const diff = typeof de==='number' && typeof para==='number' ? para-de : null;
                    return (
                      <div key={c.key} className="flex items-center justify-between px-3 py-2 rounded-lg"
                        style={{ background:C.BG_SECONDARY, border:`1px solid ${C.BORDER_SOFT}` }}>
                        <span className="font-nunito font-bold text-xs" style={{ color:C.TEXT_MUTED }}>{c.label}</span>
                        <div className="flex items-center gap-1.5 text-xs font-nunito font-bold">
                          <span style={{ color:C.TEXT_SECONDARY }}>{fmt(de)}</span>
                          <span style={{ color:C.TEXT_FAINT }}>→</span>
                          <span style={{ color:C.ACCENT_DEEP }}>{fmt(para)}</span>
                          {diff !== null && diff > 0 && (
                            <span className="px-1.5 py-0.5 rounded text-[0.65rem]"
                              style={{ background:`${C.SUCCESS}20`, color:C.SUCCESS, border:`1px solid ${C.SUCCESS}40` }}>
                              +{fmt(diff)}
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-center font-nunito text-xs italic py-4 m-0" style={{ color:C.TEXT_FAINT }}>Nível fora do intervalo disponível</p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Edificios;
