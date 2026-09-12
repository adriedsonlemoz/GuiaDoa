import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';

const readJson = (path) => JSON.parse(readFileSync(path, 'utf8'));

test('Flutter alpha.8 preserves GitHub Manager compatibility metadata', () => {
  assert.equal(existsSync('docs/FLUTTER_MIGRATION_ALPHA4.md'), true);
  assert.equal(existsSync('flutter/release.json'), true);
  const release = readJson('flutter/release.json');
  assert.equal(release.version, '1.0.0-beta.2.85');
  assert.equal(release.versionCode, 100085);
  assert.equal(release.channel, 'alpha.8');
  assert.equal(release.family, 'FLUTTER');
  assert.equal(release.apkName, 'GuiaDOA-FLUTTER-beta.2.85-alpha.8.apk');
});
