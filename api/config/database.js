const DEFAULT_COLLECTION_PREFIX = 'guiadoa_';
export const LEGACY_COLLECTION_PREFIX = 'doa_';

function normalizarPrefixo(valor) {
  const bruto = String(valor || DEFAULT_COLLECTION_PREFIX).trim();
  const seguro = bruto
    .toLowerCase()
    .replace(/[^a-z0-9_-]+/g, '_')
    .replace(/^_+|_+$/g, '');
  return `${seguro || 'guiadoa'}_`;
}

export const COLLECTION_PREFIX = normalizarPrefixo(process.env.MONGO_COLLECTION_PREFIX);

export const collectionName = (sufixo) => `${COLLECTION_PREFIX}${String(sufixo).replace(/^_+/, '')}`;

export const COLLECTIONS = Object.freeze({
  users: collectionName('users'),
  tropas: collectionName('tropas'),
  niveis: collectionName('niveis'),
  itens: collectionName('itens'),
  edificios: collectionName('edificios'),
  dragoes: collectionName('dragoes'),
  pesquisas: collectionName('pesquisas'),
  reinos: collectionName('reinos'),
  dicas: collectionName('dicas'),
  dicasCategorias: collectionName('dicas_categorias'),
  config: collectionName('config'),
  allianceWorkspaces: collectionName('alliance_workspaces'),
  allianceMembers: collectionName('alliance_members'),
  allianceSnapshots: collectionName('alliance_snapshots'),
  allianceOcrCorrections: collectionName('alliance_ocr_corrections'),
  campanhaLocais: collectionName('campanha_locais'),
  eventos: collectionName('eventos'),
  reinoFusoes: collectionName('reino_fusoes'),
});

export const COLLECTION_SUFFIXES = Object.freeze([
  'users',
  'tropas',
  'niveis',
  'itens',
  'edificios',
  'dragoes',
  'pesquisas',
  'reinos',
  'dicas',
  'dicas_categorias',
  'config',
  'alliance_workspaces',
  'alliance_members',
  'alliance_snapshots',
  'alliance_ocr_corrections',
  'campanha_locais',
  'eventos',
  'reino_fusoes',
]);

export function mongoConnectOptions() {
  const dbName = String(process.env.MONGO_DB_NAME || '').trim();
  return dbName ? { dbName } : {};
}

export function databaseConfigPublica(connection = null) {
  return {
    banco: connection?.name || String(process.env.MONGO_DB_NAME || '').trim() || null,
    prefixoColecoes: COLLECTION_PREFIX,
  };
}
