const AT = {
  alliances: [],
  alliance: null,
  summary: null,
  members: [],
  snapshots: [],
  tab: 'members',
  review: null,
  files: [],
};

const AT_TYPE_LABEL = {
  power: 'Poder',
  last_connection: 'Última conexão',
  joined_at: 'Data de entrada',
};

function atFmtNumber(value) {
  return value == null || value === '' ? '—' : Number(value).toLocaleString('pt-BR');
}

function atFmtDate(value, withTime = true) {
  if (!value) return '—';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return String(value);
  return new Intl.DateTimeFormat('pt-BR', withTime
    ? { dateStyle: 'short', timeStyle: 'short' }
    : { dateStyle: 'short' }).format(d);
}

function atRelative(value) {
  if (!value) return 'Sem dado';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return 'Sem dado';
  const diff = Date.now() - d.getTime();
  if (diff < 0) return 'agora';
  const min = Math.floor(diff / 60000);
  if (min < 60) return min <= 1 ? 'agora' : `há ${min} min`;
  const h = Math.floor(min / 60);
  if (h < 24) return `há ${h}h`;
  const days = Math.floor(h / 24);
  return `há ${days} dia${days === 1 ? '' : 's'}`;
}

function atDaysSince(value) {
  if (!value) return '—';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '—';
  return Math.max(0, Math.floor((Date.now() - d.getTime()) / 86400000));
}

async function atJson(url, options = {}) {
  const r = await AdminCore.request(url, { timeout: options.timeout || 15000, ...options });
  const d = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(d.erro || d.mensagem || 'Falha no Alliance Tracker.');
  return d;
}

async function carregarAliancas() {
  setLoading('Carregando Alliance Tracker…');
  try {
    const data = await atJson(`${API}/alliance-tracker/alliances`);
    AT.alliances = data.alliances || [];
    if (!AT.alliances.length) {
      AT.alliance = null;
      renderAllianceSetup();
      return;
    }
    const saved = localStorage.getItem('doa_admin_alliance_id');
    AT.alliance = AT.alliances.find(a => a._id === saved) || AT.alliances[0];
    localStorage.setItem('doa_admin_alliance_id', AT.alliance._id);
    await atLoadDashboard();
  } catch (err) {
    document.getElementById('content').innerHTML = `<div class="error-box">${esc(err.message)}</div>`;
  }
}

function renderAllianceSetup() {
  document.getElementById('content').innerHTML = `
    <div class="at-shell">
      <div class="at-private">🔒 Módulo privado do Admin</div>
      <div class="at-hero">
        <div class="at-hero-icon">🛡️</div>
        <div><h2>Alliance Tracker</h2><p>Crie o perfil da sua Aliança. Os screenshots serão usados apenas para extrair os dados; as imagens não são armazenadas.</p></div>
      </div>
      <div class="at-card" style="max-width:560px">
        <h3>Primeira configuração</h3>
        <div class="field"><label>Nome da Aliança *</label><input id="at-new-name" maxlength="80" placeholder="Ex.: MIDNIGHT LEGION"></div>
        <div class="field-row">
          <div class="field"><label>Realm</label><input id="at-new-realm" maxlength="80" placeholder="Ex.: Corvith 345"></div>
          <div class="field"><label>UTC do realm</label><input id="at-new-utc" type="number" min="-12" max="14" step="1" value="0"></div>
        </div>
        <div class="at-note">O limite do jogo é <strong>120 membros</strong>. O tracker usa esse mesmo limite.</div>
        <button class="btn btn-gold" onclick="atCreateAlliance()">Criar Alliance Tracker</button>
      </div>
    </div>`;
}

async function atCreateAlliance() {
  const name = document.getElementById('at-new-name')?.value.trim();
  const realm = document.getElementById('at-new-realm')?.value.trim();
  const utcOffset = Number(document.getElementById('at-new-utc')?.value || 0);
  if (!name) return toast('Informe o nome da Aliança.', 'warn');
  try {
    const alliance = await atJson(`${API}/alliance-tracker/alliances`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name, realm, utcOffset }),
    });
    localStorage.setItem('doa_admin_alliance_id', alliance._id);
    toast('Alliance Tracker criado.');
    await carregarAliancas();
  } catch (err) { toast(err.message, 'erro'); }
}

