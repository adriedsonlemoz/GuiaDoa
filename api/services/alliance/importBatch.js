import { createHash, randomUUID } from 'node:crypto';
import { mkdir, readFile, writeFile, rename, rm, readdir, stat } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const ROOT = join(tmpdir(), 'guiadoa-alliance-imports');
const BATCH_TTL_MS = 2 * 60 * 60 * 1000;
const COMPLETED_TTL_MS = 30 * 60 * 1000;
const BATCH_SWEEP_MS = 15 * 60 * 1000;
const META_FILE = 'batch.json';
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const ACTIVE_OWNER_BATCHES = new Map();

const nowIso = () => new Date().toISOString();
const ownerKey = value => String(value || '');
const batchDir = id => join(ROOT, id);
const metaPath = id => join(batchDir(id), META_FILE);

function screenshotHash(buffer) {
  return createHash('sha256').update(buffer).digest('hex');
}

async function ensureRoot() {
  await mkdir(ROOT, { recursive: true, mode: 0o700 });
}

async function writeMeta(batch) {
  await ensureRoot();
  const dir = batchDir(batch.id);
  await mkdir(dir, { recursive: true, mode: 0o700 });
  const tmp = join(dir, `${META_FILE}.tmp`);
  await writeFile(tmp, JSON.stringify(batch), { encoding:'utf8', mode:0o600 });
  await rename(tmp, metaPath(batch.id));
  return batch;
}



function compactCompletedResult(result = {}) {
  const copy = { ...result };
  // O checkpoint OCR bruto só é necessário para retomar a imagem atual. Depois que a imagem
  // conclui, guardamos no JSON apenas dados estruturados/diagnóstico. O screenshot permanece
  // isolado no diretório temporário apenas durante a revisão e é removido ao cancelar/confirmar/expirar.
  if (copy.checkpoint) delete copy.checkpoint;
  return copy;
}

export async function cleanupExpiredImportBatches() {
  await ensureRoot();
  const entries = await readdir(ROOT, { withFileTypes: true }).catch(() => []);
  const now = Date.now();
  await Promise.all(entries.filter(entry => entry.isDirectory() && UUID_RE.test(entry.name)).map(async entry => {
    const id = entry.name;
    try {
      const raw = await readFile(metaPath(id), 'utf8');
      const batch = JSON.parse(raw);
      const expiresAt = new Date(batch.expiresAt || 0).getTime();
      if (!expiresAt || expiresAt <= now) {
        if (ACTIVE_OWNER_BATCHES.get(ownerKey(batch.ownerUserId)) === id) ACTIVE_OWNER_BATCHES.delete(ownerKey(batch.ownerUserId));
        await rm(batchDir(id), { recursive: true, force: true });
      }
    } catch {
      const info = await stat(batchDir(id)).catch(() => null);
      if (info && now - info.mtimeMs > BATCH_TTL_MS) await rm(batchDir(id), { recursive: true, force: true });
    }
  }));
}

export async function createImportBatch({ files, ownerUserId, allianceId = null, capturedAt = null, snapshotTypeHint = null }) {
  await cleanupExpiredImportBatches();
  const owner = ownerKey(ownerUserId);
  if (ACTIVE_OWNER_BATCHES.get(owner)) {
    const error = new Error('Já existe outro lote da Alliance sendo processado por este Admin.');
    error.code = 'ALLIANCE_BATCH_OWNER_BUSY';
    error.retryable = true;
    error.retryAfterMs = 1500;
    throw error;
  }
  const id = randomUUID();
  const createdAt = nowIso();
  const dir = batchDir(id);
  await mkdir(dir, { recursive: true, mode: 0o700 });

  const storedFiles = [];
  const duplicates = [];
  const hashes = new Map();
  for (let uploadIndex = 0; uploadIndex < files.length; uploadIndex += 1) {
    const file = files[uploadIndex];
    const hash = screenshotHash(file.buffer);
    if (hashes.has(hash)) {
      duplicates.push({
        uploadIndex,
        name: String(file.originalname || `screenshot-${uploadIndex + 1}`).slice(0, 180),
        duplicateOf: hashes.get(hash),
      });
      continue;
    }

    const index = storedFiles.length;
    hashes.set(hash, index);
    const ext = file.mimetype === 'image/png' ? 'png' : file.mimetype === 'image/webp' ? 'webp' : 'jpg';
    const storageName = `${String(index).padStart(2, '0')}.${ext}`;
    await writeFile(join(dir, storageName), file.buffer, { mode:0o600 });
    storedFiles.push({
      index,
      uploadIndex,
      name: String(file.originalname || `screenshot-${uploadIndex + 1}`).slice(0, 180),
      mimetype: file.mimetype,
      size: file.size,
      storageName,
      contentHash: hash,
    });
  }

  const batch = {
    id,
    ownerUserId: ownerKey(ownerUserId),
    allianceId: allianceId ? String(allianceId) : null,
    snapshotTypeHint: ['power', 'last_connection', 'joined_at'].includes(snapshotTypeHint) ? snapshotTypeHint : null,
    capturedAt: capturedAt || createdAt,
    createdAt,
    updatedAt: createdAt,
    expiresAt: new Date(Date.now() + BATCH_TTL_MS).toISOString(),
    status: 'ready',
    currentIndex: 0,
    processingStartedAt: null,
    uploadedTotal: files.length,
    total: storedFiles.length,
    duplicatesSkipped: duplicates.length,
    duplicates,
    files: storedFiles,
    results: [],
    currentCheckpoint: null,
    lastError: null,
    finalData: null,
  };
  return writeMeta(batch);
}

