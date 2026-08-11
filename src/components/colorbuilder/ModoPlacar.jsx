import React, { useState, useMemo } from 'react';
import { T, C, safeCopy } from './styles.js';
import { PLACAR_CORES_PADRAO } from './data.js';

// ─── Paleta rápida de cores para os seletores ────────────────────────────────
const CORES_RAPIDAS = [
  'FFD700','FFA500','FF4500','FF1493','FF0000','8A2BE2',
  '1E90FF','00CED1','00FF7F','39FF14','FFFFFF','C0C0C0',
  '000000','8B4513','009639','FEDF00',
];

// ─── Seletor de cor compacto (paleta + hex manual) ───────────────────────────
function ColorPicker({ label, value, onChange }) {
  const [hexInput, setHexInput] = useState(value);

  return (
    <div style={{ marginBottom: 10 }}>
      <label style={{
        display: 'block', fontSize: '0.62rem', color: C.TEXT_MUTED,
        textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 5, fontWeight: 700,
      }}>{label}</label>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
        <div style={{
          width: 28, height: 28, borderRadius: 6, background: '#' + value,
          border: '2px solid rgba(200,168,74,0.4)', flexShrink: 0,
        }} />
        <input
          type="text" value={hexInput} maxLength={6}
          onChange={e => {
            const v = e.target.value.replace(/[^0-9a-fA-F]/g, '').toUpperCase();
            setHexInput(v);
            if (v.length === 6) onChange(v);
          }}
          placeholder="FFD700"
          style={{
            ...T.input, flex: 1, minHeight: 30, fontSize: '0.78rem',
            padding: '5px 9px', fontFamily: 'monospace',
          }}
        />
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
        {CORES_RAPIDAS.map(hex => (
          <div key={hex}
            onClick={() => { onChange(hex); setHexInput(hex); }}
            title={hex}
            style={{
              width: 20, height: 20, borderRadius: 5, background: '#' + hex,
              cursor: 'pointer', flexShrink: 0,
              border: value === hex ? `2px solid ${C.ACCENT}` : '2px solid transparent',
              boxShadow: value === hex ? `0 0 0 2px rgba(200,168,74,0.35)` : 'none',
            }}
          />
        ))}
      </div>
    </div>
  );
}

