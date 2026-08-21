export function occurrenceForRealm(evento, realmName) {
  const alvo = String(realmName || '').trim().toLowerCase();
  if (!alvo) return null;
  return (evento?.ocorrencias || []).find(o => String(o.reinoNome || '').trim().toLowerCase() === alvo && o.confirmado !== false) || null;
}

export function eventStatus(occurrence, now = new Date()) {
  if (!occurrence || occurrence.confirmado === false) return 'nao_confirmado';
  if (occurrence.status) return occurrence.status;
  const t = now.getTime();
  const start = new Date(occurrence.inicioServidor).getTime();
  const end = new Date(occurrence.fimServidor).getTime();
  if (!Number.isFinite(start) || !Number.isFinite(end)) return 'nao_confirmado';
  if (t < start) return 'proximo';
  return t >= end ? 'encerrado' : 'ativo';
}

export function currentPhase(evento, occurrence, now = new Date()) {
  if (occurrence?.faseAtual) return occurrence.faseAtual;
  if (eventStatus(occurrence, now) !== 'ativo') return null;
  const day = Math.floor((now.getTime() - new Date(occurrence.inicioServidor).getTime()) / 86400000) + 1;
  return (evento?.fases || []).find(f => day >= Number(f.diaInicio) && day <= Number(f.diaFim)) || null;
}

export function formatUtcDate(value, locale = 'pt-BR') {
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '—';
  return new Intl.DateTimeFormat(locale, { day:'2-digit', month:'2-digit', year:'numeric', hour:'2-digit', minute:'2-digit', timeZone:'UTC', hour12:false }).format(d) + ' UTC';
}

export function timeRemaining(value, now = new Date()) {
  const ms = Math.max(0, new Date(value).getTime() - now.getTime());
  const totalMinutes = Math.floor(ms / 60000);
  const days = Math.floor(totalMinutes / 1440);
  const hours = Math.floor((totalMinutes % 1440) / 60);
  const minutes = totalMinutes % 60;
  return { days, hours, minutes };
}
