import test from 'node:test';
import assert from 'node:assert/strict';
import { DICAS_SEED } from '../seeds/dicas.js';

test('guia de início de Realm está preparado para PT/EN e dados conectados', () => {
  const guia = DICAS_SEED.find(item => item.slug === 'guia-inicial-construcoes');
  assert.ok(guia);
  assert.equal(guia.titulo, '🐉 Guia para Iniciante');
  assert.equal(guia.i18n?.['en-US']?.titulo, '🐉 Beginner Guide');
  assert.equal(guia.categoria, 'iniciante');
  assert.equal(guia.tipo, 'guia');
  assert.equal(guia.destaque, true);
  for (const variable of [
    'fonte_n35', 'fontes_38', 'beladona_min', 'beladona_max',
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


test('tutorial de ataque a Antropos usa as recomendações conectadas do Mapa & Campanha', () => {
  const guia = DICAS_SEED.find(item => item.slug === 'tutorial-atacar-antropos');
  assert.ok(guia);
  assert.equal(guia.tipo, 'tutorial');
  assert.equal(guia.categoria, 'iniciante');
  assert.match(guia.conteudo, /20% de margem/);
  assert.match(guia.conteudo, /Arqueiros \/ LBM/);
  assert.match(guia.conteudo, /Lava Jaws \/ Magmassauros/);
  assert.match(guia.conteudo, /Dragões de Ataque Rápido \/ SSD/);
  assert.match(guia.conteudo, /192\.000 Dragões de Ataque Rápido[\s\S]*possíveis perdas/);
  assert.match(guia.conteudo, /Nv\. 10[\s\S]*configuração isolada não confirmada/);
  assert.match(guia.conteudo, /Transportes Blindados OU Carregadores/);
  assert.match(guia.conteudo, /500 Medusas/);
  assert.doesNotMatch(guia.conteudo, /Fangtooth|Dragões de Combate \(BD\)/);
  assert.ok(guia.i18n?.['en-US']?.conteudo);
  assert.match(guia.i18n['en-US'].conteudo, /20% safety margin/);
  assert.ok(guia.relacionados.tropas.includes('Lava Jaws (LJ)'));
});


test('tutorial de captura de dragões usa Campos como fonte única e possui PT/EN', () => {
  const guia = DICAS_SEED.find(item => item.slug === 'tutorial-capturar-dragoes');
  assert.ok(guia);
  assert.equal(guia.tipo, 'tutorial');
  assert.match(guia.conteudo, /100 itens/);
  assert.match(guia.conteudo, /Emblema do Dragão do Trovão/);
  assert.match(guia.conteudo, /Savana Nv\.6–10/);
  assert.match(guia.conteudo, /Dragão da Água[\s\S]*conta for antiga/i);
  assert.match(guia.conteudo, /Grande Dragão[\s\S]*não precisa ser capturado/i);
  assert.ok(guia.i18n?.['en-US']?.conteudo);
  assert.match(guia.i18n['en-US'].conteudo, /Thunder Dragon Emblem/);
  assert.ok(guia.relacionados.dragoes.includes('dragao_trovao'));
  assert.ok(guia.relacionados.dragoes.includes('dragao_agua'));
});
