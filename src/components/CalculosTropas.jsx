import React, { useMemo, useState } from 'react';
import { C } from '../theme.js';
import { useTropas } from '../hooks/useTropas.js';
import { getIcone, getTipoAtaque, fmt, fmtFull, getAtributosResumo } from './tropas/tropaUtils.js';
import GameHeader from './shared/GameHeader.jsx';
import Modal from '../ui/Modal.jsx';
import { createPortal } from 'react-dom';

// ── Mini barra ──────────────────────────────────────────────────────────────
const MiniBar = ({ value, max, color }) => {
  const pct = max > 0 ? Math.min(100, (value / max) * 100) : 0;
  return (
    <div className="flex-1 h-1 rounded-full overflow-hidden" style={{ background: 'rgba(62,47,28,0.08)' }}>
      <div style={{ height: '100%', width: `${pct}%`, background: value ? `linear-gradient(90deg,${color}55,${color})` : 'transparent', borderRadius: 2 }} />
    </div>
  );
};

// ── Linha de seleção ────────────────────────────────────────────────────────
const SelectRow = ({ tropa, onClick }) => {
  const tipo   = getTipoAtaque(tropa);
  const resumo = getAtributosResumo(tropa);
  return (
    <div
      onClick={onClick}
      className="flex items-center gap-2.5 px-3 py-2.5 cursor-pointer rounded-lg transition-all"
      style={{ border: `1px solid ${C.BORDER_SOFT}`, borderLeft: `3px solid ${C.BORDER}`, background: C.BG_CARD }}
    >
      <span className="text-3xl leading-none shrink-0 w-8 text-center">{getIcone(tropa.nome)}</span>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 mb-0.5 flex-wrap">
          <span className="font-nunito font-black text-[0.82rem]" style={{ color: C.ACCENT }}>{tropa.nome}</span>
          <span className="font-nunito font-bold text-[0.65rem] px-1.5 py-0.5 rounded-full shrink-0"
            style={{ border: `1px solid ${tipo.color}55`, background: `${tipo.color}12`, color: tipo.color }}>
            {tipo.label}
          </span>
        </div>
        <div className="flex gap-2 items-center mb-1">
          {resumo.map((s, i) => (
            <span key={i} className="font-nunito text-[0.6rem] whitespace-nowrap" style={{ color: C.TEXT_SECONDARY }}>{s.icon} {s.val}</span>
          ))}
        </div>
        <div className="flex gap-1 items-center">
          <MiniBar value={tropa.vida}  max={32000} color={C.HEALTH}  />
          <MiniBar value={tropa.def}   max={5000}  color={C.DEFENSE} />
          <MiniBar value={Math.max(tropa.atqPerto, tropa.atqDist)} max={6000} color={C.ATTACK} />
          <MiniBar value={tropa.vel}   max={3000}  color={C.ENERGY}  />
        </div>
      </div>
      <div className="text-right shrink-0">
        <p className="font-nunito font-black text-[0.75rem] leading-none m-0" style={{ color: C.POWER }}>{tropa.poder}</p>
        <p className="font-nunito text-[0.55rem] tracking-wider m-0" style={{ color: C.TEXT_MUTED }}>POD</p>
      </div>
    </div>
  );
};

// ── Slot comparar ────────────────────────────────────────────────────────────
const SlotComparar = ({ tropa, label, side, onSelect }) => (
  <div
    onClick={() => onSelect(side)}
    className="flex-1 p-3 text-center cursor-pointer rounded-lg transition-all"
    style={{ border: tropa ? `2px solid ${C.ACCENT_HOVER}` : `2px dashed ${C.BORDER}`, background: tropa ? `rgba(200,148,10,0.06)` : 'transparent' }}
  >
    <p className="font-nunito font-black text-[0.68rem] tracking-widest mb-1.5 m-0" style={{ color: C.TEXT_SECONDARY }}>{label}</p>
    <div className="text-3xl mb-1.5 leading-none">{tropa ? getIcone(tropa.nome) : '＋'}</div>
    <p className="font-nunito font-black text-[0.68rem] leading-tight m-0" style={{ color: tropa ? C.ACCENT : C.BORDER }}>
      {tropa ? tropa.nome : 'Escolher'}
    </p>
    {tropa && <p className="font-nunito text-[0.7rem] mt-1 m-0" style={{ color: C.POWER }}>⭐ {tropa.poder}</p>}
  </div>
);

