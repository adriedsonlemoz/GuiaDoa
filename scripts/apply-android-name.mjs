import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';

const resRoot = resolve('android/app/src/main/res');
if (!existsSync(resRoot)) {
  throw new Error('android/app/src/main/res não existe. Execute `npx cap add android` antes deste script.');
}

const labels = [
  { dir: 'values', name: 'Guia Doa' },
  { dir: 'values-pt', name: 'Guia Doa' },
  { dir: 'values-pt-rBR', name: 'Guia Doa' },
  { dir: 'values-en', name: 'Guide Doa' },
  { dir: 'values-en-rUS', name: 'Guide Doa' },
];

const escapeXml = value => value
  .replaceAll('&', '&amp;')
  .replaceAll('<', '&lt;')
  .replaceAll('>', '&gt;')
  .replaceAll('"', '&quot;')
  .replaceAll("'", '&apos;');

function upsertString(xml, key, value) {
  const entry = `<string name="${key}">${escapeXml(value)}</string>`;
  const pattern = new RegExp(`<string\\s+name=["']${key}["'][^>]*>[\\s\\S]*?<\\/string>`, 'm');
  if (pattern.test(xml)) return xml.replace(pattern, entry);
  return xml.replace(/<\/resources>\s*$/m, `    ${entry}\n</resources>\n`);
}

for (const { dir, name } of labels) {
  const file = resolve(resRoot, dir, 'strings.xml');
  mkdirSync(dirname(file), { recursive: true });
  let xml = existsSync(file)
    ? readFileSync(file, 'utf8')
    : '<?xml version="1.0" encoding="utf-8"?>\n<resources>\n</resources>\n';
  xml = upsertString(xml, 'app_name', name);
  xml = upsertString(xml, 'title_activity_main', name);
  writeFileSync(file, xml.endsWith('\n') ? xml : `${xml}\n`, 'utf8');
}

console.log('[Android] nome localizado aplicado: pt=Guia Doa, en=Guide Doa.');
