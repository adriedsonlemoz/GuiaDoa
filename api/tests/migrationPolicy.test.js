import test from 'node:test';
import assert from 'node:assert/strict';
import { deveExecutarMigracao, forceMigrationFromEnv } from '../utils/migrationPolicy.js';

test('migração roda na primeira instalação e ao mudar a versão', () => {
  assert.equal(deveExecutarMigracao(null, '1.0.0-beta.2.8'), true);
  assert.equal(deveExecutarMigracao({ migracaoEstado:'pronto', migracaoVersao:'1.0.0-beta.2.7' }, '1.0.0-beta.2.8'), true);
});

test('migração não reexecuta na mesma versão, salvo força explícita', () => {
  const config = { migracaoEstado:'pronto', migracaoVersao:'1.0.0-beta.2.8' };
  assert.equal(deveExecutarMigracao(config, '1.0.0-beta.2.8'), false);
  assert.equal(deveExecutarMigracao(config, '1.0.0-beta.2.8', true), true);
  assert.equal(forceMigrationFromEnv({ FORCE_DATA_MIGRATION:'true' }), true);
  assert.equal(forceMigrationFromEnv({ FORCE_DATA_MIGRATION:'false' }), false);
});
