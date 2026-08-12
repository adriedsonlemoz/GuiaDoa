export const unformat = value => Number(String(value ?? '').replace(/\D/g, '')) || 0;

export const formatNumber = number => (
  number === null || number === undefined || number === ''
    ? '—'
    : Number(number).toLocaleString('pt-BR')
);

export const formatSufixo = number => {
  const value = Number(number || 0);
  if (value >= 1_000_000_000) return `${(value / 1_000_000_000).toFixed(1).replace('.0', '')}B`;
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1).replace('.0', '')}M`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(1).replace('.0', '')}K`;
  return String(value);
};

export function calcularProgresso(todosNiveis, currentPowerNum) {
  let nivelExato = 0;
  todosNiveis.forEach(([nivel, xp]) => {
    if (xp !== null && currentPowerNum >= xp) nivelExato = nivel;
  });

  const proximaMeta = todosNiveis.find(([, xp]) => xp !== null && xp > currentPowerNum);
  const faltamParaMeta = proximaMeta ? proximaMeta[1] - currentPowerNum : 0;
  const nivelAtualDados = todosNiveis.find(([nivel]) => nivel === nivelExato);
  const xpAtualNivel = nivelAtualDados?.[1] ?? 0;
  const xpProximo = proximaMeta?.[1] ?? xpAtualNivel;
  const faixaNivel = xpProximo - xpAtualNivel;
  const progressoNivel = faixaNivel > 0 ? ((currentPowerNum - xpAtualNivel) / faixaNivel) * 100 : 0;
  const proximoMarco = todosNiveis.find(([nivel, xp]) => xp !== null && xp > currentPowerNum && nivel % 5 === 0);
  const faltamParaMarco = proximoMarco ? proximoMarco[1] - currentPowerNum : 0;
  const maxNivel = todosNiveis.length > 0 ? todosNiveis[todosNiveis.length - 1][0] : 100;

  return {
    nivelExato,
    proximaMeta,
    faltamParaMeta,
    progressoNivel,
    proximoMarco,
    faltamParaMarco,
    maxNivel,
    atingiuMax: nivelExato >= maxNivel,
  };
}
