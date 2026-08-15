import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
const read = p => readFileSync(new URL(`../${p}`, import.meta.url), 'utf8');

test('Mapa & Campanha está acessível na Home e possui rota dedicada', () => {
  assert.match(read('src/components/home/homeTools.js'), /id: 'campanha'/);
  assert.match(read('src/app/routes.jsx'), /case 'campanha'/);
  assert.match(read('src/components/CampanhaMapa.jsx'), /campaign-category-grid/);
});

test('Campos possui seleção por subtipo antes dos níveis', () => {
  const source = read('src/components/CampanhaMapa.jsx');
  assert.match(source, /FIELD_TYPES/);
  assert.match(source, /campaign-field-grid/);
  assert.match(source, /fieldType/);
  assert.match(source, /savana/);
  assert.match(source, /montanha/);
  assert.match(source, /morro/);
  assert.match(source, /lago/);
  assert.match(source, /floresta/);
});

test('frontend preserva valores abreviados e separa estratégia de dados oficiais', () => {
  const source = read('src/components/CampanhaMapa.jsx');
  assert.match(source, /resource\.exato \? '' : '≈ '/);
  assert.match(source, /strategy_pending/);
  assert.match(source, /fonte\?\.verificado/);
});

test('frontend mostra produção do campo e recompensas simbólicas sem inventar nomes', () => {
  const source = read('src/components/CampanhaMapa.jsx');
  assert.match(source, /production_when_conquered/);
  assert.match(source, /possible_rewards/);
  assert.match(source, /reward_name_pending/);
  assert.match(source, /reward\.simbolo/);
});

test('Admin oferece recompensas e domínio do campo sem armazenar screenshots', () => {
  const admin = read('api/admin/js/admin-campanha.js');
  assert.match(admin, /Mapa & Campanha/);
  assert.match(admin, /mcAddReward/);
  assert.match(admin, /mc-field-production/);
  assert.match(admin, /nome confirmado/);
  assert.match(admin, /mcAddGuide/);
  assert.match(admin, /guiasAtaque/);
  assert.doesNotMatch(admin, /base64|FileReader|image\/png/);
});


test('lista de níveis usa uma coluna e destaca Fedor', () => {
  const css = read('src/index.css');
  const source = read('src/components/CampanhaMapa.jsx');
  assert.match(css, /campaign-level-grid\{display:grid;grid-template-columns:1fr/);
  assert.match(source, /campaign-fedor-mini/);
  assert.match(source, /campaign\.fedor_tactic/);
});

test('frontend exibe guias estruturados, resultado de perdas e tropas especiais confirmadas', () => {
  const source = read('src/components/CampanhaMapa.jsx');
  assert.match(source, /AttackGuidesBlock/);
  assert.match(source, /guiasAtaque/);
  assert.match(source, /SPECIAL_TEST_TROOPS/);
  assert.match(source, /Carregadores|Transportes Blindados|campaign\.choose_one_support/);
  assert.match(source, /campaign\.zero_loss/);
  assert.match(source, /campaign\.possible_losses/);
  assert.match(source, /campaign-guide-companion/);
  assert.match(source, /campaign\.ranged_speed_warning/);
});


test('detalhes do Mapa & Campanha usam tópicos recolhíveis e voltar interno à direita', () => {
  const source = read('src/components/CampanhaMapa.jsx');
  const css = read('src/index.css');
  assert.match(source, /function CollapsibleSection/);
  assert.match(source, /campaign-collapse-trigger/);
  assert.match(source, /aria-expanded/);
  assert.match(css, /\.campaign-back\{[^}]*margin-left:auto/);
  assert.match(css, /\.campaign-back\{[^}]*color:#3f7656/);
});

test('recompensas de Antropos exibem imagens locais sem quantidade fixa no frontend', () => {
  const source = read('src/components/CampanhaMapa.jsx');
  const css = read('src/index.css');
  assert.match(source, /campaign-reward-image/);
  assert.match(source, /reward\.imagem/);
  assert.doesNotMatch(source, /reward\.quantidade != null/);
  assert.match(css, /\.campaign-reward-image/);
  for (const asset of ['obsidiana.webp','lembrancas-antigas.webp','essencia-furia.webp','amuleto-nevoa-malva.webp']) {
    assert.equal(existsSync(`public/assets/items/anthropus/${asset}`), true);
  }
});