const ATTRS_COMPARAR = [
  { id: 'vida',     label: 'Vida',       icon: '❤️', color: C.HEALTH,  max: 32000 },
  { id: 'def',      label: 'Defesa',     icon: '🛡️', color: C.DEFENSE, max: 5000  },
  { id: 'atqPerto', label: 'Atq. Perto', icon: '⚔️', color: C.ATTACK,  max: 6000  },
  { id: 'atqDist',  label: 'Atq. Dist.', icon: '🏹', color: C.GOLD_MAIN, max: 6000 },
  { id: 'vel',      label: 'Vel.',       icon: '⚡', color: C.ENERGY,  max: 3000  },
  { id: 'poder',    label: 'Poder',      icon: '⭐', color: C.POWER,   max: 50    },
];

const CalculosTropas = ({ setRoute }) => {
  const { tropas } = useTropas();
  const [aba,              setAba]              = useState('marcha');
  const [tropaA,           setTropaA]           = useState(null);
  const [tropaB,           setTropaB]           = useState(null);
  const [esquadroes,       setEsquadroes]       = useState([]);
  const [selecionandoPara, setSelecionandoPara] = useState(null);
  const [busca,            setBusca]            = useState('');
  const [confirmDialog,    setConfirmDialog]    = useState({ open: false, title: '', text: '', acao: null });

  const tropasFiltradas = useMemo(() =>
    [...tropas]
      .filter(t => t.nome.toLowerCase().includes(busca.toLowerCase()))
      .sort((a, b) => a.nome.localeCompare(b.nome)),
    [busca, tropas]
  );

  const handleSelect = (tropa) => {
    if      (selecionandoPara === 'A')      setTropaA(tropa);
    else if (selecionandoPara === 'B')      setTropaB(tropa);
    else if (selecionandoPara === 'MARCHA') setEsquadroes(prev => [...prev, { tropa, qtd: '' }]);
    setSelecionandoPara(null);
    setBusca('');
  };

  const updateQtd = (index, value) => {
    const num = Number(value.replace(/\D/g, ''));
    setEsquadroes(prev => { const next = [...prev]; next[index] = { ...next[index], qtd: num || '' }; return next; });
  };

  const confirmarRemocao = (index, nome) =>
    setConfirmDialog({ open: true, title: 'Remover unidade', text: `Retirar ${nome} da formação?`, acao: () => setEsquadroes(prev => prev.filter((_, i) => i !== index)) });

  const solicitarSaida = () => {
    if (esquadroes.length > 0 || tropaA || tropaB) {
      setConfirmDialog({ open: true, title: 'Sair do simulador', text: 'Os dados da simulação serão perdidos. Confirma a saída?', acao: () => setRoute('tropas') });
    } else { setRoute('tropas'); }
  };

  const calcMarcha = useMemo(() => {
    let totTropas = 0, totPoder = 0, totCarga = 0, minVel = Infinity;
    esquadroes.forEach(({ tropa, qtd }) => {
      const q = qtd || 0;
      if (q > 0) { totTropas += q; totPoder += (tropa.poder || 0) * q; totCarga += (tropa.car || 0) * q; if (tropa.vel < minVel) minVel = tropa.vel; }
    });
    return { tropas: totTropas, poder: totPoder, carga: totCarga, velocidade: minVel === Infinity ? 0 : minVel };
  }, [esquadroes]);

  return (
    <div className="max-w-2xl mx-auto pb-6">
      {/* Confirm dialog */}
      <Modal open={confirmDialog.open} onClose={() => setConfirmDialog(d => ({ ...d, open: false }))} maxWidth={300}>
        <div className="p-4 text-center">
          <p className="font-nunito font-black text-sm m-0 mb-1" style={{ color: C.ERROR }}>{confirmDialog.title}</p>
          <p className="font-nunito text-sm m-0 mb-4" style={{ color: C.TEXT_SECONDARY }}>{confirmDialog.text}</p>
          <div className="flex gap-2 justify-center">
            <button className="btn-ghost flex-1" onClick={() => setConfirmDialog(d => ({ ...d, open: false }))}>Cancelar</button>
            <button className="btn-danger flex-1" onClick={() => { confirmDialog.acao?.(); setConfirmDialog(d => ({ ...d, open: false })); }}>Confirmar</button>
          </div>
        </div>
      </Modal>

      {/* Header */}
      <div className="mb-2">
        <GameHeader title="Simulador de Batalha" />
      </div>
      <button className="btn-ghost btn-sm mb-2.5" onClick={solicitarSaida}>← Voltar ao Catálogo</button>

      {/* Abas */}
      <div className="flex gap-2 mb-3">
        {[{ id: 'marcha', label: '🛡️ Marcha' }, { id: 'comparar', label: '⚔️ Comparar' }].map(({ id, label }) => {
          const ativo = aba === id;
          return (
            <button
              key={id} onClick={() => setAba(id)}
              className="flex-1 font-nunito font-black text-[0.8rem] py-2 rounded-lg transition-all border-none cursor-pointer"
              style={{ background: ativo ? C.ACCENT_HOVER : 'transparent', color: ativo ? '#0e0a03' : C.ACCENT_HOVER, border: `1.5px solid ${C.ACCENT_HOVER}` }}
            >
              {label}
            </button>
          );
        })}
      </div>

      {/* ABA MARCHA */}
      {aba === 'marcha' && (
        <div>
          <div className="tw-card mb-2.5">
            <GameHeader title="Formação de Marcha" fontSize="0.82rem" />
            <div className="p-3 flex flex-col gap-2">
              {esquadroes.length === 0 && (
                <div className="py-6 text-center opacity-50">
                  <p className="font-nunito text-[0.68rem] tracking-widest m-0" style={{ color: C.TEXT_SECONDARY }}>Nenhuma unidade adicionada</p>
                </div>
              )}
              {esquadroes.map((esq, idx) => (
                <div key={idx} className="flex items-center gap-2 px-2.5 py-2 rounded-lg"
                  style={{ border: `1px solid ${C.BORDER_SOFT}`, borderLeft: `3px solid ${C.BORDER}`, background: C.BG_CARD }}>
                  <span className="text-2xl leading-none shrink-0 w-7 text-center">{getIcone(esq.tropa.nome)}</span>
                  <span className="font-nunito font-black text-[0.78rem] flex-1 min-w-0 truncate" style={{ color: C.ACCENT }}>{esq.tropa.nome}</span>
                  <input
                    className="tw-input text-center font-nunito font-black"
                    style={{ width: 72, padding: '4px 8px', fontSize: '0.75rem' }}
                    placeholder="Qtd."
                    value={esq.qtd ? esq.qtd.toLocaleString('pt-BR') : ''}
                    onChange={e => updateQtd(idx, e.target.value)}
                    inputMode="numeric"
                  />
                  <button
                    className="shrink-0 w-7 h-7 rounded flex items-center justify-center text-sm transition-all border-none cursor-pointer"
                    style={{ color: C.ERROR, border: `1px solid ${C.ERROR}33`, background: 'transparent' }}
                    onClick={() => confirmarRemocao(idx, esq.tropa.nome)}
                  >
                    ✕
                  </button>
                </div>
              ))}
              <button
                className="font-nunito font-black text-xs py-2 rounded-lg transition-all border-none cursor-pointer mt-1"
                style={{ borderStyle: 'dashed', border: `1.5px dashed ${C.BORDER}`, background: 'transparent', color: C.TEXT_MUTED }}
                onClick={() => setSelecionandoPara('MARCHA')}
              >
                ＋ Adicionar Unidade
              </button>
            </div>
          </div>

          {/* Relatório */}
          <div className="tw-card overflow-hidden">
            <GameHeader title="Relatório" fontSize="0.82rem" />
            <div className="grid grid-cols-2">
              {[
                { label: 'Tropas',    value: fmt(calcMarcha.tropas),        color: C.ACCENT,       border: C.ACCENT_HOVER },
                { label: 'Poder',     value: fmt(calcMarcha.poder),         color: C.POWER,        border: C.POWER        },
                { label: 'Saque',     value: fmt(calcMarcha.carga),         color: C.ACCENT_HOVER, border: C.ACCENT_HOVER },
                { label: 'Vel. base', value: fmtFull(calcMarcha.velocidade), color: C.BLUE,         border: C.BLUE         },
              ].map(({ label, value, color, border }, i) => (
                <div key={label} className="py-3 px-2 text-center"
                  style={{ borderBottom: `3px solid ${border}`, borderRight: i % 2 === 0 ? `1px solid ${C.BORDER_SOFT}` : 'none', borderTop: i >= 2 ? `1px solid ${C.BORDER_SOFT}` : 'none' }}>
                  <p className="font-nunito font-bold text-[0.65rem] tracking-widest mb-1 m-0" style={{ color: C.TEXT_SECONDARY }}>{label.toUpperCase()}</p>
                  <p className="font-nunito font-black text-lg leading-none m-0" style={{ color }}>{value}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ABA COMPARAR */}
      {aba === 'comparar' && (
        <div>
          <div className="flex gap-3 mb-3 items-stretch">
            <SlotComparar tropa={tropaA} label="UNIDADE A" side="A" onSelect={setSelecionandoPara} />
            <div className="flex items-center px-1">
              <span className="font-nunito font-black text-sm" style={{ color: C.ERROR }}>VS</span>
            </div>
            <SlotComparar tropa={tropaB} label="UNIDADE B" side="B" onSelect={setSelecionandoPara} />
          </div>

          {(tropaA || tropaB) ? (
            <div className="tw-card overflow-hidden">
              <GameHeader title="Comparação de Atributos" fontSize="0.82rem" />
              <div className="p-3">
                {/* Nomes */}
                <div className="grid gap-1 mb-3" style={{ gridTemplateColumns: '1fr 36px 1fr' }}>
                  <p className="font-nunito font-black text-[0.75rem] m-0 truncate text-left" style={{ color: C.ACCENT }}>
                    {getIcone(tropaA?.nome || '')} {tropaA?.nome || '—'}
                  </p>
                  <div />
                  <p className="font-nunito font-black text-[0.75rem] m-0 truncate text-right" style={{ color: C.ACCENT }}>
                    {tropaB?.nome || '—'} {getIcone(tropaB?.nome || '')}
                  </p>
                </div>

                {ATTRS_COMPARAR.map(attr => {
                  const valA = tropaA ? (tropaA[attr.id] || 0) : 0;
                  const valB = tropaB ? (tropaB[attr.id] || 0) : 0;
                  const winA = valA > valB;
                  const winB = valB > valA;
                  const pctA = attr.max > 0 ? Math.min(100, (valA / attr.max) * 100) : 0;
                  const pctB = attr.max > 0 ? Math.min(100, (valB / attr.max) * 100) : 0;

                  return (
                    <div key={attr.id} className="mb-3">
                      <p className="text-center font-nunito font-black text-[0.6rem] tracking-widest m-0 mb-1" style={{ color: C.TEXT_SECONDARY }}>
                        {attr.icon} {attr.label}
                      </p>
                      <div className="grid gap-1 items-center" style={{ gridTemplateColumns: '1fr 28px 1fr' }}>
                        {/* Lado A */}
                        <div>
                          <p className="font-nunito font-black text-[0.78rem] text-right m-0 mb-1" style={{ color: winA ? C.SUCCESS : C.ACCENT }}>{fmtFull(valA)}</p>
                          <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(62,47,28,0.07)', transform: 'scaleX(-1)' }}>
                            <div style={{ height: '100%', width: `${pctA}%`, background: winA ? C.SUCCESS : attr.color, borderRadius: 2 }} />
                          </div>
                        </div>
                        {/* Ícone central */}
                        <div className="text-center text-sm">{attr.icon}</div>
                        {/* Lado B */}
                        <div>
                          <p className="font-nunito font-black text-[0.78rem] text-left m-0 mb-1" style={{ color: winB ? C.SUCCESS : C.ACCENT }}>{fmtFull(valB)}</p>
                          <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(62,47,28,0.07)' }}>
                            <div style={{ height: '100%', width: `${pctB}%`, background: winB ? C.SUCCESS : attr.color, borderRadius: 2 }} />
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="py-12 text-center rounded-xl opacity-50" style={{ border: `1px dashed ${C.BORDER}` }}>
              <p className="font-nunito text-[0.78rem] tracking-wide m-0" style={{ color: C.TEXT_SECONDARY }}>Selecione duas unidades para comparar</p>
            </div>
          )}
        </div>
      )}

      {/* GAVETA DE SELEÇÃO (full-screen portal) */}
      {selecionandoPara !== null && createPortal(
        <div className="fixed inset-0 z-50 flex flex-col" style={{ background: C.BG_MAIN }}>
          {/* Header */}
          <div className="flex items-center gap-3 px-3 py-2.5 sticky top-0 z-10"
            style={{ background: C.BG_CARD_TOP, borderBottom: `2px solid ${C.BORDER}` }}>
            <button
              className="w-8 h-8 flex items-center justify-center rounded-lg text-sm border-none cursor-pointer transition-all"
              style={{ color: C.ACCENT, background: 'transparent', border: `1px solid ${C.BORDER_SOFT}` }}
              onClick={() => { setSelecionandoPara(null); setBusca(''); }}
            >
              ✕
            </button>
            <p className="font-nunito font-black text-[0.85rem] tracking-wide flex-1 m-0" style={{ color: C.ACCENT }}>Selecionar Unidade</p>
            <span className="font-nunito text-xs" style={{ color: C.TEXT_SECONDARY }}>{tropasFiltradas.length} un.</span>
          </div>
          {/* Busca */}
          <div className="px-3 py-2" style={{ background: C.BG_CARD, borderBottom: `1px solid ${C.BORDER_SOFT}` }}>
            <input
              className="tw-input"
              placeholder="Buscar unidade..."
              value={busca}
              onChange={e => setBusca(e.target.value)}
              autoFocus
            />
          </div>
          {/* Lista */}
          <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-2">
            {tropasFiltradas.map(t => (
              <SelectRow key={t.nome} tropa={t} onClick={() => handleSelect(t)} />
            ))}
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};

export default CalculosTropas;
