import React, { useState, useMemo } from 'react';
import { C } from '../../theme.js';
import Toast from '../../ui/Toast.jsx';
import { useI18n } from '../../hooks/useI18n.jsx';

const STORAGE_KEY = 'doa_evolucao_tropas';
const COR         = '#C87A2C';

const FOSSEIS_CHAVES = [
  { key: 'crepusculo1', chave: 'torneio.evolucao_tropas.fossil.crepusculo1', emoji: '🌅', cor: '#C87A2C' },
  { key: 'crepusculo2', chave: 'torneio.evolucao_tropas.fossil.crepusculo2', emoji: '🌄', cor: '#A85A20' },
  { key: 'anciao1',     chave: 'torneio.evolucao_tropas.fossil.anciao1',     emoji: '🦴', cor: '#5A8A5C' },
  { key: 'anciao2',     chave: 'torneio.evolucao_tropas.fossil.anciao2',     emoji: '💎', cor: '#8B6BAE' },
];

const fmtN = n => Number(n || 0).toLocaleString('pt-BR');

const EvolucaoTropas = () => {
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

  const handleQtd = (key, value) =>
    setQtds(q => ({ ...q, [key]: value.replace(/\D/g, '') }));

  const ptsDosItens = useMemo(
    () => FOSSEIS_CHAVES.reduce((acc, f) => acc + Math.floor((parseInt(qtds[f.key]) || 0) / 10), 0),
    [qtds]
  );
  const ptsPos     = parseInt(ptsPossuidos.replace(/\D/g, '')) || 0;
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

      {/* ── TOTAL ────────────────────────────────────────────────────────────── */}
      <div className="rounded-xl overflow-hidden mb-3"
        style={{ border: `1.5px solid ${C.BORDER}`, boxShadow: '0 3px 14px rgba(62,47,28,0.15)' }}>

        <div className="px-4 py-3 flex items-center gap-3"
          style={{ background: 'linear-gradient(135deg, #2A1800 0%, #5A3200 100%)' }}>
          <div className="flex-1 min-w-0">
            <p className="font-nunito font-bold text-[0.6rem] tracking-[3px] uppercase m-0 mb-1"
              style={{ color: 'rgba(220,160,80,0.7)' }}>
              {t('torneio.aceleracoes.total_pontos')}
            </p>
            <p className="font-nunito font-black leading-none m-0"
              style={{
                fontSize: 'clamp(1.9rem,9vw,2.7rem)',
                letterSpacing: '0.05em',
                color: '#F0B060',
                textShadow: '0 2px 18px rgba(200,120,40,0.55)',
              }}>
              {fmtN(totalFinal)}
            </p>
            {ptsPos > 0 && (
              <p className="font-nunito font-semibold text-[0.6rem] m-0 mt-1"
                style={{ color: 'rgba(220,160,80,0.55)' }}>
                {fmtN(ptsDosItens)} {t('torneio.evolucao_tropas.detalhe_fosseis')} + {fmtN(ptsPos)} {t('torneio.aceleracoes.detalhe_possuidos')}
              </p>
            )}
          </div>
          <button className="shrink-0" onClick={handleSalvar}
            style={{
              padding: '8px 14px', fontSize: '0.75rem', whiteSpace: 'nowrap',
              background: 'linear-gradient(180deg,#D08030,#904010)',
              color: '#FFF4E0', border: '1px solid #6A2A00',
              borderRadius: 8, cursor: 'pointer', fontWeight: 800,
              fontFamily: '"Nunito",sans-serif',
            }}>
            💾 {t('torneio.label.salvar')}
          </button>
        </div>

        {/* Pontos possuídos */}
        <div className="px-4 py-3"
          style={{ background: C.BG_CARD, borderTop: `1px solid rgba(200,122,44,0.25)` }}>
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

      {/* ── FÓSSEIS — grid 3 colunas ─────────────────────────────────────────── */}
      <div className="grid grid-cols-2 gap-2 mb-3">
        {FOSSEIS_CHAVES.map(f => {
          const qtd  = parseInt(qtds[f.key]) || 0;
          const soma = Math.floor(qtd / 10);
          const ativo = soma > 0;
          return (
            <div key={f.key}
              className="rounded-xl overflow-hidden"
              style={{
                border:    `1px solid ${ativo ? f.cor : C.BORDER_SOFT}`,
                borderTop: `3px solid ${ativo ? f.cor : C.BORDER_SOFT}`,
                background: ativo
                  ? `linear-gradient(180deg, ${C.BG_CARD} 0%, ${f.cor}08 100%)`
                  : C.BG_CARD,
                boxShadow: ativo ? `0 2px 8px ${f.cor}25` : 'none',
                transition: 'all 0.18s',
              }}>

              {/* Topo */}
              <div className="px-2 pt-2.5 pb-2"
                style={{ borderBottom: `1px solid rgba(200,168,74,0.12)` }}>
                <p className="text-center text-xl leading-tight m-0">{f.emoji}</p>
                <p className="font-nunito font-black text-[0.68rem] m-0 mt-1 leading-snug text-center"
                  style={{ color: C.TEXT_PRIMARY }}>
                  {t(f.chave)}
                </p>
                <p className="font-nunito font-semibold text-[0.58rem] m-0 mt-0.5 text-center"
                  style={{ color: f.cor, fontWeight: 800 }}>
                  {t('torneio.evolucao_tropas.conversao')}
                </p>
              </div>

              {/* Input */}
              <div className="px-2 py-2"
                style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                <span className="font-nunito font-bold text-[0.5rem] leading-none"
                  style={{ color: C.TEXT_FAINT, flexShrink: 0, whiteSpace: 'nowrap' }}>
                  {t('torneio.label.eq_pts')}
                </span>
                <input
                  className="tw-input text-center font-mono font-black"
                  style={{ padding: '4px 2px', fontSize: '0.82rem', minWidth: 0, flex: 1 }}
                  placeholder="0"
                  value={qtds[f.key] || ''}
                  onChange={e => handleQtd(f.key, e.target.value)}
                  inputMode="numeric"
                />
              </div>

              {/* Subtotal */}
              <div className="px-2 pb-2.5 text-center">
                <p className="font-nunito font-black text-[0.9rem] leading-tight m-0"
                  style={{ color: ativo ? f.cor : C.TEXT_FAINT }}>
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
            { icon: '⭐', chave: 'torneio.evolucao_tropas.dica1' },
            { icon: '🗺️', chave: 'torneio.evolucao_tropas.dica2' },
            { icon: '🛒', chave: 'torneio.evolucao_tropas.dica3' },
            { icon: '🎁', chave: 'torneio.evolucao_tropas.dica4' },
            { icon: '💎', chave: 'torneio.evolucao_tropas.dica5' },
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

export default EvolucaoTropas;
