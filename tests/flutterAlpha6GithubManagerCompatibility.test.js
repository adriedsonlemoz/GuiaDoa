import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';

const readJson = (path) => JSON.parse(readFileSync(path, 'utf8'));

test('Flutter preserves synchronized GitHub Manager identity', () => {
  assert.equal(existsSync('docs/FLUTTER_MIGRATION_ALPHA4.md'), true);
  assert.equal(existsSync('flutter/release.json'), true);
  assert.equal(existsSync('github-manager.json'), true);
  const release = readJson('flutter/release.json');
  const manager = readJson('github-manager.json');
  const rootPackage = readJson('package.json');
  const android = readJson('mobile/android-version.json');
  assert.equal(release.version, rootPackage.version);
  assert.equal(release.versionCode, android.versionCode);
  assert.equal(manager.projectName, 'Guia Doa');
  assert.equal(manager.displayName, 'Guia Doa');
  assert.equal(manager.versionName, release.version);
  assert.equal(manager.versionCode, release.versionCode);
  assert.equal(manager.applicationId, 'com.guiadoa.app');
  assert.equal(manager.namespace, manager.applicationId);
  assert.equal(manager.language, 'Dart');
  assert.equal(manager.type, 'Flutter');
  assert.equal(release.family, 'FLUTTER');
  assert.match(release.channel, /^alpha\.\d+$/);
  assert.equal(release.apkName, `GuiaDOA-FLUTTER-${release.version.replace('1.0.0-', '')}-${release.channel}.apk`);
});
