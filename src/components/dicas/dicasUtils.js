export const fmtData = (iso, locale = 'pt-BR') => {
  try {
    return new Date(iso).toLocaleDateString(locale, { day: '2-digit', month: 'short', year: 'numeric' });
  } catch {
    return '';
  }
};