// ═════════════════════════════════════════════════════════════════════════════
export default function ModoPlacar({ showToast }) {
  const [timeA, setTimeA] = useState('Brasil');
  const [timeB, setTimeB] = useState('Haiti');

  const [placarAntA, setPlacarAntA] = useState('3');
  const [placarAntB, setPlacarAntB] = useState('1');
  const [placarNovA, setPlacarNovA] = useState('3');
  const [placarNovB, setPlacarNovB] = useState('1');

  const [corTimeA,     setCorTimeA]     = useState(PLACAR_CORES_PADRAO.timeA);
  const [corTimeB,     setCorTimeB]     = useState(PLACAR_CORES_PADRAO.timeB);
  const [corPlacar,    setCorPlacar]    = useState(PLACAR_CORES_PADRAO.placar);
  const [corSeparador, setCorSeparador] = useState(PLACAR_CORES_PADRAO.separador);
  const [corDestaque,  setCorDestaque]  = useState(PLACAR_CORES_PADRAO.destaque);

  const [codeCopied, setCodeCopied] = useState(false);

  // ── Detecta quem marcou o gol mais recente ──────────────────────────────────
  const quemMarcou = useMemo(() => {
    const aAnt = parseInt(placarAntA) || 0, bAnt = parseInt(placarAntB) || 0;
    const aNov = parseInt(placarNovA) || 0, bNov = parseInt(placarNovB) || 0;
    const difA = aNov - aAnt, difB = bNov - bAnt;
    if (difA > 0 && difB <= 0) return 'A';
    if (difB > 0 && difA <= 0) return 'B';
    if (difA > 0 && difB > 0)  return 'AMBOS'; // ambos pontuaram entre as duas leituras
    return null; // nenhuma mudança detectada
  }, [placarAntA, placarAntB, placarNovA, placarNovB]);

  // ── Monta o código final [HEX]texto ─────────────────────────────────────────
  const gerarCodigo = () => {
    const corA = (quemMarcou === 'A' || quemMarcou === 'AMBOS') ? corDestaque : corPlacar;
    const corB = (quemMarcou === 'B' || quemMarcou === 'AMBOS') ? corDestaque : corPlacar;
    return (
      `[${corTimeA}]${timeA} ` +
      `[${corA}]${placarNovA}` +
      `[${corSeparador}]-` +
      `[${corB}]${placarNovB} ` +
      `[${corTimeB}]${timeB}`
    );
  };

  const codigo = gerarCodigo();

  // ── Preview visual ───────────────────────────────────────────────────────────
  const Preview = () => {
    const corA = (quemMarcou === 'A' || quemMarcou === 'AMBOS') ? corDestaque : corPlacar;
    const corB = (quemMarcou === 'B' || quemMarcou === 'AMBOS') ? corDestaque : corPlacar;
    return (
      <div style={{ fontSize: '1.4rem', fontWeight: 800, textAlign: 'center', lineHeight: 1.4, wordBreak: 'break-word' }}>
        <span style={{ color: '#' + corTimeA }}>{timeA}</span>
        {' '}
        <span style={{ color: '#' + corA, textShadow: corA === corDestaque ? `0 0 10px #${corDestaque}80` : 'none' }}>
          {placarNovA}
        </span>
        <span style={{ color: '#' + corSeparador }}>-</span>
        <span style={{ color: '#' + corB, textShadow: corB === corDestaque ? `0 0 10px #${corDestaque}80` : 'none' }}>
          {placarNovB}
        </span>
        {' '}
        <span style={{ color: '#' + corTimeB }}>{timeB}</span>
      </div>
    );
  };

  return (
    <div style={T.body}>

      {/* ① Times e placar */}
      <div style={T.card}>
        <div style={T.cardTitle}><span style={{ color: C.ACCENT }}>①</span> Times e placar</div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 12 }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.62rem', color: C.TEXT_MUTED, marginBottom: 4, fontWeight: 700, textTransform: 'uppercase' }}>Time A</label>
            <input value={timeA} onChange={e => setTimeA(e.target.value)} placeholder="Brasil"
              style={{ ...T.input, minHeight: 38, fontSize: '0.85rem' }} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.62rem', color: C.TEXT_MUTED, marginBottom: 4, fontWeight: 700, textTransform: 'uppercase' }}>Time B</label>
            <input value={timeB} onChange={e => setTimeB(e.target.value)} placeholder="Haiti"
              style={{ ...T.input, minHeight: 38, fontSize: '0.85rem' }} />
          </div>
        </div>

        <div style={T.divider} />

        <div style={T.secLbl}>Placar anterior (antes do gol)</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 12 }}>
          <input value={placarAntA} onChange={e => setPlacarAntA(e.target.value.replace(/\D/g, ''))}
            inputMode="numeric" placeholder="0"
            style={{ ...T.input, minHeight: 38, fontSize: '0.95rem', textAlign: 'center', fontFamily: 'monospace', fontWeight: 700 }} />
          <input value={placarAntB} onChange={e => setPlacarAntB(e.target.value.replace(/\D/g, ''))}
            inputMode="numeric" placeholder="0"
            style={{ ...T.input, minHeight: 38, fontSize: '0.95rem', textAlign: 'center', fontFamily: 'monospace', fontWeight: 700 }} />
        </div>

        <div style={T.secLbl}>Placar atual (depois do gol)</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
          <input value={placarNovA} onChange={e => setPlacarNovA(e.target.value.replace(/\D/g, ''))}
            inputMode="numeric" placeholder="0"
            style={{ ...T.input, minHeight: 38, fontSize: '0.95rem', textAlign: 'center', fontFamily: 'monospace', fontWeight: 700 }} />
          <input value={placarNovB} onChange={e => setPlacarNovB(e.target.value.replace(/\D/g, ''))}
            inputMode="numeric" placeholder="0"
            style={{ ...T.input, minHeight: 38, fontSize: '0.95rem', textAlign: 'center', fontFamily: 'monospace', fontWeight: 700 }} />
        </div>

        {/* Indicador de quem marcou */}
        <div style={{ marginTop: 10 }}>
          {quemMarcou === 'A' && (
            <div style={{ fontSize: '0.72rem', color: C.ACCENT, fontWeight: 700, textAlign: 'center' }}>
              ⚽ Gol de {timeA || 'Time A'}! O placar dele ficará destacado.
            </div>
          )}
          {quemMarcou === 'B' && (
            <div style={{ fontSize: '0.72rem', color: C.ACCENT, fontWeight: 700, textAlign: 'center' }}>
              ⚽ Gol de {timeB || 'Time B'}! O placar dele ficará destacado.
            </div>
          )}
          {quemMarcou === 'AMBOS' && (
            <div style={{ fontSize: '0.72rem', color: C.TEXT_MUTED, textAlign: 'center' }}>
              Ambos os placares mudaram — os dois números ficarão destacados.
            </div>
          )}
          {!quemMarcou && (
            <div style={{ fontSize: '0.7rem', color: C.TEXT_FAINT, textAlign: 'center' }}>
              Sem gol detectado — altere o placar atual para indicar quem marcou.
            </div>
          )}
        </div>
      </div>

      {/* ② Cores */}
      <div style={T.card}>
        <div style={T.cardTitle}><span style={{ color: C.ACCENT }}>②</span> Cores do placar</div>
        <ColorPicker label={`Cor do Time A (${timeA || 'Time A'})`} value={corTimeA} onChange={setCorTimeA} />
        <ColorPicker label={`Cor do Time B (${timeB || 'Time B'})`} value={corTimeB} onChange={setCorTimeB} />
        <ColorPicker label="Cor dos números (placar normal)" value={corPlacar} onChange={setCorPlacar} />
        <ColorPicker label="Cor do separador (-)" value={corSeparador} onChange={setCorSeparador} />
        <ColorPicker label="Cor de destaque (quem marcou o gol)" value={corDestaque} onChange={setCorDestaque} />
      </div>

      {/* ③ Resultado */}
      <div style={T.card}>
        <div style={T.cardTitle}><span style={{ color: C.ACCENT }}>③</span> Resultado</div>

        <div style={{
          background: C.BG_SECONDARY, borderRadius: 10, padding: '18px 12px', marginBottom: 12,
          border: `1.5px solid rgba(200,168,74,0.2)`,
        }}>
          <Preview />
        </div>

        <div style={T.secLbl}>Código gerado</div>
        <div style={{ position: 'relative', marginBottom: 12 }}>
          <div style={T.codeBox}>{codigo}</div>
          <button
            onClick={() => safeCopy(codigo, () => { setCodeCopied(true); setTimeout(() => setCodeCopied(false), 1800); })}
            style={{
              position: 'absolute', top: 8, right: 8,
              background: '#1A2E4A', border: '1.5px solid rgba(200,168,74,0.3)',
              borderRadius: 6, color: codeCopied ? '#8ee88e' : 'rgba(200,168,74,0.6)',
              fontSize: '0.9rem', width: 28, height: 28,
              cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
            title="Copiar código"
          >{codeCopied ? '✓' : '⎘'}</button>
        </div>

        <button style={T.btnSolid} onClick={() => safeCopy(codigo, () => showToast('✓ Placar copiado!'))}>
          ⎘ Copiar placar
        </button>
      </div>

    </div>
  );
}
