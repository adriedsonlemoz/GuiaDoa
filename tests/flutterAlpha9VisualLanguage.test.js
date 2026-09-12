import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const read = path => readFileSync(new URL(`../${path}`, import.meta.url), 'utf8');

test('Flutter alpha.9 adopts the approved emerald/gold home foundation', () => {
  const theme = read('flutter/lib/core/theme/guia_theme.dart');
  const home = read('flutter/lib/features/home/presentation/home_page.dart');
  const tools = read('flutter/lib/features/home/presentation/home_tools.dart');

  assert.match(theme, /premiumBackground/);
  assert.match(theme, /premiumGoldLight/);
  assert.match(home, /home\.search/);
  assert.match(home, /_SummaryPanel/);
  assert.match(home, /_QuickActions/);
  assert.match(home, /_Highlights/);
  assert.match(home, /_PremiumBottomBar/);
  assert.match(tools, /primaryHomeToolKeys/);
  assert.match(tools, /'torneios'/);
  assert.match(tools, /'tropas'/);
  assert.match(tools, /'dragoes'/);
  assert.match(tools, /'edificios'/);
});

test('language can be selected before profile creation and changed later in Settings', () => {
  const app = read('flutter/lib/app.dart');
  const onboarding = read('flutter/lib/features/profile/presentation/onboarding_page.dart');
  const selector = read('flutter/lib/features/profile/presentation/language_selector.dart');
  const settings = read('flutter/lib/features/settings/presentation/settings_page.dart');
  const store = read('flutter/lib/core/storage/profile_store.dart');
  const pubspec = read('flutter/pubspec.yaml');

  assert.match(pubspec, /flutter_localizations:/);
  assert.match(app, /GlobalMaterialLocalizations\.delegate/);
  assert.match(app, /locale:\s*_localeFromTag\(profileStore\.locale\)/);
  assert.match(onboarding, /_locale = widget\.profileStore\.locale/);
  assert.match(onboarding, /widget\.profileStore\.setLocale\(locale\)/);
  assert.match(onboarding, /LanguageSelector\(locale: _locale/);
  assert.match(selector, /Português/);
  assert.match(selector, /English/);
  assert.match(settings, /settings\.language/);
  assert.match(settings, /profileStore\.setLocale\(locale\)/);
  assert.match(store, /_localeKey = 'doa_locale_flutter'/);
});

test('alpha.10 release metadata is synchronized', () => {
  const release = JSON.parse(read('flutter/release.json'));
  const android = JSON.parse(read('mobile/android-version.json'));
  const packageJson = JSON.parse(read('package.json'));
  const pubspec = read('flutter/pubspec.yaml');
  const config = read('flutter/lib/core/config/app_config.dart');

  assert.equal(packageJson.version, '1.0.0-beta.2.87');
  assert.equal(android.versionCode, 100087);
  assert.equal(release.version, packageJson.version);
  assert.equal(release.versionCode, android.versionCode);
  assert.equal(release.channel, 'alpha.10');
  assert.equal(release.apkName, 'GuiaDOA-FLUTTER-beta.2.87-alpha.10.apk');
  assert.match(pubspec, /version: 1\.0\.0-beta\.2\.87\+100087/);
  assert.match(config, /Flutter alpha\.10/);
});
