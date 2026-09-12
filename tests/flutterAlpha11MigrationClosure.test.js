import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';

const read = path => readFileSync(new URL(`../${path}`, import.meta.url), 'utf8');

test('Flutter alpha.11 cobre os módulos públicos restantes da versão antiga', () => {
  const home = read('flutter/lib/features/home/presentation/home_page.dart');
  const modules = read('flutter/lib/features/modules/presentation/module_pages.dart');
  for (const cls of [
    'TournamentsPage','MarchCalculatorPage','TroopUpgradePage','DragonsPage','BuildingsPage','ItemsPage',
    'ResearchPage','IslandsPage','LevelsPage','CampaignPage','EventsPage','GuidesPage','RealmsPage','AssistantPage',
    'BackupPage','ColorBuilderPage','AboutPage','DonationPage','FavoritesPage','TrackerHubPage','ExtrasPage','MorePage'
  ]) assert.match(modules, new RegExp(`class ${cls}\\b`), cls);
  for (const key of ['torneios','tropas','dragoes','edificios','itens','pesquisas','ilhas','dicas','campanha','niveis','eventos','extras']) {
    assert.match(home, new RegExp(`'${key}'\\s*=>`), key);
  }
  assert.doesNotMatch(home, /_showMigrating\(/);
});

test('Flutter alpha.11 usa nome público Guia Doa e launcher Android adaptativo', () => {
  const config = read('flutter/lib/core/config/app_config.dart');
  const sh = read('flutter/tool/bootstrap_platforms.sh');
  assert.match(config, /appName = 'Guia Doa'/);
  assert.match(sh, /android:label="Guia Doa"/);
  assert.match(sh, /mipmap-anydpi-v26\/ic_launcher\.xml/);
  assert.match(sh, /ic_launcher_foreground/);
  assert.match(sh, /android:roundIcon/);
  for (const density of ['mdpi','hdpi','xhdpi','xxhdpi','xxxhdpi']) {
    assert.ok(existsSync(new URL(`../flutter/tool/android_adaptive_icon/legacy/mipmap-${density}/ic_launcher.png`, import.meta.url)));
    assert.ok(existsSync(new URL(`../flutter/tool/android_adaptive_icon/legacy/mipmap-${density}/ic_launcher_round.png`, import.meta.url)));
  }
  assert.ok(existsSync(new URL('../flutter/tool/android_adaptive_icon/ic_launcher_foreground.png', import.meta.url)));
});

test('Flutter sincroniza versão principal', () => {
  const release = JSON.parse(read('flutter/release.json'));
  const pkg = JSON.parse(read('package.json'));
  const android = JSON.parse(read('mobile/android-version.json'));
  const pubspec = read('flutter/pubspec.yaml');
  assert.equal(release.version, pkg.version);
  assert.equal(release.versionCode, android.versionCode);
  assert.match(release.channel, /^alpha\.\d+$/);
  assert.equal(release.apkName, `GuiaDOA-FLUTTER-${release.version.replace('1.0.0-', '')}-${release.channel}.apk`);
  assert.ok(pubspec.includes(`version: ${pkg.version}+${android.versionCode}`));
});
