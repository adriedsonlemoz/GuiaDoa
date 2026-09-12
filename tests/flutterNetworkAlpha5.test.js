import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
const read = path => readFileSync(new URL(`../${path}`, import.meta.url), 'utf8');

test('Flutter release keeps Android INTERNET permission in the main manifest bootstrap', () => {
  const sh = read('flutter/tool/bootstrap_platforms.sh');
  const ps = read('flutter/tool/bootstrap_platforms.ps1');
  assert.match(sh, /android\.permission\.INTERNET/);
  assert.match(ps, /android\.permission\.INTERNET/);
  assert.match(sh, /Guia Doa/);
});

test('Flutter workflow passes the API endpoint to Android Web and iOS builds', () => {
  const flow = read('.github/workflows/flutter-multiplatform.yml');
  assert.match(flow, /secrets\.FLUTTER_API_URL \|\| secrets\.VITE_API_URL/);
  assert.match(flow, /flutter build apk --release --dart-define=API_URL=/);
  assert.match(flow, /flutter build web --release --dart-define=API_URL=/);
  assert.match(flow, /flutter build ios --release --no-codesign --dart-define=API_URL=/);
  assert.match(flow, /Validate Android internet permission/);
});

test('Network failures are user friendly instead of exposing SocketException', () => {
  const client = read('flutter/lib/core/network/api_client.dart');
  assert.match(client, /on http\.ClientException/);
  assert.match(client, /Não foi possível conectar ao servidor do Guia Doa/);
  assert.match(client, /String toString\(\) => message/);
});
