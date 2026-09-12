import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const read = path => readFileSync(new URL(`../${path}`, import.meta.url), 'utf8');

test('Flutter alpha.7 Home uses the fields declared by HomeTool', () => {
  const model = read('flutter/lib/features/home/presentation/home_tools.dart');
  const home = read('flutter/lib/features/home/presentation/home_page.dart');

  assert.match(model, /final String emoji;/);
  assert.match(model, /final String subtitleKey;/);
  assert.doesNotMatch(home, /tool\.icon\b/);
  assert.doesNotMatch(home, /tool\.subtitle\b/);
  assert.match(home, /assets\/ui\/\$\{tool\.keyName\}\.png/);
  assert.match(home, /strings\.t\(tool\.subtitleKey\)/);
});