async function atSwitchAlliance(id) {
  const found = AT.alliances.find(a => a._id === id);
  if (!found) return;
  AT.alliance = found;
  AT.review = null;
  localStorage.setItem('doa_admin_alliance_id', id);
  await atLoadDashboard();
}

async function atLoadDashboard() {
  if (!AT.alliance) return renderAllianceSetup();
  setLoading(`Carregando ${AT.alliance.name}…`);
  try {
    const [summary, members] = await Promise.all([
      atJson(`${API}/alliance-tracker/alliances/${AT.alliance._id}/summary`),
      atJson(`${API}/alliance-tracker/alliances/${AT.alliance._id}/members`),
    ]);
    AT.summary = summary;
    AT.alliance = summary.alliance || AT.alliance;
    AT.members = members.members || [];
    renderAllianceDashboard();
  } catch (err) {
    document.getElementById('content').innerHTML = `<div class="error-box">${esc(err.message)}</div>`;
  }
}

function atStat(label, value, detail = '') {
  return `<div class="at-stat"><span>${esc(label)}</span><strong>${esc(value)}</strong>${detail ? `<small>${esc(detail)}</small>` : ''}</div>`;
}

function renderAllianceDashboard() {
  const s = AT.summary?.stats || {};
  const selector = AT.alliances.length > 1 ? `
    <select class="at-switch" onchange="atSwitchAlliance(this.value)">
      ${AT.alliances.map(a => `<option value="${esc(a._id)}" ${a._id === AT.alliance._id ? 'selected' : ''}>${esc(a.name)}${a.realm ? ` · ${esc(a.realm)}` : ''}</option>`).join('')}
    </select>` : '';
  document.getElementById('content').innerHTML = `
    <div class="at-shell">
      <div class="at-topline">
        <div><div class="at-private">🔒 Privado · somente Admin</div><h2>${esc(AT.alliance.name)}</h2><p>${esc(AT.alliance.realm || 'Realm não informado')} · UTC${Number(AT.alliance.utcOffset) >= 0 ? '+' : ''}${esc(AT.alliance.utcOffset)}</p></div>
        ${selector}
      </div>
      <div class="at-stats">
        ${atStat('Membros', `${s.active || 0}/${s.limit || 120}`, `${s.left || 0} fora`)}
        ${atStat('Online', String(s.online || 0), 'última captura')}
        ${atStat('Inativos +3d', String(s.inactive3d || 0), `${s.unknownConnection || 0} sem dado`)}
        ${atStat('Poder somado', atFmtNumber(s.totalPower || 0))}
      </div>
      <div class="at-tabs">
        ${['members','import','changes','history','config'].map(tab => `<button class="${AT.tab === tab ? 'active' : ''}" onclick="atSetTab('${tab}')">${({members:'Membros',import:'📸 Importar',changes:'Alterações',history:'Histórico',config:'Config.'})[tab]}</button>`).join('')}
      </div>
      <div id="at-panel"></div>
    </div>`;
  atRenderTab();
}

function atSetTab(tab) {
  AT.tab = tab;
  renderAllianceDashboard();
}

function atRenderTab() {
  if (AT.tab === 'members') atRenderMembers();
  if (AT.tab === 'import') atRenderImport();
  if (AT.tab === 'changes') atRenderChanges();
  if (AT.tab === 'history') atRenderHistory();
  if (AT.tab === 'config') atRenderConfig();
}

