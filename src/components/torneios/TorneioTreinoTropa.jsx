import React, { useState, useMemo } from 'react';
import { C } from '../../theme.js';
import { dbTropas } from '../../data/tropas.js';
import Toast from '../../ui/Toast.jsx';
import { useI18n } from '../../hooks/useI18n.jsx';

const STORAGE_KEY = 'doa_treino_tropa';
const COR         = '#A83C2C'; // vermelho-combate

const BONUS_CHAVES = [
  { value: 1, chave: 'torneio.treino_tropa.bonus.x1' },
  { value: 2, chave: 'torneio.treino_tropa.bonus.x2' },
  { value: 3, chave: 'torneio.treino_tropa.bonus.x3' },
  { value: 4, chave: 'torneio.treino_tropa.bonus.x4' },
  { value: 5, chave: 'torneio.treino_tropa.bonus.x5' },
];

const sortedTropas = [...dbTropas].sort((a, b) => a.nome.localeCompare(b.nome));
const fmtN = n => Number(n || 0).toLocaleString('pt-BR');

const emptyRow = () => ({ id: Date.now() + Math.random(), tropa: '', qtd: '', bonus: 1 });

const TorneioTreinoTropa = () => {
  const { t } = useI18n();
  const [linhas, setLinhas] = useState(() => {
    try {
      const s = localStorage.getItem(STORAGE_KEY);
      return s ? JSON.parse(s).linhas || [emptyRow(), emptyRow()] : [emptyRow(), emptyRow()];
    } catch { return [emptyRow(), emptyRow()]; }
  });
  const [ptsPossuidos, setPtsPossuidos] = useState(() => {
    try {
      const s = localStorage.getItem(STORAGE_KEY);
      return s ? JSON.parse(s).ptsPossuidos || '' : '';
    } catch { return ''; }
  });
  const [toast, setToast] = useState({ open: false, message: '', severity: 'success' });

  const setLinha = (id, field, value) =>
    setLinhas(ls => ls.map(l => l.id === id ? { ...l, [field]: value } : l));

  const addLinha  = () => setLinhas(ls => [...ls, emptyRow()]);
  const rmLinha   = id  => { if (linhas.length > 1) setLinhas(ls => ls.filter(l => l.id !== id)); };

  const ptsDasLinhas = useMemo(() =>
    linhas.reduce((acc, l) => {
      const tropa = dbTropas.find(item => item.nome === l.tropa);
      const poder = tropa?.poder || 0;
      const qtd   = parseInt((l.qtd || '').replace(/\./g, '')) || 0;
      return acc + qtd * poder * (l.bonus || 1);
    }, 0),
    [linhas]
  );

  const ptsPos     = parseInt(ptsPossuidos.replace(/\D/g, '')) || 0;
  const totalFinal = ptsDasLinhas + ptsPos;

  const handleSalvar = () => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ linhas, ptsPossuidos }));
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
          style={{ background: 'linear-gradient(135deg, #2A0A0A 0%, #5A1A1A 100%)' }}>
          <div className="flex-1 min-w-0">
            <p className="font-nunito font-bold text-[0.6rem] tracking-[3px] uppercase m-0 mb-1"
              style={{ color: 'rgba(220,160,140,0.7)' }}>
              {t('torneio.aceleracoes.total_pontos')}
            </p>
            <p className="font-nunito font-black leading-none m-0"
              style={{
                fontSize: 'clamp(1.9rem,9vw,2.7rem)',
                letterSpacing: '0.05em',
                color: '#F0A090',
                textShadow: '0 2px 18px rgba(200,60,40,0.55)',
              }}>
              {fmtN(totalFinal)}
            </p>
            {ptsPos > 0 && (
              <p className="font-nunito font-semibold text-[0.6rem] m-0 mt-1"
                style={{ color: 'rgba(220,160,140,0.55)' }}>
                {fmtN(ptsDasLinhas)} {t('torneio.treino_tropa.detalhe_treino')} + {fmtN(ptsPos)} {t('torneio.aceleracoes.detalhe_possuidos')}
              </p>
            )}
          </div>
          <button className="shrink-0" onClick={handleSalvar}
            style={{
              padding: '8px 14px', fontSize: '0.75rem', whiteSpace: 'nowrap',
              background: 'linear-gradient(180deg,#C04030,#8A1A10)',
              color: '#FFF4F0', border: '1px solid #6A0A0A',
              borderRadius: 8, cursor: 'pointer', fontWeight: 800,
              fontFamily: '"Nunito",sans-serif',
            }}>
            💾 {t('torneio.label.salvar')}
          </button>
        </div>

        {/* Pontos possuídos */}
        <div className="px-4 py-3"
          style={{ background: C.BG_CARD, borderTop: `1px solid rgba(168,60,44,0.25)` }}>
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

      {/* ── LINHAS DE TREINO ─────────────────────────────────────────────────── */}
      <div className="rounded-xl overflow-hidden mb-3"
        style={{ border: `1px solid ${C.BORDER_SOFT}`, borderTop: `3px solid ${COR}` }}>

        <div className="px-4 py-2.5"
          style={{
            background: `linear-gradient(180deg, ${C.BG_CARD_TOP}, ${C.BG_CARD})`,
            borderBottom: `1.5px solid ${C.BORDER_SOFT}`,
          }}>
          <p className="font-nunito font-black text-[0.72rem] uppercase tracking-widest m-0"
            style={{ color: C.TEXT_MUTED }}>
            ⚔️ {t('torneio.treino_tropa.tropas_treinadas')}
          </p>
        </div>

        <div className="px-3 py-3 space-y-2" style={{ background: C.BG_CARD }}>
          {linhas.map(l => {
            const tropa = dbTropas.find(item => item.nome === l.tropa);
            const poder = tropa?.poder || 0;
            const qtd   = parseInt((l.qtd || '').replace(/\./g, '')) || 0;
            const sub   = qtd * poder * (l.bonus || 1);
            const ativo = sub > 0;
            return (
              <div key={l.id}
                className="rounded-lg p-2"
                style={{
                  background: ativo ? `${COR}08` : C.BG_SECONDARY,
                  border: `1px solid ${ativo ? COR + '55' : C.BORDER_SOFT}`,
                  transition: 'all 0.18s',
                }}>

                {/* Linha 1: select tropa + botão remover */}
                <div className="flex items-center gap-1.5 mb-1.5">
                  <select
                    className="tw-select flex-1 min-w-0"
                    style={{ fontSize: '0.75rem', padding: '5px 6px' }}
                    value={l.tropa}
                    onChange={e => setLinha(l.id, 'tropa', e.target.value)}
                  >
                    <option value="">{t('torneio.layout.selecionar_tropa')}</option>
                    {sortedTropas.map(item => (
                      <option key={item.nome} value={item.nome}>{item.nome}</option>
                    ))}
                  </select>
                  <button
                    className="w-6 h-6 flex items-center justify-center rounded shrink-0 border-none cursor-pointer text-xs font-bold"
                    style={{ color: C.ERROR, background: 'transparent', border: `1px solid ${C.ERROR}33` }}
                    onClick={() => rmLinha(l.id)}
                  >✕</button>
                </div>

                {/* Linha 2: quantidade + bônus + subtotal */}
                <div className="flex items-center gap-1.5">
                  {/* Quantidade */}
                  <div className="flex-1 min-w-0">
                    <p className="font-nunito font-bold text-[0.58rem] uppercase tracking-wide m-0 mb-0.5"
                      style={{ color: C.TEXT_FAINT }}>{t('torneio.label.quantidade')}</p>
                    <input
                      className="tw-input text-center font-mono font-black w-full"
                      style={{ fontSize: '0.82rem', padding: '4px 4px' }}
                      placeholder="0"
                      value={l.qtd}
                      onChange={e => {
                        const n = e.target.value.replace(/\D/g, '');
                        setLinha(l.id, 'qtd', n ? parseInt(n).toLocaleString('pt-BR') : '');
                      }}
                      inputMode="numeric"
                    />
                  </div>

                  {/* Bônus */}
                  <div style={{ width: 90, flexShrink: 0 }}>
                    <p className="font-nunito font-bold text-[0.58rem] uppercase tracking-wide m-0 mb-0.5"
                      style={{ color: C.TEXT_FAINT }}>{t('torneio.treino_tropa.bonus_label')}</p>
                    <select
                      className="tw-select w-full"
                      style={{ fontSize: '0.73rem', padding: '4px 4px' }}
                      value={l.bonus}
                      onChange={e => setLinha(l.id, 'bonus', parseInt(e.target.value))}
                    >
                      {BONUS_CHAVES.map(b => (
                        <option key={b.value} value={b.value}>{t(b.chave)}</option>
                      ))}
                    </select>
                  </div>

                  {/* Subtotal */}
                  <div className="text-right shrink-0" style={{ minWidth: 56 }}>
                    <p className="font-nunito font-bold text-[0.58rem] uppercase tracking-wide m-0 mb-0.5"
                      style={{ color: C.TEXT_FAINT }}>{t('torneio.label.pontos')}</p>
                    <p className="font-nunito font-black text-[0.9rem] leading-none m-0"
                      style={{ color: ativo ? COR : C.TEXT_FAINT }}>
                      {fmtN(sub)}
                    </p>
                  </div>
                </div>

                {/* Info poder (se tropa selecionada) */}
                {tropa && (
                  <p className="font-nunito font-semibold text-[0.6rem] m-0 mt-1"
                    style={{ color: C.TEXT_FAINT }}>
                    {tropa.nome} · {fmtN(poder)} {t('torneio.treino_tropa.poder_por_un')}
                    {l.bonus > 1 && <span style={{ color: COR }}> · {t('torneio.treino_tropa.bonus_x')} {l.bonus}×</span>}
                  </p>
                )}
              </div>
            );
          })}

          <button className="btn-ghost btn-sm w-full mt-1" onClick={addLinha}>
            {t('torneio.treino_tropa.adicionar_tropa')}
          </button>
        </div>
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
            { icon: '⚔️', chave: 'torneio.treino_tropa.dica1' },
            { icon: '⭐', chave: 'torneio.treino_tropa.dica2' },
            { icon: '🔢', chave: 'torneio.treino_tropa.dica3' },
            { icon: '💡', chave: 'torneio.treino_tropa.dica4' },
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

export default TorneioTreinoTropa;
