import React, { useState, useMemo } from 'react';
import { C } from '../../theme.js';
import Toast from '../../ui/Toast.jsx';
import { useI18n } from '../../hooks/useI18n.jsx';

const STORAGE_KEY = 'doa_torneio_aceleracoes';

const ITENS_CHAVES = [
  { key: 'i1',   chave: 'torneio.aceleracoes.item.1min',  min: 1    },
  { key: 'i3',   chave: 'torneio.aceleracoes.item.3min',  min: 3    },
  { key: 'i5',   chave: 'torneio.aceleracoes.item.5min',  min: 5    },
  { key: 'i15',  chave: 'torneio.aceleracoes.item.15min', min: 15   },
  { key: 'i60',  chave: 'torneio.aceleracoes.item.1h',    min: 60   },
  { key: 'i150', chave: 'torneio.aceleracoes.item.2_5h',  min: 150  },
  { key: 'i480', chave: 'torneio.aceleracoes.item.8h',    min: 480  },
  { key: 'i900', chave: 'torneio.aceleracoes.item.15h',   min: 900  },
  { key: 'i1440',chave: 'torneio.aceleracoes.item.24h',   min: 1440 },
  { key: 'i2880',chave: 'torneio.aceleracoes.item.2dias', min: 2880 },
  { key: 'i5760',chave: 'torneio.aceleracoes.item.4dias', min: 5760 },
];

const fmtN = n => Number(n || 0).toLocaleString('pt-BR');

const TorneioAceleracoes = () => {
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
    ITENS_CHAVES.reduce((acc, it) => acc + (parseInt(qtds[it.key]) || 0) * it.min, 0),
    [qtds]
  );

  const ptsPos = parseInt(ptsPossuidos.replace(/\D/g, '')) || 0;
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

      {/* ── TOTAL ───────────────────────────────────────────────────────────── */}
      <div className="rounded-xl overflow-hidden mb-3"
        style={{ border: `1.5px solid ${C.BORDER}`, boxShadow: '0 3px 14px rgba(62,47,28,0.15)' }}>

        {/* Contador principal + botão salvar lado a lado */}
        <div className="px-4 py-3 flex items-center gap-3"
          style={{ background: `linear-gradient(135deg, ${C.NAVY} 0%, #2A4C72 100%)` }}>

          {/* Número total */}
          <div className="flex-1 min-w-0">
            <p className="font-nunito font-bold text-[0.6rem] tracking-[3px] uppercase m-0 mb-1"
              style={{ color: 'rgba(200,168,74,0.7)' }}>
              {t('torneio.aceleracoes.total_pontos')}
            </p>
            <p className="font-nunito font-black leading-none m-0"
              style={{
                fontSize: 'clamp(1.9rem,9vw,2.7rem)',
                letterSpacing: '0.05em',
                color: C.ACCENT,
                textShadow: '0 2px 18px rgba(200,168,74,0.55)',
              }}>
              {fmtN(totalFinal)}
            </p>
            {ptsPos > 0 && (
              <p className="font-nunito font-semibold text-[0.6rem] m-0 mt-1"
                style={{ color: 'rgba(200,168,74,0.55)' }}>
                {fmtN(ptsDosItens)} {t('torneio.aceleracoes.detalhe_itens')} + {fmtN(ptsPos)} {t('torneio.aceleracoes.detalhe_possuidos')}
              </p>
            )}
          </div>

          {/* Botão salvar — ao lado do total */}
          <button
            className="btn-gold shrink-0"
            onClick={handleSalvar}
            style={{ padding: '8px 14px', fontSize: '0.75rem', whiteSpace: 'nowrap' }}>
            💾 {t('torneio.label.salvar')}
          </button>
        </div>

        {/* Campo pontos possuídos */}
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

      {/* ── ITENS — 3 colunas ───────────────────────────────────────────────── */}
      <div className="grid grid-cols-3 gap-1.5 mb-3">
        {ITENS_CHAVES.map(it => {
          const qtd  = parseInt(qtds[it.key]) || 0;
          const soma = qtd * it.min;
          const ativo = soma > 0;
          return (
            <div key={it.key}
              className="rounded-xl overflow-hidden"
              style={{
                border: `1px solid ${ativo ? C.BLUE : C.BORDER_SOFT}`,
                borderTop: `3px solid ${ativo ? C.BLUE : C.BORDER_SOFT}`,
                background: ativo
                  ? `linear-gradient(180deg, ${C.BG_CARD} 0%, rgba(59,92,140,0.06) 100%)`
                  : C.BG_CARD,
                boxShadow: ativo ? '0 2px 8px rgba(59,92,140,0.12)' : 'none',
                transition: 'all 0.18s',
              }}>

              {/* Topo: nome + pts/item */}
              <div className="px-2 pt-2 pb-1.5"
                style={{ borderBottom: `1px solid rgba(200,168,74,0.15)` }}>
                <p className="font-nunito font-black text-[0.72rem] m-0 leading-tight"
                  style={{ color: C.TEXT_PRIMARY }}>
                  {t(it.chave)}
                </p>
                <p className="font-nunito font-semibold text-[0.55rem] m-0 mt-0.5"
                  style={{ color: C.TEXT_MUTED }}>
                  {fmtN(it.min)} {it.min !== 1 ? t('torneio.aceleracoes.pt_plural') : t('torneio.aceleracoes.pt_singular')}
                </p>
              </div>

              {/* Input com "= pts" inline à esquerda */}
              <div className="px-2 py-2" style={{ display: 'flex', alignItems: 'center', gap: 4, flexWrap: 'nowrap' }}>
                <span className="font-nunito font-bold text-[0.52rem] leading-none"
                  style={{ color: C.TEXT_FAINT, flexShrink: 0, whiteSpace: 'nowrap' }}>
                  {t('torneio.label.eq_pts')}
                </span>
                <input
                  className="tw-input text-center font-mono font-black"
                  style={{ padding: '4px 2px', fontSize: '0.82rem', minWidth: 0, flex: 1 }}
                  placeholder="0"
                  value={qtds[it.key] || ''}
                  onChange={e => handleQtd(it.key, e.target.value)}
                  inputMode="numeric"
                />
              </div>

              {/* Resultado */}
              <div className="px-2 pb-2 text-center">
                <p className="font-nunito font-black text-[0.88rem] leading-tight m-0"
                  style={{ color: ativo ? C.BLUE : C.TEXT_FAINT }}>
                  {fmtN(soma)}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* ── COMO FUNCIONA ────────────────────────────────────────────────────── */}
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
            { icon:'⚡', chave:'torneio.aceleracoes.dica1' },
            { icon:'🧮', chave:'torneio.aceleracoes.dica2' },
            { icon:'📦', chave:'torneio.aceleracoes.dica3' },
            { icon:'💡', chave:'torneio.aceleracoes.dica4' },
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

export default TorneioAceleracoes;
