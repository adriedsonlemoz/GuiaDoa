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
import { detectSnapshotTypeFromOcr, parseAllianceOcr } from '../services/alliance/ocr.js';


function allianceOcrTsv(lines = []) {
  const header = ['level','page_num','block_num','par_num','line_num','word_num','left','top','width','height','conf','text'].join('\t');
  const rows = [];
  let top = 10;
  lines.forEach((line, lineIndex) => {
    let left = 10;
    line.forEach((word, wordIndex) => {
      rows.push([5,1,1,1,lineIndex + 1,wordIndex + 1,left,top,80,20,word.conf ?? 96,word.text].join('\t'));
      left += word.width ?? 120;
    });
    top += 30;
  });
  return [header, ...rows].join('\n');
}

test('OCR local detecta os três tipos de screenshot sem depender da IA', () => {
  assert.equal(detectSnapshotTypeFromOcr('Aliança > Membros — Poder'), 'power');
  assert.equal(detectSnapshotTypeFromOcr('Aliança > Membros — Última Conexão'), 'last_connection');
  assert.equal(detectSnapshotTypeFromOcr('Alliance Members — Join Date'), 'joined_at');
  assert.equal(detectSnapshotTypeFromOcr('Data de Entrada na Aliança • Poder'), 'joined_at');
});

test('OCR local aceita linhas de Poder apenas quando a leitura é suficientemente confiável', () => {
  const parsed = parseAllianceOcr({
    text: 'Aliança Membros Poder',
    tsv: allianceOcrTsv([
      [{ text:'G⊙KU™', conf:97, width:520 }, { text:'3,117,901', conf:99 }],
      [{ text:'IMPERADOR', conf:96, width:520 }, { text:'2,441,811', conf:98 }],
    ]),
  });
  assert.equal(parsed.accepted, true);
  assert.equal(parsed.snapshotType, 'power');
  assert.deepEqual(parsed.rows.map(({ name, power }) => ({ name, power })), [
    { name:'G⊙KU™', power:3117901 },
    { name:'IMPERADOR', power:2441811 },
  ]);
});

test('OCR local rejeita leitura ambígua em vez de inventar números', () => {
  const parsed = parseAllianceOcr({
    text: 'Aliança Membros Poder',
    tsv: allianceOcrTsv([
      [{ text:'JogadorA', conf:55, width:520 }, { text:'1O0O', conf:55 }],
      [{ text:'JogadorB', conf:58, width:520 }, { text:'2O0O', conf:58 }],
    ]),
  });
  assert.equal(parsed.accepted, false);
  assert.equal(parsed.rows.length, 0);
});

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

test('importador usa OCR local primeiro, Groq somente como fallback e armazenamento temporário', () => {
  const ocr = readFileSync(new URL('../services/alliance/ocr.js', import.meta.url), 'utf8');
  const vision = readFileSync(new URL('../services/alliance/vision.js', import.meta.url), 'utf8');
  const route = readFileSync(new URL('../routes/allianceTracker.js', import.meta.url), 'utf8');
  const batch = readFileSync(new URL('../services/alliance/importBatch.js', import.meta.url), 'utf8');
  assert.match(ocr, /tesseract\.js/);
  assert.match(ocr, /@tesseract\.js-data\/eng/);
  assert.match(ocr, /parseAllianceOcr/);
  assert.match(vision, /extractAllianceScreenshotWithOcr/);
  assert.match(vision, /qwen\/qwen3\.6-27b/);
  assert.match(vision, /image_url/);
  assert.match(route, /memoryStorage\(\)/);
  assert.doesNotMatch(route, /cloudinary\.uploader/);
  assert.match(batch, /tmpdir\(\)/);
  assert.match(batch, /removeImageFiles/);
  assert.match(batch, /cancelImportBatch/);
  assert.match(route, /files:\s*10/);
  assert.match(route, /fileSize:\s*6 \* 1024 \* 1024/);
});

