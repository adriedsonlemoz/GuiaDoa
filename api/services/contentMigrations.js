import AppConfig from '../models/AppConfig.js';
import CategoriaDica from '../models/CategoriaDica.js';
import Dica from '../models/Dica.js';
import Tropa from '../models/Tropa.js';
import Item from '../models/Item.js';
import CampanhaLocal from '../models/CampanhaLocal.js';
import Dragao from '../models/Dragao.js';
import { DICAS_SEED } from '../seeds/dicas.js';
import { tacticalMetadata } from '../seeds/tropasTaticas.js';
import { TROOP_COMBAT_EVIDENCE } from '../seeds/tropasCombate.js';
import { ITEM_SCREENSHOT_CATALOG } from '../seeds/itensCatalogo.js';
import { ANTROPOS_SEED, SAVANA_SEED, LAGO_SEED, FLORESTA_SEED, MONTANHA_SEED, MORRO_SEED, GRODZ_SEED } from '../seeds/campanha.js';
import { DRAGOES_SEED } from '../seeds/dragoes.js';
import { mesclarSeed } from '../utils/seedMerge.js';

const MIGRATION_KEY = 'content:dicas:beta-2.14';
const REALM_BEGINNER_GUIDE_KEY = 'content:dicas-guia-inicio-realm:beta-2.51';
const ANTHROPUS_ATTACK_TUTORIAL_KEY = 'content:dicas-tutorial-antropos:beta-2.52';
const TROOPS_TACTICAL_KEY = 'content:tropas-taticas:beta-2.15';
const TROOPS_COMBAT_EVIDENCE_KEY = 'content:tropas-combate-evidencias:beta-2.53';
const ITEMS_CATALOG_KEY = 'content:itens-catalogo:beta-2.58';
const CAMPANHA_ANTROPOS_KEY = 'content:campanha-antropos:beta-2.44';
const CAMPANHA_CAMPOS_KEY = 'content:campanha-campos:beta-2.45';
const CAMPANHA_LAGO_KEY = 'content:campanha-lago:beta-2.59';
const CAMPANHA_FLORESTA_KEY = 'content:campanha-floresta:beta-2.61';
const CAMPANHA_MONTANHA_KEY = 'content:campanha-montanha:beta-2.62';
const CAMPANHA_MORRO_KEY = 'content:campanha-morro:beta-2.62';
const CAMPANHA_SAVANA_REWARDS_KEY = 'content:campanha-savana-recompensas:beta-2.63';
const CAMPANHA_STRATEGY_KEY = 'content:campanha-estrategias:beta-2.46';
const CAMPANHA_STRATEGY_CONFIRMED_KEY = 'content:campanha-estrategias-confirmadas:beta-2.47';
const CAMPANHA_REWARDS_KEY = 'content:campanha-recompensas:beta-2.48';
const CAMPANHA_STRATEGY_POLISH_KEY = 'content:campanha-estrategias-polimento:beta-2.50';
const CAMPANHA_ANTROPOS_RECOMMENDATIONS_264_KEY = 'content:campanha-antropos-recomendacoes:beta-2.64';
const CAMPANHA_FIELDS_CAPTURE_SYNC_264_KEY = 'content:campanha-campos-captura:beta-2.64';
const DRAGON_CAPTURE_SYNC_264_KEY = 'content:dragoes-obtencao-campos:beta-2.64';
const TUTORIALS_264_KEY = 'content:dicas-antropos-captura:beta-2.64';
const CAMPANHA_GRODZ_265_KEY = 'content:campanha-grodz:beta-2.65';
const TUTORIAL_GRODZ_265_KEY = 'content:dicas-grodz:beta-2.65';
const ITEM_DEVASTAR_265_KEY = 'content:item-pergaminho-devastar:beta-2.65';

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


async function migrarGuiaInicioRealm() {
  const aplicado = await AppConfig.findOne({ chave:REALM_BEGINNER_GUIDE_KEY }).lean();
  if (aplicado?.migracaoEstado === 'pronto') return { ok:true, ignorada:true, atualizadas:0 };

  await AppConfig.findOneAndUpdate(
    { chave:REALM_BEGINNER_GUIDE_KEY },
    { $set:{ migracaoEstado:'executando', migracaoVersao:'1', ultimoErro:'', atualizadoEm:new Date() } },
    { upsert:true, setDefaultsOnInsert:true },
  );

  try {
    const seed = DICAS_SEED.find(item => item.slug === 'guia-inicial-construcoes');
    if (!seed) throw new Error('Seed do guia inicial não encontrado.');
    const atual = await Dica.findOne({ slug:seed.slug }).lean();
    if (!atual) {
      await Dica.create(seed);
    } else {
      await Dica.updateOne(
        { slug:seed.slug },
        { $set:{
          titulo:seed.titulo,
          resumo:seed.resumo,
          categoria:seed.categoria,
          tipo:seed.tipo,
          leituraMin:seed.leituraMin,
          destaque:seed.destaque,
          ativo:seed.ativo,
          ordem:seed.ordem,
          relacionados:seed.relacionados,
          conteudo:seed.conteudo,
          i18n:seed.i18n,
          atualizadoEm:new Date(),
        } },
      );
    }
    await AppConfig.findOneAndUpdate(
      { chave:REALM_BEGINNER_GUIDE_KEY },
      { $set:{ migracaoEstado:'pronto', migracaoVersao:'1', migracaoEm:new Date(), atualizadoEm:new Date(), ultimoErro:'', relatorioMigracao:{ guiaInicioRealm:{ atualizadas:1 } } } },
      { upsert:true, setDefaultsOnInsert:true },
    );
    return { ok:true, ignorada:false, atualizadas:1 };
  } catch (err) {
    await AppConfig.findOneAndUpdate(
      { chave:REALM_BEGINNER_GUIDE_KEY },
      { $set:{ migracaoEstado:'erro', ultimoErro:err.message, atualizadoEm:new Date() } },
      { upsert:true, setDefaultsOnInsert:true },
    ).catch(()=>{});
    return { ok:false, erro:err.message, atualizadas:0 };
  }
}


