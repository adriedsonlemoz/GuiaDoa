import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const pkg = JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf8'));
const lock = readFileSync(new URL('../package-lock.json', import.meta.url), 'utf8');
const vite = readFileSync(new URL('../vite.config.js', import.meta.url), 'utf8');
const main = readFileSync(new URL('../src/main.jsx', import.meta.url), 'utf8');
const workflow = readFileSync(new URL('../.github/workflows/build-apk.yml', import.meta.url), 'utf8');

test('build web não instala toolchain móvel nem Workbox', () => {
  assert.equal(pkg.dependencies?.['@capacitor/core'], undefined);
  assert.equal(pkg.dependencies?.['@capacitor/android'], undefined);
  assert.equal(pkg.devDependencies?.['@capacitor/cli'], undefined);
  assert.equal(pkg.devDependencies?.['vite-plugin-pwa'], undefined);
  assert.doesNotMatch(vite, /vite-plugin-pwa|VitePWA/);
  assert.doesNotMatch(main, /virtual:pwa-register/);
});

test('PWA é gerada localmente e Capacitor fica isolado no workflow Android', () => {
  assert.match(pkg.scripts.build, /generate-pwa\.mjs/);
  assert.match(main, /serviceWorker\.register\('\/sw\.js'/);
  assert.match(workflow, /@capacitor\/cli@8\.5\.0/);
  assert.match(workflow, /node-version:\s*22/);
});

test('lock web não carrega as cadeias antigas que geravam warnings', () => {
  assert.doesNotMatch(lock, /node_modules\/vite-plugin-pwa/);
  assert.doesNotMatch(lock, /node_modules\/workbox-build/);
  assert.doesNotMatch(lock, /node_modules\/@capacitor\/cli/);
  assert.doesNotMatch(lock, /source-map@0\.8\.0-beta\.0/);
});
