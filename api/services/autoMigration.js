import Tropa from '../models/Tropa.js';
import Nivel from '../models/Nivel.js';
import Dragao from '../models/Dragao.js';
import Edificio from '../models/Edificio.js';
import Pesquisa from '../models/Pesquisa.js';
import Reino from '../models/Reino.js';
import CategoriaDica from '../models/CategoriaDica.js';
import Item from '../models/Item.js';
import User from '../models/User.js';
import AppConfig from '../models/AppConfig.js';
import { TODAS_TROPAS, NIVEIS_DATA } from '../seeds/core.js';
import { DRAGOES_SEED } from '../seeds/dragoes.js';
import { EDIFICIOS_META, EDIFICIOS_COLUNAS, EDIFICIOS_NIVEIS } from '../seeds/edificios.js';
import { PESQUISAS_SEED } from '../seeds/pesquisas.js';
import { REINOS_SEED } from '../seeds/reinos.js';
import { CATS_PADRAO } from '../seeds/categoriasDicas.js';
import { ITENS_SEED } from '../seeds/itens.js';
import { mesclarSeed } from '../utils/seedMerge.js';
import { DATA_MIGRATION_VERSION, deveExecutarMigracao, forceMigrationFromEnv } from '../utils/migrationPolicy.js';

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
  return { ...rest, slug: id, niveis: Array.isArray(d.niveis) ? d.niveis : [] };
}

async function corrigirCatalogoDragoesLegado() {
  const grandeSeed = DRAGOES_SEED.find(d => d.id === 'grande_dragao');
  const grande = await Dragao.findOne({ slug:'grande_dragao' });
  if (grande && Array.isArray(grande.habilidades) && grande.habilidades.some(h => h?.nivelAtual || h?.nivelMax || h?.xpConhecida)) {
    grande.habilidades = grandeSeed?.habilidades || [];
    grande.itensAlimentacao = grandeSeed?.itensAlimentacao || [];
    await grande.save();
  }

  const legadas = {
    dragao_agua: ['Maré Profunda','Névoa Oceânica','Corrente Sombria'],
    dragao_beladona: ['Toxina Letal','Aura do Pântano','Névoa Venenosa'],
    dragao_terra: ['Pele de Pedra','Tremor Sísmico','Fortaleza Viva'],
  };
  let limpos = 0;
  for (const [slug, nomes] of Object.entries(legadas)) {
    const atual = await Dragao.findOne({ slug });
    const atuais = (atual?.habilidades || []).map(h => h?.nome).filter(Boolean);
    if (atuais.length === nomes.length && nomes.every(n => atuais.includes(n))) {
      atual.habilidades = [];
      await atual.save();
      limpos += 1;
    }
  }
  return limpos;
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

    if (!deveExecutarMigracao(configAtual, DATA_MIGRATION_VERSION, forcar)) {
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
      { $set: { modoDados: 'mongo', migracaoEstado: 'executando', migracaoVersao: DATA_MIGRATION_VERSION, ultimoErro: '', atualizadoEm: inicio } },
      { upsert: true, setDefaultsOnInsert: true }
    );

    const relatorio = {};
    relatorio.tropas = await migrarLista(Tropa, TODAS_TROPAS, x => ({ nome: x.nome }));
    const tropasRemovidas = await Tropa.deleteMany({ nome:'Hoplitas Imortais' });
    relatorio.tropasRemovidas = tropasRemovidas.deletedCount || 0;
    const niveisLegados = await Nivel.find({ xp:{ $ne:null }, $or:[{ poderNecessario:{ $exists:false } }, { poderNecessario:null }] }).lean();
    for (const nivel of niveisLegados) await Nivel.updateOne({ _id:nivel._id }, { $set:{ poderNecessario:nivel.xp } });
    relatorio.niveisLegadoMigrados = niveisLegados.length;
    relatorio.niveis = await migrarLista(Nivel, NIVEIS_DATA, x => ({ nivel:x[0] }), x => ({ nivel:x[0], poderNecessario:x[1] ?? null }));
    await Nivel.updateMany({ xp:{ $exists:true } }, { $unset:{ xp:'' } });
    relatorio.dragoes = await migrarLista(Dragao, DRAGOES_SEED, x => ({ slug: x.id }), normalizarDragao, { mergeArrays:{ niveis:'nivel', habilidades:'id' } });
    relatorio.dragoesLegadoLimpos = await corrigirCatalogoDragoesLegado();
    const edificios = documentosEdificios();
    relatorio.edificios = await migrarLista(Edificio, edificios, x => ({ slug: x.slug }), x => x, { mergeArrays: { niveis: 'nivel' } });
    const pesquisas = documentosPesquisas();
    relatorio.pesquisas = await migrarLista(Pesquisa, pesquisas, x => ({ slug: x.slug }), x => x, { mergeArrays: { niveis: 'nivel' } });
    const reinos = documentosReinos();
    relatorio.reinos = await migrarLista(Reino, reinos, x => ({ id: x.id }));
    relatorio.categoriasDicas = await migrarLista(CategoriaDica, CATS_PADRAO, x => ({ slug: x.slug }));
    relatorio.itens = await migrarLista(Item, ITENS_SEED, x => ({ nome: x.nome }));

    const totalUsuarios = await User.countDocuments();
    const agora = new Date();
    await AppConfig.findOneAndUpdate(
      { chave: INSTALL_KEY },
      { $set: {
        modoDados: 'mongo', migracaoEstado: 'pronto', migracaoVersao: DATA_MIGRATION_VERSION,
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
      { $set: { migracaoEstado: 'erro', migracaoVersao: DATA_MIGRATION_VERSION, ultimoErro: err.message, atualizadoEm: new Date() } },
      { upsert: true, setDefaultsOnInsert: true }
    ).catch(() => {});
    return { ok: false, erro: err.message };
  }
}

export { INSTALL_KEY };
