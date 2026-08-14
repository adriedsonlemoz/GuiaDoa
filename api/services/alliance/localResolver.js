import { nameSimilarity, normalizeMemberName, sanitizeExtractedRow, SNAPSHOT_TYPES } from '../../utils/allianceTracker.js';

const AUTO_SCORE = 0.94;
const SUGGEST_SCORE = 0.80;
const MIN_MARGIN = 0.055;

const CONFUSABLES = new Map([
  ['0', 'o'], ['1', 'i'], ['l', 'i'], ['|', 'i'], ['5', 's'], ['8', 'b'], ['6', 'g'],
  ['rn', 'm'], ['vv', 'w'],
]);

function clamp(value, min = 0, max = 1) {
  return Math.max(min, Math.min(max, Number(value) || 0));
}

function compactName(value = '') {
  let text = normalizeMemberName(value)
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, '')
    .replace(/[._\-·•'’`´]/g, '');
  for (const [from, to] of CONFUSABLES) text = text.split(from).join(to);
  return text;
}

export function weightedNicknameSimilarity(a, b) {
  const normal = nameSimilarity(a, b);
  const x = compactName(a);
  const y = compactName(b);
  const confusable = nameSimilarity(x, y);
  // A versão com confusões comuns é apenas evidência; nunca basta sozinha para renomear.
  return clamp(normal * 0.58 + confusable * 0.42);
}

function rowValue(row = {}, type = 'power') {
  if (type === 'power') return Number.isFinite(Number(row.power)) ? Number(row.power) : null;
  if (type === 'joined_at') return String(row.joinedAt || '').trim();
  if (type === 'last_connection') return row.online ? 'online' : String(row.lastConnection || '').trim();
  return null;
}

function aliasesOf(member = {}) {
  return [member.currentName, ...(member.aliases || []).map(alias => alias?.name)].filter(Boolean);
}

function memberEvidence(member = {}, row = {}, type = 'power') {
  let bonus = 0;
  const reasons = [];
  if (type === 'power' && member.latestPower != null && row.power != null && Number(member.latestPower) > 0) {
    const delta = Math.abs(Number(row.power) - Number(member.latestPower)) / Number(member.latestPower);
    if (delta <= 0.04) { bonus += 0.08; reasons.push('poder muito próximo do histórico'); }
    else if (delta <= 0.10) { bonus += 0.055; reasons.push('poder próximo do histórico'); }
    else if (delta <= 0.22) { bonus += 0.025; reasons.push('poder compatível com o histórico'); }
  }
  if (type === 'joined_at' && row.joinedAt) {
    const known = String(member.joinedAtRaw || '').trim();
    if (known && known === String(row.joinedAt).trim()) { bonus += 0.10; reasons.push('mesma data de entrada'); }
  }
  return { bonus, reasons };
}

function correctionCandidate(row = {}, corrections = []) {
  const observed = normalizeMemberName(row.name);
  const matches = corrections
    .filter(item => normalizeMemberName(item.observedName) === observed && item.confirmedName)
    .sort((a, b) => Number(b.count || 0) - Number(a.count || 0));
  if (!matches.length) return null;
  const best = matches[0];
  const count = Math.max(1, Number(best.count || 1));
  return {
    name: best.confirmedName,
    score: clamp(0.91 + Math.min(0.075, count * 0.0125)),
    reasons: [`correção confirmada ${count}x anteriormente`],
    learned: true,
  };
}

function knownCandidates(row = {}, knownMembers = [], type = 'power') {
  const candidates = [];
  for (const member of knownMembers || []) {
    let bestNameScore = 0;
    let matchedAlias = null;
    for (const alias of aliasesOf(member)) {
      const similarity = weightedNicknameSimilarity(row.name, alias);
      if (similarity > bestNameScore) { bestNameScore = similarity; matchedAlias = alias; }
    }
    if (bestNameScore < 0.60) continue;
    const evidence = memberEvidence(member, row, type);
    candidates.push({
      name: member.currentName || matchedAlias,
      memberId: member._id ? String(member._id) : null,
      score: clamp(bestNameScore + evidence.bonus),
      nameScore: bestNameScore,
      reasons: [`nickname semelhante (${Math.round(bestNameScore * 100)}%)`, ...evidence.reasons],
      learned: false,
    });
  }
  return candidates.sort((a, b) => b.score - a.score);
}

function reviewItemFor(row, candidate, confidence, reason = 'local_resolver_suggestion') {
  return {
    type: reason,
    name: row.name,
    suggestedName: candidate?.name || null,
    confidence: Number(confidence.toFixed(3)),
    reasons: candidate?.reasons || [],
    message: candidate?.name
      ? `Resolvedor local sugere “${candidate.name}” para a leitura “${row.name}” (${Math.round(confidence * 100)}%).`
      : `Resolvedor local manteve “${row.name}” para confirmação manual.`,
  };
}

export function resolveAllianceOcrLocally({
  ocr = {},
  knownMembers = [],
  corrections = [],
  autoScore = AUTO_SCORE,
  suggestScore = SUGGEST_SCORE,
  minMargin = MIN_MARGIN,
} = {}) {
  const type = SNAPSHOT_TYPES.includes(ocr.snapshotType) ? ocr.snapshotType : null;
  const rows = [];
  const reviewItems = [];
  const decisions = [];
  let autoResolved = 0;
  let suggested = 0;

  for (const raw of Array.isArray(ocr.rows) ? ocr.rows : []) {
    const sanitized = type ? sanitizeExtractedRow(raw, type) : null;
    if (!sanitized) continue;
    const row = {
      ...raw,
      ...sanitized,
      ocrOriginalName: raw.ocrOriginalName || raw.name,
      resolverResolved: false,
      resolverConfidence: null,
      resolverSuggestion: null,
    };

    const exactKnown = (knownMembers || []).find(member => aliasesOf(member).some(alias => normalizeMemberName(alias) === normalizeMemberName(row.name)));
    if (exactKnown) {
      const evidence = memberEvidence(exactKnown, row, type);
      // Nome conhecido confirma a identidade, mas não deve mascarar um valor numérico/data
      // de baixa confiança. Só libera uma linha já duvidosa quando o próprio valor também
      // é compatível com o histórico disponível.
      const valueBacked = evidence.bonus >= 0.05;
      row.reviewRequired = Boolean(raw.reviewRequired && !valueBacked);
      row.reviewReasons = row.reviewRequired ? [...new Set([...(raw.reviewReasons || []), 'low_ocr_confidence'])] : [];
      row.resolverConfidence = row.reviewRequired ? Number(clamp(0.86 + evidence.bonus).toFixed(3)) : 1;
      row.resolverResolved = !row.reviewRequired;
      row.resolverReasons = ['nickname exato no histórico', ...evidence.reasons];
      row.source = row.resolverResolved ? 'local_resolver' : (raw.source || 'ocr');
      rows.push(row);
      decisions.push({ original: raw.name, final: row.name, confidence: row.resolverConfidence, action: row.resolverResolved ? 'confirmed_known' : 'review', reasons: row.resolverReasons });
      continue;
    }

    const learned = correctionCandidate(row, corrections);
    const known = knownCandidates(row, knownMembers, type);
    const candidates = [...(learned ? [learned] : []), ...known]
      .reduce((acc, item) => {
        const key = normalizeMemberName(item.name);
        const prior = acc.get(key);
        if (!prior || item.score > prior.score) acc.set(key, item);
        return acc;
      }, new Map());
    const ranked = [...candidates.values()].sort((a, b) => b.score - a.score);
    const best = ranked[0] || null;
    const second = ranked[1] || null;
    const margin = best ? best.score - Number(second?.score || 0) : 0;
    const ocrConfidence = clamp(raw.confidence ?? 0.75);
    // OCR forte + candidato inequívoco ou correção repetidamente ensinada pelo admin.
    const threshold = best?.learned && Number((corrections || []).find(c => normalizeMemberName(c.observedName) === normalizeMemberName(row.name) && normalizeMemberName(c.confirmedName) === normalizeMemberName(best.name))?.count || 0) >= 2
      ? Math.min(autoScore, 0.93)
      : autoScore;
    const safeAuto = Boolean(best && best.score >= threshold && margin >= minMargin && ocrConfidence >= 0.58);

    if (safeAuto) {
      row.name = best.name;
      row.normalizedName = normalizeMemberName(best.name);
      row.reviewRequired = false;
      row.reviewReasons = [];
      row.resolverResolved = true;
      row.resolverConfidence = Number(best.score.toFixed(3));
      row.resolverReasons = best.reasons;
      row.source = 'local_resolver';
      row.sources = [...new Set([...(raw.sources || [raw.source || 'ocr']), 'local_resolver'])];
      autoResolved += 1;
      decisions.push({ original: raw.name, final: best.name, confidence: best.score, action: 'auto_resolved', reasons: best.reasons });
    } else if (best && best.score >= suggestScore) {
      row.reviewRequired = true;
      row.reviewReasons = [...new Set([...(raw.reviewReasons || []), 'local_resolver_suggestion'])];
      row.resolverSuggestion = best.name;
      row.resolverConfidence = Number(best.score.toFixed(3));
      row.resolverReasons = best.reasons;
      suggested += 1;
      reviewItems.push(reviewItemFor(row, best, best.score));
      decisions.push({ original: raw.name, final: row.name, suggested: best.name, confidence: best.score, action: 'suggested', reasons: best.reasons });
    } else {
      row.reviewRequired = Boolean(raw.reviewRequired);
      row.reviewReasons = [...new Set(raw.reviewReasons || [])];
      decisions.push({ original: raw.name, final: row.name, confidence: best?.score || 0, action: row.reviewRequired ? 'review' : 'kept' });
    }
    rows.push(row);
  }

  const parsedNames = new Set(rows.map(row => normalizeMemberName(row.ocrOriginalName || row.name)));
  const unresolvedStructural = (ocr.exceptions || []).filter(item => {
    if (item.type !== 'low_confidence') return true;
    return !parsedNames.has(normalizeMemberName(item.name));
  });
  const pendingRows = rows.filter(row => row.reviewRequired);
  const trustedRows = rows.filter(row => !row.reviewRequired);
  const accepted = Boolean(type && rows.length >= 2 && pendingRows.length === 0 && unresolvedStructural.length === 0);
  const usable = Boolean(type && rows.length >= 2);
  const reason = accepted
    ? null
    : !type
      ? 'snapshot_type'
      : rows.length < 2
        ? 'rows'
        : unresolvedStructural.length
          ? 'structural'
          : pendingRows.length
            ? 'review'
            : 'confidence';

  return {
    ...ocr,
    accepted,
    usable,
    reason,
    rows,
    trustedRows,
    exceptions: unresolvedStructural,
    reviewItems,
    resolver: {
      engine: 'guiadoa-local-resolver',
      autoResolved,
      suggested,
      pendingRows: pendingRows.length,
      structuralExceptions: unresolvedStructural.length,
      decisions,
      learnedCorrectionsAvailable: (corrections || []).length,
      knownMembersAvailable: (knownMembers || []).length,
    },
  };
}
