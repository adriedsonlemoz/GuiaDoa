import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { CONFIRMED_REALM_OPENINGS, sanitizeRealmCatalog } from '../src/data/realmCanonical.js';
import { convertBaseUtcTimeToRealm, parseUtcOffset } from '../src/utils/timezone.js';
import { formatRealmAge, realmAgeParts } from '../src/utils/realmAge.js';

const read = path => readFileSync(new URL(`../${path}`, import.meta.url), 'utf8');

test('beta 2.77 mantém somente as 12 aberturas explicitamente confirmadas', () => {
  assert.deepEqual(CONFIRMED_REALM_OPENINGS, {
    348:'2026-08-12T00:00:00.000Z', 347:'2026-08-12T00:00:00.000Z',
    346:'2026-08-12T00:00:00.000Z', 345:'2026-08-12T00:00:00.000Z',
    334:'2025-08-12T00:00:00.000Z', 333:'2025-08-12T00:00:00.000Z',
    332:'2025-08-12T00:00:00.000Z', 331:'2025-08-12T00:00:00.000Z',
    330:'2024-08-12T00:00:00.000Z', 329:'2024-08-12T00:00:00.000Z',
    328:'2024-08-12T00:00:00.000Z', 327:'2024-08-12T00:00:00.000Z',
  });
  assert.equal(Object.keys(CONFIRMED_REALM_OPENINGS).length, 12);
});

test('cache antigo não consegue reintroduzir data fictícia pela numeração do reino', () => {
  const sanitized = sanitizeRealmCatalog([
    { id:348, nome:'Zulanka', aberturaEm:'1999-01-01T00:00:00.000Z', horarios:{} },
    { id:344, nome:'Sierra', aberturaEm:'2025-08-12T00:00:00.000Z', horarios:{} },
    { id:337, nome:'Virelia', aberturaEm:'2024-08-12T00:00:00.000Z', horarios:{} },
    { id:326, nome:'Hinode', aberturaEm:'2020-01-01T00:00:00.000Z', horarios:{} },
  ]);
  assert.equal(sanitized[0].aberturaEm, '2026-08-12T00:00:00.000Z');
  assert.equal(sanitized[1].aberturaEm, null);
  assert.equal(sanitized[2].aberturaEm, null);
  assert.equal(sanitized[3].aberturaEm, null);
});

test('idade é sempre derivada da data e usa representação humana', () => {
  const now = new Date('2026-08-21T18:43:00-03:00');
  assert.equal(formatRealmAge('2026-08-12T00:00:00.000Z', 'pt-BR', now), '9 dias');
  assert.equal(formatRealmAge(null, 'pt-BR', now), null);
  assert.deepEqual(realmAgeParts('2026-06-08T00:00:00.000Z', new Date('2026-08-21T00:00:00Z')), { years:0, months:2, days:13, totalDays:74 });
  assert.equal(formatRealmAge('2026-06-08T00:00:00.000Z', 'pt-BR', new Date('2026-08-21T00:00:00Z')), '2 meses e 13 dias');
  assert.equal(formatRealmAge('2025-04-21T00:00:00.000Z', 'pt-BR', new Date('2026-08-21T00:00:00Z')), '1 ano e 4 meses');
  assert.equal(formatRealmAge('2024-08-21T00:00:00.000Z', 'pt-BR', new Date('2026-08-21T00:00:00Z')), '2 anos');
});

test('UTC+0 é a base única e a conversão trata virada de data', () => {
  const expected = {
    'UTC+0':['00:00',0],
    'UTC+1':['01:00',0],
    'UTC-4':['20:00',-1],
    'UTC-7':['17:00',-1],
  };
  for (const [zone,[time,dayDelta]] of Object.entries(expected)) {
    const converted = convertBaseUtcTimeToRealm('00:00', zone);
    assert.equal(converted.time, time, zone);
    assert.equal(converted.dayDelta, dayDelta, zone);
  }
  const nextDay = convertBaseUtcTimeToRealm('23:30', 'UTC+1');
  assert.equal(nextDay.time, '00:30');
  assert.equal(nextDay.dayDelta, 1);
  assert.equal(parseUtcOffset('UTC-7'), -7);
});

