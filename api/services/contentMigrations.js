import AppConfig from '../models/AppConfig.js';
import CategoriaDica from '../models/CategoriaDica.js';
import Dica from '../models/Dica.js';
import Tropa from '../models/Tropa.js';
import CampanhaLocal from '../models/CampanhaLocal.js';
import { DICAS_SEED } from '../seeds/dicas.js';
import { tacticalMetadata } from '../seeds/tropasTaticas.js';
import { ANTROPOS_SEED, SAVANA_SEED } from '../seeds/campanha.js';
import { mesclarSeed } from '../utils/seedMerge.js';

const MIGRATION_KEY = 'content:dicas:beta-2.14';
const TROOPS_TACTICAL_KEY = 'content:tropas-taticas:beta-2.15';
const CAMPANHA_ANTROPOS_KEY = 'content:campanha-antropos:beta-2.44';
const CAMPANHA_CAMPOS_KEY = 'content:campanha-campos:beta-2.45';
const CAMPANHA_STRATEGY_KEY = 'content:campanha-estrategias:beta-2.46';
const CAMPANHA_STRATEGY_CONFIRMED_KEY = 'content:campanha-estrategias-confirmadas:beta-2.47';
const CAMPANHA_REWARDS_KEY = 'content:campanha-recompensas:beta-2.48';

const INICIANTE_CATEGORY = {
  slug: 'iniciante',
  label: 'Primeiros Passos',
  icon: '🧭',
  ordem: -10,
  ativo: true,
  i18n: { 'en-US': { label: 'Getting Started' } },
};

async function migrarDicas() {
  const aplicado = await AppConfig.findOne({ chave: MIGRATION_KEY }).lean();
  if (aplicado?.migracaoEstado === 'pronto') return { ok: true, ignorada: true };

  const inicio = new Date();
  await AppConfig.findOneAndUpdate(
    { chave: MIGRATION_KEY },
    { $set: { migracaoEstado: 'executando', migracaoVersao: '1', ultimoErro: '', atualizadoEm: inicio } },
    { upsert: true, setDefaultsOnInsert: true },
  );

  try {
    await CategoriaDica.findOneAndUpdate(
      { slug: INICIANTE_CATEGORY.slug },
      { $setOnInsert: INICIANTE_CATEGORY },
      { upsert: true, new: true, setDefaultsOnInsert: true },
    );

    let inseridas = 0;
    let adaptadas = 0;
    for (const seed of DICAS_SEED) {
      let dica = await Dica.findOne({ slug: seed.slug });
      if (!dica) dica = await Dica.findOne({ titulo: seed.titulo });

      if (!dica) {
        await Dica.create(seed);
        inseridas += 1;
        continue;
      }

      // Esta migração roda uma única vez: adapta uma dica antiga equivalente
      // para o novo formato, mas não volta a sobrescrever edições futuras.
      dica.slug = seed.slug;
      dica.resumo = seed.resumo;
      dica.tipo = seed.tipo;
      dica.leituraMin = seed.leituraMin;
      dica.categoria = seed.categoria;
      dica.relacionados = seed.relacionados;
      dica.conteudo = seed.conteudo;
      dica.i18n = seed.i18n;
      dica.destaque = true;
      dica.ativo = true;
      dica.ordem = seed.ordem;
      await dica.save();
      adaptadas += 1;
    }

    await AppConfig.findOneAndUpdate(
      { chave: MIGRATION_KEY },
      { $set: { migracaoEstado: 'pronto', migracaoVersao: '1', migracaoEm: new Date(), atualizadoEm: new Date(), ultimoErro: '', relatorioMigracao: { dicas: { inseridas, adaptadas } } } },
      { upsert: true, setDefaultsOnInsert: true },
    );
    return { ok: true, ignorada: false, inseridas, adaptadas };
  } catch (err) {
    await AppConfig.findOneAndUpdate(
      { chave: MIGRATION_KEY },
      { $set: { migracaoEstado: 'erro', ultimoErro: err.message, atualizadoEm: new Date() } },
      { upsert: true, setDefaultsOnInsert: true },
    ).catch(() => {});
    return { ok: false, erro: err.message };
  }
}