function atRenderMembers(filter = 'active') {
  const panel = document.getElementById('at-panel');
  const members = AT.members.filter(m => filter === 'all' || m.status === filter);
  panel.innerHTML = `
    <div class="at-toolbar">
      <div class="at-segment"><button class="${filter === 'active' ? 'active' : ''}" onclick="atRenderMembers('active')">Ativos</button><button class="${filter === 'left' ? 'active' : ''}" onclick="atRenderMembers('left')">Saíram</button><button class="${filter === 'all' ? 'active' : ''}" onclick="atRenderMembers('all')">Todos</button></div>
      <input id="at-member-search" class="at-search" placeholder="Buscar membro…" oninput="atFilterMemberRows(this.value)">
    </div>
    <div class="at-table-wrap"><table class="at-table"><thead><tr><th>Membro</th><th>Poder</th><th>Crescimento</th><th>Última conexão</th><th>Na Aliança</th></tr></thead><tbody id="at-member-body">
      ${members.map(m => {
        const growth = m.growth == null ? '—' : `${m.growth >= 0 ? '+' : ''}${atFmtNumber(m.growth)}`;
        const pct = m.growthPercent == null ? '' : ` (${m.growthPercent >= 0 ? '+' : ''}${Number(m.growthPercent).toFixed(1)}%)`;
        const joinedDays = m.joinedAt ? `${atDaysSince(m.joinedAt)}d` : '—';
        const inactiveClass = m.lastConnectionAt && Date.now() - new Date(m.lastConnectionAt).getTime() > 3*86400000 ? 'at-inactive' : '';
        return `<tr data-name="${esc(String(m.currentName).toLocaleLowerCase('pt-BR'))}">
          <td><strong>${esc(m.currentName)}</strong><div class="at-mini ${m.status === 'left' ? 'at-left' : ''}">${m.status === 'left' ? `Saiu ${atFmtDate(m.leftAt)}` : 'Na Aliança'}</div></td>
          <td>${atFmtNumber(m.latestPower)}</td>
          <td class="${m.growth > 0 ? 'at-positive' : m.growth < 0 ? 'at-negative' : ''}">${esc(growth + pct)}</td>
          <td class="${inactiveClass}">${esc(atRelative(m.lastConnectionAt))}<div class="at-mini">${esc(m.lastConnectionRaw || atFmtDate(m.lastConnectionAt))}</div></td>
          <td>${esc(joinedDays)}<div class="at-mini">${esc(m.joinedAtRaw || atFmtDate(m.joinedAt, false))}</div></td>
        </tr>`;
      }).join('') || '<tr><td colspan="5" class="at-empty">Nenhum membro nesta lista.</td></tr>'}
    </tbody></table></div>`;
}

function atFilterMemberRows(value) {
  const q = String(value || '').trim().toLocaleLowerCase('pt-BR');
  document.querySelectorAll('#at-member-body tr[data-name]').forEach(row => { row.style.display = row.dataset.name.includes(q) ? '' : 'none'; });
}

function atRenderImport() {
  const panel = document.getElementById('at-panel');
  if (AT.review) return atRenderReview();
  const now = new Date();
  const local = new Date(now.getTime() - now.getTimezoneOffset()*60000).toISOString().slice(0,16);
  panel.innerHTML = `
    <div class="at-card">
      <h3>📸 Importar screenshots</h3>
      <p class="at-muted">Envie uma ou várias telas do mesmo filtro: <strong>Poder</strong>, <strong>Última Conexão</strong> ou <strong>Data de Entrada</strong>. O sistema identifica o tipo automaticamente.</p>
      <label class="at-drop" for="at-files"><span>🖼️</span><strong>Selecionar screenshots</strong><small>JPG, PNG ou WebP · até 10 imagens · 6 MB cada</small></label>
      <input id="at-files" type="file" accept="image/jpeg,image/png,image/webp" multiple style="display:none" onchange="atFilesChanged(this.files)">
      <div id="at-file-list" class="at-file-list">Nenhuma imagem selecionada.</div>
      <div class="field" style="max-width:300px"><label>Data/hora da captura</label><input id="at-captured" type="datetime-local" value="${local}"></div>
      <div class="at-note">As imagens são enviadas para leitura visual e <strong>não são salvas</strong> pelo GUIA. Antes de gravar qualquer dado você verá uma tabela para revisar nomes e valores.</div>
      <button id="at-read-btn" class="btn btn-gold" onclick="atExtract()" disabled>🔎 Ler screenshots</button>
    </div>
    <div class="at-card"><h3>Como detectar entrada e saída</h3><p class="at-muted">No passo seguinte marque <strong>“lista completa”</strong> somente quando os screenshots cobrem todos os membros, do primeiro ao último. A primeira lista completa vira a base. A partir da próxima, quem aparecer de novo é marcado como entrada/retorno e quem desaparecer é marcado como saída.</p></div>`;
}

