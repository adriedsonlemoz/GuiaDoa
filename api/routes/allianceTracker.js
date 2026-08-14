import { Router } from 'express';
import mongoose from 'mongoose';
import multer from 'multer';
import AllianceWorkspace from '../models/AllianceWorkspace.js';
import AllianceMember from '../models/AllianceMember.js';
import AllianceSnapshot from '../models/AllianceSnapshot.js';
import AllianceOcrCorrection from '../models/AllianceOcrCorrection.js';
import { autenticar, exigirAdmin } from '../middleware/auth.js';
import {
  ALLIANCE_MEMBER_LIMIT,
  SNAPSHOT_TYPES,
  cleanMemberName,
  computeMembershipDiff,
  mergeExtractedRows,
  normalizeMemberName,
  parsePower,
  parseRealmDate,
  sanitizeExtractedRow,
  scoreNicknameCandidate,
} from '../utils/allianceTracker.js';
import { extractAllianceScreenshot, serializeVisionError } from '../services/alliance/vision.js';
import {
  appendImportBatchResult,
  cancelImportBatch,
  completeImportBatch,
  createImportBatch,
  loadImportBatch,
  markImportBatchProcessing,
  heartbeatImportBatch,
  pauseImportBatch,
  publicImportBatch,
  readImportBatchImage,
  saveImportBatchOcrCheckpoint,
} from '../services/alliance/importBatch.js';

const router = Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 6 * 1024 * 1024,
    files: 10,
    fields: 12,
    parts: 24,
    fieldSize: 128 * 1024,
    fieldNestingDepth: 2,
  },
  fileFilter: (_req, file, cb) => {
    const allowed = new Set(['image/jpeg', 'image/png', 'image/webp']);
    if (!allowed.has(file.mimetype)) {
      const err = new Error('Envie apenas imagens JPG, PNG ou WebP.');
      err.status = 400;
      return cb(err);
    }
    cb(null, true);
  },
});

router.use(autenticar, exigirAdmin);

const oid = value => mongoose.Types.ObjectId.isValid(String(value || '')) ? new mongoose.Types.ObjectId(String(value)) : null;
const dateIso = value => {
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : d;
};

async function workspaceFor(req, id) {
  const _id = oid(id);
  if (!_id) return null;
  return AllianceWorkspace.findOne({ _id, ownerUserId: req.usuario.id });
}

function serializeMember(member) {
  const m = member.toObject ? member.toObject() : member;
  const growth = m.latestPower != null && m.previousPower != null ? m.latestPower - m.previousPower : null;
  const growthPercent = growth != null && m.previousPower > 0 ? (growth / m.previousPower) * 100 : null;
  return { ...m, growth, growthPercent };
}

router.get('/alliances', async (req, res) => {
  const list = await AllianceWorkspace.find({ ownerUserId: req.usuario.id }).sort({ updatedAt: -1 }).lean();
  res.json({ alliances: list, total: list.length, memberLimit: ALLIANCE_MEMBER_LIMIT });
});

router.post('/alliances', async (req, res) => {
  const name = cleanMemberName(req.body?.name);
  const realm = String(req.body?.realm || '').trim().slice(0, 80);
  const utcOffset = Number(req.body?.utcOffset ?? 0);
  if (!name) return res.status(400).json({ erro: 'Informe o nome da Aliança.' });
  if (!Number.isFinite(utcOffset) || utcOffset < -12 || utcOffset > 14) return res.status(400).json({ erro: 'UTC do realm inválido.' });
  const doc = await AllianceWorkspace.create({
    name,
    realm,
    utcOffset,
    memberLimit: ALLIANCE_MEMBER_LIMIT,
    ownerUserId: req.usuario.id,
  });
  res.status(201).json(doc);
});

router.patch('/alliances/:id', async (req, res) => {
  const alliance = await workspaceFor(req, req.params.id);
  if (!alliance) return res.status(404).json({ erro: 'Aliança não encontrada.' });
  const name = cleanMemberName(req.body?.name ?? alliance.name);
  const realm = String(req.body?.realm ?? alliance.realm ?? '').trim().slice(0, 80);
  const utcOffset = Number(req.body?.utcOffset ?? alliance.utcOffset ?? 0);
  if (!name || !Number.isFinite(utcOffset) || utcOffset < -12 || utcOffset > 14) return res.status(400).json({ erro: 'Configuração inválida.' });
  alliance.name = name;
  alliance.realm = realm;
  alliance.utcOffset = utcOffset;
  alliance.updatedAt = new Date();
  await alliance.save();
  res.json(alliance);
});

