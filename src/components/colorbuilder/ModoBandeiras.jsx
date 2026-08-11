import React, { useState } from 'react';
import { FLAGS, FLAG_REGIOES, flagCode } from './data.js';
import { T, C, safeCopy } from './styles.js';

export default function ModoBandeiras({ showToast }) {
  const [regiao, setRegiao] = useState(0);

  const flagsRegiao = FLAGS.slice(...FLAG_REGIOES[regiao].range);

  return (
    <div style={T.body}>
      <div style={T.card}>
        <div style={T.cardTitle}>
          <span style={{ color: C.ACCENT }}>🏳</span> Bandeiras com listras verticais
        </div>
        <p style={{ fontSize: '0.67rem', color: C.TEXT_MUTED, marginBottom: 12, lineHeight: 1.6 }}>
          Clique no card ou em <strong style={{ color: C.TEXT_SECONDARY }}>⎘</strong> para copiar o código pronto para colar no chat.
          Bandeiras com emblemas ou brasões estão simplificadas (somente listras).
        </p>

        {/* Tabs de região */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginBottom: 12 }}>
          {FLAG_REGIOES.map((r, i) => (
            <button key={i} style={T.catTab(regiao === i)} onClick={() => setRegiao(i)}>
              {r.name}
            </button>
          ))}
        </div>

        {/* Lista de bandeiras */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {flagsRegiao.map((flag, i) => {
            const code = flagCode(flag);
            return (
              <div key={i}
                onClick={() => safeCopy(code, () => showToast(`${flag.emoji} ${flag.name} copiado!`))}
                style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  background: C.BG_SECONDARY,
                  border: `1.5px solid rgba(200,168,74,0.2)`,
                  borderRadius: 10, padding: '9px 11px',
                  cursor: 'pointer', transition: 'all 0.13s',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.borderColor = 'rgba(200,168,74,0.5)';
                  e.currentTarget.style.background = C.BG_INPUT;
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.borderColor = 'rgba(200,168,74,0.2)';
                  e.currentTarget.style.background = C.BG_SECONDARY;
                }}
              >
                {/* Preview visual das listras */}
                <div style={{
                  display: 'flex', borderRadius: 4, overflow: 'hidden',
                  flexShrink: 0, width: 34, height: 23,
                  border: '1px solid rgba(0,0,0,0.15)',
                }}>
                  {flag.stripes.map((col, si) => (
                    <span key={si} style={{ flex: 1, background: '#' + col }} />
                  ))}
                </div>

                {/* Info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: '0.76rem', color: C.TEXT_PRIMARY, fontWeight: 500, marginBottom: 1 }}>
                    {flag.emoji} {flag.name}
                  </div>
                  <div style={{
                    fontSize: '0.65rem', color: C.TEXT_MUTED,
                    fontFamily: 'monospace', whiteSpace: 'nowrap',
                    overflow: 'hidden', textOverflow: 'ellipsis',
                  }}>
                    {code}
                  </div>
                  {flag.note && (
                    <div style={{ fontSize: '0.6rem', color: C.TEXT_FAINT, fontStyle: 'italic', marginTop: 1 }}>
                      ⚠ {flag.note}
                    </div>
                  )}
                </div>

                {/* Botão copiar código */}
                <button
                  onClick={e => {
                    e.stopPropagation();
                    safeCopy(code, () => showToast(`${flag.emoji} ${flag.name} copiado!`));
                  }}
                  title="Copiar código"
                  style={{
                    background: C.BG_CARD, border: `1.5px solid rgba(200,168,74,0.25)`,
                    borderRadius: 6, color: C.TEXT_MUTED,
                    fontSize: '0.9rem', width: 28, height: 28,
                    cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    flexShrink: 0, transition: 'all 0.13s',
                  }}
                >⎘</button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
