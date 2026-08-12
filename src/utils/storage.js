import { parseUtcOffset } from './timezone.js';

/**
 * Chaves do localStorage centralizadas.
 * Altere aqui e reflete em todo o app.
 */
export const STORAGE_KEYS = {
  PROFILE:      'doa_profile_data',
  FUSO_OFFSET:  'doa_fuso_offset',
  TERMO_ACEITO: 'doa_termo_aceito',
  LOCALE:       'doa_locale',
  // dados pessoais do dispositivo
  TROPAS_QTD:   'doa_tropas_quantidades',
  PODER_NIVEIS: 'doa_poder_niveis',
  PODER_ANTIGO: 'doa_poder_antigo',
};

export const getProfile = () => {
  const raw = JSON.parse(localStorage.getItem(STORAGE_KEYS.PROFILE) || 'null');
  if (!raw || typeof raw !== 'object') return raw;

  // Beta 2.12: o ID do jogador deixou de fazer parte do perfil.
  // Remove silenciosamente o campo legado sem apagar nome/reino/fuso.
  if (Object.prototype.hasOwnProperty.call(raw, 'playerId')) {
    const { playerId: _legacyPlayerId, ...clean } = raw;
    localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(clean));
    return clean;
  }
  return raw;
};

export const saveProfile = (profile) => {
  const { playerId: _legacyPlayerId, ...p } = profile || {};
  localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(p));
  localStorage.setItem(STORAGE_KEYS.FUSO_OFFSET, parseUtcOffset(p.fuso));
};

export const clearProfile  = ()  => localStorage.removeItem(STORAGE_KEYS.PROFILE);
export const getFusoOffset = ()  => parseInt(localStorage.getItem(STORAGE_KEYS.FUSO_OFFSET) || '0', 10);
export const getTermoAceito= ()  => localStorage.getItem(STORAGE_KEYS.TERMO_ACEITO) === 'true';
export const setTermoAceito= ()  => localStorage.setItem(STORAGE_KEYS.TERMO_ACEITO, 'true');
export const getLocale     = ()  => localStorage.getItem(STORAGE_KEYS.LOCALE) || null;
export const saveLocale    = (l) => localStorage.setItem(STORAGE_KEYS.LOCALE, l);
