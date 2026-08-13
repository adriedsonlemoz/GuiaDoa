// ── PESQUISAS ────────────────────────────────────────────────────────────────
const EMOJIS_PESQUISAS = [
  '🔬','⚔️','🛡️','❤️','👁️','⚡','🗺️','💥','🏹','🌾',
  '🪵','🪨','⚙️','🔩','🔨','🔮','🏃','🎯','💊','🐉',
  '🧲','🦅','📚','🔭','🧪','🏛️','🧬','🔑','🌟','💎',
];

const CATEGORIAS_PE_META = {
  'Corpo a Corpo':          { cor:'#A95E52', icone:'⚔️' },
  'Ataque à Distância':     { cor:'#607F88', icone:'🏹' },
  'Produção':               { cor:'#64825F', icone:'🌾' },
  'Movimento e Construção': { cor:'#6C7C68', icone:'🏃' },
};

let PE_SLUG = null, PE_ICONE = '🔬', PE_NIV_SLUG = null;
let PESQUISAS_CACHE = [];
let PE_BUSCA = '';
let PE_FILTRO_TEMPO = 'todos';

function pesquisaTimeStats(p) {
  const levels = Array.isArray(p.niveis) ? p.niveis : [];
  const known = levels.filter(n => String(n.tempo || '').trim()).length;
  return { known, total:levels.length, complete:levels.length > 0 && known === levels.length };
}

async function carregarPesquisas() {
  document.getElementById('content').innerHTML = '<div class="loading"><span class="spinner"></span> Carregando pesquisas...</div>';
  try {
    const r = await fetch(`${API}/pesquisas`, { headers:{ Authorization:`Bearer ${TOKEN}` } });
    if (r.status === 401) { sair(); return; }
    const d = await r.json();
    PESQUISAS_CACHE = d.pesquisas || [];
    renderPesquisas(d);
  } catch(err) {
    document.getElementById('content').innerHTML = `<div class="loading" style="color:var(--red)">❌ Erro: ${esc(err.message)}</div>`;
  }
}

function renderPesquisas(d) {
  const total = d.total || 0;
  const levelStats = (d.pesquisas || []).reduce((acc,p) => {
    const stats = pesquisaTimeStats(p);
    acc.known += stats.known;
    acc.total += stats.total;
    if (!stats.complete) acc.incomplete += 1;
    return acc;
  }, { known:0, total:0, incomplete:0 });

  document.getElementById('content').innerHTML = `
    <div class="stats-row">
      <div class="stat-box"><div class="stat-val">${total}</div><div class="stat-lbl">Pesquisas</div></div>
      <div class="stat-box"><div class="stat-val">${levelStats.known}/${levelStats.total}</div><div class="stat-lbl">Tempos cadastrados</div></div>
      <div class="stat-box"><div class="stat-val" style="color:${levelStats.incomplete ? 'var(--red)' : 'var(--green)'}">${levelStats.incomplete}</div><div class="stat-lbl">Incompletas</div></div>
    </div>
    <div class="card">
      <div class="card-header">
        <h2>🔬 Pesquisas</h2>
        <button class="btn btn-gold btn-sm" onclick="abrirModalPesquisa()">+ Nova</button>
      </div>
      <div class="card-body" style="padding:10px">
        <div style="display:grid;gap:7px;margin-bottom:10px">
          <input id="pe-busca-admin" value="${esc(PE_BUSCA)}" placeholder="Buscar pesquisa…"
            oninput="PE_BUSCA=this.value;renderListaPesquisasAdmin()"
            style="width:100%;padding:8px 10px;border:1px solid rgba(127,113,81,.35);border-radius:6px;background:var(--bg);color:var(--dark);font:inherit">
          <div style="display:flex;gap:5px;flex-wrap:wrap">
            ${['todos','incompletas','completas'].map(id => `<button class="btn btn-sm ${PE_FILTRO_TEMPO===id?'btn-navy':'btn-ghost'}" onclick="PE_FILTRO_TEMPO='${id}';renderListaPesquisasAdmin()">${id==='todos'?'Todos':id==='incompletas'?'Incompletas':'Completas'}</button>`).join('')}
          </div>
        </div>
        <div id="pe-lista-admin"></div>
      </div>
    </div>`;
  renderListaPesquisasAdmin();
}

