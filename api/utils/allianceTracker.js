export const ALLIANCE_MEMBER_LIMIT = 120;
export const SNAPSHOT_TYPES = Object.freeze(['power', 'last_connection', 'joined_at']);

export function normalizeMemberName(value = '') {
  return String(value || '')
    .normalize('NFC')
    .replace(/[\u0000-\u001F\u007F]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .toLocaleLowerCase('pt-BR');
}

export function cleanMemberName(value = '') {
  return String(value || '')
    .normalize('NFC')
    .replace(/[\u0000-\u001F\u007F]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 80);
}

export function parsePower(value) {
  if (value == null || value === '') return null;
  if (typeof value === 'number' && Number.isFinite(value)) return Math.max(0, Math.round(value));
  const digits = String(value).replace(/[^0-9]/g, '');
  return digits ? Number(digits) : null;
}

export function parseRealmDate(value, utcOffsetHours = 0) {
  if (!value) return null;
  if (value instanceof Date && !Number.isNaN(value.getTime())) return value;
  const text = String(value).trim();
  const direct = /^\d{4}-\d{2}-\d{2}T/.test(text) ? new Date(text) : null;
  if (direct && !Number.isNaN(direct.getTime())) return direct;
  const m = text.match(/^(\d{4})-(\d{2})-(\d{2})[ T](\d{2}):(\d{2})(?::(\d{2}))?$/);
  if (!m) return null;
  const [, y, mo, d, h, mi, s = '0'] = m;
  const offset = Number.isFinite(Number(utcOffsetHours)) ? Number(utcOffsetHours) : 0;
  return new Date(Date.UTC(Number(y), Number(mo) - 1, Number(d), Number(h), Number(mi), Number(s)) - offset * 3600000);
}

export function sanitizeExtractedRow(row = {}, type = 'power') {
  const name = cleanMemberName(row.name);
  if (!name || /^conectado$/i.test(name) || /^online$/i.test(name)) return null;
  const base = {
    name,
    normalizedName: normalizeMemberName(name),
    online: Boolean(row.online),
    confidence: Number.isFinite(Number(row.confidence)) ? Math.max(0, Math.min(1, Number(row.confidence))) : null,
    sourceImageIndex: Number.isInteger(Number(row.sourceImageIndex)) ? Number(row.sourceImageIndex) : null,
  };
  if (type === 'power') return { ...base, power: parsePower(row.power) };
  if (type === 'last_connection') return { ...base, lastConnection: String(row.lastConnection || row.lastConnectionAt || '').trim().slice(0, 32) };
  if (type === 'joined_at') return { ...base, joinedAt: String(row.joinedAt || '').trim().slice(0, 32) };
  return base;
}

export function mergeExtractedRows(results = [], forcedType = null, { knownNames = [] } = {}) {
  const detected = results.map(r => r?.snapshotType).filter(type => SNAPSHOT_TYPES.includes(type));
  const type = forcedType && SNAPSHOT_TYPES.includes(forcedType)
    ? forcedType
    : detected.sort((a, b) => detected.filter(x => x === b).length - detected.filter(x => x === a).length)[0] || 'power';
  const rows = [];
  const warnings = [];
  const reviewItems = [];
  const known = [...new Set((knownNames || []).map(cleanMemberName).filter(Boolean))];

  const valueKey = row => {
    if (type === 'power') return row.power == null ? '' : String(row.power);
    if (type === 'last_connection') return row.online ? 'online' : String(row.lastConnection || '');
    return String(row.joinedAt || '');
  };
  const confidenceOf = row => Number.isFinite(Number(row?.confidence)) ? Number(row.confidence) : 0.75;
  const addReviewReason = (row, reason) => {
    row.reviewRequired = true;
    row.reviewReasons = [...new Set([...(row.reviewReasons || []), reason])];
  };
  const mergeFields = (target, source) => {
    if (type === 'power' && source.power != null) target.power = source.power;
    if (type === 'last_connection') {
      if (source.lastConnection) target.lastConnection = source.lastConnection;
      target.online = Boolean(target.online || source.online);
    }
    if (type === 'joined_at' && source.joinedAt) target.joinedAt = source.joinedAt;
    target.confidence = Math.max(confidenceOf(target), confidenceOf(source));
    target.sources = [...new Set([...(target.sources || [target.source].filter(Boolean)), ...(source.sources || [source.source].filter(Boolean))])];
    target.sourceImageIndexes = [...new Set([...(target.sourceImageIndexes || [target.sourceImageIndex].filter(Number.isInteger)), ...(source.sourceImageIndexes || [source.sourceImageIndex].filter(Number.isInteger))])];
    target.reviewRequired = Boolean(target.reviewRequired || source.reviewRequired);
    target.reviewReasons = [...new Set([...(target.reviewReasons || []), ...(source.reviewReasons || [])])];
    return target;
  };

  results.forEach((result, imageIndex) => {
    if (result?.snapshotType && result.snapshotType !== type) {
      const message = `A imagem ${imageIndex + 1} parece ser do tipo ${result.snapshotType}, diferente de ${type}.`;
      warnings.push(message);
      reviewItems.push({ type: 'snapshot_type_conflict', imageIndex, detected: result.snapshotType, expected: type, message });
    }
    (result?.warnings || []).forEach(w => warnings.push(`Imagem ${imageIndex + 1}: ${w}`));
    (result?.reviewItems || []).forEach(item => reviewItems.push({ ...item, imageIndex: item.imageIndex ?? imageIndex }));

    (result?.rows || []).forEach(raw => {
      const row = sanitizeExtractedRow({ ...raw, sourceImageIndex: imageIndex }, type);
      if (!row) return;
      const enriched = {
        ...raw,
        ...row,
        source: raw.source || (result?.engine === 'ocr' ? 'ocr' : result?.aiUsed ? 'ai' : 'unknown'),
        sources: Array.isArray(raw.sources) ? raw.sources : [raw.source || (result?.engine === 'ocr' ? 'ocr' : result?.aiUsed ? 'ai' : 'unknown')],
        sourceImageIndexes: [imageIndex],
        reviewRequired: Boolean(raw.reviewRequired),
        reviewReasons: [...new Set(raw.reviewReasons || [])],
      };
      const exact = rows.find(existing => existing.normalizedName === enriched.normalizedName);
      if (exact) {
        mergeFields(exact, enriched);
        return;
      }

      const value = valueKey(enriched);
      const alias = value ? rows.find(existing => {
        if (valueKey(existing) !== value) return false;
        const similarity = nameSimilarity(existing.name, enriched.name);
        return similarity >= 0.72 && similarity < 1;
      }) : null;

      if (alias) {
        const alternatives = [...new Set([...(alias.nameAlternatives || [alias.name]), enriched.name])];
        const preferred = confidenceOf(enriched) > confidenceOf(alias) + 0.06 ? enriched.name : alias.name;
        if (preferred !== alias.name) {
          alias.name = preferred;
          alias.normalizedName = normalizeMemberName(preferred);
        }
        alias.nameAlternatives = alternatives;
        mergeFields(alias, enriched);
        addReviewReason(alias, 'nickname_conflict');
        reviewItems.push({
          type: 'nickname_conflict',
          name: alias.name,
          alternatives,
          suggestedName: preferred,
          value,
          imageIndexes: alias.sourceImageIndexes,
          message: `O mesmo valor apareceu com nomes parecidos: ${alternatives.join(' / ')}.`,
        });
        return;
      }

      rows.push(enriched);
    });
  });

  // Histórico conhecido serve só como evidência. Nunca renomeia automaticamente.
  for (const row of rows) {
    if (!known.length) break;
    if (known.some(name => normalizeMemberName(name) === row.normalizedName)) continue;
    const candidates = known
      .map(name => ({ name, similarity: nameSimilarity(name, row.name) }))
      .filter(item => item.similarity >= 0.78 && item.similarity < 1)
      .sort((a, b) => b.similarity - a.similarity);
    if (!candidates.length) continue;
    const best = candidates[0];
    addReviewReason(row, 'known_name_variant');
    row.knownNameCandidate = best.name;
    reviewItems.push({
      type: 'known_name_variant',
      name: row.name,
      knownName: best.name,
      similarity: Number(best.similarity.toFixed(2)),
      message: `Nickname parecido com membro conhecido (${best.name}); confirmar manualmente antes de considerar troca de nick.`,
    });
  }

  if (rows.length > ALLIANCE_MEMBER_LIMIT) {
    const message = `A leitura encontrou ${rows.length} linhas, acima do limite de ${ALLIANCE_MEMBER_LIMIT} membros. Revise duplicações antes de importar.`;
    warnings.push(message);
    reviewItems.push({ type: 'member_limit', count: rows.length, limit: ALLIANCE_MEMBER_LIMIT, message });
  }

  const exceptionRows = rows.filter(row => row.reviewRequired).length;
  const typeConflicts = reviewItems.filter(item => item.type === 'snapshot_type_conflict').length;
  const knownMatches = rows.filter(row => known.some(name => normalizeMemberName(name) === row.normalizedName)).length;
  const metrics = {
    rows: rows.length,
    trustedRows: rows.length - exceptionRows,
    exceptionRows,
    reviewItems: reviewItems.length,
    typeConflicts,
    knownMatches,
    knownMembers: known.length,
  };

  return { snapshotType: type, rows, warnings: [...new Set(warnings)], reviewItems, metrics };
}

function levenshtein(a = '', b = '') {
  const s = String(a), t = String(b);
  if (!s.length) return t.length;
  if (!t.length) return s.length;
  const row = Array.from({ length: t.length + 1 }, (_, i) => i);
  for (let i = 1; i <= s.length; i += 1) {
    let prev = row[0];
    row[0] = i;
    for (let j = 1; j <= t.length; j += 1) {
      const temp = row[j];
      row[j] = Math.min(row[j] + 1, row[j - 1] + 1, prev + (s[i - 1] === t[j - 1] ? 0 : 1));
      prev = temp;
    }
  }
  return row[t.length];
}

export function nameSimilarity(a, b) {
  const x = normalizeMemberName(a), y = normalizeMemberName(b);
  const max = Math.max(x.length, y.length);
  if (!max) return 1;
  return 1 - levenshtein(x, y) / max;
}

export function scoreNicknameCandidate(oldMember = {}, newRow = {}, type = 'power') {
  let score = 0;
  const reasons = [];
  const sim = nameSimilarity(oldMember.currentName, newRow.name);
  if (sim >= 0.7) { score += 0.3; reasons.push('nome semelhante'); }
  else if (sim >= 0.5) { score += 0.15; reasons.push('parte do nome semelhante'); }

  if (type === 'power' && oldMember.latestPower != null && newRow.power != null && oldMember.latestPower > 0) {
    const delta = Math.abs(newRow.power - oldMember.latestPower) / oldMember.latestPower;
    if (delta <= 0.08) { score += 0.7; reasons.push('poder muito próximo'); }
    else if (delta <= 0.2) { score += 0.5; reasons.push('poder próximo'); }
    else if (delta <= 0.4) { score += 0.25; reasons.push('poder compatível'); }
  }

  if (oldMember.joinedAt && newRow.joinedAt) {
    const oldDay = new Date(oldMember.joinedAt).toISOString().slice(0, 10);
    const newDay = new Date(newRow.joinedAt).toISOString().slice(0, 10);
    if (oldDay === newDay) { score += 0.6; reasons.push('mesma data de entrada'); }
  }
  return { score: Math.min(1, score), reasons };
}

export function computeMembershipDiff({ activeMembers = [], incomingRows = [], hasPreviousComplete = false, type = 'power' } = {}) {
  const incomingKeys = new Set(incomingRows.map(r => normalizeMemberName(r.name)).filter(Boolean));
  const activeByName = new Map(activeMembers.map(m => [normalizeMemberName(m.currentName), m]));
  const joined = incomingRows.filter(r => !activeByName.has(normalizeMemberName(r.name)));
  const left = activeMembers.filter(m => !incomingKeys.has(normalizeMemberName(m.currentName)));
  const nicknameCandidates = [];

  if (hasPreviousComplete) {
    joined.forEach(row => {
      const candidates = left
        .map(member => ({ member, ...scoreNicknameCandidate(member, row, type) }))
        .filter(x => x.score >= 0.55)
        .sort((a, b) => b.score - a.score)
        .slice(0, 2);
      candidates.forEach(c => nicknameCandidates.push({
        oldMemberId: String(c.member._id || c.member.id || ''),
        oldName: c.member.currentName,
        newName: row.name,
        score: Number(c.score.toFixed(2)),
        reasons: c.reasons,
      }));
    });
  }

  return {
    baseline: !hasPreviousComplete,
    joined: hasPreviousComplete ? joined : [],
    left: hasPreviousComplete ? left : [],
    nicknameCandidates,
  };
}
