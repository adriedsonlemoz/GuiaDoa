import React from 'react';
import EventRewards from './EventRewards.jsx';
import { formatUtcDay, formatUtcTime, phaseDates, phaseEventDay, phaseStatus } from './eventUtils.js';

function openTournament(id,setRoute){ if(!id||typeof setRoute!=='function')return; try{sessionStorage.setItem('guiadoa_open_tournament',id);}catch{} setRoute('torneios'); }

function phaseNumber(phase, index) {
  const match = String(phase?.codigo || '').match(/fase-(\d+)/i);
  return match ? Number(match[1]) : index + 1;
}

export default function EventPhaseList({ evento, occurrence, current, t, content, locale, setRoute }) {
  return <div className="event-phase-list">{(evento.fases || []).map((phase, index) => {
    const { start, end } = phaseDates(phase, occurrence);
    const day = phaseEventDay(phase, occurrence);
    const status = phaseStatus(phase, occurrence);
    const isNumbered = /^fase-\d+$/i.test(String(phase.codigo || ''));
    const title = content(phase, 'nome');
    return <details className={`event-phase is-${status}`} key={phase.codigo || index} open={current?.codigo === phase.codigo}>
      <summary>
        <div className="event-phase-summary-main">
          <span className="event-phase-kicker">{isNumbered ? t('events.phase', { number: phaseNumber(phase,index) }) : title}</span>
          {isNumbered && title ? <strong>{title.replace(/^Fase\s*\d+\s*[—–-]?\s*/i,'')}</strong> : null}
          <small>{day ? t('events.event_day', { day }) : t('events.day_unknown')}</small>
          <span className="event-phase-date">{start ? formatUtcDay(start, locale) : t('events.date_pending')}{start ? ` · ${formatUtcTime(start, locale)}` : ''}</span>
        </div>
        <span className={`event-status is-${status}`}>{t(`events.status.${status}`)}</span>
      </summary>
      <div className="event-phase-body">
        {content(phase,'objetivo') ? <p className="event-phase-objective">{content(phase,'objetivo')}</p> : null}
        {content(phase,'descricao') || phase.observacao ? <p className="event-phase-description">{content(phase,'descricao') || phase.observacao}</p> : null}
        {end ? <div className="event-phase-end"><small>{t('events.phase_end')}</small><strong>{formatUtcDay(end,locale)} · {formatUtcTime(end,locale)}</strong></div> : null}
        {phase.torneioId ? <button type="button" className="event-phase-calculator" onClick={()=>openTournament(phase.torneioId,setRoute)}>{t('events.open_calculator')} ›</button> : null}
        <EventRewards groups={phase.recompensas} t={t} content={content} setRoute={setRoute} />
      </div>
    </details>;
  })}</div>;
}
