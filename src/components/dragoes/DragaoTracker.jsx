import React, { useState, useEffect, useCallback } from 'react';
import { getDragaoById } from '../../data/dragoes.js';
import { C } from '../../theme.js';
import Toast from '../../ui/Toast.jsx';

const STORAGE_KEY = (id) => `tracker_dragao_${id}`;

const carregarDados = (dragao) => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY(dragao.id));
    if (raw) return JSON.parse(raw);
  } catch { /* ignore */ }
  const habilidades = {};
  dragao.habilidades?.forEach(hab => {
    if (!hab.nivelAtual) return;
    const xpParts = (hab.nivelAtual.xp || '0/0').split('/');
    habilidades[hab.id] = { nivel: hab.nivelAtual.nivel ?? 1, xpAtual: parseInt(xpParts[0]) || 0, xpTotal: parseInt(xpParts[1]) || 0 };
  });
  const xpDragParts = (dragao.nivelDragao?.xpConhecida?.[0]
    ? `0/${dragao.nivelDragao.xpConhecida[0].xpNecessaria}` : '0/0').split('/');
  return { nivelDragao: dragao.nivelDragao?.nivelVisto ?? 1, xpDragaoAtual: 0, xpDragaoTotal: parseInt(xpDragParts[1]) || 0, habilidades };
};

const getXpParaNivel = (hab, nivel) => {
  if (!hab.xpConhecida) return null;
  const e = hab.xpConhecida.find(x => x.nivel === nivel);
  return e ? e.xpNecessaria : null;
};

// ── Sub-componentes ─────────────────────────────────────────────────────────
const XPBar = ({ atual, total, cor }) => {
  const pct = total > 0 ? Math.min(100, Math.round((atual / total) * 100)) : 0;
  return (
    <div>
      <div className="flex justify-between mb-1">
        <span className="font-nunito font-bold text-[0.67rem]" style={{ color: C.TEXT_MUTED }}>
          {atual.toLocaleString('pt-BR')} / {total > 0 ? total.toLocaleString('pt-BR') : '?'} XP
        </span>
        <span className="font-nunito font-black text-[0.67rem]" style={{ color: cor }}>
          {total > 0 ? `${pct}%` : '?%'}
        </span>
      </div>
      <div className="h-1.5 rounded-full overflow-hidden" style={{ background:`${cor}20`, border:`1px solid ${cor}30` }}>
        <div style={{ height:'100%', width:`${pct}%`, background:`linear-gradient(90deg,${cor}99,${cor})`, borderRadius:3, transition:'width 0.4s ease', boxShadow:`0 0 6px ${cor}66` }} />
      </div>
    </div>
  );
};

const NivelControl = ({ value, onChange, cor, min=1, max=999 }) => (
  <div className="flex items-center gap-1.5">
    <button
      className="w-7 h-7 rounded-md flex items-center justify-center font-black text-base border-none cursor-pointer"
      style={{ background:C.BG_SECONDARY, border:`1.5px solid ${C.BORDER}`, color:C.TEXT_SECONDARY }}
      onClick={() => onChange(Math.max(min, value-1))}>−</button>
    <div className="min-w-[44px] text-center px-1.5 py-1 rounded-md font-nunito font-black text-base"
      style={{ color:cor, background:`${cor}15`, border:`1.5px solid ${cor}44` }}>
      {value}
    </div>
    <button
      className="w-7 h-7 rounded-md flex items-center justify-center font-black text-base border-none cursor-pointer"
      style={{ background:C.BG_SECONDARY, border:`1.5px solid ${C.BORDER}`, color:C.TEXT_SECONDARY }}
      onClick={() => onChange(Math.min(max, value+1))}>+</button>
  </div>
);

const NumInput = ({ value, onChange, placeholder='0', label }) => (
  <div className="flex flex-col gap-0.5 flex-1">
    {label && <span className="font-nunito font-bold text-[0.62rem] tracking-wide" style={{ color:C.TEXT_MUTED }}>{label}</span>}
    <input
      type="number"
      value={value || ''}
      placeholder={placeholder}
      onChange={e => onChange(parseInt(e.target.value) || 0)}
      className="tw-input text-center font-mono"
      style={{ padding:'5px 8px' }}
    />
  </div>
);

