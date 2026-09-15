import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { applyAndroidFullscreen, mainActivitySource } from '../scripts/apply-android-fullscreen.mjs';

test('Android fullscreen patch uses immersive system bars and display cutout', () => {
  const source = mainActivitySource('com.guiadoa.app');
  assert.match(source, /WindowInsets\.Type\.systemBars\(\)/);
  assert.match(source, /BEHAVIOR_SHOW_TRANSIENT_BARS_BY_SWIPE/);
  assert.match(source, /setDecorFitsSystemWindows\(false\)/);
  assert.match(source, /LAYOUT_IN_DISPLAY_CUTOUT_MODE_ALWAYS/);
  assert.match(source, /SYSTEM_UI_FLAG_IMMERSIVE_STICKY/);
  assert.match(source, /onWindowFocusChanged/);
});

test('Android fullscreen patch is generated into the Capacitor MainActivity', () => {
  const root = mkdtempSync(join(tmpdir(), 'guiadoa-fullscreen-'));
  writeFileSync(join(root, 'capacitor.config.json'), JSON.stringify({ appId:'com.guiadoa.app' }));
  const javaDir = join(root, 'android/app/src/main/java/com/guiadoa/app');
  mkdirSync(javaDir, { recursive:true });
  writeFileSync(join(javaDir, 'MainActivity.java'), 'package com.guiadoa.app;\nimport com.getcapacitor.BridgeActivity;\npublic class MainActivity extends BridgeActivity {}\n');

  const result = applyAndroidFullscreen(root);
  assert.equal(result.appId, 'com.guiadoa.app');
  const generated = readFileSync(result.activityFile, 'utf8');
  assert.match(generated, /controller\.hide\(WindowInsets\.Type\.systemBars\(\)\)/);
  assert.match(generated, /LAYOUT_IN_DISPLAY_CUTOUT_MODE_ALWAYS/);

  applyAndroidFullscreen(root);
  assert.equal(readFileSync(result.activityFile, 'utf8'), generated);
});

test('WebView viewport opts into edge-to-edge display area', () => {
  const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
  const css = readFileSync(new URL('../src/index.css', import.meta.url), 'utf8');
  const workflow = readFileSync(new URL('../.github/workflows/build-apk.yml', import.meta.url), 'utf8');
  assert.match(html, /viewport-fit=cover/);
  assert.match(css, /padding-top: env\(safe-area-inset-top\)/);
  assert.match(css, /padding-bottom: env\(safe-area-inset-bottom\)/);
  assert.match(css, /min-height: 100dvh/);
  assert.match(workflow, /node scripts\/apply-android-fullscreen\.mjs/);
});
