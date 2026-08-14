import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
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
  assert.doesNotMatch(admin, /base64|FileReader|image\/png/);
});
