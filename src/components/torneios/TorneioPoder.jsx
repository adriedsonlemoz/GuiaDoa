import React from 'react';
import { C } from '../../theme.js';
import { useI18n } from '../../hooks/useI18n.jsx';

const FONTES_CHAVES = [
  { icon: '⚔️', tituloChave: 'torneio.poder.dica1.titulo', textoChave: 'torneio.poder.dica1.texto' },
  { icon: '🐉', tituloChave: 'torneio.poder.dica2.titulo', textoChave: 'torneio.poder.dica2.texto' },
  { icon: '📚', tituloChave: 'torneio.poder.dica3.titulo', textoChave: 'torneio.poder.dica3.texto' },
  { icon: '🎖️', tituloChave: 'torneio.poder.dica4.titulo', textoChave: 'torneio.poder.dica4.texto' },
  { icon: '💡', tituloChave: 'torneio.poder.dica5.titulo', textoChave: 'torneio.poder.dica5.texto' },
];

const TorneioPoder = () => {
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
        style={{ background: `linear-gradient(135deg, ${C.NAVY ?? '#1C3A5E'} 0%, #2A4C72 100%)` }}
      >
        <p
          className="font-nunito font-bold text-[0.6rem] tracking-[3px] uppercase m-0 mb-1"
          style={{ color: 'rgba(200,168,74,0.7)' }}
        >
          {t('torneio.general.badge')}
        </p>
        <p
          className="font-nunito font-black leading-tight m-0"
          style={{ fontSize: '1.1rem', color: C.ACCENT }}
        >
          ⚡ {t('torneio.titulo.poder')}
        </p>
      </div>
      <div className="px-4 py-3" style={{ background: C.BG_CARD }}>
        <p
          className="font-nunito font-semibold text-[0.76rem] leading-relaxed m-0"
          style={{ color: C.TEXT_SECONDARY }}
        >
          {t('torneio.poder.intro_pre')}<strong>{t('torneio.poder.intro_bold')}</strong>{t('torneio.poder.intro_pos')}
        </p>
      </div>
    </div>

    {/* ── Como Funciona ──────────────────────────────────────────────────────── */}
    <div
      className="rounded-xl overflow-hidden"
      style={{ border: `1px solid ${C.BORDER_SOFT}`, borderTop: `3px solid ${C.WARNING}` }}
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
          📖 {t('torneio.label.como_pontuar')}
        </p>
      </div>
      <div className="px-4 py-3" style={{ background: C.BG_CARD }}>
        {FONTES_CHAVES.map((item, i) => (
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

export default TorneioPoder;
