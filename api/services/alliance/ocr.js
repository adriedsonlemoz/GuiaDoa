import { createRequire } from 'node:module';
import { dirname, join } from 'node:path';
import { tmpdir } from 'node:os';
import { mkdir } from 'node:fs/promises';
import { SNAPSHOT_TYPES, isValidDateParts } from '../../utils/allianceTracker.js';

const require = createRequire(import.meta.url);
const DEFAULT_MIN_CONFIDENCE = 0.82;
const DEFAULT_LINE_CONFIDENCE = 0.76;
const DEFAULT_MIN_ROWS = 1;
const DEFAULT_TIMEOUT_MS = 90_000;
const OCR_CACHE_DIR = join(tmpdir(), 'guiadoa-tesseract-cache');
const OCR_IDLE_MS = 5 * 60_000;
const OCR_MAX_INTERNAL_RETRIES = 1;

let workerPromise = null;
let activeProgressSink = null;
let idleTimer = null;
let queue = Promise.resolve();

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
  // Colunas de data/conexão são mais específicas; Poder/Power fica por último.
  if (/(data\s+de\s+entrada|entrada\s+na\s+alianca|join(?:ed)?\s+(?:at|date)|alliance\s+join)/.test(normalized)) return 'joined_at';
  if (/(ultima\s+conex|last\s+connection|last\s+login)/.test(normalized)) return 'last_connection';
  if (/\b(poder|power)\b/.test(normalized)) return 'power';
  return null;
}

export function imageDimensions(buffer) {
  if (!Buffer.isBuffer(buffer) || buffer.length < 24) return null;
  // PNG
  if (buffer.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]))) {
    const width = buffer.readUInt32BE(16);
    const height = buffer.readUInt32BE(20);
    return width > 0 && height > 0 ? { width, height, format: 'png' } : null;
  }
  // JPEG
  if (buffer[0] === 0xff && buffer[1] === 0xd8) {
    const sof = new Set([0xc0, 0xc1, 0xc2, 0xc3, 0xc5, 0xc6, 0xc7, 0xc9, 0xca, 0xcb, 0xcd, 0xce, 0xcf]);
    let offset = 2;
    while (offset + 9 < buffer.length) {
      if (buffer[offset] !== 0xff) { offset += 1; continue; }
      const marker = buffer[offset + 1];
      if (marker === 0xd8 || marker === 0xd9) { offset += 2; continue; }
      if (offset + 4 > buffer.length) break;
      const length = buffer.readUInt16BE(offset + 2);
      if (length < 2 || offset + 2 + length > buffer.length) break;
      if (sof.has(marker) && length >= 7) {
        const height = buffer.readUInt16BE(offset + 5);
        const width = buffer.readUInt16BE(offset + 7);
        return width > 0 && height > 0 ? { width, height, format: 'jpeg' } : null;
      }
      offset += 2 + length;
    }
  }
  // WebP VP8X (outros subtipos continuam funcionando no OCR, apenas sem ROI calculada aqui).
  if (buffer.toString('ascii', 0, 4) === 'RIFF' && buffer.toString('ascii', 8, 12) === 'WEBP' && buffer.toString('ascii', 12, 16) === 'VP8X' && buffer.length >= 30) {
    const width = 1 + buffer.readUIntLE(24, 3);
    const height = 1 + buffer.readUIntLE(27, 3);
    return width > 0 && height > 0 ? { width, height, format: 'webp' } : null;
  }
  return null;
}

export function buildOcrRegions(dimensions) {
  if (!dimensions?.width || !dimensions?.height) return { header: null, table: null, nameColumn: null, valueColumn: null };
  const { width, height } = dimensions;
  const header = {
    left: Math.max(0, Math.round(width * 0.03)),
    top: Math.max(0, Math.round(height * 0.03)),
    width: Math.max(1, Math.round(width * 0.94)),
    height: Math.max(1, Math.round(height * 0.38)),
  };
  const tableTop = Math.round(height * 0.15);
  const tableBottomMargin = Math.round(height * 0.025);
  const table = {
    left: Math.max(0, Math.round(width * 0.015)),
    top: Math.max(0, tableTop),
    width: Math.max(1, Math.round(width * 0.97)),
    height: Math.max(1, height - tableTop - tableBottomMargin),
  };
  // Divisão principal com pequena sobreposição. Uma segunda geometria mais larga
  // é usada apenas se o primeiro pareamento não reconstruir nenhuma linha.
  const makeColumns = (nameRatio, valueRatio) => {
    const valueLeft = Math.max(0, Math.round(width * valueRatio));
    return {
      nameColumn: { left: table.left, top: table.top, width: Math.max(1, Math.round(table.width * nameRatio)), height: table.height },
      valueColumn: { left: valueLeft, top: table.top, width: Math.max(1, width - valueLeft - Math.round(width * 0.015)), height: table.height },
    };
  };
  const primary = makeColumns(0.62, 0.55);
  const alternate = makeColumns(0.74, 0.63);
  return { header, table, ...primary, columnVariants: [primary, alternate] };
}

