const DAY_MS = 86400000;

function utcDateParts(value) {
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return { year:date.getUTCFullYear(), month:date.getUTCMonth(), day:date.getUTCDate() };
}

function addUtcMonths(date, months) {
  const copy = new Date(date.getTime());
  const originalDay = copy.getUTCDate();
  copy.setUTCDate(1);
  copy.setUTCMonth(copy.getUTCMonth() + months);
  const daysInTarget = new Date(Date.UTC(copy.getUTCFullYear(), copy.getUTCMonth() + 1, 0)).getUTCDate();
  copy.setUTCDate(Math.min(originalDay, daysInTarget));
  return copy;
}

export function realmAgeParts(opening, now = new Date()) {
  if (opening == null || opening === '') return null;
  const start = opening instanceof Date ? new Date(opening.getTime()) : new Date(opening);
  const end = now instanceof Date ? new Date(now.getTime()) : new Date(now);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || end < start) return null;
  const sp = utcDateParts(start); const ep = utcDateParts(end);
  const startDay = new Date(Date.UTC(sp.year, sp.month, sp.day));
  const endDay = new Date(Date.UTC(ep.year, ep.month, ep.day));
  let totalMonths = (ep.year - sp.year) * 12 + (ep.month - sp.month);
  let anchor = addUtcMonths(startDay, totalMonths);
  if (anchor > endDay) { totalMonths -= 1; anchor = addUtcMonths(startDay, totalMonths); }
  const days = Math.max(0, Math.floor((endDay - anchor) / DAY_MS));
  const years = Math.floor(Math.max(0, totalMonths) / 12);
  const months = Math.max(0, totalMonths) % 12;
  const totalDays = Math.max(0, Math.floor((endDay - startDay) / DAY_MS));
  return { years, months, days, totalDays };
}

export function formatRealmAge(opening, locale = 'pt-BR', now = new Date()) {
  const age = realmAgeParts(opening, now);
  if (!age) return null;
  const pt = String(locale).toLowerCase().startsWith('pt');
  const unit = (n, one, many) => `${n} ${n === 1 ? one : many}`;
  if (age.years > 0) {
    const first = unit(age.years, pt ? 'ano' : 'year', pt ? 'anos' : 'years');
    if (!age.months) return first;
    return `${first}${pt ? ' e ' : ', '}${unit(age.months, pt ? 'mês' : 'month', pt ? 'meses' : 'months')}`;
  }
  if (age.months > 0) {
    const first = unit(age.months, pt ? 'mês' : 'month', pt ? 'meses' : 'months');
    if (!age.days) return first;
    return `${first}${pt ? ' e ' : ', '}${unit(age.days, pt ? 'dia' : 'day', pt ? 'dias' : 'days')}`;
  }
  return unit(age.totalDays, pt ? 'dia' : 'day', pt ? 'dias' : 'days');
}