const HabilidadeTrackerCard = ({ hab, dados, onChange, cor }) => {
  const xpTotal = getXpParaNivel(hab, dados.nivel) ?? dados.xpTotal;
  const isCampo = hab.tipo?.toLowerCase().includes('campo');

  const handleNivel = (novoNivel) => {
    const novaXpTotal = getXpParaNivel(hab, novoNivel) ?? dados.xpTotal;
    onChange({ ...dados, nivel: novoNivel, xpTotal: novaXpTotal, xpAtual: 0 });
  };
  const handleXpAtual = v => onChange({ ...dados, xpAtual: xpTotal>0 ? Math.min(v,xpTotal) : v, xpTotal });
  const handleXpTotal = v => onChange({ ...dados, xpTotal: v });

  return (
    <div className="rounded-xl overflow-hidden mb-3" style={{ border:`1.5px solid ${C.BORDER_SOFT}`, animation:'reveal-up 0.3s ease both' }}>
      {/* Header */}
      <div className="flex items-center gap-3 px-3.5 py-2.5"
        style={{ background:`linear-gradient(135deg,rgba(62,47,28,0.9) 0%,${cor}44 100%)` }}>
        <div className="w-9 h-9 shrink-0 flex items-center justify-center text-xl rounded-lg"
          style={{ background:`linear-gradient(135deg,${cor}33,${cor}66)`, border:`1.5px solid ${cor}88`, boxShadow:`0 1px 6px ${cor}44` }}>
          {hab.emoji}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-nunito font-black text-[0.88rem] m-0 leading-tight" style={{ color:'#FFF8EE' }}>{hab.nome}</p>
          <span className="font-nunito text-[0.6rem] px-1.5 py-0.5 rounded"
            style={{ background: isCampo?'#7B1C1C':'#1B5E20', color: isCampo?'#FFCDD2':'#C8E6C9', border:`1px solid ${isCampo?'#A52020':'#2E7D32'}` }}>
            {isCampo?'🏅 Em Campo':'⚔️ Batalha'}
          </span>
        </div>
        <NivelControl value={dados.nivel} onChange={handleNivel} cor={cor} />
      </div>

      {/* XP Controls */}
      <div className="px-3.5 py-3" style={{ background:C.BG_CARD, borderTop:`1px solid ${C.BORDER_SOFT}` }}>
        <XPBar atual={dados.xpAtual} total={xpTotal} cor={cor} />
        <div className="flex gap-2 mt-2.5">
          <NumInput value={dados.xpAtual} onChange={handleXpAtual} label="XP Atual" placeholder="0" />
          <NumInput value={xpTotal > 0 ? xpTotal : dados.xpTotal} onChange={handleXpTotal} label={getXpParaNivel(hab,dados.nivel)!=null ? 'XP Necessária ✓' : 'XP Necessária'} placeholder="?" />
        </div>
        {/* Sessão rápida */}
        <div className="flex items-center gap-2 mt-2">
          <input
            type="number"
            className="tw-input text-center text-xs"
            style={{ padding:'4px 8px', flex:1 }}
            placeholder="XP por sessão"
            id={`sess_${hab.id}`}
          />
          <button
            className="btn-navy btn-sm shrink-0"
            onClick={() => {
              const inp = document.getElementById(`sess_${hab.id}`);
              const gain = parseInt(inp?.value) || 0;
              if (gain <= 0) return;
              handleXpAtual(Math.min((dados.xpAtual || 0) + gain, xpTotal > 0 ? xpTotal : 9999999));
              if (inp) inp.value = '';
            }}
          >
            + Sessão
          </button>
        </div>
      </div>
    </div>
  );
};

