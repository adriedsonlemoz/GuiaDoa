import React from 'react';
import { C } from '../../theme.js';
import { useI18n } from '../../hooks/useI18n.jsx';

// ── Dados dos torneios de aliança ─────────────────────────────────────────────
const TORNEIOS_CHAVES = [
  {
    id: 'poder',
    icon: '⚡',
    tituloChave: 'torneio.titulo.poder',
    color: C.WARNING,
    descChave: 'torneio.alianca.poder.desc',
    itens: [
      { icon: '⚔️', textoChave: 'torneio.alianca.poder.item1' },
      { icon: '🐉', textoChave: 'torneio.alianca.poder.item2' },
      { icon: '📚', textoChave: 'torneio.alianca.poder.item3' },
      { icon: '🎖️', textoChave: 'torneio.alianca.poder.item4' },
      { icon: '💡', textoChave: 'torneio.alianca.poder.item5' },
    ],
  },
  {
    id: 'alianca_atual',
    icon: '🤝',
    tituloChave: 'torneio.alianca.atual.titulo',
    color: C.SUCCESS,
    descChave: 'torneio.alianca.atual.desc',
    itens: [
      { icon: '🍖', textoChave: 'torneio.alianca.atual.item1' },
      { icon: '🏰', textoChave: 'torneio.alianca.atual.item2' },
      { icon: '🤜', textoChave: 'torneio.alianca.atual.item3' },
      { icon: '💡', textoChave: 'torneio.alianca.atual.item4' },
    ],
  },
];

// ── Componente ────────────────────────────────────────────────────────────────
const TorneioAlianca = () => {
  const { t } = useI18n();
  return (
  <div className="max-w-md mx-auto pb-4" style={{ animation: 'reveal-up 0.4s ease both' }}>

    {/* ── Cabeçalho informativo ──────────────────────────────────────────────── */}
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
          {t('torneio.alianca.badge')}
        </p>
        <p
          className="font-nunito font-black leading-tight m-0"
          style={{ fontSize: '1.1rem', color: C.ACCENT }}
        >
          {t('torneio.alianca.como_funcionam')}
        </p>
      </div>
      <div className="px-4 py-3" style={{ background: C.BG_CARD }}>
        <p
          className="font-nunito font-semibold text-[0.76rem] leading-relaxed m-0"
          style={{ color: C.TEXT_SECONDARY }}
        >
          {t('torneio.alianca.intro_pre')}<strong>{t('torneio.alianca.intro_bold')}</strong>{t('torneio.alianca.intro_pos')}
        </p>
      </div>
    </div>

    {/* ── Cards por torneio ─────────────────────────────────────────────────── */}
    {TORNEIOS_CHAVES.map(card => (
      <div
        key={card.id}
        className="rounded-xl overflow-hidden mb-3"
        style={{ border: `1px solid ${C.BORDER_SOFT}`, borderTop: `3px solid ${card.color}` }}
      >
        {/* Cabeçalho do card */}
        <div
          className="px-4 py-2.5 flex items-center gap-2"
          style={{
            background: `linear-gradient(180deg, ${C.BG_CARD_TOP}, ${C.BG_CARD})`,
            borderBottom: `1.5px solid ${C.BORDER_SOFT}`,
          }}
        >
          <span className="text-lg leading-none">{card.icon}</span>
          <p
            className="font-nunito font-black text-[0.82rem] uppercase tracking-widest m-0"
            style={{ color: card.color }}
          >
            {t(card.tituloChave)}
          </p>
        </div>

        {/* Corpo */}
        <div className="px-4 py-3" style={{ background: C.BG_CARD }}>
          {/* Descrição resumida */}
          <p
            className="font-nunito font-semibold text-[0.74rem] leading-relaxed mb-3"
            style={{ color: C.TEXT_SECONDARY }}
          >
            {t(card.descChave)}
          </p>

          {/* Lista de dicas */}
          {card.itens.map((item, i) => (
            <div key={i} className="flex gap-2.5 items-start mb-2.5 last:mb-0">
              <span className="text-base leading-none shrink-0 mt-0.5">{item.icon}</span>
              <p
                className="font-nunito font-semibold text-[0.76rem] leading-relaxed m-0"
                style={{ color: C.TEXT_SECONDARY }}
              >
                {t(item.textoChave)}
              </p>
            </div>
          ))}
        </div>
      </div>
    ))}
  </div>
  );
};

export default TorneioAlianca;
