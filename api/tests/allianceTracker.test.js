import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import {
  ALLIANCE_MEMBER_LIMIT,
  computeMembershipDiff,
  mergeExtractedRows,
  normalizeMemberName,
  parsePower,
  parseRealmDate,
  scoreNicknameCandidate,
} from '../utils/allianceTracker.js';

test('Alliance Tracker respeita o limite de 120 membros do jogo', () => {
  assert.equal(ALLIANCE_MEMBER_LIMIT, 120);
});

test('normalização preserva símbolos importantes do nickname', () => {
  assert.equal(normalizeMemberName('  G⊙KU™  '), 'g⊙ku™');
  assert.equal(normalizeMemberName('Ørøchimaru'), 'ørøchimaru');
});

test('poder aceita separadores vistos no jogo', () => {
  assert.equal(parsePower('3,117,901'), 3117901);
  assert.equal(parsePower('2.441.811'), 2441811);
});

test('datas do realm são convertidas respeitando o UTC configurado', () => {
  assert.equal(parseRealmDate('2026-08-13 21:05:13', 0).toISOString(), '2026-08-13T21:05:13.000Z');
  assert.equal(parseRealmDate('2026-08-13 21:05:13', -4).toISOString(), '2026-08-14T01:05:13.000Z');
});

test('múltiplos screenshots sobrepostos são unidos sem duplicar membros', () => {
  const merged = mergeExtractedRows([
    { snapshotType:'power', rows:[{ name:'G⊙KU™', power:'3,117,901' }, { name:'IMPERADOR', power:2441811 }], warnings:[] },
    { snapshotType:'power', rows:[{ name:'IMPERADOR', power:2441811 }, { name:'Justin', power:2009132 }], warnings:[] },
  ]);
  assert.equal(merged.snapshotType, 'power');
  assert.equal(merged.rows.length, 3);
  assert.equal(merged.rows.find(r => r.name === 'G⊙KU™').power, 3117901);
});

test('primeira lista completa vira baseline e não acusa todos como entrada', () => {
  const diff = computeMembershipDiff({
    activeMembers: [],
    incomingRows: [{ name:'G⊙KU™', power:3117901 }, { name:'IMPERADOR', power:2441811 }],
    hasPreviousComplete: false,
    type:'power',
  });
  assert.equal(diff.baseline, true);
  assert.equal(diff.joined.length, 0);
  assert.equal(diff.left.length, 0);
});

test('captura completa seguinte identifica quem entrou e quem saiu', () => {
  const diff = computeMembershipDiff({
    activeMembers:[
      { _id:'a', currentName:'G⊙KU™', latestPower:3117901 },
      { _id:'b', currentName:'Fraser', latestPower:296682 },
    ],
    incomingRows:[
      { name:'G⊙KU™', power:3300000 },
      { name:'NovoJogador', power:300000 },
    ],
    hasPreviousComplete:true,
    type:'power',
  });
  assert.deepEqual(diff.joined.map(r => r.name), ['NovoJogador']);
  assert.deepEqual(diff.left.map(r => r.currentName), ['Fraser']);
});

test('troca de nick por poder próximo é apenas sugerida, nunca unida automaticamente', () => {
  const candidate = scoreNicknameCandidate({ currentName:'Player14202042', latestPower:580000 }, { name:'Dargor', power:600000 }, 'power');
  assert.ok(candidate.score >= 0.55);
  const route = readFileSync(new URL('../routes/allianceTracker.js', import.meta.url), 'utf8');
  assert.match(route, /nickname_candidate/);
  assert.match(route, /merge-members/);
});

test('importador visual usa Groq Vision sem persistir os screenshots', () => {
  const vision = readFileSync(new URL('../services/alliance/vision.js', import.meta.url), 'utf8');
  const route = readFileSync(new URL('../routes/allianceTracker.js', import.meta.url), 'utf8');
  assert.match(vision, /qwen\/qwen3\.6-27b/);
  assert.match(vision, /image_url/);
  assert.match(route, /memoryStorage\(\)/);
  assert.doesNotMatch(route, /cloudinary\.uploader|writeFile|createWriteStream/);
  assert.match(route, /files:\s*10/);
  assert.match(route, /fileSize:\s*6 \* 1024 \* 1024/);
});

test('leitor visual traduz erros do provedor em diagnósticos úteis', async () => {
  const { friendlyVisionError, visionModelCandidates } = await import('../services/alliance/vision.js');
  assert.equal(friendlyVisionError(401, '{"error":{"message":"invalid api key"}}').code, 'VISION_INVALID_KEY');
  assert.equal(friendlyVisionError(429, '{"error":{"message":"rate limit"}}').retryable, true);
  assert.equal(friendlyVisionError(404, '{"error":{"message":"model not found"}}').code, 'VISION_MODEL_UNAVAILABLE');
  const models = visionModelCandidates('modelo/customizado');
  assert.equal(models[0], 'modelo/customizado');
  assert.ok(models.includes('qwen/qwen3.6-27b'));
});

test('Alliance Tracker possui rota progressiva para narrar a leitura real', () => {
  const route = readFileSync(new URL('../routes/allianceTracker.js', import.meta.url), 'utf8');
  assert.match(route, /extract-stream/);
  assert.match(route, /application\/x-ndjson/);
  assert.match(route, /image_start/);
  assert.match(route, /merge_start/);
  assert.match(route, /mapLimited\(req\.files, 1/);
});
