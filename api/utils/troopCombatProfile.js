const TIPOS_OFICIAIS = new Set(['', 'supply', 'mounted', 'foot', 'ranged']);
const FUNCOES_TATICAS = new Set(['melee', 'ranged', 'speed', 'tank', 'supply']);
const CONFIANCAS = new Set(['', 'confirmado', 'experimental', 'hipotese']);
const CAMPOS_CONFIANCA = ['tipoOficial','funcoesTaticas','tier','atributos','counters','habilidades','funcaoRecomendada','observacoesEstrategicas','prioridadeAlvo'];

function uniqueStrings(value) {
  if (!Array.isArray(value)) return [];
  return [...new Set(value.map(x => String(x || '').trim()).filter(Boolean))].slice(0, 100);
}

function optionalTier(value) {
  if (value === '' || value == null) return null;
  const number = Number(value);
  if (!Number.isFinite(number)) return null;
  return Math.min(99, Math.max(1, Math.trunc(number)));
}

function normalizeConfidence(value) {
  return CONFIANCAS.has(value) ? value : '';
}

export function normalizeCombatProfile(input = {}) {
  const confidenceInput = input.confiancaCampos && typeof input.confiancaCampos === 'object' ? input.confiancaCampos : {};
  const confiancaCampos = {};
  for (const field of CAMPOS_CONFIANCA) confiancaCampos[field] = normalizeConfidence(confidenceInput[field]);

  return {
    tipoOficial: TIPOS_OFICIAIS.has(input.tipoOficial) ? input.tipoOficial : '',
    funcoesTaticas: Array.isArray(input.funcoesTaticas)
      ? [...new Set(input.funcoesTaticas.filter(x => FUNCOES_TATICAS.has(x)))]
      : [],
    tier: optionalTier(input.tier),
    forteContra: uniqueStrings(input.forteContra),
    fracoContra: uniqueStrings(input.fracoContra),
    habilidadesEspeciais: uniqueStrings(input.habilidadesEspeciais),
    funcaoRecomendada: String(input.funcaoRecomendada || '').trim(),
    observacoesEstrategicas: String(input.observacoesEstrategicas || '').trim(),
    prioridadeAlvo: String(input.prioridadeAlvo || '').trim(),
    fonteInformacao: String(input.fonteInformacao || '').trim(),
    confianca: normalizeConfidence(input.confianca),
    confiancaCampos,
  };
}
