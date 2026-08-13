let NIVEIS_ADMIN_CACHE = [];
let NIVEIS_ADMIN_FILTRO = 'todos';
let NIVEIS_ADMIN_BUSCA = '';

async function carregarNiveis() {
  document.getElementById('content').innerHTML = '<div class="loading"><span class="spinner"></span> Carregando níveis...</div>';
  try {
    const r = await fetch(`${API}/niveis?pagina=1&limite=200`, { headers:{ Authorization:`Bearer ${TOKEN}` } });
    const d = await r.json();
    if (!r.ok) throw new Error(d.erro);
    NIVEIS_ADMIN_CACHE = d.niveis || [];
    renderNiveisAdmin();
  } catch (err) {
    document.getElementById('content').innerHTML = `<div class="alert-erro">Erro: ${esc(err.message)}</div>`;
  }
}

function listaNiveisAdmin() {
  return NIVEIS_ADMIN_CACHE.filter(n => {
    const tem = n.poderNecessario != null;
    if (NIVEIS_ADMIN_FILTRO === 'faltando' && tem) return false;
    if (NIVEIS_ADMIN_FILTRO === 'preenchidos' && !tem) return false;
    if (NIVEIS_ADMIN_BUSCA && !String(n.nivel).includes(NIVEIS_ADMIN_BUSCA)) return false;
    return true;
  });
}

function renderNiveisAdmin() {
  const total = NIVEIS_ADMIN_CACHE.length;
  const conhecidos = NIVEIS_ADMIN_CACHE.filter(n => n.poderNecessario != null).length;
  const faltando = total - conhecidos;
  const lista = listaNiveisAdmin();
  setBreadcrumb([{ label:'Início', fn:'irHome()' }, { label:'🏰 Níveis', atual:true }]);

  document.getElementById('content').innerHTML = `
    <div class="stats-row">
      <div class="stat-box"><div class="stat-val">${total}</div><div class="stat-lbl">Total</div></div>
      <div class="stat-box"><div class="stat-val">${conhecidos}/${total}</div><div class="stat-lbl">Poderes cadastrados</div></div>
      <div class="stat-box"><div class="stat-val">${faltando}</div><div class="stat-lbl">Faltando</div></div>
    </div>
    <div class="card">
      <div class="card-header" style="gap:8px;flex-wrap:wrap">
        <h2>🏰 Poder por Nível</h2>
        <div style="display:flex;gap:6px;flex-wrap:wrap">
          <button class="btn btn-gold btn-sm" onclick="salvarPoderesNiveis()">💾 Salvar alterações</button>
          <button class="btn btn-navy btn-sm" onclick="abrirModalNovoNivel()">＋ Novo</button>
        </div>
      </div>
      <div class="card-body" style="padding:10px 12px">
        <div style="display:flex;gap:6px;flex-wrap:wrap;align-items:center">
          ${['todos','faltando','preenchidos'].map(f => `<button class="btn btn-sm ${NIVEIS_ADMIN_FILTRO===f?'btn-gold':'btn-ghost'}" onclick="filtrarNiveisAdmin('${f}')">${f==='todos'?'Todos':f==='faltando'?'Faltando':'Preenchidos'}</button>`).join('')}
          <input style="margin-left:auto;max-width:150px" placeholder="Buscar nível…" value="${esc(NIVEIS_ADMIN_BUSCA)}" oninput="buscarNivelAdmin(this.value)">
        </div>
        <p style="margin:8px 0 0;color:var(--muted);font-size:.76rem">Edite os valores diretamente. Campos vazios continuam como desconhecidos.</p>
      </div>
      <div class="card-body" style="padding:0">
        <div class="tabela-wrap"><table class="tabela tabela-niveis">
          <thead><tr><th style="width:90px">NÍVEL</th><th>PODER NECESSÁRIO</th><th style="width:90px;text-align:center">EDITAR</th></tr></thead>
          <tbody>${lista.map(n => `<tr data-level="${Number(n.nivel)||0}">
            <td><span class="badge-nivel">Nv ${n.nivel}</span></td>
            <td><input class="nivel-power-input" data-id="${esc(n._id)}" data-nivel="${Number(n.nivel)||0}" data-original="${n.poderNecessario ?? ''}" type="number" min="0" value="${n.poderNecessario ?? ''}" placeholder="desconhecido" style="width:100%;min-width:145px;font-family:monospace;font-weight:700"></td>
            <td style="text-align:center"><button class="btn btn-navy btn-sm" onclick="editarNivel(fromDataArg('${dataArg(n)}'))">✏</button></td>
          </tr>`).join('') || '<tr><td colspan="3" style="text-align:center;padding:22px;color:var(--muted)">Nenhum nível neste filtro.</td></tr>'}</tbody>
        </table></div>
      </div>
    </div>
    <details class="card" style="margin-top:10px">
      <summary style="padding:12px;cursor:pointer;font-weight:800">📋 Importar vários valores</summary>
      <div class="card-body" style="padding-top:0">
        <p style="color:var(--muted);font-size:.76rem">Uma linha por nível. Ex.: <code>30 2205066</code></p>
        <textarea id="niveis-import-text" rows="5" placeholder="30 2205066\n31 2760178\n32 3454067"></textarea>
        <button class="btn btn-gold btn-sm" style="margin-top:8px" onclick="importarPoderesNiveis()">Importar valores</button>
      </div>
    </details>`;
}

