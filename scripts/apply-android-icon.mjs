import { cp, mkdir, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { join } from 'node:path';

const root = new URL('../', import.meta.url);
const source = new URL('../mobile/android-icons/', import.meta.url);
const res = new URL('../android/app/src/main/res/', import.meta.url);

if (!existsSync(res)) {
  throw new Error('android/app/src/main/res não existe. Execute `npx cap add android` antes deste script.');
}

const densities = ['mdpi', 'hdpi', 'xhdpi', 'xxhdpi', 'xxxhdpi'];
for (const density of densities) {
  const srcDir = new URL(`mipmap-${density}/`, source);
  const dstDir = new URL(`mipmap-${density}/`, res);
  await mkdir(dstDir, { recursive: true });
  for (const name of ['ic_launcher.png', 'ic_launcher_round.png', 'ic_launcher_foreground.png']) {
    await cp(new URL(name, srcDir), new URL(name, dstDir));
  }
}

const anydpi = new URL('mipmap-anydpi-v26/', res);
await mkdir(anydpi, { recursive: true });
const adaptive = `<?xml version="1.0" encoding="utf-8"?>\n<adaptive-icon xmlns:android="http://schemas.android.com/apk/res/android">\n    <background android:drawable="@color/ic_launcher_background"/>\n    <foreground android:drawable="@mipmap/ic_launcher_foreground"/>\n</adaptive-icon>\n`;
await writeFile(new URL('ic_launcher.xml', anydpi), adaptive, 'utf8');
await writeFile(new URL('ic_launcher_round.xml', anydpi), adaptive, 'utf8');

const values = new URL('values/', res);
await mkdir(values, { recursive: true });
await writeFile(new URL('ic_launcher_background.xml', values), `<?xml version="1.0" encoding="utf-8"?>\n<resources>\n    <color name="ic_launcher_background">#061F1D</color>\n</resources>\n`, 'utf8');

console.log('[Android] ícone oficial do GUIA DOA aplicado aos launchers.');
