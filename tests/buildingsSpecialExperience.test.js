import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
const read = p => readFileSync(new URL(`../${p}`, import.meta.url), 'utf8');

test('Construções virou módulo-pai com rotas para normais, Gruta e Basílica', () => {
  const routes = read('src/app/routes.jsx');
  const hub = read('src/components/edificios/BuildingHub.jsx');
  assert.match(routes, /edificios_normais/);
  assert.match(routes, /edificios_gruta/);
  assert.match(routes, /edificios_basilica/);
  assert.match(hub, /building-hub-card/);
  assert.match(hub, /buildings\.flow\.orbs/);
});

test('Gruta mostra requisitos, níveis e troca de Órbitas por Pedras', () => {
  const source = read('src/components/edificios/GrutaView.jsx');
  assert.match(source, /requirement_text/);
  assert.match(source, /bonusOrbitasPct/);
  assert.match(source, /orbitasPorPedraNivel1/);
  assert.match(source, /SpiritStoneGrid/);
});

test('Basílica mostra 20 níveis, pedras, custos confirmados e estimativas separadas', () => {
  const source = read('src/components/edificios/BasilicaView.jsx');
  assert.match(source, /basilica-level-table/);
  assert.match(source, /buildProjection/);
  assert.match(source, /is-estimated/);
  assert.match(source, /bonusConjuntoConfirmado/);
});

test('assets da Gruta, Basílica e seis Pedras estão empacotados localmente', () => {
  for (const asset of ['gruta.webp','basilica.webp','pedra-ataque.webp','pedra-velocidade.webp','pedra-alma.webp','pedra-defesa.webp','pedra-alcance.webp','pedra-ataque-distancia.webp']) {
    assert.equal(existsSync(`public/assets/edificios/especiais/${asset}`), true, asset);
  }
});
