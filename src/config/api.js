const runtimeEnv = import.meta.env || {};
const configuredUrl = String(runtimeEnv.VITE_API_URL || '').trim().replace(/\/$/, '');
const isDev = Boolean(runtimeEnv.DEV);
const browserOrigin = typeof window !== 'undefined' ? String(window.location?.origin || '') : '';
const looksNative = typeof window !== 'undefined' && (
  Boolean(window.Capacitor?.isNativePlatform?.()) ||
  window.location?.protocol === 'capacitor:' ||
  /^(https?:\/\/)?localhost(?::\d+)?$/i.test(browserOrigin)
);

// Desenvolvimento local pode usar localhost. Builds de produção/nativos precisam
// receber VITE_API_URL; não apontamos silenciosamente o APK para o próprio celular.
export const API_URL = configuredUrl || (isDev ? 'http://localhost:3001' : (!looksNative && browserOrigin && !/localhost|127\.0\.0\.1/i.test(browserOrigin) ? browserOrigin : ''));
export const API_CONFIGURED = Boolean(API_URL);
export const API_CONFIGURATION_SOURCE = configuredUrl ? 'VITE_API_URL' : (isDev ? 'development-localhost' : (API_URL ? 'same-origin' : 'missing'));
export const apiUrl = path => `${API_URL}${path.startsWith('/') ? path : `/${path}`}`;