function atFilesChanged(files) {
  AT.files = [...(files || [])].slice(0, 10);
  const list = document.getElementById('at-file-list');
  if (list) list.innerHTML = AT.files.length ? AT.files.map((f,i) => `<span>${i+1}. ${esc(f.name)}</span>`).join('') : 'Nenhuma imagem selecionada.';
  const btn = document.getElementById('at-read-btn');
  if (btn) btn.disabled = !AT.files.length;
}

async function atExtract() {
  if (!AT.files.length) return toast('Selecione pelo menos um screenshot.', 'warn');
  const btn = document.getElementById('at-read-btn');
  if (btn) { btn.disabled = true; btn.textContent = '⏳ Lendo screenshots…'; }
  try {
    const fd = new FormData();
    AT.files.forEach(file => fd.append('images', file));
    const r = await fetch(`${API}/alliance-tracker/extract`, {
      method: 'POST', headers: { Authorization: `Bearer ${AdminCore.getToken()}` }, body: fd, signal: AbortSignal.timeout(150000),
    });
    const d = await r.json().catch(() => ({}));
    if (!r.ok) throw new Error(d.erro || d.mensagem || 'Falha ao ler screenshots.');
    const capturedRaw = document.getElementById('at-captured')?.value;
    const capturedAt = capturedRaw ? new Date(capturedRaw).toISOString() : new Date().toISOString();
    AT.review = { ...d, capturedAt, completeList: false };
    atRenderReview();
  } catch (err) {
    toast(err.message, 'erro');
    if (btn) { btn.disabled = false; btn.textContent = '🔎 Ler screenshots'; }
  }
}

function atRenderReview() {
  const panel = document.getElementById('at-panel');
  const r = AT.review;
  if (!r) return atRenderImport();
  const type = r.snapshotType || 'power';
  panel.innerHTML = `
    <div class="at-card">
      <div class="at-review-head"><div><h3>Revisar leitura</h3><p class="at-muted">${r.rows.length} membro(s) únicos em ${r.imagesCount || AT.files.length} imagem(ns).</p></div><button class="btn btn-ghost" onclick="atCancelReview()">← Voltar</button></div>
      ${(r.warnings || []).length ? `<div class="at-warnings">${r.warnings.map(w => `<div>⚠ ${esc(w)}</div>`).join('')}</div>` : ''}
      <div class="field-row">
        <div class="field"><label>Tipo detectado</label><select id="at-review-type" onchange="atChangeReviewType(this.value)"><option value="power" ${type==='power'?'selected':''}>Poder</option><option value="last_connection" ${type==='last_connection'?'selected':''}>Última conexão</option><option value="joined_at" ${type==='joined_at'?'selected':''}>Data de entrada</option></select></div>
        <div class="field"><label>Captura</label><input value="${esc(atFmtDate(r.capturedAt))}" disabled></div>
      </div>
      <div class="at-table-wrap"><table class="at-table at-review-table"><thead><tr><th>#</th><th>Nickname</th><th>${esc(AT_TYPE_LABEL[type])}</th>${type==='last_connection'?'<th>Online</th>':''}<th></th></tr></thead><tbody id="at-review-body">
        ${r.rows.map((row,i) => atReviewRow(row,i,type)).join('')}
      </tbody></table></div>
      <button class="btn btn-ghost" onclick="atAddReviewRow()">+ Adicionar linha</button>
      <label class="at-complete"><input id="at-complete" type="checkbox" ${r.completeList?'checked':''} onchange="AT.review.completeList=this.checked"><span><strong>Esta captura cobre a lista completa da Aliança</strong><small>Marque somente se você enviou todas as telas, do primeiro ao último membro. Isso habilita detecção de quem entrou ou saiu.</small></span></label>
      <div class="at-actions"><button class="btn btn-ghost" onclick="atCancelReview()">Cancelar</button><button class="btn btn-gold" onclick="atConfirmImport()">💾 Confirmar importação</button></div>
    </div>`;
}

