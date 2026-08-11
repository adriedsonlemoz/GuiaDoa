import React, { useCallback, useEffect, useRef, useState } from 'react';
import { carregarNiveis } from '../data/niveis.js';
import { C } from '../theme.js';
import GameHeader from './shared/GameHeader.jsx';
import Modal from '../ui/Modal.jsx';
import Toast from '../ui/Toast.jsx';

// ── Helpers ──────────────────────────────────────────────────────────────────
const unformat      = v  => Number(String(v).replace(/\D/g, '')) || 0;
const formatNumber  = n  =>
  n === null || n === undefined || n === '' ? '—' : Number(n).toLocaleString('pt-BR');
const formatSufixo  = num => {
  if (num >= 1_000_000_000) return (num / 1_000_000_000).toFixed(1).replace('.0', '') + 'B';
  if (num >= 1_000_000)     return (num / 1_000_000).toFixed(1).replace('.0', '') + 'M';
  if (num >= 1_000)         return (num / 1_000).toFixed(1).replace('.0', '') + 'K';
  return String(num);
};

// Barra de progresso visual para % até próximo nível
const ProgressBar = ({ pct, color = C.ACCENT }) => (
  <div
    style={{
      height: 6,
      borderRadius: 99,
      background: `${C.BORDER_SOFT}55`,
      overflow: 'hidden',
      border: `1px solid ${C.BORDER_SOFT}`,
    }}
  >
    <div
      style={{
        height: '100%',
        width: `${Math.min(pct, 100)}%`,
        background: `linear-gradient(90deg, ${color}99, ${color})`,
        borderRadius: 99,
        transition: 'width 0.5s ease',
      }}
    />
  </div>
);

