export const unformat = value => Number(String(value ?? '').replace(/\D/g, '')) || 0;

export const formatNumber = (number, locale = 'pt-BR') => (
  number === null || number === undefined || number === ''
    ? '—'
    : Number(number).toLocaleString(locale)
);

export const formatSufixo = (number, locale = 'pt-BR') => {
  const value = Number(number || 0);
  const fmt = (n) => Number(n).toLocaleString(locale, { maximumFractionDigits: 1 });
  if (value >= 1_000_000_000) return `${fmt(value / 1_000_000_000)}B`;
  if (value >= 1_000_000) return `${fmt(value / 1_000_000)}M`;
  if (value >= 1_000) return `${fmt(value / 1_000)}K`;
  return String(value);
};

export function calcularProgresso(todosNiveis, currentPowerNum) {
  const ordenados = [...todosNiveis].sort((a, b) => a[0] - b[0]);
  const conhecidos = ordenados.filter(([, poder]) => poder !== null && poder !== undefined);
  let nivelExato = 0;
  conhecidos.forEach(([nivel, poder]) => {
    if (currentPowerNum >= poder) nivelExato = nivel;
  });

  const proximaMeta = conhecidos.find(([, poder]) => poder > currentPowerNum) || null;
  const faltamParaMeta = proximaMeta ? Math.max(0, proximaMeta[1] - currentPowerNum) : 0;
  const poderNivelConfirmado = conhecidos.find(([nivel]) => nivel === nivelExato)?.[1] ?? 0;
  const faixaConhecida = proximaMeta ? proximaMeta[1] - poderNivelConfirmado : 0;
  const progressoNivel = faixaConhecida > 0
    ? Math.max(0, Math.min(100, ((currentPowerNum - poderNivelConfirmado) / faixaConhecida) * 100))
    : 0;

  const possiveis = proximaMeta
    ? ordenados.filter(([nivel, poder]) => poder == null && nivel > nivelExato && nivel < proximaMeta[0]).map(([nivel]) => nivel)
    : ordenados.filter(([nivel, poder]) => poder == null && nivel > nivelExato).map(([nivel]) => nivel);
  const nivelPossivelMax = possiveis.length ? Math.max(...possiveis) : nivelExato;
  const temLacuna = possiveis.length > 0;

  // Compatibilidade com componentes/testes antigos: marco conhecido de 5 em 5.
  const proximoMarco = conhecidos.find(([nivel, poder]) => poder > currentPowerNum && nivel % 5 === 0) || null;
  const faltamParaMarco = proximoMarco ? proximoMarco[1] - currentPowerNum : 0;
  const maxNivel = ordenados.length ? ordenados[ordenados.length - 1][0] : 0;
  const ultimoConhecido = conhecidos.length ? conhecidos[conhecidos.length - 1] : null;
  const atingiuMax = Boolean(ultimoConhecido && ultimoConhecido[0] === maxNivel && currentPowerNum >= ultimoConhecido[1]);

  return {
    nivelExato,
    nivelConfirmado: nivelExato,
    nivelPossivelMax,
    possiveis,
    temLacuna,
    proximaMeta,
    faltamParaMeta,
    progressoNivel,
    proximoMarco,
    faltamParaMarco,
    maxNivel,
    ultimoConhecido,
    atingiuMax,
  };
}

export function calcularMetaNivel(todosNiveis, nivelMeta, poderAtual = 0) {
  const row = todosNiveis.find(([nivel]) => Number(nivel) === Number(nivelMeta));
  const poder = row?.[1] ?? null;
  return {
    nivel: Number(nivelMeta) || 0,
    poder,
    faltam: poder == null ? null : Math.max(0, poder - Number(poderAtual || 0)),
    atingida: poder != null && Number(poderAtual || 0) >= poder,
  };
}