const DragaoTracker = ({ dragaoId, setRoute }) => {
  const dragao = getDragaoById(dragaoId);
  const [dados,  setDados]  = useState(() => dragao ? carregarDados(dragao) : {});
  const [toast,  setToast]  = useState({ open:false, message:'', severity:'success' });

  const showToast  = (msg, sev='success') => setToast({ open:true, message:msg, severity:sev });
  const closeToast = () => setToast(t => ({ ...t, open:false }));

  const salvar = useCallback(() => {
    if (!dragao) return;
    localStorage.setItem(STORAGE_KEY(dragao.id), JSON.stringify(dados));
    showToast('Progresso salvo com sucesso! ⚔️');
  }, [dragao, dados]);

  const handleHabChange = (habId, novosDados) => {
    setDados(d => ({ ...d, habilidades: { ...d.habilidades, [habId]: novosDados } }));
  };

  if (!dragao) {
    return (
      <div className="text-center py-12">
        <p className="text-5xl mb-3 m-0">🐉</p>
        <p className="font-nunito font-black text-sm m-0" style={{ color:C.ERROR }}>Dragão não encontrado</p>
      </div>
    );
  }

  const cor = dragao.cor;

  return (
    <div className="max-w-lg mx-auto pb-4" style={{ animation:'reveal-up 0.4s ease both' }}>
      <Toast {...toast} onClose={closeToast} />

      {/* Hero */}
      <div className="rounded-2xl overflow-hidden mb-3" style={{ border:`2px solid ${cor}`, boxShadow:`0 4px 20px ${cor}30` }}>
        <div className="flex items-center gap-3 px-4 py-3"
          style={{ background:`linear-gradient(135deg,rgba(28,58,94,0.95) 0%,${cor}55 100%)` }}>
          <div className="w-14 h-14 shrink-0 flex items-center justify-center text-4xl rounded-xl"
            style={{ background:`linear-gradient(135deg,${cor}33,${cor}66)`, border:`2px solid ${cor}88`, boxShadow:`0 2px 12px ${cor}55` }}>
            {dragao.emojiDragao}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-cinzel font-bold text-base m-0 mb-1" style={{ color:'#FFF8EE' }}>
              {dragao.nome} — Progresso
            </p>
            {/* Nível dragão */}
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-nunito font-bold text-[0.68rem]" style={{ color:'rgba(255,248,238,0.6)' }}>Nível:</span>
              <NivelControl
                value={dados.nivelDragao || 1}
                onChange={v => setDados(d => ({ ...d, nivelDragao:v }))}
                cor={cor}
              />
            </div>
          </div>
        </div>

        {/* XP dragão */}
        <div className="px-4 py-3" style={{ background:C.BG_CARD, borderTop:`1px solid ${cor}44` }}>
          <p className="font-nunito font-black text-[0.68rem] uppercase tracking-widest m-0 mb-2" style={{ color:C.TEXT_MUTED }}>XP do Dragão</p>
          <XPBar atual={dados.xpDragaoAtual || 0} total={dados.xpDragaoTotal || 0} cor={cor} />
          <div className="flex gap-2 mt-2">
            <NumInput value={dados.xpDragaoAtual} onChange={v => setDados(d=>({...d,xpDragaoAtual:v}))} label="XP Atual" placeholder="0" />
            <NumInput value={dados.xpDragaoTotal} onChange={v => setDados(d=>({...d,xpDragaoTotal:v}))} label="XP Necessária" placeholder="?" />
          </div>
        </div>
      </div>

      {/* Habilidades */}
      {dragao.habilidades?.map(hab => (
        <HabilidadeTrackerCard
          key={hab.id}
          hab={hab}
          dados={dados.habilidades?.[hab.id] || { nivel:1, xpAtual:0, xpTotal:0 }}
          onChange={nd => handleHabChange(hab.id, nd)}
          cor={cor}
        />
      ))}

      {/* Salvar */}
      <button className="btn-gold btn-lg w-full" onClick={salvar}>
        💾 Salvar Progresso
      </button>
      <p className="font-nunito text-[0.68rem] text-center mt-1.5 m-0" style={{ color:C.TEXT_MUTED }}>
        Os dados são guardados localmente no seu dispositivo.
      </p>
    </div>
  );
};

export default DragaoTracker;