// ── Componente ────────────────────────────────────────────────────────────────
const Niveis = () => {
  const tabelaRef   = useRef(null);
  const inputRef    = useRef(null);
  const nivelAtualRef = useRef(null);

  // ── Estado dos dados ──────────────────────────────────────────────────────
  const [todosNiveis, setTodosNiveis] = useState([]);
  const [carregando,  setCarregando]  = useState(true);

  const buscarNiveis = useCallback(async () => {
    setCarregando(true);
    const dados = await carregarNiveis();
    setTodosNiveis(dados);
    setCarregando(false);
  }, []);

  useEffect(() => { buscarNiveis(); }, [buscarNiveis]);

  // ── Estado UI ─────────────────────────────────────────────────────────────
  const [promptAberto,    setPromptAberto]    = useState(true);
  const [resultadoDialog, setResultadoDialog] = useState({ open: false, titulo: '', mensagem: '', tipo: 'success' });
  const [toast,           setToast]           = useState({ open: false, message: '', severity: 'success' });
  const [isDirty,         setIsDirty]         = useState(false);

  // ── Poder salvo ───────────────────────────────────────────────────────────
  const [poderAtualText, setPoderAtualText] = useState(() => {
    const s = localStorage.getItem('doa_poder_niveis');
    return s ? formatNumber(s) : '';
  });
  const [poderAntigoText, setPoderAntigoText] = useState(() => {
    const s = localStorage.getItem('doa_poder_antigo');
    return s ? formatNumber(s) : '';
  });

  useEffect(() => {
    window.temAlteracoesNaoSalvas = isDirty;
    const h = e => { if (isDirty) { e.preventDefault(); e.returnValue = ''; } };
    window.addEventListener('beforeunload', h);
    return () => { window.temAlteracoesNaoSalvas = false; window.removeEventListener('beforeunload', h); };
  }, [isDirty]);

  const showToast  = (msg, sev = 'success') => setToast({ open: true, message: msg, severity: sev });
  const closeToast = () => setToast(t => ({ ...t, open: false }));

  const handleInputPower  = e => {
    const n = Number(e.target.value.replace(/\D/g, ''));
    setPoderAtualText(n === 0 ? '' : formatNumber(n));
    setIsDirty(true);
  };
  const handleInputAntigo = e => {
    const n = Number(e.target.value.replace(/\D/g, ''));
    setPoderAntigoText(n === 0 ? '' : formatNumber(n));
    setIsDirty(true);
  };

  const handleSave = () => {
    const numAtual  = unformat(poderAtualText);
    const numAntigo = unformat(poderAntigoText);
    localStorage.setItem('doa_poder_niveis', numAtual);
    localStorage.setItem('doa_poder_antigo', numAntigo);
    setIsDirty(false);
    const diff = numAtual - numAntigo;
    if (diff > 0 && numAntigo > 0) {
      setResultadoDialog({ open: true, titulo: '🎖️ Relatório de Progresso', mensagem: `Parabéns, Comandante! O seu poder aumentou ${formatSufixo(diff)}!`, tipo: 'success' });
    } else if (diff < 0 && numAntigo > 0) {
      setResultadoDialog({ open: true, titulo: '⚠️ Alerta de Baixas', mensagem: `Atenção: O seu poder diminuiu ${formatSufixo(Math.abs(diff))}. Reorganize as suas defesas!`, tipo: 'warning' });
    } else {
      showToast('Progresso salvo com sucesso!', 'success');
    }
  };

  const handleAtualizarSim = () => {
    if (poderAtualText) { setPoderAntigoText(poderAtualText); setPoderAtualText(''); setIsDirty(true); }
    setPromptAberto(false);
    setTimeout(() => inputRef.current?.focus(), 300);
  };

  // ── Cálculos de nível ─────────────────────────────────────────────────────
  const currentPowerNum = unformat(poderAtualText);
  const oldPowerNum     = unformat(poderAntigoText);
  const diferencaPoder  = currentPowerNum - oldPowerNum;
  const isPositivo      = diferencaPoder > 0;

  // Nível exato: maior nível cujo XP é <= poder atual
  let nivelExato = 0;
  if (todosNiveis.length > 0) {
    todosNiveis.forEach(([n, xp]) => {
      if (xp !== null && currentPowerNum >= xp) nivelExato = n;
    });
  }

  // Próximo nível: primeiro nível com XP > poder atual
  const proximaMeta   = todosNiveis.find(([, xp]) => xp !== null && xp > currentPowerNum);
  const faltamParaMeta = proximaMeta ? proximaMeta[1] - currentPowerNum : 0;

  // Nível atual (base para a barra de progresso)
  const nivelAtualDados = todosNiveis.find(([n]) => n === nivelExato);
  const xpAtualNivel    = nivelAtualDados?.[1] ?? 0;
  const xpProximo       = proximaMeta?.[1] ?? xpAtualNivel;
  const faixaNivel      = xpProximo - xpAtualNivel;
  const progresoNivel   = faixaNivel > 0 ? ((currentPowerNum - xpAtualNivel) / faixaNivel) * 100 : 0;

  // Marco mais próximo (múltiplo de 5)
  const proximoMarco    = todosNiveis.find(([n, xp]) => xp !== null && xp > currentPowerNum && n % 5 === 0);
  const faltamParaMarco = proximoMarco ? proximoMarco[1] - currentPowerNum : 0;

  const maxNivel = todosNiveis.length > 0 ? todosNiveis[todosNiveis.length - 1][0] : 100;
  const atingiuMax = nivelExato >= maxNivel;

  // Auto-scroll da tabela até o nível atual
  useEffect(() => {
    if (!carregando && nivelExato > 0 && nivelAtualRef.current && tabelaRef.current) {
      setTimeout(() => {
        nivelAtualRef.current?.scrollIntoView({ block: 'center', behavior: 'smooth' });
      }, 400);
    }
  }, [carregando, nivelExato]);

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="max-w-2xl mx-auto pb-6">
      <Toast {...toast} onClose={closeToast} />

      {/* Modal prompt inicial */}
      <Modal open={promptAberto} onClose={() => setPromptAberto(false)} maxWidth={320}>
        <div className="p-4 text-center">
          <p className="text-3xl mb-2 m-0">⚠️</p>
          <p className="font-cinzel font-bold text-sm tracking-wide uppercase m-0 mb-2" style={{ color: C.WARNING }}>
            Atualização de Inteligência
          </p>
          <p className="font-nunito font-semibold text-sm leading-relaxed m-0 mb-4" style={{ color: C.TEXT_SECONDARY }}>
            Comandante, o seu poder ou nível alterou desde o último registo?
          </p>
          <div className="flex gap-2">
            <button className="btn-ghost flex-1" onClick={() => setPromptAberto(false)}>Não</button>
            <button className="btn-success flex-1" onClick={handleAtualizarSim}>Sim, Atualizar</button>
          </div>
        </div>
      </Modal>

      {/* Modal resultado */}
      <Modal open={resultadoDialog.open} onClose={() => setResultadoDialog(d => ({ ...d, open: false }))} maxWidth={320}>
        <div className="p-4 text-center">
          <p className="font-cinzel font-bold text-sm uppercase tracking-wide m-0 mb-1"
            style={{ color: resultadoDialog.tipo === 'success' ? C.SUCCESS : C.WARNING }}>
            {resultadoDialog.titulo}
          </p>
          <div className="gold-stripe my-2 opacity-40" />
          <p className="font-nunito font-black text-base m-0 mb-1" style={{ color: C.TEXT_PRIMARY }}>
            {resultadoDialog.mensagem}
          </p>
          <p className="font-nunito font-semibold text-xs m-0 mb-3" style={{ color: C.TEXT_MUTED }}>
            O relatório foi atualizado na base de dados.
          </p>
          <button
            className={resultadoDialog.tipo === 'success' ? 'btn-success w-full' : 'btn-gold w-full'}
            onClick={() => setResultadoDialog(d => ({ ...d, open: false }))}
          >
            Continuar
          </button>
        </div>
      </Modal>

      {/* ── Cabeçalho ─────────────────────────────────────────────────────── */}
      <div className="tw-card mb-3">
        <GameHeader title="Progresso da Cidade" />
        <p className="font-nunito font-semibold text-sm text-center py-2 px-3 m-0 bg-aoe-card" style={{ color: C.TEXT_SECONDARY }}>
          Acompanhe a sua evolução e descubra quanto falta para o próximo nível.
        </p>
      </div>

      {/* ── Nível Atual — destaque principal ─────────────────────────────── */}
      <div
        className="tw-card mb-3 overflow-hidden"
        style={{
          background: `linear-gradient(135deg, ${C.BG_HEADER} 0%, #0f2540 100%)`,
          border: `2px solid ${C.BORDER}`,
        }}
      >
        {/* Topo: badge nível */}
        <div className="flex items-center justify-between px-4 pt-4 pb-2">
          <div>
            <p
              className="font-nunito font-bold text-[0.6rem] uppercase tracking-widest m-0 mb-0.5"
              style={{ color: `${C.ACCENT}99` }}
            >
              Nível Atual
            </p>
            {carregando ? (
              <p className="font-cinzel font-bold text-4xl m-0" style={{ color: C.ACCENT }}>…</p>
            ) : (
              <p className="font-cinzel font-bold text-5xl leading-none m-0" style={{ color: C.ACCENT }}>
                {poderAtualText ? (nivelExato > 0 ? nivelExato : '0') : '—'}
              </p>
            )}
            {!carregando && nivelExato > 0 && (
              <p className="font-nunito font-semibold text-xs m-0 mt-1" style={{ color: `${C.ACCENT}88` }}>
                de {maxNivel} níveis
              </p>
            )}
          </div>

          {/* Anel de progresso decorativo */}
          <div className="relative flex items-center justify-center" style={{ width: 72, height: 72 }}>
            <svg width="72" height="72" style={{ transform: 'rotate(-90deg)' }}>
              <circle cx="36" cy="36" r="30" fill="none" stroke={`${C.ACCENT}22`} strokeWidth="6" />
              <circle
                cx="36" cy="36" r="30" fill="none"
                stroke={C.ACCENT}
                strokeWidth="6"
                strokeLinecap="round"
                strokeDasharray={`${2 * Math.PI * 30}`}
                strokeDashoffset={`${2 * Math.PI * 30 * (1 - Math.min(progresoNivel, 100) / 100)}`}
                style={{ transition: 'stroke-dashoffset 0.6s ease' }}
              />
            </svg>
            <span
              className="absolute font-nunito font-black text-sm"
              style={{ color: C.ACCENT }}
            >
              {poderAtualText ? `${Math.round(Math.min(progresoNivel, 100))}%` : '—'}
            </span>
          </div>
        </div>

        {/* Barra de progresso */}
        {poderAtualText && !atingiuMax && (
          <div className="px-4 pb-3">
            <div className="flex justify-between mb-1">
              <span className="font-nunito font-semibold text-[0.6rem]" style={{ color: `${C.ACCENT}88` }}>
                Nível {nivelExato}
              </span>
              <span className="font-nunito font-semibold text-[0.6rem]" style={{ color: `${C.ACCENT}88` }}>
                Nível {proximaMeta?.[0] ?? '—'}
              </span>
            </div>
            <ProgressBar pct={progresoNivel} color={C.ACCENT} />
            <p className="font-nunito font-semibold text-[0.65rem] text-center mt-1 m-0" style={{ color: `${C.ACCENT}77` }}>
              Faltam <span style={{ color: C.ACCENT, fontWeight: 900 }}>{formatNumber(faltamParaMeta)}</span> para o nível {proximaMeta?.[0] ?? '—'}
            </p>
          </div>
        )}
        {poderAtualText && atingiuMax && (
          <div className="px-4 pb-3 text-center">
            <p className="font-cinzel font-bold text-sm m-0" style={{ color: C.ACCENT }}>
              🏆 Nível Máximo Atingido!
            </p>
          </div>
        )}
      </div>

      {/* ── Painel de entrada e cards de stats ──────────────────────────── */}
      <div className="flex gap-2 mb-3">

        {/* Input de poder */}
        <div className="tw-card flex-1 p-3">
          <p className="font-nunito font-bold text-[0.62rem] tracking-widest uppercase m-0 mb-1.5" style={{ color: C.TEXT_MUTED }}>
            Poder Anterior
          </p>
          <input
            className="tw-input text-center font-mono mb-3"
            placeholder="Ex: 500.000"
            value={poderAntigoText}
            onChange={handleInputAntigo}
            inputMode="numeric"
          />

          <div className="gold-stripe mb-3 opacity-30" />

          <div className="flex items-center justify-between mb-1.5">
            <p className="font-nunito font-bold text-[0.62rem] tracking-widest uppercase m-0" style={{ color: C.ACCENT_DEEP }}>
              Poder Atual
            </p>
            {diferencaPoder !== 0 && poderAntigoText && poderAtualText && (
              <span
                className="font-nunito font-black text-[0.65rem] px-1.5 py-0.5 rounded"
                style={{
                  color:      isPositivo ? C.SUCCESS : C.ERROR,
                  background: isPositivo ? `${C.SUCCESS}18` : `${C.ERROR}18`,
                  border:     `1px solid ${isPositivo ? C.SUCCESS : C.ERROR}`,
                }}
              >
                {isPositivo ? '📈 +' : '📉 '}{formatSufixo(diferencaPoder)}
              </span>
            )}
          </div>

          <div className="flex gap-1.5">
            <input
              ref={inputRef}
              className="tw-input text-center font-mono flex-1"
              placeholder="Digite o seu poder…"
              value={poderAtualText}
              onChange={handleInputPower}
              inputMode="numeric"
            />
            <button
              className={isDirty ? 'btn-success btn-sm shrink-0' : 'btn-ghost btn-sm shrink-0'}
              onClick={handleSave}
              disabled={!isDirty}
            >
              Salvar
            </button>
          </div>

          {isDirty && (
            <p className="font-nunito font-bold text-[0.65rem] mt-1.5 m-0" style={{ color: C.WARNING }}>
              ⚠️ Alterações não salvas
            </p>
          )}
        </div>

        {/* Cards laterais de stats */}
        <div className="flex flex-col gap-1.5" style={{ minWidth: 92 }}>
          {[
            {
              label: 'Próximo Nível',
              value: proximaMeta ? `Nv. ${proximaMeta[0]}` : atingiuMax ? 'MAX' : '—',
              sub:   proximaMeta && poderAtualText ? formatNumber(faltamParaMeta) : null,
              color: C.ACCENT_DEEP,
            },
            {
              label: 'Marco',
              value: proximoMarco ? `Nv. ${proximoMarco[0]}` : atingiuMax ? 'MAX' : '—',
              sub:   proximoMarco && poderAtualText ? formatNumber(faltamParaMarco) : null,
              color: C.POWER,
            },
            {
              label: 'Total Níveis',
              value: carregando ? '…' : String(todosNiveis.length),
              sub:   null,
              color: C.BLUE,
            },
          ].map(s => (
            <div
              key={s.label}
              className="tw-card flex-1 flex flex-col items-center justify-center text-center py-2 px-1.5"
            >
              <p className="font-nunito font-bold text-[0.58rem] uppercase tracking-wide m-0 mb-0.5 leading-tight" style={{ color: C.TEXT_MUTED }}>
                {s.label}
              </p>
              <p className="font-nunito font-black text-sm leading-none m-0" style={{ color: s.color }}>
                {s.value}
              </p>
              {s.sub && (
                <p className="font-nunito font-semibold text-[0.58rem] leading-tight m-0 mt-0.5" style={{ color: C.TEXT_FAINT }}>
                  -{s.sub}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* ── Tabela de todos os níveis ─────────────────────────────────────── */}
      <div className="tw-card overflow-hidden">
        {/* Cabeçalho da tabela com total */}
        <div
          className="flex items-center justify-between px-3 py-2"
          style={{ borderBottom: `1px solid ${C.BORDER_SOFT}` }}
        >
          <p className="font-cinzel font-bold text-xs uppercase tracking-wide m-0" style={{ color: C.TEXT_SECONDARY }}>
            Tabela de Níveis
          </p>
          <span
            className="font-nunito font-bold text-[0.65rem] px-2 py-0.5 rounded-full"
            style={{ background: `${C.ACCENT}20`, color: C.ACCENT_DEEP, border: `1px solid ${C.BORDER_SOFT}` }}
          >
            {carregando ? '…' : `${todosNiveis.length} níveis`}
          </span>
        </div>

        {carregando ? (
          <div className="flex items-center justify-center py-12">
            <p className="font-nunito font-semibold text-sm m-0" style={{ color: C.TEXT_MUTED }}>
              ⏳ Carregando níveis…
            </p>
          </div>
        ) : (
          <div ref={tabelaRef} className="overflow-auto" style={{ maxHeight: 460 }}>
            <table className="w-full text-left">
              <thead className="sticky top-0 z-10">
                <tr>
                  <th className="tw-th text-center">Nível</th>
                  <th className="tw-th text-center">Poder Necessário</th>
                  <th className="tw-th text-center">Status</th>
                </tr>
              </thead>
              <tbody>
                {todosNiveis.map(([nivel, xpNivel]) => {
                  const isUnknown  = xpNivel === null;
                  const concluido  = !isUnknown && currentPowerNum >= xpNivel;
                  const isAtual    = nivel === nivelExato && nivelExato > 0;
                  const isProxima  = proximaMeta && proximaMeta[0] === nivel;
                  const isMarco    = nivel % 5 === 0;
                  const isMarco10  = nivel % 10 === 0;

                  // Cores de fundo por estado
                  const rowBg = isAtual
                    ? `${C.BG_HEADER}18`
                    : concluido
                    ? `${C.SUCCESS}0D`
                    : isProxima
                    ? `${C.WARNING}12`
                    : undefined;

                  const borderLeft = isAtual
                    ? `3px solid ${C.ACCENT}`
                    : isProxima
                    ? `3px solid ${C.WARNING}`
                    : '3px solid transparent';

                  const statusText  = isAtual    ? '📍 Nível Atual'
                                    : concluido  ? '✓ Concluído'
                                    : isProxima  ? '🎯 Próximo'
                                    : isUnknown  ? 'Em breve'
                                    : 'Pendente';
                  const statusColor = isAtual    ? C.ACCENT_DEEP
                                    : concluido  ? C.SUCCESS
                                    : isProxima  ? C.WARNING
                                    : isUnknown  ? C.TEXT_FAINT
                                    : C.TEXT_MUTED;

                  return (
                    <tr
                      key={nivel}
                      ref={isAtual ? nivelAtualRef : null}
                      style={{ background: rowBg, borderLeft }}
                    >
                      {/* Nível */}
                      <td className="tw-td text-center" style={{ paddingLeft: 6 }}>
                        <span
                          className="font-nunito font-black text-sm"
                          style={{
                            color: isAtual   ? C.ACCENT_DEEP
                                 : isMarco10 ? C.BLUE
                                 : isMarco   ? C.ACCENT_DEEP
                                 : C.TEXT_PRIMARY,
                          }}
                        >
                          {isMarco10 ? `⭐ ${nivel}` : isMarco ? `◆ ${nivel}` : nivel}
                        </span>
                      </td>

                      {/* XP */}
                      <td className="tw-td text-center font-mono text-sm" style={{ color: isUnknown ? C.TEXT_FAINT : C.TEXT_SECONDARY }}>
                        {formatNumber(xpNivel)}
                      </td>

                      {/* Status */}
                      <td className="tw-td text-center">
                        <span
                          className="font-nunito font-bold text-[0.68rem] px-1.5 py-0.5 rounded"
                          style={{
                            color:      statusColor,
                            background: isAtual  ? `${C.ACCENT}15`
                                      : isProxima ? `${C.WARNING}15`
                                      : 'transparent',
                          }}
                        >
                          {statusText}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Niveis;