export async function loadImportBatch(id, ownerUserId) {
  if (!UUID_RE.test(String(id || ''))) return null;
  await cleanupExpiredImportBatches();
  try {
    const batch = JSON.parse(await readFile(metaPath(id), 'utf8'));
    if (batch.ownerUserId !== ownerKey(ownerUserId)) return null;
    if (new Date(batch.expiresAt || 0).getTime() <= Date.now()) {
      await rm(batchDir(id), { recursive: true, force: true });
      return null;
    }
    if (batch.status === 'processing') {
      const started = new Date(batch.processingStartedAt || batch.updatedAt || 0).getTime();
      if (started && Date.now() - started > 4 * 60 * 1000) {
        batch.status = 'paused';
        batch.processingStartedAt = null;
        batch.lastError = batch.lastError || {
          erro: 'A conexão anterior foi interrompida. O lote está pronto para continuar.',
          code: 'VISION_BATCH_INTERRUPTED',
          retryable: true,
        };
        batch.updatedAt = nowIso();
        if (ACTIVE_OWNER_BATCHES.get(ownerKey(batch.ownerUserId)) === batch.id) ACTIVE_OWNER_BATCHES.delete(ownerKey(batch.ownerUserId));
        await writeMeta(batch);
      }
    }
    return batch;
  } catch {
    return null;
  }
}

export async function markImportBatchProcessing(batch) {
  const owner = ownerKey(batch.ownerUserId);
  const active = ACTIVE_OWNER_BATCHES.get(owner);
  if (active && active !== batch.id) {
    const error = new Error('Já existe outro lote da Alliance sendo processado por este Admin.');
    error.code = 'ALLIANCE_BATCH_OWNER_BUSY';
    error.retryable = true;
    error.retryAfterMs = 1500;
    throw error;
  }
  ACTIVE_OWNER_BATCHES.set(owner, batch.id);
  batch.status = 'processing';
  batch.currentIndex = batch.results.length;
  batch.processingStartedAt = nowIso();
  batch.updatedAt = batch.processingStartedAt;
  batch.lastError = null;
  batch.expiresAt = new Date(Date.now() + BATCH_TTL_MS).toISOString();
  return writeMeta(batch);
}

export async function heartbeatImportBatch(batch) {
  if (!batch || batch.status !== 'processing') return batch;
  const owner = ownerKey(batch.ownerUserId);
  if (!ACTIVE_OWNER_BATCHES.get(owner)) ACTIVE_OWNER_BATCHES.set(owner, batch.id);
  batch.updatedAt = nowIso();
  batch.processingStartedAt = batch.updatedAt;
  batch.expiresAt = new Date(Date.now() + BATCH_TTL_MS).toISOString();
  return writeMeta(batch);
}

export async function saveImportBatchOcrCheckpoint(batch, index, ocrCheckpoint) {
  if (Number(index) !== batch.results.length || !ocrCheckpoint) return batch;
  batch.currentCheckpoint = {
    index: Number(index),
    stage: 'ocr_complete',
    savedAt: nowIso(),
    ocr: ocrCheckpoint,
  };
  batch.updatedAt = batch.currentCheckpoint.savedAt;
  batch.processingStartedAt = batch.processingStartedAt || batch.updatedAt;
  batch.expiresAt = new Date(Date.now() + BATCH_TTL_MS).toISOString();
  return writeMeta(batch);
}

