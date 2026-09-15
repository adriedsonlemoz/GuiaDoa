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
  if (typeof value === 'number') {
    return Number.isSafeInteger(value) && value >= 0 ? value : null;
  }
  const text = String(value).trim();
  if (!text || !/^(?:\d+|\d{1,3}(?:[.,\s]\d{3})+)$/.test(text)) return null;
  const digits = text.replace(/[.,\s]/g, '');
  if (!digits || !/^\d+$/.test(digits)) return null;
  const numeric = Number(digits);
  return Number.isSafeInteger(numeric) && numeric >= 0 ? numeric : null;
}

export function isValidDateParts(year, month, day, hour = 0, minute = 0, second = 0) {
  const y = Number(year), mo = Number(month), d = Number(day), h = Number(hour), mi = Number(minute), s = Number(second);
  if (![y, mo, d, h, mi, s].every(Number.isInteger)) return false;
  if (y < 2000 || y > 2200 || mo < 1 || mo > 12 || h < 0 || h > 23 || mi < 0 || mi > 59 || s < 0 || s > 59) return false;
  const maxDay = new Date(Date.UTC(y, mo, 0)).getUTCDate();
  return d >= 1 && d <= maxDay;
}

export function isStrictRealmDateText(value = '') {
  const text = String(value || '').trim();
  const m = text.match(/^(\d{4})-(\d{2})-(\d{2})[ T](\d{2}):(\d{2})(?::(\d{2}))?$/);
  return Boolean(m && isValidDateParts(...m.slice(1).map(Number)));
}

