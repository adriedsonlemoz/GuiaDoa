/**
 * syncService.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Sincronização automática entre a API e o localStorage.
 *
 * Fluxo por módulo (em ordem de prioridade):
 *  1. API → MongoDB (backend online)            → salva no cache → usa
 *  2. localStorage cache (sync anterior)         → usa direto
 *  3. Dados estáticos embutidos no app           → salva no cache → usa
 *     (somente módulos que possuem dados locais, ex: Edifícios)
 *
 *  Offline com cache existente  → app funciona normalmente
 *  Offline sem cache (1ª vez)   → dados estáticos cobrem Edifícios;
 *                                  Itens e Pesquisas ficam indisponíveis
 */

import { dbEdificios } from './edificios.js';

const API = import.meta.env.VITE_API_URL || 'http://localhost:3001';

// ─── VERSÃO DO APP ───────────────────────────────────────────────────────────
export const APP_VERSION = '1.0.1';

// ─── CHAVES DO CACHE ─────────────────────────────────────────────────────────
export const SYNC_KEYS = {
  ITENS:       'doa_cache_itens_v2',
  EDIFICIOS:   'doa_cache_edificios_v2',
  PESQUISAS:   'doa_cache_pesquisas_v2',
  SYNC_TS:     'doa_ultima_sync',
  APP_VER:     'doa_sync_app_version',
  SYNC_STATUS: 'doa_sync_status',
};

// ─── LEITORES DE CACHE (síncronos) ───────────────────────────────────────────
export const getCachedItens = () => {
  try { return JSON.parse(localStorage.getItem(SYNC_KEYS.ITENS) || '[]'); }
  catch { return []; }
};
export const getCachedEdificios = () => {
  try { return JSON.parse(localStorage.getItem(SYNC_KEYS.EDIFICIOS) || '[]'); }
  catch { return []; }
};
export const getCachedPesquisas = () => {
  try { return JSON.parse(localStorage.getItem(SYNC_KEYS.PESQUISAS) || '[]'); }
  catch { return []; }
};

// ─── INFO DO ÚLTIMO SYNC ─────────────────────────────────────────────────────
export const getSyncInfo = () => ({
  ts:     localStorage.getItem(SYNC_KEYS.SYNC_TS)     || null,
  ver:    localStorage.getItem(SYNC_KEYS.APP_VER)     || null,
  status: localStorage.getItem(SYNC_KEYS.SYNC_STATUS) || null,
});

export const precisaSincronizar = () => getSyncInfo().ver !== APP_VERSION;

export const temAlgumCache = () =>
  getCachedItens().length > 0 ||
  getCachedEdificios().length > 0 ||
  getCachedPesquisas().length > 0;

/** Verifica se o dispositivo tem acesso à internet */
export const isOnline = () =>
  typeof navigator !== 'undefined' ? navigator.onLine : true;

