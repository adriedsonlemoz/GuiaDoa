import test from 'node:test';
import assert from 'node:assert/strict';
import { DATA_MIGRATION_VERSION, deveExecutarMigracao, forceMigrationFromEnv } from '../utils/migrationPolicy.js';

test('migração roda na primeira instalação e quando a versão dos dados muda', () => {
  assert.equal(deveExecutarMigracao(null), true);
  assert.equal(deveExecutarMigracao({ migracaoEstado:'pronto', migracaoVersao:'dados-antigos' }), true);
});

test('versão visual do app não força nova migração de dados', () => {
  const config = { migracaoEstado:'pronto', migracaoVersao:DATA_MIGRATION_VERSION };
  assert.equal(DATA_MIGRATION_VERSION, '1.0.0-beta.2.13');
  assert.equal(deveExecutarMigracao(config), false);
  assert.equal(deveExecutarMigracao(config, DATA_MIGRATION_VERSION, true), true);
});

test('forçamento de migração continua explícito', () => {
  assert.equal(forceMigrationFromEnv({ FORCE_DATA_MIGRATION:'true' }), true);
  assert.equal(forceMigrationFromEnv({ FORCE_DATA_MIGRATION:'false' }), false);
});