router.get('/alliances/:id/summary', async (req, res) => {
  const alliance = await workspaceFor(req, req.params.id);
  if (!alliance) return res.status(404).json({ erro: 'Aliança não encontrada.' });
  const allianceId = alliance._id;
  const [activeMembers, leftCount, latestConnection, recentSnapshots] = await Promise.all([
    AllianceMember.find({ allianceId, status: 'active' }).lean(),
    AllianceMember.countDocuments({ allianceId, status: 'left' }),
    AllianceSnapshot.findOne({ allianceId, type: 'last_connection' }).sort({ capturedAt: -1 }).lean(),
    AllianceSnapshot.find({ allianceId, 'changes.0': { $exists: true } }).sort({ capturedAt: -1 }).limit(8).lean(),
  ]);
  const cutoff3d = Date.now() - 3 * 86400000;
  const inactive3d = activeMembers.filter(m => m.lastConnectionAt && new Date(m.lastConnectionAt).getTime() < cutoff3d).length;
  const unknownConnection = activeMembers.filter(m => !m.lastConnectionAt).length;
  const totalPower = activeMembers.reduce((sum, m) => sum + (Number(m.latestPower) || 0), 0);
  const online = latestConnection?.rows?.filter(r => r.online).length || 0;
  const changes = recentSnapshots.flatMap(s => (s.changes || []).map(c => ({ ...c, capturedAt: s.capturedAt, snapshotId: s._id }))).slice(0, 20);
  res.json({
    alliance,
    stats: { active: activeMembers.length, left: leftCount, online, inactive3d, unknownConnection, totalPower, limit: alliance.memberLimit || ALLIANCE_MEMBER_LIMIT },
    changes,
  });
});

router.get('/alliances/:id/members', async (req, res) => {
  const alliance = await workspaceFor(req, req.params.id);
  if (!alliance) return res.status(404).json({ erro: 'Aliança não encontrada.' });
  const status = ['active', 'left'].includes(req.query.status) ? req.query.status : null;
  const query = { allianceId: alliance._id, ...(status ? { status } : {}) };
  const members = await AllianceMember.find(query).sort({ status: 1, latestPower: -1, currentName: 1 });
  res.json({ members: members.map(serializeMember), total: members.length });
});

router.get('/alliances/:id/snapshots', async (req, res) => {
  const alliance = await workspaceFor(req, req.params.id);
  if (!alliance) return res.status(404).json({ erro: 'Aliança não encontrada.' });
  const limit = Math.max(1, Math.min(100, Number(req.query.limit) || 30));
  const snapshots = await AllianceSnapshot.find({ allianceId: alliance._id }).sort({ capturedAt: -1 }).limit(limit).lean();
  res.json({ snapshots, total: snapshots.length });
});

async function mapLimited(items, limit, worker) {
  const results = new Array(items.length);
  let next = 0;
  async function run() {
    while (next < items.length) {
      const index = next++;
      results[index] = await worker(items[index], index);
    }
  }
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, run));
  return results;
}

function logVisionError(error) {
  if (error?.detail) console.error('[alliance-tracker] leitura local:', error.detail);
}

function releaseUploadBuffers(req) {
  if (!Array.isArray(req.files)) return;
  for (const file of req.files) {
    if (file && Buffer.isBuffer(file.buffer)) file.buffer = null;
  }
  req.files = [];
}

router.post('/extract', upload.array('images', 10), async (req, res) => {
  if (!req.files?.length) return res.status(400).json({ erro: 'Selecione pelo menos um screenshot.' });
  const imagesCount = req.files.length;
  res.setHeader('Deprecation', 'true');
  res.setHeader('Link', '</api/alliance-tracker/extract-stream>; rel="successor-version"');
  try {
    // Compatibilidade legada: usa exatamente o mesmo leitor local, mas sem retomada.
    const hint = SNAPSHOT_TYPES.includes(req.body?.snapshotTypeHint) ? req.body.snapshotTypeHint : null;
    const results = await mapLimited(req.files, 1, async (file) => extractAllianceScreenshot({
      buffer: file.buffer,
      mimetype: file.mimetype,
      snapshotTypeHint: hint,
    }));
    const merged = mergeExtractedRows(results, hint);
    if (!merged.rows.length && !merged.reviewItems?.length) {
      merged.reviewItems = [{ type:'image_manual_entry', message:'Nenhuma linha pôde ser reconstruída automaticamente; revise e adicione os dados manualmente.' }];
      merged.warnings = [...new Set([...(merged.warnings || []), 'Leitura local inconclusiva; revisão manual necessária.'])];
    }
    res.json({
      ...merged,
      imagesCount,
      models: [...new Set(results.map(r => r.model).filter(Boolean))],
      engines: [...new Set(results.map(r => r.engine).filter(Boolean))],
      ocrImagesCount: results.filter(r => r.engine === 'ocr').length,
      aiImagesCount: 0,
    });
  } catch (error) {
    if (error.name === 'AbortError') return res.status(504).json({ erro: 'A leitura dos screenshots demorou demais.', code: 'VISION_TIMEOUT', retryable: true });
    logVisionError(error);
    res.status(error.status || 502).json(serializeVisionError(error));
  } finally {
    releaseUploadBuffers(req);
  }
});

router.get('/extract-batches/:batchId', async (req, res) => {
  const batch = await loadImportBatch(req.params.batchId, req.usuario.id);
  if (!batch) return res.status(404).json({ erro: 'Lote de leitura não encontrado ou expirado.', code: 'VISION_BATCH_NOT_FOUND' });
  res.json(publicImportBatch(batch));
});