function atReviewRow(row, i, type) {
  const value = type === 'power' ? (row.power ?? '') : type === 'last_connection' ? (row.lastConnection || '') : (row.joinedAt || '');
  return `<tr data-i="${i}"><td>${i+1}</td><td><input class="at-cell" data-field="name" value="${esc(row.name || '')}"></td><td><input class="at-cell" data-field="value" ${type==='power'?'inputmode="numeric"':''} value="${esc(value)}" placeholder="${type==='power'?'3117901':'2026-08-13 23:57:06'}"></td>${type==='last_connection'?`<td><input data-field="online" type="checkbox" ${row.online?'checked':''}></td>`:''}<td><button class="at-x" onclick="atRemoveReviewRow(${i})">×</button></td></tr>`;
}

function atCollectReviewRows() {
  const type = document.getElementById('at-review-type')?.value || AT.review.snapshotType;
  return [...document.querySelectorAll('#at-review-body tr')].map(tr => {
    const name = tr.querySelector('[data-field="name"]')?.value.trim();
    const value = tr.querySelector('[data-field="value"]')?.value.trim();
    const online = Boolean(tr.querySelector('[data-field="online"]')?.checked);
    if (!name) return null;
    if (type === 'power') return { name, power: value, online };
    if (type === 'last_connection') return { name, lastConnection: value, online };
    return { name, joinedAt: value };
  }).filter(Boolean);
}

function atChangeReviewType(type) {
  AT.review.rows = atCollectReviewRows();
  AT.review.snapshotType = type;
  renderAllianceDashboard();
}

function atRemoveReviewRow(index) {
  AT.review.rows = atCollectReviewRows().filter((_,i) => i !== index);
  renderAllianceDashboard();
}

function atAddReviewRow() {
  AT.review.rows = [...atCollectReviewRows(), { name: '', power: '', lastConnection: '', joinedAt: '', online: false }];
  renderAllianceDashboard();
}

function atCancelReview() {
  AT.review = null;
  AT.files = [];
  renderAllianceDashboard();
}

async function atConfirmImport() {
  const type = document.getElementById('at-review-type')?.value || AT.review.snapshotType;
  const rows = atCollectReviewRows();
  const completeList = Boolean(document.getElementById('at-complete')?.checked);
  if (!rows.length) return toast('Não há linhas para importar.', 'warn');
  if (rows.length > 120) return toast('O limite da Aliança é 120 membros.', 'warn');
  try {
    const d = await atJson(`${API}/alliance-tracker/alliances/${AT.alliance._id}/import`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, timeout: 30000,
      body: JSON.stringify({ type, rows, completeList, capturedAt: AT.review.capturedAt, imagesCount: AT.review.imagesCount || AT.files.length }),
    });
    const s = d.summary || {};
    AT.review = null; AT.files = [];
    toast(s.baseline ? `Base criada com ${s.rows} membros.` : `Importado: +${s.joined} entrou · -${s.left} saiu · ${s.returned} voltou.`);
    AT.tab = 'changes';
    await atLoadDashboard();
  } catch (err) { toast(err.message, 'erro'); }
}

function atChangeLabel(type) {
  return ({ joined:'Entrou', left:'Saiu', returned:'Voltou', nickname_candidate:'Possível troca de nick', renamed:'Nick confirmado' })[type] || type;
}