function tsvWords(tsv = '') {
  const lines = String(tsv || '').split(/\r?\n/).filter(Boolean);
  if (lines.length < 2) return [];
  const header = lines[0].split('\t');
  const index = Object.fromEntries(header.map((name, i) => [name, i]));
  return lines.slice(1).map(raw => {
    const cols = raw.split('\t');
    if (Number(cols[index.level]) !== 5) return null;
    const text = String(cols[index.text] || '').trim();
    if (!text) return null;
    const conf = Number(cols[index.conf]);
    return {
      text,
      conf: Number.isFinite(conf) ? conf : 0,
      left: Number(cols[index.left]) || 0,
      top: Number(cols[index.top]) || 0,
      width: Number(cols[index.width]) || 0,
      height: Number(cols[index.height]) || 0,
      page: cols[index.page_num] || '1',
      block: cols[index.block_num] || '0',
      par: cols[index.par_num] || '0',
      line: cols[index.line_num] || '0',
    };
  }).filter(Boolean);
}

function lineFromWords(words = []) {
  if (!words.length) return null;
  const sorted = [...words].sort((a, b) => a.left - b.left);
  const confident = sorted.filter(word => word.conf >= 0);
  const confidence = confident.length ? confident.reduce((sum, word) => sum + word.conf, 0) / confident.length / 100 : 0;
  const minLeft = Math.min(...sorted.map(word => word.left));
  const minTop = Math.min(...sorted.map(word => word.top));
  const maxRight = Math.max(...sorted.map(word => word.left + word.width));
  const maxBottom = Math.max(...sorted.map(word => word.top + word.height));
  return {
    text: sorted.map(word => word.text).join(' ').replace(/\s+/g, ' ').trim(),
    confidence: Math.max(0, Math.min(1, confidence)),
    words: sorted,
    box: { left: minLeft, top: minTop, width: Math.max(1, maxRight - minLeft), height: Math.max(1, maxBottom - minTop) },
  };
}

function visualLines(words = []) {
  if (!words.length) return [];
  const heights = words.map(word => Math.max(1, word.height)).sort((a, b) => a - b);
  const medianHeight = heights[Math.floor(heights.length / 2)] || 16;
  const tolerance = Math.max(6, medianHeight * 0.72);
  const clusters = [];

  for (const word of [...words].sort((a, b) => (a.top + a.height / 2) - (b.top + b.height / 2) || a.left - b.left)) {
    const center = word.top + word.height / 2;
    let best = null;
    let distance = Infinity;
    for (const cluster of clusters) {
      const delta = Math.abs(center - cluster.center);
      if (delta <= tolerance && delta < distance) {
        best = cluster;
        distance = delta;
      }
    }
    if (!best) {
      clusters.push({ center, words: [word] });
    } else {
      best.words.push(word);
      best.center = best.words.reduce((sum, item) => sum + item.top + item.height / 2, 0) / best.words.length;
    }
  }
  return clusters.map(cluster => lineFromWords(cluster.words)).filter(line => line?.text);
}

function parseTsv(tsv = '') {
  const words = tsvWords(tsv);
  if (!words.length) return [];
  const grouped = new Map();
  for (const word of words) {
    const key = [word.page, word.block, word.par, word.line].join(':');
    const group = grouped.get(key) || [];
    group.push(word);
    grouped.set(key, group);
  }
  const nativeLines = [...grouped.values()].map(lineFromWords).filter(line => line?.text);
  const reconstructed = visualLines(words);
  const all = [...nativeLines, ...reconstructed];
  const deduped = [];
  for (const line of all) {
    const normalized = normalizeOcrSearchText(line.text);
    const center = line.box.top + line.box.height / 2;
    const duplicate = deduped.some(existing => {
      const sameText = normalizeOcrSearchText(existing.text) === normalized;
      const existingCenter = existing.box.top + existing.box.height / 2;
      return sameText && Math.abs(existingCenter - center) <= Math.max(5, line.box.height);
    });
    if (!duplicate) deduped.push(line);
  }
  return deduped.sort((a, b) => a.box.top - b.box.top || a.box.left - b.box.left);
}

function normalizeValuePunctuation(value = '') {
  // Corrige apenas pontuação/espaçamento visualmente equivalentes. Letras parecidas
  // com dígitos continuam intocadas: ambiguidade numérica vai para revisão.
  return String(value)
    .replace(/[–—−]/g, '-')
    .replace(/[：]/g, ':')
    .replace(/(\d)\s*([.,:/-])\s*(?=\d)/g, '$1$2')
    .replace(/\s+/g, ' ')
    .trim();
}

