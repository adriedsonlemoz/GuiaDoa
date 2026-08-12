import { dbReinos } from '../../src/data/reinos.js';

export const IDS_REINOS_12_AGO_2026 = Object.freeze([345, 346, 347, 348]);

export function novosReinos12Ago2026() {
  return dbReinos.filter(r => IDS_REINOS_12_AGO_2026.includes(r.id)).sort((a, b) => a.id - b.id);
}

function slugify(nome = '') {
  return String(nome)
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '');
}

/**
 * Garante no MongoDB os quatro Realms anunciados para 12/08/2026.
 * É idempotente: usa o ID oficial como chave e nunca duplica registros.
 * Região/idioma só recebem valor no insert, para não apagar ajustes feitos no Admin.
 */
export async function garantirNovosReinos({ model, agora = () => new Date() } = {}) {
  if (!model) throw new Error('Model de Reino é obrigatório para executar o seed.');
  const resultados = [];

  for (const reino of novosReinos12Ago2026()) {
    const slug = slugify(reino.nome);
    const consulta = model.findOne({ id: reino.id });
    const antes = typeof consulta?.lean === 'function' ? await consulta.lean() : await consulta;

    await model.findOneAndUpdate(
      { id: reino.id },
      {
        $set: {
          slug,
          nome: reino.nome,
          fuso: reino.fuso,
          atualizadoEm: agora(),
        },
        $setOnInsert: {
          regiao: reino.regiao || '',
          idioma: reino.idioma || '',
        },
      },
      { upsert: true, new: true, runValidators: true, setDefaultsOnInsert: true },
    );

    resultados.push({ id: reino.id, nome: reino.nome, acao: antes ? 'atualizado' : 'inserido' });
  }

  return {
    total: resultados.length,
    inseridos: resultados.filter(r => r.acao === 'inserido').length,
    atualizados: resultados.filter(r => r.acao === 'atualizado').length,
    resultados,
  };
}
