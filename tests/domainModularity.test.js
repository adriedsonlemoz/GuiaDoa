import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { calcularProgresso } from '../src/components/niveis/niveisUtils.js';
import { calcularMetricas } from '../src/components/ilhas/ilhasUtils.js';

const read = path => readFileSync(new URL(`../${path}`, import.meta.url), 'utf8');

const lines = path => read(path).split('\n').length;

test('Ilhas e Níveis mantêm regra de domínio fora da tela principal', () => {
  assert.ok(existsSync(new URL('../src/components/ilhas/useIlhasManager.js', import.meta.url)));
  assert.ok(existsSync(new URL('../src/components/ilhas/ilhasUtils.js', import.meta.url)));
  assert.ok(existsSync(new URL('../src/components/niveis/useNivelProgress.js', import.meta.url)));
  assert.ok(existsSync(new URL('../src/components/niveis/niveisUtils.js', import.meta.url)));
  assert.ok(lines('src/components/Ilhas.jsx') < 100);
  assert.ok(lines('src/components/Niveis.jsx') < 100);
});

test('Dicas, Dragões, Home e comparação de Tropas usam componentes dedicados', () => {
  const expected = [
    'src/components/dicas/useDicasFeed.js',
    'src/components/dicas/DicaArtigo.jsx',
    'src/components/dragoes/ui/DragaoComparacao.jsx',
    'src/components/dragoes/ui/DragaoCard.jsx',
    'src/components/home/HomeProfileCard.jsx',
    'src/components/home/HomeToolsGrid.jsx',
    'src/components/tropas/comparar/TropaPicker.jsx',
    'src/components/tropas/comparar/TropaComparisonTable.jsx',
    'src/components/tropas/simulador/useBattleSimulator.js',
    'src/components/tropas/simulador/MarchaPanel.jsx',
    'src/components/tropas/simulador/ComparePanel.jsx',
    'src/components/tropas/simulador/TropaSelectDrawer.jsx',
    'src/config/api.js',
  ];
  expected.forEach(path => assert.ok(existsSync(new URL(`../${path}`, import.meta.url)), `${path} deve existir`));
  assert.ok(lines('src/components/Dicas.jsx') < 100);
  assert.ok(lines('src/components/dragoes/Dragoes.jsx') < 180);
  assert.ok(lines('src/components/Home.jsx') < 120);
  assert.ok(lines('src/components/tropas/TropaComparar.jsx') < 120);
  assert.ok(lines('src/components/CalculosTropas.jsx') < 100);
});

test('URL da API fica centralizada em uma configuração única', () => {
  const files = [
    'src/data/GameDataContext.jsx',
    'src/app/StartupGate.jsx',
    'src/hooks/useI18n.jsx',
    'src/components/assistente/config.js',
    'src/components/dicas/useDicasFeed.js',
  ];
  files.forEach(path => assert.doesNotMatch(read(path), /import\.meta\.env\.VITE_API_URL/, `${path} não deve redefinir VITE_API_URL`));
});

test('cálculo de progressão de níveis permanece puro após modularização', () => {
  const result = calcularProgresso([[1, 100], [2, 200], [3, 400], [5, 1000]], 250);
  assert.equal(result.nivelExato, 2);
  assert.deepEqual(result.proximaMeta, [3, 400]);
  assert.equal(result.faltamParaMeta, 150);
  assert.deepEqual(result.proximoMarco, [5, 1000]);
});

test('cálculo de ilhas tolera dados online incompletos sem quebrar a tela', () => {
  const result = calcularMetricas({
    data: [
      { type: 'casas', values: ['1', '', '', '', ''] },
      { type: 'fontes', values: ['', '', '', '', ''] },
      { type: 'guarnicoes', values: ['', '', '', '', ''] },
      { type: 'fazendas', values: ['1', '', '', '', ''] },
      { type: 'minas', values: ['', '', '', '', ''] },
      { type: 'pedreiras', values: ['', '', '', '', ''] },
      { type: 'serrarias', values: ['', '', '', '', ''] },
      { type: 'perolas', values: ['', '', '', '', ''] },
    ],
    niveis: { fortaleza: 1, casas: 1, fontes: 1, fazendas: 1, minas: 1, pedreiras: 1, serrarias: 1, perolas: 1 },
    territorios: { fazendas: 0, minas: 0, pedreiras: 0, serrarias: 0 },
    dbEdificios: {},
  });
  assert.equal(result.totais.casas, 1);
  assert.equal(result.totais.fazendas, 1);
  assert.equal(result.limiteSipioPrinc, 11);
  assert.equal(result.popTotal, 0);
});

test('picker de tropas recebe a função de tradução pela camada i18n', () => {
  const picker = read('src/components/tropas/comparar/TropaPicker.jsx');
  assert.match(picker, /useI18n/);
  assert.match(picker, /getTipoAtaque\(item,\s*t\)/);
});


test('produção e APK usam a API canônica do Render sem depender de localhost', () => {
  const api = read('src/config/api.js');
  const env = read('.env.production');
  const workflow = read('.github/workflows/build-apk.yml');
  assert.match(api, /CANONICAL_API_URL = 'https:\/\/guiadoa-agrq\.onrender\.com'/);
  assert.match(env, /VITE_API_URL=https:\/\/guiadoa-agrq\.onrender\.com/);
  assert.match(workflow, /secrets\.VITE_API_URL \|\| 'https:\/\/guiadoa-agrq\.onrender\.com'/);
});
