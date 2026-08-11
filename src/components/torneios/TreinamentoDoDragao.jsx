import React, { useState, useMemo } from 'react';
import { C } from '../../theme.js';
import Toast from '../../ui/Toast.jsx';
import { useI18n } from '../../hooks/useI18n.jsx';

const STORAGE_KEY = 'doa_treinamento_dragao';
const COR         = '#7A4BAE'; // roxo-dragão

const CARNES_CHAVES = [
  { key: 'carneiro', chave: 'torneio.treinamento_dragao.carne.carneiro', emoji: '🐑', pts: 100   },
  { key: 'boi',      chave: 'torneio.treinamento_dragao.carne.boi',      emoji: '🐄', pts: 200   },
  { key: 'frango',   chave: 'torneio.treinamento_dragao.carne.frango',   emoji: '🐔', pts: 500   },
  { key: 'veado',    chave: 'torneio.treinamento_dragao.carne.veado',    emoji: '🦌', pts: 1000  },
  { key: 'salmao',   chave: 'torneio.treinamento_dragao.carne.salmao',   emoji: '🐟', pts: 2000  },
  { key: 'lagosta',  chave: 'torneio.treinamento_dragao.carne.lagosta',  emoji: '🦞', pts: 5000  },
];

const fmtN = n => Number(n || 0).toLocaleString('pt-BR');

