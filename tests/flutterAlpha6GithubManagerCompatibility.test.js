import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';

const readJson = (path) => JSON.parse(readFileSync(path, 'utf8'));

test('Flutter alpha.9 preserves GitHub Manager compatibility metadata', () => {
  assert.equal(existsSync('docs/FLUTTER_MIGRATION_ALPHA4.md'), true);
  assert.equal(existsSync('flutter/release.json'), true);
  const release = readJson('flutter/release.json');
  assert.equal(release.version, '1.0.0-beta.2.87');
  assert.equal(release.versionCode, 100087);
  assert.equal(release.channel, 'alpha.10');
  assert.equal(release.family, 'FLUTTER');
  assert.equal(release.apkName, 'GuiaDOA-FLUTTER-beta.2.87-alpha.10.apk');
});