function renderListaPesquisasAdmin() {
  const holder = document.getElementById('pe-lista-admin');
  if (!holder) return;
  const term = PE_BUSCA.trim().toLowerCase();
  const lista = [...PESQUISAS_CACHE]
    .filter(p => {
      const stats = pesquisaTimeStats(p);
      if (PE_FILTRO_TEMPO === 'incompletas' && stats.complete) return false;
      if (PE_FILTRO_TEMPO === 'completas' && !stats.complete) return false;
      if (!term) return true;
      return [p.nome,p.categoria,p.slug].filter(Boolean).some(v => String(v).toLowerCase().includes(term));
    })
    .sort((a,b) => a.nome.localeCompare(b.nome));

  holder.innerHTML = lista.map(p => {
    const stats = pesquisaTimeStats(p);
    const statusColor = stats.complete ? 'var(--green)' : stats.known ? '#a2762f' : 'var(--red)';
    return `<div style="display:flex;align-items:center;gap:8px;padding:8px 10px;
              background:var(--card2);border:1px solid rgba(143,126,87,.2);
              border-radius:7px;margin-bottom:5px">
      <span style="font-size:1.3rem;flex-shrink:0">${esc(p.icone || '🔬')}</span>
      <div style="flex:1;min-width:0">
        <div style="font-size:0.8rem;font-weight:800;color:var(--dark);overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${esc(p.nome)}</div>
        <div style="font-size:0.6rem;font-weight:700;color:var(--muted)">${esc(p.categoria || '')} · Até Nv.${p.nivelMax}</div>
        <div style="font-size:0.6rem;font-weight:800;color:${statusColor};margin-top:2px">⏱ ${stats.known}/${stats.total} tempos cadastrados</div>
      </div>
      <div style="display:flex;gap:4px;flex-shrink:0;align-items:center">
        <button class="btn btn-ghost btn-sm" onclick="abrirNiveisPesquisa(fromStrArg('${strArg(p.slug)}'))" title="Cadastrar tempos">⏱ ${stats.known}/${stats.total}</button>
        <button class="btn btn-navy btn-sm" onclick="abrirModalPesquisa(fromStrArg('${strArg(p.slug)}'))" title="Editar">✏️</button>
        <button class="btn btn-red btn-sm" onclick="deletarPesquisa(fromStrArg('${strArg(p.slug)}'),fromStrArg('${strArg(p.nome)}'))" title="Excluir">🗑</button>
      </div>
    </div>`;
  }).join('') || '<p style="color:var(--muted);text-align:center;padding:20px">Nenhuma pesquisa corresponde ao filtro.</p>';
}

function abrirModalPesquisa(slug) {
  PE_SLUG = slug || null;
  document.getElementById('modal-pesquisa-titulo').textContent = slug ? '✏️ Editar Pesquisa' : '🔬 Nova Pesquisa';
  if (slug) {
    const p = PESQUISAS_CACHE.find(x=>x.slug===slug);
    document.getElementById('pe-slug-original').value = slug;
    document.getElementById('pe-slug').value = slug;
    document.getElementById('pe-slug').disabled = true;
    document.getElementById('pe-nome').value = p.nome || '';
    document.getElementById('pe-categoria').value = p.categoria || 'Produção';
    document.getElementById('pe-nivel-max').value = p.nivelMax || 10;
    document.getElementById('pe-ordem').value = p.ordem || 0;
    document.getElementById('pe-descricao').value = p.descricao || '';
    document.getElementById('pe-en-nome').value = p.i18n?.['en-US']?.nome || '';
    document.getElementById('pe-en-descricao').value = p.i18n?.['en-US']?.descricao || '';
    PE_ICONE = p.icone || '🔬';
  } else {
    document.getElementById('pe-slug-original').value = '';
    document.getElementById('pe-slug').value = '';
    document.getElementById('pe-slug').disabled = false;
    document.getElementById('pe-nome').value = '';
    document.getElementById('pe-categoria').value = 'Produção';
    document.getElementById('pe-nivel-max').value = 10;
    document.getElementById('pe-ordem').value = 0;
    document.getElementById('pe-descricao').value = '';
    document.getElementById('pe-en-nome').value = '';
    document.getElementById('pe-en-descricao').value = '';
    PE_ICONE = '🔬';
  }
  document.getElementById('emoji-preview-pe').textContent = PE_ICONE;
  document.getElementById('emoji-grid-pe').innerHTML = EMOJIS_PESQUISAS.map(e =>
    `<button type="button" class="emoji-btn ${e===PE_ICONE?'ativo':''}" onclick="selecionarEmojiPe('${e}')">${e}</button>`
  ).join('');
  abrirModal('modal-pesquisa');
}

function selecionarEmojiPe(e) {
  PE_ICONE = e;
  document.getElementById('emoji-preview-pe').textContent = e;
  document.querySelectorAll('#emoji-grid-pe .emoji-btn').forEach(b => b.classList.toggle('ativo', b.textContent===e));
}

