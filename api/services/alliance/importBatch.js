import { randomUUID } from 'node:crypto';
import { mkdir, readFile, writeFile, rename, rm, readdir, stat } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const ROOT = join(tmpdir(), 'guiadoa-alliance-imports');
const BATCH_TTL_MS = 2 * 60 * 60 * 1000;
const COMPLETED_TTL_MS = 30 * 60 * 1000;
const BATCH_SWEEP_MS = 15 * 60 * 1000;
const META_FILE = 'batch.json';
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const nowIso = () => new Date().toISOString();
const ownerKey = value => String(value || '');
const batchDir = id => join(ROOT, id);
const metaPath = id => join(batchDir(id), META_FILE);

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

async function removeImageFiles(batch) {
  await Promise.all((batch.files || []).map(file => rm(join(batchDir(batch.id), file.storageName), { force: true }).catch(() => {})));
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
      if (!expiresAt || expiresAt <= now) await rm(batchDir(id), { recursive: true, force: true });
    } catch {
      const info = await stat(batchDir(id)).catch(() => null);
      if (info && now - info.mtimeMs > BATCH_TTL_MS) await rm(batchDir(id), { recursive: true, force: true });
    }
  }));
}

export async function createImportBatch({ files, ownerUserId, allianceId = null, capturedAt = null }) {
  await cleanupExpiredImportBatches();
  const id = randomUUID();
  const createdAt = nowIso();
  const dir = batchDir(id);
  await mkdir(dir, { recursive: true, mode: 0o700 });

  const storedFiles = [];
  for (let index = 0; index < files.length; index += 1) {
    const file = files[index];
    const ext = file.mimetype === 'image/png' ? 'png' : file.mimetype === 'image/webp' ? 'webp' : 'jpg';
    const storageName = `${String(index).padStart(2, '0')}.${ext}`;
    await writeFile(join(dir, storageName), file.buffer, { mode:0o600 });
    storedFiles.push({
      index,
      name: String(file.originalname || `screenshot-${index + 1}`).slice(0, 180),
      mimetype: file.mimetype,
      size: file.size,
      storageName,
    });
  }

  const batch = {
    id,
    ownerUserId: ownerKey(ownerUserId),
    allianceId: allianceId ? String(allianceId) : null,
    capturedAt: capturedAt || createdAt,
    createdAt,
    updatedAt: createdAt,
    expiresAt: new Date(Date.now() + BATCH_TTL_MS).toISOString(),
    status: 'ready',
    currentIndex: 0,
    processingStartedAt: null,
    total: storedFiles.length,
    files: storedFiles,
    results: [],
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
        await writeMeta(batch);
      }
    }
    return batch;
  } catch {
    return null;
  }
}

export async function markImportBatchProcessing(batch) {
  batch.status = 'processing';
  batch.currentIndex = batch.results.length;
  batch.processingStartedAt = nowIso();
  batch.updatedAt = batch.processingStartedAt;
  batch.lastError = null;
  batch.expiresAt = new Date(Date.now() + BATCH_TTL_MS).toISOString();
  return writeMeta(batch);
}

export async function appendImportBatchResult(batch, result) {
  const completedIndex = batch.results.length;
  batch.results.push(result);
  batch.currentIndex = batch.results.length;
  batch.updatedAt = nowIso();
  batch.processingStartedAt = batch.updatedAt;
  batch.expiresAt = new Date(Date.now() + BATCH_TTL_MS).toISOString();
  await writeMeta(batch);
  const completedFile = batch.files?.[completedIndex];
  if (completedFile) await rm(join(batchDir(batch.id), completedFile.storageName), { force: true }).catch(() => {});
  return batch;
}

export async function pauseImportBatch(batch, error = null) {
  batch.status = 'paused';
  batch.currentIndex = batch.results.length;
  batch.processingStartedAt = null;
  batch.updatedAt = nowIso();
  batch.expiresAt = new Date(Date.now() + BATCH_TTL_MS).toISOString();
  batch.lastError = error || null;
  return writeMeta(batch);
}

export async function completeImportBatch(batch, finalData) {
  batch.status = 'completed';
  batch.currentIndex = batch.total;
  batch.processingStartedAt = null;
  batch.updatedAt = nowIso();
  batch.expiresAt = new Date(Date.now() + COMPLETED_TTL_MS).toISOString();
  batch.lastError = null;
  batch.finalData = finalData;
  await removeImageFiles(batch);
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
  await rm(batchDir(id), { recursive: true, force: true });
  return true;
}

export function publicImportBatch(batch) {
  return {
    batchId: batch.id,
    status: batch.status,
    total: batch.total,
    completed: batch.results.length,
    currentIndex: batch.currentIndex,
    capturedAt: batch.capturedAt,
    allianceId: batch.allianceId,
    files: (batch.files || []).map(({ index, name, mimetype, size }) => ({ index, name, mimetype, size })),
    lastError: batch.lastError,
    finalData: batch.finalData,
    expiresAt: batch.expiresAt,
  };
}

const cleanupTimer = setInterval(() => {
  cleanupExpiredImportBatches().catch(error => console.warn('[alliance-tracker] limpeza de lote temporário:', error.message));
}, BATCH_SWEEP_MS);
cleanupTimer.unref?.();
