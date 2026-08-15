const ADMIN_REMEMBER_USER_KEY = 'guiadoa_admin_remembered_user';

function carregarUsuarioLembrado() {
  const input = document.getElementById('login-user');
  const checkbox = document.getElementById('remember-user');
  if (!input || !checkbox) return;
  try {
    const remembered = localStorage.getItem(ADMIN_REMEMBER_USER_KEY) || '';
    input.value = remembered;
    checkbox.checked = Boolean(remembered);
  } catch {}
}

function persistirUsuarioLembrado(usuario) {
  const checkbox = document.getElementById('remember-user');
  try {
    if (checkbox?.checked && usuario) localStorage.setItem(ADMIN_REMEMBER_USER_KEY, usuario);
    else localStorage.removeItem(ADMIN_REMEMBER_USER_KEY);
  } catch {}
}

// ── LOGIN ─────────────────────────────────────────────────────────────────────
async function fazerLogin() {
  limparLog();
  const box = document.getElementById('debug-box');
  if (box) box.style.display = 'block';

  const usuario = document.getElementById('login-user').value.trim();
  const senha   = document.getElementById('login-pass').value;
  const btn     = document.getElementById('btn-login');

  dbgInfo('Tentativa de login iniciada.');
  dbg(`Usuário: "${usuario}" | Senha: ${senha.length} chars`, '#C8A84A');

  if (!usuario || !senha) {
    dbgErr('Campos obrigatórios em falta.');
    return erroLogin('Preencha todos os campos');
  }

  if (btn) { btn.disabled = true; btn.textContent = 'Aguarde…'; }

  const url = `${API}/auth/login`;
  dbgInfo(`POST → ${url}`);

  try {
    const r = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ usuario, senha }),
      signal: AbortSignal.timeout(12000),
    });

    dbg(`Resposta HTTP: ${r.status} ${r.statusText}`, r.ok ? '#78DD7A' : '#EE6666');

    const ct = r.headers.get('content-type') || '';
    if (!ct.includes('application/json')) {
      dbgErr(`Servidor devolveu ${r.status} mas o corpo não é JSON (content-type: ${ct}).`);
      dbgWarn('Causa provável: erro não tratado no servidor (MongoDB desligado ou MONGO_URI errada).');
      dbgInfo('Usa o botão "Diagnosticar conexão" para mais detalhes.');
      if (btn) { btn.disabled = false; btn.textContent = 'Acessar o Quartel'; }
      return erroLogin('Erro interno no servidor — veja o log.');
    }

    let d;
    try {
      d = await r.json();
      dbg(`Resposta JSON válida${d.usuario ? ` — usuário: ${d.usuario}` : ''}${d.papel ? ` — papel: ${d.papel}` : ''}`, '#C8A84A');
    } catch(jsonErr) {
      dbgErr('Falha a ler JSON: ' + jsonErr.message);
      if (btn) { btn.disabled = false; btn.textContent = 'Acessar o Quartel'; }
      return erroLogin('Resposta inválida do servidor.');
    }

    if (r.status === 401) {
      dbgErr('Credenciais rejeitadas: ' + (d.erro || 'sem mensagem'));
      dbgWarn('Se o utilizador ainda não existe, abra o aplicativo para criar o primeiro administrador.');
      if (btn) { btn.disabled = false; btn.textContent = 'Acessar o Quartel'; }
      return erroLogin(d.erro || 'Credenciais inválidas');
    }

    if (r.status === 500) {
      dbgErr('Erro 500: ' + (d.erro || 'erro interno do servidor'));
      dbgWarn('Verifique MONGO_URI e JWT_SECRET nas variáveis de ambiente do Render.');
      if (btn) { btn.disabled = false; btn.textContent = 'Acessar o Quartel'; }
      return erroLogin('Erro no servidor — veja o log.');
    }

    if (!r.ok) {
      dbgErr(`Status inesperado ${r.status}: ` + (d.erro || ''));
      if (btn) { btn.disabled = false; btn.textContent = 'Acessar o Quartel'; }
      return erroLogin(d.erro || `Erro ${r.status}`);
    }

    TOKEN = d.token;
    AdminCore.setToken(TOKEN);
    persistirUsuarioLembrado(usuario);
    dbgOk('Token recebido e guardado.');

    await entrarAdminAposAuth(d.usuario);
    dbgOk('Login completo.');

  } catch (err) {
    if (err.name === 'TimeoutError' || err.name === 'AbortError') {
      dbgErr('Timeout — o servidor não respondeu em 12 segundos.');
      dbgWarn('No plano gratuito do Render o servidor pode estar a "acordar" (cold start). Aguarde 30s e tente novamente.');
    } else {
      dbgErr('Erro de rede: ' + err.message);
      dbgWarn('Causas comuns: servidor offline, CORS bloqueado, sem internet.');
    }
    if (btn) { btn.disabled = false; btn.textContent = 'Acessar o Quartel'; }
    erroLogin('Sem resposta do servidor — veja o log.');
  }
}

function erroLogin(msg) {
  const el = document.getElementById('login-erro');
  if (!el) return;
  el.textContent = msg;
  el.style.display = 'block';
  setTimeout(() => el.style.display = 'none', 4500);
}

async function verificarToken() {
  if (!TOKEN) return;
  try {
    const r = await fetch(`${API}/auth/verificar`, { headers:{Authorization:`Bearer ${TOKEN}`} });
    if (r.ok) {
      const d = await r.json();
      await entrarAdminAposAuth(d.usuario);
    } else { TOKEN=''; AdminCore.clearToken(); }
  } catch {}
}

function sair() {
  TOKEN=''; AdminCore.clearToken();
  document.getElementById('app').style.display='none';
  document.getElementById('tela-login').style.display='flex';
  inicializarBootstrapAdmin();
}