// ─── DADOS ESTÁTICOS: METADADOS DE EDIFÍCIOS ─────────────────────────────────
const STATIC_META = {
  Casa:           { nome: 'Casa',               icone: '🏠', tag: 'Pop.',    descricao: 'Aumenta a população máxima da cidade, essencial para recrutar e sustentar tropas.',  ordem: 0  },
  Fazenda:        { nome: 'Fazenda',             icone: '🌾', tag: 'Alim.',   descricao: 'Produz alimento continuamente para sustentar tropas e o crescimento da cidade.',       ordem: 1  },
  FazendaPerolas: { nome: 'Fazenda de Pérolas',  icone: '🔮', tag: 'Pérolas', descricao: 'Produz pérolas valiosas usadas em pesquisas e negociações avançadas.',                ordem: 2  },
  FonteDaCura:    { nome: 'Fonte da Cura',        icone: '💧', tag: 'Cura',    descricao: 'Aumenta o limite de tropas que podem se curar simultaneamente no hospital.',           ordem: 3  },
  PontoDeReuniao: { nome: 'Ponto de Reunião',     icone: '⚔️', tag: 'Marcha',  descricao: 'Aumenta o limite de marchas e a quantidade de tropas enviadas por vez.',              ordem: 4  },
  Sentinela:      { nome: 'Sentinela',            icone: '👁️', tag: 'Def.',    descricao: 'Revela informações progressivas sobre ataques inimigos conforme sobe de nível.',       ordem: 5  },
  Fortaleza:      { nome: 'Fortaleza',            icone: '🏰', tag: 'Fort.',   descricao: 'Expande territórios, pontos de reforço e áreas disponíveis da cidade.',                ordem: 6  },
  Mina:           { nome: 'Mina',                 icone: '⛏️', tag: 'Ouro',    descricao: 'Extrai ouro continuamente para financiar pesquisas e construções avançadas.',          ordem: 7  },
  Pedra:          { nome: 'Pedreira',             icone: '🪨', tag: 'Pedra',   descricao: 'Extrai pedra continuamente, recurso essencial para obras e aprimoramentos.',           ordem: 8  },
  Serraria:       { nome: 'Serraria',             icone: '🌲', tag: 'Madeira', descricao: 'Produz madeira continuamente, necessária para diversas construções da cidade.',        ordem: 9  },
  Fabrica:        { nome: 'Fábrica',              icone: '🏭', tag: 'Prod.',   descricao: 'Permite treinar unidades de guerra avançadas à medida que sobe de nível.',             ordem: 10 },
  Viveiro:        { nome: 'Viveiro',              icone: '🥚', tag: 'Dragão',  descricao: 'Acelera o treinamento de dragões e desbloqueia novas espécies raras.',                 ordem: 11 },
};

const STATIC_COLUNAS = {
  Casa:           [{ key: 'popAumento',  label: 'Aumento Pop.',  tipo: 'number' }],
  Fazenda:        [{ key: 'pop', label: 'Pop.', tipo: 'number' }, { key: 'prodHora', label: 'Prod./h', tipo: 'number' }, { key: 'cap', label: 'Cap. Máx.', tipo: 'number' }],
  FazendaPerolas: [{ key: 'pop', label: 'Pop.', tipo: 'number' }, { key: 'prodHora', label: 'Prod./h', tipo: 'number' }, { key: 'cap', label: 'Cap. Máx.', tipo: 'number' }],
  FonteDaCura:    [{ key: 'maxTropas',   label: 'Máx. Tropas',   tipo: 'number' }],
  PontoDeReuniao: [{ key: 'marchas', label: 'Marchas', tipo: 'number' }, { key: 'tropasPorMarcha', label: 'Tropas/Marcha', tipo: 'number' }],
  Sentinela:      [{ key: 'desc',        label: 'Efeito',         tipo: 'text'   }],
  Fortaleza:      [{ key: 'territorios', label: 'Territórios', tipo: 'number' }, { key: 'reforcos', label: 'Reforços', tipo: 'number' }, { key: 'areas', label: 'Áreas', tipo: 'number' }],
  Mina:           [{ key: 'pop', label: 'Pop.', tipo: 'number' }, { key: 'prodHora', label: 'Prod./h', tipo: 'number' }, { key: 'cap', label: 'Cap. Máx.', tipo: 'number' }],
  Pedra:          [{ key: 'pop', label: 'Pop.', tipo: 'number' }, { key: 'prodHora', label: 'Prod./h', tipo: 'number' }, { key: 'cap', label: 'Cap. Máx.', tipo: 'number' }],
  Serraria:       [{ key: 'pop', label: 'Pop.', tipo: 'number' }, { key: 'prodHora', label: 'Prod./h', tipo: 'number' }, { key: 'cap', label: 'Cap. Máx.', tipo: 'number' }],
  Fabrica:        [{ key: 'desc',        label: 'Efeito',         tipo: 'text'   }],
  Viveiro:        [{ key: 'desc',        label: 'Efeito',         tipo: 'text'   }],
};

/**
 * Converte dbEdificios (formato JS local) → formato da API/MongoDB.
 * Retorna um array ordenado por `ordem`, pronto para salvar no cache.
 */