async function migrarTutorialAntropos() {
  const aplicado = await AppConfig.findOne({ chave:ANTHROPUS_ATTACK_TUTORIAL_KEY }).lean();
  if (aplicado?.migracaoEstado === 'pronto') return { ok:true, ignorada:true, atualizadas:0 };

  await AppConfig.findOneAndUpdate(
    { chave:ANTHROPUS_ATTACK_TUTORIAL_KEY },
    { $set:{ migracaoEstado:'executando', migracaoVersao:'1', ultimoErro:'', atualizadoEm:new Date() } },
    { upsert:true, setDefaultsOnInsert:true },
  );

  try {
    const seed = DICAS_SEED.find(item => item.slug === 'tutorial-atacar-antropos');
    if (!seed) throw new Error('Seed do tutorial de Antropos não encontrado.');
    const atual = await Dica.findOne({ slug:seed.slug }).lean();
    if (!atual) {
      await Dica.create(seed);
    } else {
      await Dica.updateOne(
        { slug:seed.slug },
        { $set:{
          titulo:seed.titulo,
          resumo:seed.resumo,
          categoria:seed.categoria,
          tipo:seed.tipo,
          leituraMin:seed.leituraMin,
          destaque:seed.destaque,
          ativo:seed.ativo,
          ordem:seed.ordem,
          relacionados:seed.relacionados,
          conteudo:seed.conteudo,
          i18n:seed.i18n,
          atualizadoEm:new Date(),
        } },
      );
    }
    await AppConfig.findOneAndUpdate(
      { chave:ANTHROPUS_ATTACK_TUTORIAL_KEY },
      { $set:{ migracaoEstado:'pronto', migracaoVersao:'1', migracaoEm:new Date(), atualizadoEm:new Date(), ultimoErro:'', relatorioMigracao:{ tutorialAntropos:{ atualizadas:1 } } } },
      { upsert:true, setDefaultsOnInsert:true },
    );
    return { ok:true, ignorada:false, atualizadas:1 };
  } catch (err) {
    await AppConfig.findOneAndUpdate(
      { chave:ANTHROPUS_ATTACK_TUTORIAL_KEY },
      { $set:{ migracaoEstado:'erro', ultimoErro:err.message, atualizadoEm:new Date() } },
      { upsert:true, setDefaultsOnInsert:true },
    ).catch(()=>{});
    return { ok:false, erro:err.message, atualizadas:0 };
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


function valorCombateVazio(value) {
  if (value === undefined || value === null) return true;
  if (typeof value === 'string') return value.trim() === '';
  if (Array.isArray(value)) return value.length === 0;
  return false;
}

async function migrarEvidenciasCombateTropas() {
  const aplicado = await AppConfig.findOne({ chave:TROOPS_COMBAT_EVIDENCE_KEY }).lean();
  if (aplicado?.migracaoEstado === 'pronto') return { ok:true, ignorada:true, atualizadas:0 };

  await AppConfig.findOneAndUpdate(
    { chave:TROOPS_COMBAT_EVIDENCE_KEY },
    { $set:{ migracaoEstado:'executando', migracaoVersao:'1', ultimoErro:'', atualizadoEm:new Date() } },
    { upsert:true, setDefaultsOnInsert:true },
  );

  try {
    let atualizadas = 0;
    for (const seed of TROOP_COMBAT_EVIDENCE) {
      const atual = await Tropa.findOne({ nome:seed.nome }).lean();
      if (!atual) continue;

      const patch = {};
      const perfilAtual = atual.perfilCombate || {};
      const perfilSeed = seed.perfilCombate || {};
      for (const [campo, valor] of Object.entries(perfilSeed)) {
        if (campo === 'confiancaCampos') continue;
        if (valorCombateVazio(perfilAtual[campo]) && !valorCombateVazio(valor)) {
          patch[`perfilCombate.${campo}`] = valor;
        }
      }
      const confiancaAtual = perfilAtual.confiancaCampos || {};
      for (const [campo, valor] of Object.entries(perfilSeed.confiancaCampos || {})) {
        if (valorCombateVazio(confiancaAtual[campo]) && !valorCombateVazio(valor)) {
          patch[`perfilCombate.confiancaCampos.${campo}`] = valor;
        }
      }

      const enAtual = atual.i18n?.['en-US'] || {};
      for (const [campo, valor] of Object.entries(seed.i18n?.['en-US'] || {})) {
        if (valorCombateVazio(enAtual[campo]) && !valorCombateVazio(valor)) patch[`i18n.en-US.${campo}`] = valor;
      }
      if ((Number(atual.taxonomiaCombateVersao) || 0) < 1) patch.taxonomiaCombateVersao = 1;

      if (Object.keys(patch).length) {
        patch.atualizadoEm = new Date();
        await Tropa.updateOne({ _id:atual._id }, { $set:patch });
        atualizadas += 1;
      }
    }

    await AppConfig.findOneAndUpdate(
      { chave:TROOPS_COMBAT_EVIDENCE_KEY },
      { $set:{ migracaoEstado:'pronto', migracaoVersao:'1', migracaoEm:new Date(), atualizadoEm:new Date(), ultimoErro:'', relatorioMigracao:{ tropasCombate:{ atualizadas } } } },
      { upsert:true, setDefaultsOnInsert:true },
    );
    return { ok:true, ignorada:false, atualizadas };
  } catch (err) {
    await AppConfig.findOneAndUpdate(
      { chave:TROOPS_COMBAT_EVIDENCE_KEY },
      { $set:{ migracaoEstado:'erro', ultimoErro:err.message, atualizadoEm:new Date() } },
      { upsert:true, setDefaultsOnInsert:true },
    ).catch(()=>{});
    return { ok:false, erro:err.message, atualizadas:0 };
  }
}


async function migrarCatalogoItens() {
  const aplicado = await AppConfig.findOne({ chave:ITEMS_CATALOG_KEY }).lean();
  if (aplicado?.migracaoEstado === 'pronto') return { ok:true, ignorada:true, inseridas:0, completadas:0, preservadas:0 };

  await AppConfig.findOneAndUpdate(
    { chave:ITEMS_CATALOG_KEY },
    { $set:{ migracaoEstado:'executando', migracaoVersao:'1', ultimoErro:'', atualizadoEm:new Date() } },
    { upsert:true, setDefaultsOnInsert:true },
  );

  try {
    const relatorio = { inseridas:0, completadas:0, preservadas:0 };
    for (const seed of ITEM_SCREENSHOT_CATALOG) {
      const atual = await Item.findOne({ $or:[{ slug:seed.slug }, { nome:seed.nome }] }).lean();
      const filtro = atual?._id ? { _id:atual._id } : { slug:seed.slug };
      const r = await mesclarSeed(Item, filtro, seed, { mergeArrays:{ conteudo:'itemSlug' } });
      relatorio.inseridas += r.inserido || 0;
      relatorio.completadas += r.completado || 0;
      relatorio.preservadas += r.preservado || 0;
    }

    await AppConfig.findOneAndUpdate(
      { chave:ITEMS_CATALOG_KEY },
      { $set:{ migracaoEstado:'pronto', migracaoVersao:'1', migracaoEm:new Date(), atualizadoEm:new Date(), ultimoErro:'', relatorioMigracao:{ itensCatalogo:relatorio } } },
      { upsert:true, setDefaultsOnInsert:true },
    );
    return { ok:true, ignorada:false, ...relatorio };
  } catch (err) {
    await AppConfig.findOneAndUpdate(
      { chave:ITEMS_CATALOG_KEY },
      { $set:{ migracaoEstado:'erro', ultimoErro:err.message, atualizadoEm:new Date() } },
      { upsert:true, setDefaultsOnInsert:true },
    ).catch(()=>{});
    return { ok:false, erro:err.message, inseridas:0, completadas:0, preservadas:0 };
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


async function migrarCampanhaLago() {
  const aplicado = await AppConfig.findOne({ chave:CAMPANHA_LAGO_KEY }).lean();
  if (aplicado?.migracaoEstado === 'pronto') return { ok:true, ignorada:true, inseridas:0, completadas:0, preservadas:0 };

  await AppConfig.findOneAndUpdate(
    { chave:CAMPANHA_LAGO_KEY },
    { $set:{ migracaoEstado:'executando', migracaoVersao:'1', ultimoErro:'', atualizadoEm:new Date() } },
    { upsert:true, setDefaultsOnInsert:true },
  );

  try {
    await garantirIndiceCampanhaPorSubtipo();
    const relatorio = { inseridas:0, completadas:0, preservadas:0 };
    for (const seed of LAGO_SEED) {
      const r = await mesclarSeed(CampanhaLocal, { slug:seed.slug }, seed, {
        mergeArrays:{ tropas:'nome', recursos:'tipo', recompensas:'codigo' },
      });
      relatorio.inseridas += r.inserido || 0;
      relatorio.completadas += r.completado || 0;
      relatorio.preservadas += r.preservado || 0;
    }
    await AppConfig.findOneAndUpdate(
      { chave:CAMPANHA_LAGO_KEY },
      { $set:{ migracaoEstado:'pronto', migracaoVersao:'1', migracaoEm:new Date(), atualizadoEm:new Date(), ultimoErro:'', relatorioMigracao:{ lago:relatorio } } },
      { upsert:true, setDefaultsOnInsert:true },
    );
    return { ok:true, ignorada:false, ...relatorio };
  } catch (err) {
    await AppConfig.findOneAndUpdate({ chave:CAMPANHA_LAGO_KEY }, { $set:{ migracaoEstado:'erro', ultimoErro:err.message, atualizadoEm:new Date() } }, { upsert:true, setDefaultsOnInsert:true }).catch(()=>{});
    return { ok:false, erro:err.message, inseridas:0, completadas:0, preservadas:0 };
  }
}



async function migrarCampanhaFloresta() {
  const aplicado = await AppConfig.findOne({ chave:CAMPANHA_FLORESTA_KEY }).lean();
  if (aplicado?.migracaoEstado === 'pronto') return { ok:true, ignorada:true, inseridas:0, completadas:0, preservadas:0 };

  await AppConfig.findOneAndUpdate(
    { chave:CAMPANHA_FLORESTA_KEY },
    { $set:{ migracaoEstado:'executando', migracaoVersao:'1', ultimoErro:'', atualizadoEm:new Date() } },
    { upsert:true, setDefaultsOnInsert:true },
  );

  try {
    await garantirIndiceCampanhaPorSubtipo();
    const relatorio = { inseridas:0, completadas:0, preservadas:0 };
    for (const seed of FLORESTA_SEED) {
      const r = await mesclarSeed(CampanhaLocal, { slug:seed.slug }, seed, {
        mergeArrays:{ tropas:'nome', recursos:'tipo', recompensas:'codigo' },
      });
      relatorio.inseridas += r.inserido || 0;
      relatorio.completadas += r.completado || 0;
      relatorio.preservadas += r.preservado || 0;
    }
    await AppConfig.findOneAndUpdate(
      { chave:CAMPANHA_FLORESTA_KEY },
      { $set:{ migracaoEstado:'pronto', migracaoVersao:'1', migracaoEm:new Date(), atualizadoEm:new Date(), ultimoErro:'', relatorioMigracao:{ floresta:relatorio } } },
      { upsert:true, setDefaultsOnInsert:true },
    );
    return { ok:true, ignorada:false, ...relatorio };
  } catch (err) {
    await AppConfig.findOneAndUpdate({ chave:CAMPANHA_FLORESTA_KEY }, { $set:{ migracaoEstado:'erro', ultimoErro:err.message, atualizadoEm:new Date() } }, { upsert:true, setDefaultsOnInsert:true }).catch(()=>{});
    return { ok:false, erro:err.message, inseridas:0, completadas:0, preservadas:0 };
  }
}


async function migrarCampanhaMontanha() {
  const aplicado = await AppConfig.findOne({ chave:CAMPANHA_MONTANHA_KEY }).lean();
  if (aplicado?.migracaoEstado === 'pronto') return { ok:true, ignorada:true, inseridas:0, completadas:0, preservadas:0 };
  await AppConfig.findOneAndUpdate({ chave:CAMPANHA_MONTANHA_KEY }, { $set:{ migracaoEstado:'executando', migracaoVersao:'1', ultimoErro:'', atualizadoEm:new Date() } }, { upsert:true, setDefaultsOnInsert:true });
  try {
    await garantirIndiceCampanhaPorSubtipo();
    const relatorio={ inseridas:0, completadas:0, preservadas:0 };
    for (const seed of MONTANHA_SEED) {
      const r=await mesclarSeed(CampanhaLocal,{ slug:seed.slug },seed,{ mergeArrays:{ tropas:'nome', recursos:'tipo', recompensas:'codigo' } });
      relatorio.inseridas+=r.inserido||0; relatorio.completadas+=r.completado||0; relatorio.preservadas+=r.preservado||0;
    }
    await AppConfig.findOneAndUpdate({ chave:CAMPANHA_MONTANHA_KEY }, { $set:{ migracaoEstado:'pronto', migracaoVersao:'1', migracaoEm:new Date(), atualizadoEm:new Date(), ultimoErro:'', relatorioMigracao:{ montanha:relatorio } } }, { upsert:true, setDefaultsOnInsert:true });
    return { ok:true, ignorada:false, ...relatorio };
  } catch (err) { await AppConfig.findOneAndUpdate({ chave:CAMPANHA_MONTANHA_KEY }, { $set:{ migracaoEstado:'erro', ultimoErro:err.message, atualizadoEm:new Date() } }, { upsert:true, setDefaultsOnInsert:true }).catch(()=>{}); return { ok:false, erro:err.message, inseridas:0, completadas:0, preservadas:0 }; }
}

async function migrarCampanhaMorro() {
  const aplicado = await AppConfig.findOne({ chave:CAMPANHA_MORRO_KEY }).lean();
  if (aplicado?.migracaoEstado === 'pronto') return { ok:true, ignorada:true, inseridas:0, completadas:0, preservadas:0 };
  await AppConfig.findOneAndUpdate({ chave:CAMPANHA_MORRO_KEY }, { $set:{ migracaoEstado:'executando', migracaoVersao:'1', ultimoErro:'', atualizadoEm:new Date() } }, { upsert:true, setDefaultsOnInsert:true });
  try {
    await garantirIndiceCampanhaPorSubtipo();
    const relatorio={ inseridas:0, completadas:0, preservadas:0 };
    for (const seed of MORRO_SEED) {
      const r=await mesclarSeed(CampanhaLocal,{ slug:seed.slug },seed,{ mergeArrays:{ tropas:'nome', recursos:'tipo', recompensas:'codigo' } });
      relatorio.inseridas+=r.inserido||0; relatorio.completadas+=r.completado||0; relatorio.preservadas+=r.preservado||0;
    }
    await AppConfig.findOneAndUpdate({ chave:CAMPANHA_MORRO_KEY }, { $set:{ migracaoEstado:'pronto', migracaoVersao:'1', migracaoEm:new Date(), atualizadoEm:new Date(), ultimoErro:'', relatorioMigracao:{ morro:relatorio } } }, { upsert:true, setDefaultsOnInsert:true });
    return { ok:true, ignorada:false, ...relatorio };
  } catch (err) { await AppConfig.findOneAndUpdate({ chave:CAMPANHA_MORRO_KEY }, { $set:{ migracaoEstado:'erro', ultimoErro:err.message, atualizadoEm:new Date() } }, { upsert:true, setDefaultsOnInsert:true }).catch(()=>{}); return { ok:false, erro:err.message, inseridas:0, completadas:0, preservadas:0 }; }
}


async function migrarCampanhaSavanaRecompensasConfirmadas() {
  const aplicado = await AppConfig.findOne({ chave:CAMPANHA_SAVANA_REWARDS_KEY }).lean();
  if (aplicado?.migracaoEstado === 'pronto') return { ok:true, ignorada:true, atualizadas:0, inseridas:0 };

  await AppConfig.findOneAndUpdate(
    { chave:CAMPANHA_SAVANA_REWARDS_KEY },
    { $set:{ migracaoEstado:'executando', migracaoVersao:'1', ultimoErro:'', atualizadoEm:new Date() } },
    { upsert:true, setDefaultsOnInsert:true },
  );

  try {
    await garantirIndiceCampanhaPorSubtipo();
    let atualizadas = 0;
    let inseridas = 0;
    for (const seed of SAVANA_SEED) {
      const atual = await CampanhaLocal.findOne({ slug:seed.slug }).lean();
      if (!atual) {
        await CampanhaLocal.create(seed);
        inseridas += 1;
        continue;
      }

      const codigosOficiais = new Set(seed.recompensas.map(x => x.codigo));
      const personalizadas = (atual.recompensas || []).filter(x => !codigosOficiais.has(x.codigo));
      await CampanhaLocal.updateOne(
        { slug:seed.slug },
        { $set:{
          recompensas:[...seed.recompensas, ...personalizadas],
          recompensasStatus:seed.recompensasStatus,
          fonte:seed.fonte,
          atualizadoEm:new Date(),
        } },
      );
      atualizadas += 1;
    }

    await AppConfig.findOneAndUpdate(
      { chave:CAMPANHA_SAVANA_REWARDS_KEY },
      { $set:{ migracaoEstado:'pronto', migracaoVersao:'1', migracaoEm:new Date(), atualizadoEm:new Date(), ultimoErro:'', relatorioMigracao:{ savanaRecompensas:{ atualizadas, inseridas } } } },
      { upsert:true, setDefaultsOnInsert:true },
    );
    return { ok:true, ignorada:false, atualizadas, inseridas };
  } catch (err) {
    await AppConfig.findOneAndUpdate(
      { chave:CAMPANHA_SAVANA_REWARDS_KEY },
      { $set:{ migracaoEstado:'erro', ultimoErro:err.message, atualizadoEm:new Date() } },
      { upsert:true, setDefaultsOnInsert:true },
    ).catch(()=>{});
    return { ok:false, erro:err.message, atualizadas:0, inseridas:0 };
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


async function migrarCampanhaEstrategiasPolidas() {
  const aplicado = await AppConfig.findOne({ chave:CAMPANHA_STRATEGY_POLISH_KEY }).lean();
  if (aplicado?.migracaoEstado === 'pronto') return { ok:true, ignorada:true, atualizadas:0, guias:0 };

  await AppConfig.findOneAndUpdate(
    { chave:CAMPANHA_STRATEGY_POLISH_KEY },
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
      const personalizados = (atual.guiasAtaque || []).filter(x => !codigosOficiais.has(x.codigo));
      await CampanhaLocal.updateOne(
        { slug:seed.slug },
        { $set:{ guiasAtaque:[...oficiais, ...personalizados], atualizadoEm:new Date() } },
      );
      atualizadas += 1;
      guias += oficiais.length;
    }
    await AppConfig.findOneAndUpdate(
      { chave:CAMPANHA_STRATEGY_POLISH_KEY },
      { $set:{ migracaoEstado:'pronto', migracaoVersao:'1', migracaoEm:new Date(), atualizadoEm:new Date(), ultimoErro:'', relatorioMigracao:{ estrategiasPolidas:{ atualizadas, guias } } } },
      { upsert:true, setDefaultsOnInsert:true },
    );
    return { ok:true, ignorada:false, atualizadas, guias };
  } catch (err) {
    await AppConfig.findOneAndUpdate(
      { chave:CAMPANHA_STRATEGY_POLISH_KEY },
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


async function executarMigracao264(chave, relatorioNome, executor) {
  const aplicado = await AppConfig.findOne({ chave }).lean();
  if (aplicado?.migracaoEstado === 'pronto') return { ok:true, ignorada:true, atualizadas:0, inseridas:0 };
  await AppConfig.findOneAndUpdate(
    { chave },
    { $set:{ migracaoEstado:'executando', migracaoVersao:'1', ultimoErro:'', atualizadoEm:new Date() } },
    { upsert:true, setDefaultsOnInsert:true },
  );
  try {
    const relatorio = await executor();
    await AppConfig.findOneAndUpdate(
      { chave },
      { $set:{ migracaoEstado:'pronto', migracaoVersao:'1', migracaoEm:new Date(), atualizadoEm:new Date(), ultimoErro:'', relatorioMigracao:{ [relatorioNome]:relatorio } } },
      { upsert:true, setDefaultsOnInsert:true },
    );
    return { ok:true, ignorada:false, ...relatorio };
  } catch (err) {
    await AppConfig.findOneAndUpdate(
      { chave },
      { $set:{ migracaoEstado:'erro', ultimoErro:err.message, atualizadoEm:new Date() } },
      { upsert:true, setDefaultsOnInsert:true },
    ).catch(()=>{});
    return { ok:false, erro:err.message, atualizadas:0, inseridas:0 };
  }
}

async function migrarCampanhaAntroposRecomendacoes264() {
  return executarMigracao264(CAMPANHA_ANTROPOS_RECOMMENDATIONS_264_KEY, 'antroposRecomendacoes264', async () => {
    let atualizadas = 0;
    let inseridas = 0;
    for (const seed of ANTROPOS_SEED) {
      const atual = await CampanhaLocal.findOne({ slug:seed.slug }).lean();
      if (!atual) {
        await CampanhaLocal.create(seed);
        inseridas += 1;
        continue;
      }
      await CampanhaLocal.updateOne(
        { slug:seed.slug },
        { $set:{
          guiasAtaque:seed.guiasAtaque,
          tropas:seed.tropas,
          recursos:seed.recursos,
          i18n:seed.i18n || {},
          atualizadoEm:new Date(),
        } },
      );
      atualizadas += 1;
    }
    return { atualizadas, inseridas };
  });
}

async function migrarCampanhaCamposCaptura264() {
  return executarMigracao264(CAMPANHA_FIELDS_CAPTURE_SYNC_264_KEY, 'camposCaptura264', async () => {
    await garantirIndiceCampanhaPorSubtipo();
    const seeds = [SAVANA_SEED, LAGO_SEED, FLORESTA_SEED, MONTANHA_SEED, MORRO_SEED].flat();
    let atualizadas = 0;
    let inseridas = 0;
    for (const seed of seeds) {
      const atual = await CampanhaLocal.findOne({ slug:seed.slug }).lean();
      if (!atual) {
        await CampanhaLocal.create(seed);
        inseridas += 1;
        continue;
      }
      await CampanhaLocal.updateOne(
        { slug:seed.slug },
        { $set:{
          nome:seed.nome,
          tropas:seed.tropas,
          recursos:seed.recursos,
          recompensas:seed.recompensas,
          recompensasStatus:seed.recompensasStatus,
          tags:seed.tags || [],
          campo:seed.campo,
          fonte:seed.fonte,
          i18n:seed.i18n || {},
          atualizadoEm:new Date(),
        } },
      );
      atualizadas += 1;
    }
    return { atualizadas, inseridas };
  });
}

async function migrarDragoesCaptura264() {
  return executarMigracao264(DRAGON_CAPTURE_SYNC_264_KEY, 'dragoesCaptura264', async () => {
    let atualizadas = 0;
    let inseridas = 0;
    for (const seed of DRAGOES_SEED) {
      const slug = seed.id;
      const atual = await Dragao.findOne({ slug }).lean();
      if (!atual) {
        const { id, ...rest } = seed;
        await Dragao.create({ slug, ...rest });
        inseridas += 1;
        continue;
      }
      await Dragao.updateOne(
        { slug },
        { $set:{
          nome:seed.nome,
          elemento:seed.elemento,
          imagem:seed.imagem,
          obtencao:seed.obtencao,
          i18n:seed.i18n || {},
          atualizadoEm:new Date(),
        } },
      );
      atualizadas += 1;
    }
    return { atualizadas, inseridas };
  });
}

async function migrarTutoriais264() {
  return executarMigracao264(TUTORIALS_264_KEY, 'tutoriais264', async () => {
    const slugs = ['guia-inicial-construcoes', 'tutorial-atacar-antropos', 'tutorial-capturar-dragoes'];
    let atualizadas = 0;
    let inseridas = 0;
    for (const slug of slugs) {
      const seed = DICAS_SEED.find(item => item.slug === slug);
      if (!seed) throw new Error(`Seed da dica ${slug} não encontrada.`);
      const atual = await Dica.findOne({ slug }).lean();
      if (!atual) {
        await Dica.create(seed);
        inseridas += 1;
        continue;
      }
      await Dica.updateOne(
        { slug },
        { $set:{
          titulo:seed.titulo,
          resumo:seed.resumo,
          categoria:seed.categoria,
          tipo:seed.tipo,
          leituraMin:seed.leituraMin,
          destaque:seed.destaque,
          ativo:seed.ativo,
          ordem:seed.ordem,
          relacionados:seed.relacionados,
          conteudo:seed.conteudo,
          i18n:seed.i18n,
          atualizadoEm:new Date(),
        } },
      );
      atualizadas += 1;
    }
    return { atualizadas, inseridas };
  });
}


async function migrarCampanhaGrodz265() {
  return executarMigracao264(CAMPANHA_GRODZ_265_KEY, 'campanhaGrodz265', async () => {
    let atualizadas = 0;
    let inseridas = 0;
    for (const seed of GRODZ_SEED) {
      const atual = await CampanhaLocal.findOne({ slug:seed.slug }).lean();
      if (!atual) {
        await CampanhaLocal.create(seed);
        inseridas += 1;
        continue;
      }
      await CampanhaLocal.updateOne(
        { slug:seed.slug },
        { $set:{
          categoria:seed.categoria, nivel:seed.nivel, ordem:seed.ordem, nome:seed.nome, ativo:seed.ativo,
          tropas:seed.tropas, recompensas:seed.recompensas || [], recompensasStatus:seed.recompensasStatus || 'pendente',
          guiasAtaque:seed.guiasAtaque || [], grodz:seed.grodz || {}, fonte:seed.fonte, i18n:seed.i18n || {}, atualizadoEm:new Date(),
        } },
      );
      atualizadas += 1;
    }
    return { atualizadas, inseridas };
  });
}

async function migrarTutorialGrodz265() {
  return executarMigracao264(TUTORIAL_GRODZ_265_KEY, 'tutorialGrodz265', async () => {
    const seed = DICAS_SEED.find(item => item.slug === 'tutorial-campanha-grodz');
    if (!seed) throw new Error('Seed do tutorial Grodz não encontrada.');
    const atual = await Dica.findOne({ slug:seed.slug }).lean();
    if (!atual) { await Dica.create(seed); return { atualizadas:0, inseridas:1 }; }
    await Dica.updateOne({ slug:seed.slug }, { $set:{
      titulo:seed.titulo, resumo:seed.resumo, categoria:seed.categoria, tipo:seed.tipo, leituraMin:seed.leituraMin,
      destaque:seed.destaque, ativo:seed.ativo, ordem:seed.ordem, relacionados:seed.relacionados,
      conteudo:seed.conteudo, i18n:seed.i18n, atualizadoEm:new Date(),
    } });
    return { atualizadas:1, inseridas:0 };
  });
}

async function migrarPergaminhoDevastar265() {
  return executarMigracao264(ITEM_DEVASTAR_265_KEY, 'itemDevastar265', async () => {
    const seed = ITEM_SCREENSHOT_CATALOG.find(item => item.slug === 'pergaminho-devastar');
    if (!seed) throw new Error('Seed do Pergaminho Devastar não encontrada.');
    const atual = await Item.findOne({ slug:seed.slug }).lean();
    if (!atual) { await Item.create(seed); return { atualizadas:0, inseridas:1 }; }
    await Item.updateOne({ slug:seed.slug }, { $set:{
      nome:seed.nome, grupo:seed.grupo, categoria:seed.categoria, preco:seed.preco, ordem:seed.ordem,
      descricao:seed.descricao, origem:seed.origem, uso:seed.uso, limites:seed.limites, tags:seed.tags || [],
      i18n:seed.i18n || {}, atualizadoEm:new Date(),
    } });
    return { atualizadas:1, inseridas:0 };
  });
}

export async function executarMigracoesConteudo() {
  const dicas = await migrarDicas();
  if (!dicas.ok) return dicas;
  const guiaInicioRealm = await migrarGuiaInicioRealm();
  if (!guiaInicioRealm.ok) return guiaInicioRealm;
  const tutorialAntropos = await migrarTutorialAntropos();
  if (!tutorialAntropos.ok) return tutorialAntropos;
  const tropas = await migrarTropasTaticas();
  if (!tropas.ok) return tropas;
  const tropasCombate = await migrarEvidenciasCombateTropas();
  if (!tropasCombate.ok) return tropasCombate;
  const itensCatalogo = await migrarCatalogoItens();
  if (!itensCatalogo.ok) return itensCatalogo;
  const campanha = await migrarCampanhaAntropos();
  if (!campanha.ok) return campanha;
  const campos = await migrarCampanhaCampos();
  if (!campos.ok) return campos;
  const lago = await migrarCampanhaLago();
  if (!lago.ok) return lago;
  const floresta = await migrarCampanhaFloresta();
  if (!floresta.ok) return floresta;
  const montanha = await migrarCampanhaMontanha();
  if (!montanha.ok) return montanha;
  const morro = await migrarCampanhaMorro();
  if (!morro.ok) return morro;
  const savanaRecompensas = await migrarCampanhaSavanaRecompensasConfirmadas();
  if (!savanaRecompensas.ok) return savanaRecompensas;
  const estrategias = await migrarCampanhaEstrategias();
  if (!estrategias.ok) return estrategias;
  const estrategiasConfirmadas = await migrarCampanhaEstrategiasConfirmadas();
  if (!estrategiasConfirmadas.ok) return estrategiasConfirmadas;
  const estrategiasPolidas = await migrarCampanhaEstrategiasPolidas();
  if (!estrategiasPolidas.ok) return estrategiasPolidas;
  const recompensas = await migrarCampanhaRecompensas();
  if (!recompensas.ok) return recompensas;
  const antropos264 = await migrarCampanhaAntroposRecomendacoes264();
  if (!antropos264.ok) return antropos264;
  const campos264 = await migrarCampanhaCamposCaptura264();
  if (!campos264.ok) return campos264;
  const dragoes264 = await migrarDragoesCaptura264();
  if (!dragoes264.ok) return dragoes264;
  const tutoriais264 = await migrarTutoriais264();
  if (!tutoriais264.ok) return tutoriais264;
  const grodz265 = await migrarCampanhaGrodz265();
  if (!grodz265.ok) return grodz265;
  const tutorialGrodz265 = await migrarTutorialGrodz265();
  if (!tutorialGrodz265.ok) return tutorialGrodz265;
  const itemDevastar265 = await migrarPergaminhoDevastar265();
  if (!itemDevastar265.ok) return itemDevastar265;
  return {
    ok:true,
    ignorada:Boolean(dicas.ignorada && guiaInicioRealm.ignorada && tutorialAntropos.ignorada && tropas.ignorada && tropasCombate.ignorada && itensCatalogo.ignorada && campanha.ignorada && campos.ignorada && lago.ignorada && floresta.ignorada && montanha.ignorada && morro.ignorada && savanaRecompensas.ignorada && estrategias.ignorada && estrategiasConfirmadas.ignorada && estrategiasPolidas.ignorada && recompensas.ignorada && antropos264.ignorada && campos264.ignorada && dragoes264.ignorada && tutoriais264.ignorada && grodz265.ignorada && tutorialGrodz265.ignorada && itemDevastar265.ignorada),
    inseridas:dicas.inseridas || 0,
    adaptadas:dicas.adaptadas || 0,
    guiaInicioRealmAtualizado:guiaInicioRealm.atualizadas || 0,
    tutorialAntroposAtualizado:tutorialAntropos.atualizadas || 0,
    tropasAtualizadas:(tropas.atualizadas || 0) + (tropasCombate.atualizadas || 0),
    itensInseridos:itensCatalogo.inseridas || 0,
    itensCompletados:itensCatalogo.completadas || 0,
    campanhaInseridas:(campanha.inseridas || 0) + (campos.inseridas || 0) + (lago.inseridas || 0) + (floresta.inseridas || 0) + (montanha.inseridas || 0) + (morro.inseridas || 0) + (savanaRecompensas.inseridas || 0),
    campanhaCompletadas:(campanha.completadas || 0) + (campos.completadas || 0) + (lago.completadas || 0) + (floresta.completadas || 0) + (montanha.completadas || 0) + (morro.completadas || 0) + (savanaRecompensas.atualizadas || 0) + (estrategias.completadas || 0) + (estrategiasConfirmadas.atualizadas || 0) + (estrategiasPolidas.atualizadas || 0) + (recompensas.completadas || 0) + (antropos264.atualizadas || 0) + (campos264.atualizadas || 0) + (grodz265.atualizadas || 0),
    dragoesCapturaAtualizados:(dragoes264.atualizadas || 0) + (dragoes264.inseridas || 0),
    tutoriaisAtualizados:(tutoriais264.atualizadas || 0) + (tutoriais264.inseridas || 0) + (tutorialGrodz265.atualizadas || 0) + (tutorialGrodz265.inseridas || 0),
    grodzInseridos:grodz265.inseridas || 0,
    itemDevastarAtualizado:(itemDevastar265.atualizadas || 0) + (itemDevastar265.inseridas || 0),
  };
}
