const DB_NAME = 'guiadoa-runtime-cache';
const DB_VERSION = 1;
const STORE_NAME = 'snapshots';
const GAME_DATA_KEY = 'game-data-v1';
const META_KEY = 'doa_game_cache_meta_v1';

export const GAME_DATA_CACHE_SCHEMA = 1;
export const GAME_DATA_CACHE_FRESH_MS = 12 * 60 * 60 * 1000;

const DATA_KEYS = ['tropas', 'niveis', 'dragoes', 'edificios', 'reinos', 'pesquisas', 'itens', 'eventos'];

function normalizeData(data = {}) {
  return Object.fromEntries(DATA_KEYS.map(key => [key, Array.isArray(data?.[key]) ? data[key] : []]));
}

export function hasUsableGameData(data) {
  if (!data || typeof data !== 'object') return false;
  return DATA_KEYS.some(key => Array.isArray(data[key]) && data[key].length > 0);
}

export function cacheAgeMs(snapshot, now = Date.now()) {
  const ts = Date.parse(snapshot?.updatedAt || '');
  return Number.isFinite(ts) ? Math.max(0, now - ts) : Number.POSITIVE_INFINITY;
}

export function isGameDataCacheFresh(snapshot, now = Date.now()) {
  return cacheAgeMs(snapshot, now) <= GAME_DATA_CACHE_FRESH_MS;
}

function openDb() {
  if (typeof indexedDB === 'undefined') return Promise.resolve(null);
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) db.createObjectStore(STORE_NAME);
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error || new Error('Falha ao abrir cache local'));
  });
}

async function readIndexedDb() {
  const db = await openDb();
  if (!db) return null;
  try {
    return await new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const request = tx.objectStore(STORE_NAME).get(GAME_DATA_KEY);
      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => reject(request.error || new Error('Falha ao ler cache local'));
    });
  } finally {
    db.close();
  }
}

async function writeIndexedDb(snapshot) {
  const db = await openDb();
  if (!db) return false;
  try {
    await new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      tx.objectStore(STORE_NAME).put(snapshot, GAME_DATA_KEY);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error || new Error('Falha ao salvar cache local'));
      tx.onabort = () => reject(tx.error || new Error('Cache local abortado'));
    });
    return true;
  } finally {
    db.close();
  }
}

function readLocalFallback() {
  if (typeof localStorage === 'undefined') return null;
  try {
    const raw = localStorage.getItem(GAME_DATA_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function writeLocalFallback(snapshot) {
  if (typeof localStorage === 'undefined') return false;
  try {
    localStorage.setItem(GAME_DATA_KEY, JSON.stringify(snapshot));
    return true;
  } catch {
    return false;
  }
}

export async function readGameDataCache() {
  let snapshot = null;
  try { snapshot = await readIndexedDb(); } catch { /* fallback abaixo */ }
  if (!snapshot) snapshot = readLocalFallback();
  if (!snapshot || snapshot.schema !== GAME_DATA_CACHE_SCHEMA || !hasUsableGameData(snapshot.data)) return null;
  return { ...snapshot, data: normalizeData(snapshot.data) };
}

export async function writeGameDataCache(data, { updatedAt = new Date().toISOString() } = {}) {
  const normalized = normalizeData(data);
  if (!hasUsableGameData(normalized)) return false;
  const snapshot = { schema:GAME_DATA_CACHE_SCHEMA, updatedAt, data:normalized };
  let saved = false;
  try { saved = await writeIndexedDb(snapshot); } catch { saved = false; }
  if (!saved) saved = writeLocalFallback(snapshot);
  if (typeof localStorage !== 'undefined') {
    try { localStorage.setItem(META_KEY, JSON.stringify({ schema:GAME_DATA_CACHE_SCHEMA, updatedAt })); } catch { /* ignore */ }
  }
  return saved;
}

export function getGameDataCacheMeta() {
  if (typeof localStorage === 'undefined') return null;
  try {
    const raw = localStorage.getItem(META_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}