const TreinamentoDoDragao = () => {
  const { t } = useI18n();
  const [qtds, setQtds] = useState(() => {
    try {
      const s = localStorage.getItem(STORAGE_KEY);
      return s ? JSON.parse(s).qtds || {} : {};
    } catch { return {}; }
  });
  const [ptsPossuidos, setPtsPossuidos] = useState(() => {
    try {
      const s = localStorage.getItem(STORAGE_KEY);
      return s ? JSON.parse(s).ptsPossuidos || '' : '';
    } catch { return ''; }
  });
  const [toast, setToast] = useState({ open: false, message: '', severity: 'success' });

  const handleQtd = (key, value) =>
    setQtds(q => ({ ...q, [key]: value.replace(/\D/g, '') }));

  const ptsDasCarnes = useMemo(
    () => CARNES_CHAVES.reduce((acc, c) => acc + (parseInt(qtds[c.key]) || 0) * c.pts, 0),
    [qtds]
  );
  const ptsPos     = parseInt(ptsPossuidos.replace(/\D/g, '')) || 0;
  const totalFinal = ptsDasCarnes + ptsPos;

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

      {/* ── TOTAL ────────────────────────────────────────────────────────────── */}
      <div className="rounded-xl overflow-hidden mb-3"
        style={{ border: `1.5px solid ${C.BORDER}`, boxShadow: '0 3px 14px rgba(62,47,28,0.15)' }}>

        {/* Contador + botão salvar */}
        <div className="px-4 py-3 flex items-center gap-3"
          style={{ background: 'linear-gradient(135deg, #1E0A35 0%, #4A1E72 100%)' }}>

          <div className="flex-1 min-w-0">
            <p className="font-nunito font-bold text-[0.6rem] tracking-[3px] uppercase m-0 mb-1"
              style={{ color: 'rgba(180,140,230,0.7)' }}>
              {t('torneio.aceleracoes.total_pontos')}
            </p>
            <p className="font-nunito font-black leading-none m-0"
              style={{
                fontSize: 'clamp(1.9rem,9vw,2.7rem)',
                letterSpacing: '0.05em',
                color: '#C8A0F0',
                textShadow: '0 2px 18px rgba(150,80,220,0.55)',
              }}>
              {fmtN(totalFinal)}
            </p>
            {ptsPos > 0 && (
              <p className="font-nunito font-semibold text-[0.6rem] m-0 mt-1"
                style={{ color: 'rgba(180,140,230,0.55)' }}>
                {fmtN(ptsDasCarnes)} {t('torneio.treinamento_dragao.detalhe_carnes')} + {fmtN(ptsPos)} {t('torneio.aceleracoes.detalhe_possuidos')}
              </p>
            )}
          </div>

          <button
            className="shrink-0"
            onClick={handleSalvar}
            style={{
              padding: '8px 14px', fontSize: '0.75rem', whiteSpace: 'nowrap',
              background: 'linear-gradient(180deg,#8040C0,#5A1A90)',
              color: '#F4ECFF',
              border: '1px solid #3A0A60',
              borderRadius: 8, cursor: 'pointer', fontWeight: 800,
              fontFamily: '"Nunito",sans-serif',
            }}>
            💾 {t('torneio.label.salvar')}
          </button>
        </div>

        {/* Campo pontos possuídos */}
        <div className="px-4 py-3"
          style={{ background: C.BG_CARD, borderTop: `1px solid rgba(122,75,174,0.25)` }}>
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

      {/* ── CARNES — grid 3 colunas ───────────────────────────────────────────── */}
      <div className="grid grid-cols-3 gap-1.5 mb-3">
        {CARNES_CHAVES.map(c => {
          const qtd  = parseInt(qtds[c.key]) || 0;
          const soma = qtd * c.pts;
          const ativo = soma > 0;
          return (
            <div key={c.key}
              className="rounded-xl overflow-hidden"
              style={{
                border:    `1px solid ${ativo ? COR : C.BORDER_SOFT}`,
                borderTop: `3px solid ${ativo ? COR : C.BORDER_SOFT}`,
                background: ativo
                  ? `linear-gradient(180deg, ${C.BG_CARD} 0%, rgba(122,75,174,0.07) 100%)`
                  : C.BG_CARD,
                boxShadow: ativo ? `0 2px 8px rgba(122,75,174,0.15)` : 'none',
                transition: 'all 0.18s',
              }}>

              {/* Topo: emoji + nome + pts/item */}
              <div className="px-2 pt-2 pb-1.5"
                style={{ borderBottom: `1px solid rgba(122,75,174,0.15)` }}>
                <p className="text-center text-lg leading-tight m-0">{c.emoji}</p>
                <p className="font-nunito font-black text-[0.72rem] m-0 mt-0.5 leading-tight text-center"
                  style={{ color: C.TEXT_PRIMARY }}>
                  {t(c.chave)}
                </p>
                <p className="font-nunito font-semibold text-[0.55rem] m-0 mt-0.5 text-center"
                  style={{ color: C.TEXT_MUTED }}>
                  {fmtN(c.pts)} {t('torneio.treinamento_dragao.pts_por_item')}
                </p>
              </div>

              {/* Input com "= pts" inline */}
              <div className="px-2 py-2"
                style={{ display: 'flex', alignItems: 'center', gap: 4, flexWrap: 'nowrap' }}>
                <span className="font-nunito font-bold text-[0.52rem] leading-none"
                  style={{ color: C.TEXT_FAINT, flexShrink: 0, whiteSpace: 'nowrap' }}>
                  {t('torneio.label.eq_pts')}
                </span>
                <input
                  className="tw-input text-center font-mono font-black"
                  style={{ padding: '4px 2px', fontSize: '0.82rem', minWidth: 0, flex: 1 }}
                  placeholder="0"
                  value={qtds[c.key] || ''}
                  onChange={e => handleQtd(c.key, e.target.value)}
                  inputMode="numeric"
                />
              </div>

              {/* Resultado */}
              <div className="px-2 pb-2 text-center">
                <p className="font-nunito font-black text-[0.88rem] leading-tight m-0"
                  style={{ color: ativo ? COR : C.TEXT_FAINT }}>
                  {fmtN(soma)}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* ── COMO FUNCIONA ─────────────────────────────────────────────────────── */}
      <div className="rounded-xl overflow-hidden"
        style={{ border: `1px solid ${C.BORDER_SOFT}` }}>
        <div className="px-4 py-2.5"
          style={{
            background: `linear-gradient(180deg, ${C.BG_CARD_TOP}, ${C.BG_CARD})`,
            borderBottom: `1.5px solid ${C.BORDER_SOFT}`,
          }}>
          <p className="font-nunito font-black text-[0.72rem] uppercase tracking-widest m-0"
            style={{ color: C.TEXT_MUTED }}>
            📖 {t('torneio.label.como_funciona')}
          </p>
        </div>
        <div className="px-4 py-3" style={{ background: C.BG_CARD }}>
          {[
            { icon: '🐉', chave: 'torneio.treinamento_dragao.dica1' },
            { icon: '🌿', chave: 'torneio.treinamento_dragao.dica2' },
            { icon: '📋', chave: 'torneio.treinamento_dragao.dica3' },
            { icon: '🎁', chave: 'torneio.treinamento_dragao.dica4' },
            { icon: '💎', chave: 'torneio.treinamento_dragao.dica5' },
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

export default TreinamentoDoDragao;
