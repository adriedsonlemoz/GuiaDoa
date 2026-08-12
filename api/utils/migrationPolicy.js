export function deveExecutarMigracao(config, versaoAtual, force = false) {
  if (force) return true;
  if (!config) return true;
  return !(config.migracaoEstado === 'pronto' && config.migracaoVersao === versaoAtual);
}

export function forceMigrationFromEnv(env = process.env) {
  return String(env.FORCE_DATA_MIGRATION || '').toLowerCase() === 'true';
}