function dateCandidate(text = '') {
  const normalized = normalizeValuePunctuation(text);
  const match = normalized.match(/\b(20\d{2})[-/.](\d{2})[-/.](\d{2})\s+(\d{2}):(\d{2})(?::(\d{2}))?\b/);
  if (!match) return null;
  const [, year, month, day, hour, minute, second = '00'] = match;
  if (!isValidDateParts(Number(year), Number(month), Number(day), Number(hour), Number(minute), Number(second))) return null;
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

function looksLikeDataLine(text = '', snapshotType = null) {
  if (!text || !snapshotType) return false;
  if (snapshotType === 'power') return /\d/.test(text) && text.length >= 4;
  if (snapshotType === 'last_connection') return /\d{2}:\d{2}|online|conectado/i.test(text);
  if (snapshotType === 'joined_at') return /20\d{2}[-/.]/.test(text);
  return false;
}

function valueKey(row = {}, type = 'power') {
  if (type === 'power') return row.power == null ? '' : String(row.power);
  if (type === 'last_connection') return row.online ? 'online' : String(row.lastConnection || '');
  return String(row.joinedAt || '');
}

export function parseAllianceOcr({
  text = '',
  tsv = '',
  snapshotTypeHint = null,
  minRows = DEFAULT_MIN_ROWS,
  minConfidence = DEFAULT_MIN_CONFIDENCE,
  lineMinConfidence = DEFAULT_LINE_CONFIDENCE,
} = {}) {
  const detectedFromText = detectSnapshotTypeFromOcr(text);
  const snapshotType = SNAPSHOT_TYPES.includes(snapshotTypeHint) ? snapshotTypeHint : detectedFromText;
  const lines = parseTsv(tsv);
  const rows = [];
  const exceptions = [];
  const warnings = [];

  for (const [lineIndex, line] of lines.entries()) {
    const normalizedLine = normalizeOcrSearchText(line.text);
    if (!normalizedLine) continue;
    if (/^(alianca|alliance|membros?|members?|nome|name|poder|power)\b/.test(normalizedLine) && line.text.length < 80) continue;

    let row = null;
    let marker = null;
    if (snapshotType === 'power') {
      marker = powerCandidate(line.text);
      if (marker && marker.index > 0) {
        const name = cleanOcrName(line.text.slice(0, marker.index));
        if (name && !suspiciousName(name)) row = { name, power: marker.value, confidence: line.confidence };
      }
    } else if (snapshotType === 'last_connection') {
      const date = dateCandidate(line.text);
      const online = onlineCandidate(line.text);
      marker = date || online;
      if (marker && marker.index > 0) {
        const name = cleanOcrName(line.text.slice(0, marker.index));
        if (name && !suspiciousName(name)) {
          row = { name, ...(date ? { lastConnection: date.normalized } : {}), online: Boolean(online), confidence: line.confidence };
        }
      }
    } else if (snapshotType === 'joined_at') {
      marker = dateCandidate(line.text);
      if (marker && marker.index > 0) {
        const name = cleanOcrName(line.text.slice(0, marker.index));
        if (name && !suspiciousName(name)) row = { name, joinedAt: marker.normalized, confidence: line.confidence };
      }
    }

    if (row) {
      const reviewRequired = Number(row.confidence || 0) < lineMinConfidence;
      rows.push({
        ...row,
        source: 'ocr',
        reviewRequired,
        reviewReasons: reviewRequired ? ['low_ocr_confidence'] : [],
        ocrLine: lineIndex,
        ocrBox: line.box,
      });
      if (reviewRequired) {
        exceptions.push({
          type: 'low_confidence',
          line: lineIndex,
          name: row.name,
          confidence: row.confidence,
          value: valueKey(row, snapshotType),
          text: line.text.slice(0, 180),
        });
      }
      continue;
    }

    if (looksLikeDataLine(line.text, snapshotType) && line.confidence >= 0.35) {
      exceptions.push({
        type: 'unparsed_line',
        line: lineIndex,
        confidence: line.confidence,
        text: line.text.slice(0, 180),
      });
    }
  }

  const deduped = [];
  const seen = new Map();
  for (const row of rows) {
    const key = normalizeOcrSearchText(row.name);
    if (!key) continue;
    const prior = seen.get(key);
    if (!prior) {
      seen.set(key, row);
      deduped.push(row);
      continue;
    }
    if (Number(row.confidence || 0) > Number(prior.confidence || 0)) {
      const index = deduped.indexOf(prior);
      if (index >= 0) deduped[index] = row;
      seen.set(key, row);
    }
  }

  const trustedRows = deduped.filter(row => !row.reviewRequired);
  const averageConfidence = trustedRows.length
    ? trustedRows.reduce((sum, row) => sum + Number(row.confidence || 0), 0) / trustedRows.length
    : 0;
  const lowestConfidence = trustedRows.length
    ? Math.min(...trustedRows.map(row => Number(row.confidence || 0)))
    : 0;

  if (!snapshotType) warnings.push('OCR local não confirmou qual coluna da Alliance está selecionada.');
  if (trustedRows.length < minRows) warnings.push(`OCR local confirmou apenas ${trustedRows.length} linha(s) segura(s); o mínimo é ${minRows}.`);
  if (trustedRows.length && averageConfidence < minConfidence) warnings.push(`Confiança média das linhas seguras ficou em ${Math.round(averageConfidence * 100)}%.`);
  if (exceptions.length) warnings.push(`${exceptions.length} linha(s) ficaram como exceção e precisam de validação adicional.`);

  const accepted = Boolean(
    SNAPSHOT_TYPES.includes(snapshotType)
    && trustedRows.length >= minRows
    && averageConfidence >= minConfidence
    && lowestConfidence >= Math.max(0.62, lineMinConfidence - 0.08)
    && exceptions.length === 0
  );
  const usable = Boolean(SNAPSHOT_TYPES.includes(snapshotType) && trustedRows.length >= minRows);
  const reason = accepted
    ? null
    : !SNAPSHOT_TYPES.includes(snapshotType)
      ? 'snapshot_type'
      : trustedRows.length < minRows
        ? 'rows'
        : exceptions.length
          ? 'exceptions'
          : 'confidence';

  const parsedRatio = lines.length ? deduped.length / Math.max(1, lines.filter(line => looksLikeDataLine(line.text, snapshotType)).length || deduped.length) : 0;
  const qualityScore = Math.max(0, Math.min(1,
    (SNAPSHOT_TYPES.includes(snapshotType) ? 0.2 : 0)
    + Math.min(0.25, trustedRows.length * 0.025)
    + averageConfidence * 0.45
    + Math.min(0.1, parsedRatio * 0.1)
    - Math.min(0.25, exceptions.length * 0.035)
  ));

  return {
    accepted,
    usable,
    reason,
    snapshotType,
    detectedFromText,
    rows: deduped,
    trustedRows,
    exceptions,
    warnings,
    confidence: averageConfidence,
    lowestConfidence,
    linesCount: lines.length,
    parsedRatio,
    qualityScore,
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
    const { createWorker } = await import('tesseract.js');
    return createWorker('eng', 1, {
      langPath: resolveLangPath(),
      cachePath: OCR_CACHE_DIR,
      cacheMethod: 'none',
      logger: message => activeProgressSink?.(message),
      errorHandler: error => console.warn('[alliance-tracker] OCR local:', error?.message || error),
    });
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

function progressEvent(message = {}, meta = {}) {
  const status = String(message.status || 'recognizing text');
  const progress = Math.max(0, Math.min(1, Number(message.progress) || 0));
  return { stage: 'ocr_progress', status, progress, ...meta };
}

function safeText(value = '', max = 6000) {
  return String(value || '').replace(/\u0000/g, '').slice(0, max);
}

function passParameters(variant = 'standard', psm = '6', role = 'mixed', snapshotType = null) {
  const base = {
    tessedit_pageseg_mode: String(psm),
    preserve_interword_spaces: '1',
    user_defined_dpi: variant === 'adaptive' ? '300' : '220',
    thresholding_method: variant === 'adaptive' ? '2' : '0',
    tessedit_char_whitelist: '',
  };
  if (variant === 'adaptive') {
    base.thresholding_window_size = '0.33';
    base.thresholding_kfactor = '0.34';
  }
  if (role === 'value') {
    if (snapshotType === 'power') base.tessedit_char_whitelist = '0123456789., ';
    else if (snapshotType === 'joined_at') base.tessedit_char_whitelist = '0123456789-/: ';
    else if (snapshotType === 'last_connection') base.tessedit_char_whitelist = '0123456789-/: OnlineonlineConectadoconectado';
  }
  return base;
}

async function recognizePass({
  worker,
  buffer,
  rectangle = null,
  timeoutMs,
  variant,
  region,
  psm,
  role = 'mixed',
  snapshotType = null,
  onProgress,
}) {
  onProgress?.({ stage: 'ocr_region', region, variant, role, rectangle: rectangle || null });
  await worker.setParameters(passParameters(variant, psm, role, snapshotType));
  let lastProgress = -1;
  let lastStatus = '';
  activeProgressSink = message => {
    const event = progressEvent(message, { region, variant, role });
    const bucket = Math.floor(event.progress * 10);
    if (event.status !== lastStatus || bucket > lastProgress) {
      lastStatus = event.status;
      lastProgress = bucket;
      onProgress?.(event);
    }
  };

  let timer = null;
  try {
    const recognition = worker.recognize(
      buffer,
      { ...(rectangle ? { rectangle } : {}), rotateAuto: true },
      { text: true, tsv: true },
    );
    const timed = new Promise((_, reject) => {
      timer = setTimeout(() => {
        const error = new Error(`OCR local excedeu o tempo na região ${region}.`);
        error.code = 'OCR_TIMEOUT';
        error.region = region;
        reject(error);
      }, timeoutMs);
    });
    const { data } = await Promise.race([recognition, timed]);
    return {
      text: safeText(data?.text || ''),
      tsv: String(data?.tsv || ''),
      region,
      variant,
      role,
      rectangle,
    };
  } finally {
    if (timer) clearTimeout(timer);
    activeProgressSink = null;
  }
}

function offsetBox(box = null, rectangle = null) {
  if (!box) return null;
  return {
    left: Number(box.left || 0) + Number(rectangle?.left || 0),
    top: Number(box.top || 0) + Number(rectangle?.top || 0),
    width: Math.max(1, Number(box.width || 1)),
    height: Math.max(1, Number(box.height || 1)),
  };
}

function annotateParsedGeometry(parsed, rectangle, dimensions, region) {
  if (!parsed) return parsed;
  const annotate = row => ({
    ...row,
    ocrBox: offsetBox(row.ocrBox, rectangle),
    ocrImageDimensions: dimensions ? { width: dimensions.width, height: dimensions.height } : null,
    ocrRegion: region,
  });
  return {
    ...parsed,
    rows: (parsed.rows || []).map(annotate),
    trustedRows: (parsed.trustedRows || []).map(annotate),
  };
}

function valueFromText(text = '', snapshotType = null) {
  if (snapshotType === 'power') {
    const marker = powerCandidate(text);
    return marker ? { power: marker.value, raw: marker.raw } : null;
  }
  if (snapshotType === 'joined_at') {
    const marker = dateCandidate(text);
    return marker ? { joinedAt: marker.normalized, raw: marker.raw } : null;
  }
  if (snapshotType === 'last_connection') {
    const date = dateCandidate(text);
    const online = onlineCandidate(text);
    if (date) return { lastConnection: date.normalized, online: false, raw: date.raw };
    if (online) return { lastConnection: '', online: true, raw: online.raw };
  }
  return null;
}

function cleanNameOnlyLine(text = '') {
  let name = cleanOcrName(text);
  if (!name) return null;
  const normalized = normalizeOcrSearchText(name);
  if (/^(alianca|alliance|membros?|members?|nome|name|poder|power|ultima conexao|last connection|data de entrada|join date)$/.test(normalized)) return null;
  // Evita tratar uma linha composta só por valor como nickname.
  if (/^[\d\s.,:/-]+$/.test(name)) return null;
  return suspiciousName(name) ? null : name;
}

function parseColumnPairs({
  namesTsv = '',
  valuesTsv = '',
  snapshotType,
  minRows,
  minConfidence,
  lineMinConfidence,
  nameRectangle = null,
  valueRectangle = null,
  dimensions = null,
} = {}) {
  const nameLines = parseTsv(namesTsv).map(line => ({
    ...line,
    box: offsetBox(line.box, nameRectangle),
    name: cleanNameOnlyLine(line.text),
  })).filter(line => line.name);
  const valueLines = parseTsv(valuesTsv).map(line => ({
    ...line,
    box: offsetBox(line.box, valueRectangle),
    value: valueFromText(line.text, snapshotType),
  })).filter(line => line.value);

  const pairs = [];
  const usedNames = new Set();
  for (const valueLine of valueLines) {
    const valueCenter = valueLine.box.top + valueLine.box.height / 2;
    const candidates = nameLines
      .map((nameLine, index) => {
        const nameCenter = nameLine.box.top + nameLine.box.height / 2;
        const scale = Math.max(8, Math.max(nameLine.box.height, valueLine.box.height) * 1.35);
        return { nameLine, index, distance: Math.abs(nameCenter - valueCenter), scale };
      })
      .filter(item => !usedNames.has(item.index) && item.distance <= item.scale)
      .sort((a, b) => a.distance - b.distance || b.nameLine.confidence - a.nameLine.confidence);
    if (!candidates.length) continue;
    const match = candidates[0];
    usedNames.add(match.index);
    const confidence = Math.max(0, Math.min(1, Math.min(match.nameLine.confidence, valueLine.confidence)));
    const left = Math.min(match.nameLine.box.left, valueLine.box.left);
    const top = Math.min(match.nameLine.box.top, valueLine.box.top);
    const right = Math.max(match.nameLine.box.left + match.nameLine.box.width, valueLine.box.left + valueLine.box.width);
    const bottom = Math.max(match.nameLine.box.top + match.nameLine.box.height, valueLine.box.top + valueLine.box.height);
    const reviewRequired = confidence < lineMinConfidence;
    pairs.push({
      name: match.nameLine.name,
      ...valueLine.value,
      confidence,
      source: 'ocr',
      reviewRequired,
      reviewReasons: reviewRequired ? ['low_ocr_confidence'] : [],
      ocrBox: { left, top, width: right - left, height: bottom - top },
      ocrImageDimensions: dimensions ? { width: dimensions.width, height: dimensions.height } : null,
      ocrRegion: 'column-pair',
    });
  }

  const trustedRows = pairs.filter(row => !row.reviewRequired);
  const confidence = trustedRows.length
    ? trustedRows.reduce((sum, row) => sum + Number(row.confidence || 0), 0) / trustedRows.length
    : 0;
  const exceptions = pairs.filter(row => row.reviewRequired).map((row, line) => ({
    type: 'low_confidence',
    line,
    name: row.name,
    confidence: row.confidence,
  }));
  const accepted = trustedRows.length >= minRows && confidence >= minConfidence && exceptions.length === 0;
  const usable = trustedRows.length >= minRows || pairs.length >= minRows;
  const warnings = [];
  if (trustedRows.length < minRows) warnings.push(`Pareamento por colunas confirmou ${trustedRows.length} linha(s) segura(s).`);
  if (exceptions.length) warnings.push(`${exceptions.length} linha(s) pareadas ficaram para revisão.`);

  return {
    accepted,
    usable,
    reason: accepted ? null : trustedRows.length < minRows ? 'rows' : exceptions.length ? 'exceptions' : 'confidence',
    snapshotType,
    detectedFromText: snapshotType,
    rows: pairs,
    trustedRows,
    exceptions,
    warnings,
    confidence,
    lowestConfidence: trustedRows.length ? Math.min(...trustedRows.map(row => row.confidence)) : 0,
    linesCount: Math.max(nameLines.length, valueLines.length),
    parsedRatio: valueLines.length ? pairs.length / valueLines.length : 0,
    qualityScore: Math.max(0, Math.min(1, (pairs.length ? 0.3 : 0) + confidence * 0.55 + Math.min(0.15, pairs.length * 0.02))),
    columnPairing: true,
  };
}

function chooseBestParse(candidates = []) {
  return [...candidates].filter(Boolean).sort((a, b) => {
    if (a.accepted !== b.accepted) return a.accepted ? -1 : 1;
    if (a.usable !== b.usable) return a.usable ? -1 : 1;
    if ((a.trustedRows?.length || 0) !== (b.trustedRows?.length || 0)) return (b.trustedRows?.length || 0) - (a.trustedRows?.length || 0);
    if ((a.rows?.length || 0) !== (b.rows?.length || 0)) return (b.rows?.length || 0) - (a.rows?.length || 0);
    if ((a.exceptions?.length || 0) !== (b.exceptions?.length || 0)) return (a.exceptions?.length || 0) - (b.exceptions?.length || 0);
    return Number(b.qualityScore || 0) - Number(a.qualityScore || 0);
  })[0] || null;
}

async function runOcrPipeline({
  buffer,
  timeoutMs,
  minRows,
  minConfidence,
  lineMinConfidence,
  onProgress,
  forceFull = false,
  snapshotTypeHint = null,
}) {
  const worker = await getWorker();
  const dimensions = imageDimensions(buffer);
  const regions = buildOcrRegions(dimensions);
  const perPassTimeout = Math.max(12_000, Math.floor(timeoutMs / 5));
  const passes = [];
  const parsedCandidates = [];
  let snapshotType = SNAPSHOT_TYPES.includes(snapshotTypeHint) ? snapshotTypeHint : null;
  let headerText = '';

  onProgress?.({ stage: 'ocr_layout', dimensions, roi: Boolean(regions.header && !forceFull), columns: Boolean(regions.nameColumn && regions.valueColumn) });
  if (snapshotType) {
    onProgress?.({ stage: 'ocr_type_hint', snapshotType, forced: true });
  }

  if (!snapshotType && regions.header && !forceFull) {
    const headerPass = await recognizePass({
      worker, buffer, rectangle: regions.header, timeoutMs: perPassTimeout,
      variant: 'standard', region: 'header', psm: '11', role: 'mixed', onProgress,
    });
    passes.push({ region: 'header', variant: 'standard', role: 'mixed' });
    headerText = headerPass.text;
    snapshotType = detectSnapshotTypeFromOcr(headerText);
    onProgress?.({ stage: 'ocr_header', snapshotType, textFound: Boolean(headerText), region: 'header' });
  }

  if (!snapshotType) {
    const fullPass = await recognizePass({
      worker, buffer, rectangle: null, timeoutMs: perPassTimeout,
      variant: 'standard', region: 'full', psm: '3', role: 'mixed', onProgress,
    });
    passes.push({ region: 'full', variant: 'standard', role: 'mixed' });
    headerText = `${headerText}\n${fullPass.text}`.trim();
    snapshotType = detectSnapshotTypeFromOcr(headerText);
    let parsedFull = parseAllianceOcr({
      text: fullPass.text,
      tsv: fullPass.tsv,
      snapshotTypeHint: snapshotType,
      minRows,
      minConfidence,
      lineMinConfidence,
    });
    parsedFull = annotateParsedGeometry(parsedFull, null, dimensions, 'full');
    parsedCandidates.push({ ...parsedFull, pass: 'full-standard', rawText: safeText(fullPass.text) });
    onProgress?.({ stage: 'ocr_header', snapshotType, textFound: Boolean(fullPass.text), region: 'full' });
    if (parsedFull.accepted) {
      return { parsed: parsedFull, passes, rawText: safeText(fullPass.text), headerText: safeText(headerText, 1200), dimensions, regions };
    }
  }

  if (snapshotType && regions.table && !forceFull) {
    const tablePass = await recognizePass({
      worker, buffer, rectangle: regions.table, timeoutMs: perPassTimeout,
      variant: 'standard', region: 'table', psm: '6', role: 'mixed', snapshotType, onProgress,
    });
    passes.push({ region: 'table', variant: 'standard', role: 'mixed' });
    let parsed = parseAllianceOcr({
      text: `${headerText}\n${tablePass.text}`,
      tsv: tablePass.tsv,
      snapshotTypeHint: snapshotType,
      minRows,
      minConfidence,
      lineMinConfidence,
    });
    parsed = annotateParsedGeometry(parsed, regions.table, dimensions, 'table');
    parsedCandidates.push({ ...parsed, pass: 'table-standard', rawText: safeText(tablePass.text) });
    if (parsed.accepted) {
      return { parsed, passes, rawText: safeText(tablePass.text), headerText: safeText(headerText, 1200), dimensions, regions };
    }

    onProgress?.({ stage: 'ocr_variant', variant: 'adaptive', reason: parsed.reason, exceptions: parsed.exceptions.length });
    const adaptivePass = await recognizePass({
      worker, buffer, rectangle: regions.table, timeoutMs: perPassTimeout,
      variant: 'adaptive', region: 'table', psm: '11', role: 'mixed', snapshotType, onProgress,
    });
    passes.push({ region: 'table', variant: 'adaptive', role: 'mixed' });
    let adaptive = parseAllianceOcr({
      text: `${headerText}\n${adaptivePass.text}`,
      tsv: adaptivePass.tsv,
      snapshotTypeHint: snapshotType,
      minRows,
      minConfidence,
      lineMinConfidence,
    });
    adaptive = annotateParsedGeometry(adaptive, regions.table, dimensions, 'table');
    parsedCandidates.push({ ...adaptive, pass: 'table-adaptive', rawText: safeText(adaptivePass.text) });
    if (adaptive.accepted) {
      return { parsed: adaptive, passes, rawText: safeText(adaptivePass.text), headerText: safeText(headerText, 1200), dimensions, regions };
    }

    // Quando o TSV separa nickname e valor em blocos diferentes, uma leitura única
    // não consegue formar a linha. Lemos as colunas separadamente e pareamos pelo eixo Y.
    const currentBest = chooseBestParse(parsedCandidates);
    if ((currentBest?.trustedRows?.length || 0) < minRows && regions.nameColumn && regions.valueColumn) {
      onProgress?.({ stage: 'ocr_column_pairing', snapshotType, reason: currentBest?.reason || 'rows' });
      const namePass = await recognizePass({
        worker, buffer, rectangle: regions.nameColumn, timeoutMs: perPassTimeout,
        variant: 'standard', region: 'name-column', psm: '6', role: 'name', snapshotType, onProgress,
      });
      passes.push({ region: 'name-column', variant: 'standard', role: 'name' });
      const valuePass = await recognizePass({
        worker, buffer, rectangle: regions.valueColumn, timeoutMs: perPassTimeout,
        variant: 'adaptive', region: 'value-column', psm: '6', role: 'value', snapshotType, onProgress,
      });
      passes.push({ region: 'value-column', variant: 'adaptive', role: 'value' });
      const paired = parseColumnPairs({
        namesTsv: namePass.tsv,
        valuesTsv: valuePass.tsv,
        snapshotType,
        minRows,
        minConfidence,
        lineMinConfidence,
        nameRectangle: regions.nameColumn,
        valueRectangle: regions.valueColumn,
        dimensions,
      });
      parsedCandidates.push({ ...paired, pass: 'column-pair', rawText: safeText(`${namePass.text}\n${valuePass.text}`) });
      onProgress?.({
        stage: 'ocr_column_pairing_done',
        snapshotType,
        rows: paired.rows.length,
        trustedRows: paired.trustedRows.length,
        exceptions: paired.exceptions.length,
      });
      if (paired.accepted) {
        return { parsed: paired, passes, rawText: safeText(`${namePass.text}\n${valuePass.text}`), headerText: safeText(headerText, 1200), dimensions, regions };
      }

      if (!paired.rows.length && Array.isArray(regions.columnVariants) && regions.columnVariants[1]) {
        const alt = regions.columnVariants[1];
        onProgress?.({ stage: 'ocr_column_pairing', snapshotType, reason: 'alternate-geometry', alternate: true });
        const altNamePass = await recognizePass({
          worker, buffer, rectangle: alt.nameColumn, timeoutMs: perPassTimeout,
          variant: 'adaptive', region: 'name-column-alt', psm: '11', role: 'name', snapshotType, onProgress,
        });
        passes.push({ region: 'name-column-alt', variant: 'adaptive', role: 'name' });
        const altValuePass = await recognizePass({
          worker, buffer, rectangle: alt.valueColumn, timeoutMs: perPassTimeout,
          variant: 'adaptive', region: 'value-column-alt', psm: '11', role: 'value', snapshotType, onProgress,
        });
        passes.push({ region: 'value-column-alt', variant: 'adaptive', role: 'value' });
        const altPaired = parseColumnPairs({
          namesTsv: altNamePass.tsv, valuesTsv: altValuePass.tsv, snapshotType,
          minRows, minConfidence, lineMinConfidence,
          nameRectangle: alt.nameColumn, valueRectangle: alt.valueColumn, dimensions,
        });
        parsedCandidates.push({ ...altPaired, pass: 'column-pair-alt', rawText: safeText(`${altNamePass.text}\n${altValuePass.text}`) });
        onProgress?.({ stage: 'ocr_column_pairing_done', snapshotType, rows: altPaired.rows.length, trustedRows: altPaired.trustedRows.length, exceptions: altPaired.exceptions.length, alternate: true });
        if (altPaired.accepted) {
          return { parsed: altPaired, passes, rawText: safeText(`${altNamePass.text}\n${altValuePass.text}`), headerText: safeText(headerText, 1200), dimensions, regions };
        }
      }
    }
  }

  const bestBeforeFull = chooseBestParse(parsedCandidates);
  if (!bestBeforeFull?.accepted && (!snapshotType || forceFull || (bestBeforeFull?.rows?.length || 0) === 0)) {
    const fullAdaptive = await recognizePass({
      worker, buffer, rectangle: null, timeoutMs: perPassTimeout,
      variant: 'adaptive', region: 'full', psm: '11', role: 'mixed', snapshotType, onProgress,
    });
    passes.push({ region: 'full', variant: 'adaptive', role: 'mixed' });
    const detected = snapshotType || detectSnapshotTypeFromOcr(fullAdaptive.text);
    let parsed = parseAllianceOcr({
      text: fullAdaptive.text,
      tsv: fullAdaptive.tsv,
      snapshotTypeHint: detected,
      minRows,
      minConfidence,
      lineMinConfidence,
    });
    parsed = annotateParsedGeometry(parsed, null, dimensions, 'full');
    parsedCandidates.push({ ...parsed, pass: 'full-adaptive', rawText: safeText(fullAdaptive.text) });
    snapshotType = detected || snapshotType;
  }

  const best = chooseBestParse(parsedCandidates);
  return {
    parsed: best || parseAllianceOcr({ text: headerText, snapshotTypeHint, minRows, minConfidence, lineMinConfidence }),
    passes,
    rawText: safeText(best?.rawText || ''),
    headerText: safeText(headerText, 1200),
    dimensions,
    regions,
  };
}

export async function extractAllianceScreenshotWithOcr({
  buffer,
  timeoutMs = DEFAULT_TIMEOUT_MS,
  minRows = envNumber('ALLIANCE_OCR_MIN_ROWS', DEFAULT_MIN_ROWS, 1, 20),
  minConfidence = envNumber('ALLIANCE_OCR_MIN_CONFIDENCE', DEFAULT_MIN_CONFIDENCE, 0.5, 0.99),
  lineMinConfidence = envNumber('ALLIANCE_OCR_LINE_MIN_CONFIDENCE', DEFAULT_LINE_CONFIDENCE, 0.45, 0.99),
  snapshotTypeHint = null,
  onProgress = null,
} = {}) {
  if (!enabledByEnv()) {
    return { available: false, accepted: false, usable: false, reason: 'disabled', warnings: ['OCR local desativado por configuração.'] };
  }
  if (!Buffer.isBuffer(buffer) || !buffer.length) {
    return { available: false, accepted: false, usable: false, reason: 'empty_image', warnings: ['Imagem vazia para OCR local.'] };
  }

  return runQueued(async () => {
    onProgress?.({ stage: 'ocr_start', engine: 'tesseract.js', pipeline: 'roi-visual-row-column-pairing', snapshotTypeHint: SNAPSHOT_TYPES.includes(snapshotTypeHint) ? snapshotTypeHint : null });
    let lastError = null;
    try {
      for (let attempt = 0; attempt <= OCR_MAX_INTERNAL_RETRIES; attempt += 1) {
        try {
          const pipeline = await runOcrPipeline({
            buffer,
            timeoutMs,
            minRows,
            minConfidence,
            lineMinConfidence,
            onProgress,
            forceFull: attempt > 0,
            snapshotTypeHint,
          });
          const parsed = pipeline.parsed;
          onProgress?.({ stage: 'ocr_parsing', engine: 'tesseract.js', passes: pipeline.passes.length });
          const result = {
            available: true,
            ...parsed,
            engine: 'tesseract.js',
            model: 'tesseract.js/eng-local',
            diagnostics: {
              passes: pipeline.passes,
              passesCount: pipeline.passes.length,
              roiUsed: Boolean(pipeline.regions?.header),
              dimensions: pipeline.dimensions,
              trustedRows: parsed.trustedRows?.length || 0,
              exceptions: parsed.exceptions?.length || 0,
              qualityScore: parsed.qualityScore || 0,
              columnPairing: Boolean(parsed.columnPairing),
              snapshotTypeHint: SNAPSHOT_TYPES.includes(snapshotTypeHint) ? snapshotTypeHint : null,
            },
            checkpoint: {
              snapshotType: parsed.snapshotType,
              rows: parsed.rows,
              trustedRows: parsed.trustedRows,
              exceptions: parsed.exceptions,
              warnings: parsed.warnings,
              confidence: parsed.confidence,
              accepted: parsed.accepted,
              usable: parsed.usable,
              reason: parsed.reason,
              diagnostics: {
                passes: pipeline.passes,
                passesCount: pipeline.passes.length,
                roiUsed: Boolean(pipeline.regions?.header),
                dimensions: pipeline.dimensions,
                qualityScore: parsed.qualityScore || 0,
                columnPairing: Boolean(parsed.columnPairing),
                snapshotTypeHint: SNAPSHOT_TYPES.includes(snapshotTypeHint) ? snapshotTypeHint : null,
              },
              headerText: pipeline.headerText,
              rawText: pipeline.rawText,
            },
          };
          onProgress?.({
            stage: parsed.accepted ? 'ocr_accepted' : 'ocr_review',
            engine: 'tesseract.js',
            confidence: parsed.confidence,
            rows: parsed.rows.length,
            trustedRows: parsed.trustedRows?.length || 0,
            exceptions: parsed.exceptions?.length || 0,
            reason: parsed.reason,
            passes: pipeline.passes.length,
          });
          return result;
        } catch (error) {
          lastError = error;
          if (attempt >= OCR_MAX_INTERNAL_RETRIES) throw error;
          onProgress?.({ stage: 'ocr_retry', engine: 'tesseract.js', reason: error?.code || 'OCR_ERROR', retry: attempt + 1 });
          await terminateWorker();
        }
      }
      throw lastError || new Error('OCR local não concluiu a leitura.');
    } catch (error) {
      await terminateWorker();
      onProgress?.({ stage: 'ocr_unavailable', engine: 'tesseract.js', reason: error?.code || 'OCR_ERROR' });
      return {
        available: false,
        accepted: false,
        usable: false,
        reason: error?.code || 'error',
        warnings: [`OCR local indisponível: ${String(error?.message || error).slice(0, 180)}`],
        diagnostics: { retries: OCR_MAX_INTERNAL_RETRIES, error: error?.code || 'OCR_ERROR' },
      };
    } finally {
      activeProgressSink = null;
      scheduleIdleTermination();
    }
  });
}

export async function closeAllianceOcrWorker() {
  await terminateWorker();
}
