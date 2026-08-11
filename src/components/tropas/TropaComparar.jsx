import React, { useState, useMemo } from 'react';
import { C } from '../../theme.js';
import { useTropas } from '../../hooks/useTropas.js';
import { getIcone, getTipoAtaque, fmtFull, ATRIBUTOS } from './tropaUtils.js';

const SLOT_MAX = 3;

/* ── Barra comparativa ───────────────────────────────────────────────────── */
const BarraComp = ({ values, max, color }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
    {values.map((v, i) => {
      const pct  = max > 0 ? Math.min(100, ((v || 0) / max) * 100) : 0;
      const isBest = v === Math.max(...values.filter(Boolean));
      return (
        <div key={i} style={{
          height: 6, borderRadius: 3, overflow: 'hidden',
          background: 'rgba(62,47,28,0.08)',
        }}>
          <div style={{
            height: '100%', width: `${pct}%`,
            background: isBest
              ? `linear-gradient(90deg,${color}88,${color})`
              : `linear-gradient(90deg,rgba(120,100,60,0.3),rgba(120,100,60,0.5))`,
            borderRadius: 3, transition: 'width 0.4s ease',
          }} />
        </div>
      );
    })}
  </div>
);

/* ── Slot de seleção ─────────────────────────────────────────────────────── */
const Slot = ({ tropa, onSelecionar, onRemover, index, cor }) => {
  if (!tropa) {
    return (
      <button
        onClick={onSelecionar}
        style={{
          flex: 1, minWidth: 0,
          padding: '12px 8px', borderRadius: 10,
          border: `2px dashed rgba(200,168,74,0.3)`,
          background: 'rgba(184,150,90,0.04)',
          cursor: 'pointer', textAlign: 'center',
          transition: 'all 0.15s',
        }}
        onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(200,168,74,0.6)'; e.currentTarget.style.background = 'rgba(184,150,90,0.08)'; }}
        onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(200,168,74,0.3)'; e.currentTarget.style.background = 'rgba(184,150,90,0.04)'; }}
      >
        <p style={{ fontSize: '1.4rem', margin: '0 0 4px' }}>➕</p>
        <p className="font-nunito font-bold"
          style={{ fontSize: '0.62rem', color: C.TEXT_MUTED, margin: 0, letterSpacing: '0.5px' }}>
          Tropa {index + 1}
        </p>
      </button>
    );
  }

  const tipo = getTipoAtaque(tropa);
  return (
    <div style={{
      flex: 1, minWidth: 0,
      padding: '8px', borderRadius: 10,
      border: `2px solid ${cor}40`,
      borderTop: `3px solid ${cor}`,
      background: `linear-gradient(180deg,${cor}0A,transparent)`,
      position: 'relative',
    }}>
      {/* Remover */}
      <button
        onClick={onRemover}
        style={{
          position: 'absolute', top: 4, right: 4,
          width: 18, height: 18, borderRadius: '50%',
          background: 'rgba(180,50,50,0.15)',
          border: '1px solid rgba(180,50,50,0.3)',
          color: '#c85c5c', fontSize: '0.6rem',
          cursor: 'pointer', lineHeight: 1,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
        ✕
      </button>

      <div style={{ textAlign: 'center', marginBottom: 6 }}>
        <div style={{ fontSize: '1.6rem', marginBottom: 3 }}>{getIcone(tropa.nome)}</div>
        <p className="font-nunito font-bold m-0"
          style={{
            fontSize: '0.66rem', color: C.TEXT_PRIMARY,
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
            lineHeight: 1.2, paddingRight: 12,
          }}>
          {tropa.nome}
        </p>
        <span className="font-nunito font-bold"
          style={{
            fontSize: '0.55rem', padding: '1px 5px', borderRadius: 6,
            background: `${tipo.color}15`, border: `1px solid ${tipo.color}35`,
            color: tipo.color,
          }}>
          {tipo.label}
        </span>
      </div>

      <div style={{ textAlign: 'center' }}>
        <p className="font-nunito font-black m-0" style={{ fontSize: '1.1rem', color: '#7c3aed' }}>
          {tropa.poder}
        </p>
        <p className="font-nunito m-0" style={{ fontSize: '0.5rem', color: C.TEXT_FAINT, letterSpacing: '1px' }}>
          PODER
        </p>
      </div>
    </div>
  );
};

/* ── Picker de tropa ─────────────────────────────────────────────────────── */
const Picker = ({ tropas, selecionadas, onEscolher, onFechar }) => {
  const [busca, setBusca] = useState('');
  const lista = useMemo(() =>
    tropas
      .filter(item => !selecionadas.find(s => s?.nome === item.nome))
      .filter(item => item.nome.toLowerCase().includes(busca.toLowerCase()))
      .sort((a, b) => a.nome.localeCompare(b.nome)),
    [tropas, selecionadas, busca]
  );

  return (
    <div
      onClick={onFechar}
      style={{
        position: 'fixed', inset: 0, zIndex: 1000,
        background: 'rgba(20,14,8,0.72)',
        display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
        animation: 'fadeIn 0.18s ease',
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          width: '100%', maxWidth: 480,
          maxHeight: '80vh',
          background: C.BG_MAIN,
          borderRadius: '18px 18px 0 0',
          display: 'flex', flexDirection: 'column',
          animation: 'slideUp 0.22s ease',
          boxShadow: '0 -8px 32px rgba(0,0,0,0.4)',
        }}
      >
        {/* Header */}
        <div style={{
          padding: '10px 14px 12px',
          background: 'linear-gradient(135deg,#1C3A5E,#2A4C72)',
          borderRadius: '18px 18px 0 0',
          borderBottom: `1px solid rgba(200,168,74,0.3)`,
          flexShrink: 0,
        }}>
          <div style={{ width: 36, height: 4, borderRadius: 2, background: 'rgba(248,242,224,0.25)', margin: '0 auto 10px' }} />
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
            <p className="font-cinzel font-bold m-0"
              style={{ fontSize: '0.75rem', color: '#F8F2E0', letterSpacing: '1.5px' }}>
              Escolher Tropa
            </p>
            <button onClick={onFechar} style={{
              width: 28, height: 28, borderRadius: 7,
              background: 'rgba(248,242,224,0.1)', border: '1px solid rgba(248,242,224,0.2)',
              color: 'rgba(248,242,224,0.7)', cursor: 'pointer', fontSize: '0.9rem',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>✕</button>
          </div>
          <input
            className="tw-input"
            placeholder="🔍  Buscar..."
            value={busca}
            onChange={e => setBusca(e.target.value)}
            autoFocus
            style={{ background: 'rgba(248,242,224,0.08)', borderColor: 'rgba(200,168,74,0.3)', color: '#F8F2E0' }}
          />
        </div>

        {/* Lista */}
        <div style={{ overflowY: 'auto', flex: 1, padding: '8px 10px 16px' }}>
          {lista.map(item => {
            const tipo = getTipoAtaque(item, t);
            return (
              <button
                key={item.nome}
                onClick={() => onEscolher(item)}
                style={{
                  width: '100%', textAlign: 'left', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', gap: 10,
                  padding: '9px 10px', borderRadius: 9, marginBottom: 5,
                  background: C.BG_CARD,
                  border: `1px solid rgba(200,168,74,0.18)`,
                  borderLeft: `3px solid ${tipo.color}`,
                  transition: 'background 0.12s',
                }}
                onMouseEnter={e => e.currentTarget.style.background = `${tipo.color}0E`}
                onMouseLeave={e => e.currentTarget.style.background = C.BG_CARD}
              >
                <span style={{ fontSize: '1.25rem' }}>{getIcone(item.nome)}</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p className="font-nunito font-bold m-0"
                    style={{ fontSize: '0.8rem', color: C.TEXT_PRIMARY,
                      overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {item.nome}
                  </p>
                  <p className="font-nunito m-0" style={{ fontSize: '0.6rem', color: C.TEXT_MUTED }}>
                    {tipo.label}
                  </p>
                </div>
                <span className="font-nunito font-black"
                  style={{ fontSize: '0.9rem', color: '#7c3aed', flexShrink: 0 }}>
                  {item.poder}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

/* ── Cores dos slots ─────────────────────────────────────────────────────── */
const CORES = ['#5C7FA3', '#C85C5C', '#5A8A5C'];

/* ── Tela principal ──────────────────────────────────────────────────────── */
const TropaComparar = () => {
  const { tropas } = useTropas();
  const [slots,      setSlots]      = useState([null, null, null]);
  const [pickerSlot, setPickerSlot] = useState(null); // índice do slot abrindo picker

  const adicionarTropa = (tropa) => {
    if (pickerSlot === null) return;
    setSlots(s => s.map((v, i) => i === pickerSlot ? tropa : v));
    setPickerSlot(null);
  };

  const removerTropa = (idx) =>
    setSlots(s => s.map((v, i) => i === idx ? null : v));

  const tropasAtivas = slots.filter(Boolean);

  return (
    <>
      {pickerSlot !== null && (
        <Picker
          tropas={tropas}
          selecionadas={slots}
          onEscolher={adicionarTropa}
          onFechar={() => setPickerSlot(null)}
        />
      )}

      <div style={{ maxWidth: 480, margin: '0 auto', paddingBottom: 16 }}>

        {/* Header */}
        <div style={{
          background: 'linear-gradient(135deg,#2A1A4A,#4A2A7A)',
          borderRadius: '12px 12px 0 0',
          padding: '12px 16px 10px', textAlign: 'center', marginBottom: 0,
        }}>
          <p className="font-cinzel font-bold uppercase m-0"
            style={{ fontSize: '0.8rem', letterSpacing: '3px', color: '#F0E8FF' }}>
            ⚖️ Comparar Tropas
          </p>
          <p className="font-nunito font-semibold m-0"
            style={{ fontSize: '0.62rem', color: 'rgba(180,150,230,0.7)', marginTop: 3 }}>
            Selecione até 3 unidades para comparar lado a lado
          </p>
        </div>

        <div style={{
          background: C.BG_SECONDARY,
          border: `1.5px solid ${C.BORDER}`, borderTop: 'none',
          borderRadius: '0 0 12px 12px',
          padding: '12px 10px 14px',
          marginBottom: 14,
        }}>
          {/* Slots */}
          <div style={{ display: 'flex', gap: 8, marginBottom: 4 }}>
            {slots.map((tropa, i) => (
              <Slot
                key={i}
                index={i}
                tropa={tropa}
                cor={CORES[i]}
                onSelecionar={() => setPickerSlot(i)}
                onRemover={() => removerTropa(i)}
              />
            ))}
          </div>

          {tropasAtivas.length === 0 && (
            <p className="font-nunito text-center m-0"
              style={{ fontSize: '0.7rem', color: C.TEXT_FAINT, marginTop: 8, fontStyle: 'italic' }}>
              Clique em ➕ para adicionar uma tropa
            </p>
          )}
        </div>

        {/* Tabela comparativa — só aparece quando há tropas */}
        {tropasAtivas.length >= 2 && (
          <div style={{
            background: C.BG_CARD,
            border: `1.5px solid rgba(200,168,74,0.22)`,
            borderRadius: 12, overflow: 'hidden',
          }}>
            {/* Cabeçalho da tabela */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: `1fr repeat(${tropasAtivas.length}, minmax(0,1fr))`,
              background: 'rgba(200,168,74,0.1)',
              borderBottom: `1px solid rgba(200,168,74,0.2)`,
              padding: '6px 10px',
            }}>
              <span className="font-nunito font-black uppercase"
                style={{ fontSize: '0.58rem', color: C.TEXT_MUTED, letterSpacing: '1.5px' }}>
                Atributo
              </span>
              {tropasAtivas.map((t, i) => (
                <span key={i} className="font-nunito font-black text-center"
                  style={{ fontSize: '0.58rem', color: CORES[slots.indexOf(t)], letterSpacing: '0.5px',
                    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {t.nome.split(' ')[0]}
                </span>
              ))}
            </div>

            {/* Linhas de atributos */}
            {ATRIBUTOS.map((attr, ri) => {
              const vals = tropasAtivas.map(tropa => tropa[attr.id] || 0);
              const maxVal = Math.max(...vals);
              return (
                <div
                  key={attr.id}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: `1fr repeat(${tropasAtivas.length}, minmax(0,1fr))`,
                    padding: '7px 10px',
                    borderBottom: ri < ATRIBUTOS.length - 1 ? `1px solid rgba(200,168,74,0.1)` : 'none',
                    background: ri % 2 === 0 ? 'transparent' : 'rgba(200,168,74,0.03)',
                    alignItems: 'center',
                  }}
                >
                  {/* Label */}
                  <span className="font-nunito font-semibold"
                    style={{ fontSize: '0.65rem', color: C.TEXT_MUTED }}>
                    {attr.icon} {attr.label}
                  </span>

                  {/* Valores */}
                  {tropasAtivas.map((t, ci) => {
                    const val  = t[attr.id] || 0;
                    const best = val === maxVal && maxVal > 0;
                    return (
                      <div key={ci} style={{ textAlign: 'center' }}>
                        <span className="font-nunito font-black"
                          style={{
                            fontSize: '0.75rem',
                            color: best ? CORES[slots.indexOf(t)] : C.TEXT_FAINT,
                            fontWeight: best ? 900 : 600,
                          }}>
                          {val === 0 ? '—' : fmtFull(val)}
                        </span>
                        {/* Barrinha mini */}
                        <div style={{
                          marginTop: 2, height: 3, borderRadius: 2, overflow: 'hidden',
                          background: 'rgba(62,47,28,0.07)',
                        }}>
                          <div style={{
                            height: '100%',
                            width: maxVal > 0 ? `${(val / maxVal) * 100}%` : '0%',
                            background: best
                              ? `linear-gradient(90deg,${CORES[slots.indexOf(t)]}80,${CORES[slots.indexOf(t)]})`
                              : 'rgba(120,100,60,0.25)',
                            borderRadius: 2, transition: 'width 0.4s ease',
                          }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        )}

        {/* Instrução quando tem só 1 */}
        {tropasAtivas.length === 1 && (
          <div style={{
            textAlign: 'center', padding: '20px 16px',
            border: `1px dashed rgba(200,168,74,0.25)`, borderRadius: 12,
            background: C.BG_CARD,
          }}>
            <p style={{ fontSize: '1.5rem', marginBottom: 6 }}>⚖️</p>
            <p className="font-nunito font-semibold m-0"
              style={{ fontSize: '0.78rem', color: C.TEXT_MUTED }}>
              Adicione mais uma tropa para iniciar a comparação
            </p>
          </div>
        )}
      </div>
    </>
  );
};

export default TropaComparar;
