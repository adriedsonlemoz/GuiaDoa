import AppConfig from '../models/AppConfig.js';
import CategoriaDica from '../models/CategoriaDica.js';
import Dica from '../models/Dica.js';
import { DICAS_SEED } from '../seeds/dicas.js';

const MIGRATION_KEY = 'content:dicas:beta-2.14';

const INICIANTE_CATEGORY = {
  slug: 'iniciante',
  label: 'Primeiros Passos',
  icon: '🧭',
  ordem: -10,
  ativo: true,
  i18n: { 'en-US': { label: 'Getting Started' } },
};

export async function executarMigracoesConteudo() {
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
