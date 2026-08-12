import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';

const read = path => readFileSync(new URL(`../${path}`, import.meta.url), 'utf8');

const runtimeGameFiles = [
  'src/components/Itens.jsx',
  'src/components/Edificios.jsx',
  'src/components/Niveis.jsx',
  'src/components/Ilhas.jsx',
  'src/components/ProfileLogin/ReinoSelector.jsx',
  'src/components/dragoes/Dragoes.jsx',
  'src/components/dragoes/DragaoDetalhe.jsx',
  'src/components/dragoes/DragaoTracker.jsx',
  'src/components/pesquisas/Pesquisas.jsx',
  'src/components/pesquisas/PesquisaDetalhe.jsx',
  'src/components/torneios/TorneioTreinoTropa.jsx',
  'src/components/torneios/shared/TorneioLayout.jsx',
  'src/hooks/useTropas.js',
  'src/app/routes.jsx',
];

test('telas de dados do jogo usam GameDataContext e não bases locais', () => {
  for (const file of runtimeGameFiles) {
    const src = read(file);
    assert.doesNotMatch(src, /from ['"][^'"]*(?:data\/(?:tropas|niveis|reinos|dragoes|edificios)|db\.js)['"]/i, file);
  }
  assert.match(read('src/data/GameDataContext.jsx'), /cache:'no-store'/);
});

test('primeiro acesso limpa somente caches legados de dados e cria admin antes do app', () => {
  const gate = read('src/app/StartupGate.jsx');
  const sync = read('src/data/syncService.js');
  assert.match(gate, /bootstrap-status/);
  assert.match(gate, /Acesso administrativo/);
  assert.match(gate, /limparCachesDeDadosLegados/);
  assert.match(sync, /doa_cache_itens_v2/);
  assert.match(sync, /doa_cache_edificios_v2/);
  assert.match(sync, /doa_cache_pesquisas_v2/);
});


test('bases estáticas antigas do frontend foram removidas', () => {
  const removidos = [
    'src/db.js', 'src/data/tropas.js', 'src/data/niveis.js',
    'src/data/reinos.js', 'src/data/dragoes.js', 'src/data/edificios.js',
  ];
  for (const file of removidos) {
    assert.equal(existsSync(new URL(`../${file}`, import.meta.url)), false, `${file} não deve existir`);
  }
});

test('Admin não oferece seed/importação manual dos dados canônicos', () => {
  const modulos = [
    'api/admin/js/admin-niveis.js', 'api/admin/js/admin-dragoes.js',
    'api/admin/js/admin-edificios.js', 'api/admin/js/admin-reinos.js',
    'api/admin/js/admin-pesquisas.js', 'api/admin/js/admin-dicas.js',
  ];
  const proibido = /Seed padrão|Importar Lista|Importar Dados|Importar padrão|↺ Seed|Importar categorias padrão|seedReinos\(|importarDragoes\(|importarEdificios\(|importarNiveis\(|reiniciarPesquisas\(|seedCatsDicas\(/i;
  for (const file of modulos) assert.doesNotMatch(read(file), proibido, file);
});


test('API não expõe importação manual dos seeds canônicos', () => {
  const rotas = [
    'api/routes/setup.js', 'api/routes/niveis.js', 'api/routes/dragoes.js',
    'api/routes/edificios.js', 'api/routes/reinos.js', 'api/routes/pesquisas.js',
    'api/routes/dicas.js',
  ];
  const proibido = /(?:setup\/importar|\/importar['"]|\/seed['"]|categorias\/seed|\/limpar\/)/i;
  for (const file of rotas) assert.doesNotMatch(read(file), proibido, file);
});
