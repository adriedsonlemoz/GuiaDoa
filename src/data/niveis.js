/**
 * niveis.js
 * Busca sempre da API (MongoDB). Sem cache em memória.
 * Fallback para dados estáticos apenas se a API estiver inacessível.
 */

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export const dbNiveisLocal = [
  [1, 62], [2, 76], [3, null], [4, 196], [5, 356], [6, 676], [7, 1316], [8, 2596],
  [9, null], [10, 10276], [11, 16676], [12, 24676], [13, 34676], [14, 47176],
  [15, 62801], [16, 82332], [17, 106690], [18, 137208], [19, 175355], [20, 223039],
  [21, null], [22, 357149], [23, null], [24, 566697], [25, 712216], [26, 894115],
  [27, 1121488], [28, 1405705], [29, 1760977], [30, 2205066], [31, 2760178],
  [32, 3454067], [33, null], [34, null], [35, 6760884], [36, 8454949], [37, 10572332],
  [38, 16528232], [39, null], [40, null], [41, null], [42, null], [43, null],
  [44, 50471718], [45, null], [46, null], [47, null], [48, null], [49, 159059016],
  [50, null], [51, null], [52, null], [53, null], [54, null], [55, null], [56, null],
  [57, null], [58, null], [59, null], [60, null],
];

/** Busca sempre fresh do MongoDB via API. Sem cache. */
export async function carregarNiveis() {
  try {
    const r = await fetch(`${API_URL}/api/niveis/todas`, {
      signal: AbortSignal.timeout(5000),
      headers: { 'Cache-Control': 'no-cache' },
    });
    if (r.ok) {
      const dados = await r.json();
      if (Array.isArray(dados) && dados.length > 0) {
        console.info(`[DOA] ${dados.length} níveis carregados do MongoDB`);
        return dados.map(d => [d.nivel, d.xp ?? null]);
      }
      console.warn('[DOA] API retornou lista vazia — usando fallback local');
    } else {
      console.warn(`[DOA] API respondeu ${r.status} — usando fallback local`);
    }
  } catch {
    console.warn('[DOA] API inacessível — usando fallback local');
  }
  return dbNiveisLocal;
}

/** Mantido por compatibilidade — não faz nada pois não há cache */
export function invalidarCacheNiveis() {}

export const dbNiveis = dbNiveisLocal;
