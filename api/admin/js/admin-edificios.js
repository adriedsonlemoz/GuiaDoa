const EMOJIS_EDIFICIOS = [
  '🏗️','🏠','🌾','🔮','💧','⚔️','👁️','🏰','⛏️','🪨',
  '🌲','🏭','🥚','🏛️','🏯','🗼','⛺','🛖','🏚️','🕌',
  '🏟️','🏪','🏬','🏦','🏥','🏫','🏨','🕍','🛕','⛪',
];
const TIPOS_COLUNA = ['number','text'];

async function carregarEdificios() {
  document.getElementById('content').innerHTML = '<div class="loading"><span class="spinner"></span> Carregando edifícios...</div>';
  try {
    const r = await fetch(`${API}/edificios`, { headers: { Authorization: `Bearer ${TOKEN}` } });
    if (r.status === 401) { sair(); return; }
    const d = await r.json();
    EDIFICIOS_CACHE = d.edificios || [];
    renderEdificios(d);
  } catch (err) {
    document.getElementById('content').innerHTML = `<div class="loading" style="color:var(--red)">❌ Erro: ${esc(err.message)}</div>`;
  }
}

function renderEdificios(d) {
  document.getElementById('content').innerHTML = `
    <div class="stats-row">
      <div class="stat-box"><div class="stat-val">${d.total}</div><div class="stat-lbl">Edifícios</div></div>
      <div class="stat-box">
        <div class="stat-val">${d.edificios.reduce((s,e)=> s + (e.niveis?.length||0), 0)}</div>
        <div class="stat-lbl">Linhas de Nível</div>
      </div>
    </div>

    <div class="card">
      <div class="card-header">
        <h2>🏗️ Edifícios</h2>
        <div style="display:flex;gap:8px;flex-wrap:wrap">
          <button class="btn btn-gold btn-sm"  onclick="abrirModalNovoEdificio()">＋ Novo Edifício</button>
        </div>
      </div>
      <div class="card-body">
        ${d.edificios.length === 0 ? `
          <div style="text-align:center;padding:32px;color:var(--muted)">
            <p style="font-size:2rem;margin-bottom:8px">🏗️</p>
            <p>Nenhum edifício cadastrado.</p>
            <p style="font-size:0.8rem;margin-top:8px">Os dados padrão são migrados automaticamente para o MongoDB. Verifique o diagnóstico da migração ou use <strong>＋ Novo Edifício</strong>.</p>
          </div>
        ` : `
          <div class="tabela-wrap">
            <table>
              <thead><tr>
                <th style="width:44px">ÍCONE</th>
                <th>NOME</th>
                <th>TAG</th>
                <th style="text-align:center">NÍVEIS</th>
                <th style="text-align:center">COLUNAS</th>
                <th style="white-space:nowrap">AÇÕES</th>
              </tr></thead>
              <tbody>
                ${d.edificios.map(ed => `
                  <tr>
                    <td style="text-align:center;font-size:1.3rem">${esc(ed.icone || '🏗️')}</td>
                    <td>
                      <strong>${esc(ed.nome)}</strong>
                      <div style="font-size:0.7rem;color:var(--muted);margin-top:2px">${esc(ed.descricao?.substring(0,60) || '')}${(ed.descricao?.length||0) > 60 ? '…' : ''}</div>
                    </td>
                    <td><span style="font-size:0.72rem;padding:2px 8px;border-radius:5px;background:rgba(200,168,74,0.15);border:1px solid rgba(200,168,74,0.3);color:var(--dark)">${esc(ed.tag || '—')}</span></td>
                    <td style="text-align:center;font-weight:800;color:var(--gold3)">${ed.niveis?.length || 0}</td>
                    <td style="text-align:center;color:var(--muted);font-size:0.78rem">${esc(ed.colunas?.map(c=>c.label).join(', ') || '—')}</td>
                    <td style="white-space:nowrap">
                      <button class="btn btn-navy btn-sm btn-acao" onclick="editarEdificio(fromDataArg('${dataArg(ed)}'))">✏ Editar</button>
                      <button class="btn btn-gold btn-sm btn-acao"  onclick="editarNiveis(fromStrArg('${strArg(ed.slug)}'),fromStrArg('${strArg(ed.nome)}'))">📋 Níveis</button>
                      <button class="btn btn-red btn-sm btn-acao"   onclick="confirmarRemoverEdificio(fromStrArg('${strArg(ed.slug)}'),fromStrArg('${strArg(ed.nome)}'))">🗑 Excluir</button>
                    </td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        `}
      </div>
    </div>
  `;
}

// ── Modal Edifício (meta) ─────────────────────────────────────────────────────
function abrirModalNovoEdificio() {
  EDIFICIO_ED_SLUG = null;
  EDIFICIO_ICONE   = '🏗️';
  document.getElementById('modal-ed-titulo').textContent = '✦ Novo Edifício';
  document.getElementById('fed-slug').value      = '';
  document.getElementById('fed-slug').disabled   = false;
  document.getElementById('fed-nome').value      = '';
  document.getElementById('fed-tag').value       = '';
  document.getElementById('fed-descricao').value = '';
  document.getElementById('fed-ordem').value     = '0';
  document.getElementById('fed-en-nome').value = '';
  document.getElementById('fed-en-tag').value = '';
  document.getElementById('fed-en-descricao').value = '';
  renderEmojiPickerEd();
  renderColunasEditor([]);
  abrirModal('modal-edificio');
}

function editarEdificio(ed) {
  EDIFICIO_ED_SLUG = ed.slug;
  EDIFICIO_ICONE   = ed.icone || '🏗️';
  document.getElementById('modal-ed-titulo').textContent = `✏ Editar: ${ed.nome}`;
  document.getElementById('fed-slug').value      = ed.slug;
  document.getElementById('fed-slug').disabled   = true;
  document.getElementById('fed-nome').value      = ed.nome;
  document.getElementById('fed-tag').value       = ed.tag || '';
  document.getElementById('fed-descricao').value = ed.descricao || '';
  document.getElementById('fed-ordem').value     = ed.ordem ?? 0;
  document.getElementById('fed-en-nome').value = ed.i18n?.['en-US']?.nome || '';
  document.getElementById('fed-en-tag').value = ed.i18n?.['en-US']?.tag || '';
  document.getElementById('fed-en-descricao').value = ed.i18n?.['en-US']?.descricao || '';
  renderEmojiPickerEd();
  renderColunasEditor(ed.colunas || []);
  abrirModal('modal-edificio');
}

function renderEmojiPickerEd() {
  const grid = document.getElementById('emoji-grid-ed');
  grid.innerHTML = EMOJIS_EDIFICIOS.map(e => `
    <button type="button" class="emoji-btn ${e === EDIFICIO_ICONE ? 'ativo' : ''}"
      onclick="selecionarEmojiEd('${e}')">${e}</button>
  `).join('');
  document.getElementById('emoji-preview-ed').textContent = EDIFICIO_ICONE;
}

function selecionarEmojiEd(e) {
  EDIFICIO_ICONE = e;
  document.getElementById('emoji-preview-ed').textContent = e;
  document.querySelectorAll('#emoji-grid-ed .emoji-btn').forEach(b => {
    b.classList.toggle('ativo', b.textContent === e);
  });
}

// ── Editor de Colunas ─────────────────────────────────────────────────────────
function renderColunasEditor(colunas) {
  const box = document.getElementById('colunas-editor');
  box.innerHTML = colunas.map((c,i) => colunaCampo(c, i)).join('');
}

function colunaCampo(c = {}, i) {
  return `
    <div class="coluna-row" data-idx="${i}" style="display:flex;gap:6px;align-items:center;margin-bottom:6px">
      <input class="coluna-key" placeholder="key (ex: prodHora)" value="${c.key||''}"
        style="flex:1;font-size:0.78rem;padding:5px 8px;background:#F8F4E8;border:1px solid var(--gold);border-radius:6px;font-family:monospace">
      <input class="coluna-label" placeholder="label (ex: Prod./h)" value="${c.label||''}"
        style="flex:1;font-size:0.78rem;padding:5px 8px;background:#F8F4E8;border:1px solid var(--gold);border-radius:6px">
      <select class="coluna-tipo" style="padding:5px 6px;background:#F8F4E8;border:1px solid var(--gold);border-radius:6px;font-size:0.78rem">
        <option value="number" ${(c.tipo||'number')==='number'?'selected':''}>Número</option>
        <option value="text"   ${c.tipo==='text'?'selected':''}>Texto</option>
      </select>
      <button type="button" onclick="removerColuna(${i})"
        style="padding:4px 8px;background:rgba(168,60,44,0.1);border:1px solid rgba(168,60,44,0.3);
               border-radius:6px;cursor:pointer;font-size:0.8rem;color:var(--red)">✕</button>
    </div>
  `;
}

function adicionarColuna() {
  const box = document.getElementById('colunas-editor');
  const idx = box.querySelectorAll('.coluna-row').length;
  box.insertAdjacentHTML('beforeend', colunaCampo({}, idx));
}

function removerColuna(idx) {
  const rows = document.getElementById('colunas-editor').querySelectorAll('.coluna-row');
  rows[idx]?.remove();
  // reindexar
  document.getElementById('colunas-editor').querySelectorAll('.coluna-row').forEach((r,i) => {
    r.dataset.idx = i;
    r.querySelector('button').setAttribute('onclick', `removerColuna(${i})`);
  });
}

function lerColunas() {
  return [...document.getElementById('colunas-editor').querySelectorAll('.coluna-row')].map(r => ({
    key:   r.querySelector('.coluna-key').value.trim(),
    label: r.querySelector('.coluna-label').value.trim(),
    tipo:  r.querySelector('.coluna-tipo').value,
  })).filter(c => c.key && c.label);
}

async function salvarEdificio() {
  const slug      = document.getElementById('fed-slug').value.trim();
  const nome      = document.getElementById('fed-nome').value.trim();
  const tag       = document.getElementById('fed-tag').value.trim();
  const descricao = document.getElementById('fed-descricao').value.trim();
  const ordem     = parseInt(document.getElementById('fed-ordem').value) || 0;
  const colunas   = lerColunas();
  if (!nome) return toast('Preencha o nome!', 'warn');
  if (!EDIFICIO_ED_SLUG && !slug) return toast('Preencha o slug!', 'warn');

  try {
    let r;
    if (EDIFICIO_ED_SLUG) {
      r = await fetch(`${API}/edificios/${EDIFICIO_ED_SLUG}/meta`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${TOKEN}` },
        body: JSON.stringify({ nome, icone: EDIFICIO_ICONE, tag, descricao, colunas, ordem, i18n: { 'en-US': { nome: document.getElementById('fed-en-nome').value.trim(), tag: document.getElementById('fed-en-tag').value.trim(), descricao: document.getElementById('fed-en-descricao').value.trim() } } }),
      });
    } else {
      r = await fetch(`${API}/edificios`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${TOKEN}` },
        body: JSON.stringify({ slug, nome, icone: EDIFICIO_ICONE, tag, descricao, colunas, ordem, i18n: { 'en-US': { nome: document.getElementById('fed-en-nome').value.trim(), tag: document.getElementById('fed-en-tag').value.trim(), descricao: document.getElementById('fed-en-descricao').value.trim() } } }),
      });
    }
    const d = await r.json();
    if (!r.ok) return toast(d.erro || 'Erro ao salvar', 'erro');
    fecharModal('modal-edificio');
    toast(EDIFICIO_ED_SLUG ? `"${nome}" atualizado!` : `"${nome}" criado!`, 'ok');
    carregarEdificios();
  } catch (e) { toast('Erro: ' + e.message, 'erro'); }
}

// ── Editor de Níveis ──────────────────────────────────────────────────────────
async function editarNiveis(slug, nome) {
  EDIFICIO_NIV_SLUG = slug;
  document.getElementById('modal-niv-titulo').textContent = `📋 Níveis: ${nome}`;

  // Carrega dados frescos
  const r  = await fetch(`${API}/edificios/${slug}`, { headers: { Authorization: `Bearer ${TOKEN}` } });
  const ed = await r.json();
  renderNiveisEditor(ed);
  abrirModal('modal-niveis');
}

function renderNiveisEditor(ed) {
  const colunas = ed.colunas || [];
  const niveis  = ed.niveis  || [];
  const box = document.getElementById('niveis-editor');
  box.innerHTML = `
    <div style="overflow-x:auto">
      <table style="width:100%;border-collapse:collapse;font-size:0.78rem" id="tabela-niveis-ed">
        <thead>
          <tr style="background:var(--bg2)">
            <th style="padding:6px 8px;text-align:left;font-size:0.65rem;letter-spacing:1px;color:var(--muted)">NÍVEL</th>
            ${colunas.map(c=>`<th style="padding:6px 8px;text-align:left;font-size:0.65rem;letter-spacing:1px;color:var(--muted)">${c.label.toUpperCase()}</th>`).join('')}
            <th style="padding:6px 8px;width:36px"></th>
          </tr>
        </thead>
        <tbody id="niveis-tbody">
          ${niveis.map((niv,i) => nivelRow(niv, i, colunas)).join('')}
        </tbody>
      </table>
    </div>
    <button type="button" onclick="adicionarNivelRow()"
      style="margin-top:10px;width:100%;padding:7px;background:rgba(200,168,74,0.1);
             border:1.5px dashed rgba(200,168,74,0.4);border-radius:8px;cursor:pointer;
             font-size:0.78rem;font-weight:800;color:var(--gold3)">
      ＋ Adicionar Nível
    </button>
  `;
  // guarda colunas no DOM para reuso
  box.dataset.colunas = JSON.stringify(colunas);
}

function nivelRow(niv, i, colunas) {
  const isText = (key) => (colunas.find(c=>c.key===key)||{}).tipo === 'text';
  return `
    <tr data-row="${i}" style="border-bottom:1px solid rgba(200,168,74,0.15)">
      <td style="padding:4px 6px">
        <input class="cell-nivel" value="${niv.nivel ?? ''}"
          style="width:70px;padding:3px 6px;font-size:0.78rem;text-align:center;
                 background:#F8F4E8;border:1px solid rgba(200,168,74,0.4);border-radius:5px">
      </td>
      ${colunas.map(c => `
        <td style="padding:4px 6px">
          <input class="cell-val" data-key="${c.key}"
            value="${niv[c.key] ?? ''}"
            style="width:${isText(c.key)?'200px':'90px'};padding:3px 6px;font-size:0.78rem;
                   background:#F8F4E8;border:1px solid rgba(200,168,74,0.4);border-radius:5px">
        </td>
      `).join('')}
      <td style="padding:4px 6px">
        <button type="button" onclick="removerNivelRow(${i})"
          style="padding:2px 7px;background:rgba(168,60,44,0.1);border:1px solid rgba(168,60,44,0.3);
                 border-radius:5px;cursor:pointer;color:var(--red);font-size:0.8rem">✕</button>
      </td>
    </tr>
  `;
}

function adicionarNivelRow() {
  const box     = document.getElementById('niveis-editor');
  const colunas = JSON.parse(box.dataset.colunas || '[]');
  const tbody   = document.getElementById('niveis-tbody');
  const i       = tbody.querySelectorAll('tr').length;
  tbody.insertAdjacentHTML('beforeend', nivelRow({}, i, colunas));
}

function removerNivelRow(i) {
  const row = document.querySelector(`#niveis-tbody tr[data-row="${i}"]`);
  row?.remove();
  // reindexar
  document.querySelectorAll('#niveis-tbody tr').forEach((r,idx) => {
    r.dataset.row = idx;
    r.querySelector('button').setAttribute('onclick', `removerNivelRow(${idx})`);
  });
}

function lerNiveis() {
  const box     = document.getElementById('niveis-editor');
  const colunas = JSON.parse(box.dataset.colunas || '[]');
  return [...document.querySelectorAll('#niveis-tbody tr')].map(tr => {
    const nv = tr.querySelector('.cell-nivel').value.trim();
    const row = { nivel: isNaN(nv) ? nv : Number(nv) };
    tr.querySelectorAll('.cell-val').forEach(inp => {
      const key  = inp.dataset.key;
      const col  = colunas.find(c=>c.key===key);
      const val  = inp.value.trim();
      row[key]   = col?.tipo === 'text' ? val : (val === '' ? null : Number(val));
    });
    return row;
  }).filter(r => r.nivel !== '' && r.nivel !== null);
}

async function salvarNiveis() {
  const niveis = lerNiveis();
  try {
    const r = await fetch(`${API}/edificios/${EDIFICIO_NIV_SLUG}/niveis`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${TOKEN}` },
      body: JSON.stringify({ niveis }),
    });
    const d = await r.json();
    if (!r.ok) return toast(d.erro || 'Erro ao salvar', 'erro');
    fecharModal('modal-niveis');
    toast(`Níveis de "${d.nome}" salvos! (${niveis.length} linhas)`, 'ok');
    carregarEdificios();
  } catch (e) { toast('Erro: ' + e.message, 'erro'); }
}

function confirmarRemoverEdificio(slug, nome) {
  document.getElementById('confirm-msg').textContent = `Remover o edifício "${nome}" e todos os seus níveis permanentemente?`;
  document.getElementById('confirm-ok').onclick = async () => {
    const r = await fetch(`${API}/edificios/${slug}`, { method: 'DELETE', headers: { Authorization: `Bearer ${TOKEN}` } });
    const d = await r.json();
    fecharModal('confirm-modal');
    if (!r.ok) return toast(d.erro || 'Erro', 'erro');
    toast(d.mensagem, 'ok');
    carregarEdificios();
  };
  abrirModal('confirm-modal');
}


// ═══════════════════════════════════════════════════════════════════════════════
// ═══════════════════════════════════════════════════════════════════════════════
