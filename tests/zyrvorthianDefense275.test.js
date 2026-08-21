import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const campaign = fs.readFileSync('src/components/CampanhaMapa.jsx','utf8');
const zyr = fs.readFileSync('src/components/campanha/zyrvorthian/ZyrvorthianView.jsx','utf8');
const dragon = fs.readFileSync('src/components/dragoes/DragaoDetalhe.jsx','utf8');
const dica = fs.readFileSync('src/components/dicas/DicaArtigo.jsx','utf8');
const calc = fs.readFileSync('src/components/dicas/DefenseProtectionCalculator.jsx','utf8');
const assistant = fs.readFileSync('api/services/assistente/context.js','utf8');

test('Mapa & Campanha usa uma experiência própria para Zyrvorthian', () => {
  assert.match(campaign, /ZyrvorthianLanding/);
  assert.match(campaign, /ZyrvorthianDetail/);
  assert.match(zyr, /Horários confirmados/);
  assert.match(zyr, /não mostra horários cadastrados como confirmados|só mostra horários cadastrados como confirmados/);
  assert.match(zyr, /CHEFES DOCUMENTADOS|Calamidades conhecidas/);
  assert.match(zyr, /tutorial-defesa-inimigos/);
});

test('popup de habilidade do Dragão usa portal e folha opaca', () => {
  assert.match(dragon, /createPortal/);
  assert.match(dragon, /game-modal-backdrop dragon-skill-modal-backdrop/);
  assert.match(dragon, /game-modal-sheet dragon-skill-modal-sheet/);
  assert.match(dragon, /zIndex:9500/);
});

test('tutorial incorpora calculadora defensiva e preços chegam ao Assistente', () => {
  assert.match(dica, /DefenseProtectionCalculator/);
  assert.match(dica, /tutorial-defesa-inimigos/);
  assert.match(calc, /treaties \* 2/);
  assert.match(calc, /treaties \* 100000/);
  assert.match(calc, /Math\.ceil\(hours \/ 72\) \* 40/);
  assert.match(assistant, /Preço:/);
  assert.match(assistant, /i\.preco\.valor/);
});
