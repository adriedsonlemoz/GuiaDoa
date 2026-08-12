import React, { useState } from 'react';
import { C } from '../../theme.js';

const copyText = async text => {
  if (navigator.clipboard?.writeText) return navigator.clipboard.writeText(text);
  const element = document.createElement('textarea');
  element.value = text;
  element.style.position = 'fixed';
  element.style.opacity = '0';
  document.body.appendChild(element);
  element.select();
  document.execCommand('copy');
  document.body.removeChild(element);
};

export default function HomeProfileCard({ profile, horaServidor, onLanguage, onEdit }) {
  const playerId = profile?.playerId || null;
  const [idCopiado, setIdCopiado] = useState(false);
  const copiarId = async () => {
    if (!playerId) return;
    try { await copyText(`ID: ${playerId} | Reino: ${profile.reino}`); } catch { return; }
    setIdCopiado(true);
    setTimeout(() => setIdCopiado(false), 2000);
  };

  return (
    <div className="tw-card mb-3" style={{ animation: 'reveal-up 0.4s 0.08s ease both' }}>
      <div className="flex items-center justify-between px-4" style={{ background: 'linear-gradient(135deg,#1C3A5E,#2A4C72)', borderBottom: '1px solid rgba(200,168,74,0.3)', minHeight: 36 }}>
        <span className="font-cinzel font-bold uppercase" style={{ fontSize: '0.58rem', color: 'rgba(200,168,74,0.7)', letterSpacing: '3px' }}>◆ Quartel-General ◆</span>
        <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
          <button onClick={onLanguage} className="flex items-center justify-center rounded-md" style={{ width: 28, height: 28, background: 'transparent', cursor: 'pointer', border: '1px solid rgba(200,168,74,0.28)', color: 'rgba(248,242,224,0.55)', fontSize: '0.85rem' }} title="Idioma / Language">🌐</button>
          <button onClick={onEdit} className="flex items-center justify-center rounded-md" style={{ width: 28, height: 28, background: 'transparent', cursor: 'pointer', border: '1px solid rgba(200,168,74,0.28)', color: 'rgba(248,242,224,0.45)', fontSize: '0.9rem' }} title="Editar perfil">✎</button>
        </div>
      </div>
      <div className="flex items-center gap-4" style={{ background: C.BG_CARD_TOP, padding: '14px 16px' }}>
        <div className="flex items-center justify-center shrink-0" style={{ width: 54, height: 54, borderRadius: 12, background: C.BG_SECONDARY, border: '1.5px solid rgba(200,168,74,0.4)', fontSize: '1.75rem', position: 'relative', boxShadow: '0 2px 10px rgba(62,47,28,0.15)' }}>
          🎖️<span style={{ position: 'absolute', bottom: -3, right: -3, width: 11, height: 11, borderRadius: '50%', background: C.ENERGY, border: `2px solid ${C.BG_MAIN}`, animation: 'online-pulse 3s ease-in-out infinite' }} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-nunito font-black m-0 leading-tight truncate" style={{ fontSize: '1.15rem', color: C.TEXT_PRIMARY }}>{profile.nome}</p>
          <div className="flex gap-1.5 mt-1.5 flex-wrap">
            <span className="font-nunito font-bold" style={{ fontSize: '0.68rem', padding: '2px 8px', borderRadius: 5, border: '1px solid rgba(200,168,74,0.35)', color: C.TEXT_SECONDARY, background: 'rgba(184,150,90,0.1)' }}>Reino: {profile.reino}</span>
            {playerId && <button onClick={copiarId} className="font-nunito font-bold" style={{ fontSize: '0.68rem', padding: '2px 8px', borderRadius: 5, border: `1px solid ${idCopiado ? 'rgba(90,180,90,0.6)' : 'rgba(200,168,74,0.35)'}`, color: idCopiado ? '#5AB45A' : C.TEXT_SECONDARY, background: idCopiado ? 'rgba(90,180,90,0.12)' : 'rgba(184,150,90,0.1)', cursor: 'pointer', transition: 'all 0.2s', lineHeight: 1, display: 'flex', alignItems: 'center', gap: 4 }} title="Clique para copiar ID e Reino">{idCopiado ? <>✓ ID copiado</> : <>📋 ID: {playerId}</>}</button>}
          </div>
        </div>
        <div style={{ width: 1, height: 44, flexShrink: 0, background: `linear-gradient(180deg,transparent,${C.BORDER},transparent)`, opacity: 0.4 }} />
        <div className="text-right shrink-0">
          <p className="font-nunito font-black m-0 leading-none" style={{ fontSize: '1.55rem', fontVariantNumeric: 'tabular-nums', letterSpacing: '0.04em', color: C.TEXT_PRIMARY }}>{horaServidor}</p>
          <p className="font-nunito font-black uppercase tracking-widest m-0" style={{ fontSize: '0.52rem', color: C.TEXT_MUTED, marginTop: 5 }}>SERVIDOR UTC+0</p>
        </div>
      </div>
    </div>
  );
}
