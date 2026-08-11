/**
 * Chaves do localStorage centralizadas.
 * Altere aqui e reflete em todo o app.
 */
export const STORAGE_KEYS = {
  PROFILE:      'doa_profile_data',
  FUSO_OFFSET:  'doa_fuso_offset',
  TERMO_ACEITO: 'doa_termo_aceito',
  LOCALE:       'doa_locale',
  // dados de jogo
  TROPAS_QTD:   'doa_tropas_quantidades',
  PODER_NIVEIS: 'doa_poder_niveis',
  PODER_ANTIGO: 'doa_poder_antigo',
};

export const getProfile  = ()  => JSON.parse(localStorage.getItem(STORAGE_KEYS.PROFILE) || 'null');
export const saveProfile = (p) => {
  localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(p));
  const match  = (p.fuso || '').match(/UTC([+-]?\d+)/);
  const offset = match ? parseInt(match[1], 10) : 0;
  localStorage.setItem(STORAGE_KEYS.FUSO_OFFSET, offset);
};

/** Retorna o ID real do jogador guardado no perfil, ou null */
export const getPlayerId = () => {
  const p = getProfile();
  return p?.playerId || null;
};
export const clearProfile  = ()  => localStorage.removeItem(STORAGE_KEYS.PROFILE);
export const getFusoOffset = ()  => parseInt(localStorage.getItem(STORAGE_KEYS.FUSO_OFFSET) || '0', 10);
export const getTermoAceito= ()  => localStorage.getItem(STORAGE_KEYS.TERMO_ACEITO) === 'true';
export const setTermoAceito= ()  => localStorage.setItem(STORAGE_KEYS.TERMO_ACEITO, 'true');
export const getLocale     = ()  => localStorage.getItem(STORAGE_KEYS.LOCALE) || null;
export const saveLocale    = (l) => localStorage.setItem(STORAGE_KEYS.LOCALE, l);
