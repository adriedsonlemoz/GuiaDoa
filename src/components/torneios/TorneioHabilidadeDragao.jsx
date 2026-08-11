import React, { useState, useMemo } from 'react';
import { C } from '../../theme.js';
import Toast from '../../ui/Toast.jsx';
import { useI18n } from '../../hooks/useI18n.jsx';

const STORAGE_KEY = 'doa_torneio_habilidade_dragao';

const COR = '#C85A2C'; // laranja-fogo

const fmtN = n => Number(n || 0).toLocaleString('pt-BR');

const TorneioHabilidadeDragao = () => {
  const { t } = useI18n();
  const [qtd, setQtd] = useState(() => {
    try { const s = localStorage.getItem(STORAGE_KEY); return s ? JSON.parse(s).qtd || '' : ''; }
    catch { return ''; }
  });
  const [ptsPossuidos, setPtsPossuidos] = useState(() => {
    try { const s = localStorage.getItem(STORAGE_KEY); return s ? JSON.parse(s).ptsPossuidos || '' : ''; }
    catch { return ''; }
  });
  const [toast, setToast] = useState({ open: false, message: '', severity: 'success' });

  const ptsItem    = useMemo(() => (parseInt(qtd) || 0) * 100, [qtd]);
  const ptsPos     = parseInt(ptsPossuidos.replace(/\D/g, '')) || 0;
  const totalFinal = ptsItem + ptsPos;
  const ativo      = ptsItem > 0;

  const handleSalvar = () => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ qtd, ptsPossuidos }));
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
          style={{ background: 'linear-gradient(135deg, #3A1A0A 0%, #6A2A0A 100%)' }}>

          <div className="flex-1 min-w-0">
            <p className="font-nunito font-bold text-[0.6rem] tracking-[3px] uppercase m-0 mb-1"
              style={{ color: 'rgba(220,160,100,0.7)' }}>
              {t('torneio.aceleracoes.total_pontos')}
            </p>
            <p className="font-nunito font-black leading-none m-0"
              style={{
                fontSize: 'clamp(1.9rem,9vw,2.7rem)',
                letterSpacing: '0.05em',
                color: '#F0B070',
                textShadow: '0 2px 18px rgba(220,100,30,0.55)',
              }}>
              {fmtN(totalFinal)}
            </p>
            {ptsPos > 0 && (
              <p className="font-nunito font-semibold text-[0.6rem] m-0 mt-1"
                style={{ color: 'rgba(220,160,100,0.55)' }}>
                {fmtN(ptsItem)} {t('torneio.habilidade_dragao.detalhe_essencias')} + {fmtN(ptsPos)} {t('torneio.aceleracoes.detalhe_possuidos')}
              </p>
            )}
          </div>

          <button
            className="shrink-0"
            onClick={handleSalvar}
            style={{
              padding: '8px 14px', fontSize: '0.75rem', whiteSpace: 'nowrap',
              background: 'linear-gradient(180deg,#E07030,#A04010)',
              color: '#FFF4E8',
              border: '1px solid #7A2A08',
              borderRadius: 8, cursor: 'pointer', fontWeight: 800,
              fontFamily: '"Nunito",sans-serif',
            }}>
            💾 {t('torneio.label.salvar')}
          </button>
        </div>

        {/* Pontos já possuídos */}
        <div className="px-4 py-3"
          style={{ background: C.BG_CARD, borderTop: `1px solid rgba(200,90,44,0.25)` }}>
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

      {/* ── ESSÊNCIA DA FÚRIA ──────────────────────────────────────────────── */}
      <div className="rounded-xl overflow-hidden mb-3"
        style={{
          border:     `1px solid ${ativo ? COR : C.BORDER_SOFT}`,
          borderTop:  `3px solid ${ativo ? COR : C.BORDER_SOFT}`,
          background: ativo
            ? `linear-gradient(180deg, ${C.BG_CARD} 0%, ${COR}08 100%)`
            : C.BG_CARD,
          boxShadow: ativo ? `0 2px 8px ${COR}25` : 'none',
          transition: 'all 0.18s',
        }}>

        {/* Header do item */}
        <div className="px-4 pt-3 pb-2.5"
          style={{ borderBottom: `1px solid rgba(200,90,44,0.2)` }}>
          <div style={{ fontSize: '2rem', lineHeight: 1, marginBottom: 6, textAlign: 'center' }}>
            🔥
          </div>
          <p className="font-nunito font-black text-[0.9rem] m-0 leading-snug text-center"
            style={{ color: C.TEXT_PRIMARY }}>
            {t('torneio.habilidade_dragao.nome_item')}
          </p>
          <p className="font-nunito font-bold text-[0.68rem] m-0 mt-1 text-center"
            style={{ color: COR }}>
            {t('torneio.habilidade_dragao.pts_por_unidade')}
          </p>
        </div>

        {/* Input + resultado */}
        <div className="px-4 py-3 flex items-center gap-3">
          <div className="flex-1">
            <label className="font-nunito font-bold text-[0.62rem] tracking-widest uppercase block mb-1"
              style={{ color: C.TEXT_MUTED }}>
              {t('torneio.label.quantidade')}
            </label>
            <input
              className="tw-input text-center font-mono font-black"
              style={{ fontSize: '1.1rem' }}
              placeholder="0"
              value={qtd}
              onChange={e => setQtd(e.target.value.replace(/\D/g, ''))}
              inputMode="numeric"
            />
          </div>

          <div className="shrink-0 text-center" style={{ paddingTop: 18 }}>
            <span className="font-nunito font-black text-[0.75rem]"
              style={{ color: C.TEXT_FAINT }}>
              =
            </span>
          </div>

          <div className="flex-1 text-center" style={{ paddingTop: 18 }}>
            <p className="font-nunito font-black text-[1.5rem] leading-none m-0"
              style={{ color: ativo ? COR : C.TEXT_FAINT }}>
              {fmtN(ptsItem)}
            </p>
            <p className="font-nunito font-semibold text-[0.6rem] m-0 mt-0.5"
              style={{ color: C.TEXT_FAINT }}>
              {t('torneio.label.pontos_min')}
            </p>
          </div>
        </div>
      </div>

      {/* ── COMO FUNCIONA ──────────────────────────────────────────────────── */}
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
            { icon: '🔥', chave: 'torneio.habilidade_dragao.dica1' },
            { icon: '🌍', chave: 'torneio.habilidade_dragao.dica2' },
            { icon: '🐉', chave: 'torneio.habilidade_dragao.dica3' },
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

export default TorneioHabilidadeDragao;
