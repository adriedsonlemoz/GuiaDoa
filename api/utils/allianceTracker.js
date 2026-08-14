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

export function mergeExtractedRows(results = [], forcedType = null) {
  const detected = results.map(r => r?.snapshotType).filter(type => SNAPSHOT_TYPES.includes(type));
  const type = forcedType && SNAPSHOT_TYPES.includes(forcedType)
    ? forcedType
    : detected.sort((a, b) => detected.filter(x => x === b).length - detected.filter(x => x === a).length)[0] || 'power';
  const map = new Map();
  const warnings = [];

  results.forEach((result, imageIndex) => {
    if (result?.snapshotType && result.snapshotType !== type) {
      warnings.push(`A imagem ${imageIndex + 1} parece ser do tipo ${result.snapshotType}, diferente de ${type}.`);
    }
    (result?.warnings || []).forEach(w => warnings.push(`Imagem ${imageIndex + 1}: ${w}`));
    (result?.rows || []).forEach(raw => {
      const row = sanitizeExtractedRow({ ...raw, sourceImageIndex: imageIndex }, type);
      if (!row) return;
      const key = row.normalizedName;
      if (!map.has(key)) {
        map.set(key, row);
        return;
      }
      const prev = map.get(key);
      const merged = { ...prev };
      if (type === 'power' && row.power != null) merged.power = row.power;
      if (type === 'last_connection' && row.lastConnection) merged.lastConnection = row.lastConnection;
      if (type === 'joined_at' && row.joinedAt) merged.joinedAt = row.joinedAt;
      merged.online = Boolean(prev.online || row.online);
      map.set(key, merged);
    });
  });

  return { snapshotType: type, rows: [...map.values()].slice(0, ALLIANCE_MEMBER_LIMIT), warnings };
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
