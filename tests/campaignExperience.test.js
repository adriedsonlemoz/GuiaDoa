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
  const fields = read('src/components/campanha/FieldLanding.jsx');
  const config = read('src/components/campanha/fieldConfig.js');
  assert.match(source, /FIELD_TYPES/);
  assert.match(fields, /campaign-field-grid/);
  assert.match(config, /FIELD_TYPES/);
  assert.match(source, /fieldType/);
  assert.match(config, /savana/);
  assert.match(config, /montanha/);
  assert.match(config, /morro/);
  assert.match(config, /lago/);
  assert.match(config, /floresta/);
});

test('frontend preserva valores abreviados e separa estratégia de dados oficiais', () => {
  const source = read('src/components/CampanhaMapa.jsx');
  assert.match(source, /resource\.exato \? '' : '≈ '/);
  assert.match(source, /strategy_pending/);
  assert.match(source, /fonte\?\.verificado/);
});

test('frontend mostra produção do campo e recompensas simbólicas sem inventar nomes', () => {
  const source = read('src/components/CampanhaMapa.jsx');
  const rewards = read('src/components/campanha/RewardsBlock.jsx');
  assert.match(source, /production_when_conquered/);
  assert.match(rewards, /possible_rewards/);
  assert.match(rewards, /reward_name_pending/);
  assert.match(rewards, /reward\.simbolo/);
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
  assert.match(source, /SPECIAL_SAFE_TROOPS/);
  assert.match(source, /Carregadores|Transportes Blindados|campaign\.choose_one_support/);
  assert.match(source, /campaign\.zero_loss/);
  assert.match(source, /campaign\.possible_losses/);
  assert.match(source, /campaign-guide-companion/);
  assert.match(source, /campaign\.ranged_speed_warning/);
});


test('detalhes do Mapa & Campanha usam tópicos recolhíveis e voltar interno à direita', () => {
  const source = read('src/components/CampanhaMapa.jsx');
  const collapsible = read('src/components/campanha/CollapsibleSection.jsx');
  const css = read('src/index.css');
  assert.match(source, /<CollapsibleSection/);
  assert.match(collapsible, /campaign-collapse-trigger/);
  assert.match(collapsible, /aria-expanded/);
  assert.match(css, /\.campaign-back\{[^}]*margin-left:auto/);
  assert.match(css, /\.campaign-back\{[^}]*color:#3f7656/);
});

test('recompensas de Antropos exibem imagens locais sem quantidade fixa no frontend', () => {
  const source = read('src/components/campanha/RewardsBlock.jsx');
  const css = read('src/index.css');
  assert.match(source, /campaign-reward-image/);
  assert.match(source, /reward\.imagem/);
  assert.doesNotMatch(source, /reward\.quantidade != null/);
  assert.match(css, /\.campaign-reward-image/);
  for (const asset of ['obsidiana.webp','lembrancas-antigas.webp','essencia-furia.webp','amuleto-nevoa-malva.webp']) {
    assert.equal(existsSync(`public/assets/items/anthropus/${asset}`), true);
  }
});


test('Beta 2.50 mostra prévia de recursos e itens nos cards e usa nível verde', () => {
  const source = read('src/components/CampanhaMapa.jsx');
  const css = read('src/index.css');
  assert.match(source, /campaign-card-preview/);
  assert.match(source, /campaign-reward-preview/);
  assert.match(source, /campaign\.items_preview/);
  assert.match(css, /campaign-level-badge\{[^}]*color:#fff[^}]*#46c65b/);
});

test('métodos sem perdas são priorizados antes dos casos com risco e da tática de Fedor', () => {
  const source = read('src/components/CampanhaMapa.jsx');
  const special = source.indexOf('<SpecialTroopsTactic');
  const safe = source.indexOf('safeGuides.map');
  const fedor = source.indexOf('<FedorTactic');
  const other = source.indexOf('otherGuides.map');
  assert.ok(special >= 0 && safe > special && fedor > safe && other > fedor);
});


test('Lago usa módulo de dados próprio e diferencia ausência confirmada de recompensa pendente', () => {
  const lake = read('api/seeds/campos/lago.js');
  const shared = read('api/seeds/campos/shared.js');
  const rewards = read('src/components/campanha/RewardsBlock.jsx');
  assert.match(lake, /LAGO_SEED/);
  assert.match(lake, /emblema-dragao-agua/);
  assert.match(lake, /nucleo-sombrio/);
  assert.match(shared, /createFieldSeed/);
  assert.match(rewards, /no_rewards_confirmed/);
  for (const asset of ['emblema-dragao-agua.webp','emblema-dragao-gelo.webp','emblema-dragao-paradisiaco.webp','nucleo-sombrio.webp']) {
    assert.equal(existsSync(`public/assets/items/fields/lake/${asset}`), true);
  }
});

test('Antropos abre recomendações, recursos, recompensas e composição expandidos e traduz tropas', () => {
  const source = read('src/components/CampanhaMapa.jsx');
  assert.match(source, /recommendations_disclaimer/);
  assert.match(source, /className="campaign-attack-section" defaultOpen=\{entry\.categoria === 'antropos'\}/);
  assert.match(source, /campaign\.resources[\s\S]*defaultOpen=\{entry\.categoria === 'antropos'\}/);
  assert.match(source, /RewardsBlock[\s\S]*defaultOpen=\{entry\.categoria === 'antropos'\}/);
  assert.match(source, /campaign\.enemy_composition[\s\S]*defaultOpen=\{entry\.categoria === 'antropos'\}/);
  assert.match(source, /troop\?\.i18n\?\.\[locale\]\?\.nome/);
});

test('Mapa & Campanha aceita atalho direto para o Campo indicado pelo Dragão', () => {
  const source = read('src/components/CampanhaMapa.jsx');
  assert.match(source, /guiadoa_open_field/);
  assert.match(source, /setCategory\('campos'\)/);
  assert.match(source, /setFieldType\(requestedField\)/);
  assert.match(source, /recompensasStatus === 'confirmado'/);
});