async function migrarTropasTaticas() {
  const aplicado = await AppConfig.findOne({ chave: TROOPS_TACTICAL_KEY }).lean();
  if (aplicado?.migracaoEstado === 'pronto') return { ok:true, ignorada:true, atualizadas:0 };

  await AppConfig.findOneAndUpdate(
    { chave:TROOPS_TACTICAL_KEY },
    { $set:{ migracaoEstado:'executando', migracaoVersao:'1', ultimoErro:'', atualizadoEm:new Date() } },
    { upsert:true, setDefaultsOnInsert:true },
  );

  try {
    const tropas = await Tropa.find({ $or:[{ taxonomiaVersao:{ $lt:1 } }, { taxonomiaVersao:{ $exists:false } }] });
    let atualizadas = 0;
    for (const tropa of tropas) {
      const meta = tacticalMetadata(tropa.toObject());
      tropa.combate = meta.combate;
      tropa.categoria = meta.categoria;
      tropa.funcoes = meta.funcoes;
      if (meta.desbloqueio) tropa.desbloqueio = meta.desbloqueio;
      if (meta.i18nUnlock) {
        const atual = tropa.i18n && typeof tropa.i18n === 'object' ? tropa.i18n : {};
        tropa.i18n = { ...atual, 'en-US': { ...(atual['en-US'] || {}), ...meta.i18nUnlock } };
      }
      tropa.taxonomiaVersao = 1;
      await tropa.save();
      atualizadas += 1;
    }
    await AppConfig.findOneAndUpdate(
      { chave:TROOPS_TACTICAL_KEY },
      { $set:{ migracaoEstado:'pronto', migracaoVersao:'1', migracaoEm:new Date(), atualizadoEm:new Date(), ultimoErro:'', relatorioMigracao:{ tropas:{ atualizadas } } } },
      { upsert:true, setDefaultsOnInsert:true },
    );
    return { ok:true, ignorada:false, atualizadas };
  } catch (err) {
    await AppConfig.findOneAndUpdate({ chave:TROOPS_TACTICAL_KEY }, { $set:{ migracaoEstado:'erro', ultimoErro:err.message, atualizadoEm:new Date() } }, { upsert:true, setDefaultsOnInsert:true }).catch(()=>{});
    return { ok:false, erro:err.message, atualizadas:0 };
  }
}


async function migrarCampanhaAntropos() {
  const aplicado = await AppConfig.findOne({ chave:CAMPANHA_ANTROPOS_KEY }).lean();
  if (aplicado?.migracaoEstado === 'pronto') return { ok:true, ignorada:true, inseridas:0, completadas:0, preservadas:0 };

  await AppConfig.findOneAndUpdate(
    { chave:CAMPANHA_ANTROPOS_KEY },
    { $set:{ migracaoEstado:'executando', migracaoVersao:'1', ultimoErro:'', atualizadoEm:new Date() } },
    { upsert:true, setDefaultsOnInsert:true },
  );

  try {
    const relatorio = { inseridas:0, completadas:0, preservadas:0 };
    for (const seed of ANTROPOS_SEED) {
      const r = await mesclarSeed(CampanhaLocal, { slug:seed.slug }, seed, { mergeArrays:{ tropas:'nome', recursos:'tipo' } });
      relatorio.inseridas += r.inserido || 0;
      relatorio.completadas += r.completado || 0;
      relatorio.preservadas += r.preservado || 0;
    }
    await AppConfig.findOneAndUpdate(
      { chave:CAMPANHA_ANTROPOS_KEY },
      { $set:{ migracaoEstado:'pronto', migracaoVersao:'1', migracaoEm:new Date(), atualizadoEm:new Date(), ultimoErro:'', relatorioMigracao:{ campanha:relatorio } } },
      { upsert:true, setDefaultsOnInsert:true },
    );
    return { ok:true, ignorada:false, ...relatorio };
  } catch (err) {
    await AppConfig.findOneAndUpdate({ chave:CAMPANHA_ANTROPOS_KEY }, { $set:{ migracaoEstado:'erro', ultimoErro:err.message, atualizadoEm:new Date() } }, { upsert:true, setDefaultsOnInsert:true }).catch(()=>{});
    return { ok:false, erro:err.message, inseridas:0, completadas:0, preservadas:0 };
  }
}