export function getStaticEdificios() {
  return Object.entries(dbEdificios)
    .filter(([slug]) => STATIC_META[slug])
    .map(([slug, niveis]) => ({
      slug,
      ...STATIC_META[slug],
      colunas: STATIC_COLUNAS[slug] || [],
      niveis,
    }))
    .sort((a, b) => a.ordem - b.ordem);
}

// ─── FETCH COM TIMEOUT ───────────────────────────────────────────────────────
async function fetchEndpoint(path, chave, dataKey, timeout = 10000) {
  const ctrl = new AbortController();
  const tid  = setTimeout(() => ctrl.abort(), timeout);
  try {
    const r = await fetch(`${API}/api/${path}`, { signal: ctrl.signal });
    clearTimeout(tid);
    if (!r.ok) return false;
    const d   = await r.json();
    const arr = d[dataKey] || [];
    if (arr.length > 0) {
      localStorage.setItem(chave, JSON.stringify(arr));
      return true;
    }
    return false;
  } catch {
    clearTimeout(tid);
    return false;
  }
}

// ─── SYNC PRINCIPAL ──────────────────────────────────────────────────────────
/**
 * Sincroniza todos os módulos com prioridade: API → cache existente → estático.
 *
 * @param {function} [onProgress] - chamado a cada etapa: ({ step, total, label })
 * @returns {{ ok, total, sucesso, usouEstatico }}
 */
export async function syncTodos(onProgress) {
  const endpoints = [
    { path: 'itens?limite=500', chave: SYNC_KEYS.ITENS,      dataKey: 'itens',      label: 'Itens',      staticFn: null              },
    { path: 'edificios',        chave: SYNC_KEYS.EDIFICIOS,   dataKey: 'edificios',  label: 'Edifícios',  staticFn: getStaticEdificios },
    { path: 'pesquisas',        chave: SYNC_KEYS.PESQUISAS,   dataKey: 'pesquisas',  label: 'Pesquisas',  staticFn: null              },
  ];

  let ok           = 0;
  let usouEstatico = false;

  for (let i = 0; i < endpoints.length; i++) {
    const ep = endpoints[i];
    onProgress?.({ step: i, total: endpoints.length, label: ep.label });

    // 1. Tenta API (que consulta MongoDB)
    const apiOk = await fetchEndpoint(ep.path, ep.chave, ep.dataKey);

    if (apiOk) {
      ok++;
    } else if (ep.staticFn) {
      // 2. API falhou → verifica cache atual
      const cacheAtual = JSON.parse(localStorage.getItem(ep.chave) || '[]');
      if (cacheAtual.length === 0) {
        // 3. Sem cache → popula com dados estáticos embutidos
        const staticData = ep.staticFn();
        if (staticData.length > 0) {
          localStorage.setItem(ep.chave, JSON.stringify(staticData));
          usouEstatico = true;
        }
      }
      // Se cache existia, ele continua válido — não faz nada
    }
  }

  onProgress?.({ step: endpoints.length, total: endpoints.length, label: 'Concluído' });

  const status =
    ok === endpoints.length ? 'ok'
    : ok > 0                ? 'parcial'
    : usouEstatico          ? 'estatico'
    : 'erro';

  localStorage.setItem(SYNC_KEYS.SYNC_TS,     new Date().toISOString());
  localStorage.setItem(SYNC_KEYS.SYNC_STATUS, status);

  // Marca versão como sincronizada se qualquer dado está disponível
  if (ok > 0 || usouEstatico || temAlgumCache()) {
    localStorage.setItem(SYNC_KEYS.APP_VER, APP_VERSION);
  }

  return { ok, total: endpoints.length, sucesso: ok > 0 || usouEstatico || temAlgumCache(), usouEstatico };
}

// ─── FORMATA TIMESTAMP ───────────────────────────────────────────────────────
export function formatarUltimaSyncPt(isoString) {
  if (!isoString) return 'Nunca sincronizado';
  try {
    const d = new Date(isoString);
    return d.toLocaleString('pt-BR', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });
  } catch { return 'Data inválida'; }
}
