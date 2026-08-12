async function carregarNiveis() {
  document.getElementById('content').innerHTML = '<div class="loading"><span class="spinner"></span> Carregando níveis...</div>';
  try {
    const qs = new URLSearchParams({ pagina: PAGINAN, limite: 60 });
    const r  = await fetch(`${API}/niveis?${qs}`, { headers: { Authorization: `Bearer ${TOKEN}` } });
    const d  = await r.json();
    if (!r.ok) throw new Error(d.erro);
    TOTAL_PAG_N = d.paginas || 1;
    renderNiveis(d);
  } catch (err) {
    document.getElementById('content').innerHTML = `<div class="alert-erro">Erro: ${esc(err.message)}</div>`;
  }
}

function renderNiveis(d) {
  const total     = d.total || 0;
  const conhecidos = d.niveis.filter(n => n.xp != null).length;
  const desconhecidos = total - conhecidos;

  setBreadcrumb([
    { label:'Início', fn:'irHome()' },
    { label:'🏰 Níveis', atual: true },
  ]);

  document.getElementById('content').innerHTML = `
    <div class="stats-row">
      <div class="stat-box"><div class="stat-val">${total}</div><div class="stat-lbl">Total</div></div>
      <div class="stat-box"><div class="stat-val">${conhecidos}</div><div class="stat-lbl">Com XP</div></div>
      <div class="stat-box"><div class="stat-val">${desconhecidos}</div><div class="stat-lbl">Desconhecidos</div></div>
    </div>

    <div class="card">
      <div class="card-header">
        <h2>🏰 Níveis</h2>
        <div style="display:flex;gap:6px;flex-wrap:wrap">
          <button class="btn btn-gold btn-sm" onclick="abrirModalNovoNivel()">＋ Novo Nível</button>
        </div>
      </div>
      <div class="card-body" style="padding:0">
        <div class="tabela-wrap">
          <table class="tabela tabela-niveis">
            <thead>
              <tr>
                <th style="width:80px">NÍVEL</th>
                <th>XP NECESSÁRIO</th>
                <th style="width:160px;text-align:center">AÇÕES</th>
              </tr>
            </thead>
            <tbody>
              ${d.niveis.map(n => `
                <tr style="${n.xp == null ? 'opacity:0.65' : ''}">
                  <td><span class="badge-nivel">Nv ${n.nivel}</span></td>
                  <td style="font-family:monospace;font-weight:700;color:${n.xp != null ? 'var(--gold3)' : 'var(--muted)'}">
                    ${n.xp != null ? fmtXP(n.xp) : '<em>desconhecido</em>'}
                  </td>
                  <td style="text-align:center;white-space:nowrap">
                    <button class="btn btn-navy btn-sm btn-acao" onclick="editarNivel(fromDataArg('${dataArg(n)}'))">✏ Editar</button>
                    <button class="btn btn-red btn-sm btn-acao" onclick="confirmarRemoverNivel(fromStrArg('${strArg(n._id)}'),${Number(n.nivel)||0})">🗑 Excluir</button>
                  </td>
                </tr>`).join('')}
              ${d.niveis.length === 0 ? '<tr><td colspan="3" style="text-align:center;padding:24px;color:var(--muted)">Nenhum nível cadastrado no MongoDB. Verifique o diagnóstico da migração ou crie um nível manualmente.</td></tr>' : ''}
            </tbody>
          </table>
        </div>
      </div>
    </div>
    ${renderPaginacaoN(d.pagina, TOTAL_PAG_N)}
  `;
}

function renderPaginacaoN(atual, total) {
  if (total <= 1) return '';
  let html = '<div class="paginacao">';
  html += `<button class="btn btn-ghost btn-sm" onclick="irPaginaN(${atual-1})" ${atual<=1?'disabled':''}>‹ Ant</button>`;
  for (let i = Math.max(1, atual-2); i <= Math.min(total, atual+2); i++) {
    html += `<button class="btn btn-sm ${i===atual?'btn-gold':'btn-ghost'}" onclick="irPaginaN(${i})">${i}</button>`;
  }
  html += `<button class="btn btn-ghost btn-sm" onclick="irPaginaN(${atual+1})" ${atual>=total?'disabled':''}>Próx ›</button>`;
  html += '</div>';
  return html;
}
function irPaginaN(n) { if (n < 1 || n > TOTAL_PAG_N) return; PAGINAN = n; carregarNiveis(); }

// ── Modal Criar / Editar ──────────────────────────────────────────────────────
function abrirModalNovoNivel() {
  EDITANDO_NIVEL_ID = null;
  document.getElementById('modal-nivel-titulo').textContent = '✦ Novo Nível';
  document.getElementById('fn-nivel').value = '';
  document.getElementById('fn-xp').value   = '';
  abrirModal('modal-nivel');
}

function editarNivel(n) {
  EDITANDO_NIVEL_ID = n._id;
  document.getElementById('modal-nivel-titulo').textContent = `✏ Editar: Nível ${n.nivel}`;
  document.getElementById('fn-nivel').value = n.nivel;
  document.getElementById('fn-xp').value   = n.xp != null ? n.xp : '';
  abrirModal('modal-nivel');
}

async function salvarNivel() {
  const nivel = parseInt(document.getElementById('fn-nivel').value);
  const xpVal  = document.getElementById('fn-xp').value.trim();
  const xp     = xpVal !== '' ? parseInt(xpVal) : null;

  if (!nivel || nivel < 1) return toast('Preencha o número do nível!', 'warn');

  const body = { nivel, xp };
  try {
    const url    = EDITANDO_NIVEL_ID ? `${API}/niveis/${EDITANDO_NIVEL_ID}` : `${API}/niveis`;
    const method = EDITANDO_NIVEL_ID ? 'PUT' : 'POST';
    const r = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${TOKEN}` },
      body: JSON.stringify(body),
    });
    const d = await r.json();
    if (!r.ok) return toast(d.erro || 'Erro ao salvar', 'erro');
    fecharModal('modal-nivel');
    toast(EDITANDO_NIVEL_ID ? `Nível ${d.nivel} atualizado!` : `Nível ${d.nivel} criado!`, 'ok');
    carregarNiveis();
  } catch (e) { toast('Erro de rede: ' + e.message, 'erro'); }
}

function confirmarRemoverNivel(id, num) {
  document.getElementById('confirm-msg').textContent = `Remover Nível ${num} permanentemente?`;
  document.getElementById('confirm-ok').onclick = async () => {
    const r = await fetch(`${API}/niveis/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${TOKEN}` } });
    const d = await r.json();
    fecharModal('confirm-modal');
    if (!r.ok) return toast(d.erro || 'Erro', 'erro');
    toast(d.mensagem, 'ok');
    carregarNiveis();
  };
  abrirModal('confirm-modal');
}
