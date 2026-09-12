import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const home = readFileSync(new URL('../flutter/lib/features/home/presentation/home_page.dart', import.meta.url), 'utf8');
const release = JSON.parse(readFileSync(new URL('../flutter/release.json', import.meta.url), 'utf8'));

test('quick compare passes ProfileStore required by TroopsPage', () => {
  assert.match(home, /TroopsPage\([\s\S]*?controller: widget\.gameData,[\s\S]*?profileStore: widget\.profileStore,[\s\S]*?startCompareMode: true/);
});

test('Flutter release metadata is synchronized', () => {
  assert.match(release.version, /^1\.0\.0-beta\.2\.\d+$/);
  assert.ok(release.versionCode > 0);
  assert.match(release.channel, /^alpha\.\d+$/);
  assert.equal(release.apkName, `GuiaDOA-FLUTTER-${release.version.replace('1.0.0-', '')}-${release.channel}.apk`);
});
