import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { EDIFICIOS_ESPECIAIS, PEDRAS_ESPIRITUAIS, GRUTA_NIVEIS, BASILICA_NIVEIS } from '../seeds/edificiosEspeciais.js';

const projectRoot = fileURLToPath(new URL('../../', import.meta.url));

test('Gruta possui 10 níveis, depende de Aliança + Base e chega a 500% de bônus', () => {
  const gruta = EDIFICIOS_ESPECIAIS.find(item => item.tipoModulo === 'gruta');
  assert.ok(gruta);
  assert.equal(gruta.dadosEspeciais.nivelMax, 10);
  assert.equal(gruta.dadosEspeciais.requerAlianca, true);
  assert.equal(gruta.dadosEspeciais.requerBaseAlianca, true);
  assert.equal(gruta.dadosEspeciais.exploracaoHoras, 4);
  assert.equal(gruta.dadosEspeciais.orbitasPorPedraNivel1, 100);
  assert.equal(GRUTA_NIVEIS.length, 10);
  assert.equal(GRUTA_NIVEIS[0].bonusOrbitasPct, 50);
  assert.equal(GRUTA_NIVEIS.at(-1).bonusOrbitasPct, 500);
});

test('Basílica possui 20 níveis, 24 ranhuras e libera Pedras até Nv.10', () => {
  const basilica = EDIFICIOS_ESPECIAIS.find(item => item.tipoModulo === 'basilica');
  assert.ok(basilica);
  assert.equal(BASILICA_NIVEIS.length, 20);
  assert.deepEqual(BASILICA_NIVEIS[0], { nivel:1, ranhuras:6, nivelMaxPedra:3, nivelMax:false });
  assert.deepEqual(BASILICA_NIVEIS.at(-1), { nivel:20, ranhuras:24, nivelMaxPedra:10, nivelMax:true });
  assert.equal(basilica.dadosEspeciais.ranhurasMax, 24);
  assert.equal(basilica.dadosEspeciais.gruposCompletosMax, 4);
});

test('seis Pedras Espirituais usam assets locais e regra confirmada 2, 6, 18', () => {
  assert.equal(PEDRAS_ESPIRITUAIS.length, 6);
  for (const stone of PEDRAS_ESPIRITUAIS) {
    assert.equal(stone.bonusBasePct, 0.5);
    assert.ok(existsSync(`${projectRoot}public${stone.imagem}`), stone.imagem);
  }
  const basilica = EDIFICIOS_ESPECIAIS.find(item => item.tipoModulo === 'basilica');
  assert.deepEqual(basilica.dadosEspeciais.combinacao.evolucoesConfirmadas.map(row => row.adicionaisNivel1), [2,6,18]);
  assert.equal(basilica.dadosEspeciais.combinacao.projecaoFormula.confirmadaAteNivel, 4);
  assert.equal(basilica.dadosEspeciais.bonusConjuntoConfirmado.bonusPctPorAtributo, 1.5);
});
