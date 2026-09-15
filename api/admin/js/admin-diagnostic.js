// ── Debug helpers ─────────────────────────────────────────────────────────────
// ── LOG ───────────────────────────────────────────────────────────────────────
const LOG_BUFFER = [];

function dbg(msg, cor, icone) {
  const box   = document.getElementById('debug-box');
  const lines = document.getElementById('debug-lines');
  if (!box || !lines) return;
  box.style.display = 'block';

  const ts   = new Date().toLocaleTimeString('pt-BR');
  const full = `[${ts}] ${icone ? icone + ' ' : ''}${msg}`;
  LOG_BUFFER.push(full);

  const line = document.createElement('div');
  line.style.color        = cor || '#C8C8C8';
  line.style.paddingLeft  = '4px';
  line.style.borderLeft   = `2px solid ${cor || '#444'}`;
  line.style.marginBottom = '4px';
  line.textContent        = full;
  lines.appendChild(line);
  lines.scrollTop = lines.scrollHeight;
}

function dbgOk(msg)   { dbg(msg, '#78DD7A', '✓'); }
function dbgErr(msg)  { dbg(msg, '#EE6666', '✕'); }
function dbgInfo(msg) { dbg(msg, '#78AAEE', '→'); }
function dbgWarn(msg) { dbg(msg, '#F0C040', '⚠'); }

function limparLog() {
  const lines = document.getElementById('debug-lines');
  if (lines) lines.innerHTML = '';
  LOG_BUFFER.length = 0;
}

function copiarLog() {
  const texto = LOG_BUFFER.join('\n');
  if (!texto) return;
  navigator.clipboard.writeText(texto).then(() => {
    const btn = document.getElementById('btn-copiar-log');
    if (!btn) return;
    const orig = btn.textContent;
    btn.textContent = '✓ Copiado!';
    btn.style.color = '#78DD7A';
    btn.style.borderColor = 'rgba(120,221,122,0.5)';
    setTimeout(() => { btn.textContent = orig; btn.style.color = ''; btn.style.borderColor = ''; }, 1800);
  }).catch(() => {
    // fallback para navegadores sem clipboard API
    const ta = document.createElement('textarea');
    ta.value = texto;
    ta.style.position = 'fixed'; ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    document.execCommand('copy');
    document.body.removeChild(ta);
  });
}

// ── DIAGNÓSTICO ───────────────────────────────────────────────────────────────
async function rodarDiagnostico() {
  const box = document.getElementById('debug-box');
  if (box) box.style.display = 'block';
  limparLog();
  dbgInfo('Iniciando diagnóstico de conexão…');
  dbgInfo(`API base: ${API}`);
  dbgInfo(`Origem: ${location.origin}`);

  // Health consolidado — usa verificação profunda quando há sessão admin.
  dbgInfo(`Testando health consolidado → GET ${API}/health${TOKEN ? '/deep' : ''}`);
  try {
    const r = await AdminCore.request(`${API}/health${TOKEN ? '/deep' : ''}`, { auth: Boolean(TOKEN), timeout: 7000 });
    const d = await r.json().catch(() => ({}));
    const serv = d.servicos || {};
    const fmt = (x) => x?.status || '?';
    (d.status === 'ok' ? dbgOk : dbgWarn)(`Health: ${d.status || r.status} · MongoDB ${fmt(serv.mongodb)} · Cloudinary ${fmt(serv.cloudinary)} · Groq ${fmt(serv.groq)}`);
  } catch (e) {
    dbgWarn(`Health consolidado indisponível: ${e.message}`);
  }

  // 1. Health check (/)
  dbgInfo('Testando health check → GET /');
  try {
    const r = await fetch('/', { signal: AbortSignal.timeout(6000) });
    if (r.ok) {
      const d = await r.json().catch(() => ({}));
      dbgOk(`Servidor respondeu (${r.status}) — versão: ${d.version || '?'}`);
    } else {
      dbgWarn(`Servidor respondeu com status ${r.status}`);
    }
  } catch(e) {
    dbgErr(`Servidor inacessível: ${esc(e.message)}`);
    dbgErr('Verifique se o serviço está online no Render.');
    return;
  }

  // 2. Endpoint /api
  dbgInfo(`Testando endpoint → GET ${API}`);
  try {
    const r = await fetch(API, { signal: AbortSignal.timeout(6000) });
    if (r.status === 404) {
      dbgWarn(`${API} retornou 404 — rota raiz da API não existe (normal).`);
    } else {
      dbgOk(`API respondeu (${r.status})`);
    }
  } catch(e) {
    dbgErr(`Falha no endpoint da API: ${esc(e.message)}`);
  }

  // 3. MongoDB — testa rota pública /api/reinos
  dbgInfo(`Testando MongoDB → GET ${API}/reinos`);
  try {
    const r  = await fetch(`${API}/reinos`, { signal: AbortSignal.timeout(8000) });
    if (r.ok) {
      const d = await r.json().catch(()=>({}));
      dbgOk(`MongoDB conectado — ${d.total ?? '?'} reinos na base.`);
    } else if (r.status === 500) {
      dbgErr('MongoDB retornou 500 — verifique MONGO_URI nas variáveis de ambiente do Render.');
    } else {
      dbgWarn(`Reinos respondeu ${r.status} — pode ser normal.`);
    }
  } catch(e) {
    dbgErr(`Timeout ou erro ao testar MongoDB: ${esc(e.message)}`);
    dbgWarn('Confirme que MONGO_URI está definida no Render.');
  }

  // 4. Auth endpoint
  dbgInfo(`Testando autenticação → POST ${API}/auth/login (credenciais vazias)`);
  try {
    const r = await fetch(`${API}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ usuario: '', senha: '' }),
      signal: AbortSignal.timeout(6000),
    });
    const ct = r.headers.get('content-type') || '';
    if (ct.includes('application/json')) {
      const d = await r.json().catch(()=>({}));
      if (r.status === 400 || r.status === 401) {
        dbgOk(`Auth endpoint funciona — respondeu ${r.status} JSON correctamente.`);
        dbgInfo('Próximo passo: verifique se o primeiro administrador foi criado pelo fluxo inicial do aplicativo');
      } else if (r.status === 500) {
        dbgErr(`Auth retornou 500: ${d.erro || 'erro interno'}`);
        dbgWarn('Provável causa: usuário não existe na base. Abra o aplicativo para criar o primeiro administrador.');
      }
    } else {
      dbgErr(`Auth respondeu ${r.status} mas não é JSON (recebeu HTML).`);
      dbgWarn('O servidor pode estar a devolver uma página de erro. Verifique os logs do Render.');
    }
  } catch(e) {
    dbgErr(`Falha no endpoint auth: ${esc(e.message)}`);
  }

  dbgInfo('─── Diagnóstico concluído. Usa 📋 Copiar para partilhar o log. ───');
}
