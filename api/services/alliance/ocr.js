import { createRequire } from 'node:module';
import { dirname, join } from 'node:path';
import { tmpdir } from 'node:os';
import { mkdir } from 'node:fs/promises';
import { SNAPSHOT_TYPES, isValidDateParts, nameSimilarity, normalizeMemberName } from '../../utils/allianceTracker.js';

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

const NUMERIC_OCR_CONFUSABLES = Object.freeze({
  O: '0', o: '0', I: '1', l: '1', L: '1', '|': '1', S: '5', s: '5', B: '8',
});

function replaceNumericOcrConfusables(value = '') {
  const substitutions = [];
  const normalized = [...String(value || '')].map((char, index) => {
    const replacement = NUMERIC_OCR_CONFUSABLES[char];
    if (!replacement) return char;
    substitutions.push({ index, from: char, to: replacement });
    return replacement;
  }).join('');
  return { normalized, substitutions };
}

function dateCandidate(text = '') {
  const normalized = normalizeValuePunctuation(text);
  const direct = normalized.match(/\b(20\d{2})[-/.](\d{2})[-/.](\d{2})\s+(\d{2}):(\d{2})(?::(\d{2}))?\b/);
  if (direct) {
    const [, year, month, day, hour, minute, second = '00'] = direct;
    if (!isValidDateParts(Number(year), Number(month), Number(day), Number(hour), Number(minute), Number(second))) return null;
    return { raw: direct[0], normalized: `${year}-${month}-${day} ${hour}:${minute}:${second}`, index: direct.index ?? -1, ambiguous: false, substitutions: [] };
  }

  // Recupera somente datas que já têm formato de data/hora e no máximo poucas
  // confusões clássicas do OCR. A linha permanece marcada para revisão até outra
  // passagem independente confirmar o mesmo valor.
  const fuzzy = [...normalized.matchAll(/(?<![\p{L}\p{N}])([0-9OolILSsB|]{4}[-/.][0-9OolILSsB|]{2}[-/.][0-9OolILSsB|]{2}\s+[0-9OolILSsB|]{2}:[0-9OolILSsB|]{2}(?::[0-9OolILSsB|]{2})?)(?![\p{L}\p{N}])/gu)];
  for (const match of fuzzy.reverse()) {
    const raw = match[1];
    const realDigits = (raw.match(/\d/g) || []).length;
    const converted = replaceNumericOcrConfusables(raw);
    if (realDigits < 8 || converted.substitutions.length < 1 || converted.substitutions.length > 2) continue;
    const parsed = converted.normalized.match(/^(20\d{2})[-/.](\d{2})[-/.](\d{2})\s+(\d{2}):(\d{2})(?::(\d{2}))?$/);
    if (!parsed) continue;
    const [, year, month, day, hour, minute, second = '00'] = parsed;
    if (!isValidDateParts(Number(year), Number(month), Number(day), Number(hour), Number(minute), Number(second))) continue;
    return {
      raw,
      normalized: `${year}-${month}-${day} ${hour}:${minute}:${second}`,
      index: match.index ?? -1,
      ambiguous: true,
      substitutions: converted.substitutions,
    };
  }
  return null;
}

