import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const appSource = await readFile(new URL('../api/app.js', import.meta.url), 'utf8');

test('CORS permite automaticamente o próprio host que serve o Admin', () => {
  assert.match(appSource, /const selfOrigin = getRequestOrigin\(req\)/);
  assert.match(appSource, /origin === selfOrigin/);
  assert.match(appSource, /x-forwarded-host/);
  assert.match(appSource, /x-forwarded-proto/);
});

test('CORS não depende de domínio Render fixo antigo', () => {
  assert.doesNotMatch(appSource, /guiadoa\.onrender\.com/);
});


test('CORS aceita a origem do APK Capacitor Android', () => {
  assert.match(appSource, /'https:\/\/localhost'/);
  assert.match(appSource, /'capacitor:\/\/localhost'/);
  assert.match(appSource, /androidScheme=https/);
});
