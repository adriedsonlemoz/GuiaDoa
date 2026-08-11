import React, { useMemo } from 'react';
import { C } from '../theme.js';
import { useTropas } from '../hooks/useTropas.js';

/* ── Classifica tropa como corpo a corpo ou distância ────────────────────── */
const classificar = (t) => {
  // Usa campo explícito do banco se disponível
  if (t.combate === 'distancia')    return 'dist';
  if (t.combate === 'corpo_a_corpo') return 'cc';
  // Fallback: inferência por atributos
  if (t.atqDist > 0 && t.atqPerto === 0) return 'dist';
  if (t.atqDist > t.atqPerto)            return 'dist';
  if (t.atqPerto > 0)                    return 'cc';
  return 'suporte';
};

const contarTipos = (tropas) => {
  let cc = 0, dist = 0, rapidas = 0;
  tropas.forEach(tropa => {
    const cls = classificar(tropa);
    if (cls === 'cc')    cc++;
    if (cls === 'dist')  dist++;
    if (tropa.rapida)    rapidas++;
  });
  return { cc, dist, rapidas };
};

/* ── Card de entrada ─────────────────────────────────────────────────────── */
const HubCard = ({ icon, title, desc, meta, cor, onClick, badge }) => (
  <button
    onClick={onClick}
    style={{
      width: '100%', textAlign: 'left', cursor: 'pointer',
      background: C.BG_CARD,
      border: `1.5px solid rgba(200,168,74,0.22)`,
      borderLeft: `4px solid ${cor}`,
      borderRadius: 14,
      padding: '14px 16px',
      display: 'flex', alignItems: 'center', gap: 14,
      position: 'relative', overflow: 'hidden',
      transition: 'transform 0.12s, box-shadow 0.12s',
      boxShadow: '0 2px 8px rgba(62,47,28,0.08)',
    }}
    onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = `0 6px 20px ${cor}22`; }}
    onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 2px 8px rgba(62,47,28,0.08)'; }}
    onTouchStart={e => { e.currentTarget.style.transform = 'scale(0.98)'; }}
    onTouchEnd={e => { e.currentTarget.style.transform = 'none'; }}
  >
    <div style={{
      position: 'absolute', inset: 0,
      background: `linear-gradient(135deg, ${cor}06, transparent 60%)`,
      pointerEvents: 'none',
    }} />

    <div style={{
      width: 52, height: 52, borderRadius: 12, flexShrink: 0,
      background: `${cor}14`, border: `2px solid ${cor}30`,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: '1.7rem',
      boxShadow: `0 2px 10px ${cor}20`,
    }}>
      {icon}
    </div>

    <div style={{ flex: 1, minWidth: 0, position: 'relative' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3 }}>
        <span className="font-cinzel font-bold"
          style={{ fontSize: '0.88rem', color: C.TEXT_PRIMARY, letterSpacing: '0.3px' }}>
          {title}
        </span>
        {badge && (
          <span className="font-nunito font-black"
            style={{
              fontSize: '0.55rem', padding: '1px 6px', borderRadius: 10,
              background: `${cor}22`, border: `1px solid ${cor}50`,
              color: cor, letterSpacing: '1px', textTransform: 'uppercase',
            }}>
            {badge}
          </span>
        )}
      </div>
      <span className="font-nunito font-semibold"
        style={{ fontSize: '0.73rem', color: C.TEXT_MUTED, lineHeight: 1.4, display: 'block' }}>
        {desc}
      </span>
      {meta && (
        <div style={{ display: 'flex', gap: 10, marginTop: 6, flexWrap: 'wrap' }}>
          {meta.map(m => (
            <span key={m.label} className="font-nunito font-bold"
              style={{ fontSize: '0.65rem', color: m.cor || C.TEXT_SECONDARY }}>
              {m.icon} {m.valor} {m.label}
            </span>
          ))}
        </div>
      )}
    </div>

    <span style={{ color: C.TEXT_FAINT, fontSize: '1.1rem', flexShrink: 0, position: 'relative' }}>›</span>
  </button>
);

/* ── Separador ───────────────────────────────────────────────────────────── */
const Div = ({ label }) => (
  <div className="flex items-center gap-2" style={{ padding: '6px 0 4px' }}>
    <div style={{ flex: 1, height: 1, background: `linear-gradient(90deg,transparent,${C.BORDER})`, opacity: 0.35 }} />
    <span className="font-nunito font-black uppercase tracking-widest"
      style={{ fontSize: '0.58rem', color: C.TEXT_FAINT }}>
      {label}
    </span>
    <div style={{ flex: 1, height: 1, background: `linear-gradient(270deg,transparent,${C.BORDER})`, opacity: 0.35 }} />
  </div>
);

