import React from 'react';
import { C } from '../../theme.js';

export default function TournamentTurnover({ realm, fuso, countdown, time, urgent, label }) {
  return (
    <div className="tournament-turnover">
      <div className="tournament-turnover-copy">
        <span className="tournament-turnover-label">{label}</span>
        <span className="tournament-turnover-realm">{realm || 'Realm'} • {fuso || 'UTC+0'} • {time}</span>
      </div>
      <strong className="tournament-turnover-time" style={{ color: urgent ? C.ERROR : undefined }}>{countdown}</strong>
    </div>
  );
}
