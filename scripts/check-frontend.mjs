import { readdirSync } from 'node:fs';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';

function walk(dir) {
  const files = [];
  for (const entry of readdirSync(dir, { withFileTypes:true })) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) files.push(...walk(path));
    else if (/\.(?:js|jsx)$/.test(entry.name)) files.push(path);
  }
  return files;
}

const files = walk('src');
const args = [
  '--noEmit', '--allowJs', '--checkJs', 'false', '--jsx', 'react-jsx',
  '--skipLibCheck', '--module', 'esnext', '--target', 'es2022',
  '--moduleResolution', 'bundler', ...files,
];
const command = process.platform === 'win32' ? 'tsc.cmd' : 'tsc';
const result = spawnSync(command, args, { stdio:'inherit' });
if (result.error) throw result.error;
process.exit(result.status ?? 1);
