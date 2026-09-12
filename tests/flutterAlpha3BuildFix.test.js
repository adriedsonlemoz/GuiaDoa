import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const read = path => readFileSync(new URL(`../${path}`, import.meta.url), 'utf8');

test('Flutter alpha.3 keeps Home minimum height through BoxConstraints', () => {
  const home = read('flutter/lib/features/home/presentation/home_page.dart');
  assert.doesNotMatch(home, /Container\(\s*minHeight\s*:/);
  assert.match(home, /constraints:\s*const BoxConstraints\(minHeight:\s*60\)/);
});

test('Flutter and repository release metadata are synchronized at beta.2.80', () => {
  const rootPackage = JSON.parse(read('package.json'));
  const apiPackage = JSON.parse(read('api/package.json'));
  const androidVersion = JSON.parse(read('mobile/android-version.json'));
  const pubspec = read('flutter/pubspec.yaml');
  const config = read('flutter/lib/core/config/app_config.dart');
  assert.equal(rootPackage.version, '1.0.0-beta.2.80');
  assert.equal(apiPackage.version, rootPackage.version);
  assert.equal(androidVersion.versionCode, 100080);
  assert.match(pubspec, /^version:\s*1\.0\.0-beta\.2\.80\+100080$/m);
  assert.match(config, /1\.0\.0-beta\.2\.80 · Flutter alpha\.3/);
});
