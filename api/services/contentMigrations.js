import AppConfig from '../models/AppConfig.js';
import CategoriaDica from '../models/CategoriaDica.js';
import Dica from '../models/Dica.js';
import Tropa from '../models/Tropa.js';
import Item from '../models/Item.js';
import CampanhaLocal from '../models/CampanhaLocal.js';
import Dragao from '../models/Dragao.js';
import Edificio from '../models/Edificio.js';
import Evento from '../models/Evento.js';
import Reino from '../models/Reino.js';
import ReinoFusao from '../models/ReinoFusao.js';
import { DICAS_SEED } from '../seeds/dicas.js';
import { tacticalMetadata } from '../seeds/tropasTaticas.js';
import { TROOP_COMBAT_EVIDENCE } from '../seeds/tropasCombate.js';
import { ITEM_SCREENSHOT_CATALOG } from '../seeds/itensCatalogo.js';
import { ANTROPOS_SEED, SAVANA_SEED, LAGO_SEED, FLORESTA_SEED, MONTANHA_SEED, MORRO_SEED, GRODZ_SEED, ZYRVORTHIAN_SEED } from '../seeds/campanha.js';
import { DRAGOES_SEED } from '../seeds/dragoes.js';
import { TODAS_TROPAS } from '../seeds/core.js';
import { EDIFICIOS_ESPECIAIS } from '../seeds/edificiosEspeciais.js';
import { EVENTOS_SEED } from '../seeds/eventos.js';
import { REINOS_SEED } from '../seeds/reinos.js';
import { mesclarSeed } from '../utils/seedMerge.js';
import { normalizarEventoPayload } from '../utils/eventos.js';
import { slugifyReino } from '../utils/reinos.js';

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
const CAMPANHA_GRODZ_266_KEY = 'content:campanha-grodz:beta-2.66';
const TUTORIAL_GRODZ_266_KEY = 'content:dicas-grodz:beta-2.66';
const ITEM_DEVASTAR_266_KEY = 'content:item-pergaminho-devastar:beta-2.66';
const EDIFICIOS_ESPECIAIS_267_KEY = 'content:edificios-especiais:beta-2.67';
const DRAGOES_CATALOGO_268_KEY = 'content:dragoes-catalogo:beta-2.68';
const TROPAS_I18N_268_KEY = 'content:tropas-i18n:beta-2.68';
const CAMPANHA_EN_XP_268_KEY = 'content:campanha-en-xp:beta-2.68';
const TUTORIALS_EN_268_KEY = 'content:tutoriais-en:beta-2.68';
const EVENTOS_270_KEY = 'content:eventos:beta-2.70';
const EVENTOS_REINOS_271_KEY = 'content:eventos-reinos:beta-2.71';
const EVENTOS_REINOS_272_KEY = 'content:eventos-reinos:beta-2.72';
const CAMPANHA_ZYRVORTHIAN_275_KEY = 'content:campanha-zyrvorthian:beta-2.75';
const ITENS_DEFESA_ZYRVORTHIAN_275_KEY = 'content:itens-defesa-zyrvorthian:beta-2.75';
const TUTORIAL_DEFESA_275_KEY = 'content:dica-defesa-inimigos:beta-2.75';
const DRAGAO_AGUA_PAZ_275_KEY = 'content:dragao-agua-paz:beta-2.75';
const DRAGOES_NIVEIS_276_KEY = 'content:dragoes-niveis:beta-2.76';


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


