// ==========================================================
// db.js — Ponto de entrada único do banco de dados.
//
// Re-exporta dados estáticos e funções async que buscam
// da API com fallback local.
// ==========================================================

export { dbTropas }                    from './data/tropas.js';
export { dbNiveis }                    from './data/niveis.js';
export { dbReinos }                    from './data/reinos.js';
export { dbEdificios }                 from './data/edificios.js';
export { dbDragoes, getDragaoById }    from './data/dragoes.js';

// Funções async com API + fallback
export { carregarTropas, invalidarCacheTropas }   from './data/tropas.js';
export { carregarNiveis, invalidarCacheNiveis }   from './data/niveis.js';
