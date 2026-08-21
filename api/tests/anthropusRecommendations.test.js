import test from 'node:test';
import assert from 'node:assert/strict';
import { ANTROPOS_SEED } from '../seeds/campanha.js';
import { ANTHROPUS_BASE_ATTACKS, TROOP_CARRY_CAPACITY, withAttackMargin, totalResourceValue } from '../seeds/antropos/attackGuides.js';

const expectedCodes = ['arqueiros-lbm','lava-jaws-lj8','dragoes-ataque-rapido-ssd'];

test('recomendações de Antropos usam apenas LBM, Lava Jaws e SSD sem combinação ofensiva', () => {
  for (const entry of ANTROPOS_SEED) {
    assert.deepEqual(entry.guiasAtaque.map(g => g.codigo), expectedCodes);
    for (const guide of entry.guiasAtaque) {
      assert.equal(guide.complemento || '', '');
      assert.ok((guide.apoios || []).every(a => ['Carregadores','Transportes Blindados'].includes(a.nome)));
    }
  }
});

test('margem de 20% é aplicada sobre as quantidades-base e arredondada para cima', () => {
  assert.equal(withAttackMargin(60), 72);
  assert.equal(withAttackMargin(2), 3);
  assert.equal(withAttackMargin(425), 510);
  assert.equal(withAttackMargin(160000), 192000);
  for (const entry of ANTROPOS_SEED) {
    const baseLbm = ANTHROPUS_BASE_ATTACKS.lbm[entry.nivel];
    const baseLava = ANTHROPUS_BASE_ATTACKS.lavaJaws[entry.nivel];
    assert.equal(entry.guiasAtaque.find(g => g.codigo === 'arqueiros-lbm').quantidade, withAttackMargin(baseLbm.qty));
    assert.equal(entry.guiasAtaque.find(g => g.codigo === 'lava-jaws-lj8').quantidade, withAttackMargin(baseLava.qty));
  }
});

test('cada opção de transporte calculada sozinha completa a capacidade necessária', () => {
  for (const entry of ANTROPOS_SEED) {
    const total = totalResourceValue(entry.recursos);
    for (const guide of entry.guiasAtaque) {
      if (guide.quantidade == null) continue;
      const mainCarry = guide.quantidade * TROOP_CARRY_CAPACITY[guide.tropaPrincipal];
      const supports = guide.apoios || [];
      if (!supports.length) {
        assert.ok(mainCarry >= total, `${entry.slug} ${guide.codigo}`);
        continue;
      }
      assert.deepEqual(supports.map(a => a.nome), ['Transportes Blindados','Carregadores']);
      for (const support of supports) {
        const capacity = mainCarry + support.quantidade * TROOP_CARRY_CAPACITY[support.nome];
        assert.ok(capacity >= total, `${entry.slug} ${guide.codigo} ${support.nome}`);
        const oneLess = support.quantidade - 1;
        if (oneLess >= 0) {
          const priorCapacity = mainCarry + oneLess * TROOP_CARRY_CAPACITY[support.nome];
          assert.ok(priorCapacity < total, `${entry.slug} ${guide.codigo} ${support.nome} deve ser mínimo exato`);
        }
      }
    }
  }
});

test('SSD Nv.9 mantém risco e SSD Nv.10 não inventa configuração isolada', () => {
  const n9 = ANTROPOS_SEED.find(e => e.nivel === 9).guiasAtaque.find(g => g.codigo === 'dragoes-ataque-rapido-ssd');
  assert.equal(n9.quantidade, 192000);
  assert.equal(n9.resultado, 'possiveis_perdas');
  const n10 = ANTROPOS_SEED.find(e => e.nivel === 10).guiasAtaque.find(g => g.codigo === 'dragoes-ataque-rapido-ssd');
  assert.equal(n10.quantidade, null);
  assert.equal(n10.resultado, 'incompleto');
  assert.deepEqual(n10.apoios, []);
});
