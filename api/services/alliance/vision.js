import { SNAPSHOT_TYPES } from '../../utils/allianceTracker.js';
import { extractAllianceScreenshotWithOcr } from './ocr.js';
import { resolveAllianceOcrLocally } from './localResolver.js';

function ocrFromCheckpoint(checkpoint = null) {
  if (!checkpoint || typeof checkpoint !== 'object') return null;
  return {
    available: true,
    accepted: Boolean(checkpoint.accepted),
    usable: Boolean(checkpoint.usable),
    reason: checkpoint.reason || null,
    snapshotType: SNAPSHOT_TYPES.includes(checkpoint.snapshotType) ? checkpoint.snapshotType : null,
    rows: Array.isArray(checkpoint.rows) ? checkpoint.rows : [],
    trustedRows: Array.isArray(checkpoint.trustedRows) ? checkpoint.trustedRows : [],
    exceptions: Array.isArray(checkpoint.exceptions) ? checkpoint.exceptions : [],
    warnings: Array.isArray(checkpoint.warnings) ? checkpoint.warnings : [],
    confidence: checkpoint.confidence ?? null,
    diagnostics: checkpoint.diagnostics || {},
    checkpoint,
    engine: 'tesseract.js',
    model: 'tesseract.js/eng-local',
    restored: true,
  };
}

function manualReviewItem(local = {}, ocr = {}) {
  const structural = Number(local.resolver?.structuralExceptions || 0);
  const pending = Number(local.resolver?.pendingRows || 0);
  if (!local.snapshotType) {
    return {
      type: 'snapshot_type_manual',
      message: 'O leitor local não confirmou se esta captura é Poder, Última conexão ou Data de entrada. Selecione o tipo correto na revisão.',
    };
  }
  if (!local.rows?.length) {
    return {
      type: 'image_manual_entry',
      message: 'O leitor local não reconstruiu linhas suficientes nesta captura. O lote continuou; confira a imagem original e adicione/corrija as linhas manualmente na revisão.',
    };
  }
  if (structural) {
    return {
      type: 'structural_manual_review',
      count: structural,
      message: `${structural} trecho(s) desta captura não puderam ser reconstruídos com segurança. As linhas reconhecidas foram preservadas e o restante ficou para revisão manual.`,
    };
  }
  if (pending) {
    return {
      type: 'local_manual_review',
      count: pending,
      message: `${pending} linha(s) ficaram para confirmação manual pelo Admin.`,
    };
  }
  return null;
}

function buildLocalResult({ ocr, local, checkpoint }) {
  const manualItem = manualReviewItem(local, ocr);
  const reviewItems = [...(local.reviewItems || []), ...(manualItem ? [manualItem] : [])];
  const structural = Number(local.resolver?.structuralExceptions || 0);
  const pending = Number(local.resolver?.pendingRows || 0);
  const manualReviewRequired = Boolean(reviewItems.length || !local.accepted);
  const warnings = [...new Set([
    ...(local.warnings || []),
    ...(manualReviewRequired ? ['As dúvidas restantes foram preservadas para revisão manual; nenhuma IA externa foi chamada.'] : []),
  ])];

  return {
    snapshotType: local.snapshotType || null,
    rows: Array.isArray(local.rows) ? local.rows : [],
    warnings,
    reviewItems,
    model: local.resolver?.autoResolved ? 'guiadoa-local-resolver' : (ocr.model || 'tesseract.js/eng-local'),
    engine: manualReviewRequired ? 'local_resolver_review' : (local.resolver?.autoResolved ? 'local_resolver' : 'ocr'),
    aiUsed: false,
    externalAiUsed: false,
    localOnly: true,
    manualReviewRequired,
    ocrUsed: Boolean(ocr.available),
    localResolverUsed: true,
    localResolver: local.resolver || {},
    ocrConfidence: local.confidence ?? ocr.confidence ?? null,
    ocrDiagnostics: local.diagnostics || ocr.diagnostics || {},
    ocrTrustedRows: local.trustedRows?.length || 0,
    ocrExceptions: structural + pending,
    attempts: [],
    checkpoint: { ocr: checkpoint || null },
  };
}

export async function extractAllianceScreenshot({
  buffer,
  onProgress = null,
  onCheckpoint = null,
  ocrCheckpoint = null,
  ocrTimeoutMs = 90_000,
  knownMembers = [],
  corrections = [],
} = {}) {
  let ocr = ocrFromCheckpoint(ocrCheckpoint);
  if (ocr) {
    onProgress?.({
      stage: 'ocr_checkpoint_restored',
      engine: 'tesseract.js',
      confidence: ocr.confidence,
      rows: ocr.rows.length,
      trustedRows: ocr.trustedRows.length,
      exceptions: ocr.exceptions.length,
    });
  } else {
    ocr = await extractAllianceScreenshotWithOcr({ buffer, timeoutMs: ocrTimeoutMs, onProgress });
    if (ocr.checkpoint && onCheckpoint) {
      try { await onCheckpoint(ocr.checkpoint); } catch (error) {
        console.warn('[alliance-tracker] checkpoint OCR:', error?.message || error);
      }
    }
  }

  const local = resolveAllianceOcrLocally({ ocr, knownMembers, corrections });
  onProgress?.({
    stage: 'local_resolver',
    engine: 'guiadoa-local-resolver',
    accepted: local.accepted,
    usable: local.usable,
    rows: local.rows?.length || 0,
    autoResolved: local.resolver?.autoResolved || 0,
    suggested: local.resolver?.suggested || 0,
    pendingRows: local.resolver?.pendingRows || 0,
    structuralExceptions: local.resolver?.structuralExceptions || 0,
    learnedCorrections: local.resolver?.learnedCorrectionsAvailable || 0,
    knownMembers: local.resolver?.knownMembersAvailable || 0,
  });

  const result = buildLocalResult({ ocr, local, checkpoint: ocr.checkpoint || ocrCheckpoint || null });
  if (result.manualReviewRequired) {
    onProgress?.({
      stage: 'local_manual_review',
      engine: 'guiadoa-local-resolver',
      rows: result.rows.length,
      pendingRows: local.resolver?.pendingRows || 0,
      structuralExceptions: local.resolver?.structuralExceptions || 0,
      snapshotType: result.snapshotType,
      message: 'O leitor local preservou tudo que conseguiu e enviará as dúvidas para sua revisão. O lote continuará sem IA externa.',
    });
  } else {
    onProgress?.({
      stage: 'local_complete',
      engine: result.engine,
      rows: result.rows.length,
      snapshotType: result.snapshotType,
      message: 'Imagem resolvida inteiramente pelo leitor local.',
    });
  }
  return result;
}

export function serializeVisionError(error) {
  return {
    erro: error?.message || 'Falha ao analisar screenshots localmente.',
    code: error?.code || 'LOCAL_READER_ERROR',
    retryable: Boolean(error?.retryable),
    ocr: error?.ocr || null,
  };
}
