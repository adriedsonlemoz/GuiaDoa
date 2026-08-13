import AppConfig from '../models/AppConfig.js';
import CategoriaDica from '../models/CategoriaDica.js';
import Dica from '../models/Dica.js';
import Tropa from '../models/Tropa.js';
import { DICAS_SEED } from '../seeds/dicas.js';
import { tacticalMetadata } from '../seeds/tropasTaticas.js';

const MIGRATION_KEY = 'content:dicas:beta-2.14';
const TROOPS_TACTICAL_KEY = 'content:tropas-taticas:beta-2.15';

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

export async function executarMigracoesConteudo() {
  const dicas = await migrarDicas();
  if (!dicas.ok) return dicas;
  const tropas = await migrarTropasTaticas();
  if (!tropas.ok) return tropas;
  return {
    ok:true,
    ignorada:Boolean(dicas.ignorada && tropas.ignorada),
    inseridas:dicas.inseridas || 0,
    adaptadas:dicas.adaptadas || 0,
    tropasAtualizadas:tropas.atualizadas || 0,
  };
}
