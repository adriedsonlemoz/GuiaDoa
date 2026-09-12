import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const read = path => readFileSync(new URL(`../${path}`, import.meta.url), 'utf8');

test('Flutter Home no longer uses the invalid Container minHeight property', () => {
  const home = read('flutter/lib/features/home/presentation/home_page.dart');
  assert.doesNotMatch(home, /Container\(\s*minHeight\s*:/);
  assert.match(home, /class _HeroHeader extends StatelessWidget/);
});

test('Flutter and repository release metadata stay synchronized', () => {
  const rootPackage = JSON.parse(read('package.json'));
  const apiPackage = JSON.parse(read('api/package.json'));
  const androidVersion = JSON.parse(read('mobile/android-version.json'));
  const pubspec = read('flutter/pubspec.yaml');
  const config = read('flutter/lib/core/config/app_config.dart');
  assert.equal(apiPackage.version, rootPackage.version);
  assert.equal(androidVersion.versionCode, 100087);
  assert.ok(pubspec.includes(`version: ${rootPackage.version}+${androidVersion.versionCode}`));
  const release = JSON.parse(read('flutter/release.json'));
  assert.equal(release.version, rootPackage.version);
  assert.equal(release.versionCode, androidVersion.versionCode);
  assert.ok(config.includes(`${release.version} · Flutter ${release.channel}`));
});