export async function appendImportBatchResult(batch, result) {
  const completedIndex = batch.results.length;
  batch.results.push(compactCompletedResult(result));
  batch.currentIndex = batch.results.length;
  batch.currentCheckpoint = null;
  batch.updatedAt = nowIso();
  batch.processingStartedAt = batch.updatedAt;
  batch.expiresAt = new Date(Date.now() + BATCH_TTL_MS).toISOString();
  await writeMeta(batch);
  // Na Beta 2.43 a captura permanece apenas durante a etapa de revisão para que
  // o Admin consiga mostrar a origem de uma linha duvidosa. DELETE/expiração remove tudo.
  return batch;
}

export async function pauseImportBatch(batch, error = null) {
  if (ACTIVE_OWNER_BATCHES.get(ownerKey(batch.ownerUserId)) === batch.id) ACTIVE_OWNER_BATCHES.delete(ownerKey(batch.ownerUserId));
  batch.status = 'paused';
  batch.currentIndex = batch.results.length;
  batch.processingStartedAt = null;
  batch.updatedAt = nowIso();
  batch.expiresAt = new Date(Date.now() + BATCH_TTL_MS).toISOString();
  batch.lastError = error || null;
  return writeMeta(batch);
}

export async function completeImportBatch(batch, finalData) {
  if (ACTIVE_OWNER_BATCHES.get(ownerKey(batch.ownerUserId)) === batch.id) ACTIVE_OWNER_BATCHES.delete(ownerKey(batch.ownerUserId));
  batch.status = 'completed';
  batch.currentIndex = batch.total;
  batch.currentCheckpoint = null;
  batch.processingStartedAt = null;
  batch.updatedAt = nowIso();
  batch.expiresAt = new Date(Date.now() + COMPLETED_TTL_MS).toISOString();
  batch.lastError = null;
  batch.finalData = finalData;
  // Os screenshots continuam somente no diretório temporário durante a revisão
  // (máx. COMPLETED_TTL_MS) e são apagados ao confirmar/cancelar ou expirar.
  return writeMeta(batch);
}

export async function readImportBatchImage(batch, index) {
  const file = batch.files?.[index];
  if (!file) return null;
  try {
    return { ...file, buffer: await readFile(join(batchDir(batch.id), file.storageName)) };
  } catch {
    return null;
  }
}

export async function cancelImportBatch(id, ownerUserId) {
  const batch = await loadImportBatch(id, ownerUserId);
  if (!batch) return false;
  if (ACTIVE_OWNER_BATCHES.get(ownerKey(batch.ownerUserId)) === batch.id) ACTIVE_OWNER_BATCHES.delete(ownerKey(batch.ownerUserId));
  await rm(batchDir(id), { recursive: true, force: true });
  return true;
}

export function publicImportBatch(batch) {
  return {
    batchId: batch.id,
    status: batch.status,
    uploadedTotal: batch.uploadedTotal || batch.total,
    total: batch.total,
    duplicatesSkipped: batch.duplicatesSkipped || 0,
    completed: batch.results.length,
    currentIndex: batch.currentIndex,
    capturedAt: batch.capturedAt,
    allianceId: batch.allianceId,
    snapshotTypeHint: batch.snapshotTypeHint || null,
    files: (batch.files || []).map(({ index, uploadIndex, name, mimetype, size }) => ({ index, uploadIndex, name, mimetype, size })),
    checkpoint: batch.currentCheckpoint ? {
      index: batch.currentCheckpoint.index,
      stage: batch.currentCheckpoint.stage,
      savedAt: batch.currentCheckpoint.savedAt,
      ocrReady: Boolean(batch.currentCheckpoint.ocr),
      snapshotType: batch.currentCheckpoint.ocr?.snapshotType || null,
      trustedRows: batch.currentCheckpoint.ocr?.trustedRows?.length || 0,
      exceptions: batch.currentCheckpoint.ocr?.exceptions?.length || 0,
    } : null,
    lastError: batch.lastError,
    finalData: batch.finalData,
    expiresAt: batch.expiresAt,
  };
}

const cleanupTimer = setInterval(() => {
  cleanupExpiredImportBatches().catch(error => console.warn('[alliance-tracker] limpeza de lote temporário:', error.message));
}, BATCH_SWEEP_MS);
cleanupTimer.unref?.();
