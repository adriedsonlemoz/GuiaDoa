import { createRequire } from 'node:module';
import { dirname, join } from 'node:path';
import { tmpdir } from 'node:os';
import { mkdir } from 'node:fs/promises';
import { SNAPSHOT_TYPES } from '../../utils/allianceTracker.js';

const require = createRequire(import.meta.url);
const DEFAULT_MIN_CONFIDENCE = 0.82;
const DEFAULT_MIN_ROWS = 2;
const DEFAULT_TIMEOUT_MS = 90_000;
const OCR_CACHE_DIR = join(tmpdir(), 'guiadoa-tesseract-cache');

let workerPromise = null;
let activeProgressSink = null;
let idleTimer = null;
let queue = Promise.resolve();
const OCR_IDLE_MS = 5 * 60_000;

function enabledByEnv() {
  return !['0', 'false', 'off', 'no'].includes(String(process.env.ALLIANCE_OCR_ENABLED || 'true').trim().toLowerCase());
}

function envNumber(name, fallback, min, max) {
  const value = Number(process.env[name]);
  if (!Number.isFinite(value)) return fallback;
  return Math.max(min, Math.min(max, value));
}

export function normalizeOcrSearchText(value = '') {
  return String(value)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[’‘`´]/g, "'")
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();
}

export function detectSnapshotTypeFromOcr(text = '') {
  const normalized = normalizeOcrSearchText(text);
  if (!normalized) return null;
  // Colunas de data/conexão são mais específicas; deixe o termo genérico Poder/Power por último.
  if (/(data\s+de\s+entrada|entrada\s+na\s+alianca|join(?:ed)?\s+(?:at|date)|alliance\s+join)/.test(normalized)) return 'joined_at';
  if (/(ultima\s+conex|last\s+connection|last\s+login)/.test(normalized)) return 'last_connection';
  if (/\b(poder|power)\b/.test(normalized)) return 'power';
  return null;
}

function parseTsv(tsv = '') {
  const lines = String(tsv || '').split(/\r?\n/).filter(Boolean);
  if (lines.length < 2) return [];
  const header = lines[0].split('\t');
  const index = Object.fromEntries(header.map((name, i) => [name, i]));
  const groups = new Map();

  for (const raw of lines.slice(1)) {
    const cols = raw.split('\t');
    if (Number(cols[index.level]) !== 5) continue;
    const text = String(cols[index.text] || '').trim();
    if (!text) continue;
    const conf = Number(cols[index.conf]);
    const left = Number(cols[index.left]) || 0;
    const key = [cols[index.page_num], cols[index.block_num], cols[index.par_num], cols[index.line_num]].join(':');
    const group = groups.get(key) || [];
    group.push({ text, conf: Number.isFinite(conf) ? conf : 0, left });
    groups.set(key, group);
  }

  return [...groups.values()].map(words => {
    words.sort((a, b) => a.left - b.left);
    const confident = words.filter(word => word.conf >= 0);
    const confidence = confident.length ? confident.reduce((sum, word) => sum + word.conf, 0) / confident.length / 100 : 0;
    return {
      text: words.map(word => word.text).join(' ').replace(/\s+/g, ' ').trim(),
      confidence: Math.max(0, Math.min(1, confidence)),
      words,
    };
  }).filter(line => line.text);
}

function normalizeValuePunctuation(value = '') {
  // Corrige apenas pontuação visualmente equivalente. Letras parecidas com dígitos
  // não são convertidas: se o OCR estiver ambíguo, a imagem deve cair no fallback.
  return String(value)
    .replace(/[–—−]/g, '-')
    .replace(/[：]/g, ':');
}

function dateCandidate(text = '') {
  const normalized = normalizeValuePunctuation(text);
  const match = normalized.match(/\b(20\d{2})-(\d{2})-(\d{2})\s+(\d{2}):(\d{2}):(\d{2})\b/);
  if (!match) return null;
  const [, year, month, day, hour, minute, second] = match;
  const numeric = [month, day, hour, minute, second].map(Number);
  if (numeric[0] < 1 || numeric[0] > 12 || numeric[1] < 1 || numeric[1] > 31 || numeric[2] > 23 || numeric[3] > 59 || numeric[4] > 59) return null;
  return { raw: match[0], normalized: `${year}-${month}-${day} ${hour}:${minute}:${second}`, index: match.index ?? -1 };
}

function powerCandidate(text = '') {
  const normalized = normalizeValuePunctuation(text);
  const matches = [...normalized.matchAll(/\b\d{1,3}(?:[.,\s]\d{3})+\b|\b\d{4,12}\b/g)];
  if (!matches.length) return null;
  const match = matches[matches.length - 1];
  const digits = match[0].replace(/\D/g, '');
  const value = Number(digits);
  if (!Number.isSafeInteger(value) || value < 1) return null;
  return { raw: match[0], value, index: match.index ?? -1 };
}

function onlineCandidate(text = '') {
  const match = String(text).match(/\b(online|conectado)\b/i);
  return match ? { raw: match[0], index: match.index ?? -1 } : null;
}

function cleanOcrName(prefix = '') {
  let name = String(prefix || '').trim();
  name = name.replace(/^\s*#?\d{1,3}\s*[.)-]?\s+/, '');
  name = name.replace(/^\s*(?:membro|member|jogador|player)\s*[:|-]?\s*/i, '');
  name = name.replace(/[\s|·•:;,-]+$/g, '').trim();
  if (!name || name.length < 2 || name.length > 80) return null;
  const normalized = normalizeOcrSearchText(name);
  if (/^(poder|power|nome|name|membro|member|ultima conexao|data de entrada)$/.test(normalized)) return null;
  if (!/[\p{L}\p{N}]/u.test(name)) return null;
  return name;
}

function suspiciousName(name = '') {
  const value = String(name);
  if (!value) return true;
  if ((value.match(/[�□]/g) || []).length) return true;
  const printable = [...value].filter(ch => /[\p{L}\p{N}\p{P}\p{S}\s]/u.test(ch)).length;
  return printable / Math.max(1, [...value].length) < 0.9;
}

export function parseAllianceOcr({ text = '', tsv = '', minRows = DEFAULT_MIN_ROWS, minConfidence = DEFAULT_MIN_CONFIDENCE } = {}) {
  const snapshotType = detectSnapshotTypeFromOcr(text);
  const lines = parseTsv(tsv);
  const rows = [];
  const warnings = [];

  for (const line of lines) {
    const normalizedLine = normalizeOcrSearchText(line.text);
    if (!normalizedLine) continue;
    if (/^(alianca|alliance|membros?|members?|nome|name|poder|power)\b/.test(normalizedLine) && line.text.length < 80) continue;

    if (snapshotType === 'power') {
      const value = powerCandidate(line.text);
      if (!value || value.index <= 0) continue;
      const name = cleanOcrName(line.text.slice(0, value.index));
      if (!name || suspiciousName(name)) continue;
      rows.push({ name, power: value.value, confidence: line.confidence });
      continue;
    }

    if (snapshotType === 'last_connection') {
      const date = dateCandidate(line.text);
      const online = onlineCandidate(line.text);
      const marker = date || online;
      if (!marker || marker.index <= 0) continue;
      const name = cleanOcrName(line.text.slice(0, marker.index));
      if (!name || suspiciousName(name)) continue;
      rows.push({
        name,
        ...(date ? { lastConnection: date.normalized } : {}),
        online: Boolean(online),
        confidence: line.confidence,
      });
      continue;
    }

    if (snapshotType === 'joined_at') {
      const date = dateCandidate(line.text);
      if (!date || date.index <= 0) continue;
      const name = cleanOcrName(line.text.slice(0, date.index));
      if (!name || suspiciousName(name)) continue;
      rows.push({ name, joinedAt: date.normalized, confidence: line.confidence });
    }
  }

  const deduped = [];
  const seen = new Set();
  for (const row of rows) {
    const key = normalizeOcrSearchText(row.name);
    if (!key || seen.has(key)) continue;
    seen.add(key);
    deduped.push(row);
  }

  const averageConfidence = deduped.length
    ? deduped.reduce((sum, row) => sum + Number(row.confidence || 0), 0) / deduped.length
    : 0;
  const lowestConfidence = deduped.length
    ? Math.min(...deduped.map(row => Number(row.confidence || 0)))
    : 0;

  if (!snapshotType) warnings.push('OCR local não confirmou qual coluna da Alliance está selecionada.');
  if (deduped.length < minRows) warnings.push(`OCR local confirmou apenas ${deduped.length} linha(s); o mínimo seguro é ${minRows}.`);
  if (deduped.length && averageConfidence < minConfidence) warnings.push(`Confiança média do OCR local ficou em ${Math.round(averageConfidence * 100)}%.`);

  const accepted = Boolean(
    SNAPSHOT_TYPES.includes(snapshotType)
    && deduped.length >= minRows
    && averageConfidence >= minConfidence
    && lowestConfidence >= Math.max(0.58, minConfidence - 0.2)
  );
  const reason = accepted
    ? null
    : !SNAPSHOT_TYPES.includes(snapshotType)
      ? 'snapshot_type'
      : deduped.length < minRows
        ? 'rows'
        : 'confidence';

  return {
    accepted,
    reason,
    snapshotType,
    rows: deduped,
    warnings,
    confidence: averageConfidence,
    lowestConfidence,
    linesCount: lines.length,
  };
}

function resolveLangPath() {
  const pkg = require.resolve('@tesseract.js-data/eng/package.json');
  return join(dirname(pkg), '4.0.0_best_int');
}

function clearIdleTimer() {
  if (idleTimer) clearTimeout(idleTimer);
  idleTimer = null;
}

function scheduleIdleTermination() {
  clearIdleTimer();
  if (!workerPromise) return;
  idleTimer = setTimeout(() => { terminateWorker().catch(() => {}); }, OCR_IDLE_MS);
  idleTimer.unref?.();
}

async function terminateWorker() {
  clearIdleTimer();
  const current = workerPromise;
  workerPromise = null;
  activeProgressSink = null;
  if (!current) return;
  try {
    const worker = await current;
    await worker.terminate();
  } catch {}
}

async function getWorker() {
  clearIdleTimer();
  if (workerPromise) return workerPromise;
  workerPromise = (async () => {
    await mkdir(OCR_CACHE_DIR, { recursive: true });
    const { createWorker, PSM } = await import('tesseract.js');
    const worker = await createWorker('eng', 1, {
      langPath: resolveLangPath(),
      cachePath: OCR_CACHE_DIR,
      cacheMethod: 'none',
      logger: message => activeProgressSink?.(message),
      errorHandler: error => console.warn('[alliance-tracker] OCR local:', error?.message || error),
    });
    await worker.setParameters({
      tessedit_pageseg_mode: PSM?.AUTO || '3',
      preserve_interword_spaces: '1',
      user_defined_dpi: '180',
    });
    return worker;
  })().catch(error => {
    workerPromise = null;
    throw error;
  });
  return workerPromise;
}

function runQueued(task) {
  const next = queue.then(task, task);
  queue = next.catch(() => {});
  return next;
}

function progressEvent(message = {}) {
  const status = String(message.status || 'recognizing text');
  const progress = Math.max(0, Math.min(1, Number(message.progress) || 0));
  return { stage: 'ocr_progress', status, progress };
}

export async function extractAllianceScreenshotWithOcr({
  buffer,
  timeoutMs = DEFAULT_TIMEOUT_MS,
  minRows = envNumber('ALLIANCE_OCR_MIN_ROWS', DEFAULT_MIN_ROWS, 1, 20),
  minConfidence = envNumber('ALLIANCE_OCR_MIN_CONFIDENCE', DEFAULT_MIN_CONFIDENCE, 0.5, 0.99),
  onProgress = null,
} = {}) {
  if (!enabledByEnv()) {
    return { available: false, accepted: false, reason: 'disabled', warnings: ['OCR local desativado por configuração.'] };
  }
  if (!Buffer.isBuffer(buffer) || !buffer.length) {
    return { available: false, accepted: false, reason: 'empty_image', warnings: ['Imagem vazia para OCR local.'] };
  }

  return runQueued(async () => {
    onProgress?.({ stage: 'ocr_start', engine: 'tesseract.js' });
    let timer = null;
    try {
      const worker = await getWorker();
      let lastProgress = -1;
      let lastStatus = '';
      activeProgressSink = message => {
        const event = progressEvent(message);
        const bucket = Math.floor(event.progress * 10);
        if (event.status !== lastStatus || bucket > lastProgress) {
          lastStatus = event.status;
          lastProgress = bucket;
          onProgress?.(event);
        }
      };

      const recognition = worker.recognize(buffer, {}, { text: true, tsv: true });
      const timed = new Promise((_, reject) => {
        timer = setTimeout(() => {
          const error = new Error('OCR local excedeu o tempo de leitura.');
          error.code = 'OCR_TIMEOUT';
          reject(error);
        }, timeoutMs);
      });
      const { data } = await Promise.race([recognition, timed]);
      onProgress?.({ stage: 'ocr_parsing', engine: 'tesseract.js' });
      const parsed = parseAllianceOcr({ text: data?.text || '', tsv: data?.tsv || '', minRows, minConfidence });
      const result = {
        available: true,
        ...parsed,
        engine: 'tesseract.js',
        model: 'tesseract.js/eng-local',
      };
      onProgress?.({
        stage: parsed.accepted ? 'ocr_accepted' : 'ocr_fallback',
        engine: 'tesseract.js',
        confidence: parsed.confidence,
        rows: parsed.rows.length,
        reason: parsed.reason,
      });
      return result;
    } catch (error) {
      await terminateWorker();
      onProgress?.({ stage: 'ocr_unavailable', engine: 'tesseract.js', reason: error?.code || 'OCR_ERROR' });
      return {
        available: false,
        accepted: false,
        reason: error?.code || 'error',
        warnings: [`OCR local indisponível: ${String(error?.message || error).slice(0, 180)}`],
      };
    } finally {
      if (timer) clearTimeout(timer);
      activeProgressSink = null;
      scheduleIdleTermination();
    }
  });
}

export async function closeAllianceOcrWorker() {
  await terminateWorker();
}