async function migrarCampanhaGrodz266() {
  return executarMigracao264(CAMPANHA_GRODZ_266_KEY, 'campanhaGrodz266', async () => {
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

async function migrarTutoriaisGrodz266() {
  return executarMigracao264(TUTORIAL_GRODZ_266_KEY, 'tutoriaisGrodz266', async () => {
    const slugs = ['tutorial-campanha-grodz', 'guia-inicial-construcoes'];
    let atualizadas = 0;
    let inseridas = 0;
    for (const slug of slugs) {
      const seed = DICAS_SEED.find(item => item.slug === slug);
      if (!seed) throw new Error(`Seed da dica ${slug} não encontrada.`);
      const atual = await Dica.findOne({ slug:seed.slug }).lean();
      if (!atual) {
        await Dica.create(seed);
        inseridas += 1;
        continue;
      }
      await Dica.updateOne({ slug:seed.slug }, { $set:{
        titulo:seed.titulo, resumo:seed.resumo, categoria:seed.categoria, tipo:seed.tipo, leituraMin:seed.leituraMin,
        destaque:seed.destaque, ativo:seed.ativo, ordem:seed.ordem, relacionados:seed.relacionados,
        conteudo:seed.conteudo, i18n:seed.i18n, atualizadoEm:new Date(),
      } });
      atualizadas += 1;
    }
    return { atualizadas, inseridas };
  });
}

async function migrarTicketDevastar266() {
  return executarMigracao264(ITEM_DEVASTAR_266_KEY, 'ticketDevastar266', async () => {
    const seed = ITEM_SCREENSHOT_CATALOG.find(item => item.slug === 'pergaminho-devastar');
    if (!seed) throw new Error('Seed do Ticket de Campanha de Devastar não encontrada.');
    const atual = await Item.findOne({ slug:seed.slug }).lean();
    if (!atual) { await Item.create(seed); return { atualizadas:0, inseridas:1 }; }
    await Item.updateOne({ slug:seed.slug }, { $set:{
      nome:seed.nome, grupo:seed.grupo, categoria:seed.categoria, imagem:seed.imagem || '', preco:seed.preco || {}, ordem:seed.ordem,
      descricao:seed.descricao, origem:seed.origem, uso:seed.uso, limites:seed.limites, onde:seed.onde || '', tags:seed.tags || [],
      i18n:seed.i18n || {}, atualizadoEm:new Date(),
    } });
    return { atualizadas:1, inseridas:0 };
  });
}


async function migrarEdificiosEspeciais267() {
  return executarMigracao264(EDIFICIOS_ESPECIAIS_267_KEY, 'edificiosEspeciais267', async () => {
    let atualizadas = 0;
    let inseridas = 0;
    for (const seed of EDIFICIOS_ESPECIAIS) {
      const atual = await Edificio.findOne({ slug:seed.slug }).lean();
      if (!atual) {
        await Edificio.create(seed);
        inseridas += 1;
        continue;
      }
      await Edificio.updateOne({ slug:seed.slug }, { $set:{
        nome:seed.nome, icone:seed.icone, tag:seed.tag, descricao:seed.descricao, ordem:seed.ordem,
        grupo:seed.grupo, tipoModulo:seed.tipoModulo, imagem:seed.imagem, colunas:seed.colunas,
        niveis:seed.niveis, dadosEspeciais:seed.dadosEspeciais, i18n:seed.i18n || {}, atualizadoEm:new Date(),
      } });
      atualizadas += 1;
    }
    return { atualizadas, inseridas };
  });
}


async function migrarDragoesCatalogo268() {
  return executarMigracao264(DRAGOES_CATALOGO_268_KEY, 'dragoesCatalogo268', async () => {
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
      const niveisMap = new Map((atual.niveis || []).map(n => [Number(n.nivel), n]));
      for (const nivel of seed.niveis || []) niveisMap.set(Number(nivel.nivel), nivel);
      const niveis = [...niveisMap.values()].sort((a,b) => Number(a.nivel) - Number(b.nivel));
      const aliases = [...new Set([...(atual.aliases || []), ...(seed.aliases || [])].filter(Boolean))];
      await Dragao.updateOne({ slug }, { $set:{
        ordem:seed.ordem ?? 999, nome:seed.nome, aliases, elemento:seed.elemento, imagem:seed.imagem,
        obtencao:seed.obtencao, itensAlimentacao:seed.itensAlimentacao || [], i18n:seed.i18n || {},
        niveis, atualizadoEm:new Date(),
      } });
      atualizadas += 1;
    }
    return { atualizadas, inseridas };
  });
}

async function migrarTropasI18n268() {
  return executarMigracao264(TROPAS_I18N_268_KEY, 'tropasI18n268', async () => {
    let atualizadas = 0;
    let inseridas = 0;
    for (const seed of TODAS_TROPAS) {
      const atual = await Tropa.findOne({ nome:seed.nome }).lean();
      if (!atual) {
        await Tropa.create(seed);
        inseridas += 1;
        continue;
      }
      const aliases = [...new Set([...(atual.aliases || []), ...(seed.aliases || [])].filter(Boolean))];
      const i18n = { ...(atual.i18n || {}), ...(seed.i18n || {}) };
      await Tropa.updateOne({ nome:seed.nome }, { $set:{ aliases, i18n, atualizadoEm:new Date() } });
      atualizadas += 1;
    }
    return { atualizadas, inseridas };
  });
}

async function migrarCampanhaEnglishXp268() {
  return executarMigracao264(CAMPANHA_EN_XP_268_KEY, 'campanhaEnglishXp268', async () => {
    const seeds = [...SAVANA_SEED, ...LAGO_SEED, ...FLORESTA_SEED, ...MONTANHA_SEED, ...MORRO_SEED, ...GRODZ_SEED];
    let atualizadas = 0;
    let inseridas = 0;
    for (const seed of seeds) {
      const atual = await CampanhaLocal.findOne({ slug:seed.slug }).lean();
      if (!atual) {
        await CampanhaLocal.create(seed);
        inseridas += 1;
        continue;
      }
      await CampanhaLocal.updateOne({ slug:seed.slug }, { $set:{
        nome:seed.nome, tropas:seed.tropas || [], recompensas:seed.recompensas || [],
        recompensasStatus:seed.recompensasStatus || 'pendente', guiasAtaque:seed.guiasAtaque || [],
        grodz:seed.grodz || {}, campo:seed.campo || atual.campo || {}, fonte:seed.fonte, i18n:seed.i18n || {}, atualizadoEm:new Date(),
      } });
      atualizadas += 1;
    }
    return { atualizadas, inseridas };
  });
}


async function migrarTutoriaisEnglish268() {
  return executarMigracao264(TUTORIALS_EN_268_KEY, 'tutoriaisEnglish268', async () => {
    const slugs = ['tutorial-campanha-grodz', 'tutorial-capturar-dragoes'];
    let atualizadas = 0;
    let inseridas = 0;
    for (const slug of slugs) {
      const seed = DICAS_SEED.find(item => item.slug === slug);
      if (!seed) continue;
      const atual = await Dica.findOne({ slug }).lean();
      if (!atual) {
        await Dica.create(seed);
        inseridas += 1;
      } else {
        await Dica.updateOne({ slug }, { $set:{ i18n:seed.i18n || {}, relacionados:seed.relacionados || [], atualizadoEm:new Date() } });
        atualizadas += 1;
      }
    }
    return { atualizadas, inseridas };
  });
}


async function migrarEventos270() {
  return executarMigracao264(EVENTOS_270_KEY, 'eventos270', async () => {
    let atualizadas = 0;
    let inseridas = 0;
    for (const seed of EVENTOS_SEED) {
      const atual = await Evento.findOne({ slug:seed.slug }).lean();
      if (!atual) {
        await Evento.create(seed);
        inseridas += 1;
        continue;
      }
      // A migração 2.70 completa somente o cadastro inicial; depois o Admin é a fonte de verdade.
      const patch = {};
      for (const campo of ['nome','resumo','descricao','categoria','servidorFuso','horarioReset','fases','recompensas','regras','ocorrencias','fonte','i18n']) {
        const vazio = atual[campo] == null || atual[campo] === '' || (Array.isArray(atual[campo]) && atual[campo].length === 0);
        if (vazio && seed[campo] != null) patch[campo] = seed[campo];
      }
      if (Object.keys(patch).length) {
        patch.atualizadoEm = new Date();
        await Evento.updateOne({ slug:seed.slug }, { $set:patch });
        atualizadas += 1;
      }
    }
    return { atualizadas, inseridas };
  });
}


async function migrarEventosReinos271() {
  return executarMigracao264(EVENTOS_REINOS_271_KEY, 'eventosReinos271', async () => {
    let eventosAtualizados = 0;
    let reinosAtualizados = 0;
    let reinosInseridos = 0;
    let reinosRemovidos = 0;
    let fusoesAtualizadas = 0;

    // A listagem fornecida pelo usuário é a fonte canônica da Beta 2.71.
    // IDs antigos artificiais (1, 2, 3...) são remapeados pelo nome sem perder
    // horários, histórico ou traduções já cadastradas.
    const aliases = new Map([
      ['manre','mamre'], ['redforn','redfern'], ['siera','sierra'], ['solange','solace'],
    ]);
    const keyFor = value => aliases.get(slugifyReino(value)) || slugifyReino(value);
    const canonicalByKey = new Map(REINOS_SEED.map(seed => [keyFor(seed.nome), seed]));
    const canonicalById = new Map(REINOS_SEED.map(seed => [Number(seed.id), seed]));
    const canonicalIds = REINOS_SEED.map(seed => Number(seed.id));

    const existentesAntes = await Reino.find({}).lean();
    const oldIdToNewId = new Map();
    const existingByKey = new Map();
    for (const realm of existentesAntes) {
      const key = keyFor(realm.nome || realm.slug);
      if (!existingByKey.has(key)) existingByKey.set(key, realm);
      const canonical = canonicalByKey.get(key);
      if (canonical) oldIdToNewId.set(Number(realm.id), Number(canonical.id));
    }

    // Remove explicitamente o registro fictício e qualquer outro reino fora da
    // listagem canônica somente depois que o mapa de IDs antigos foi capturado.
    const extraIds = existentesAntes.filter(realm => !canonicalByKey.has(keyFor(realm.nome || realm.slug))).map(realm => realm._id);
    if (extraIds.length) {
      const removed = await Reino.deleteMany({ _id:{ $in:extraIds } });
      reinosRemovidos += removed.deletedCount || 0;
    }

    for (const seed of REINOS_SEED) {
      const key = keyFor(seed.nome);
      let atual = existingByKey.get(key) || null;
      if (atual && extraIds.some(id => String(id) === String(atual._id))) atual = null;
      if (!atual) atual = await Reino.findOne({ id:Number(seed.id) }).lean();

      const canonical = {
        id:Number(seed.id),
        slug:slugifyReino(seed.nome),
        nome:seed.nome,
        fuso:seed.fuso || '',
        tipoEspecial:seed.tipoEspecial || '',
        // Se a data foi confirmada no catálogo ela prevalece; caso contrário,
        // uma data previamente cadastrada pelo Admin é preservada.
        aberturaEm:seed.aberturaEm ? new Date(seed.aberturaEm) : (atual?.aberturaEm || null),
        status:atual?.status || '',
        horarios:atual?.horarios || { torneiosFim:'', zyrvorthian:'', batalhaDragao:'' },
        historico:atual?.historico || { status:'', observacoes:'' },
        i18n:atual?.i18n || {},
        atualizadoEm:new Date(),
      };

      if (atual?._id) {
        // Evita conflito de ID se uma instalação tiver criado manualmente o
        // número real em outro documento antes desta migração.
        const duplicate = await Reino.findOne({ id:canonical.id, _id:{ $ne:atual._id } }).lean();
        if (duplicate) {
          canonical.status = duplicate.status || canonical.status;
          canonical.horarios = duplicate.horarios || canonical.horarios;
          canonical.historico = duplicate.historico || canonical.historico;
          canonical.i18n = duplicate.i18n || canonical.i18n;
          if (!seed.aberturaEm && duplicate.aberturaEm) canonical.aberturaEm = duplicate.aberturaEm;
          await Reino.deleteOne({ _id:duplicate._id });
          reinosRemovidos += 1;
        }
        const result = await Reino.updateOne(
          { _id:atual._id },
          { $set:canonical, $unset:{ regiao:'', idioma:'' } },
        );
        reinosAtualizados += result.modifiedCount || 0;
      } else {
        await Reino.create(canonical);
        reinosInseridos += 1;
      }
    }

    // Garantia final: somente os 33 reinos informados permanecem no catálogo.
    const removedOutside = await Reino.deleteMany({ id:{ $nin:canonicalIds } });
    reinosRemovidos += removedOutside.deletedCount || 0;

    const realmDocs = await Reino.find({ id:{ $in:canonicalIds } }).lean();
    const realmById = new Map(realmDocs.map(realm => [Number(realm.id), realm]));

    // Se fusões reais já tiverem sido cadastradas, seus IDs acompanham o remapeamento.
    const fusoes = await ReinoFusao.find({}).lean();
    for (const fusao of fusoes) {
      const patch = {};
      for (const field of ['reinoOriginalId','reinoParceiroId','reinoResultanteId']) {
        const oldId = Number(fusao[field]);
        if (oldIdToNewId.has(oldId) && oldIdToNewId.get(oldId) !== oldId) patch[field] = oldIdToNewId.get(oldId);
      }
      if (Object.keys(patch).length) {
        patch.atualizadoEm = new Date();
        const result = await ReinoFusao.updateOne({ _id:fusao._id }, { $set:patch });
        fusoesAtualizadas += result.modifiedCount || 0;
      }
    }

    // Usa documentos brutos para conseguir normalizar regras legadas que eram
    // strings antes do novo schema e remapear ocorrências vinculadas a IDs locais.
    const raws = await Evento.collection.find({}).toArray();
    for (const raw of raws) {
      try {
        const base = { ...raw };
        if (!base.inicioServidor && base.ocorrencias?.[0]?.inicioServidor) base.inicioServidor = base.ocorrencias[0].inicioServidor;
        if (!base.fimServidor && base.ocorrencias?.[0]?.fimServidor) base.fimServidor = base.ocorrencias[0].fimServidor;
        if (Array.isArray(base.ocorrencias)) {
          base.ocorrencias = base.ocorrencias.map(occ => {
            const mappedId = oldIdToNewId.get(Number(occ.reinoId)) || Number(occ.reinoId);
            const realm = realmById.get(mappedId);
            return {
              ...occ,
              reinoId:mappedId,
              ...(realm ? { reinoNome:realm.nome, fusoReino:realm.fuso } : {}),
            };
          });
        }
        const normalized = normalizarEventoPayload(base);

        if (raw.slug === 'corrida-armamentista') {
          const existingById = new Map((normalized.ocorrencias || []).map(occ => [Number(occ.reinoId), occ]));
          const template = existingById.get(348) || normalized.ocorrencias?.[0];
          if (template) {
            normalized.ocorrencias = [345,346,347,348].flatMap(id => {
              const realm = realmById.get(id);
              if (!realm) return [];
              const existing = existingById.get(id);
              return [{
                ...(existing || template),
                codigo:existing?.codigo || `${raw.slug}-${id}`,
                reinoId:id,
                reinoNome:realm.nome,
                fusoReino:realm.fuso,
                confirmado:true,
                observacao:existing?.observacao || '',
              }];
            });
          }
        }

        const { _id, criadoEm, ...patch } = normalized;
        await Evento.collection.updateOne({ _id:raw._id }, { $set:patch });
        eventosAtualizados += 1;
      } catch (err) {
        // Compatibilidade acima de agressividade: um evento legado inconsistente
        // não é apagado nem sobrescrito por uma normalização incompleta.
        console.warn(`[migration beta-2.71] Evento ${raw.slug || raw._id} preservado sem normalização: ${err.message}`);
      }
    }

    return {
      atualizadas:eventosAtualizados + reinosAtualizados + reinosInseridos + reinosRemovidos + fusoesAtualizadas,
      eventosAtualizados,
      reinosAtualizados,
      reinosInseridos,
      reinosRemovidos,
      fusoesAtualizadas,
    };
  });
}


async function migrarEventosReinos272() {
  return executarMigracao264(EVENTOS_REINOS_272_KEY, 'eventosReinos272', async () => {
    let reinosAtualizados=0;
    let eventosAtualizados=0;

    // Datas de abertura: somente as 12 datas confirmadas permanecem preenchidas.
    // Qualquer data herdada nos demais reinos é removida para evitar idade fictícia.
    for (const seed of REINOS_SEED) {
      const horariosSeed=seed.horarios || {};
      const patch={
        aberturaEm:seed.aberturaEm ? new Date(seed.aberturaEm) : null,
        fuso:seed.fuso || '',
        tipoEspecial:seed.tipoEspecial || '',
        atualizadoEm:new Date(),
      };
      if (horariosSeed.zyrvorthian) patch['horarios.zyrvorthian']=horariosSeed.zyrvorthian;
      if (horariosSeed.batalhaDragao) patch['horarios.batalhaDragao']=horariosSeed.batalhaDragao;
      // torneiosFim só é alterado quando houver dado confirmado no seed.
      if (horariosSeed.torneiosFim) patch['horarios.torneiosFim']=horariosSeed.torneiosFim;
      const result=await Reino.updateOne({id:Number(seed.id)},{$set:patch,$unset:{regiao:'',idioma:''}});
      reinosAtualizados += result.modifiedCount || 0;
    }

    // A Corrida Armamentista é o evento confirmado desta revisão. Atualiza o
    // calendário, a ordem das fases, regras e links para calculadores, preservando
    // o histórico administrativo já existente quando houver.
    const seed=EVENTOS_SEED.find(item=>item.slug==='corrida-armamentista');
    if (seed) {
      const atual=await Evento.findOne({slug:seed.slug}).lean();
      if (!atual) {
        await Evento.create(seed);
        eventosAtualizados += 1;
      } else {
        const historico=Array.isArray(atual.historico)?atual.historico:[];
        const fonte={...(atual.fonte||{}),...(seed.fonte||{})};
        await Evento.updateOne({slug:seed.slug},{$set:{
          nome:seed.nome,resumo:seed.resumo,descricao:seed.descricao,categoria:seed.categoria,
          servidorFuso:'UTC',horarioReset:'00:00',inicioServidor:new Date(seed.inicioServidor),fimServidor:new Date(seed.fimServidor),
          ativo:true,fases:seed.fases,regras:seed.regras,recompensas:seed.recompensas,ocorrencias:seed.ocorrencias,
          i18n:seed.i18n,fonte,historico,atualizadoEm:new Date(),
        }});
        eventosAtualizados += 1;
      }
    }
    return { atualizadas:reinosAtualizados+eventosAtualizados,reinosAtualizados,eventosAtualizados };
  });
}


async function migrarCampanhaZyrvorthian275() {
  return executarMigracao264(CAMPANHA_ZYRVORTHIAN_275_KEY, 'campanhaZyrvorthian275', async () => {
    let atualizadas = 0;
    let inseridas = 0;
    for (const seed of ZYRVORTHIAN_SEED) {
      const atual = await CampanhaLocal.findOne({ slug:seed.slug }).lean();
      if (!atual) {
        await CampanhaLocal.create(seed);
        inseridas += 1;
        continue;
      }
      await CampanhaLocal.updateOne({ slug:seed.slug }, { $set:{
        categoria:seed.categoria, subtipo:seed.subtipo || '', nivel:null, ordem:seed.ordem, nome:seed.nome,
        ativo:seed.ativo !== false, tags:seed.tags || [], zyrvorthian:seed.zyrvorthian || {},
        fonte:seed.fonte || {}, i18n:seed.i18n || {}, atualizadoEm:new Date(),
      } });
      atualizadas += 1;
    }
    return { atualizadas, inseridas };
  });
}

async function migrarItensDefesaZyrvorthian275() {
  return executarMigracao264(ITENS_DEFESA_ZYRVORTHIAN_275_KEY, 'itensDefesaZyrvorthian275', async () => {
    const slugs = [
      'teleportador-sombrio','teleportador-direcionado','tratado-cessar-fogo','protecao-do-dragao','paz-do-dragao',
      'estilhaco-poeira-estelar-astrax','astrax-olho-do-vazio','pena-aetherion','garra-trovao-aetherion',
    ];
    let atualizadas = 0;
    let inseridas = 0;
    for (const slug of slugs) {
      const seed = ITEM_SCREENSHOT_CATALOG.find(item => item.slug === slug);
      if (!seed) throw new Error(`Seed do item ${slug} não encontrada.`);
      const atual = await Item.findOne({ slug }).lean();
      if (!atual) {
        await Item.create(seed);
        inseridas += 1;
        continue;
      }
      const { slug:seedSlug, ...patch } = seed;
      await Item.updateOne({ slug }, { $set:{ ...patch, atualizadoEm:new Date() } });
      atualizadas += 1;
    }
    return { atualizadas, inseridas };
  });
}

async function migrarTutorialDefesa275() {
  return executarMigracao264(TUTORIAL_DEFESA_275_KEY, 'tutorialDefesa275', async () => {
    const seed = DICAS_SEED.find(item => item.slug === 'tutorial-defesa-inimigos');
    if (!seed) throw new Error('Seed do tutorial de defesa não encontrada.');
    const atual = await Dica.findOne({ slug:seed.slug }).lean();
    if (!atual) { await Dica.create(seed); return { atualizadas:0, inseridas:1 }; }
    await Dica.updateOne({ slug:seed.slug }, { $set:{
      titulo:seed.titulo, resumo:seed.resumo, categoria:seed.categoria, tipo:seed.tipo, leituraMin:seed.leituraMin,
      destaque:seed.destaque, ativo:seed.ativo, ordem:seed.ordem, relacionados:seed.relacionados,
      conteudo:seed.conteudo, i18n:seed.i18n || {}, atualizadoEm:new Date(),
    } });
    return { atualizadas:1, inseridas:0 };
  });
}

async function migrarDragaoAguaPaz275() {
  return executarMigracao264(DRAGAO_AGUA_PAZ_275_KEY, 'dragaoAguaPaz275', async () => {
    const seed = DRAGOES_SEED.find(item => item.id === 'dragao_agua');
    if (!seed) throw new Error('Seed do Dragão da Água não encontrada.');
    const paz = (seed.habilidades || []).find(item => item.id === 'paz_do_dragao');
    if (!paz) throw new Error('Habilidade Paz do Dragão não encontrada no seed.');
    const atual = await Dragao.findOne({ slug:'dragao_agua' }).lean();
    if (!atual) {
      const { id, ...rest } = seed;
      await Dragao.create({ slug:id, ...rest });
      return { atualizadas:0, inseridas:1 };
    }
    const skills = Array.isArray(atual.habilidades) ? [...atual.habilidades] : [];
    const idx = skills.findIndex(item => item?.id === paz.id || item?.nome === paz.nome);
    if (idx >= 0) skills[idx] = { ...skills[idx], ...paz };
    else skills.push(paz);
    await Dragao.updateOne({ slug:'dragao_agua' }, { $set:{ habilidades:skills, atualizadoEm:new Date() } });
    return { atualizadas:1, inseridas:0 };
  });
}


async function migrarDragoesNiveis276() {
  return executarMigracao264(DRAGOES_NIVEIS_276_KEY, 'dragoesNiveis276', async () => {
    const slugs = ['dragao_fogo', 'dragao_terra', 'dragao_beladona'];
    let atualizadas = 0;
    let inseridas = 0;
    for (const slug of slugs) {
      const seed = DRAGOES_SEED.find(item => item.id === slug);
      if (!seed) throw new Error(`Seed do dragão ${slug} não encontrada.`);
      const atual = await Dragao.findOne({ slug }).lean();
      if (!atual) {
        const { id, ...rest } = seed;
        await Dragao.create({ slug:id, ...rest });
        inseridas += 1;
        continue;
      }
      await Dragao.updateOne(
        { slug },
        { $set:{ niveis:seed.niveis || [], atualizadoEm:new Date() } },
      );
      atualizadas += 1;
    }
    return { atualizadas, inseridas };
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
  const grodz266 = await migrarCampanhaGrodz266();
  if (!grodz266.ok) return grodz266;
  const tutoriaisGrodz266 = await migrarTutoriaisGrodz266();
  if (!tutoriaisGrodz266.ok) return tutoriaisGrodz266;
  const ticketDevastar266 = await migrarTicketDevastar266();
  if (!ticketDevastar266.ok) return ticketDevastar266;
  const edificiosEspeciais267 = await migrarEdificiosEspeciais267();
  if (!edificiosEspeciais267.ok) return edificiosEspeciais267;
  const dragoes268 = await migrarDragoesCatalogo268();
  if (!dragoes268.ok) return dragoes268;
  const tropas268 = await migrarTropasI18n268();
  if (!tropas268.ok) return tropas268;
  const campanha268 = await migrarCampanhaEnglishXp268();
  if (!campanha268.ok) return campanha268;
  const tutoriaisEn268 = await migrarTutoriaisEnglish268();
  if (!tutoriaisEn268.ok) return tutoriaisEn268;
  const eventos270 = await migrarEventos270();
  if (!eventos270.ok) return eventos270;
  const eventosReinos271 = await migrarEventosReinos271();
  if (!eventosReinos271.ok) return eventosReinos271;
  const eventosReinos272 = await migrarEventosReinos272();
  if (!eventosReinos272.ok) return eventosReinos272;
  const zyrvorthian275 = await migrarCampanhaZyrvorthian275();
  if (!zyrvorthian275.ok) return zyrvorthian275;
  const itensDefesa275 = await migrarItensDefesaZyrvorthian275();
  if (!itensDefesa275.ok) return itensDefesa275;
  const tutorialDefesa275 = await migrarTutorialDefesa275();
  if (!tutorialDefesa275.ok) return tutorialDefesa275;
  const dragaoAguaPaz275 = await migrarDragaoAguaPaz275();
  if (!dragaoAguaPaz275.ok) return dragaoAguaPaz275;
  const dragoesNiveis276 = await migrarDragoesNiveis276();
  if (!dragoesNiveis276.ok) return dragoesNiveis276;
  return {
    ok:true,
    ignorada:Boolean(dicas.ignorada && guiaInicioRealm.ignorada && tutorialAntropos.ignorada && tropas.ignorada && tropasCombate.ignorada && itensCatalogo.ignorada && campanha.ignorada && campos.ignorada && lago.ignorada && floresta.ignorada && montanha.ignorada && morro.ignorada && savanaRecompensas.ignorada && estrategias.ignorada && estrategiasConfirmadas.ignorada && estrategiasPolidas.ignorada && recompensas.ignorada && antropos264.ignorada && campos264.ignorada && dragoes264.ignorada && tutoriais264.ignorada && grodz266.ignorada && tutoriaisGrodz266.ignorada && ticketDevastar266.ignorada && edificiosEspeciais267.ignorada && dragoes268.ignorada && tropas268.ignorada && campanha268.ignorada && tutoriaisEn268.ignorada && eventos270.ignorada && eventosReinos271.ignorada && eventosReinos272.ignorada && zyrvorthian275.ignorada && itensDefesa275.ignorada && tutorialDefesa275.ignorada && dragaoAguaPaz275.ignorada && dragoesNiveis276.ignorada),
    inseridas:dicas.inseridas || 0,
    adaptadas:dicas.adaptadas || 0,
    guiaInicioRealmAtualizado:guiaInicioRealm.atualizadas || 0,
    tutorialAntroposAtualizado:tutorialAntropos.atualizadas || 0,
    tropasAtualizadas:(tropas.atualizadas || 0) + (tropasCombate.atualizadas || 0),
    itensInseridos:itensCatalogo.inseridas || 0,
    itensCompletados:itensCatalogo.completadas || 0,
    campanhaInseridas:(campanha.inseridas || 0) + (campos.inseridas || 0) + (lago.inseridas || 0) + (floresta.inseridas || 0) + (montanha.inseridas || 0) + (morro.inseridas || 0) + (savanaRecompensas.inseridas || 0),
    campanhaCompletadas:(campanha.completadas || 0) + (campos.completadas || 0) + (lago.completadas || 0) + (floresta.completadas || 0) + (montanha.completadas || 0) + (morro.completadas || 0) + (savanaRecompensas.atualizadas || 0) + (estrategias.completadas || 0) + (estrategiasConfirmadas.atualizadas || 0) + (estrategiasPolidas.atualizadas || 0) + (recompensas.completadas || 0) + (antropos264.atualizadas || 0) + (campos264.atualizadas || 0) + (grodz266.atualizadas || 0),
    dragoesCapturaAtualizados:(dragoes264.atualizadas || 0) + (dragoes264.inseridas || 0),
    tutoriaisAtualizados:(tutoriais264.atualizadas || 0) + (tutoriais264.inseridas || 0) + (tutoriaisGrodz266.atualizadas || 0) + (tutoriaisGrodz266.inseridas || 0),
    grodzInseridos:grodz266.inseridas || 0,
    itemDevastarAtualizado:(ticketDevastar266.atualizadas || 0) + (ticketDevastar266.inseridas || 0),
    edificiosEspeciaisAtualizados:(edificiosEspeciais267.atualizadas || 0) + (edificiosEspeciais267.inseridas || 0),
    dragoesCatalogoAtualizados:(dragoes268.atualizadas || 0) + (dragoes268.inseridas || 0),
    tropasI18nAtualizadas:(tropas268.atualizadas || 0) + (tropas268.inseridas || 0),
    campanha268Atualizada:(campanha268.atualizadas || 0) + (campanha268.inseridas || 0),
    tutoriaisEn268Atualizados:(tutoriaisEn268.atualizadas || 0) + (tutoriaisEn268.inseridas || 0),
    eventos270Atualizados:(eventos270.atualizadas || 0) + (eventos270.inseridas || 0),
    eventosReinos271Atualizados:eventosReinos271.atualizadas || 0,
    eventosReinos272Atualizados:eventosReinos272.atualizadas || 0,
    zyrvorthian275Atualizado:(zyrvorthian275.atualizadas || 0) + (zyrvorthian275.inseridas || 0),
    itensDefesa275Atualizados:(itensDefesa275.atualizadas || 0) + (itensDefesa275.inseridas || 0),
    tutorialDefesa275Atualizado:(tutorialDefesa275.atualizadas || 0) + (tutorialDefesa275.inseridas || 0),
    dragaoAguaPaz275Atualizado:(dragaoAguaPaz275.atualizadas || 0) + (dragaoAguaPaz275.inseridas || 0),
    dragoesNiveis276Atualizados:(dragoesNiveis276.atualizadas || 0) + (dragoesNiveis276.inseridas || 0),
  };
}