/* ── Tela principal ──────────────────────────────────────────────────────── */
const Tropas = ({ setRoute }) => {
  const { tropas, carregando } = useTropas();

  const tipos = useMemo(() => contarTipos(tropas), [tropas]);
  const poderMax = useMemo(() =>
    tropas.length ? Math.max(...tropas.map(tropa => tropa.poder || 0)) : 0,
    [tropas]
  );
  const poderMedio = useMemo(() =>
    tropas.length ? Math.round(tropas.reduce((s, t) => s + (t.poder || 0), 0) / tropas.length) : 0,
    [tropas]
  );

  return (
    <div style={{ maxWidth: 480, margin: '0 auto', paddingBottom: 16, animation: 'reveal-up 0.35s ease both' }}>

      {/* ── HEADER ───────────────────────────────────────────────────────── */}
      <div style={{
        background: 'linear-gradient(135deg,#1C3A5E,#2A4C72,#1C3A5E)',
        borderRadius: '12px 12px 0 0',
        padding: '14px 16px 12px',
        textAlign: 'center',
      }}>
        <div style={{ fontSize: '2rem', marginBottom: 6 }}>⚔️</div>
        <p className="font-cinzel font-bold uppercase m-0"
          style={{ fontSize: '0.85rem', letterSpacing: '3px', color: '#F8F2E0' }}>
          Central de Unidades
        </p>
        <p className="font-nunito font-semibold m-0"
          style={{ fontSize: '0.63rem', color: 'rgba(200,168,74,0.7)', letterSpacing: '1.5px', marginTop: 4 }}>
          {carregando ? '⟳ Sincronizando…' : tropas.length > 0 ? `${tropas.length} unidades disponíveis` : 'Carregando unidades…'}
        </p>
      </div>

      {/* Stats rápidos — 4 colunas */}
      {tropas.length > 0 && (
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(4,1fr)',
          background: C.BG_SECONDARY,
          border: `1.5px solid ${C.BORDER}`, borderTop: 'none',
          borderRadius: '0 0 12px 12px',
          marginBottom: 16, overflow: 'hidden',
        }}>
          {[
            { icon: '⚔️', val: tipos.cc,       label: 'C. a Corpo', cor: '#b91c1c' },
            { icon: '🏹', val: tipos.dist,      label: 'Distância',  cor: '#0369a1' },
            { icon: '⚡', val: tipos.rapidas,   label: 'Rápidas',    cor: '#C87A2C' },
            { icon: '⭐', val: poderMax,         label: 'Poder Máx.', cor: '#7c3aed' },
          ].map((s, i) => (
            <div key={s.label} style={{
              textAlign: 'center', padding: '8px 4px',
              borderRight: i < 3 ? `1px solid rgba(200,168,74,0.15)` : 'none',
            }}>
              <p className="font-nunito font-black m-0"
                style={{ fontSize: '0.95rem', color: s.cor || C.TEXT_PRIMARY }}>
                {s.val}
              </p>
              <p className="font-nunito font-semibold m-0"
                style={{ fontSize: '0.54rem', color: C.TEXT_MUTED, marginTop: 2 }}>
                {s.icon} {s.label}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* ── CARDS ────────────────────────────────────────────────────────── */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>

        <HubCard
          icon="📖"
          title="Enciclopédia"
          desc="Veja todas as unidades com atributos detalhados, tipo de combate e poder."
          cor="#5C7FA3"
          badge={tropas.length > 0 ? `${tropas.length} tropas` : undefined}
          meta={tropas.length > 0 ? [
            { icon: '⚔️', valor: tipos.cc,   label: 'corpo a corpo', cor: '#b91c1c' },
            { icon: '🏹', valor: tipos.dist,  label: 'distância',    cor: '#0369a1' },
            { icon: '⭐', valor: poderMedio,  label: 'poder médio',  cor: '#8B6BAE' },
          ] : undefined}
          onClick={() => setRoute('tropas_lista')}
        />

        <HubCard
          icon="⚖️"
          title="Comparar Tropas"
          desc="Selecione até 3 unidades e compare seus atributos lado a lado."
          cor="#8B6BAE"
          badge="novo"
          onClick={() => setRoute('tropas_comparar')}
        />
      </div>
    </div>
  );
};

export default Tropas;