export function parseRealmDate(value, utcOffsetHours = 0) {
  if (!value) return null;
  if (value instanceof Date && !Number.isNaN(value.getTime())) return value;
  const text = String(value).trim();

  const realmMatch = text.match(/^(\d{4})-(\d{2})-(\d{2})[ T](\d{2}):(\d{2})(?::(\d{2}))?$/);
  if (realmMatch) {
    const [, y, mo, d, h, mi, s = '0'] = realmMatch;
    if (!isValidDateParts(Number(y), Number(mo), Number(d), Number(h), Number(mi), Number(s))) return null;
    const offset = Number.isFinite(Number(utcOffsetHours)) ? Number(utcOffsetHours) : 0;
    const date = new Date(Date.UTC(Number(y), Number(mo) - 1, Number(d), Number(h), Number(mi), Number(s)) - offset * 3600000);
    return Number.isNaN(date.getTime()) ? null : date;
  }

  const isoMatch = text.match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})(?::(\d{2})(?:\.\d{1,3})?)?(Z|[+-]\d{2}:\d{2})$/);
  if (isoMatch) {
    const [, y, mo, d, h, mi, s = '0'] = isoMatch;
    if (!isValidDateParts(Number(y), Number(mo), Number(d), Number(h), Number(mi), Number(s))) return null;
    const direct = new Date(text);
    return Number.isNaN(direct.getTime()) ? null : direct;
  }
  return null;
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
  if (type === 'power') {
    const power = parsePower(row.power);
    return power == null ? null : { ...base, power };
  }
  if (type === 'last_connection') {
    const lastConnection = String(row.lastConnection || row.lastConnectionAt || '').trim().slice(0, 32);
    if (!base.online && !isStrictRealmDateText(lastConnection)) return null;
    return { ...base, lastConnection: base.online ? '' : lastConnection };
  }
  if (type === 'joined_at') {
    const joinedAt = String(row.joinedAt || '').trim().slice(0, 32);
    return isStrictRealmDateText(joinedAt) ? { ...base, joinedAt } : null;
  }
  return null;
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
  let coverageComplete = true;
  let structurallyIncompleteImages = 0;
  let excludedTypeConflictRows = 0;

  const valueKey = row => {
    if (type === 'power') return row.power == null ? '' : String(row.power);
    if (type === 'last_connection') return row.online ? 'online' : String(row.lastConnection || '');
    return String(row.joinedAt || '');
  };
  const confidenceOf = row => Number.isFinite(Number(row?.confidence)) ? Number(row.confidence) : 0;
  const addReviewReason = (row, reason) => {
    row.reviewRequired = true;
    row.reviewReasons = [...new Set([...(row.reviewReasons || []), reason])];
  };
  const copyTypedValue = (target, source) => {
    if (type === 'power') target.power = source.power;
    if (type === 'last_connection') {
      target.lastConnection = source.lastConnection || '';
      target.online = Boolean(source.online);
    }
    if (type === 'joined_at') target.joinedAt = source.joinedAt;
  };
  const mergeMetadata = (target, source) => {
    target.sources = [...new Set([...(target.sources || [target.source].filter(Boolean)), ...(source.sources || [source.source].filter(Boolean))])];
    target.sourceImageIndexes = [...new Set([...(target.sourceImageIndexes || [target.sourceImageIndex].filter(Number.isInteger)), ...(source.sourceImageIndexes || [source.sourceImageIndex].filter(Number.isInteger))])];
    target.reviewRequired = Boolean(target.reviewRequired || source.reviewRequired);
    target.reviewReasons = [...new Set([...(target.reviewReasons || []), ...(source.reviewReasons || [])])];
    return target;
  };

  results.forEach((result, imageIndex) => {
    const structuralIncomplete = result?.coverageComplete === false
      || !result?.snapshotType
      || !Array.isArray(result?.rows)
      || result.rows.length === 0
      || Number(result?.localResolver?.structuralExceptions || 0) > 0;
    if (structuralIncomplete) {
      coverageComplete = false;
      structurallyIncompleteImages += 1;
    }

    if (result?.snapshotType && result.snapshotType !== type) {
      coverageComplete = false;
      const message = `A imagem ${imageIndex + 1} parece ser do tipo ${result.snapshotType}, diferente de ${type}; suas linhas ficaram fora da mesclagem para evitar misturar colunas.`;
      warnings.push(message);
      const preservedRows = Array.isArray(result.rows) ? result.rows.map(row => ({ ...row })) : [];
      excludedTypeConflictRows += preservedRows.length;
      reviewItems.push({
        type: 'snapshot_type_conflict',
        imageIndex,
        detected: result.snapshotType,
        expected: type,
        rows: preservedRows,
        message,
      });
      (result?.warnings || []).forEach(w => warnings.push(`Imagem ${imageIndex + 1}: ${w}`));
      (result?.reviewItems || []).forEach(item => reviewItems.push({ ...item, imageIndex: item.imageIndex ?? imageIndex }));
      return;
    }

    (result?.warnings || []).forEach(w => warnings.push(`Imagem ${imageIndex + 1}: ${w}`));
    (result?.reviewItems || []).forEach(item => reviewItems.push({ ...item, imageIndex: item.imageIndex ?? imageIndex }));

    (result?.rows || []).forEach(raw => {
      const row = sanitizeExtractedRow({ ...raw, sourceImageIndex: imageIndex }, type);
      if (!row) {
        coverageComplete = false;
        reviewItems.push({
          type: 'invalid_row_value',
          imageIndex,
          name: cleanMemberName(raw?.name || ''),
          message: `Uma linha da imagem ${imageIndex + 1} foi preservada para revisão porque o valor não passou pela validação estrita.`,
        });
        return;
      }
      const enriched = {
        ...raw,
        ...row,
        source: raw.source || (result?.engine === 'ocr' ? 'ocr' : 'local'),
        sources: Array.isArray(raw.sources) ? raw.sources : [raw.source || (result?.engine === 'ocr' ? 'ocr' : 'local')],
        sourceImageIndexes: [imageIndex],
        reviewRequired: Boolean(raw.reviewRequired),
        reviewReasons: [...new Set(raw.reviewReasons || [])],
      };
      const exact = rows.find(existing => existing.normalizedName === enriched.normalizedName);
      if (exact) {
        const priorValue = valueKey(exact);
        const incomingValue = valueKey(enriched);
        if (priorValue && incomingValue && priorValue !== incomingValue) {
          const priorConfidence = confidenceOf(exact);
          const incomingConfidence = confidenceOf(enriched);
          const alternatives = [
            { value: priorValue, confidence: priorConfidence, imageIndexes: [...(exact.sourceImageIndexes || [])] },
            { value: incomingValue, confidence: incomingConfidence, imageIndexes: [imageIndex] },
          ];
          if (incomingConfidence > priorConfidence) {
            copyTypedValue(exact, enriched);
            exact.confidence = incomingConfidence;
            exact.ocrBox = enriched.ocrBox || exact.ocrBox;
            exact.ocrImageDimensions = enriched.ocrImageDimensions || exact.ocrImageDimensions;
            exact.sourceImageIndex = imageIndex;
          }
          exact.valueAlternatives = alternatives;
          mergeMetadata(exact, enriched);
          addReviewReason(exact, 'value_conflict');
          reviewItems.push({
            type: 'value_conflict',
            name: exact.name,
            alternatives,
            selectedValue: valueKey(exact),
            imageIndexes: exact.sourceImageIndexes,
            imageIndex: exact.sourceImageIndex,
            ocrBox: exact.ocrBox || null,
            ocrImageDimensions: exact.ocrImageDimensions || null,
            message: `O mesmo membro apareceu com valores diferentes (${priorValue} / ${incomingValue}); mantive a leitura de maior confiança para sua confirmação.`,
          });
        } else {
          if ((!priorValue && incomingValue) || confidenceOf(enriched) > confidenceOf(exact)) {
            if (incomingValue) copyTypedValue(exact, enriched);
            if (confidenceOf(enriched) > confidenceOf(exact)) {
              exact.confidence = confidenceOf(enriched);
              exact.ocrBox = enriched.ocrBox || exact.ocrBox;
              exact.ocrImageDimensions = enriched.ocrImageDimensions || exact.ocrImageDimensions;
              exact.sourceImageIndex = imageIndex;
            }
          }
          mergeMetadata(exact, enriched);
        }
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
          alias.confidence = confidenceOf(enriched);
          alias.ocrBox = enriched.ocrBox || alias.ocrBox;
          alias.ocrImageDimensions = enriched.ocrImageDimensions || alias.ocrImageDimensions;
          alias.sourceImageIndex = imageIndex;
        }
        alias.nameAlternatives = alternatives;
        mergeMetadata(alias, enriched);
        addReviewReason(alias, 'nickname_conflict');
        reviewItems.push({
          type: 'nickname_conflict',
          name: alias.name,
          alternatives,
          suggestedName: preferred,
          value,
          imageIndexes: alias.sourceImageIndexes,
          imageIndex: alias.sourceImageIndex,
          ocrBox: alias.ocrBox || null,
          ocrImageDimensions: alias.ocrImageDimensions || null,
          message: `O mesmo valor apareceu com nomes parecidos: ${alternatives.join(' / ')}.`,
        });
        return;
      }

      rows.push(enriched);
    });
  });

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
      imageIndex: row.sourceImageIndex,
      ocrBox: row.ocrBox || null,
      ocrImageDimensions: row.ocrImageDimensions || null,
      message: `Nickname parecido com membro conhecido (${best.name}); confirmar manualmente antes de considerar troca de nick.`,
    });
  }

  if (rows.length > ALLIANCE_MEMBER_LIMIT) {
    coverageComplete = false;
    const message = `A leitura encontrou ${rows.length} linhas, acima do limite de ${ALLIANCE_MEMBER_LIMIT} membros. Revise duplicações antes de importar.`;
    warnings.push(message);
    reviewItems.push({ type: 'member_limit', count: rows.length, limit: ALLIANCE_MEMBER_LIMIT, message });
  }

  const exceptionRows = rows.filter(row => row.reviewRequired).length;
  const typeConflicts = reviewItems.filter(item => item.type === 'snapshot_type_conflict').length;
  const knownMatches = rows.filter(row => known.some(name => normalizeMemberName(name) === row.normalizedName)).length;
  if (typeConflicts || structurallyIncompleteImages) coverageComplete = false;
  const metrics = {
    rows: rows.length,
    trustedRows: rows.length - exceptionRows,
    exceptionRows,
    reviewItems: reviewItems.length,
    typeConflicts,
    knownMatches,
    knownMembers: known.length,
    coverageComplete,
    structurallyIncompleteImages,
    excludedTypeConflictRows,
    valueConflicts: reviewItems.filter(item => item.type === 'value_conflict').length,
  };

  if (!coverageComplete) {
    warnings.push('Cobertura incompleta: este lote não pode detectar saídas até todas as capturas necessárias serem lidas com estrutura suficiente.');
  }

  return {
    snapshotType: type,
    rows,
    warnings: [...new Set(warnings)],
    reviewItems,
    metrics,
    coverageComplete,
    structurallyIncompleteImages,
  };
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
