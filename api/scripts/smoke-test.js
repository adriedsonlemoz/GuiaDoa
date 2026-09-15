const BASE = (process.env.API_BASE_URL || '').replace(/\/$/, '');
if (!BASE) {
  console.error('Defina API_BASE_URL para executar o smoke test contra uma API já iniciada.');
  process.exit(2);
}

let falhas = 0;
async function check(nome, fn) {
  try { await fn(); console.log(`✓ ${nome}`); }
  catch (e) { falhas += 1; console.error(`✕ ${nome}: ${e.message}`); }
}
const expectStatus = (r, permitidos) => {
  if (!permitidos.includes(r.status)) throw new Error(`HTTP ${r.status}; esperado ${permitidos.join('/')}`);
};

await check('raiz da API', async () => {
  const r = await fetch(`${BASE}/`);
  expectStatus(r, [200]);
  const d = await r.json();
  if (d.status !== 'ok' || !d.version) throw new Error('resposta básica inválida');
});

await check('health check', async () => {
  const r = await fetch(`${BASE}/api/health`);
  expectStatus(r, [200, 503]);
  const d = await r.json();
  if (!d.servicos?.api || !d.servicos?.mongodb) throw new Error('serviços ausentes');
});

await check('login inválido retorna erro padronizado', async () => {
  const r = await fetch(`${BASE}/api/auth/login`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ usuario: '', senha: '' }),
  });
  expectStatus(r, [400, 429]);
  const d = await r.json();
  if (d.sucesso !== false || !d.codigo || !d.mensagem) throw new Error('erro não padronizado');
});

await check('rota admin exige autenticação', async () => {
  const r = await fetch(`${BASE}/api/dicas/admin`);
  expectStatus(r, [401]);
});

await check('assistente rejeita pergunta inválida sem chamar IA', async () => {
  const r = await fetch(`${BASE}/api/assistente`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ pergunta: '', historico: [] }),
  });
  expectStatus(r, [400, 429]);
});


const TEST_USER = process.env.TEST_ADMIN_USER || '';
const TEST_PASS = process.env.TEST_ADMIN_PASSWORD || '';
if (TEST_USER && TEST_PASS) {
  let token = '';
  await check('login correto com credencial de teste', async () => {
    const r = await fetch(`${BASE}/api/auth/login`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ usuario: TEST_USER, senha: TEST_PASS }),
    });
    expectStatus(r, [200]);
    const d = await r.json();
    if (!d.token) throw new Error('token ausente');
    token = d.token;
  });

  await check('login incorreto é rejeitado', async () => {
    const r = await fetch(`${BASE}/api/auth/login`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ usuario: TEST_USER, senha: `${TEST_PASS}-incorreta` }),
    });
    expectStatus(r, [401, 429]);
  });

  await check('health profundo autenticado', async () => {
    const r = await fetch(`${BASE}/api/health/deep`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    expectStatus(r, [200, 503]);
    const d = await r.json();
    if (!d.servicos?.cloudinary || !d.servicos?.groq) throw new Error('diagnóstico externo ausente');
  });
} else {
  console.log('ℹ TEST_ADMIN_USER/TEST_ADMIN_PASSWORD não definidos; testes autenticados opcionais foram ignorados.');
}

if (falhas) process.exit(1);
console.log('\nSmoke test concluído sem falhas.');