async function garantirIndiceCampanhaPorSubtipo() {
  try {
    const indices = await CampanhaLocal.collection.indexes();
    const antigo = indices.find(idx => idx?.key?.categoria === 1 && idx?.key?.nivel === 1 && Object.keys(idx.key).length === 2);
    if (antigo?.name) await CampanhaLocal.collection.dropIndex(antigo.name);
  } catch (err) {
    if (err?.code !== 26 && err?.codeName !== 'NamespaceNotFound') throw err;
  }
  await CampanhaLocal.collection.createIndex(
    { categoria:1, subtipo:1, nivel:1 },
    { unique:true, partialFilterExpression:{ nivel:{ $type:'number' } }, name:'categoria_1_subtipo_1_nivel_1' },
  );
}

async function migrarCampanhaCampos() {
  const aplicado = await AppConfig.findOne({ chave:CAMPANHA_CAMPOS_KEY }).lean();
  if (aplicado?.migracaoEstado === 'pronto') return { ok:true, ignorada:true, inseridas:0, completadas:0, preservadas:0 };

  await AppConfig.findOneAndUpdate(
    { chave:CAMPANHA_CAMPOS_KEY },
    { $set:{ migracaoEstado:'executando', migracaoVersao:'1', ultimoErro:'', atualizadoEm:new Date() } },
    { upsert:true, setDefaultsOnInsert:true },
  );

  try {
    await garantirIndiceCampanhaPorSubtipo();
    const relatorio = { inseridas:0, completadas:0, preservadas:0 };
    for (const seed of SAVANA_SEED) {
      const r = await mesclarSeed(CampanhaLocal, { slug:seed.slug }, seed, {
        mergeArrays:{ tropas:'nome', recursos:'tipo', recompensas:'codigo' },
      });
      relatorio.inseridas += r.inserido || 0;
      relatorio.completadas += r.completado || 0;
      relatorio.preservadas += r.preservado || 0;
    }
    await AppConfig.findOneAndUpdate(
      { chave:CAMPANHA_CAMPOS_KEY },
      { $set:{ migracaoEstado:'pronto', migracaoVersao:'1', migracaoEm:new Date(), atualizadoEm:new Date(), ultimoErro:'', relatorioMigracao:{ campos:relatorio } } },
      { upsert:true, setDefaultsOnInsert:true },
    );
    return { ok:true, ignorada:false, ...relatorio };
  } catch (err) {
    await AppConfig.findOneAndUpdate({ chave:CAMPANHA_CAMPOS_KEY }, { $set:{ migracaoEstado:'erro', ultimoErro:err.message, atualizadoEm:new Date() } }, { upsert:true, setDefaultsOnInsert:true }).catch(()=>{});
    return { ok:false, erro:err.message, inseridas:0, completadas:0, preservadas:0 };
  }
}


