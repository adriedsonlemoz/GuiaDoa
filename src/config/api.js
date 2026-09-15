const runtimeEnv = import.meta.env || {};

// Endpoint público canônico do GUIA DOA. É seguro ficar no frontend: contém
// apenas o endereço HTTPS da API, nunca credenciais privadas do servidor.
export const CANONICAL_API_URL = 'https://guiadoa-agrq.onrender.com';

const configuredUrl = String(runtimeEnv.VITE_API_URL || '').trim().replace(/\/$/, '');
const isDev = Boolean(runtimeEnv.DEV);
const browserOrigin = typeof window !== 'undefined' ? String(window.location?.origin || '') : '';
const looksNative = typeof window !== 'undefined' && (
  Boolean(window.Capacitor?.isNativePlatform?.()) ||
  window.location?.protocol === 'capacitor:' ||
  /^(https?:\/\/)?localhost(?::\d+)?$/i.test(browserOrigin)
);

// Em desenvolvimento local, localhost continua disponível. Em produção e no
// APK usamos a API canônica do Render mesmo quando o build não recebeu um
// secret VITE_API_URL. VITE_API_URL continua sendo um override explícito.
export const API_URL = configuredUrl || (isDev ? 'http://localhost:3001' : CANONICAL_API_URL);
export const API_CONFIGURED = Boolean(API_URL);
export const API_CONFIGURATION_SOURCE = configuredUrl
  ? 'VITE_API_URL'
  : (isDev ? 'development-localhost' : (looksNative ? 'canonical-native' : 'canonical-production'));
export const apiUrl = path => `${API_URL}${path.startsWith('/') ? path : `/${path}`}`;
