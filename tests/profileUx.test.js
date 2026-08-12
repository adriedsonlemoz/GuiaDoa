import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { parseUtcOffset } from '../src/utils/timezone.js';
import { getProfile, saveProfile, STORAGE_KEYS } from '../src/utils/storage.js';

const read = path => readFileSync(new URL(`../${path}`, import.meta.url), 'utf8');

function memoryStorage() {
  const map = new Map();
  return {
    getItem: key => map.has(key) ? map.get(key) : null,
    setItem: (key, value) => map.set(key, String(value)),
    removeItem: key => map.delete(key),
  };
}

test('perfil não exibe nem persiste mais ID do jogador', () => {
  const form = read('src/components/ProfileLogin/ProfileForm.jsx');
  const details = read('src/components/ProfileLogin/ProfileDetailsStep.jsx');
  const card = read('src/components/home/HomeProfileCard.jsx');
  assert.doesNotMatch(form, /playerId|player_id/);
  assert.doesNotMatch(details, /playerId|player_id/);
  assert.doesNotMatch(card, /playerId|player_id|ID:/);
});

test('perfil legado remove playerId sem perder nome, reino e fuso', () => {
  globalThis.localStorage = memoryStorage();
  localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify({ nome:'A', reino:'Zulanka', fuso:'UTC-4', playerId:'123' }));
  const profile = getProfile();
  assert.deepEqual(profile, { nome:'A', reino:'Zulanka', fuso:'UTC-4' });
  assert.deepEqual(JSON.parse(localStorage.getItem(STORAGE_KEYS.PROFILE)), profile);

  saveProfile({ ...profile, playerId:'456' });
  assert.deepEqual(JSON.parse(localStorage.getItem(STORAGE_KEYS.PROFILE)), profile);
});

test('seletor de reinos mantém ID interno sem exibi-lo na interface', () => {
  const selector = read('src/components/ProfileLogin/ReinoSelector.jsx');
  assert.doesNotMatch(selector, /\{reino\.id\}|\{selecionado\.id\}/);
  assert.match(selector, /sort\(\(a, b\) => b\.id - a\.id\)/);
});

test('relógio da Home usa fuso do reino em vez de relógio UTC genérico', () => {
  const home = read('src/components/Home.jsx');
  const card = read('src/components/home/HomeProfileCard.jsx');
  assert.doesNotMatch(home, /useServerClock|horaServidor/);
  assert.match(card, /RealmClock/);
  assert.match(card, /fuso=\{profile\.fuso\}/);
  assert.equal(parseUtcOffset('UTC-4'), -4);
  assert.equal(parseUtcOffset('UTC+9'), 9);
  assert.equal(parseUtcOffset('UTC +1'), 1);
});

test('primeiro acesso e configurações compartilham o mesmo seletor premium de idioma', () => {
  const setup = read('src/components/ProfileLogin/ProfileLanguageStep.jsx');
  const settings = read('src/components/ProfileLogin/ConfiguracoesIdioma.jsx');
  const chooser = read('src/components/language/LanguageChooser.jsx');
  assert.match(setup, /LanguageChooser/);
  assert.match(settings, /LanguageChooser/);
  assert.match(chooser, /language\.choose_title/);
  assert.match(chooser, /language\.continue/);
  assert.match(chooser, /language\.done/);
});
