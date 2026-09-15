/**
 * Compatibilidade dos caches legados.
 * A API online continua sendo a fonte oficial; desde a Beta 2.73 o último
 * snapshot recebido é mantido separadamente em IndexedDB para abertura rápida
 * e uso durante cold start/offline. As chaves abaixo existem apenas para
 * limpar formatos antigos que não devem mais ser consumidos.
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

export function formatarUltimaSync(isoString, locale = 'pt-BR') {
  if (!isoString) return locale === 'en-US' ? 'This session' : 'Nesta sessão';
  try {
    return new Date(isoString).toLocaleString(locale, {
      day:'2-digit', month:'2-digit', year:'numeric', hour:'2-digit', minute:'2-digit',
    });
  } catch { return locale === 'en-US' ? 'Now' : 'Agora'; }
}

export const formatarUltimaSyncPt = (isoString) => formatarUltimaSync(isoString, 'pt-BR');
