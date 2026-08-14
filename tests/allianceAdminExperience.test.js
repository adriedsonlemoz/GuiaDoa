import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';

const read = p => readFileSync(new URL(`../${p}`, import.meta.url), 'utf8');

test('Alliance Tracker existe apenas no Admin e não cria rota pública no frontend', () => {
  assert.ok(existsSync(new URL('../api/admin/js/admin-alliances.js', import.meta.url)));
  assert.match(read('api/admin/js/admin-state.js'), /id:'alliances'/);
  assert.match(read('api/admin/js/admin-alliances.js'), /Privado/);
  assert.doesNotMatch(read('src/App.jsx'), /alliance-tracker|Alliance Tracker/);
});

test('Admin exige revisão antes de confirmar dados extraídos e explicita lista completa', () => {
  const admin = read('api/admin/js/admin-alliances.js');
  assert.match(admin, /Revisar leitura/);
  assert.match(admin, /lista completa da Aliança/);
  assert.match(admin, /Confirmar importação/);
  assert.match(admin, /Confirmar troca/);
});

test('importação da Aliança mostra narrativa de progresso e recuperação de falhas', () => {
  const admin = read('api/admin/js/admin-alliances.js');
  const css = read('api/admin/css/admin.css');
  assert.match(admin, /at-scan-story/);
  assert.match(admin, /Procurando a tabela de membros/);
  assert.match(admin, /Tentando um leitor visual alternativo/);
  assert.match(admin, /Tudo pronto\. Abrindo revisão/);
  assert.match(admin, /extract-stream/);
  assert.match(admin, /Tentar leitura novamente/);
  assert.match(css, /\.at-scan-story/);
});
