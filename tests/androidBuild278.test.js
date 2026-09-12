import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { applyAndroidVersion, readAndroidVersion, validateApiUrl } from '../scripts/android-build-config.mjs';

test('APK rejects insecure, malformed and disguised loopback URLs', () => {
  for (const url of ['', 'not-a-url', 'http://api.example.com', 'https://localhost',
    'https://LOCALHOST.', 'https://app.localhost', 'https://127.0.0.2', 'https://127.1',
    'https://2130706433', 'https://0x7f000001', 'https://0.0.0.0', 'https://[::1]',
    'https://[::ffff:127.0.0.1]', 'https://user:pass@api.example.com',
    'https://api.example.com?token=private', 'https://api.example.com/#fragment']) {
    assert.throws(() => validateApiUrl(url), undefined, url);
  }
  assert.equal(validateApiUrl(' https://guiadoa-agrq.onrender.com/ '), 'https://guiadoa-agrq.onrender.com');
  assert.equal(validateApiUrl('https://api.example.com/v1/'), 'https://api.example.com/v1');
});

test('native version is applied idempotently without replacing existing Gradle settings', t => {
  const root = mkdtempSync(join(tmpdir(), 'guiadoa-android-'));
  t.after(() => rmSync(root, { recursive:true, force:true }));
  mkdirSync(join(root, 'mobile'));
  mkdirSync(join(root, 'android/app'), { recursive:true });
  writeFileSync(join(root, 'package.json'), JSON.stringify({ version:'1.0.0-beta.2.78' }));
  writeFileSync(join(root, 'mobile/android-version.json'), JSON.stringify({ versionCode:100078 }));
  const buildPath = join(root, 'android/app/build.gradle');
  const original = 'android { defaultConfig { versionCode 1; versionName "1.0" } }\n';
  writeFileSync(buildPath, original);
  assert.deepEqual(applyAndroidVersion(root), { version:'1.0.0-beta.2.78', versionCode:100078 });
  applyAndroidVersion(root);
  const result = readFileSync(buildPath, 'utf8');
  assert.ok(result.startsWith(original));
  assert.equal(result.match(/apply from: 'guiadoa-version.gradle'/g).length, 1);
  const generated = readFileSync(join(root, 'android/app/guiadoa-version.gradle'), 'utf8');
  assert.match(generated, /versionCode 100078/);
  assert.match(generated, /versionName "1.0.0-beta.2.78"/);
  for (const versionCode of [0, -1, 1.2, '100078', 2100000001]) {
    writeFileSync(join(root, 'mobile/android-version.json'), JSON.stringify({ versionCode }));
    assert.throws(() => readAndroidVersion(root));
  }
});

test('application and API locks agree with the native release metadata', () => {
  const read = path => JSON.parse(readFileSync(new URL(`../${path}`, import.meta.url), 'utf8'));
  const version = read('package.json').version;
  assert.equal(read('api/package.json').version, version);
  for (const file of ['package-lock.json', 'api/package-lock.json']) {
    assert.equal(read(file).version, version);
    assert.equal(read(file).packages[''].version, version);
  }
  assert.equal(read('mobile/android-version.json').versionCode, 100084);
});

test('Capacitor workflow is legacy/manual while Flutter is the primary automatic APK', () => {
  const legacy = readFileSync(new URL('../.github/workflows/build-apk.yml', import.meta.url), 'utf8');
  const flutter = readFileSync(new URL('../.github/workflows/flutter-multiplatform.yml', import.meta.url), 'utf8');
  assert.match(legacy, /name:\s*LEGADO - React Capacitor APK/);
  assert.ok(!/^\s*push:/m.test(legacy));
  assert.match(flutter, /branches:\s*\[main, master\]/);
  assert.match(flutter, /gh release upload/);
  assert.match(flutter, /GuiaDOA-FLUTTER-/);
});
