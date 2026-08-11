import React from 'react';
import GameHeader from './GameHeader.jsx';
import { useI18n } from '../../hooks/useI18n.jsx';
import { C } from '../../theme.js';

const CARD_STYLES = `
  @keyframes gold-flicker-card {
    0%,90%,100% { opacity: 1; }
    93%,97%     { opacity: 0.82; }
  }
  @keyframes urgent-pulse-card {
    0%,100% { color: ${C.ERROR}; text-shadow: 0 0 20px rgba(220,60,30,0.7); }
    50%     { color: #ff7050;    text-shadow: 0 0 40px rgba(255,80,40,0.9); }
  }
`;

const TorneioStatusCard = ({ horaLocal, countdown, isUrgente, faseTexto, fuso, reino, compact = false }) => {
  const { t } = useI18n();
  return (
  <div className="tw-card mb-3">
    <style>{CARD_STYLES}</style>
    <GameHeader title={t('torneio.status.titulo')} />

    {/* Corpo */}
    <div className="bg-aoe-card px-4 py-3 text-center relative"
      style={{ paddingTop: compact ? 10 : 16, paddingBottom: compact ? 10 : 14 }}>

      {/* Radial vinheta */}
      <div className="absolute inset-0 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse 70% 60% at 50% 50%, transparent 40%, rgba(62,47,28,0.08) 100%)' }} />

      {/* Countdown */}
      <div
        className="font-nunito font-black leading-none mb-1"
        style={{
          fontSize: compact ? 'clamp(2rem,12vw,3rem)' : 'clamp(2.8rem,15vw,4.2rem)',
          letterSpacing: '0.05em',
          color: isUrgente ? C.ERROR : C.TEXT_PRIMARY,
          textShadow: isUrgente
            ? '0 0 24px rgba(168,60,44,0.5), 0 2px 4px rgba(62,47,28,0.3)'
            : '0 0 24px rgba(184,150,90,0.4), 0 2px 4px rgba(62,47,28,0.2)',
          animation: isUrgente
            ? 'urgent-pulse-card 0.9s ease-in-out infinite'
            : 'gold-flicker-card 8s ease-in-out infinite',
        }}
      >
        {countdown}
      </div>

      {/* Sublinha dourada */}
      <div className="px-8 mb-2">
        <div className="gold-stripe opacity-40" />
      </div>

      {/* Fase + fuso + hora */}
      <div
        className="inline-flex items-center gap-1.5 px-3 py-1 rounded max-w-full overflow-hidden"
        style={{ border: '1px solid #D8C888', background: 'rgba(200,169,107,0.15)' }}
      >
        <span className="font-nunito font-semibold text-xs overflow-hidden text-ellipsis whitespace-nowrap"
          style={{ color: isUrgente ? C.ERROR : C.TEXT_MUTED }}>
          {faseTexto.split('—')[1]?.trim() ?? faseTexto}
        </span>
        <span className="text-aoe-gold shrink-0 text-xs">·</span>
        <span className="font-nunito font-bold text-[0.65rem] tracking-wider text-aoe-muted whitespace-nowrap shrink-0">
          {fuso || reino || t('torneio.status.utc')}
        </span>
        <span className="text-aoe-gold shrink-0 text-xs">·</span>
        <span className="font-nunito text-[0.7rem] text-aoe-muted whitespace-nowrap tracking-widest shrink-0">
          {horaLocal?.split(' às ')[1] ?? horaLocal}
        </span>
      </div>
    </div>

    <div className="gold-stripe opacity-25" />
  </div>
  );
};

export default TorneioStatusCard;