router.get('/extract-batches/:batchId/images/:index', async (req, res) => {
  const batch = await loadImportBatch(req.params.batchId, req.usuario.id);
  if (!batch) return res.status(404).json({ erro: 'Lote de leitura não encontrado ou expirado.', code: 'VISION_BATCH_NOT_FOUND' });
  const index = Number(req.params.index);
  if (!Number.isInteger(index) || index < 0 || index >= batch.total) return res.status(400).json({ erro: 'Índice de imagem inválido.' });
  const file = await readImportBatchImage(batch, index);
  if (!file) return res.status(404).json({ erro: 'A imagem temporária não está mais disponível.' });
  res.setHeader('Content-Type', file.mimetype || 'application/octet-stream');
  res.setHeader('Cache-Control', 'private, no-store, max-age=0');
  res.setHeader('Content-Disposition', `inline; filename="alliance-${index + 1}"`);
  res.send(file.buffer);
});

router.delete('/extract-batches/:batchId', async (req, res) => {
  const removed = await cancelImportBatch(req.params.batchId, req.usuario.id);
  if (!removed) return res.status(404).json({ erro: 'Lote de leitura não encontrado ou expirado.', code: 'VISION_BATCH_NOT_FOUND' });
  res.json({ ok: true });
});

router.post('/extract-stream', upload.array('images', 10), async (req, res) => {
  const resumeId = String(req.query.batchId || '').trim();
  let batch = null;

  if (resumeId) {
    batch = await loadImportBatch(resumeId, req.usuario.id);
    if (!batch) return res.status(404).json({ erro: 'Lote de leitura não encontrado ou expirado.', code: 'VISION_BATCH_NOT_FOUND' });
  } else {
    if (!req.files?.length) return res.status(400).json({ erro: 'Selecione pelo menos um screenshot.' });
    const capturedAt = dateIso(req.body?.capturedAt)?.toISOString() || new Date().toISOString();
    const snapshotTypeHint = SNAPSHOT_TYPES.includes(req.body?.snapshotTypeHint) ? req.body.snapshotTypeHint : null;
    try {
      batch = await createImportBatch({
        files: req.files,
        ownerUserId: req.usuario.id,
        allianceId: req.body?.allianceId || null,
        capturedAt,
        snapshotTypeHint,
      });
    } catch (error) {
      const payload = serializeVisionError(error);
      return res.status(error?.code === 'ALLIANCE_BATCH_OWNER_BUSY' ? 409 : 500).json(payload);
    } finally {
      releaseUploadBuffers(req);
    }
  }

  if (batch.status === 'processing') {
    return res.status(409).json({
      erro: 'Este lote ainda está processando a imagem atual. O progresso já concluído continua preservado.',
      code: 'VISION_BATCH_BUSY',
      retryable: true,
      retryAfterMs: 1500,
      ...publicImportBatch(batch),
    });
  }

  res.status(200);
  res.setHeader('Content-Type', 'application/x-ndjson; charset=utf-8');
  res.setHeader('Cache-Control', 'no-cache, no-transform');
  res.setHeader('X-Accel-Buffering', 'no');
  res.flushHeaders?.();

  let clientDisconnected = false;
  res.on('close', () => {
    if (!res.writableEnded) clientDisconnected = true;
  });

  const send = payload => {
    if (res.destroyed || res.writableEnded) return false;
    res.write(`${JSON.stringify(payload)}\n`);
    return true;
  };
  let knownNames = [];
  let resolverMembers = [];
  let resolverCorrections = [];
  if (batch.allianceId) {
    const alliance = await workspaceFor(req, batch.allianceId).catch(() => null);
    if (alliance) {
      [resolverMembers, resolverCorrections] = await Promise.all([
        AllianceMember.find({ allianceId: alliance._id })
          .select('currentName aliases status latestPower joinedAt joinedAtRaw lastConnectionAt lastConnectionRaw updatedAt')
          .sort({ status: 1, updatedAt: -1 })
          .limit(500)
          .lean(),
        AllianceOcrCorrection.find({ allianceId: alliance._id })
          .select('observedName confirmedName count lastConfirmedAt')
          .sort({ count: -1, lastConfirmedAt: -1 })
          .limit(500)
          .lean(),
      ]);
      knownNames = resolverMembers.map(member => member.currentName).filter(Boolean);
    }
  }

  if (batch.status === 'completed' && batch.finalData) {
    send({ type: 'start', imagesCount: batch.total, batchId: batch.id, completed: batch.total, resumed: true });
    send({ type: 'done', data: batch.finalData, batchId: batch.id, completed: batch.total, total: batch.total });
    return res.end();
  }

  try {
    await markImportBatchProcessing(batch);
    send({
      type: 'start',
      imagesCount: batch.total,
      uploadedTotal: batch.uploadedTotal || batch.total,
      duplicatesSkipped: batch.duplicatesSkipped || 0,
      batchId: batch.id,
      completed: batch.results.length,
      resumed: Boolean(resumeId),
      checkpoint: batch.currentCheckpoint ? {
        index: batch.currentCheckpoint.index,
        stage: batch.currentCheckpoint.stage,
        ocrReady: Boolean(batch.currentCheckpoint.ocr),
      } : null,
    });

    let lastHeartbeatAt = 0;
    let heartbeatChain = Promise.resolve();
    const emitProgress = (index, progress) => {
      send({
        type: 'vision_progress', index, total: batch.total, completed: batch.results.length,
        batchId: batch.id, ...progress,
      });
      const now = Date.now();
      if (now - lastHeartbeatAt >= 10_000) {
        lastHeartbeatAt = now;
        heartbeatChain = heartbeatChain.then(() => heartbeatImportBatch(batch)).catch(error => {
          console.warn('[alliance-tracker] heartbeat do lote:', error?.message || error);
        });
      }
    };

    for (let index = batch.results.length; index < batch.total; index += 1) {
      if (clientDisconnected) {
        await pauseImportBatch(batch, {
          erro: 'A conexão com o Admin foi interrompida. O lote ficou preservado para continuar.',
          code: 'VISION_CLIENT_DISCONNECTED',
          retryable: true,
        });
        return;
      }

      const file = await readImportBatchImage(batch, index);
      if (!file) {
        const missing = {
          erro: 'O arquivo temporário desta imagem não está mais disponível. Inicie um novo lote.',
          code: 'VISION_BATCH_IMAGE_MISSING',
          retryable: false,
        };
        await pauseImportBatch(batch, missing);
        send({ type: 'error', error: { ...missing, batchId: batch.id, completed: batch.results.length, total: batch.total, currentIndex: index } });
        return res.end();
      }

      send({
        type: 'image_start', index, total: batch.total, completed: batch.results.length,
        name: file.name, batchId: batch.id,
      });

      const savedOcr = batch.currentCheckpoint?.index === index ? batch.currentCheckpoint.ocr : null;
      const result = await extractAllianceScreenshot({
        buffer: file.buffer,
        mimetype: file.mimetype,
        ocrCheckpoint: savedOcr,
        knownMembers: resolverMembers,
        corrections: resolverCorrections,
        onCheckpoint: checkpoint => saveImportBatchOcrCheckpoint(batch, index, checkpoint),
        onProgress: progress => emitProgress(index, progress),
        snapshotTypeHint: batch.snapshotTypeHint || null,
      });

      await heartbeatChain;
      await appendImportBatchResult(batch, result);
      send({
        type: 'image_done', index, total: batch.total, completed: batch.results.length,
        rows: result.rows.length, snapshotType: result.snapshotType, model: result.model,
        engine: result.engine || null, aiUsed: Boolean(result.aiUsed),
        ocrConfidence: result.ocrConfidence ?? null,
        ocrPasses: result.ocrDiagnostics?.passesCount || 0,
        trustedRows: result.ocrTrustedRows ?? result.ocrDiagnostics?.trustedRows ?? result.rows.length,
        exceptions: result.ocrExceptions ?? result.ocrDiagnostics?.exceptions ?? result.reviewItems?.length ?? 0,
        reviewItems: result.reviewItems?.length || 0,
        localResolverUsed: Boolean(result.localResolverUsed),
        localResolved: Number(result.localResolver?.autoResolved || 0),
        localSuggested: Number(result.localResolver?.suggested || 0),
        localPending: Number(result.localResolver?.pendingRows || 0),
        warnings: result.warnings?.length || 0, batchId: batch.id,
      });

      if (clientDisconnected && batch.results.length < batch.total) {
        await pauseImportBatch(batch, {
          erro: 'A conexão com o Admin foi interrompida. As imagens concluídas foram preservadas.',
          code: 'VISION_CLIENT_DISCONNECTED',
          retryable: true,
        });
        return;
      }
    }

    send({ type: 'merge_start', imagesCount: batch.results.length, completed: batch.results.length, total: batch.total, batchId: batch.id });
    const merged = mergeExtractedRows(batch.results, batch.snapshotTypeHint || null, { knownNames });
    if (!merged.rows.length && !merged.reviewItems?.length) {
      merged.reviewItems = [{
        type: 'image_manual_entry',
        message: 'Nenhuma linha pôde ser reconstruída automaticamente. O lote foi concluído para que você possa informar os dados manualmente na revisão.',
      }];
      merged.warnings = [...new Set([...(merged.warnings || []), 'Nenhuma linha foi confirmada automaticamente; use a revisão manual para adicionar os dados.'])];
    }

    const pureOcrImagesCount = batch.results.filter(r => r.engine === 'ocr').length;
    const ocrImagesCount = batch.results.filter(r => !r.aiUsed).length;
    const aiImagesCount = 0;
    const manualReviewImages = batch.results.filter(r => r.manualReviewRequired).length;
    const ocrParticipatedImages = batch.results.filter(r => r.ocrUsed !== false).length;
    const totalOcrPasses = batch.results.reduce((sum, r) => sum + Number(r.ocrDiagnostics?.passesCount || 0), 0);
    const localResolverImages = batch.results.filter(r => r.localResolverUsed).length;
    const localAutoResolved = batch.results.reduce((sum, r) => sum + Number(r.localResolver?.autoResolved || 0), 0);
    const localSuggested = batch.results.reduce((sum, r) => sum + Number(r.localResolver?.suggested || 0), 0);
    const data = {
      ...merged,
      batchId: batch.id,
      capturedAt: batch.capturedAt,
      snapshotTypeHint: batch.snapshotTypeHint || null,
      coverageComplete: Boolean(merged.coverageComplete),
      sourceImages: (batch.files || []).map(({ index, name, mimetype, size }) => ({ index, name, mimetype, size })),
      uploadedImagesCount: batch.uploadedTotal || batch.total,
      imagesCount: batch.total,
      duplicatesSkipped: batch.duplicatesSkipped || 0,
      models: [...new Set(batch.results.map(r => r.model).filter(Boolean))],
      engines: [...new Set(batch.results.map(r => r.engine).filter(Boolean))],
      ocrImagesCount,
      aiImagesCount,
      metrics: {
        ...(merged.metrics || {}),
        uploadedImages: batch.uploadedTotal || batch.total,
        uniqueImages: batch.total,
        duplicatesSkipped: batch.duplicatesSkipped || 0,
        ocrOnlyImages: ocrImagesCount,
        pureOcrImages: pureOcrImagesCount,
        ocrParticipatedImages,
        aiFallbackImages: 0,
        aiAvoidanceRate: 100,
        localOnlyRate: 100,
        manualReviewImages,
        totalOcrPasses,
        localResolverImages,
        localAutoResolved,
        localSuggested,
        learnedCorrectionsAvailable: resolverCorrections.length,
        reviewItemsCount: merged.reviewItems?.length || 0,
      },
    };
    await completeImportBatch(batch, data);
    send({ type: 'done', data, batchId: batch.id, completed: batch.total, total: batch.total });
    res.end();
  } catch (error) {
    logVisionError(error);
    const payload = error.name === 'AbortError'
      ? { erro: 'A leitura desta imagem demorou demais e foi interrompida.', code: 'VISION_TIMEOUT', retryable: true }
      : serializeVisionError(error);
    const enriched = {
      ...payload,
      batchId: batch.id,
      completed: batch.results.length,
      total: batch.total,
      currentIndex: batch.results.length,
      canContinue: Boolean(payload.retryable),
    };
    await pauseImportBatch(batch, enriched).catch(() => {});
    send({ type: 'error', error: enriched });
    res.end();
  }
});