async function salvarPesquisa() {
  const slug = document.getElementById('pe-slug').value.trim();
  const nome = document.getElementById('pe-nome').value.trim();
  const categoria = document.getElementById('pe-categoria').value;
  const nivelMax = parseInt(document.getElementById('pe-nivel-max').value,10);
  const ordem = parseInt(document.getElementById('pe-ordem').value,10)||0;
  const descricao = document.getElementById('pe-descricao').value.trim();
  const i18n = {'en-US':{
    nome:document.getElementById('pe-en-nome').value.trim(),
    descricao:document.getElementById('pe-en-descricao').value.trim(),
  }};
  if (!nome) return toast('Preencha o nome!','warn');
  if (!PE_SLUG && !slug) return toast('Preencha o slug!','warn');
  try {
    const body = { nome,icone:PE_ICONE,descricao,categoria,nivelMax,ordem,i18n };
    const r = await fetch(PE_SLUG ? `${API}/pesquisas/${PE_SLUG}/meta` : `${API}/pesquisas`,{
      method:PE_SLUG ? 'PUT' : 'POST',
      headers:{'Content-Type':'application/json',Authorization:`Bearer ${TOKEN}`},
      body:JSON.stringify(PE_SLUG ? body : { slug,...body }),
    });
    const d = await r.json();
    if (!r.ok) return toast(d.erro||'Erro ao salvar','erro');
    toast(PE_SLUG ? `"${nome}" atualizado!` : `"${nome}" criada!`,'ok');
    fecharModal('modal-pesquisa');
    carregarPesquisas();
  } catch(err) { toast('Erro: '+err.message,'erro'); }
}

function abrirNiveisPesquisa(slug) {
  PE_NIV_SLUG = slug;
  const p = PESQUISAS_CACHE.find(x=>x.slug===slug);
  if (!p) return;
  const stats = pesquisaTimeStats(p);
  document.getElementById('modal-niveis-pe-titulo').textContent = `⏱ ${p.nome} · ${stats.known}/${stats.total}`;

  document.getElementById('niveis-pesquisa-lista').innerHTML = (p.niveis||[]).map(nv => {
    const value = esc(String(nv.tempo || '').trim());
    return `<label style="display:grid;grid-template-columns:54px minmax(0,1fr);align-items:center;gap:8px;margin-bottom:7px;padding:8px 9px;border-radius:7px;background:var(--bg);border:1px solid rgba(143,126,87,.2)">
      <span style="font-size:.67rem;font-weight:900;color:var(--dark)">Nv. ${nv.nivel}</span>
      <input id="pe-tempo-${nv.nivel}" value="${value}" placeholder="ex: 4h 5m 47s"
        style="width:100%;min-width:0;padding:7px 8px;border:1px solid rgba(127,113,81,.35);border-radius:5px;background:var(--card);color:var(--dark);font:700 .72rem/1.2 monospace">
    </label>`;
  }).join('');
  abrirModal('modal-niveis-pesquisa');
}

function normalizarTempoAdmin(value) {
  const str = String(value || '').trim().toLowerCase().replace(/\s+/g,' ');
  if (!str || str === '0' || str === '0m' || str === '0s') return '';
  return str;
}

async function salvarNiveisPesquisa() {
  if (!PE_NIV_SLUG) return;
  const p = PESQUISAS_CACHE.find(x=>x.slug===PE_NIV_SLUG);
  if (!p) return;
  const niveis = (p.niveis||[]).map(nv => ({
    nivel:nv.nivel,
    tempo:normalizarTempoAdmin(document.getElementById(`pe-tempo-${nv.nivel}`)?.value),
  }));
  try {
    const r = await fetch(`${API}/pesquisas/${PE_NIV_SLUG}/niveis`,{
      method:'PUT',
      headers:{'Content-Type':'application/json',Authorization:`Bearer ${TOKEN}`},
      body:JSON.stringify({niveis}),
    });
    const d = await r.json();
    if (!r.ok) return toast(d.erro||'Erro ao salvar','erro');
    toast('Tempos salvos! Campos vazios continuam desconhecidos.','ok');
    fecharModal('modal-niveis-pesquisa');
    carregarPesquisas();
  } catch(err) { toast('Erro: '+err.message,'erro'); }
}

async function deletarPesquisa(slug, nome) {
  if (!confirm(`Excluir a pesquisa "${nome}"? Esta ação não pode ser desfeita.`)) return;
  try {
    const r = await fetch(`${API}/pesquisas/${slug}`,{ method:'DELETE', headers:{Authorization:`Bearer ${TOKEN}`} });
    const d = await r.json();
    if (!r.ok) return toast(d.erro||'Erro ao excluir','erro');
    toast(`"${nome}" excluída.`,'ok');
    carregarPesquisas();
  } catch(err) { toast('Erro: '+err.message,'erro'); }
}
