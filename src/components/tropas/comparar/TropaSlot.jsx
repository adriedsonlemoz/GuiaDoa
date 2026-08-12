import React from 'react';
import { C } from '../../../theme.js';
import { getIcone, getTipoAtaque } from '../tropaUtils.js';

export default function TropaSlot({ tropa, onSelecionar, onRemover, index, cor }) {
  if (!tropa) {
    return (
      <button onClick={onSelecionar} style={{
        flex: 1, minWidth: 0, padding: '12px 8px', borderRadius: 10,
        border: '2px dashed rgba(200,168,74,0.3)', background: 'rgba(184,150,90,0.04)',
        cursor: 'pointer', textAlign: 'center', transition: 'all 0.15s',
      }}>
        <p style={{ fontSize: '1.4rem', margin: '0 0 4px' }}>➕</p>
        <p className="font-nunito font-bold" style={{ fontSize: '0.62rem', color: C.TEXT_MUTED, margin: 0, letterSpacing: '0.5px' }}>Tropa {index + 1}</p>
      </button>
    );
  }
  const tipo = getTipoAtaque(tropa);
  return (
    <div style={{ flex: 1, minWidth: 0, padding: 8, borderRadius: 10, border: `2px solid ${cor}40`, borderTop: `3px solid ${cor}`, background: `linear-gradient(180deg,${cor}0A,transparent)`, position: 'relative' }}>
      <button onClick={onRemover} aria-label={`Remover ${tropa.nome}`} style={{
        position: 'absolute', top: 4, right: 4, width: 18, height: 18, borderRadius: '50%',
        background: 'rgba(180,50,50,0.15)', border: '1px solid rgba(180,50,50,0.3)', color: '#c85c5c',
        fontSize: '0.6rem', cursor: 'pointer', lineHeight: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>✕</button>
      <div style={{ textAlign: 'center', marginBottom: 6 }}>
        <div style={{ fontSize: '1.6rem', marginBottom: 3 }}>{getIcone(tropa.nome)}</div>
        <p className="font-nunito font-bold m-0" style={{ fontSize: '0.66rem', color: C.TEXT_PRIMARY, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', lineHeight: 1.2, paddingRight: 12 }}>{tropa.nome}</p>
        <span className="font-nunito font-bold" style={{ fontSize: '0.55rem', padding: '1px 5px', borderRadius: 6, background: `${tipo.color}15`, border: `1px solid ${tipo.color}35`, color: tipo.color }}>{tipo.label}</span>
      </div>
      <div style={{ textAlign: 'center' }}>
        <p className="font-nunito font-black m-0" style={{ fontSize: '1.1rem', color: '#7c3aed' }}>{tropa.poder}</p>
        <p className="font-nunito m-0" style={{ fontSize: '0.5rem', color: C.TEXT_FAINT, letterSpacing: '1px' }}>PODER</p>
      </div>
    </div>
  );
}
