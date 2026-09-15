import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const read = rel => readFileSync(new URL(`../${rel}`, import.meta.url), 'utf8');

test('Capacitor usa Guia Doa como nome padrão do APK', () => {
  assert.equal(JSON.parse(read('capacitor.config.json')).appName, 'Guia Doa');
});

test('build Android aplica nome localizado em português e inglês', () => {
  const script = read('scripts/apply-android-name.mjs');
  const workflow = read('.github/workflows/build-apk.yml');
  assert.match(script, /values-pt-rBR[\s\S]*Guia Doa/);
  assert.match(script, /values-en-rUS[\s\S]*Guide Doa/);
  assert.match(script, /app_name/);
  assert.match(workflow, /node scripts\/apply-android-name\.mjs/);
});