function powerCandidate(text = '') {
  const normalized = normalizeValuePunctuation(text);
  const matches = [...normalized.matchAll(/\b\d{1,3}(?:[.,\s]\d{3})+\b|\b\d{4,12}\b/g)];
  if (matches.length) {
    const match = matches[matches.length - 1];
    const digits = match[0].replace(/\D/g, '');
    const value = Number(digits);
    if (Number.isSafeInteger(value) && value >= 1) {
      return { raw: match[0], value, index: match.index ?? -1, ambiguous: false, substitutions: [] };
    }
  }

  // Ex.: "1S0.000" ou "2O2600". Não adivinha livremente: exige pelo menos
  // três dígitos reais e aceita no máximo duas substituições visuais conhecidas.
  const fuzzy = [...normalized.matchAll(/(?<![\p{L}\p{N}])([0-9OolILSsB|]{1,3}(?:[.,\s][0-9OolILSsB|]{3})+|[0-9OolILSsB|]{4,12})(?![\p{L}\p{N}])/gu)];
  for (const match of fuzzy.reverse()) {
    const raw = match[1];
    const realDigits = (raw.match(/\d/g) || []).length;
    const converted = replaceNumericOcrConfusables(raw);
    if (realDigits < 3 || converted.substitutions.length < 1 || converted.substitutions.length > 2) continue;
    const digits = converted.normalized.replace(/\D/g, '');
    const value = Number(digits);
    if (!Number.isSafeInteger(value) || value < 1) continue;
    return { raw, value, index: match.index ?? -1, ambiguous: true, substitutions: converted.substitutions };
  }
  return null;
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
      const reviewReasons = [];
      if (Number(row.confidence || 0) < lineMinConfidence) reviewReasons.push('low_ocr_confidence');
      if (marker?.ambiguous) reviewReasons.push('numeric_ocr_ambiguity');
      const reviewRequired = reviewReasons.length > 0;
      rows.push({
        ...row,
        source: 'ocr',
        reviewRequired,
        reviewReasons,
        ocrValueAmbiguous: Boolean(marker?.ambiguous),
        ocrValueSubstitutions: Array.isArray(marker?.substitutions) ? marker.substitutions : [],
        ocrLine: lineIndex,
        ocrBox: line.box,
      });
      if (Number(row.confidence || 0) < lineMinConfidence) {
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
    return marker ? {
      power: marker.value,
      raw: marker.raw,
      ocrValueAmbiguous: Boolean(marker.ambiguous),
      ocrValueSubstitutions: Array.isArray(marker.substitutions) ? marker.substitutions : [],
    } : null;
  }
  if (snapshotType === 'joined_at') {
    const marker = dateCandidate(text);
    return marker ? {
      joinedAt: marker.normalized,
      raw: marker.raw,
      ocrValueAmbiguous: Boolean(marker.ambiguous),
      ocrValueSubstitutions: Array.isArray(marker.substitutions) ? marker.substitutions : [],
    } : null;
  }
  if (snapshotType === 'last_connection') {
    const date = dateCandidate(text);
    const online = onlineCandidate(text);
    if (date) return {
      lastConnection: date.normalized,
      online: false,
      raw: date.raw,
      ocrValueAmbiguous: Boolean(date.ambiguous),
      ocrValueSubstitutions: Array.isArray(date.substitutions) ? date.substitutions : [],
    };
    if (online) return { lastConnection: '', online: true, raw: online.raw, ocrValueAmbiguous: false, ocrValueSubstitutions: [] };
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

function columnLineCenter(line = {}) {
  const box = line.box || {};
  return Number(box.top || 0) + Math.max(1, Number(box.height || 1)) / 2;
}

function collapseColumnLines(lines = []) {
  const sorted = [...lines].sort((a, b) => columnLineCenter(a) - columnLineCenter(b) || Number(b.confidence || 0) - Number(a.confidence || 0));
  const collapsed = [];
  for (const line of sorted) {
    const center = columnLineCenter(line);
    const prior = collapsed[collapsed.length - 1];
    if (prior) {
      const tolerance = Math.max(4, Math.max(Number(prior.box?.height || 1), Number(line.box?.height || 1)) * 0.55);
      if (Math.abs(columnLineCenter(prior) - center) <= tolerance) {
        // parseTsv gera linhas nativas e reconstruídas. Se ambas ocupam a mesma
        // faixa visual, preservamos só a leitura de maior confiança desta passagem.
        if (Number(line.confidence || 0) > Number(prior.confidence || 0)) collapsed[collapsed.length - 1] = line;
        continue;
      }
    }
    collapsed.push(line);
  }
  return collapsed;
}

function alignColumnLines(nameLines = [], valueLines = []) {
  const names = collapseColumnLines(nameLines);
  const values = collapseColumnLines(valueLines);
  const n = names.length;
  const m = values.length;
  const skipCost = 0.92;
  const dp = Array.from({ length: n + 1 }, () => Array(m + 1).fill(Infinity));
  const prev = Array.from({ length: n + 1 }, () => Array(m + 1).fill(null));
  dp[0][0] = 0;

  const relax = (ni, nj, cost, step) => {
    if (cost + 1e-9 < dp[ni][nj]) {
      dp[ni][nj] = cost;
      prev[ni][nj] = step;
    }
  };

  for (let i = 0; i <= n; i += 1) {
    for (let j = 0; j <= m; j += 1) {
      if (!Number.isFinite(dp[i][j])) continue;
      if (i < n) relax(i + 1, j, dp[i][j] + skipCost, { i, j, action: 'skip-name' });
      if (j < m) relax(i, j + 1, dp[i][j] + skipCost, { i, j, action: 'skip-value' });
      if (i < n && j < m) {
        const nameLine = names[i];
        const valueLine = values[j];
        const distance = Math.abs(columnLineCenter(nameLine) - columnLineCenter(valueLine));
        const scale = Math.max(8, Math.max(Number(nameLine.box?.height || 1), Number(valueLine.box?.height || 1)) * 1.35);
        if (distance <= scale * 1.85) {
          const confidencePenalty = (2 - Math.max(0, Math.min(1, Number(nameLine.confidence || 0))) - Math.max(0, Math.min(1, Number(valueLine.confidence || 0)))) * 0.10;
          const pairCost = (distance / scale) + confidencePenalty;
          relax(i + 1, j + 1, dp[i][j] + pairCost, { i, j, action: 'pair', distance, scale });
        }
      }
    }
  }

  const pairs = [];
  const usedNames = new Set();
  const usedValues = new Set();
  let i = n;
  let j = m;
  while (i > 0 || j > 0) {
    const step = prev[i][j];
    if (!step) break;
    if (step.action === 'pair') {
      pairs.push({
        nameLine: names[step.i],
        valueLine: values[step.j],
        nameIndex: step.i,
        valueIndex: step.j,
        distance: step.distance,
        scale: step.scale,
      });
      usedNames.add(step.i);
      usedValues.add(step.j);
    }
    i = step.i;
    j = step.j;
  }
  pairs.reverse();

  return {
    names,
    values,
    pairs,
    unmatchedNames: names.map((line, index) => ({ line, index })).filter(item => !usedNames.has(item.index)),
    unmatchedValues: values.map((line, index) => ({ line, index })).filter(item => !usedValues.has(item.index)),
  };
}

function nearbyColumnLine(line, opposite = []) {
  const center = columnLineCenter(line);
  return opposite.some(other => {
    const scale = Math.max(10, Math.max(Number(line.box?.height || 1), Number(other.box?.height || 1)) * 2.15);
    return Math.abs(center - columnLineCenter(other)) <= scale;
  });
}

export function parseColumnPairs({
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
  const rawNameLines = parseTsv(namesTsv).map(line => ({
    ...line,
    box: offsetBox(line.box, nameRectangle),
    name: cleanNameOnlyLine(line.text),
  })).filter(line => line.name);
  const rawValueLines = parseTsv(valuesTsv).map(line => ({
    ...line,
    box: offsetBox(line.box, valueRectangle),
    value: valueFromText(line.text, snapshotType),
  })).filter(line => line.value);

  const aligned = alignColumnLines(rawNameLines, rawValueLines);
  const pairs = [];
  for (const match of aligned.pairs) {
    const { nameLine, valueLine, distance, scale } = match;
    const alignmentRatio = distance / Math.max(1, scale);
    const alignmentFactor = Math.max(0.68, 1 - Math.min(0.28, alignmentRatio * 0.18));
    const confidence = Math.max(0, Math.min(1, Math.min(nameLine.confidence, valueLine.confidence) * alignmentFactor));
    const left = Math.min(nameLine.box.left, valueLine.box.left);
    const top = Math.min(nameLine.box.top, valueLine.box.top);
    const right = Math.max(nameLine.box.left + nameLine.box.width, valueLine.box.left + valueLine.box.width);
    const bottom = Math.max(nameLine.box.top + nameLine.box.height, valueLine.box.top + valueLine.box.height);
    const reviewReasons = [];
    if (confidence < lineMinConfidence) reviewReasons.push('low_ocr_confidence');
    if (valueLine.value.ocrValueAmbiguous) reviewReasons.push('numeric_ocr_ambiguity');
    if (alignmentRatio > 0.95) reviewReasons.push('column_alignment_weak');
    pairs.push({
      name: nameLine.name,
      ...valueLine.value,
      confidence,
      source: 'ocr',
      reviewRequired: reviewReasons.length > 0,
      reviewReasons,
      ocrBox: { left, top, width: right - left, height: bottom - top },
      ocrImageDimensions: dimensions ? { width: dimensions.width, height: dimensions.height } : null,
      ocrRegion: 'column-pair',
      ocrPairMethod: 'monotonic-dp',
      ocrPairDistance: Number(distance.toFixed(2)),
      ocrPairDistanceRatio: Number(alignmentRatio.toFixed(3)),
    });
  }

  const exceptions = pairs.filter(row => row.reviewReasons.includes('low_ocr_confidence')).map((row, line) => ({
    type: 'low_confidence',
    line,
    name: row.name,
    confidence: row.confidence,
  }));

  // Se uma coluna tem uma linha sem par, mas existe conteúdo na outra coluna na mesma
  // vizinhança vertical, não a descartamos silenciosamente: vira exceção estrutural.
  for (const { line } of aligned.unmatchedNames) {
    if (Number(line.confidence || 0) < 0.50 || !nearbyColumnLine(line, aligned.values)) continue;
    exceptions.push({ type: 'unpaired_name', name: line.name, confidence: line.confidence, text: line.text.slice(0, 160), ocrBox: line.box });
  }
  for (const { line } of aligned.unmatchedValues) {
    if (Number(line.confidence || 0) < 0.50 || !nearbyColumnLine(line, aligned.names)) continue;
    exceptions.push({ type: 'unpaired_value', value: line.value?.raw || '', confidence: line.confidence, text: line.text.slice(0, 160), ocrBox: line.box });
  }

  const trustedRows = pairs.filter(row => !row.reviewRequired);
  const confidence = trustedRows.length
    ? trustedRows.reduce((sum, row) => sum + Number(row.confidence || 0), 0) / trustedRows.length
    : 0;
  const accepted = trustedRows.length >= minRows && confidence >= minConfidence && exceptions.length === 0 && pairs.every(row => !row.reviewRequired);
  const usable = trustedRows.length >= minRows || pairs.length >= minRows;
  const warnings = [];
  if (trustedRows.length < minRows) warnings.push(`Pareamento por colunas confirmou ${trustedRows.length} linha(s) segura(s).`);
  if (pairs.some(row => row.reviewRequired)) warnings.push(`${pairs.filter(row => row.reviewRequired).length} linha(s) pareadas ficaram para revisão.`);
  if (exceptions.some(item => item.type === 'unpaired_name' || item.type === 'unpaired_value')) warnings.push('O alinhamento local encontrou conteúdo sem par entre as colunas; essas linhas foram preservadas para revisão.');

  return {
    accepted,
    usable,
    reason: accepted ? null : pairs.length < minRows ? 'rows' : exceptions.length ? 'exceptions' : pairs.some(row => row.reviewRequired) ? 'review' : 'confidence',
    snapshotType,
    detectedFromText: snapshotType,
    rows: pairs,
    trustedRows,
    exceptions,
    warnings,
    confidence,
    lowestConfidence: trustedRows.length ? Math.min(...trustedRows.map(row => row.confidence)) : 0,
    linesCount: Math.max(aligned.names.length, aligned.values.length),
    parsedRatio: aligned.values.length ? pairs.length / aligned.values.length : 0,
    qualityScore: Math.max(0, Math.min(1,
      (pairs.length ? 0.30 : 0)
      + confidence * 0.52
      + Math.min(0.16, pairs.length * 0.02)
      - Math.min(0.20, exceptions.length * 0.035)
    )),
    columnPairing: true,
    columnPairingMethod: 'monotonic-dp',
    unmatchedNames: aligned.unmatchedNames.length,
    unmatchedValues: aligned.unmatchedValues.length,
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

function typedRowValue(row = {}, snapshotType = null) {
  if (snapshotType === 'power') return row.power == null ? '' : String(row.power);
  if (snapshotType === 'last_connection') return row.online ? 'online' : String(row.lastConnection || '');
  if (snapshotType === 'joined_at') return String(row.joinedAt || '');
  return '';
}

function rowCenterY(row = {}) {
  const box = row.ocrBox;
  if (!box || !Number.isFinite(Number(box.top)) || !Number.isFinite(Number(box.height))) return null;
  return Number(box.top) + Math.max(1, Number(box.height)) / 2;
}

function sameVisualRow(a = {}, b = {}) {
  const ay = rowCenterY(a);
  const by = rowCenterY(b);
  if (ay == null || by == null) return false;
  const ah = Math.max(1, Number(a.ocrBox?.height || 1));
  const bh = Math.max(1, Number(b.ocrBox?.height || 1));
  // Passagens sobre a mesma linha costumam variar poucos pixels. Mantemos uma janela
  // menor que a altura de uma linha para não fundir membros adjacentes por acidente.
  return Math.abs(ay - by) <= Math.max(5, Math.max(ah, bh) * 0.82);
}

function consensusConfidence(rows = []) {
  const confidences = rows.map(row => Math.max(0, Math.min(1, Number(row.confidence) || 0))).sort((a, b) => b - a);
  if (!confidences.length) return 0;
  // As passagens são correlacionadas, portanto não usamos probabilidade independente.
  // O bônus é deliberadamente pequeno: consenso confirma, mas não transforma OCR ruim em certeza.
  return Math.min(0.995, confidences[0] + Math.min(0.12, Math.max(0, confidences.length - 1) * 0.045));
}

function occurrenceKey(row = {}, snapshotType = null) {
  return `${normalizeMemberName(row.name)}|${typedRowValue(row, snapshotType)}`;
}

function matchFusionGroup(groups, row, snapshotType) {
  const normalizedName = normalizeMemberName(row.name);
  const value = typedRowValue(row, snapshotType);
  let best = null;
  let bestScore = -1;
  for (const group of groups) {
    const representative = group.occurrences[0];
    const sameName = normalizeMemberName(representative.name) === normalizedName;
    const sameValue = typedRowValue(representative, snapshotType) === value && value !== '';
    const visual = sameVisualRow(representative, row);
    const similarity = nameSimilarity(representative.name, row.name);
    // Exatidão de nome+valor é suficiente mesmo quando uma passagem não retornou geometria.
    // Para grafias diferentes, exigimos o mesmo valor E a mesma linha visual.
    let score = -1;
    if (sameName && sameValue) score = 4;
    else if (sameName && visual) score = 3;
    else if (sameValue && visual && similarity >= 0.45) score = 2 + similarity;
    else if (sameValue && visual) score = 1.5;
    else if (visual && representative.ocrPass !== row.ocrPass && similarity >= 0.55) score = 1 + similarity;
    if (score > bestScore) { best = group; bestScore = score; }
  }
  return bestScore >= 0 ? best : null;
}

/**
 * Combina deterministicamente as várias passagens do Tesseract. Nenhuma inferência externa
 * é feita: uma linha só ganha confiança quando duas ou mais passagens concordam em nome+valor.
 * Divergências ficam explicitamente marcadas para revisão.
 */
function bestEvidenceRow(rows = []) {
  return [...rows].sort((a, b) => {
    if (Boolean(a.ocrValueAmbiguous) !== Boolean(b.ocrValueAmbiguous)) return a.ocrValueAmbiguous ? 1 : -1;
    if (Boolean(a.reviewRequired) !== Boolean(b.reviewRequired)) return a.reviewRequired ? 1 : -1;
    return Number(b.confidence || 0) - Number(a.confidence || 0);
  })[0] || null;
}

function rankFieldVotes(rows = [], keyOf) {
  const votes = new Map();
  for (const row of rows) {
    const key = String(keyOf(row) ?? '');
    if (!key) continue;
    const vote = votes.get(key) || { key, rows: [], passes: new Set(), weight: 0 };
    vote.rows.push(row);
    vote.passes.add(row.ocrPass || `row-${vote.rows.length}`);
    vote.weight += Math.max(0.05, Number(row.confidence) || 0);
    votes.set(key, vote);
  }
  return [...votes.values()].sort((a, b) => b.passes.size - a.passes.size || b.rows.length - a.rows.length || b.weight - a.weight);
}

function strictFieldMajority(ranked = []) {
  const first = ranked[0];
  const second = ranked[1];
  return Boolean(first && first.passes.size >= 2 && first.passes.size > Number(second?.passes?.size || 0));
}

function copyTypedOcrValue(target, source, snapshotType) {
  if (!source) return target;
  if (snapshotType === 'power') target.power = source.power;
  if (snapshotType === 'joined_at') target.joinedAt = source.joinedAt;
  if (snapshotType === 'last_connection') {
    target.lastConnection = source.lastConnection || '';
    target.online = Boolean(source.online);
  }
  target.ocrValueAmbiguous = Boolean(source.ocrValueAmbiguous);
  target.ocrValueSubstitutions = Array.isArray(source.ocrValueSubstitutions) ? source.ocrValueSubstitutions : [];
  return target;
}

/**
 * Combina deterministicamente as várias passagens do Tesseract. O consenso é feito
 * tanto pela linha inteira quanto separadamente por nickname e valor. Maioria entre
 * passagens independentes pode eliminar um outlier; empate ou conflito real continua
 * obrigatoriamente em revisão.
 */
export function fuseOcrCandidates({
  candidates = [],
  snapshotType = null,
  minRows = DEFAULT_MIN_ROWS,
  minConfidence = DEFAULT_MIN_CONFIDENCE,
  lineMinConfidence = DEFAULT_LINE_CONFIDENCE,
} = {}) {
  const valid = candidates.filter(candidate => candidate && Array.isArray(candidate.rows) && candidate.rows.length);
  const best = chooseBestParse(valid);
  if (!best || !SNAPSHOT_TYPES.includes(snapshotType || best.snapshotType)) return best || null;
  const type = SNAPSHOT_TYPES.includes(snapshotType) ? snapshotType : best.snapshotType;
  const groups = [];

  for (const candidate of valid) {
    for (const rawRow of candidate.rows || []) {
      const row = { ...rawRow, ocrPass: candidate.pass || rawRow.ocrPass || 'unknown' };
      const group = matchFusionGroup(groups, row, type);
      if (group) group.occurrences.push(row);
      else groups.push({ occurrences:[row] });
    }
  }

  const bestKeys = new Set((best.rows || []).map(row => occurrenceKey(row, type)));
  let recoveredRows = 0;
  let consensusRows = 0;
  let fieldConsensusRows = 0;
  let passConflicts = 0;
  let resolvedOutliers = 0;

  const rows = groups.map(group => {
    const occurrences = group.occurrences;
    const fullVotes = rankFieldVotes(occurrences, row => occurrenceKey(row, type));
    const nameVotes = rankFieldVotes(occurrences, row => normalizeMemberName(row.name));
    const valueVotes = rankFieldVotes(occurrences, row => typedRowValue(row, type));
    const winner = fullVotes[0];
    const nameWinner = nameVotes[0];
    const valueWinner = valueVotes[0];
    const winnerRows = winner?.rows || occurrences;
    const representative = bestEvidenceRow(winnerRows) || bestEvidenceRow(occurrences) || occurrences[0];
    const selectedNameRow = bestEvidenceRow(nameWinner?.rows || []) || representative;
    const selectedValueRow = bestEvidenceRow(valueWinner?.rows || []) || representative;
    const fusedRow = { ...representative, name: selectedNameRow.name };
    copyTypedOcrValue(fusedRow, selectedValueRow, type);

    const nameAlternatives = [...new Set(occurrences.map(row => String(row.name || '').trim()).filter(Boolean))];
    const valueAlternatives = [...new Set(occurrences.map(row => typedRowValue(row, type)).filter(Boolean))];
    const consensusCount = Number(winner?.passes?.size || 0);
    const nameConsensusCount = Number(nameWinner?.passes?.size || 0);
    const valueConsensusCount = Number(valueWinner?.passes?.size || 0);
    const passes = [...new Set(occurrences.map(row => row.ocrPass).filter(Boolean))];
    const sameNameValueConsensus = consensusCount >= 2;
    const nameMajority = strictFieldMajority(nameVotes);
    const valueMajority = strictFieldMajority(valueVotes);
    const fieldConsensus = nameConsensusCount >= 2 && valueConsensusCount >= 2;

    let confidence = Math.max(0, Math.min(1, Number(representative.confidence) || 0));
    if (sameNameValueConsensus) confidence = consensusConfidence(winnerRows);
    else if (fieldConsensus) confidence = Math.min(consensusConfidence(nameWinner.rows), consensusConfidence(valueWinner.rows));

    const evidenceRows = [...new Set([representative, ...(nameWinner?.rows || []), ...(valueWinner?.rows || [])])];
    const reviewReasons = new Set(evidenceRows.flatMap(row => row.reviewReasons || []));
    if ((sameNameValueConsensus || fieldConsensus) && confidence >= lineMinConfidence && Number(representative.confidence || 0) >= 0.52) {
      reviewReasons.delete('low_ocr_confidence');
      reviewReasons.delete('column_alignment_weak');
    }
    const valueAmbiguityConfirmed = valueConsensusCount >= 2
      && ((valueWinner?.rows || []).some(row => !row.ocrValueAmbiguous) || valueConsensusCount >= 3);
    if (valueAmbiguityConfirmed) reviewReasons.delete('numeric_ocr_ambiguity');

    const valueConflict = valueAlternatives.length > 1 && !valueMajority;
    const nameConflict = nameAlternatives.length > 1 && !sameNameValueConsensus && !nameMajority;
    if (valueConflict) reviewReasons.add('ocr_pass_value_conflict');
    else reviewReasons.delete('ocr_pass_value_conflict');
    if (nameConflict) reviewReasons.add('ocr_pass_nickname_conflict');
    else reviewReasons.delete('ocr_pass_nickname_conflict');

    const valueOutlierResolved = valueAlternatives.length > 1 && valueMajority;
    const nameOutlierResolved = nameAlternatives.length > 1 && nameMajority;
    if (valueOutlierResolved || nameOutlierResolved) resolvedOutliers += 1;
    const reviewRequired = reviewReasons.size > 0;
    if (valueConflict || nameConflict) passConflicts += 1;
    if (sameNameValueConsensus) consensusRows += 1;
    if (!sameNameValueConsensus && fieldConsensus) fieldConsensusRows += 1;

    const finalKey = occurrenceKey(fusedRow, type);
    const recovered = !bestKeys.has(finalKey);
    if (recovered) recoveredRows += 1;
    const consensusSource = sameNameValueConsensus || fieldConsensus;

    return {
      ...fusedRow,
      confidence,
      reviewRequired,
      reviewReasons:[...reviewReasons],
      source: consensusSource ? 'ocr_consensus' : (representative.source || 'ocr'),
      sources:[...new Set([...(representative.sources || [representative.source || 'ocr']), ...(consensusSource ? ['ocr_consensus'] : [])])],
      ocrConsensusCount: consensusCount,
      ocrNameConsensusCount: nameConsensusCount,
      ocrValueConsensusCount: valueConsensusCount,
      ocrPasses: passes,
      ocrRecoveredFromAlternatePass: recovered,
      ocrValueAmbiguityResolved: Boolean(valueAmbiguityConfirmed),
      ocrResolvedValueOutlier: Boolean(valueOutlierResolved),
      ocrResolvedNameOutlier: Boolean(nameOutlierResolved),
      ...(nameAlternatives.length > 1 ? { nameAlternatives } : {}),
      ...(valueAlternatives.length > 1 ? { ocrValueAlternatives:valueAlternatives } : {}),
    };
  }).sort((a, b) => {
    const ay = rowCenterY(a);
    const by = rowCenterY(b);
    if (ay != null && by != null && ay !== by) return ay - by;
    return String(a.name || '').localeCompare(String(b.name || ''), 'pt-BR');
  });

  const trustedRows = rows.filter(row => !row.reviewRequired);
  const trustedNames = new Set(trustedRows.map(row => normalizeMemberName(row.name)));
  const trustedValues = new Set(trustedRows.map(row => typedRowValue(row, type)).filter(Boolean));
  const exceptions = (best.exceptions || []).filter(item => {
    if (item.type === 'low_confidence') return !trustedNames.has(normalizeMemberName(item.name));
    if (item.type === 'unpaired_name') return !trustedNames.has(normalizeMemberName(item.name));
    if (item.type === 'unpaired_value') {
      const parsedValue = valueFromText(item.value || item.text || '', type);
      return !parsedValue || !trustedValues.has(typedRowValue(parsedValue, type));
    }
    return true;
  });
  const confidence = trustedRows.length
    ? trustedRows.reduce((sum, row) => sum + Number(row.confidence || 0), 0) / trustedRows.length
    : 0;
  const lowestConfidence = trustedRows.length ? Math.min(...trustedRows.map(row => Number(row.confidence || 0))) : 0;
  const accepted = Boolean(
    trustedRows.length >= minRows
    && confidence >= minConfidence
    && lowestConfidence >= Math.max(0.62, lineMinConfidence - 0.08)
    && exceptions.length === 0
    && rows.every(row => !row.reviewRequired)
  );
  const usable = Boolean(rows.length >= minRows);
  const reason = accepted ? null : rows.length < minRows ? 'rows' : exceptions.length ? 'exceptions' : rows.some(row => row.reviewRequired) ? 'review' : 'confidence';
  const warnings = [...new Set([...(best.warnings || [])].filter(warning => {
    if (!(consensusRows || fieldConsensusRows)) return true;
    return !/confian[cç]a|exce[cç][aã]o/i.test(String(warning));
  }))];
  if (recoveredRows) warnings.push(`${recoveredRows} linha(s) foram recuperadas cruzando passagens locais do OCR.`);
  if (resolvedOutliers) warnings.push(`${resolvedOutliers} divergência(s) isolada(s) foram resolvidas por maioria entre passagens locais.`);
  if (passConflicts) warnings.push(`${passConflicts} divergência(s) sem maioria entre passagens locais foram preservadas para revisão.`);
  if (!accepted && rows.some(row => row.reviewRequired)) warnings.push(`${rows.filter(row => row.reviewRequired).length} linha(s) continuam aguardando confirmação manual.`);

  const qualityScore = Math.max(0, Math.min(1,
    (rows.length ? 0.22 : 0)
    + Math.min(0.22, trustedRows.length * 0.022)
    + confidence * 0.41
    + Math.min(0.10, consensusRows * 0.018)
    + Math.min(0.06, fieldConsensusRows * 0.012)
    + Math.min(0.04, resolvedOutliers * 0.008)
    - Math.min(0.22, (exceptions.length + passConflicts) * 0.035)
  ));

  return {
    ...best,
    accepted, usable, reason, snapshotType:type, rows, trustedRows, exceptions, warnings,
    confidence, lowestConfidence, qualityScore,
    consensusFusion:true,
    consensusRows,
    fieldConsensusRows,
    recoveredRows,
    passConflicts,
    resolvedOutliers,
    candidatePasses:valid.length,
  };
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
    // Uma leitura muito forte pode encerrar cedo. Abaixo disso fazemos uma segunda
    // passagem e cruzamos os resultados, em vez de confiar em uma única interpretação.
    if (parsed.accepted && Number(parsed.confidence || 0) >= 0.90) {
      return { parsed, passes, rawText: safeText(tablePass.text), headerText: safeText(headerText, 1200), dimensions, regions };
    }

    onProgress?.({ stage: 'ocr_variant', variant: 'adaptive', reason: parsed.reason || 'consensus_check', exceptions: parsed.exceptions.length });
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
    const fusedAfterAdaptive = fuseOcrCandidates({ candidates:parsedCandidates, snapshotType, minRows, minConfidence, lineMinConfidence });
    if (fusedAfterAdaptive?.accepted) {
      onProgress?.({ stage:'ocr_consensus', rows:fusedAfterAdaptive.rows.length, consensusRows:fusedAfterAdaptive.consensusRows || 0, fieldConsensusRows:fusedAfterAdaptive.fieldConsensusRows || 0, recoveredRows:fusedAfterAdaptive.recoveredRows || 0, resolvedOutliers:fusedAfterAdaptive.resolvedOutliers || 0, conflicts:fusedAfterAdaptive.passConflicts || 0 });
      return { parsed: fusedAfterAdaptive, passes, rawText: safeText(adaptivePass.text), headerText: safeText(headerText, 1200), dimensions, regions };
    }

    // Quando o TSV separa nickname e valor em blocos diferentes, uma leitura única
    // não consegue formar a linha. Lemos as colunas separadamente e pareamos pelo eixo Y.
    const currentBest = fuseOcrCandidates({ candidates:parsedCandidates, snapshotType, minRows, minConfidence, lineMinConfidence }) || chooseBestParse(parsedCandidates);
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
      const fusedAfterPairing = fuseOcrCandidates({ candidates:parsedCandidates, snapshotType, minRows, minConfidence, lineMinConfidence });
      if (fusedAfterPairing?.accepted) {
        onProgress?.({ stage:'ocr_consensus', rows:fusedAfterPairing.rows.length, consensusRows:fusedAfterPairing.consensusRows || 0, fieldConsensusRows:fusedAfterPairing.fieldConsensusRows || 0, recoveredRows:fusedAfterPairing.recoveredRows || 0, resolvedOutliers:fusedAfterPairing.resolvedOutliers || 0, conflicts:fusedAfterPairing.passConflicts || 0 });
        return { parsed: fusedAfterPairing, passes, rawText: safeText(`${namePass.text}\n${valuePass.text}`), headerText: safeText(headerText, 1200), dimensions, regions };
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
        const fusedAfterAlt = fuseOcrCandidates({ candidates:parsedCandidates, snapshotType, minRows, minConfidence, lineMinConfidence });
        if (fusedAfterAlt?.accepted) {
          onProgress?.({ stage:'ocr_consensus', rows:fusedAfterAlt.rows.length, consensusRows:fusedAfterAlt.consensusRows || 0, fieldConsensusRows:fusedAfterAlt.fieldConsensusRows || 0, recoveredRows:fusedAfterAlt.recoveredRows || 0, resolvedOutliers:fusedAfterAlt.resolvedOutliers || 0, conflicts:fusedAfterAlt.passConflicts || 0 });
          return { parsed: fusedAfterAlt, passes, rawText: safeText(`${altNamePass.text}\n${altValuePass.text}`), headerText: safeText(headerText, 1200), dimensions, regions };
        }
      }
    }
  }

  const bestBeforeFull = fuseOcrCandidates({ candidates:parsedCandidates, snapshotType, minRows, minConfidence, lineMinConfidence }) || chooseBestParse(parsedCandidates);
  const needsFullFallback = !bestBeforeFull?.accepted && (
    !snapshotType
    || forceFull
    || (bestBeforeFull?.rows?.length || 0) === 0
    || (bestBeforeFull?.exceptions?.length || 0) > 0
    || (bestBeforeFull?.rows || []).some(row => row.reviewRequired)
  );
  if (needsFullFallback) {
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

  const best = fuseOcrCandidates({ candidates:parsedCandidates, snapshotType, minRows, minConfidence, lineMinConfidence }) || chooseBestParse(parsedCandidates);
  if (best?.consensusFusion) {
    onProgress?.({ stage:'ocr_consensus', rows:best.rows.length, consensusRows:best.consensusRows || 0, fieldConsensusRows:best.fieldConsensusRows || 0, recoveredRows:best.recoveredRows || 0, resolvedOutliers:best.resolvedOutliers || 0, conflicts:best.passConflicts || 0 });
  }
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
              consensusFusion: Boolean(parsed.consensusFusion),
              consensusRows: Number(parsed.consensusRows || 0),
              fieldConsensusRows: Number(parsed.fieldConsensusRows || 0),
              recoveredRows: Number(parsed.recoveredRows || 0),
              resolvedOutliers: Number(parsed.resolvedOutliers || 0),
              passConflicts: Number(parsed.passConflicts || 0),
              candidatePasses: Number(parsed.candidatePasses || 0),
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
                consensusFusion: Boolean(parsed.consensusFusion),
                consensusRows: Number(parsed.consensusRows || 0),
                fieldConsensusRows: Number(parsed.fieldConsensusRows || 0),
                recoveredRows: Number(parsed.recoveredRows || 0),
                resolvedOutliers: Number(parsed.resolvedOutliers || 0),
                passConflicts: Number(parsed.passConflicts || 0),
                candidatePasses: Number(parsed.candidatePasses || 0),
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
            consensusRows: Number(parsed.consensusRows || 0),
            fieldConsensusRows: Number(parsed.fieldConsensusRows || 0),
            recoveredRows: Number(parsed.recoveredRows || 0),
            resolvedOutliers: Number(parsed.resolvedOutliers || 0),
            passConflicts: Number(parsed.passConflicts || 0),
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
