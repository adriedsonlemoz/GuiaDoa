import React from 'react';
import { C } from '../../theme.js';
import { useI18n } from '../../hooks/useI18n.jsx';

const COR = '#A83C2C'; // vermelho-general

const DICAS_CHAVES = [
  { icon: '🎖️', tituloChave: 'torneio.general.dica1.titulo', textoChave: 'torneio.general.dica1.texto' },
  { icon: '🏛️', tituloChave: 'torneio.general.dica2.titulo', textoChave: 'torneio.general.dica2.texto' },
  { icon: '🃏', tituloChave: 'torneio.general.dica3.titulo', textoChave: 'torneio.general.dica3.texto' },
  { icon: '⭐', tituloChave: 'torneio.general.dica4.titulo', textoChave: 'torneio.general.dica4.texto' },
  { icon: '💡', tituloChave: 'torneio.general.dica5.titulo', textoChave: 'torneio.general.dica5.texto' },
];

const TorneioGeneral = () => {
  const { t } = useI18n();
  return (
  <div className="max-w-md mx-auto pb-4" style={{ animation: 'reveal-up 0.4s ease both' }}>

    {/* ── Cabeçalho ──────────────────────────────────────────────────────────── */}
    <div
      className="rounded-xl overflow-hidden mb-3"
      style={{ border: `1.5px solid ${C.BORDER}`, boxShadow: '0 3px 14px rgba(62,47,28,0.15)' }}
    >
      <div
        className="px-4 py-3"
        style={{ background: `linear-gradient(135deg, #2A0A0A 0%, #5A1A1A 100%)` }}
      >
        <p
          className="font-nunito font-bold text-[0.6rem] tracking-[3px] uppercase m-0 mb-1"
          style={{ color: 'rgba(220,160,140,0.7)' }}
        >
          {t('torneio.general.badge')}
        </p>
        <p
          className="font-nunito font-black leading-tight m-0"
          style={{ fontSize: '1.1rem', color: '#F0A090' }}
        >
          🎖️ {t('torneio.titulo.general')}
        </p>
      </div>
      <div className="px-4 py-3" style={{ background: C.BG_CARD }}>
        <p
          className="font-nunito font-semibold text-[0.76rem] leading-relaxed m-0"
          style={{ color: C.TEXT_SECONDARY }}
        >
          {t('torneio.general.intro_pre')}<strong>{t('torneio.general.intro_bold')}</strong>{t('torneio.general.intro_pos')}
        </p>
      </div>
    </div>

    {/* ── Como Funciona ──────────────────────────────────────────────────────── */}
    <div
      className="rounded-xl overflow-hidden"
      style={{ border: `1px solid ${C.BORDER_SOFT}`, borderTop: `3px solid ${COR}` }}
    >
      <div
        className="px-4 py-2.5"
        style={{
          background: `linear-gradient(180deg, ${C.BG_CARD_TOP}, ${C.BG_CARD})`,
          borderBottom: `1.5px solid ${C.BORDER_SOFT}`,
        }}
      >
        <p
          className="font-nunito font-black text-[0.72rem] uppercase tracking-widest m-0"
          style={{ color: C.TEXT_MUTED }}
        >
          📖 {t('torneio.label.como_funciona')}
        </p>
      </div>
      <div className="px-4 py-3" style={{ background: C.BG_CARD }}>
        {DICAS_CHAVES.map((item, i) => (
          <div key={i} className="flex gap-2.5 items-start mb-3 last:mb-0">
            <span className="text-base leading-none shrink-0 mt-0.5">{item.icon}</span>
            <div>
              <p
                className="font-nunito font-black text-[0.74rem] m-0 mb-0.5"
                style={{ color: C.TEXT_PRIMARY }}
              >
                {t(item.tituloChave)}
              </p>
              <p
                className="font-nunito font-semibold text-[0.73rem] leading-relaxed m-0"
                style={{ color: C.TEXT_SECONDARY }}
              >
                {t(item.textoChave)}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
  );
};

export default TorneioGeneral;
