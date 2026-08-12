// ── Navegação ────────────────────────────────────────────────────────────────
function irHome() {
  setBreadcrumb([]);
  renderHome();
}

function irModulo(id) {
  const mod = MODULOS.find(m=>m.id===id);
  if (!mod || !mod.ativo) return;
  setBreadcrumb([{ label: `${mod.icon} ${mod.label}`, action: ()=>irModulo(id) }]);
  if (id === 'tropas') { PAGINA=1; carregarTropas(); }
  if (id === 'niveis') { PAGINAN=1; carregarNiveis(); }
  if (id === 'itens')     { carregarItens(); }
  if (id === 'edificios') { carregarEdificios(); }
  if (id === 'dragoes')   { carregarDragoes(); }
  if (id === 'pesquisas') { carregarPesquisas(); }
  if (id === 'reinos')    { carregarReinos(); }
  if (id === 'dicas')     { carregarDicas(); }
}

function setBreadcrumb(items) {
  const bc = document.getElementById('breadcrumb');
  let html = `<span class="breadcrumb-item" onclick="irHome()">🏠 Início</span>`;
  items.forEach((item, i) => {
    html += `<span class="breadcrumb-sep">›</span>`;
    if (i === items.length - 1) {
      html += `<span class="breadcrumb-current">${esc(item.label)}</span>`;
    } else {
      html += `<span class="breadcrumb-item" onclick="(${item.action})()">${esc(item.label)}</span>`;
    }
  });
  bc.innerHTML = html;
}

// ── HOME ─────────────────────────────────────────────────────────────────────
function renderHome() {
  document.getElementById('content').innerHTML = `
    <div style="margin-bottom:16px">
      <p style="font-size:0.65rem;font-weight:900;letter-spacing:2.5px;color:var(--muted);text-transform:uppercase;margin-bottom:4px">Bem-vindo ao painel</p>
      <p style="font-size:1rem;font-weight:900;color:var(--dark)">O que deseja gerir hoje?</p>
    </div>

    <div style="height:1px;background:linear-gradient(90deg,transparent,var(--gold),transparent);opacity:0.3;margin-bottom:16px"></div>

    <div class="modulos-grid">
      ${MODULOS.map(m => `
        <div class="modulo-card ${m.ativo?'':'em-breve'}" onclick="${m.ativo ? `irModulo('${m.id}')` : ''}">
          ${m.badge ? `<span class="modulo-badge badge-${m.badge}">${m.badge==='novo'?'NOVO':'EM BREVE'}</span>` : ''}
          <div class="modulo-icon">${m.icon}</div>
          <div class="modulo-label">${m.label}</div>
          <div class="modulo-desc">${m.desc}</div>
        </div>
      `).join('')}
    </div>

    <div style="margin-top:20px">
      <div style="height:1px;background:linear-gradient(90deg,transparent,var(--gold),transparent);opacity:0.2;margin-bottom:12px"></div>
      <p style="font-size:0.62rem;font-weight:800;letter-spacing:2px;color:var(--muted);text-transform:uppercase;margin-bottom:8px">Acesso rápido</p>
      <a href="/" target="_blank" class="projeto-link">
        <span style="font-size:1.2rem">🌐</span>
        <div>
          <div>Ver o Projeto</div>
          <div style="font-size:0.62rem;font-weight:600;color:var(--muted)">Abre o Guia DOA numa nova aba</div>
        </div>
        <span style="margin-left:auto;color:var(--muted);font-size:0.8rem">↗</span>
      </a>
    </div>
  `;
}

function setLoading(msg = 'Carregando…') {
  document.getElementById('content').innerHTML = `<div class="loading"><span class="spinner"></span> ${esc(msg)}</div>`;
}

// ── Utils ─────────────────────────────────────────────────────────────────────
function abrirModal(id){document.getElementById(id).classList.add('aberto');}
function fecharModal(id){document.getElementById(id).classList.remove('aberto');}

let _tt;
function toast(msg,tipo='ok'){
  const el=document.getElementById('toast');
  el.textContent=msg;
  el.style.background=tipo==='ok'?'#5A8A5C':tipo==='warn'?'#C87A2C':'#A83C2C';
  el.style.display='block';
  clearTimeout(_tt);_tt=setTimeout(()=>el.style.display='none',3000);
}

// Inicialização após DOM completo
document.addEventListener('DOMContentLoaded', () => {
  // Fechar modais ao clicar fora (todos os modais, incluindo os inseridos depois do script)
  document.querySelectorAll('.modal-bg').forEach(el =>
    el.addEventListener('click', e => { if (e.target === el) el.classList.remove('aberto'); })
  );

  // Enter no campo senha faz login
  const passEl = document.getElementById('login-pass');
  if (passEl) passEl.addEventListener('keydown', e => { if (e.key === 'Enter') fazerLogin(); });

  // Enter no campo usuário também
  const userEl = document.getElementById('login-user');
  if (userEl) userEl.addEventListener('keydown', e => { if (e.key === 'Enter') fazerLogin(); });

  // Teste de conectividade da API
  const statusEl = document.getElementById('api-status');
  fetch(`${API}/auth/verificar`, { headers: { Authorization: 'Bearer teste' } })
    .then(r => {
      if (statusEl) statusEl.innerHTML = `<span style="color:#5A8A5C">✓ API respondeu (${r.status})</span> — ${esc(API)}`;
    })
    .catch(err => {
      if (statusEl) statusEl.innerHTML = `<span style="color:#A83C2C">✕ API offline:</span> ${esc(err.message)}<br><small>${esc(API)}</small>`;
    });

  // Detecta primeiro acesso, banco incompleto ou sessão existente.
  inicializarBootstrapAdmin();
});
