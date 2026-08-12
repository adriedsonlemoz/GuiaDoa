// ── PESQUISAS ────────────────────────────────────────────────────────────────
const EMOJIS_PESQUISAS = [
  '🔬','⚔️','🛡️','❤️','👁️','⚡','🗺️','💥','🏹','🌾',
  '🪵','🪨','⚙️','🔩','🔨','🔮','🏃','🎯','💊','🐉',
  '🧲','🦅','📚','🔭','🧪','🏛️','🧬','🔑','🌟','💎',
];

const CATEGORIAS_PE_META = {
  'Corpo a Corpo':          { cor:'#C85C5C', icone:'⚔️'  },
  'Ataque à Distância':     { cor:'#5C7FA3', icone:'🏹'  },
  'Produção':               { cor:'#5A8A5C', icone:'🌾'  },
  'Movimento e Construção': { cor:'#8B6BAE', icone:'🏃'  },
};

let PE_SLUG = null, PE_ICONE = '🔬', PE_NIV_SLUG = null;
let PESQUISAS_CACHE = [];

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
  const total    = d.total || 0;
  const comTempo = (d.pesquisas||[]).filter(p => p.niveis && p.niveis.some(n => n.tempo && n.tempo.trim())).length;
  const semTempo = total - comTempo;

  const lista = [...(d.pesquisas||[])].sort((a,b) => a.nome.localeCompare(b.nome));

  const listaHtml = lista.map(p => {
    const comT   = p.niveis && p.niveis.some(n => n.tempo && n.tempo.trim());
    const nomeEsc = esc(p.nome);
    return `<div style="display:flex;align-items:center;gap:8px;padding:8px 10px;
              background:var(--card2);border:1px solid rgba(200,168,74,0.2);
              border-radius:8px;margin-bottom:4px">
      <span style="font-size:1.3rem;flex-shrink:0">${esc(p.icone)}</span>
      <div style="flex:1;min-width:0">
        <div style="font-size:0.8rem;font-weight:800;color:var(--dark);
                    overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${esc(p.nome)}</div>
        <div style="font-size:0.6rem;font-weight:700;color:var(--muted)">
          Até Nv.${p.nivelMax}&nbsp;·&nbsp;${comT
            ? '<span style=color:var(--green)>✓ com tempos</span>'
            : '<span style=color:var(--red)>sem tempos</span>'}
        </div>
      </div>
      <div style="display:flex;gap:4px;flex-shrink:0">
        <button class="btn btn-ghost btn-sm" onclick="abrirNiveisPesquisa(fromStrArg('${strArg(p.slug)}'))" title="Editar tempos">⏱</button>
        <button class="btn btn-navy btn-sm" onclick="abrirModalPesquisa(fromStrArg('${strArg(p.slug)}'))" title="Editar">✏️</button>
        <button class="btn btn-red btn-sm" onclick="deletarPesquisa(fromStrArg('${strArg(p.slug)}'),fromStrArg('${strArg(p.nome)}'))" title="Excluir">🗑</button>
      </div>
    </div>`;
  }).join('');

  document.getElementById('content').innerHTML = `
    <div class="stats-row">
      <div class="stat-box"><div class="stat-val">${total}</div><div class="stat-lbl">Total</div></div>
      <div class="stat-box"><div class="stat-val">${comTempo}</div><div class="stat-lbl">Com Tempos</div></div>
      <div class="stat-box"><div class="stat-val" style="color:var(--red)">${semTempo}</div><div class="stat-lbl">Sem Tempos</div></div>
    </div>
    <div class="card">
      <div class="card-header">
        <h2>🔬 Pesquisas</h2>
        <div style="display:flex;gap:8px;flex-wrap:wrap">
          <button class="btn btn-gold btn-sm" onclick="abrirModalPesquisa()">+ Nova</button>
        </div>
      </div>
      <div class="card-body" style="padding:10px">
        ${listaHtml || '<p style=color:var(--muted);text-align:center;padding:20px>Nenhuma pesquisa no MongoDB. Verifique a migração ou use + Nova.</p>'}
      </div>
    </div>`;
}

