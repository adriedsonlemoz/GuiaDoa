let BOOTSTRAP_STATUS = null;

async function carregarBootstrapStatus() {
  const r = await fetch(`${API}/setup/bootstrap-status`, { signal: AbortSignal.timeout(10000), cache: 'no-store' });
  const d = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(d.erro || d.mensagem || 'Não foi possível verificar o estado inicial do banco.');
  BOOTSTRAP_STATUS = d;
  return d;
}

function mostrarLoginNormal() {
  const setup = document.getElementById('bootstrap-user-card');
  const login = document.getElementById('login-form');
  if (setup) setup.style.display = 'none';
  if (login) login.style.display = 'block';
}

function mostrarCriacaoAdmin(status) {
  const setup = document.getElementById('bootstrap-user-card');
  const login = document.getElementById('login-form');
  if (login) login.style.display = 'none';
  if (!setup) return;

  setup.style.display = 'block';
  const keyWrap = document.getElementById('bootstrap-key-wrap');
  if (keyWrap) keyWrap.style.display = status?.usuario?.setupKeyObrigatoria ? 'block' : 'none';
  const resumo = document.getElementById('bootstrap-user-resumo');
  if (resumo) {
    resumo.textContent = 'Nenhum administrador foi encontrado. Os dados padrão são migrados automaticamente para o MongoDB; crie apenas o primeiro usuário para continuar.';
  }
}

function atualizarAvisoBanco(status) {
  const aviso = document.getElementById('bootstrap-bank-notice');
  if (!aviso) return;

  const estado = status?.migracao?.estado;
  const faltantes = status?.dados?.faltantes || [];
  if (estado === 'erro') {
    aviso.style.display = 'block';
    aviso.innerHTML = `<strong>⚠ Migração automática com erro</strong><br>${esc(status?.migracao?.erro || 'Verifique os logs do backend no Render.')}`;
    return;
  }
  if (estado !== 'pronto' || faltantes.length) {
    aviso.style.display = 'block';
    aviso.innerHTML = '<strong>🗄️ Preparando MongoDB</strong><br>Os dados padrão são migrados automaticamente pelo backend. Não é necessário importar seeds manualmente.';
    return;
  }

  aviso.style.display = 'none';
  aviso.textContent = '';
}

async function inicializarBootstrapAdmin() {
  try {
    const status = await carregarBootstrapStatus();
    atualizarAvisoBanco(status);

    if (TOKEN) {
      await verificarToken();
      return;
    }

    if (status.usuario?.necessario) mostrarCriacaoAdmin(status);
    else mostrarLoginNormal();
  } catch (err) {
    mostrarLoginNormal();
    const aviso = document.getElementById('bootstrap-bank-notice');
    if (aviso) {
      aviso.style.display = 'block';
      aviso.textContent = `Não foi possível verificar o MongoDB: ${err.message}`;
    }
  }
}

async function criarPrimeiroAdmin() {
  const usuario = document.getElementById('bootstrap-user').value.trim();
  const senha = document.getElementById('bootstrap-pass').value;
  const confirmar = document.getElementById('bootstrap-pass2').value;
  const setupKey = document.getElementById('bootstrap-key').value.trim();
  const erroEl = document.getElementById('bootstrap-user-erro');
  const btn = document.getElementById('btn-bootstrap-user');

  if (erroEl) { erroEl.style.display = 'none'; erroEl.textContent = ''; }
  if (usuario.length < 3) return erroBootstrapUsuario('O usuário precisa ter pelo menos 3 caracteres.');
  if (senha.length < 6) return erroBootstrapUsuario('A senha precisa ter pelo menos 6 caracteres.');
  if (senha !== confirmar) return erroBootstrapUsuario('As duas senhas não são iguais.');
  if (BOOTSTRAP_STATUS?.usuario?.setupKeyObrigatoria && !setupKey) return erroBootstrapUsuario('Informe a chave de instalação configurada no servidor.');

  if (btn) { btn.disabled = true; btn.textContent = 'Criando administrador…'; }
  try {
    const headers = { 'Content-Type': 'application/json' };
    if (setupKey) headers['X-Setup-Key'] = setupKey;
    const r = await fetch(`${API}/setup/usuario`, {
      method: 'POST', headers,
      body: JSON.stringify({ usuario, senha }),
      signal: AbortSignal.timeout(12000),
    });
    const d = await r.json().catch(() => ({}));
    if (!r.ok) throw new Error(d.erro || d.mensagem || 'Não foi possível criar o administrador.');

    document.getElementById('login-user').value = usuario;
    document.getElementById('login-pass').value = senha;
    mostrarLoginNormal();
    toast('Administrador criado. Entrando no painel…', 'ok');
    await fazerLogin();
  } catch (err) {
    erroBootstrapUsuario(err.message);
  } finally {
    if (btn) { btn.disabled = false; btn.textContent = 'Criar administrador e continuar'; }
  }
}

function erroBootstrapUsuario(msg) {
  const el = document.getElementById('bootstrap-user-erro');
  if (!el) return;
  el.textContent = msg;
  el.style.display = 'block';
}

async function entrarAdminAposAuth(usuario) {
  const topUser = document.getElementById('topbar-user');
  if (topUser) topUser.textContent = usuario || 'admin';
  const telaLogin = document.getElementById('tela-login');
  const appEl = document.getElementById('app');
  if (telaLogin) telaLogin.style.display = 'none';
  if (appEl) appEl.style.display = 'flex';

  try {
    const status = await carregarBootstrapStatus();
    atualizarAvisoBanco(status);
    if (status?.migracao?.estado === 'erro') {
      toast('A migração automática do MongoDB encontrou um erro. Consulte Diagnóstico/Render.', 'warn');
    }
  } catch { /* login não deve ser bloqueado por uma checagem auxiliar */ }
  irHome();
}
