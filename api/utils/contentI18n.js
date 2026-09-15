export const CONTENT_LOCALES = Object.freeze(['en-US']);

function cleanValue(value) {
  if (typeof value === 'string') return value.trim();
  if (Array.isArray(value)) return value.map(cleanValue).filter(v => v !== '' && v != null);
  if (value && typeof value === 'object') {
    const out = {};
    for (const [key, child] of Object.entries(value)) {
      const clean = cleanValue(child);
      if (clean !== '' && clean != null && (!Array.isArray(clean) || clean.length) && (typeof clean !== 'object' || Array.isArray(clean) || Object.keys(clean).length)) out[key] = clean;
    }
    return out;
  }
  if (typeof value === 'number' || typeof value === 'boolean') return value;
  return undefined;
}

/**
 * Mantém apenas locales suportados e campos autorizados para aquele domínio.
 * O PT-BR continua nos campos principais do documento; i18n guarda idiomas adicionais.
 */
export function sanitizeContentI18n(input, allowedFields = []) {
  if (!input || typeof input !== 'object') return {};
  const out = {};
  for (const locale of CONTENT_LOCALES) {
    const source = input[locale];
    if (!source || typeof source !== 'object') continue;
    const translated = {};
    for (const field of allowedFields) {
      if (!(field in source)) continue;
      const clean = cleanValue(source[field]);
      if (clean !== undefined && clean !== '' && (!Array.isArray(clean) || clean.length)) translated[field] = clean;
    }
    if (Object.keys(translated).length) out[locale] = translated;
  }
  return out;
}

export function mergeContentI18n(current = {}, incoming = {}, allowedFields = []) {
  const clean = sanitizeContentI18n(incoming, allowedFields);
  const next = { ...(current || {}) };
  for (const locale of CONTENT_LOCALES) {
    if (clean[locale]) next[locale] = { ...(next[locale] || {}), ...clean[locale] };
    else if (incoming && Object.prototype.hasOwnProperty.call(incoming, locale) && !Object.keys(incoming[locale] || {}).length) delete next[locale];
  }
  return next;
}
