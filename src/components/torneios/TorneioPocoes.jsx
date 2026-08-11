import React, { useState, useMemo } from 'react';
import { C } from '../../theme.js';
import Toast from '../../ui/Toast.jsx';
import { useI18n } from '../../hooks/useI18n.jsx';

const STORAGE_KEY = 'doa_torneio_pocoes';

const COR = '#8B3A9A'; // roxo-poção

const POCOES_CHAVES = [
  { key: 'superior',      chave: 'torneio.pocoes.nome.superior',      emoji: '🟣', pts: 50, cor: '#8B3A9A' },
  { key: 'intermediaria', chave: 'torneio.pocoes.nome.intermediaria', emoji: '🔵', pts: 30, cor: '#3A6A9A' },
  { key: 'primaria',      chave: 'torneio.pocoes.nome.primaria',      emoji: '🟢', pts: 10, cor: '#3A8A5A' },
];

const fmtN = n => Number(n || 0).toLocaleString('pt-BR');

const TorneioPocoes = () => {
  const { t } = useI18n();
  const [qtds, setQtds] = useState(() => {
    try { const s = localStorage.getItem(STORAGE_KEY); return s ? JSON.parse(s).qtds || {} : {}; }
    catch { return {}; }
  });
  const [ptsPossuidos, setPtsPossuidos] = useState(() => {
    try { const s = localStorage.getItem(STORAGE_KEY); return s ? JSON.parse(s).ptsPossuidos || '' : ''; }
    catch { return ''; }
  });
  const [toast, setToast] = useState({ open: false, message: '', severity: 'success' });

  const handleQtd = (key, value) => {
    setQtds(q => ({ ...q, [key]: value.replace(/\D/g, '') }));
  };

  const ptsDosItens = useMemo(() =>
    POCOES_CHAVES.reduce((acc, p) => acc + (parseInt(qtds[p.key]) || 0) * p.pts, 0),
    [qtds]
  );

  const ptsPos    = parseInt(ptsPossuidos.replace(/\D/g, '')) || 0;
  const totalFinal = ptsDosItens + ptsPos;

  const handleSalvar = () => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ qtds, ptsPossuidos }));
      setToast({ open: true, message: t('torneio.toast.salvo_sucesso'), severity: 'success' });
    } catch {
      setToast({ open: true, message: t('torneio.toast.erro_salvar'), severity: 'error' });
    }
  };

  return (
    <div className="max-w-md mx-auto pb-4" style={{ animation: 'reveal-up 0.4s ease both' }}>
      <Toast {...toast} onClose={() => setToast(prev => ({ ...prev, open: false }))} />

      {/* ── TOTAL ──────────────────────────────────────────────────────────── */}
      <div className="rounded-xl overflow-hidden mb-3"
        style={{ border: `1.5px solid ${C.BORDER}`, boxShadow: '0 3px 14px rgba(62,47,28,0.15)' }}>

        {/* Contador principal + botão salvar */}
        <div className="px-4 py-3 flex items-center gap-3"
          style={{ background: `linear-gradient(135deg, #3A1A4A 0%, #5A2A6A 100%)` }}>

          <div className="flex-1 min-w-0">
            <p className="font-nunito font-bold text-[0.6rem] tracking-[3px] uppercase m-0 mb-1"
              style={{ color: 'rgba(200,168,200,0.7)' }}>
              {t('torneio.aceleracoes.total_pontos')}
            </p>
            <p className="font-nunito font-black leading-none m-0"
              style={{
                fontSize: 'clamp(1.9rem,9vw,2.7rem)',
                letterSpacing: '0.05em',
                color: '#D4A4E4',
                textShadow: '0 2px 18px rgba(180,100,220,0.55)',
              }}>
              {fmtN(totalFinal)}
            </p>
            {ptsPos > 0 && (
              <p className="font-nunito font-semibold text-[0.6rem] m-0 mt-1"
                style={{ color: 'rgba(200,168,200,0.55)' }}>
                {fmtN(ptsDosItens)} {t('torneio.pocoes.detalhe_pocoes')} + {fmtN(ptsPos)} {t('torneio.aceleracoes.detalhe_possuidos')}
              </p>
            )}
          </div>

          <button
            className="shrink-0"
            onClick={handleSalvar}
            style={{
              padding: '8px 14px', fontSize: '0.75rem', whiteSpace: 'nowrap',
              background: 'linear-gradient(180deg,#B060D0,#8B3A9A)',
              color: '#FFF0FF',
              border: '1px solid #6A1A7A',
              borderRadius: 8, cursor: 'pointer', fontWeight: 800,
              fontFamily: '"Nunito",sans-serif',
            }}>
            💾 {t('torneio.label.salvar')}
          </button>
        </div>

        {/* Pontos já possuídos */}
        <div className="px-4 py-3"
          style={{ background: C.BG_CARD, borderTop: `1px solid rgba(200,168,74,0.25)` }}>
          <label className="font-nunito font-bold text-[0.65rem] tracking-widest uppercase block mb-1.5"
            style={{ color: C.TEXT_MUTED }}>
            {t('torneio.label.possuidos')}
          </label>
          <input
            className="tw-input text-center font-mono font-black"
            style={{ fontSize: '1rem' }}
            placeholder="0"
            value={ptsPossuidos}
            onChange={e => setPtsPossuidos(e.target.value.replace(/\D/g, ''))}
            inputMode="numeric"
          />
        </div>
      </div>

      {/* ── POÇÕES — 3 cards ───────────────────────────────────────────────── */}
      <div className="grid grid-cols-3 gap-2 mb-3">
        {POCOES_CHAVES.map(poc => {
          const qtd  = parseInt(qtds[poc.key]) || 0;
          const soma = qtd * poc.pts;
          const ativo = soma > 0;
          return (
            <div key={poc.key}
              className="rounded-xl overflow-hidden"
              style={{
                border:     `1px solid ${ativo ? poc.cor : C.BORDER_SOFT}`,
                borderTop:  `3px solid ${ativo ? poc.cor : C.BORDER_SOFT}`,
                background: ativo
                  ? `linear-gradient(180deg, ${C.BG_CARD} 0%, ${poc.cor}08 100%)`
                  : C.BG_CARD,
                boxShadow: ativo ? `0 2px 8px ${poc.cor}25` : 'none',
                transition: 'all 0.18s',
              }}>

              {/* Emoji + nome */}
              <div className="px-2 pt-2.5 pb-2"
                style={{ borderBottom: `1px solid rgba(200,168,74,0.15)` }}>
                <div style={{ fontSize: '1.4rem', lineHeight: 1, marginBottom: 4, textAlign: 'center' }}>
                  {poc.emoji}
                </div>
                <p className="font-nunito font-black text-[0.66rem] m-0 leading-snug text-center"
                  style={{ color: C.TEXT_PRIMARY }}>
                  {t(poc.chave)}
                </p>
                <p className="font-nunito font-semibold text-[0.56rem] m-0 mt-0.5 text-center"
                  style={{ color: poc.cor, fontWeight: 800 }}>
                  {poc.pts} {t('torneio.talisma.pts_por_unidade')}
                </p>
              </div>

              {/* Input */}
              <div className="px-2 py-2" style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <span className="font-nunito font-bold text-[0.52rem] leading-none"
                  style={{ color: C.TEXT_FAINT, flexShrink: 0, whiteSpace: 'nowrap' }}>
                  {t('torneio.label.eq_pts')}
                </span>
                <input
                  className="tw-input text-center font-mono font-black"
                  style={{ padding: '4px 2px', fontSize: '0.82rem', minWidth: 0, flex: 1 }}
                  placeholder="0"
                  value={qtds[poc.key] || ''}
                  onChange={e => handleQtd(poc.key, e.target.value)}
                  inputMode="numeric"
                />
              </div>

              {/* Subtotal */}
              <div className="px-2 pb-2 text-center">
                <p className="font-nunito font-black text-[0.88rem] leading-tight m-0"
                  style={{ color: ativo ? poc.cor : C.TEXT_FAINT }}>
                  {fmtN(soma)}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* ── RESUMO RÁPIDO ──────────────────────────────────────────────────── */}
      {ptsDosItens > 0 && (
        <div className="rounded-xl overflow-hidden mb-3"
          style={{ border: `1px solid rgba(139,58,154,0.35)`, background: 'rgba(139,58,154,0.06)' }}>
          <div className="px-4 py-2.5">
            <p className="font-nunito font-black text-[0.65rem] uppercase tracking-widest m-0 mb-1.5"
              style={{ color: COR }}>
              🧪 {t('torneio.pocoes.resumo_titulo')}
            </p>
            {POCOES_CHAVES.filter(p => (parseInt(qtds[p.key]) || 0) > 0).map(p => {
              const qtd  = parseInt(qtds[p.key]) || 0;
              const soma = qtd * p.pts;
              return (
                <div key={p.key} className="flex items-center justify-between mb-1 last:mb-0">
                  <span className="font-nunito font-semibold text-[0.72rem]"
                    style={{ color: C.TEXT_SECONDARY }}>
                    {p.emoji} {t(p.chave)}
                  </span>
                  <span className="font-nunito font-black text-[0.75rem]"
                    style={{ color: p.cor }}>
                    {qtd}× = {fmtN(soma)} pts
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── COMO FUNCIONA ──────────────────────────────────────────────────── */}
      <div className="rounded-xl overflow-hidden"
        style={{ border: `1px solid ${C.BORDER_SOFT}` }}>
        <div className="px-4 py-2.5"
          style={{ background: `linear-gradient(180deg, ${C.BG_CARD_TOP}, ${C.BG_CARD})`,
            borderBottom: `1.5px solid ${C.BORDER_SOFT}` }}>
          <p className="font-nunito font-black text-[0.72rem] uppercase tracking-widest m-0"
            style={{ color: C.TEXT_MUTED }}>
            📖 {t('torneio.label.como_funciona')}
          </p>
        </div>
        <div className="px-4 py-3" style={{ background: C.BG_CARD }}>
          {[
            { icon: '🟣', chave: 'torneio.pocoes.dica1' },
            { icon: '🔵', chave: 'torneio.pocoes.dica2' },
            { icon: '🟢', chave: 'torneio.pocoes.dica3' },
            { icon: '🏆', chave: 'torneio.pocoes.dica4' },
            { icon: '📦', chave: 'torneio.pocoes.dica5' },
          ].map((item, i) => (
            <div key={i} className="flex gap-2.5 items-start mb-2.5 last:mb-0">
              <span className="text-base leading-none shrink-0 mt-0.5">{item.icon}</span>
              <p className="font-nunito font-semibold text-[0.76rem] leading-relaxed m-0"
                style={{ color: C.TEXT_SECONDARY }}>
                {t(item.chave)}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TorneioPocoes;
