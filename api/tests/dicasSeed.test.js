import test from 'node:test';
import assert from 'node:assert/strict';
import { DICAS_SEED } from '../seeds/dicas.js';

test('guia de início de Realm está preparado para PT/EN e dados conectados', () => {
  const guia = DICAS_SEED.find(item => item.slug === 'guia-inicial-construcoes');
  assert.ok(guia);
  assert.equal(guia.titulo, '🐉 Guia para Início de Realm');
  assert.equal(guia.categoria, 'iniciante');
  assert.equal(guia.tipo, 'guia');
  assert.equal(guia.destaque, true);
  for (const variable of [
    'fonte_n35', 'fontes_38', 'agua_dia', 'beladona_min', 'beladona_max',
    'ssd_guarnicao', 'ssd_viveiro', 'ssd_formacao', 'ssd_dragoria',
    'bd_guarnicao', 'bd_forja', 'bd_viveiro', 'bd_formacao', 'bd_dragoria',
  ]) assert.match(guia.conteudo, new RegExp(`\\{\\{${variable}\\}\\}`));
  assert.match(guia.conteudo, /Medusa/);
  assert.match(guia.conteudo, /Esmagadores Colossais/);
  assert.match(guia.conteudo, /Metalurgia Nv\.4/);
  assert.match(guia.conteudo, /Cofre e .*Teatro são opcionais/);
  assert.match(guia.conteudo, /Viveiro é diferente/);
  assert.ok(guia.i18n?.['en-US']?.titulo);
  assert.ok(guia.i18n?.['en-US']?.conteudo);
  assert.ok(guia.relacionados.modulos.includes('campanha'));
  assert.ok(guia.relacionados.modulos.includes('pesquisas'));
  assert.ok(guia.relacionados.modulos.includes('torneios'));
});


test('tutorial de ataque a Antropos usa as estratégias confirmadas do Mapa & Campanha', () => {
  const guia = DICAS_SEED.find(item => item.slug === 'tutorial-atacar-antropos');
  assert.ok(guia);
  assert.equal(guia.tipo, 'tutorial');
  assert.equal(guia.categoria, 'iniciante');
  assert.match(guia.conteudo, /Nv\. 6 → 10\.000/);
  assert.match(guia.conteudo, /60 Arqueiros \+ 147 Carregadores OU 33 Transportes Blindados/);
  assert.match(guia.conteudo, /3\.500 Lava Jaws \(LJ\) \+ 1\.000 Transportes Blindados/);
  assert.match(guia.conteudo, /160\.000 Dragões de Ataque Rápido[\s\S]*possíveis perdas/);
  assert.match(guia.conteudo, /500 Medusas/);
  assert.match(guia.conteudo, /Metalurgia Nv\.4/);
  assert.match(guia.conteudo, /Calibração de Armas/);
  assert.doesNotMatch(guia.conteudo, /- Nv\. 11 →/);
  assert.ok(guia.i18n?.['en-US']?.conteudo);
  assert.match(guia.i18n['en-US'].conteudo, /100,000 Longbowmen/);
  assert.ok(guia.relacionados.modulos.includes('campanha'));
  assert.ok(guia.relacionados.modulos.includes('pesquisas'));
});
