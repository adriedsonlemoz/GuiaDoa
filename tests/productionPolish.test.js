import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../src', import.meta.url));
const read = path => readFileSync(new URL(`../${path}`, import.meta.url), 'utf8');

function walk(dir) {
  const out = [];
  for (const name of readdirSync(dir)) {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) out.push(...walk(path));
    else if (/\.(?:js|jsx)$/.test(name)) out.push(path);
  }
  return out;
}

test('interface pública não expõe o nome da tecnologia de banco', () => {
  for (const file of walk(root)) {
    const src = readFileSync(file, 'utf8');
    assert.doesNotMatch(src, /mongo(?:db)?/i, file);
  }
});

test('regressão do perfil: ProfileField importa a paleta usada no componente', () => {
  const field = read('src/components/ProfileLogin/ProfileField.jsx');
  assert.match(field, /import \{ C \} from ['"]\.\.\/\.\.\/theme\.js['"]/);
  assert.match(field, /C\.TEXT_MUTED/);
});

test('perfil foi dividido em etapas e usa a camada central de idiomas', () => {
  const form = read('src/components/ProfileLogin/ProfileForm.jsx');
  const language = read('src/components/ProfileLogin/ProfileLanguageStep.jsx');
  const details = read('src/components/ProfileLogin/ProfileDetailsStep.jsx');
  assert.match(form, /ProfileLanguageStep/);
  assert.match(form, /ProfileDetailsStep/);
  assert.match(language, /LanguageChooser/);
  assert.match(details, /t\('profile\.continue'\)/);
});

test('detalhes de dragão importam o hook de estado usado pelo módulo', () => {
  const detalhe = read('src/components/dragoes/DragaoDetalhe.jsx');
  assert.match(detalhe, /import React, \{ useState \} from ['"]react['"]/);
});

test('aplicativo público não expõe atalho do painel administrativo', () => {
  const app = read('src/App.jsx');
  assert.doesNotMatch(app, /Painel Admin|\/admin/);
});

test('erros públicos possuem código de suporte e diagnóstico copiável', () => {
  const boundary = read('src/app/ErrorBoundary.jsx');
  const state = read('src/ui/AppErrorState.jsx');
  assert.match(boundary, /GD-UI-001/);
  assert.match(state, /errors\.support_code/);
  assert.match(state, /errors\.copy/);
});
