import React from 'react';
import TutorialCopyButton from '../shared/TutorialCopyButton.jsx';
import { formatUtcDay, formatUtcTime, phaseDates, phaseEventDay } from './eventUtils.js';

function openTournament(id, setRoute) {
  if (!id || typeof setRoute !== 'function') return;
  try { sessionStorage.setItem('guiadoa_open_tournament', id); } catch {}
  setRoute('torneios');
}

export function buildEventTutorialText(evento, occurrence, { content, locale, t }) {
  const lines=[`⚡ ${content(evento,'nome')}`];
  if (content(evento,'descricao')) lines.push(content(evento,'descricao'));
  lines.push('', t('events.tutorial.how_title'));
  lines.push(`› ${t('events.tutorial.how_1')}`);
  lines.push(`› ${t('events.tutorial.how_2')}`);
  lines.push(`› ${t('events.tutorial.how_3')}`);
  for (const phase of evento.fases || []) {
    const { start, end }=phaseDates(phase, occurrence);
    const day=phaseEventDay(phase, occurrence);
    lines.push('', `${content(phase,'nome')}${day?` · ${t('events.event_day',{day})}`:''}`);
    if (start) lines.push(`${formatUtcDay(start,locale)} · ${formatUtcTime(start,locale)}${end?` → ${formatUtcTime(end,locale)}`:''}`);
    const desc=content(phase,'descricao') || content(phase,'objetivo') || phase.observacao;
    if (desc) lines.push(`› ${desc}`);
  }
  return lines.join('\n');
}

export default function EventTutorial({ evento, occurrence, t, content, locale, setRoute }) {
  return <details className="event-rules event-tutorial" open>
    <summary>{t('events.tutorial.title')}</summary>
    <div className="event-tutorial-body">
      <div className="event-tutorial-copy"><TutorialCopyButton text={buildEventTutorialText(evento, occurrence, { content, locale, t })} /></div>
      <p>{t('events.tutorial.intro')}</p>
      <ol><li>{t('events.tutorial.how_1')}</li><li>{t('events.tutorial.how_2')}</li><li>{t('events.tutorial.how_3')}</li></ol>
      <div className="event-tutorial-phases">{(evento.fases || []).map((phase,index)=>{
        const day=phaseEventDay(phase, occurrence);
        const desc=content(phase,'descricao') || content(phase,'objetivo') || phase.observacao;
        return <div key={phase.codigo || index} className="event-tutorial-phase">
          <div><small>{day ? t('events.event_day',{day}) : t('events.day_unknown')}</small><strong>{content(phase,'nome')}</strong>{desc?<p>{desc}</p>:null}</div>
          {phase.torneioId ? <button type="button" onClick={()=>openTournament(phase.torneioId,setRoute)}>{t('events.open_calculator')} ›</button> : null}
        </div>;
      })}</div>
    </div>
  </details>;
}