function abrirModalPesquisa(slug) {
  PE_SLUG = slug || null;
  document.getElementById('modal-pesquisa-titulo').textContent = slug ? '✏️ Editar Pesquisa' : '🔬 Nova Pesquisa';
  if (slug) {
    const p = PESQUISAS_CACHE.find(x=>x.slug===slug);
    document.getElementById('pe-slug-original').value = slug;
    document.getElementById('pe-slug').value          = slug;
    document.getElementById('pe-slug').disabled       = true;
    document.getElementById('pe-nome').value          = p.nome || '';
    document.getElementById('pe-categoria').value     = p.categoria || 'Corpo a Corpo';
    document.getElementById('pe-nivel-max').value     = p.nivelMax || 10;
    document.getElementById('pe-ordem').value         = p.ordem || 0;
    document.getElementById('pe-descricao').value     = p.descricao || '';
    PE_ICONE = p.icone || '🔬';
  } else {
    document.getElementById('pe-slug-original').value = '';
    document.getElementById('pe-slug').value          = '';
    document.getElementById('pe-slug').disabled       = false;
    document.getElementById('pe-nome').value          = '';
    document.getElementById('pe-categoria').value     = 'Corpo a Corpo';
    document.getElementById('pe-nivel-max').value     = 10;
    document.getElementById('pe-ordem').value         = 0;
    document.getElementById('pe-descricao').value     = '';
    PE_ICONE = '🔬';
  }
  document.getElementById('emoji-preview-pe').textContent = PE_ICONE;
  const grid = document.getElementById('emoji-grid-pe');
  grid.innerHTML = EMOJIS_PESQUISAS.map(e =>
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
  const slug      = document.getElementById('pe-slug').value.trim();
  const nome      = document.getElementById('pe-nome').value.trim();
  const nivelMax  = parseInt(document.getElementById('pe-nivel-max').value,10);
  const ordem     = parseInt(document.getElementById('pe-ordem').value,10)||0;
  const descricao = document.getElementById('pe-descricao').value.trim();
  if (!nome) return toast('Preencha o nome!','warn');
  if (!PE_SLUG && !slug) return toast('Preencha o slug!','warn');
  try {
    let r;
    if (PE_SLUG) {
      r = await fetch(`${API}/pesquisas/${PE_SLUG}/meta`,{
        method:'PUT',
        headers:{'Content-Type':'application/json',Authorization:`Bearer ${TOKEN}`},
        body:JSON.stringify({nome,icone:PE_ICONE,descricao,nivelMax,ordem}),
      });
    } else {
      r = await fetch(`${API}/pesquisas`,{
        method:'POST',
        headers:{'Content-Type':'application/json',Authorization:`Bearer ${TOKEN}`},
        body:JSON.stringify({slug,nome,icone:PE_ICONE,descricao,nivelMax,ordem}),
      });
    }
    const d = await r.json();
    if (!r.ok) return toast(d.erro||'Erro ao salvar','erro');
    toast(PE_SLUG ? `"${nome}" atualizado!` : `"${nome}" criada!`,'ok');
    fecharModal('modal-pesquisa');
    carregarPesquisas();
  } catch(err) { toast('Erro: '+err.message,'erro'); }
}

// ── Helpers de tempo ─────────────────────────────────────────────────────────
// "2d 4h 30m"  →  { d:2, h:4, m:30 }
function parseTempo(str) {
  if (!str || !str.trim()) return { d:0, h:0, m:0 };
  const d = (str.match(/(\d+)\s*d/) || [,0])[1];
  const h = (str.match(/(\d+)\s*h/) || [,0])[1];
  const m = (str.match(/(\d+)\s*m/) || [,0])[1];
  return { d: parseInt(d)||0, h: parseInt(h)||0, m: parseInt(m)||0 };
}
// { d:2, h:4, m:30 }  →  "2d 4h 30m"  (omite zeros)
function fmtTempoParts(d, h, m) {
  const parts = [];
  if (d > 0) parts.push(`${d}d`);
  if (h > 0) parts.push(`${h}h`);
  if (m > 0) parts.push(`${m}m`);
  return parts.join(' ') || '0m';
}
// Atualiza o preview ao lado do spinner
function atualizarPreviewTempo(nivel) {
  const d = parseInt(document.getElementById(`pe-d-${nivel}`).value)||0;
  const h = parseInt(document.getElementById(`pe-h-${nivel}`).value)||0;
  const m = parseInt(document.getElementById(`pe-m-${nivel}`).value)||0;
  document.getElementById(`pe-prev-${nivel}`).textContent = fmtTempoParts(d,h,m);
}
// Spin up/down com limites
function spinTempo(nivel, campo, delta) {
  const el  = document.getElementById(`pe-${campo}-${nivel}`);
  const max = campo === 'd' ? 365 : campo === 'h' ? 23 : 59;
  el.value  = Math.min(max, Math.max(0, (parseInt(el.value)||0) + delta));
  atualizarPreviewTempo(nivel);
}

// Estilo dos botões spinner (reutilizado inline)
const SPIN_BTN = `cursor:pointer;width:24px;height:24px;border-radius:5px;border:1px solid rgba(200,168,74,0.3);
  background:rgba(200,168,74,0.08);color:var(--dark);font-size:0.9rem;font-weight:900;
  display:flex;align-items:center;justify-content:center;flex-shrink:0;user-select:none;padding:0`;

function abrirNiveisPesquisa(slug) {
  PE_NIV_SLUG = slug;
  const p = PESQUISAS_CACHE.find(x=>x.slug===slug);
  if (!p) return;
  document.getElementById('modal-niveis-pe-titulo').textContent = `⏱ ${p.nome}`;

  const lista = document.getElementById('niveis-pesquisa-lista');
  lista.innerHTML = (p.niveis||[]).map(nv => {
    const { d, h, m } = parseTempo(nv.tempo);
    const prev = fmtTempoParts(d, h, m);
    return `
    <div style="margin-bottom:10px;padding:10px 12px;border-radius:10px;
                background:var(--bg);border:1px solid rgba(200,168,74,0.2)">

      <!-- Linha superior: badge nível + preview -->
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px">
        <div style="width:28px;height:28px;background:rgba(200,168,74,0.15);
                    border:1px solid rgba(200,168,74,0.3);border-radius:7px;
                    display:flex;align-items:center;justify-content:center;
                    font-size:0.72rem;font-weight:900;color:var(--gold3)">${nv.nivel}</div>
        <span id="pe-prev-${nv.nivel}"
          style="font-family:monospace;font-size:0.9rem;font-weight:900;
                 color:var(--navy);letter-spacing:1px">${prev}</span>
      </div>

      <!-- Spinners: Dias / Horas / Minutos -->
      <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:7px">

        <!-- DIAS -->
        <div style="text-align:center">
          <div style="font-size:0.58rem;font-weight:800;color:var(--muted);
                      letter-spacing:1px;margin-bottom:4px">DIAS</div>
          <div style="display:flex;align-items:center;gap:3px;justify-content:center">
            <button style="${SPIN_BTN}" onclick="spinTempo(${nv.nivel},'d',-1)">−</button>
            <input id="pe-d-${nv.nivel}" type="number" min="0" max="365" value="${d}"
              oninput="atualizarPreviewTempo(${nv.nivel})"
              style="width:36px;text-align:center;font-size:0.9rem;font-weight:900;
                     padding:3px 2px;border-radius:6px">
            <button style="${SPIN_BTN}" onclick="spinTempo(${nv.nivel},'d',1)">+</button>
          </div>
        </div>

        <!-- HORAS -->
        <div style="text-align:center">
          <div style="font-size:0.58rem;font-weight:800;color:var(--muted);
                      letter-spacing:1px;margin-bottom:4px">HORAS</div>
          <div style="display:flex;align-items:center;gap:3px;justify-content:center">
            <button style="${SPIN_BTN}" onclick="spinTempo(${nv.nivel},'h',-1)">−</button>
            <input id="pe-h-${nv.nivel}" type="number" min="0" max="23" value="${h}"
              oninput="atualizarPreviewTempo(${nv.nivel})"
              style="width:36px;text-align:center;font-size:0.9rem;font-weight:900;
                     padding:3px 2px;border-radius:6px">
            <button style="${SPIN_BTN}" onclick="spinTempo(${nv.nivel},'h',1)">+</button>
          </div>
        </div>

        <!-- MINUTOS -->
        <div style="text-align:center">
          <div style="font-size:0.58rem;font-weight:800;color:var(--muted);
                      letter-spacing:1px;margin-bottom:4px">MIN</div>
          <div style="display:flex;align-items:center;gap:3px;justify-content:center">
            <button style="${SPIN_BTN}" onclick="spinTempo(${nv.nivel},'m',-5)">−</button>
            <input id="pe-m-${nv.nivel}" type="number" min="0" max="59" value="${m}"
              oninput="atualizarPreviewTempo(${nv.nivel})"
              style="width:36px;text-align:center;font-size:0.9rem;font-weight:900;
                     padding:3px 2px;border-radius:6px">
            <button style="${SPIN_BTN}" onclick="spinTempo(${nv.nivel},'m',5)">+</button>
          </div>
        </div>

      </div><!-- /grid spinners -->
    </div>`;
  }).join('');

  abrirModal('modal-niveis-pesquisa');
}

async function salvarNiveisPesquisa() {
  if (!PE_NIV_SLUG) return;
  const p = PESQUISAS_CACHE.find(x=>x.slug===PE_NIV_SLUG);
  if (!p) return;
  const niveis = (p.niveis||[]).map(nv => {
    const d = parseInt(document.getElementById(`pe-d-${nv.nivel}`)?.value)||0;
    const h = parseInt(document.getElementById(`pe-h-${nv.nivel}`)?.value)||0;
    const m = parseInt(document.getElementById(`pe-m-${nv.nivel}`)?.value)||0;
    return { nivel: nv.nivel, tempo: fmtTempoParts(d, h, m) };
  });
  try {
    const r = await fetch(`${API}/pesquisas/${PE_NIV_SLUG}/niveis`,{
      method:'PUT',
      headers:{'Content-Type':'application/json',Authorization:`Bearer ${TOKEN}`},
      body:JSON.stringify({niveis}),
    });
    const d = await r.json();
    if (!r.ok) return toast(d.erro||'Erro ao salvar','erro');
    toast('Tempos salvos!','ok');
    fecharModal('modal-niveis-pesquisa');
    carregarPesquisas();
  } catch(err) { toast('Erro: '+err.message,'erro'); }
}

async function deletarPesquisa(slug, nome) {
  if (!confirm(`Excluir a pesquisa "${nome}"? Esta ação não pode ser desfeita.`)) return;
  try {
    const r = await fetch(`${API}/pesquisas/${slug}`,{
      method:'DELETE',
      headers:{Authorization:`Bearer ${TOKEN}`},
    });
    const d = await r.json();
    if (!r.ok) return toast(d.erro||'Erro ao excluir','erro');
    toast(`"${nome}" excluída.`,'ok');
    carregarPesquisas();
  } catch(err) { toast('Erro: '+err.message,'erro'); }
}

