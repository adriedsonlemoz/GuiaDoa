/**
 * Compatibilidade da Beta 2.8.
 * Os dados oficiais do jogo são carregados exclusivamente pelo serviço online.
 */
export const SYNC_KEYS = Object.freeze({
  ITENS: 'doa_cache_itens_v2',
  EDIFICIOS: 'doa_cache_edificios_v2',
  PESQUISAS: 'doa_cache_pesquisas_v2',
  SYNC_TS: 'doa_ultima_sync',
  APP_VER: 'doa_sync_app_version',
  SYNC_STATUS: 'doa_sync_status',
  LAST_OK_TS: 'doa_ultima_sync_ok',
});

const LEGACY_DATA_KEYS = [
  SYNC_KEYS.ITENS, SYNC_KEYS.EDIFICIOS, SYNC_KEYS.PESQUISAS,
  'doa_cache_tropas', 'doa_cache_tropas_v2', 'doa_cache_niveis', 'doa_cache_reinos', 'doa_cache_dragoes',
];

export function limparCachesDeDadosLegados() {
  if (typeof localStorage === 'undefined') return;
  for (const key of LEGACY_DATA_KEYS) {
    try { localStorage.removeItem(key); } catch { /* ignore */ }
  }
}

// Mantidos temporariamente apenas para compatibilidade de imports antigos.
export const getCachedItens = () => [];
export const getCachedEdificios = () => [];
export const getCachedPesquisas = () => [];
export const temAlgumCache = () => false;
export const precisaSincronizar = () => true;
export const getSyncInfo = () => ({ ts:null, tentativaTs:null, ver:null, status:null });

export function formatarUltimaSyncPt(isoString) {
  if (!isoString) return 'Nesta sessão';
  try {
    return new Date(isoString).toLocaleString('pt-BR', {
      day:'2-digit', month:'2-digit', year:'numeric', hour:'2-digit', minute:'2-digit',
    });
  } catch { return 'Agora'; }
}
