const AT = {
  alliances: [],
  alliance: null,
  summary: null,
  members: [],
  snapshots: [],
  tab: 'members',
  review: null,
  files: [],
  scan: { running: false, progress: 0, lines: [] },
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
      <div id="at-scan-story" class="at-scan-story" hidden>
        <div class="at-scan-head">
          <div class="at-scan-orb"><span>◉</span></div>
          <div><small id="at-scan-kicker">Preparando leitura</small><h4 id="at-scan-title">Vou organizar os screenshots antes de extrair os membros.</h4></div>
        </div>
        <p id="at-scan-text">Nada será salvo antes da sua revisão.</p>
        <div class="at-scan-track"><i id="at-scan-bar"></i></div>
        <div id="at-scan-progress" class="at-scan-progress">0%</div>
        <div id="at-scan-log" class="at-scan-log"></div>
      </div>
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

function atScanStory({ kicker, title, text, progress, line, tone = 'active' } = {}) {
  const box = document.getElementById('at-scan-story');
  if (!box) return;
  box.hidden = false;
  box.dataset.tone = tone;
  if (kicker != null) document.getElementById('at-scan-kicker').textContent = kicker;
  if (title != null) document.getElementById('at-scan-title').textContent = title;
  if (text != null) document.getElementById('at-scan-text').textContent = text;
  if (progress != null) {
    const pct = Math.max(0, Math.min(100, Math.round(progress)));
    AT.scan.progress = pct;
    document.getElementById('at-scan-bar').style.width = `${pct}%`;
    document.getElementById('at-scan-progress').textContent = `${pct}%`;
  }
  if (line) {
    AT.scan.lines.push(line);
    AT.scan.lines = AT.scan.lines.slice(-5);
    document.getElementById('at-scan-log').innerHTML = AT.scan.lines.map((item, index) => `<div class="${index === AT.scan.lines.length - 1 ? 'is-current' : ''}"><span>${index === AT.scan.lines.length - 1 ? '›' : '✓'}</span>${esc(item)}</div>`).join('');
  }
}

function atScanNarrate(event) {
  const total = Math.max(1, Number(event.total || event.imagesCount || AT.files.length || 1));
  const current = Number(event.index || 0) + 1;
  if (event.type === 'start') {
    return atScanStory({ kicker:'Imagens recebidas', title:`Recebi ${event.imagesCount} screenshot${event.imagesCount === 1 ? '' : 's'}.`, text:'Vou ler uma imagem por vez para evitar misturar membros ou estourar o limite do serviço.', progress:5, line:'Upload concluído. Iniciando leitura visual.' });
  }
  if (event.type === 'image_start') {
    return atScanStory({ kicker:`Imagem ${current} de ${total}`, title:'Procurando a tabela de membros…', text:'Estou ignorando cabeçalho, chat e botões para focar apenas nos nomes e na coluna selecionada.', progress:10 + ((current - 1) / total) * 65, line:`Imagem ${current}: localizando nomes e valores.` });
  }
  if (event.type === 'vision_progress' && event.stage === 'provider') {
    return atScanStory({ kicker:`Imagem ${current} de ${total}`, title:event.attempt > 1 ? 'Tentando um leitor visual alternativo…' : 'Lendo os detalhes do screenshot…', text:'Símbolos dos nicks, números e datas são preservados para você revisar antes de salvar.', progress:16 + ((current - 1) / total) * 65, line:event.attempt > 1 ? 'O primeiro leitor não respondeu; tentando uma alternativa.' : 'Leitor visual analisando a captura.' });
  }
  if (event.type === 'vision_progress' && event.stage === 'provider_failed') {
    return atScanStory({ kicker:'Mudando de rota', title:'Esse leitor não conseguiu concluir a imagem.', text:event.retryable ? 'Vou tentar automaticamente uma alternativa antes de desistir.' : 'Não há outra alternativa disponível para esta tentativa.', line:event.retryable ? 'Falha temporária; alternando o modelo visual.' : 'O serviço visual recusou a leitura.' });
  }
  if (event.type === 'image_done') {
    return atScanStory({ kicker:`Imagem ${current} concluída`, title:`Encontrei ${event.rows} linha${event.rows === 1 ? '' : 's'} nesta captura.`, text:event.warnings ? `Também encontrei ${event.warnings} ponto${event.warnings === 1 ? '' : 's'} que merece revisão.` : 'Agora sigo para a próxima imagem.', progress:10 + (current / total) * 70, line:`Imagem ${current}: ${event.rows} membro(s) reconhecido(s).` });
  }
  if (event.type === 'merge_start') {
    return atScanStory({ kicker:'Organizando resultado', title:'Cruzando nomes repetidos entre os screenshots…', text:'Linhas sobrepostas são unidas para que o mesmo membro não apareça duas vezes.', progress:88, line:'Removendo duplicações e montando uma lista única.' });
  }
  if (event.type === 'done') {
    const rows = event.data?.rows?.length || 0;
    return atScanStory({ kicker:'Leitura concluída', title:`${rows} membro${rows === 1 ? '' : 's'} pronto${rows === 1 ? '' : 's'} para revisão.`, text:'Nenhum dado foi gravado ainda. Confira os nicks e valores na próxima tela.', progress:100, line:'Tudo pronto. Abrindo revisão.', tone:'success' });
  }
}

function atScanFailure(error = {}) {
  const code = error.code ? `Código: ${error.code}` : 'A leitura não foi concluída.';
  atScanStory({
    kicker:'A leitura parou aqui',
    title:error.erro || error.message || 'Não consegui concluir o screenshot.',
    text:error.retryable ? 'Isso parece temporário. Você pode tentar novamente sem perder as imagens selecionadas.' : `${code}. Verifique a configuração indicada e tente novamente.`,
    progress:AT.scan.progress || 8,
    line:error.retryable ? 'Interrupção temporária; tentativa pode ser repetida.' : code,
    tone:'error',
  });
}

async function atExtract() {
  if (!AT.files.length) return toast('Selecione pelo menos um screenshot.', 'warn');
  const btn = document.getElementById('at-read-btn');
  AT.scan = { running:true, progress:0, lines:[] };
  if (btn) { btn.disabled = true; btn.textContent = '⏳ Acompanhando leitura…'; }
  atScanStory({ kicker:'Começando', title:'Preparando os screenshots…', text:'Primeiro envio as imagens; depois acompanho a leitura de cada uma.', progress:2, line:'Preparando envio.' });
  try {
    const fd = new FormData();
    AT.files.forEach(file => fd.append('images', file));
    const response = await fetch(`${API}/alliance-tracker/extract-stream`, {
      method:'POST', headers:{ Authorization:`Bearer ${AdminCore.getToken()}` }, body:fd, signal:AbortSignal.timeout(180000),
    });

    const contentType = response.headers.get('content-type') || '';
    if (!response.ok || !response.body || !contentType.includes('application/x-ndjson')) {
      const d = await response.json().catch(() => ({}));
      throw { ...d, erro:d.erro || d.mensagem || `Falha HTTP ${response.status}` };
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';
    let result = null;
    while (true) {
      const { value, done } = await reader.read();
      buffer += decoder.decode(value || new Uint8Array(), { stream:!done });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';
      for (const raw of lines) {
        if (!raw.trim()) continue;
        const event = JSON.parse(raw);
        if (event.type === 'error') throw event.error || { erro:'Falha durante a leitura visual.' };
        atScanNarrate(event);
        if (event.type === 'done') result = event.data;
      }
      if (done) break;
    }
    if (!result) throw { erro:'O serviço terminou sem devolver uma lista para revisão.', code:'VISION_EMPTY_STREAM', retryable:true };

    const capturedRaw = document.getElementById('at-captured')?.value;
    const capturedAt = capturedRaw ? new Date(capturedRaw).toISOString() : new Date().toISOString();
    AT.review = { ...result, capturedAt, completeList:false };
    await new Promise(resolve => setTimeout(resolve, 350));
    atRenderReview();
  } catch (err) {
    const normalized = err?.name === 'TimeoutError'
      ? { erro:'A leitura demorou mais de 3 minutos e foi interrompida.', code:'VISION_CLIENT_TIMEOUT', retryable:true }
      : (err || {});
    atScanFailure(normalized);
    toast(normalized.erro || normalized.message || 'Falha ao ler screenshots.', 'erro');
    if (btn) { btn.disabled = false; btn.textContent = '↻ Tentar leitura novamente'; }
  } finally {
    AT.scan.running = false;
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
