import { COLLECTION_PREFIX, COLLECTION_SUFFIXES, LEGACY_COLLECTION_PREFIX, collectionName } from '../config/database.js';

/**
 * Renomeia coleções antigas doa_* para o prefixo atual quando solicitado.
 * Nunca sobrescreve uma coleção de destino já existente.
 */
export async function migrarColecoesLegadas(db, { logger = console } = {}) {
  if (!db || COLLECTION_PREFIX === LEGACY_COLLECTION_PREFIX) {
    return { migradas: [], ignoradas: [], conflitos: [] };
  }

  const existentes = new Set((await db.listCollections({}, { nameOnly: true }).toArray()).map(c => c.name));
  const resultado = { migradas: [], ignoradas: [], conflitos: [] };

  for (const sufixo of COLLECTION_SUFFIXES) {
    const origem = `${LEGACY_COLLECTION_PREFIX}${sufixo}`;
    const destino = collectionName(sufixo);

    if (!existentes.has(origem)) {
      resultado.ignoradas.push(origem);
      continue;
    }
    if (existentes.has(destino)) {
      resultado.conflitos.push({ origem, destino });
      logger.warn?.(`⚠️  Migração ignorada: ${origem} e ${destino} já existem.`);
      continue;
    }

    await db.collection(origem).rename(destino);
    existentes.delete(origem);
    existentes.add(destino);
    resultado.migradas.push({ origem, destino });
    logger.log?.(`✅  Coleção migrada: ${origem} → ${destino}`);
  }

  return resultado;
}
