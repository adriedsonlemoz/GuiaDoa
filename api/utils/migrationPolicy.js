// Versão dos dados canônicos, independente da versão visual do aplicativo.
// Só altere quando houver uma migração real de dados/seeds.
export const DATA_MIGRATION_VERSION = '1.0.0-beta.2.12';

export function deveExecutarMigracao(config, versaoDados = DATA_MIGRATION_VERSION, force = false) {
  if (force) return true;
  if (!config) return true;
  return !(config.migracaoEstado === 'pronto' && config.migracaoVersao === versaoDados);
}

export function forceMigrationFromEnv(env = process.env) {
  return String(env.FORCE_DATA_MIGRATION || '').toLowerCase() === 'true';
}
