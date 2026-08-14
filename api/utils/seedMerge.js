function valorAusente(valor, seed) {
  if (valor === undefined || valor === null) return true;
  if (typeof valor === 'string' && valor.trim() === '' && String(seed || '').trim() !== '') return true;
  if (Array.isArray(valor) && valor.length === 0 && Array.isArray(seed) && seed.length > 0) return true;
  if (valor && typeof valor === 'object' && !Array.isArray(valor) && Object.keys(valor).length === 0 && seed && typeof seed === 'object' && Object.keys(seed).length > 0) return true;
  return false;
}

async function obterLean(Model, filtro) {
  const query = Model.findOne(filtro);
  return typeof query?.lean === 'function' ? query.lean() : query;
}

export function mesclarArrayObjetos(existente = [], seed = [], chave) {
  if (!Array.isArray(seed) || !chave) return existente;
  const base = Array.isArray(existente) ? existente : [];
  const porChave = new Map(base.map(item => [String(item?.[chave]), item]));
  let mudou = !Array.isArray(existente) && seed.length > 0;
  const resultado = base.map(item => ({ ...item }));
  const posicoes = new Map(resultado.map((item, i) => [String(item?.[chave]), i]));

  for (const seedItem of seed) {
    const k = String(seedItem?.[chave]);
    const atual = porChave.get(k);
    if (!atual) {
      resultado.push(seedItem);
      mudou = true;
      continue;
    }
    const combinado = { ...atual };
    for (const [campo, valor] of Object.entries(seedItem)) {
      if (valorAusente(atual[campo], valor)) { combinado[campo] = valor; mudou = true; }
    }
    resultado[posicoes.get(k)] = combinado;
  }

  return mudou ? resultado : base;
}

/** Insere se ausente; se já existir, preenche somente campos vazios. Nunca apaga edição existente. */
export async function mesclarSeed(Model, filtro, seed, { mergeArrays = {} } = {}) {
  const existente = await obterLean(Model, filtro);
  if (!existente) {
    await Model.create(seed);
    return { inserido: 1, completado: 0, preservado: 0 };
  }

  const patch = {};
  for (const [campo, valor] of Object.entries(seed)) {
    if (['_id', '__v', 'criadoEm', 'atualizadoEm'].includes(campo)) continue;
    if (mergeArrays[campo] && Array.isArray(valor)) {
      const combinado = mesclarArrayObjetos(existente[campo], valor, mergeArrays[campo]);
      if (combinado !== existente[campo]) patch[campo] = combinado;
      continue;
    }
    if (valorAusente(existente[campo], valor)) patch[campo] = valor;
  }

  if (Object.keys(patch).length) {
    patch.atualizadoEm = new Date();
    await Model.updateOne(filtro, { $set: patch });
    return { inserido: 0, completado: 1, preservado: 0 };
  }
  return { inserido: 0, completado: 0, preservado: 1 };
}
