import { APP_VERSION } from '../version.js';
import Tropa from '../models/Tropa.js';
import Nivel from '../models/Nivel.js';
import Dragao from '../models/Dragao.js';
import Edificio from '../models/Edificio.js';
import Pesquisa from '../models/Pesquisa.js';
import Reino from '../models/Reino.js';
import CategoriaDica from '../models/CategoriaDica.js';
import User from '../models/User.js';
import AppConfig from '../models/AppConfig.js';
import { TODAS_TROPAS, NIVEIS_DATA } from '../seeds/core.js';
import { DRAGOES_SEED } from '../seeds/dragoes.js';
import { EDIFICIOS_META, EDIFICIOS_COLUNAS, EDIFICIOS_NIVEIS } from '../seeds/edificios.js';
import { PESQUISAS_SEED } from '../seeds/pesquisas.js';
import { REINOS_SEED } from '../seeds/reinos.js';
import { CATS_PADRAO } from '../seeds/categoriasDicas.js';
import { mesclarSeed } from '../utils/seedMerge.js';
import { deveExecutarMigracao, forceMigrationFromEnv } from '../utils/migrationPolicy.js';

const INSTALL_KEY = 'installation';

function slugify(texto) {
  return String(texto || '')
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .toLowerCase().trim().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
}

function acumular(total, atual) {
  total.inseridos += atual.inserido || 0;
  total.completados += atual.completado || 0;
  total.preservados += atual.preservado || 0;
}

async function migrarLista(Model, lista, filtroFn, mapFn = x => x, options = {}) {
  const r = { inseridos: 0, completados: 0, preservados: 0, total: lista.length };
  for (const item of lista) acumular(r, await mesclarSeed(Model, filtroFn(item), mapFn(item), options));
  return r;
}

function gerarNiveisPesquisa(max) {
  return Array.from({ length: Number(max) || 1 }, (_, i) => ({ nivel: i + 1, tempo: '' }));
}

function normalizarDragao(d) {
  const { id, ...rest } = d;
  return { ...rest, slug: id, niveis: [] };
}

function documentosEdificios() {
  return Object.keys(EDIFICIOS_META).map(slug => ({
    slug,
    nome: EDIFICIOS_META[slug].nome || slug,
    ...EDIFICIOS_META[slug],
    colunas: EDIFICIOS_COLUNAS[slug] || [],
    niveis: EDIFICIOS_NIVEIS[slug] || [],
  }));
}

function documentosPesquisas() {
  return PESQUISAS_SEED.map(p => ({ ...p, niveis: gerarNiveisPesquisa(p.nivelMax) }));
}

function documentosReinos() {
  return REINOS_SEED.map(r => ({ ...r, slug: slugify(r.nome) }));
}

export async function executarMigracaoAutomatica() {
  try {
    const configAtual = await AppConfig.findOne({ chave: INSTALL_KEY }).lean();
    const forcar = forceMigrationFromEnv();
    const totalUsuariosAtual = await User.countDocuments();

    if (!deveExecutarMigracao(configAtual, APP_VERSION, forcar)) {
      return {
        ok: true,
        ignorada: true,
        relatorio: configAtual?.relatorioMigracao || {},
        usuarioNecessario: totalUsuariosAtual === 0,
      };
    }

    const inicio = new Date();
    await AppConfig.findOneAndUpdate(
      { chave: INSTALL_KEY },
      { $set: { modoDados: 'mongo', migracaoEstado: 'executando', migracaoVersao: APP_VERSION, ultimoErro: '', atualizadoEm: inicio } },
      { upsert: true, setDefaultsOnInsert: true }
    );

    const relatorio = {};
    relatorio.tropas = await migrarLista(Tropa, TODAS_TROPAS, x => ({ nome: x.nome }));
    relatorio.niveis = await migrarLista(Nivel, NIVEIS_DATA, x => ({ nivel: x[0] }), x => ({ nivel: x[0], xp: x[1] ?? null }));
    relatorio.dragoes = await migrarLista(Dragao, DRAGOES_SEED, x => ({ slug: x.id }), normalizarDragao);
    const edificios = documentosEdificios();
    relatorio.edificios = await migrarLista(Edificio, edificios, x => ({ slug: x.slug }), x => x, { mergeArrays: { niveis: 'nivel' } });
    const pesquisas = documentosPesquisas();
    relatorio.pesquisas = await migrarLista(Pesquisa, pesquisas, x => ({ slug: x.slug }), x => x, { mergeArrays: { niveis: 'nivel' } });
    const reinos = documentosReinos();
    relatorio.reinos = await migrarLista(Reino, reinos, x => ({ id: x.id }));
    relatorio.categoriasDicas = await migrarLista(CategoriaDica, CATS_PADRAO, x => ({ slug: x.slug }));

    const totalUsuarios = await User.countDocuments();
    const agora = new Date();
    await AppConfig.findOneAndUpdate(
      { chave: INSTALL_KEY },
      { $set: {
        modoDados: 'mongo', migracaoEstado: 'pronto', migracaoVersao: APP_VERSION,
        migracaoEm: agora, relatorioMigracao: relatorio,
        setupConcluido: totalUsuarios > 0,
        ...(totalUsuarios > 0 ? { setupConcluidoEm: agora } : {}),
        ultimoErro: '', atualizadoEm: agora,
      } },
      { upsert: true, setDefaultsOnInsert: true }
    );
    return { ok: true, ignorada: false, relatorio, usuarioNecessario: totalUsuarios === 0 };
  } catch (err) {
    await AppConfig.findOneAndUpdate(
      { chave: INSTALL_KEY },
      { $set: { migracaoEstado: 'erro', migracaoVersao: APP_VERSION, ultimoErro: err.message, atualizadoEm: new Date() } },
      { upsert: true, setDefaultsOnInsert: true }
    ).catch(() => {});
    return { ok: false, erro: err.message };
  }
}

export { INSTALL_KEY };