router.post('/alliances/:id/import', async (req, res) => {
  const workspace = await workspaceFor(req, req.params.id);
  if (!workspace) return res.status(404).json({ erro: 'Aliança não encontrada.' });

  const type = SNAPSHOT_TYPES.includes(req.body?.type) ? req.body.type : null;
  if (!type) return res.status(400).json({ erro: 'Tipo de captura inválido.' });
  const capturedAt = dateIso(req.body?.capturedAt) || new Date();
  const completeList = Boolean(req.body?.completeList);
  const imagesCount = Math.max(0, Math.min(20, Number(req.body?.imagesCount) || 0));
  const batchId = String(req.body?.batchId || '').trim();
  let verifiedCompleteBatch = null;

  // "Lista completa" só pode gerar saídas quando o próprio lote confirma cobertura
  // estrutural de todas as imagens. Não confiamos apenas no checkbox do navegador.
  if (completeList) {
    if (!batchId) {
      return res.status(409).json({
        erro: 'Para detectar saídas, confirme uma leitura completa vinculada ao lote atual.',
        code: 'ALLIANCE_COMPLETE_REQUIRES_BATCH',
      });
    }
    const batch = await loadImportBatch(batchId, req.usuario.id);
    const sameAlliance = batch && String(batch.allianceId || '') === String(workspace._id);
    const finalType = batch?.finalData?.snapshotType;
    if (!batch || batch.status !== 'completed' || !sameAlliance || finalType !== type) {
      return res.status(409).json({
        erro: 'O lote atual não corresponde a esta Aliança/tipo de captura. Importe como parcial ou faça uma nova leitura.',
        code: 'ALLIANCE_BATCH_MISMATCH',
      });
    }
    if (!batch.finalData?.coverageComplete) {
      return res.status(409).json({
        erro: 'Este lote possui uma ou mais imagens estruturalmente incompletas. Para proteger os membros, a detecção de saídas foi bloqueada.',
        code: 'ALLIANCE_COVERAGE_INCOMPLETE',
      });
    }
    verifiedCompleteBatch = batch;
  }

  const rawRows = Array.isArray(req.body?.rows) ? req.body.rows : [];
  const correctionCandidates = rawRows
    .filter(raw => raw?.reviewed && raw?.ocrOriginalName && cleanMemberName(raw.ocrOriginalName) && cleanMemberName(raw.name))
    .map(raw => ({ observedName: cleanMemberName(raw.ocrOriginalName), confirmedName: cleanMemberName(raw.name) }))
    .filter(item => item.observedName && item.confirmedName && normalizeMemberName(item.observedName) !== normalizeMemberName(item.confirmedName));

  const rowsMap = new Map();
  const invalidRows = [];
  rawRows.forEach((raw, index) => {
    const row = sanitizeExtractedRow(raw, type);
    if (!row) {
      invalidRows.push({ index, name: cleanMemberName(raw?.name || '') });
      return;
    }
    const prior = rowsMap.get(row.normalizedName);
    if (!prior || Number(row.confidence ?? -1) > Number(prior.confidence ?? -1)) rowsMap.set(row.normalizedName, row);
  });
  if (invalidRows.length) {
    return res.status(400).json({
      erro: `${invalidRows.length} linha(s) possuem valor inválido. Corrija Poder/data antes de importar.`,
      code: 'ALLIANCE_INVALID_ROWS',
      invalidRows,
    });
  }

  const rows = [...rowsMap.values()];
  if (!rows.length) return res.status(400).json({ erro: 'A importação não possui membros.' });
  if (completeList && verifiedCompleteBatch) {
    const expectedRows = Number(verifiedCompleteBatch.finalData?.rows?.length || 0);
    if (!expectedRows || rows.length !== expectedRows) {
      return res.status(409).json({
        erro: 'A quantidade de linhas foi alterada manualmente após a leitura. Para evitar falsas saídas, importe como parcial ou refaça a captura.',
        code: 'ALLIANCE_COMPLETE_ROWS_CHANGED',
      });
    }
  }
  if (rows.length > (workspace.memberLimit || ALLIANCE_MEMBER_LIMIT)) {
    return res.status(400).json({ erro: `Uma Aliança aceita no máximo ${ALLIANCE_MEMBER_LIMIT} membros.` });
  }

  const session = await mongoose.startSession();
  let payload = null;
  try {
    await session.withTransaction(async () => {
      const alliance = await AllianceWorkspace.findOne({ _id: workspace._id, ownerUserId: req.usuario.id }).session(session);
      if (!alliance) {
        const error = new Error('Aliança não encontrada.');
        error.status = 404;
        throw error;
      }

      const allMembers = await AllianceMember.find({ allianceId: alliance._id }).session(session);
      const activeBefore = allMembers.filter(m => m.status === 'active');
      const hasPreviousComplete = Boolean(await AllianceSnapshot.exists({ allianceId: alliance._id, completeList: true }).session(session));
      const baseline = completeList && !hasPreviousComplete;

      const byName = new Map();
      allMembers.forEach(m => {
        byName.set(m.normalizedName, m);
        (m.aliases || []).forEach(a => byName.set(a.normalizedName, m));
      });

      const unmatchedIncoming = rows.filter(row => !byName.has(row.normalizedName)).length;
      const returnedIncoming = rows.filter(row => byName.get(row.normalizedName)?.status === 'left').length;
      const projectedActive = activeBefore.length + unmatchedIncoming + returnedIncoming;
      if (!completeList && projectedActive > (alliance.memberLimit || ALLIANCE_MEMBER_LIMIT)) {
        const error = new Error(`A importação parcial resultaria em ${projectedActive} membros ativos; o limite é ${ALLIANCE_MEMBER_LIMIT}. Revise nomes lidos incorretamente.`);
        error.status = 409;
        throw error;
      }

      const snapshotRows = [];
      const changes = [];
      const seenIds = new Set();
      const newMembers = [];
      const returnedMembers = [];

      for (const row of rows) {
        let member = byName.get(row.normalizedName) || null;
        if (!member) {
          member = new AllianceMember({
            _id: new mongoose.Types.ObjectId(),
            allianceId: alliance._id,
            currentName: row.name,
            normalizedName: row.normalizedName,
            aliases: [],
            status: 'active',
            firstSeenAt: capturedAt,
            lastSeenAt: capturedAt,
          });
          newMembers.push(member);
          allMembers.push(member);
          byName.set(row.normalizedName, member);
        } else if (member.status === 'left') {
          member.status = 'active';
          member.leftAt = null;
          returnedMembers.push(member);
        }

        seenIds.add(String(member._id));
        if (!member.lastSeenAt || capturedAt >= member.lastSeenAt) member.lastSeenAt = capturedAt;
        member.updatedAt = new Date();

        let lastConnectionAt = null;
        let joinedAt = null;
        if (type === 'power') {
          const power = parsePower(row.power);
          if (power != null && (!member.latestPowerAt || capturedAt >= member.latestPowerAt)) {
            if (member.latestPower != null && member.latestPowerAt && power !== member.latestPower) {
              member.previousPower = member.latestPower;
              member.previousPowerAt = member.latestPowerAt;
            }
            member.latestPower = power;
            member.latestPowerAt = capturedAt;
          }
        }
        if (type === 'last_connection') {
          lastConnectionAt = row.online ? capturedAt : parseRealmDate(row.lastConnection, alliance.utcOffset);
          member.lastConnectionRaw = row.online ? 'Online' : (row.lastConnection || '');
          member.onlineAtCapture = Boolean(row.online);
          member.onlineCapturedAt = capturedAt;
          if (lastConnectionAt && (!member.lastConnectionAt || lastConnectionAt > member.lastConnectionAt)) member.lastConnectionAt = lastConnectionAt;
          if (row.online && (!member.lastConnectionAt || capturedAt > member.lastConnectionAt)) member.lastConnectionAt = capturedAt;
        }
        if (type === 'joined_at') {
          joinedAt = parseRealmDate(row.joinedAt, alliance.utcOffset);
          if (!joinedAt) {
            const error = new Error(`Data de entrada inválida para ${row.name}.`);
            error.status = 400;
            throw error;
          }
          member.joinedAtRaw = row.joinedAt || '';
          member.joinedAt = joinedAt;
        }

        await member.save({ session });
        snapshotRows.push({
          memberId: member._id,
          name: row.name,
          normalizedName: row.normalizedName,
          power: type === 'power' ? parsePower(row.power) : null,
          lastConnectionAt,
          lastConnectionRaw: type === 'last_connection' ? (row.online ? 'Online' : (row.lastConnection || '')) : '',
          joinedAt,
          joinedAtRaw: type === 'joined_at' ? (row.joinedAt || '') : '',
          online: Boolean(row.online),
        });
      }

      if (completeList && !baseline) {
        newMembers.forEach(m => changes.push({ type: 'joined', memberId: m._id, name: m.currentName, note: 'Novo nome em uma captura completa.' }));
        returnedMembers.forEach(m => changes.push({ type: 'returned', memberId: m._id, name: m.currentName, note: 'Membro que havia saído voltou a aparecer.' }));

        for (const member of activeBefore) {
          if (!seenIds.has(String(member._id))) {
            member.status = 'left';
            member.leftAt = capturedAt;
            member.updatedAt = new Date();
            await member.save({ session });
            changes.push({ type: 'left', memberId: member._id, name: member.currentName, note: 'Não apareceu na nova captura completa validada.' });
          }
        }

        const leftNow = activeBefore.filter(m => !seenIds.has(String(m._id)));
        const candidateRows = newMembers.map(m => rows.find(r => r.normalizedName === m.normalizedName)).filter(Boolean);
        for (const row of candidateRows) {
          const ranked = leftNow
            .map(old => ({ old, ...scoreNicknameCandidate(old, row, type) }))
            .filter(c => c.score >= 0.55)
            .sort((a, b) => b.score - a.score)
            .slice(0, 1);
          const fresh = newMembers.find(m => m.normalizedName === row.normalizedName);
          ranked.forEach(c => changes.push({
            type: 'nickname_candidate',
            memberId: c.old._id,
            name: c.old.currentName,
            otherMemberId: fresh?._id || null,
            otherName: row.name,
            score: Number(c.score.toFixed(2)),
            note: c.reasons.join(', '),
          }));
        }
      }

      const activeAfter = await AllianceMember.countDocuments({ allianceId: alliance._id, status: 'active' }).session(session);
      if (activeAfter > (alliance.memberLimit || ALLIANCE_MEMBER_LIMIT)) {
        const error = new Error(`A importação resultaria em ${activeAfter} membros ativos; o limite é ${ALLIANCE_MEMBER_LIMIT}. Revise nomes lidos incorretamente.`);
        error.status = 409;
        throw error;
      }

      const snapshot = new AllianceSnapshot({
        allianceId: alliance._id,
        type,
        capturedAt,
        completeList,
        baseline,
        imagesCount,
        rows: snapshotRows,
        changes,
        createdBy: req.usuario.id,
      });
      await snapshot.save({ session });

      if (correctionCandidates.length) {
        const dedupedCorrections = new Map();
        for (const item of correctionCandidates) {
          const key = `${normalizeMemberName(item.observedName)}\u0000${normalizeMemberName(item.confirmedName)}`;
          dedupedCorrections.set(key, item);
        }
        const confirmedAt = new Date();
        await AllianceOcrCorrection.bulkWrite([...dedupedCorrections.values()].map(item => ({
          updateOne: {
            filter: {
              allianceId: alliance._id,
              normalizedObserved: normalizeMemberName(item.observedName),
              normalizedConfirmed: normalizeMemberName(item.confirmedName),
            },
            update: {
              $set: { observedName: item.observedName, confirmedName: item.confirmedName, lastConfirmedAt: confirmedAt, createdBy: req.usuario.id },
              $setOnInsert: { firstConfirmedAt: confirmedAt },
              $inc: { count: 1 },
            },
            upsert: true,
          },
        })), { ordered: false, session });
      }

      alliance.updatedAt = new Date();
      await alliance.save({ session });

      payload = {
        snapshot: snapshot.toObject(),
        summary: {
          rows: snapshotRows.length,
          active: activeAfter,
          baseline,
          joined: changes.filter(c => c.type === 'joined').length,
          left: changes.filter(c => c.type === 'left').length,
          returned: changes.filter(c => c.type === 'returned').length,
          nicknameCandidates: changes.filter(c => c.type === 'nickname_candidate').length,
          learnedCorrections: correctionCandidates.length,
          atomic: true,
        },
      };
    });

    res.status(201).json(payload);
  } catch (error) {
    const status = Number(error?.status) || 500;
    const transactionUnsupported = /Transaction numbers are only allowed|replica set|mongos/i.test(String(error?.message || ''));
    res.status(transactionUnsupported ? 503 : status).json({
      erro: transactionUnsupported
        ? 'O MongoDB atual não oferece transações. A importação foi cancelada sem aplicar alterações; use um cluster replica set/Atlas para o Alliance Tracker.'
        : (error?.message || 'Falha ao importar a captura da Alliance. Nenhuma alteração parcial foi confirmada.'),
      code: transactionUnsupported ? 'ALLIANCE_TRANSACTION_UNAVAILABLE' : 'ALLIANCE_IMPORT_ATOMIC_FAILED',
    });
  } finally {
    await session.endSession().catch(() => {});
  }
});