async function migrarCampanhaEstrategias() {
  const aplicado = await AppConfig.findOne({ chave:CAMPANHA_STRATEGY_KEY }).lean();
  if (aplicado?.migracaoEstado === 'pronto') return { ok:true, ignorada:true, inseridas:0, completadas:0, preservadas:0 };

  await AppConfig.findOneAndUpdate(
    { chave:CAMPANHA_STRATEGY_KEY },
    { $set:{ migracaoEstado:'executando', migracaoVersao:'1', ultimoErro:'', atualizadoEm:new Date() } },
    { upsert:true, setDefaultsOnInsert:true },
  );

  try {
    const relatorio = { inseridas:0, completadas:0, preservadas:0 };
    for (const seed of ANTROPOS_SEED.filter(x => (x.guiasAtaque || []).length)) {
      const r = await mesclarSeed(CampanhaLocal, { slug:seed.slug }, { guiasAtaque:seed.guiasAtaque }, { mergeArrays:{ guiasAtaque:'codigo' } });
      relatorio.inseridas += r.inserido || 0;
      relatorio.completadas += r.completado || 0;
      relatorio.preservadas += r.preservado || 0;
    }
    await AppConfig.findOneAndUpdate(
      { chave:CAMPANHA_STRATEGY_KEY },
      { $set:{ migracaoEstado:'pronto', migracaoVersao:'1', migracaoEm:new Date(), atualizadoEm:new Date(), ultimoErro:'', relatorioMigracao:{ estrategias:relatorio } } },
      { upsert:true, setDefaultsOnInsert:true },
    );
    return { ok:true, ignorada:false, ...relatorio };
  } catch (err) {
    await AppConfig.findOneAndUpdate({ chave:CAMPANHA_STRATEGY_KEY }, { $set:{ migracaoEstado:'erro', ultimoErro:err.message, atualizadoEm:new Date() } }, { upsert:true, setDefaultsOnInsert:true }).catch(()=>{});
    return { ok:false, erro:err.message, inseridas:0, completadas:0, preservadas:0 };
  }
}


async function migrarCampanhaEstrategiasConfirmadas() {
  const aplicado = await AppConfig.findOne({ chave:CAMPANHA_STRATEGY_CONFIRMED_KEY }).lean();
  if (aplicado?.migracaoEstado === 'pronto') return { ok:true, ignorada:true, atualizadas:0, guias:0 };

  await AppConfig.findOneAndUpdate(
    { chave:CAMPANHA_STRATEGY_CONFIRMED_KEY },
    { $set:{ migracaoEstado:'executando', migracaoVersao:'1', ultimoErro:'', atualizadoEm:new Date() } },
    { upsert:true, setDefaultsOnInsert:true },
  );

  try {
    let atualizadas = 0;
    let guias = 0;
    for (const seed of ANTROPOS_SEED) {
      const atual = await CampanhaLocal.findOne({ slug:seed.slug }).lean();
      if (!atual) {
        await CampanhaLocal.create(seed);
        atualizadas += 1;
        guias += seed.guiasAtaque?.length || 0;
        continue;
      }
      const oficiais = seed.guiasAtaque || [];
      const codigosOficiais = new Set(oficiais.map(x => x.codigo));
      // A Beta 2.47 é uma confirmação explícita do usuário: substitui somente
      // os métodos comunitários oficiais conhecidos e mantém guias personalizados.
      const personalizados = (atual.guiasAtaque || []).filter(x => !codigosOficiais.has(x.codigo));
      await CampanhaLocal.updateOne(
        { slug:seed.slug },
        { $set:{ guiasAtaque:[...oficiais, ...personalizados], atualizadoEm:new Date() } },
      );
      atualizadas += 1;
      guias += oficiais.length;
    }
    await AppConfig.findOneAndUpdate(
      { chave:CAMPANHA_STRATEGY_CONFIRMED_KEY },
      { $set:{ migracaoEstado:'pronto', migracaoVersao:'1', migracaoEm:new Date(), atualizadoEm:new Date(), ultimoErro:'', relatorioMigracao:{ estrategiasConfirmadas:{ atualizadas, guias } } } },
      { upsert:true, setDefaultsOnInsert:true },
    );
    return { ok:true, ignorada:false, atualizadas, guias };
  } catch (err) {
    await AppConfig.findOneAndUpdate(
      { chave:CAMPANHA_STRATEGY_CONFIRMED_KEY },
      { $set:{ migracaoEstado:'erro', ultimoErro:err.message, atualizadoEm:new Date() } },
      { upsert:true, setDefaultsOnInsert:true },
    ).catch(()=>{});
    return { ok:false, erro:err.message, atualizadas:0, guias:0 };
  }
}


