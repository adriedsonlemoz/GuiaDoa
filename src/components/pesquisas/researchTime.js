export function parseResearchTime(value) {
  const str = String(value || '').trim();
  if (!str) return 0;
  let seconds = 0;
  const d = str.match(/(\d+)\s*d/i);
  const h = str.match(/(\d+)\s*h/i);
  const m = str.match(/(\d+)\s*m/i);
  const s = str.match(/(\d+)\s*s/i);
  if (d) seconds += Number(d[1]) * 86400;
  if (h) seconds += Number(h[1]) * 3600;
  if (m) seconds += Number(m[1]) * 60;
  if (s) seconds += Number(s[1]);
  return seconds;
}

export function formatResearchTime(totalSeconds) {
  let rest = Math.max(0, Math.floor(Number(totalSeconds) || 0));
  if (!rest) return '';
  const d = Math.floor(rest / 86400); rest %= 86400;
  const h = Math.floor(rest / 3600); rest %= 3600;
  const m = Math.floor(rest / 60); rest %= 60;
  const parts = [];
  if (d) parts.push(`${d}d`);
  if (h) parts.push(`${h}h`);
  if (m) parts.push(`${m}m`);
  if (rest) parts.push(`${rest}s`);
  return parts.join(' ');
}

export function summarizeResearchRange(niveis = [], current = 0, target = 0) {
  const selected = niveis.filter(nv => Number(nv.nivel) > current && Number(nv.nivel) <= target);
  let known = 0;
  let seconds = 0;
  selected.forEach(nv => {
    const value = String(nv.tempo || '').trim();
    if (!value) return;
    known += 1;
    seconds += parseResearchTime(value);
  });
  return {
    total: selected.length,
    known,
    missing: selected.length - known,
    seconds,
    formatted: formatResearchTime(seconds),
  };
}