router.post('/alliances/:id/merge-members', async (req, res) => {
  const alliance = await workspaceFor(req, req.params.id);
  if (!alliance) return res.status(404).json({ erro: 'Aliança não encontrada.' });
  const oldId = oid(req.body?.oldMemberId);
  const newId = oid(req.body?.newMemberId);
  if (!oldId || !newId || String(oldId) === String(newId)) return res.status(400).json({ erro: 'Membros inválidos para confirmar troca de nick.' });
  const [oldMember, newMember] = await Promise.all([
    AllianceMember.findOne({ _id: oldId, allianceId: alliance._id }),
    AllianceMember.findOne({ _id: newId, allianceId: alliance._id }),
  ]);
  if (!oldMember || !newMember) return res.status(404).json({ erro: 'Um dos membros não foi encontrado.' });

  const now = new Date();
  const oldAlias = { name: oldMember.currentName, normalizedName: oldMember.normalizedName, from: oldMember.firstSeenAt || now, to: now };
  oldMember.aliases = [...(oldMember.aliases || []), oldAlias, ...(newMember.aliases || [])]
    .filter((a, i, arr) => arr.findIndex(x => x.normalizedName === a.normalizedName) === i);
  oldMember.currentName = newMember.currentName;
  oldMember.normalizedName = newMember.normalizedName;
  oldMember.status = newMember.status;
  oldMember.leftAt = newMember.leftAt;
  oldMember.lastSeenAt = new Date(Math.max(new Date(oldMember.lastSeenAt || 0).getTime(), new Date(newMember.lastSeenAt || 0).getTime()));
  if (!oldMember.joinedAt && newMember.joinedAt) { oldMember.joinedAt = newMember.joinedAt; oldMember.joinedAtRaw = newMember.joinedAtRaw; }
  if (!oldMember.lastConnectionAt || (newMember.lastConnectionAt && newMember.lastConnectionAt > oldMember.lastConnectionAt)) {
    oldMember.lastConnectionAt = newMember.lastConnectionAt;
    oldMember.lastConnectionRaw = newMember.lastConnectionRaw;
  }
  if (!oldMember.latestPowerAt || (newMember.latestPowerAt && newMember.latestPowerAt > oldMember.latestPowerAt)) {
    oldMember.previousPower = oldMember.latestPower;
    oldMember.previousPowerAt = oldMember.latestPowerAt;
    oldMember.latestPower = newMember.latestPower;
    oldMember.latestPowerAt = newMember.latestPowerAt;
  }
  oldMember.updatedAt = now;
  await oldMember.save();

  const candidateSnapshot = await AllianceSnapshot.findOne({
    allianceId: alliance._id,
    changes: { $elemMatch: { type: 'nickname_candidate', memberId: oldMember._id, otherMemberId: newMember._id } },
  }).sort({ capturedAt: -1 });
  if (candidateSnapshot) {
    candidateSnapshot.changes = (candidateSnapshot.changes || []).filter(change => {
      if (change.type === 'nickname_candidate' && String(change.memberId) === String(oldMember._id) && String(change.otherMemberId) === String(newMember._id)) return false;
      if (change.type === 'joined' && String(change.memberId) === String(newMember._id)) return false;
      if (change.type === 'left' && String(change.memberId) === String(oldMember._id)) return false;
      return true;
    });
    candidateSnapshot.changes.push({ type: 'renamed', memberId: oldMember._id, name: oldAlias.name, otherMemberId: oldMember._id, otherName: oldMember.currentName, note: 'Troca de nickname confirmada manualmente.' });
    await candidateSnapshot.save();
  }

  await AllianceSnapshot.updateMany(
    { allianceId: alliance._id, 'rows.memberId': newMember._id },
    { $set: { 'rows.$[row].memberId': oldMember._id } },
    { arrayFilters: [{ 'row.memberId': newMember._id }] },
  );
  await AllianceSnapshot.updateMany(
    { allianceId: alliance._id, 'changes.memberId': newMember._id },
    { $set: { 'changes.$[chg].memberId': oldMember._id } },
    { arrayFilters: [{ 'chg.memberId': newMember._id }] },
  );
  await AllianceSnapshot.updateMany(
    { allianceId: alliance._id, 'changes.otherMemberId': newMember._id },
    { $set: { 'changes.$[chg].otherMemberId': oldMember._id } },
    { arrayFilters: [{ 'chg.otherMemberId': newMember._id }] },
  );
  await AllianceMember.deleteOne({ _id: newMember._id });
  res.json({ member: serializeMember(oldMember), mensagem: `Troca de nick confirmada: ${oldAlias.name} → ${oldMember.currentName}` });
});

export default router;
