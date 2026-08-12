const runtimeEnv = import.meta.env || {};
const configuredUrl = String(runtimeEnv.VITE_API_URL || '').trim().replace(/\/$/, '');

export const API_URL = configuredUrl || 'http://localhost:3001';
export const apiUrl = path => `${API_URL}${path.startsWith('/') ? path : `/${path}`}`;
