import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';

const read = path => readFileSync(new URL(`../${path}`, import.meta.url), 'utf8');

const flutterFiles = [
  'flutter/lib/features/troops/domain/troop_catalog.dart',
  'flutter/lib/features/troops/presentation/troops_page.dart',
  'flutter/lib/features/troops/presentation/troop_detail_page.dart',
  'flutter/lib/features/troops/presentation/troop_compare_page.dart',
  'flutter/lib/features/troops/presentation/troop_widgets.dart',
  'flutter/test/troop_catalog_test.dart',
];

test('Flutter alpha.2 possui módulo dedicado de Tropas', () => {
  for (const file of flutterFiles) assert.ok(existsSync(new URL(`../${file}`, import.meta.url)), file);

  const home = read('flutter/lib/features/home/presentation/home_page.dart');
  const troops = read('flutter/lib/features/troops/presentation/troops_page.dart');
  const detail = read('flutter/lib/features/troops/presentation/troop_detail_page.dart');
  const compare = read('flutter/lib/features/troops/presentation/troop_compare_page.dart');
  const domain = read('flutter/lib/features/troops/domain/troop_catalog.dart');
  const strings = read('flutter/lib/core/i18n/app_strings.dart');

  assert.match(home, /TroopsPage\(/);
  assert.match(home, /controller: widget\.gameData/);
  for (const id of ['melee','ranged','ranged_only','hybrid','speed','tank','supply']) assert.match(domain, new RegExp(`'${id}'`));
  for (const sortId of ['life','defense','speed','load','ranged_attack','melee_attack','range','power','balance']) assert.match(domain, new RegExp(`'${sortId}'`));
  assert.match(troops, /TroopDetailPage/);
  assert.match(troops, /TroopComparePage/);
  assert.match(detail, /troops\.training/);
  assert.match(detail, /troops\.strong_against/);
  assert.match(detail, /troops\.weak_against/);
  assert.match(compare, /troops\.compare_note/);
  assert.match(strings, /'troops\.encyclopedia': 'Enciclopédia de Tropas'/);
  assert.match(strings, /'troops\.encyclopedia': 'Troop Encyclopedia'/);
});

test('Flutter continua apontando somente para a API, não para credenciais MongoDB', () => {
  const config = read('flutter/lib/core/config/app_config.dart');
  const flutterTree = flutterFiles.map(read).join('\n');
  assert.match(config, /https:\/\/guiadoa-agrq\.onrender\.com/);
  assert.doesNotMatch(flutterTree, /mongodb(\+srv)?:\/\//i);
  assert.doesNotMatch(flutterTree, /MONGO_URI|MONGODB_URI/);
});
