import React, { useMemo, useState } from 'react';
import { C } from '../../../theme.js';
import { getIcone, getTipoAtaque } from '../tropaUtils.js';

export default function TropaPicker({ tropas, selecionadas, onEscolher, onFechar }) {
  const [busca, setBusca] = useState('');
  const lista = useMemo(() => {
    const term = busca.toLowerCase();
    return tropas.filter(item => !selecionadas.find(selected => selected?.nome === item.nome))
      .filter(item => item.nome.toLowerCase().includes(term))
      .sort((a, b) => a.nome.localeCompare(b.nome));
  }, [tropas, selecionadas, busca]);

  return (
    <div onClick={onFechar} style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(20,14,8,0.72)', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', animation: 'fadeIn 0.18s ease' }}>
      <div onClick={event => event.stopPropagation()} style={{ width: '100%', maxWidth: 480, maxHeight: '80vh', background: C.BG_MAIN, borderRadius: '18px 18px 0 0', display: 'flex', flexDirection: 'column', animation: 'slideUp 0.22s ease', boxShadow: '0 -8px 32px rgba(0,0,0,0.4)' }}>
        <div style={{ padding: '10px 14px 12px', background: 'linear-gradient(135deg,#1C3A5E,#2A4C72)', borderRadius: '18px 18px 0 0', borderBottom: '1px solid rgba(200,168,74,0.3)', flexShrink: 0 }}>
          <div style={{ width: 36, height: 4, borderRadius: 2, background: 'rgba(248,242,224,0.25)', margin: '0 auto 10px' }} />
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
            <p className="font-cinzel font-bold m-0" style={{ fontSize: '0.75rem', color: '#F8F2E0', letterSpacing: '1.5px' }}>Escolher Tropa</p>
            <button onClick={onFechar} style={{ width: 28, height: 28, borderRadius: 7, background: 'rgba(248,242,224,0.1)', border: '1px solid rgba(248,242,224,0.2)', color: 'rgba(248,242,224,0.7)', cursor: 'pointer', fontSize: '0.9rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>
          </div>
          <input className="tw-input" placeholder="🔍  Buscar..." value={busca} onChange={event => setBusca(event.target.value)} autoFocus style={{ background: 'rgba(248,242,224,0.08)', borderColor: 'rgba(200,168,74,0.3)', color: '#F8F2E0' }} />
        </div>
        <div style={{ overflowY: 'auto', flex: 1, padding: '8px 10px 16px' }}>
          {lista.map(item => {
            const tipo = getTipoAtaque(item);
            return (
              <button key={item.nome} onClick={() => onEscolher(item)} style={{
                width: '100%', textAlign: 'left', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 10,
                padding: '9px 10px', borderRadius: 9, marginBottom: 5, background: C.BG_CARD,
                border: '1px solid rgba(200,168,74,0.18)', borderLeft: `3px solid ${tipo.color}`, transition: 'background 0.12s',
              }}>
                <span style={{ fontSize: '1.25rem' }}>{getIcone(item.nome)}</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p className="font-nunito font-bold m-0" style={{ fontSize: '0.8rem', color: C.TEXT_PRIMARY, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.nome}</p>
                  <p className="font-nunito m-0" style={{ fontSize: '0.6rem', color: C.TEXT_MUTED }}>{tipo.label}</p>
                </div>
                <span className="font-nunito font-black" style={{ fontSize: '0.9rem', color: '#7c3aed', flexShrink: 0 }}>{item.poder}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
