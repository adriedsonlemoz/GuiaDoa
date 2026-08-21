import { formatRealmDateTime, realmDate, SERVER_BASE_TIMEZONE } from '../../utils/timezone.js';

const DAY_MS = 86400000;

export function occurrenceForRealm(evento, realmName) {
  const alvo = String(realmName || '').trim().toLowerCase();
  if (!alvo) return null;
  return (evento?.ocorrencias || []).find(o => String(o.reinoNome || '').trim().toLowerCase() === alvo && o.confirmado !== false) || null;
}

export function eventStatus(occurrence, now = new Date()) {
  if (!occurrence || occurrence.confirmado === false) return 'nao_confirmado';
  const t = now instanceof Date ? now.getTime() : new Date(now).getTime();
  const start = new Date(occurrence.inicioServidor).getTime();
  const end = new Date(occurrence.fimServidor).getTime();
  // Recalcula sempre: o status recebido da API pode envelhecer enquanto o app permanece aberto.
  if (!Number.isFinite(start) || !Number.isFinite(end)) return occurrence.status || 'nao_confirmado';
  if (t < start) return 'proximo';
  return t >= end ? 'encerrado' : 'ativo';
}

export function phaseDates(phase, occurrence) {
  const occurrenceStart = new Date(occurrence?.inicioServidor).getTime();
  let start = phase?.inicioServidor ? new Date(phase.inicioServidor) : null;
  let end = phase?.fimServidor ? new Date(phase.fimServidor) : null;
  if ((!start || Number.isNaN(start.getTime())) && Number.isFinite(occurrenceStart) && phase?.diaInicio) {
    start = new Date(occurrenceStart + (Number(phase.diaInicio) - 1) * DAY_MS);
  }
  if ((!end || Number.isNaN(end.getTime())) && Number.isFinite(occurrenceStart) && phase?.diaFim) {
    end = new Date(occurrenceStart + Number(phase.diaFim) * DAY_MS);
  }
  return { start, end };
}

export function phaseStatus(phase, occurrence, now = new Date()) {
  const { start, end } = phaseDates(phase, occurrence);
  if (!start || !end || Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return 'nao_confirmado';
  const t = now instanceof Date ? now.getTime() : new Date(now).getTime();
  if (t < start.getTime()) return 'proximo';
  return t >= end.getTime() ? 'encerrado' : 'ativo';
}

export function currentPhase(evento, occurrence, now = new Date()) {
  if (eventStatus(occurrence, now) !== 'ativo') return null;
  return (evento?.fases || []).find(phase => phaseStatus(phase, occurrence, now) === 'ativo') || null;
}

export function phaseEventDay(phase, occurrence) {
  const { start } = phaseDates(phase, occurrence);
  const eventStart = new Date(occurrence?.inicioServidor).getTime();
  if (!start || !Number.isFinite(eventStart)) return Number(phase?.diaInicio || 0) || null;
  return Math.floor((start.getTime() - eventStart) / DAY_MS) + 1;
}

export function formatUtcDate(value, locale = 'pt-BR', fuso = SERVER_BASE_TIMEZONE) {
  return formatRealmDateTime(value, fuso || SERVER_BASE_TIMEZONE, locale, { withZone:true });
}

export function formatUtcDay(value, locale = 'pt-BR', fuso = SERVER_BASE_TIMEZONE) {
  const d = realmDate(value, fuso || SERVER_BASE_TIMEZONE);
  if (!d) return '—';
  return new Intl.DateTimeFormat(locale, { day:'numeric', month:'long', year:'numeric', weekday:'long', timeZone:'UTC' }).format(d);
}

export function formatUtcTime(value, locale = 'pt-BR', fuso = SERVER_BASE_TIMEZONE) {
  const d = realmDate(value, fuso || SERVER_BASE_TIMEZONE);
  if (!d) return '—';
  return new Intl.DateTimeFormat(locale, { hour:'2-digit', minute:'2-digit', timeZone:'UTC', hour12:false, hourCycle:'h23' }).format(d) + ` ${fuso || SERVER_BASE_TIMEZONE}`;
}

export function timeRemaining(value, now = new Date()) {
  const ms = Math.max(0, new Date(value).getTime() - (now instanceof Date ? now.getTime() : new Date(now).getTime()));
  const totalMinutes = Math.floor(ms / 60000);
  const days = Math.floor(totalMinutes / 1440);
  const hours = Math.floor((totalMinutes % 1440) / 60);
  const minutes = totalMinutes % 60;
  return { days, hours, minutes };
}

export function ruleText(rule) {
  return typeof rule === 'string' ? rule : String(rule?.texto || '');
}

export function rankingLabel(group) {
  const start = Number(group?.posicaoInicio || 0);
  const end = Number(group?.posicaoFim || 0);
  if (start) return start === (end || start) ? `${start}º` : `${start}º–${end}º`;
  return String(group?.classificacao || '');
}

export function buildEventShareText(evento, occurrence, {
  content = (record, field) => record?.[field],
  locale = 'pt-BR',
  t = (key, vars = {}) => {
    if (key === 'events.confirmed_in') return locale === 'en-US' ? 'Confirmed in' : 'Confirmado em';
    if (key === 'events.reset_global') return locale === 'en-US' ? 'Global reset' : 'Reset global';
    if (key === 'events.rules') return locale === 'en-US' ? 'Event rules' : 'Regras do evento';
    if (key === 'events.event_day') return locale === 'en-US' ? `Day ${vars.day} of the event` : `Dia ${vars.day} do evento`;
    return key;
  },
} = {}) {
  const name = content(evento, 'nome') || evento?.nome || '';
  const lines = [`⚡ ${name}`];
  const confirmedRealms=(evento?.ocorrencias || []).filter(o => o.confirmado !== false).map(o => o.reinoNome).filter(Boolean);
  if (confirmedRealms.length) lines.push(`🌍 ${t('events.confirmed_in')}: ${confirmedRealms.join(', ')}`);
  else if (occurrence?.reinoNome) lines.push(`🌍 ${t('events.confirmed_in')}: ${occurrence.reinoNome}`);
  if (occurrence?.inicioServidor && occurrence?.fimServidor) lines.push(`🗓️ ${formatUtcDate(occurrence.inicioServidor, locale, occurrence.fusoReino)} → ${formatUtcDate(occurrence.fimServidor, locale, occurrence.fusoReino)}`);
  if (evento?.horarioReset) lines.push(`🌐 ${t('events.reset_global')}: ${evento.horarioReset} ${evento.servidorFuso || 'UTC'}`);
  const phases = evento?.fases || [];
  if (phases.length) {
    lines.push('');
    phases.forEach((phase, index) => {
      const { start } = phaseDates(phase, occurrence);
      const day = phaseEventDay(phase, occurrence);
      const title = content(phase, 'nome') || phase.nome || `${index + 1}`;
      lines.push(`${title}${day ? ` · ${t('events.event_day', { day })}` : ''}${start ? ` · ${formatUtcDay(start, locale, occurrence?.fusoReino)}` : ''}`);
      const objective = content(phase, 'objetivo') || phase.objetivo || '';
      if (objective) lines.push(`› ${objective}`);
    });
  }
  const rules = (evento?.regras || []).map(rule => typeof rule === 'string' ? rule : (content(rule, 'texto') || ruleText(rule))).filter(Boolean);
  if (rules.length) {
    lines.push('', `${t('events.rules')}:`);
    rules.forEach(rule => lines.push(`› ${rule}`));
  }
  return lines.join('\n');
}
