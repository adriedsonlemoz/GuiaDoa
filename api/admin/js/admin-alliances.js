const AT = {
  alliances: [],
  alliance: null,
  summary: null,
  members: [],
  snapshots: [],
  tab: 'members',
  review: null,
  files: [],
  scan: { running: false, progress: 0, lines: [], batchId: null, completed: 0, total: 0, status: null, canContinue: false, restoring: false },
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
  if (!r.ok) {
    const error = new Error(d.erro || d.mensagem || 'Falha no Alliance Tracker.');
    error.status = r.status;
    error.code = d.code || null;
    throw error;
  }
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
  AT.files = [];
  AT.scan = { running:false, progress:0, lines:[], batchId:null, completed:0, total:0, status:null, canContinue:false, restoring:false };
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

function atBatchStorageKey() {
  return `doa_admin_alliance_scan_batch_${AT.alliance?._id || 'default'}`;
}

function atRememberBatch(batchId) {
  AT.scan.batchId = batchId || null;
  if (batchId) localStorage.setItem(atBatchStorageKey(), batchId);
  else localStorage.removeItem(atBatchStorageKey());
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
      <div class="at-note">Durante uma leitura ativa, os screenshots ficam <strong>temporariamente</strong> no backend para permitir continuar após refresh ou reconexão. Eles são apagados assim que o lote termina ou é cancelado; apenas dados revisados podem ser gravados no MongoDB.</div>
      <button id="at-read-btn" class="btn btn-gold" onclick="atExtract(false)" disabled>🔎 Ler screenshots</button>
      <div id="at-scan-story" class="at-scan-story" hidden>
        <div class="at-scan-head">
          <div class="at-scan-orb"><span>◉</span></div>
          <div><small id="at-scan-kicker">Preparando leitura</small><h4 id="at-scan-title">Vou organizar os screenshots antes de extrair os membros.</h4></div>
        </div>
        <p id="at-scan-text">Nada será salvo antes da sua revisão.</p>
        <div class="at-scan-track"><i id="at-scan-bar"></i></div>
        <div id="at-scan-progress" class="at-scan-progress">0/0 imagens concluídas · 0%</div>
        <div id="at-scan-log" class="at-scan-log"></div>
        <div id="at-scan-actions" class="at-scan-actions" hidden>
          <button id="at-continue-btn" class="btn btn-gold" onclick="atExtract(true)">▶ Continuar leitura</button>
          <button class="btn btn-ghost" onclick="atCancelBatch()">Cancelar lote</button>
        </div>
      </div>
    </div>
    <div class="at-card"><h3>Como detectar entrada e saída</h3><p class="at-muted">No passo seguinte marque <strong>“lista completa”</strong> somente quando os screenshots cobrem todos os membros, do primeiro ao último. A primeira lista completa vira a base. A partir da próxima, quem aparecer de novo é marcado como entrada/retorno e quem desaparecer é marcado como saída.</p></div>`;

  if (AT.files.length) atFilesChanged(AT.files);
  if (AT.scan.batchId && AT.scan.status) atPaintBatchState();
  else if (localStorage.getItem(atBatchStorageKey())) void atRestoreBatch();
}

function atFilesChanged(files) {
  AT.files = [...(files || [])].slice(0, 10);
  const list = document.getElementById('at-file-list');
  if (list) list.innerHTML = AT.files.length ? AT.files.map((f,i) => `<span>${i+1}. ${esc(f.name)}</span>`).join('') : 'Nenhuma imagem selecionada.';
  const btn = document.getElementById('at-read-btn');
  if (btn) btn.disabled = !AT.files.length || AT.scan.running;
}

function atScanActions(show = false, canContinue = false) {
  const actions = document.getElementById('at-scan-actions');
  const btn = document.getElementById('at-continue-btn');
  if (actions) actions.hidden = !show;
  if (btn) btn.hidden = !canContinue;
}

function atLockBatchInput(locked = true) {
  const input = document.getElementById('at-files');
  const label = document.querySelector('label[for="at-files"]');
  const readBtn = document.getElementById('at-read-btn');
  if (input) input.disabled = locked;
  if (label) label.classList.toggle('is-disabled', locked);
  if (readBtn && locked) readBtn.disabled = true;
}

function atScanStory({ kicker, title, text, progress, line, tone = 'active', completed, total } = {}) {
  const box = document.getElementById('at-scan-story');
  if (!box) return;
  box.hidden = false;
  box.dataset.tone = tone;
  if (completed != null) AT.scan.completed = Math.max(0, Number(completed) || 0);
  if (total != null) AT.scan.total = Math.max(0, Number(total) || 0);
  if (kicker != null) document.getElementById('at-scan-kicker').textContent = kicker;
  if (title != null) document.getElementById('at-scan-title').textContent = title;
  if (text != null) document.getElementById('at-scan-text').textContent = text;
  if (progress != null) {
    const pct = Math.max(0, Math.min(100, Math.round(progress)));
    AT.scan.progress = pct;
    document.getElementById('at-scan-bar').style.width = `${pct}%`;
  }
  const progressEl = document.getElementById('at-scan-progress');
  if (progressEl) progressEl.textContent = `${AT.scan.completed}/${AT.scan.total || 0} imagens concluídas · ${AT.scan.progress || 0}%`;
  if (line) {
    AT.scan.lines.push(line);
    AT.scan.lines = AT.scan.lines.slice(-7);
    document.getElementById('at-scan-log').innerHTML = AT.scan.lines.map((item, index) => `<div class="${index === AT.scan.lines.length - 1 ? 'is-current' : ''}"><span>${index === AT.scan.lines.length - 1 ? '›' : '✓'}</span>${esc(item)}</div>`).join('');
  }
}

function atWaitLabel(ms) {
  const seconds = Math.max(1, Math.ceil((Number(ms) || 0) / 1000));
  return seconds === 1 ? '1 segundo' : `${seconds} segundos`;
}

function atScanNarrate(event) {
  const total = Math.max(1, Number(event.total || event.imagesCount || AT.scan.total || AT.files.length || 1));
  const completed = Math.max(0, Number(event.completed ?? AT.scan.completed) || 0);
  const current = Number(event.index ?? completed) + 1;
  const realProgress = Math.min(100, Math.round((completed / total) * 100));
  if (event.batchId) { atRememberBatch(event.batchId); atLockBatchInput(true); }
  AT.scan.status = event.type === 'done' ? 'completed' : 'processing';

  if (event.type === 'start') {
    const resumed = Boolean(event.resumed || completed);
    return atScanStory({
      kicker: resumed ? 'Retomando lote' : 'Imagens recebidas',
      title: resumed ? `${completed}/${total} imagens já estavam concluídas.` : `Recebi ${event.imagesCount} screenshot${event.imagesCount === 1 ? '' : 's'}.`,
      text: resumed ? 'Vou continuar exatamente da próxima imagem, sem reler as capturas já concluídas.' : 'Vou ler uma imagem por vez. Se houver limite temporário, o próprio processo aguarda e tenta novamente.',
      progress:realProgress, completed, total,
      line: resumed ? `Lote recuperado: ${completed}/${total} imagens concluídas.` : 'Upload concluído. Iniciando leitura visual.',
    });
  }
  if (event.type === 'image_start') {
    return atScanStory({
      kicker:`Imagem ${current} de ${total}`,
      title:'Procurando a tabela de membros…',
      text:`${completed}/${total} imagens estão concluídas. Esta captura será processada sozinha antes da próxima.`,
      progress:realProgress, completed, total,
      line:`Imagem ${current}: localizando nomes e valores.`,
    });
  }
  if (event.type === 'vision_progress' && event.stage === 'provider') {
    return atScanStory({
      kicker:`Imagem ${current} de ${total}`,
      title:event.attempt > 1 ? 'Tentando um leitor visual alternativo…' : 'Lendo os detalhes do screenshot…',
      text:'Símbolos dos nicks, números e datas são preservados para você revisar antes de salvar.',
      progress:realProgress, completed, total,
      line:event.attempt > 1 ? 'Tentativas no modelo anterior terminaram; usando a alternativa visual.' : 'Leitor visual analisando a captura.',
    });
  }
  if (event.type === 'vision_progress' && event.stage === 'rate_limit') {
    const waitText = atWaitLabel(event.waitMs);
    return atScanStory({
      kicker:`Imagem ${current} de ${total} · limite temporário`,
      title:'Limite temporário atingido → aguardando',
      text:`O serviço pediu uma pausa de ${waitText}. ${completed}/${total} imagens concluídas continuam preservadas.`,
      progress:realProgress, completed, total,
      line:`Limite temporário atingido → aguardando ${waitText}.`,
    });
  }
  if (event.type === 'vision_progress' && event.stage === 'retrying') {
    return atScanStory({
      kicker:`Imagem ${current} de ${total} · tentativa ${event.retry}/${event.maxRetries}`,
      title:'Aguardando concluído → tentando novamente',
      text:'A mesma imagem será retomada automaticamente; nenhuma captura concluída será lida outra vez.',
      progress:realProgress, completed, total,
      line:'Limite temporário atingido → aguardando → tentando novamente.',
    });
  }
  if (event.type === 'vision_progress' && event.stage === 'provider_failed') {
    return atScanStory({
      kicker:'Mudando de rota',
      title:'Esse leitor não conseguiu concluir a imagem.',
      text:event.retryable ? 'As tentativas automáticas terminaram neste modelo; vou usar a alternativa configurada.' : 'Todas as alternativas desta tentativa foram esgotadas.',
      progress:realProgress, completed, total,
      line:event.retryable ? 'Tentativas do modelo esgotadas; alternando o leitor visual.' : 'O serviço visual não concluiu a imagem.',
    });
  }
  if (event.type === 'image_done') {
    const done = Math.max(completed, current);
    const pct = Math.round((done / total) * 100);
    return atScanStory({
      kicker:`${done}/${total} imagens concluídas`,
      title:`Encontrei ${event.rows} linha${event.rows === 1 ? '' : 's'} nesta captura.`,
      text:event.warnings ? `Também encontrei ${event.warnings} ponto${event.warnings === 1 ? '' : 's'} que merece revisão.` : done < total ? 'Resultado preservado. Agora sigo para a próxima imagem.' : 'Todas as imagens foram lidas; vou organizar os resultados.',
      progress:pct, completed:done, total,
      line:`Imagem ${current} concluída: ${event.rows} membro(s) reconhecido(s).`,
    });
  }
  if (event.type === 'merge_start') {
    return atScanStory({
      kicker:`${completed}/${total} imagens concluídas`,
      title:'Cruzando nomes repetidos entre os screenshots…',
      text:'Linhas sobrepostas são unidas para que o mesmo membro não apareça duas vezes.',
      progress:98, completed, total,
      line:'Todas as imagens concluídas. Removendo duplicações.',
    });
  }
  if (event.type === 'done') {
    const rows = event.data?.rows?.length || 0;
    return atScanStory({
      kicker:`${total}/${total} imagens concluídas`,
      title:`${rows} membro${rows === 1 ? '' : 's'} pronto${rows === 1 ? '' : 's'} para revisão.`,
      text:'Os screenshots temporários já foram apagados do backend. Nenhum dado oficial foi gravado ainda.',
      progress:100, completed:total, total,
      line:'Tudo pronto. Abrindo revisão.', tone:'success',
    });
  }
}

function atScanFailure(error = {}) {
  const completed = Math.max(0, Number(error.completed ?? AT.scan.completed) || 0);
  const total = Math.max(AT.scan.total || 0, Number(error.total) || 0);
  const code = error.code ? `Código: ${error.code}` : 'A leitura não foi concluída.';
  const canContinue = Boolean(error.canContinue ?? error.retryable) && completed < total;
  AT.scan.status = 'paused';
  AT.scan.canContinue = canContinue;
  atScanStory({
    kicker:'A leitura parou aqui',
    title:error.erro || error.message || 'Não consegui concluir o screenshot.',
    text:canContinue
      ? `${completed}/${total} imagens concluídas foram preservadas. Use “Continuar leitura” para retomar a partir da imagem ${completed + 1}, sem reler as anteriores.`
      : `${code}. ${completed}/${total || '?'} imagens haviam sido concluídas.`,
    progress:total ? (completed / total) * 100 : (AT.scan.progress || 0),
    completed, total,
    line:canContinue ? `Lote pausado em ${completed}/${total}; pronto para continuar.` : code,
    tone:'error',
  });
  atScanActions(Boolean(AT.scan.batchId), canContinue);
  if (AT.scan.batchId) atLockBatchInput(true);
}

function atPaintBatchState() {
  const completed = AT.scan.completed || 0;
  const total = AT.scan.total || 0;
  if (AT.scan.status === 'processing') {
    atScanStory({
      kicker:'Leitura em andamento no backend',
      title:`${completed}/${total} imagens concluídas foram recuperadas.`,
      text:'A conexão anterior pode ainda estar concluindo a imagem atual. O lote permanece preservado.',
      progress:total ? (completed/total)*100 : 0, completed, total,
      line:'Estado do lote recuperado após reconexão.',
    });
    atScanActions(true, false);
    atLockBatchInput(true);
    return;
  }
  if (AT.scan.status === 'paused' || AT.scan.status === 'ready') {
    atScanStory({
      kicker:'Lote recuperado',
      title:`${completed}/${total} imagens concluídas.`,
      text:`A próxima leitura começa na imagem ${completed + 1}, sem repetir as ${completed} já processadas.`,
      progress:total ? (completed/total)*100 : 0, completed, total,
      line:`Pronto para continuar a partir da imagem ${completed + 1}.`,
      tone: AT.scan.lastError ? 'error' : 'active',
    });
    atScanActions(true, true);
    atLockBatchInput(true);
  }
}

async function atRestoreBatch() {
  const batchId = AT.scan.batchId || localStorage.getItem(atBatchStorageKey());
  if (!batchId || AT.scan.running || AT.scan.restoring) return;
  AT.scan.restoring = true;
  try {
    const state = await atJson(`${API}/alliance-tracker/extract-batches/${encodeURIComponent(batchId)}`);
    atRememberBatch(state.batchId || batchId);
    AT.scan.completed = Number(state.completed || 0);
    AT.scan.total = Number(state.total || 0);
    AT.scan.status = state.status;
    AT.scan.lastError = state.lastError || null;
    if (state.status === 'completed' && state.finalData) {
      AT.review = { ...state.finalData, capturedAt: state.finalData.capturedAt || state.capturedAt, completeList:false };
      atRenderReview();
      return;
    }
    atPaintBatchState();
  } catch (err) {
    if (err?.status === 404 || err?.code === 'VISION_BATCH_NOT_FOUND') {
      atRememberBatch(null);
      AT.scan.status = null;
      return;
    }
    atRememberBatch(batchId);
    AT.scan.status = AT.scan.status || 'recovering';
    atScanStory({
      kicker:'Reconectando ao lote',
      title:'O lote temporário continua identificado.',
      text:'Não consegui consultar o backend agora. Vou tentar recuperar o estado novamente sem reenviar ou reler as imagens concluídas.',
      progress:AT.scan.total ? (AT.scan.completed/AT.scan.total)*100 : 0,
      completed:AT.scan.completed, total:AT.scan.total,
      line:'Conexão indisponível; mantendo o identificador do lote para nova tentativa.',
    });
    atScanActions(true, false);
    atLockBatchInput(true);
  } finally {
    AT.scan.restoring = false;
    if (AT.tab === 'import' && ['processing','recovering'].includes(AT.scan.status) && AT.scan.batchId && !AT.scan.running) {
      setTimeout(() => void atRestoreBatch(), 1800);
    }
  }
}

async function atCancelBatch({ silent = false } = {}) {
  const batchId = AT.scan.batchId || localStorage.getItem(atBatchStorageKey());
  if (batchId) {
    try {
      await atJson(`${API}/alliance-tracker/extract-batches/${encodeURIComponent(batchId)}`, { method:'DELETE' });
    } catch (err) {
      if (!silent && err?.status !== 404) {
        toast('Não consegui confirmar a remoção do lote no backend. O identificador foi mantido para você tentar novamente.', 'warn');
        return false;
      }
    }
  }
  atRememberBatch(null);
  AT.scan = { running:false, progress:0, lines:[], batchId:null, completed:0, total:0, status:null, canContinue:false, restoring:false };
  if (!silent) {
    AT.files = [];
    toast('Lote temporário cancelado. Os screenshots foram removidos.');
    atRenderImport();
  }
  return true;
}

async function atExtract(resume = false) {
  const batchId = AT.scan.batchId || localStorage.getItem(atBatchStorageKey());
  if (resume && !batchId) return toast('Não há lote pausado para continuar.', 'warn');
  if (!resume && !AT.files.length) return toast('Selecione pelo menos um screenshot.', 'warn');

  const btn = document.getElementById('at-read-btn');
  const continueBtn = document.getElementById('at-continue-btn');
  AT.scan.running = true;
  AT.scan.lines = resume ? AT.scan.lines : [];
  AT.scan.status = 'processing';
  AT.scan.canContinue = false;
  if (!resume) {
    AT.scan.progress = 0;
    AT.scan.completed = 0;
    AT.scan.total = AT.files.length;
  }
  if (btn) { btn.disabled = true; btn.textContent = '⏳ Acompanhando leitura…'; }
  if (continueBtn) { continueBtn.disabled = true; continueBtn.textContent = '⏳ Continuando…'; }
  atScanActions(false, false);
  atScanStory({
    kicker:resume ? 'Continuando leitura' : 'Começando',
    title:resume ? `Retomando da imagem ${AT.scan.completed + 1}…` : 'Preparando os screenshots…',
    text:resume ? 'As imagens já concluídas permanecem preservadas e não serão relidas.' : 'Primeiro envio as imagens; depois acompanho a leitura de cada uma.',
    progress:AT.scan.total ? (AT.scan.completed/AT.scan.total)*100 : 0,
    completed:AT.scan.completed, total:AT.scan.total,
    line:resume ? 'Solicitando continuação do lote temporário.' : 'Preparando envio.',
  });

  try {
    let url = `${API}/alliance-tracker/extract-stream`;
    const options = { method:'POST', headers:{ Authorization:`Bearer ${AdminCore.getToken()}` }, signal:AbortSignal.timeout(900000) };
    if (resume) {
      url += `?batchId=${encodeURIComponent(batchId)}`;
    } else {
      const fd = new FormData();
      AT.files.forEach(file => fd.append('images', file));
      const capturedRaw = document.getElementById('at-captured')?.value;
      fd.append('capturedAt', capturedRaw ? new Date(capturedRaw).toISOString() : new Date().toISOString());
      if (AT.alliance?._id) fd.append('allianceId', AT.alliance._id);
      options.body = fd;
    }

    const response = await fetch(url, options);
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
    if (!result) throw {
      erro:'A conexão terminou antes da lista final. O lote pode ser retomado sem reler o que já terminou.',
      code:'VISION_EMPTY_STREAM', retryable:true, canContinue:true,
      batchId:AT.scan.batchId, completed:AT.scan.completed, total:AT.scan.total,
    };

    AT.review = { ...result, capturedAt: result.capturedAt || new Date().toISOString(), completeList:false };
    AT.scan.status = 'completed';
    await new Promise(resolve => setTimeout(resolve, 250));
    atRenderReview();
  } catch (err) {
    const normalized = err?.name === 'TimeoutError'
      ? { erro:'A conexão do Admin expirou, mas o lote temporário pode continuar do ponto salvo.', code:'VISION_CLIENT_TIMEOUT', retryable:true, canContinue:true, batchId:AT.scan.batchId, completed:AT.scan.completed, total:AT.scan.total }
      : (err || {});
    if (normalized.batchId) atRememberBatch(normalized.batchId);
    if (normalized.code === 'VISION_BATCH_BUSY') {
      AT.scan.completed = Number(normalized.completed || AT.scan.completed || 0);
      AT.scan.total = Number(normalized.total || AT.scan.total || 0);
      AT.scan.status = 'processing';
      atScanStory({
        kicker:'Reconectando ao lote',
        title:`${AT.scan.completed}/${AT.scan.total} imagens concluídas.`,
        text:'O backend ainda está terminando a imagem atual da conexão anterior. Vou atualizar o estado automaticamente sem iniciar uma leitura duplicada.',
        progress:AT.scan.total ? (AT.scan.completed/AT.scan.total)*100 : 0,
        completed:AT.scan.completed, total:AT.scan.total,
        line:'Lote ainda ocupado; aguardando a imagem atual terminar.',
      });
      atScanActions(true, false);
      atLockBatchInput(true);
      setTimeout(() => void atRestoreBatch(), 1500);
    } else {
      atScanFailure(normalized);
      toast(normalized.erro || normalized.message || 'Falha ao ler screenshots.', 'erro');
    }
    if (btn) { btn.disabled = !AT.files.length; btn.textContent = '🔎 Ler screenshots'; }
    if (continueBtn) { continueBtn.disabled = false; continueBtn.textContent = '▶ Continuar leitura'; }
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

async function atCancelReview() {
  AT.review = null;
  AT.files = [];
  await atCancelBatch({ silent:true });
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
    await atCancelBatch({ silent:true });
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
    <div class="at-note">Os dados estruturados ficam no banco. Screenshots só existem temporariamente durante um lote de leitura e são removidos ao concluir ou cancelar. O navegador guarda apenas referências de interface e o lote retomável ativo.</div>
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