test('telas de horário compartilham o utilitário central em vez de contas locais', () => {
  const realm = read('src/components/Reinos.jsx');
  const tournament = read('src/hooks/useTorneioTimer.js');
  const events = read('src/components/eventos/eventUtils.js');
  const zyr = read('src/components/campanha/zyrvorthian/ZyrvorthianView.jsx');
  const clock = read('src/components/reinos/useRealmClock.js');
  for (const source of [realm,tournament,events,zyr,clock]) {
    assert.match(source, /utils\/timezone|\.\.\/\.\.\/utils\/timezone|\.\.\/\.\.\/\.\.\/utils\/timezone/);
  }
  const gameClock = read('src/config/gameClock.js');
  assert.match(gameClock, /SERVER_BASE_TIMEZONE/);
  assert.match(gameClock, /SERVER_DAILY_RESET_UTC/);
});

test('onboarding salva perfil e só libera aviso de doação após a Home renderizada', () => {
  const profile = read('src/components/ProfileLogin/ProfileForm.jsx');
  const home = read('src/components/Home.jsx');
  const app = read('src/App.jsx');
  assert.match(profile, /useState\(editing \? 1 : 0\)/); // instalação limpa começa no idioma
  assert.match(profile, /ProfileLanguageStep/);
  assert.match(profile, /ProfileDetailsStep/);
  assert.match(home, /<ProfileForm onSave=\{setProfile\} deferSave=\{false\}/); // persiste antes de Home
  assert.doesNotMatch(home, /pendingProfile/);
  assert.match(home, /requestAnimationFrame/);
  assert.match(home, /setShowTerms\(true\)/); // termos também aguardam Home ser pintada
  assert.match(home, /guiadoa:home-ready/);
  assert.match(app, /useState\(false\)/);
  assert.match(app, /addEventListener\('guiadoa:home-ready'/);
  assert.match(app, /getDonationNoticeSeen\(\)/);
  assert.match(app, /getProfile\(\)/);
});

test('varredura tipográfica mantém textos legíveis e possui fallback para telas estreitas', () => {
  const css = read('src/index.css');
  assert.match(css, /--type-page-title:/);
  assert.match(css, /--type-section-title:/);
  assert.match(css, /--type-body:/);
  assert.match(css, /--type-meta:/);
  assert.match(css, /@media \(max-width:380px\)/);
  assert.match(css, /@media \(max-width:340px\)/);
  assert.match(css, /overflow-wrap:anywhere/);
  const sizes = [];
  for (const match of css.matchAll(/font-size\s*:\s*(0?\.\d+|\d+\.\d+)rem/gi)) sizes.push(Number(match[1]));
  for (const match of css.matchAll(/font\s*:\s*[^;{}]*?(0?\.\d+|\d+\.\d+)rem(?=[/\s])/gi)) sizes.push(Number(match[1]));
  assert.ok(sizes.length > 100, 'a folha global deve expor amostra suficiente de tamanhos');
  assert.ok(Math.min(...sizes) >= 0.72, `fonte rem abaixo do mínimo: ${Math.min(...sizes)}`);
});

test('fusões ficam preparadas sem usar número como idade ou substituir abertura', () => {
  const model = read('api/models/ReinoFusao.js');
  const routes = read('api/routes/reinos.js');
  for (const field of ['reinoOriginalId','reinoParceiroId','reinoIncorporadoId','dataFusao','reinoResultanteId','numeroAnterior','numeroAtual','historico']) {
    assert.match(model, new RegExp(field));
  }
  assert.match(routes, /find\(\{ aberturaEm:\{ \$ne:null \} \}\)\.sort\(\{ aberturaEm:-1, id:-1 \}\)/);
  assert.match(routes, /criterio:'data de abertura confirmada'/);
  assert.doesNotMatch(routes, /criterio:'maior ID numérico'/);
});