function atRenderChanges() {
  const panel = document.getElementById('at-panel');
  const changes = AT.summary?.changes || [];
  panel.innerHTML = `<div class="at-card"><h3>Alterações recentes</h3><p class="at-muted">Entradas e saídas só são detectadas a partir de capturas marcadas como lista completa.</p>
    <div class="at-change-list">${changes.map(c => `<div class="at-change at-change-${esc(c.type)}"><div><strong>${esc(atChangeLabel(c.type))}</strong><span>${esc(c.name || '')}${c.otherName ? ` → ${esc(c.otherName)}` : ''}</span><small>${esc(atFmtDate(c.capturedAt))}${c.note ? ` · ${esc(c.note)}` : ''}</small></div>${c.type==='nickname_candidate' && c.memberId && c.otherMemberId ? `<button class="btn btn-gold btn-sm" onclick="atConfirmRename('${esc(c.memberId)}','${esc(c.otherMemberId)}','${esc(c.name)}','${esc(c.otherName)}')">Confirmar troca</button>` : ''}</div>`).join('') || '<div class="at-empty">Ainda não há alterações detectadas.</div>'}</div>
  </div>`;
}

async function atConfirmRename(oldId, newId, oldName, newName) {
  if (!confirm(`Confirmar que "${oldName}" mudou o nick para "${newName}"? Os históricos serão unidos.`)) return;
  try {
    const d = await atJson(`${API}/alliance-tracker/alliances/${AT.alliance._id}/merge-members`, {
      method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({ oldMemberId:oldId, newMemberId:newId }), timeout:30000,
    });
    toast(d.mensagem || 'Troca de nick confirmada.');
    await atLoadDashboard();
  } catch (err) { toast(err.message, 'erro'); }
}

async function atRenderHistory() {
  const panel = document.getElementById('at-panel');
  panel.innerHTML = '<div class="loading"><span class="spinner"></span> Carregando histórico…</div>';
  try {
    const d = await atJson(`${API}/alliance-tracker/alliances/${AT.alliance._id}/snapshots?limit=50`);
    AT.snapshots = d.snapshots || [];
    panel.innerHTML = `<div class="at-card"><h3>Histórico de capturas</h3><div class="at-snapshot-list">${AT.snapshots.map(s => `<div class="at-snapshot"><div><strong>${esc(AT_TYPE_LABEL[s.type] || s.type)}</strong><span>${esc(atFmtDate(s.capturedAt))}</span></div><div><b>${s.rows?.length || 0}</b> membros · ${s.completeList ? (s.baseline ? 'Base completa' : 'Lista completa') : 'Parcial'}${s.changes?.length ? ` · ${s.changes.length} alteração(ões)` : ''}</div></div>`).join('') || '<div class="at-empty">Nenhuma captura importada.</div>'}</div></div>`;
  } catch (err) { panel.innerHTML = `<div class="error-box">${esc(err.message)}</div>`; }
}

function atRenderConfig() {
  const panel = document.getElementById('at-panel');
  panel.innerHTML = `<div class="at-card" style="max-width:600px"><h3>Configuração</h3>
    <div class="field"><label>Nome da Aliança</label><input id="at-cfg-name" maxlength="80" value="${esc(AT.alliance.name)}"></div>
    <div class="field-row"><div class="field"><label>Realm</label><input id="at-cfg-realm" maxlength="80" value="${esc(AT.alliance.realm || '')}"></div><div class="field"><label>UTC do realm</label><input id="at-cfg-utc" type="number" min="-12" max="14" value="${esc(AT.alliance.utcOffset || 0)}"></div></div>
    <div class="at-note">Os dados estruturados ficam no banco. Os screenshots não são armazenados. O navegador guarda apenas qual Aliança estava selecionada.</div>
    <button class="btn btn-gold" onclick="atSaveConfig()">💾 Salvar configuração</button>
  </div>`;
}

async function atSaveConfig() {
  const name=document.getElementById('at-cfg-name')?.value.trim();
  const realm=document.getElementById('at-cfg-realm')?.value.trim();
  const utcOffset=Number(document.getElementById('at-cfg-utc')?.value||0);
  if(!name) return toast('Informe o nome da Aliança.','warn');
  try{
    await atJson(`${API}/alliance-tracker/alliances/${AT.alliance._id}`,{method:'PATCH',headers:{'Content-Type':'application/json'},body:JSON.stringify({name,realm,utcOffset})});
    toast('Configuração salva.'); await carregarAliancas();
  }catch(err){toast(err.message,'erro');}
}
