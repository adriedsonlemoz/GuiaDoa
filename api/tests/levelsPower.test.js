import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const read = path => readFileSync(new URL(`../${path}`, import.meta.url), 'utf8');

test('Níveis usa Poder Necessário e mantém leitura compatível do campo XP legado', () => {
  const model = read('models/Nivel.js');
  const route = read('routes/niveis.js');
  assert.match(model, /poderNecessario/);
  assert.match(route, /body\?\.poderNecessario \?\? body\?\.xp/);
  assert.match(route, /delete raw\.xp/);
});

test('Admin de Níveis oferece preenchimento rápido, filtros e importação em lote', () => {
  const admin = read('admin/js/admin-niveis.js');
  assert.match(admin, /salvarPoderesNiveis/);
  assert.match(admin, /importarPoderesNiveis/);
  assert.match(admin, /faltando/);
  assert.match(admin, /\/niveis\/lote/);
});
