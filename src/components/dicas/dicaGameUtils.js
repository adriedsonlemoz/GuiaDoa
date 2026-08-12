export function buildDicaGameVariables(edificios = [], locale = 'pt-BR') {
  const fonte = edificios.find(e => e.slug === 'FonteDaCura');
  const fonte35 = fonte?.niveis?.find(n => Number(n.nivel) === 35);
  const capacidadeFonte35 = Number(fonte35?.maxTropas || 0);
  const fmt = value => Number(value || 0).toLocaleString(locale);
  return {
    capacidadeFonte35,
    fonte_n35: capacidadeFonte35 ? fmt(capacidadeFonte35) : '—',
    fontes_38: capacidadeFonte35 ? fmt(capacidadeFonte35 * 38) : '—',
  };
}

export function applyDicaVariables(text, variables = {}) {
  return String(text || '').replace(/\{\{([a-z0-9_]+)\}\}/gi, (_, key) => (
    Object.prototype.hasOwnProperty.call(variables, key) ? String(variables[key]) : `{{${key}}}`
  ));
}