test('leitor visual traduz erros do provedor em diagnósticos úteis', async () => {
  const { friendlyVisionError, parseRetryAfter, visionModelCandidates } = await import('../services/alliance/vision.js');
  assert.equal(friendlyVisionError(401, '{"error":{"message":"invalid api key"}}').code, 'VISION_INVALID_KEY');
  assert.equal(friendlyVisionError(429, '{"error":{"message":"rate limit"}}').retryable, true);
  assert.equal(friendlyVisionError(404, '{"error":{"message":"model not found"}}').code, 'VISION_MODEL_UNAVAILABLE');
  assert.equal(parseRetryAfter('2.5'), 2500);
  const models = visionModelCandidates('modelo/customizado');
  assert.equal(models[0], 'modelo/customizado');
  assert.ok(models.includes('qwen/qwen3.6-27b'));
});

test('Alliance Tracker possui rota progressiva e retomável para narrar a leitura real', () => {
  const route = readFileSync(new URL('../routes/allianceTracker.js', import.meta.url), 'utf8');
  assert.match(route, /extract-stream/);
  assert.match(route, /extract-batches/);
  assert.match(route, /application\/x-ndjson/);
  assert.match(route, /image_start/);
  assert.match(route, /completed: batch\.results\.length/);
  assert.match(route, /merge_start/);
  assert.match(route, /mapLimited\(req\.files, 1/);
  assert.match(route, /ocrImagesCount/);
  assert.match(route, /aiImagesCount/);
});

test('rate limit respeita Retry-After e tenta novamente a mesma imagem antes de falhar', async () => {
  const { extractAllianceScreenshot } = await import('../services/alliance/vision.js');
  const originalFetch = global.fetch;
  const events = [];
  let calls = 0;
  global.fetch = async () => {
    calls += 1;
    if (calls === 1) return new Response('{"error":{"message":"rate limit"}}', { status:429, headers:{ 'retry-after':'0' } });
    return new Response(JSON.stringify({ choices:[{ message:{ content:JSON.stringify({ snapshotType:'power', rows:[{ name:'Teste', power:123 }], warnings:[] }) } }] }), { status:200, headers:{ 'content-type':'application/json' } });
  };
  try {
    const result = await extractAllianceScreenshot({
      apiKey:'teste', buffer:Buffer.from('imagem'), rateLimitRetries:2, baseBackoffMs:1,
      onProgress:event => events.push(event.stage),
    });
    assert.equal(calls, 2);
    assert.equal(result.rows[0].name, 'Teste');
    assert.ok(events.includes('rate_limit'));
    assert.ok(events.includes('retrying'));
  } finally {
    global.fetch = originalFetch;
  }
});

test('lote temporário preserva resultados concluídos e descarta a imagem já processada', async () => {
  const {
    appendImportBatchResult,
    cancelImportBatch,
    createImportBatch,
    loadImportBatch,
    readImportBatchImage,
  } = await import('../services/alliance/importBatch.js');
  const owner = 'teste-owner';
  const batch = await createImportBatch({
    ownerUserId: owner,
    capturedAt: '2026-08-14T12:00:00.000Z',
    files: [
      { originalname:'1.png', mimetype:'image/png', size:3, buffer:Buffer.from('one') },
      { originalname:'2.png', mimetype:'image/png', size:3, buffer:Buffer.from('two') },
    ],
  });
  try {
    assert.ok(await readImportBatchImage(batch, 0));
    await appendImportBatchResult(batch, { snapshotType:'power', rows:[{ name:'A', power:1 }], warnings:[], model:'teste' });
    assert.equal(await readImportBatchImage(batch, 0), null);
    assert.ok(await readImportBatchImage(batch, 1));
    const restored = await loadImportBatch(batch.id, owner);
    assert.equal(restored.results.length, 1);
    assert.equal(restored.currentIndex, 1);
  } finally {
    await cancelImportBatch(batch.id, owner);
  }
});
