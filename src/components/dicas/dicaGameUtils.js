function troopRequirement(troops, troopName, type, name) {
  const troop = (troops || []).find(item => item?.nome === troopName);
  const requirements = troop?.treinamento?.requisitos || [];
  return Number(requirements.find(item => item?.tipo === type && item?.nome === name)?.nivel || 0);
}

export function buildDicaGameVariables(edificios = [], tropas = [], dragoes = [], locale = 'pt-BR') {
  const fonte = edificios.find(e => e.slug === 'FonteDaCura');
  const fonte35 = fonte?.niveis?.find(n => Number(n.nivel) === 35);
  const capacidadeFonte35 = Number(fonte35?.maxTropas || 0);
  const agua = (dragoes || []).find(d => (d.slug || d.id) === 'dragao_agua');
  const beladona = (dragoes || []).find(d => (d.slug || d.id) === 'dragao_beladona');
  const fmt = value => Number(value || 0).toLocaleString(locale);
  const valueOrDash = value => Number(value || 0) || '—';

  return {
    capacidadeFonte35,
    fonte_n35: capacidadeFonte35 ? fmt(capacidadeFonte35) : '—',
    fontes_38: capacidadeFonte35 ? fmt(capacidadeFonte35 * 38) : '—',
    agua_dia: valueOrDash(agua?.obtencao?.dia),
    beladona_min: valueOrDash(beladona?.obtencao?.fonte?.nivelMin),
    beladona_max: valueOrDash(beladona?.obtencao?.fonte?.nivelMax),
    ssd_guarnicao: valueOrDash(troopRequirement(tropas, 'Dragões de Ataque Rápido', 'edificio', 'Guarnição')),
    ssd_viveiro: valueOrDash(troopRequirement(tropas, 'Dragões de Ataque Rápido', 'edificio', 'Viveiro')),
    ssd_formacao: valueOrDash(troopRequirement(tropas, 'Dragões de Ataque Rápido', 'pesquisa', 'Formação Rápida')),
    ssd_dragoria: valueOrDash(troopRequirement(tropas, 'Dragões de Ataque Rápido', 'pesquisa', 'Dragoria')),
    bd_guarnicao: valueOrDash(troopRequirement(tropas, 'Dragões de Combate', 'edificio', 'Guarnição')),
    bd_forja: valueOrDash(troopRequirement(tropas, 'Dragões de Combate', 'edificio', 'Forja')),
    bd_viveiro: valueOrDash(troopRequirement(tropas, 'Dragões de Combate', 'edificio', 'Viveiro')),
    bd_formacao: valueOrDash(troopRequirement(tropas, 'Dragões de Combate', 'pesquisa', 'Formação Rápida')),
    bd_dragoria: valueOrDash(troopRequirement(tropas, 'Dragões de Combate', 'pesquisa', 'Dragoria')),
  };
}

export function applyDicaVariables(text, variables = {}) {
  return String(text || '').replace(/\{\{([a-z0-9_]+)\}\}/gi, (_, key) => (
    Object.prototype.hasOwnProperty.call(variables, key) ? String(variables[key]) : `{{${key}}}`
  ));
}
