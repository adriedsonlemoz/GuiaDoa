import test from 'node:test';
import assert from 'node:assert/strict';
import { tacticalMetadata, UNLOCKS } from '../seeds/tropasTaticas.js';

test('taxonomia classifica alcance e função com base nos atributos', () => {
  const ranged = tacticalMetadata({ nome:'Arqueiro', atqDist:100, atqPerto:5, vida:75, def:30, car:25 });
  const tank = tacticalMetadata({ nome:'Ogros de Granito', atqDist:0, atqPerto:650, vida:15000, def:900, car:30 });
  assert.equal(ranged.combate, 'distancia');
  assert.ok(ranged.funcoes.includes('ataque'));
  assert.equal(tank.combate, 'corpo_a_corpo');
  assert.ok(tank.funcoes.includes('defesa'));
});

test('requisitos conhecidos da Fábrica e Viveiro ficam estruturados', () => {
  assert.equal(UNLOCKS['Espelhos de Fogo'].fonte, 'Fábrica');
  assert.equal(UNLOCKS['Espelhos de Fogo'].nivel, 18);
  assert.equal(UNLOCKS['Cavaleiro Dragão'].fonte, 'Viveiro');
  assert.equal(UNLOCKS['Cavaleiro Dragão'].nivel, 30);
});
