import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync, statSync } from 'node:fs';

const read = path => readFileSync(path, 'utf8');

test('ícone oficial do GUIA DOA está conectado ao PWA e à interface', () => {
  const manifest = read('public/manifest.webmanifest');
  const app = read('src/App.jsx');
  const sync = read('src/app/DataSyncScene.jsx');
  const about = read('src/components/Sobre.jsx');

  for (const path of [
    'public/img/app-icon.png',
    'public/img/favicon.png',
    'public/img/icons/icon-192.png',
    'public/img/icons/icon-512.png',
    'public/img/icons/icon-maskable-512.png',
  ]) {
    assert.equal(existsSync(path), true, `${path} deve existir`);
    assert.ok(statSync(path).size > 1000, `${path} não pode estar vazio`);
  }

  assert.match(manifest, /icon-192\.png/);
  assert.match(manifest, /icon-512\.png/);
  assert.match(manifest, /icon-maskable-512\.png/);
  assert.match(app, /game-topbar-brand-icon/);
  assert.match(sync, /sync-core-logo/);
  assert.match(about, /about-brand-icon/);
});

test('workflow Android aplica o launcher oficial após criar/sincronizar a plataforma', () => {
  const workflow = read('.github/workflows/build-apk.yml');
  const script = read('scripts/apply-android-icon.mjs');
  assert.match(workflow, /node scripts\/apply-android-icon\.mjs/);
  assert.match(script, /ic_launcher_foreground\.png/);
  assert.match(script, /#061F1D/);
  for (const density of ['mdpi','hdpi','xhdpi','xxhdpi','xxxhdpi']) {
    assert.equal(existsSync(`mobile/android-icons/mipmap-${density}/ic_launcher.png`), true);
  }
});