function filtrarNiveisAdmin(tipo) { NIVEIS_ADMIN_FILTRO = tipo; renderNiveisAdmin(); }
function buscarNivelAdmin(valor) {
  NIVEIS_ADMIN_BUSCA = String(valor||'').replace(/\D/g,'');
  document.querySelectorAll('tr[data-level]').forEach(row => {
    row.style.display = !NIVEIS_ADMIN_BUSCA || row.dataset.level.includes(NIVEIS_ADMIN_BUSCA) ? '' : 'none';
  });
}

async function salvarPoderesNiveis() {
  const inputs = [...document.querySelectorAll('.nivel-power-input')];
  const niveis = inputs.filter(input => input.value !== input.dataset.original).map(input => ({
    nivel:Number(input.dataset.nivel), poderNecessario:input.value.trim()==='' ? null : Number(input.value),
  }));
  if (!niveis.length) return toast('Nenhuma alteração para salvar.', 'warn');
  try {
    const r = await fetch(`${API}/niveis/lote`, { method:'POST', headers:{ 'Content-Type':'application/json', Authorization:`Bearer ${TOKEN}` }, body:JSON.stringify({ niveis }) });
    const d = await r.json();
    if (!r.ok) throw new Error(d.erro || 'Erro ao salvar');
    toast(`${d.atualizados} nível(is) atualizado(s)!`, 'ok');
    carregarNiveis();
  } catch (e) { toast(e.message, 'erro'); }
}

async function importarPoderesNiveis() {
  const raw = document.getElementById('niveis-import-text')?.value || '';
  const niveis = raw.split(/\n+/).map(line => {
    const match = line.trim().match(/^(\d+)\D+(.+)$/);
    if (!match) return null;
    const poder = Number(String(match[2]).replace(/\D/g,''));
    return poder > 0 ? { nivel:Number(match[1]), poderNecessario:poder } : null;
  }).filter(Boolean);
  if (!niveis.length) return toast('Nenhum valor válido encontrado.', 'warn');
  try {
    const r = await fetch(`${API}/niveis/lote`, { method:'POST', headers:{ 'Content-Type':'application/json', Authorization:`Bearer ${TOKEN}` }, body:JSON.stringify({ niveis }) });
    const d = await r.json();
    if (!r.ok) throw new Error(d.erro || 'Erro ao importar');
    toast(`${d.atualizados} nível(is) importado(s)!`, 'ok');
    carregarNiveis();
  } catch (e) { toast(e.message, 'erro'); }
}

function abrirModalNovoNivel() {
  EDITANDO_NIVEL_ID = null;
  document.getElementById('modal-nivel-titulo').textContent = '✦ Novo Nível';
  document.getElementById('fn-nivel').value = '';
  document.getElementById('fn-poder').value = '';
  abrirModal('modal-nivel');
}
function editarNivel(n) {
  EDITANDO_NIVEL_ID = n._id;
  document.getElementById('modal-nivel-titulo').textContent = `✏ Editar: Nível ${n.nivel}`;
  document.getElementById('fn-nivel').value = n.nivel;
  document.getElementById('fn-poder').value = n.poderNecessario ?? '';
  abrirModal('modal-nivel');
}
async function salvarNivel() {
  const nivel = parseInt(document.getElementById('fn-nivel').value,10);
  const value = document.getElementById('fn-poder').value.trim();
  if (!nivel || nivel < 1) return toast('Preencha o número do nível!', 'warn');
  const body = { nivel, poderNecessario:value==='' ? null : Number(value) };
  try {
    const url = EDITANDO_NIVEL_ID ? `${API}/niveis/${EDITANDO_NIVEL_ID}` : `${API}/niveis`;
    const r = await fetch(url, { method:EDITANDO_NIVEL_ID?'PUT':'POST', headers:{ 'Content-Type':'application/json', Authorization:`Bearer ${TOKEN}` }, body:JSON.stringify(body) });
    const d = await r.json();
    if (!r.ok) throw new Error(d.erro || 'Erro ao salvar');
    fecharModal('modal-nivel'); toast(`Nível ${d.nivel} salvo!`, 'ok'); carregarNiveis();
  } catch (e) { toast(e.message, 'erro'); }
}
function confirmarRemoverNivel(id, num) {
  document.getElementById('confirm-msg').textContent = `Remover Nível ${num} permanentemente?`;
  document.getElementById('confirm-ok').onclick = async () => {
    const r = await fetch(`${API}/niveis/${id}`, { method:'DELETE', headers:{ Authorization:`Bearer ${TOKEN}` } });
    const d = await r.json(); fecharModal('confirm-modal');
    if (!r.ok) return toast(d.erro || 'Erro', 'erro');
    toast(d.mensagem, 'ok'); carregarNiveis();
  };
  abrirModal('confirm-modal');
}
