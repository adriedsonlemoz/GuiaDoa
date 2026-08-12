const MODULOS_BOOTSTRAP = [
  { id: 'tropas', label: 'Tropas', icon: '⚔️', model: 'Tropa', essencial: true },
  { id: 'niveis', label: 'Níveis', icon: '🏰', model: 'Nivel', essencial: true },
  { id: 'dragoes', label: 'Dragões', icon: '🐉', model: 'Dragao', essencial: true },
  { id: 'edificios', label: 'Edifícios', icon: '🏗️', model: 'Edificio', essencial: true },
  { id: 'pesquisas', label: 'Pesquisas', icon: '🔬', model: 'Pesquisa', essencial: true },
  { id: 'reinos', label: 'Reinos', icon: '🌍', model: 'Reino', essencial: true },
  { id: 'categoriasDicas', label: 'Categorias de dicas', icon: '💡', model: 'CategoriaDica', essencial: true },
  { id: 'itens', label: 'Itens', icon: '🎒', model: 'Item', essencial: false },
  { id: 'traducoes', label: 'Traduções', icon: '🌐', model: 'Traducao', essencial: false },
  { id: 'dicas', label: 'Dicas', icon: '📖', model: 'Dica', essencial: false },
];

async function buscarConfig(Model) {
  if (!Model?.findOne) return null;
  try {
    const q = Model.findOne({ chave: 'installation' });
    return typeof q?.lean === 'function' ? await q.lean() : await q;
  } catch { return null; }
}

export async function obterBootstrapStatus(models, { setupKeyObrigatoria = false } = {}) {
  const userModel = models.User;
  if (!userModel?.countDocuments) throw new Error('Model User não fornecido ao bootstrap.');

  const [totalUsuarios, config, ...contagens] = await Promise.all([
    userModel.countDocuments(),
    buscarConfig(models.AppConfig),
    ...MODULOS_BOOTSTRAP.map(({ model }) => {
      const Model = models[model];
      if (!Model?.countDocuments) return Promise.resolve(0);
      return Model.countDocuments();
    }),
  ]);

  const modulos = MODULOS_BOOTSTRAP.map((modulo, index) => ({
    id: modulo.id,
    label: modulo.label,
    icon: modulo.icon,
    total: Number(contagens[index] || 0),
    essencial: modulo.essencial,
    vazio: Number(contagens[index] || 0) === 0,
  }));

  const faltantes = modulos.filter(m => m.essencial && m.vazio).map(m => m.id);
  const totalDados = modulos.reduce((acc, m) => acc + m.total, 0);
  const migracaoEstado = config?.migracaoEstado || (faltantes.length ? 'pendente' : 'pronto');

  return {
    modoDados: 'mongo',
    usuario: {
      necessario: totalUsuarios === 0,
      total: totalUsuarios,
      setupKeyObrigatoria: totalUsuarios === 0 && Boolean(setupKeyObrigatoria),
    },
    migracao: {
      estado: migracaoEstado,
      versao: config?.migracaoVersao || null,
      migradoEm: config?.migracaoEm || null,
      erro: config?.ultimoErro || '',
      automatica: true,
      relatorio: config?.relatorioMigracao || {},
    },
    dados: {
      bancoVazio: totalDados === 0,
      necessario: faltantes.length > 0,
      faltantes,
      totalRegistros: totalDados,
      modulos,
      fonte: 'mongo',
      cacheOffline: false,
    },
    pronto: totalUsuarios > 0 && migracaoEstado === 'pronto' && faltantes.length === 0,
  };
}

export { MODULOS_BOOTSTRAP };
