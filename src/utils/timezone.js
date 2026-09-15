export const SERVER_BASE_TIMEZONE = 'UTC+0';
export const SERVER_DAILY_RESET_UTC = '00:00';

/** Converte rótulos como UTC+1, UTC-4, UTC+5:30 ou "UTC -7" em offset numérico. */
export function parseUtcOffset(fuso) {
  const match = String(fuso || '').trim().match(/^UTC\s*([+-])?\s*(\d{1,2})?(?::([0-5]\d))?$/i);
  if (!match) return 0;
  if (!match[2]) return 0;
  const sign = match[1] === '-' ? -1 : 1;
  const hours = Number(match[2]);
  const minutes = Number(match[3] || 0);
  const parsed = sign * (hours + minutes / 60);
  return Number.isFinite(parsed) ? Math.max(-12, Math.min(14, parsed)) : 0;
}

export function parseClockTime(value) {
  const match = String(value || '').trim().match(/^([01]\d|2[0-3]):([0-5]\d)$/);
  if (!match) return null;
  return { hours:Number(match[1]), minutes:Number(match[2]), totalMinutes:Number(match[1]) * 60 + Number(match[2]) };
}

function normalizeMinutes(totalMinutes) {
  const dayDelta = Math.floor(totalMinutes / 1440);
  const normalized = ((totalMinutes % 1440) + 1440) % 1440;
  const hours = Math.floor(normalized / 60);
  const minutes = normalized % 60;
  return { hours, minutes, dayDelta, totalMinutes:normalized, time:`${String(hours).padStart(2,'0')}:${String(minutes).padStart(2,'0')}` };
}

/**
 * Converte um horário canônico do servidor UTC+0 para o relógio de um realm.
 * Retorna também a mudança de dia para evitar somas de horário que ignoram a data.
 */
export function convertBaseUtcTimeToRealm(baseTime, fuso) {
  const parsed = parseClockTime(baseTime);
  if (!parsed) return null;
  const offsetMinutes = Math.round(parseUtcOffset(fuso) * 60);
  return { ...normalizeMinutes(parsed.totalMinutes + offsetMinutes), offset:parseUtcOffset(fuso), fuso:fuso || SERVER_BASE_TIMEZONE, baseTime };
}

/** Desloca um instante UTC para os componentes do relógio local do realm. */
export function realmDate(value = new Date(), fuso = SERVER_BASE_TIMEZONE) {
  const date = value instanceof Date ? new Date(value.getTime()) : new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return new Date(date.getTime() + Math.round(parseUtcOffset(fuso) * 60) * 60000);
}

export function formatRealmClock(fuso, now = new Date(), locale = 'pt-BR', { seconds = true } = {}) {
  const shifted = realmDate(now, fuso);
  if (!shifted) return { time:'--:--', date:'—' };
  const time = new Intl.DateTimeFormat(locale, {
    hour:'2-digit', minute:'2-digit', ...(seconds ? { second:'2-digit' } : {}), hour12:false, hourCycle:'h23', timeZone:'UTC',
  }).format(shifted);
  const date = new Intl.DateTimeFormat(locale, {
    weekday:'short', day:'2-digit', month:'short', timeZone:'UTC',
  }).format(shifted);
  return { time, date };
}

export function formatRealmDateTime(value, fuso, locale = 'pt-BR', { withZone = true } = {}) {
  const shifted = realmDate(value, fuso);
  if (!shifted) return '—';
  const formatted = new Intl.DateTimeFormat(locale, {
    day:'2-digit', month:'2-digit', year:'numeric', hour:'2-digit', minute:'2-digit', hour12:false, hourCycle:'h23', timeZone:'UTC',
  }).format(shifted);
  return withZone ? `${formatted} ${fuso || SERVER_BASE_TIMEZONE}` : formatted;
}

/** Próxima ocorrência diária de um horário definido em UTC+0. */
export function nextDailyBaseUtcOccurrence(baseTime = SERVER_DAILY_RESET_UTC, now = new Date()) {
  const parsed = parseClockTime(baseTime);
  const current = now instanceof Date ? new Date(now.getTime()) : new Date(now);
  if (!parsed || Number.isNaN(current.getTime())) return null;
  const next = new Date(Date.UTC(current.getUTCFullYear(), current.getUTCMonth(), current.getUTCDate(), parsed.hours, parsed.minutes, 0, 0));
  if (next.getTime() <= current.getTime()) next.setUTCDate(next.getUTCDate() + 1);
  return next;
}

export function countdownTo(value, now = new Date()) {
  const target = value instanceof Date ? value : new Date(value);
  const current = now instanceof Date ? now : new Date(now);
  if (Number.isNaN(target.getTime()) || Number.isNaN(current.getTime())) return null;
  const totalSeconds = Math.max(0, Math.floor((target.getTime() - current.getTime()) / 1000));
  return {
    totalSeconds,
    hours:Math.floor(totalSeconds / 3600),
    minutes:Math.floor((totalSeconds % 3600) / 60),
    seconds:totalSeconds % 60,
  };
}
