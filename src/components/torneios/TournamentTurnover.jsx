import React from 'react';
import { C } from '../../theme.js';

export default function TournamentTurnover({ realm, fuso, countdown, time, urgent, label, resetLocal, resetDayDelta = 0, previousDayLabel = 'previous day', nextDayLabel = 'next day', nowLabel = 'now', baseLabel = 'Base' }) {
  const dayNote = resetDayDelta < 0 ? ` · ${previousDayLabel}` : resetDayDelta > 0 ? ` · ${nextDayLabel}` : '';
  return (
    <div className="tournament-turnover">
      <div className="tournament-turnover-copy">
        <span className="tournament-turnover-label">{label}</span>
        <span className="tournament-turnover-realm">{realm || 'Realm'} • {fuso || 'UTC+0'} • {nowLabel} {time}</span>
        <span className="tournament-turnover-base">{baseLabel} 00:00 UTC+0 → {resetLocal || '00:00'}{dayNote}</span>
      </div>
      <strong className="tournament-turnover-time" style={{ color: urgent ? C.ERROR : undefined }}>{countdown}</strong>
    </div>
  );
}
