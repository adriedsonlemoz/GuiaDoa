/** Converte rótulos como UTC+1, UTC-4 ou "UTC -7" em offset numérico. */
export function parseUtcOffset(fuso) {
  const match = String(fuso || '').match(/UTC\s*([+-]?\d{1,2})/i);
  if (!match) return 0;
  const parsed = Number.parseInt(match[1], 10);
  return Number.isFinite(parsed) ? Math.max(-12, Math.min(14, parsed)) : 0;
}
