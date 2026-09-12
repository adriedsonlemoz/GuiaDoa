import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const read = path => readFileSync(new URL(`../${path}`, import.meta.url), 'utf8');

test('Flutter Home keeps a valid minimum height constraint', () => {
  const home = read('flutter/lib/features/home/presentation/home_page.dart');
  assert.doesNotMatch(home, /Container\(\s*minHeight\s*:/);
  assert.match(home, /constraints:\s*const BoxConstraints\(minHeight:\s*64\)/);
});

test('Flutter and repository release metadata are synchronized at beta.2.81 alpha.4', () => {
  const rootPackage = JSON.parse(read('package.json'));
  const apiPackage = JSON.parse(read('api/package.json'));
  const androidVersion = JSON.parse(read('mobile/android-version.json'));
  const release = JSON.parse(read('flutter/release.json'));
  const pubspec = read('flutter/pubspec.yaml');
  const config = read('flutter/lib/core/config/app_config.dart');
  assert.equal(rootPackage.version, '1.0.0-beta.2.81');
  assert.equal(apiPackage.version, rootPackage.version);
  assert.equal(androidVersion.versionCode, 100081);
  assert.equal(release.version, rootPackage.version);
  assert.equal(release.versionCode, 100081);
  assert.equal(release.apkName, 'GuiaDOA-FLUTTER-beta.2.81-alpha.4.apk');
  assert.match(pubspec, /^version:\s*1\.0\.0-beta\.2\.81\+100081$/m);
  assert.match(config, /1\.0\.0-beta\.2\.81 · Flutter alpha\.4/);
  assert.match(config, /installedName = 'Guia DOA Flutter'/);
});

test('Flutter is the automatic principal build and legacy workflow no longer competes with it', () => {
  const principal = read('.github/workflows/flutter-multiplatform.yml');
  const legacy = read('.github/workflows/build-apk.yml');
  assert.match(principal, /^name: Flutter Principal - Android Web iOS/m);
  assert.match(principal, /^  push:/m);
  assert.match(principal, /flutter build apk --release/);
  assert.match(principal, /Guia DOA .* - Flutter/);
  assert.match(principal, /apkName/);
  assert.match(principal, /gh release upload/);
  assert.doesNotMatch(principal, /upload-artifact/);
  assert.match(legacy, /^name: LEGADO - React Capacitor APK/m);
  assert.doesNotMatch(legacy, /^  push:/m);
  assert.doesNotMatch(legacy, /^  pull_request:/m);
});

test('Flutter build is visually identifiable before and after onboarding', () => {
  const home = read('flutter/lib/features/home/presentation/home_page.dart');
  const onboarding = read('flutter/lib/features/profile/presentation/onboarding_page.dart');
  const bootstrap = read('flutter/tool/bootstrap_platforms.sh');
  assert.match(home, /FLUTTER/);
  assert.match(home, /NOVA VERSÃO FLUTTER/);
  assert.match(onboarding, /NOVA VERSÃO FLUTTER/);
  assert.match(bootstrap, /Guia DOA Flutter/);
});

test('Flutter Home follows the current Home tool order and keeps pending modules explicit', () => {
  const tools = read('flutter/lib/features/home/presentation/home_tools.dart');
  const order = ['tropas','dragoes','edificios','pesquisas','itens','campanha','ilhas','niveis','torneios','dicas','eventos','extras'];
  let previous = -1;
  for (const key of order) {
    const current = tools.indexOf(`keyName: '${key}'`);
    assert.ok(current > previous, `${key} must keep the current Home order`);
    previous = current;
  }
  assert.match(read('flutter/lib/features/home/presentation/home_page.dart'), /_ActiveEventHighlight/);
  assert.match(read('flutter/lib/features/home/presentation/home_page.dart'), /_AdvisorCard/);
});