async function migrarCampanhaRecompensas() {
  const aplicado = await AppConfig.findOne({ chave:CAMPANHA_REWARDS_KEY }).lean();
  if (aplicado?.migracaoEstado === 'pronto') return { ok:true, ignorada:true, inseridas:0, completadas:0, preservadas:0 };

  await AppConfig.findOneAndUpdate(
    { chave:CAMPANHA_REWARDS_KEY },
    { $set:{ migracaoEstado:'executando', migracaoVersao:'1', ultimoErro:'', atualizadoEm:new Date() } },
    { upsert:true, setDefaultsOnInsert:true },
  );

  try {
    const relatorio = { inseridas:0, completadas:0, preservadas:0 };
    for (const seed of ANTROPOS_SEED) {
      const r = await mesclarSeed(
        CampanhaLocal,
        { slug:seed.slug },
        { recompensas:seed.recompensas, fonte:seed.fonte },
        { mergeArrays:{ recompensas:'codigo' } },
      );
      relatorio.inseridas += r.inserido || 0;
      relatorio.completadas += r.completado || 0;
      relatorio.preservadas += r.preservado || 0;
    }
    await AppConfig.findOneAndUpdate(
      { chave:CAMPANHA_REWARDS_KEY },
      { $set:{ migracaoEstado:'pronto', migracaoVersao:'1', migracaoEm:new Date(), atualizadoEm:new Date(), ultimoErro:'', relatorioMigracao:{ recompensasAntropos:relatorio } } },
      { upsert:true, setDefaultsOnInsert:true },
    );
    return { ok:true, ignorada:false, ...relatorio };
  } catch (err) {
    await AppConfig.findOneAndUpdate(
      { chave:CAMPANHA_REWARDS_KEY },
      { $set:{ migracaoEstado:'erro', ultimoErro:err.message, atualizadoEm:new Date() } },
      { upsert:true, setDefaultsOnInsert:true },
    ).catch(()=>{});
    return { ok:false, erro:err.message, inseridas:0, completadas:0, preservadas:0 };
  }
}

export async function executarMigracoesConteudo() {
  const dicas = await migrarDicas();
  if (!dicas.ok) return dicas;
  const tropas = await migrarTropasTaticas();
  if (!tropas.ok) return tropas;
  const campanha = await migrarCampanhaAntropos();
  if (!campanha.ok) return campanha;
  const campos = await migrarCampanhaCampos();
  if (!campos.ok) return campos;
  const estrategias = await migrarCampanhaEstrategias();
  if (!estrategias.ok) return estrategias;
  const estrategiasConfirmadas = await migrarCampanhaEstrategiasConfirmadas();
  if (!estrategiasConfirmadas.ok) return estrategiasConfirmadas;
  const recompensas = await migrarCampanhaRecompensas();
  if (!recompensas.ok) return recompensas;
  return {
    ok:true,
    ignorada:Boolean(dicas.ignorada && tropas.ignorada && campanha.ignorada && campos.ignorada && estrategias.ignorada && estrategiasConfirmadas.ignorada && recompensas.ignorada),
    inseridas:dicas.inseridas || 0,
    adaptadas:dicas.adaptadas || 0,
    tropasAtualizadas:tropas.atualizadas || 0,
    campanhaInseridas:(campanha.inseridas || 0) + (campos.inseridas || 0),
    campanhaCompletadas:(campanha.completadas || 0) + (campos.completadas || 0) + (estrategias.completadas || 0) + (estrategiasConfirmadas.atualizadas || 0) + (recompensas.completadas || 0),
  };
}
