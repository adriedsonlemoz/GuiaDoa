import React, { useEffect, useMemo, useState } from 'react';
import { useGameData } from '../../data/GameDataContext.jsx';
import { useI18n } from '../../hooks/useI18n.jsx';
import { occurrenceForRealm, eventStatus, currentPhase, timeRemaining } from './eventUtils.js';

export default function EventHomeHighlight({ realmName, onOpen }) {
  const { eventos = [] } = useGameData();
  const { t, content } = useI18n();
  const [now, setNow] = useState(() => new Date());
  useEffect(() => { const timer=window.setInterval(() => setNow(new Date()), 15000); return () => window.clearInterval(timer); }, []);
  const ativos = useMemo(() => eventos.map(evento => {
    const ocorrencia = occurrenceForRealm(evento, realmName);
    return { evento, ocorrencia, status:eventStatus(ocorrencia, now), fase:currentPhase(evento, ocorrencia, now) };
  }).filter(item => item.status === 'ativo'), [eventos, realmName, now]);

  if (!realmName || ativos.length === 0) return null;

  return (
    <section className="event-home-wrap" aria-label={t('events.active_in_realm')}>
      <div className="event-home-head">
        <div><span>⚡</span><strong>{t('events.active_in_realm')}</strong></div>
        <button type="button" onClick={onOpen}>{t('events.view_all')}</button>
      </div>
      {ativos.map(({ evento, ocorrencia, fase }) => {
        const left = timeRemaining(ocorrencia.fimServidor, now);
        const confirmedActiveRealms = (evento.ocorrencias || [])
          .filter(o => o.confirmado !== false && eventStatus(o, now) === 'ativo')
          .map(o => o.reinoNome)
          .filter(Boolean);
        return (
          <button className="event-home-card" type="button" key={`${evento.slug}-${ocorrencia.codigo}`} onClick={onOpen}>
            <div className="event-home-title">
              <div><small>{realmName}</small><strong>{content(evento, 'nome')}</strong></div>
              <span className="event-status is-active">{fase?.codigo==='observacao'?t('events.observation'):t('events.status.active')}</span>
            </div>
            {fase && <p className="event-home-phase"><small>{fase.codigo==='observacao'?t('events.observation_now'):t('events.current_phase')}</small>{content(fase, 'nome')}</p>}
            <div className="event-home-meta">
              <span>🌍 {t('events.confirmed_in')}: {confirmedActiveRealms.join(', ')}</span>
              <span>🌐 {t('events.reset_global')}: {evento.horarioReset || '00:00'} {evento.servidorFuso || 'UTC'}</span>
              <span>⏳ {left.days ? `${left.days}d ` : ''}{left.hours}h {left.minutes}m</span>
            </div>
          </button>
        );
      })}
    </section>
  );
}
