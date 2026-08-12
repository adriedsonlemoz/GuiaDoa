// ── REINOS ────────────────────────────────────────────────────────────────────

const FUSOS_OPCOES = [
  { valor:'UTC-12', label:'UTC-12 — Linha de Data Intl. (Oeste)' },
  { valor:'UTC-11', label:'UTC-11 — Samoa, Niue' },
  { valor:'UTC-10', label:'UTC-10 — Havaí, Taiti' },
  { valor:'UTC-9',  label:'UTC-9 — Alaska' },
  { valor:'UTC-8',  label:'UTC-8 — Los Angeles, Vancouver' },
  { valor:'UTC-7',  label:'UTC-7 — Denver, Phoenix, Calgary' },
  { valor:'UTC-6',  label:'UTC-6 — Chicago, Cidade do México' },
  { valor:'UTC-5',  label:'UTC-5 — Nova York, Toronto, Bogotá' },
  { valor:'UTC-4',  label:'UTC-4 — Halifax, Santiago, Caracas' },
  { valor:'UTC-3',  label:'UTC-3 — São Paulo, Buenos Aires, Lisboa (verão)' },
  { valor:'UTC-2',  label:'UTC-2 — Geórgia do Sul, Mid-Atlantic' },
  { valor:'UTC-1',  label:'UTC-1 — Açores, Cabo Verde' },
  { valor:'UTC+0',  label:'UTC+0 — Londres, Dublin, Lisboa (inverno)' },
  { valor:'UTC+1',  label:'UTC+1 — Paris, Berlim, Madrid, Roma' },
  { valor:'UTC+2',  label:'UTC+2 — Cairo, Joanesburgo, Atenas' },
  { valor:'UTC+3',  label:'UTC+3 — Moscovo, Riade, Nairobi' },
  { valor:'UTC+4',  label:'UTC+4 — Dubai, Baku, Reunião' },
  { valor:'UTC+5',  label:'UTC+5 — Islamabad, Karachi, Tashkent' },
  { valor:'UTC+5:30',label:'UTC+5:30 — Mumbai, Nova Deli, Colombo' },
  { valor:'UTC+6',  label:'UTC+6 — Almaty, Dacca' },
  { valor:'UTC+7',  label:'UTC+7 — Banguecoque, Jacarta, Hanói' },
  { valor:'UTC+8',  label:'UTC+8 — Pequim, Singapura, Perth' },
  { valor:'UTC+9',  label:'UTC+9 — Tóquio, Seul, Yakutsk' },
  { valor:'UTC+9:30',label:'UTC+9:30 — Adelaida, Darwin' },
  { valor:'UTC+10', label:'UTC+10 — Sydney, Brisbane, Vladivostok' },
  { valor:'UTC+11', label:'UTC+11 — Nova Caledônia, Ilhas Salomão' },
  { valor:'UTC+12', label:'UTC+12 — Auckland, Suva, Fiji' },
];

const REGIOES_OPCOES = [
  'África','América do Norte','América do Sul','Ásia',
  'Europa','Europa de Leste','Médio Oriente','Oceania',
];

const IDIOMAS_OPCOES = [
  'Alemão','Árabe','Chinês','Coreano','Espanhol','Francês',
  'Holandês','Inglês','Italiano','Japonês','Polonês','Português','Russo','Turco',
];

// Popula os selects do modal estático de Reinos
(function popularSelectsReino() {
  const selFuso   = document.getElementById('mr-fuso');
  const selRegiao = document.getElementById('mr-regiao');
  const selIdioma = document.getElementById('mr-idioma');
  if (!selFuso) return;
  FUSOS_OPCOES.forEach(f => {
    const o = document.createElement('option');
    o.value = f.valor; o.textContent = f.label;
    selFuso.appendChild(o);
  });
  REGIOES_OPCOES.forEach(r => {
    const o = document.createElement('option');
    o.value = r; o.textContent = r;
    selRegiao.appendChild(o);
  });
  IDIOMAS_OPCOES.forEach(i => {
    const o = document.createElement('option');
    o.value = i; o.textContent = i;
    selIdioma.appendChild(o);
  });
})();

let REINO_EDITANDO = null;

async function carregarReinos() {
  document.getElementById('content').innerHTML = '<div class="loading"><span class="spinner"></span> Carregando reinos…</div>';
  try {
    const r = await fetch(`${API}/reinos`, { headers:{ Authorization:`Bearer ${TOKEN}` } });
    if (r.status===401) { sair(); return; }
    const d = await r.json();
    renderReinos(d.reinos || []);
  } catch(err) {
    document.getElementById('content').innerHTML = `<div class="loading" style="color:var(--red)">❌ Erro: ${esc(err.message)}</div>`;
  }
}

function renderReinos(lista) {
  const porRegiao = {};
  lista.forEach(r => {
    const k = r.regiao || 'Sem região';
    if (!porRegiao[k]) porRegiao[k] = [];
    porRegiao[k].push(r);
  });

  document.getElementById('content').innerHTML = `
    <div class="stats-row">
      <div class="stat-box"><div class="stat-val">${lista.length}</div><div class="stat-lbl">Total</div></div>
      <div class="stat-box"><div class="stat-val">${Object.keys(porRegiao).length}</div><div class="stat-lbl">Regiões</div></div>
      <div class="stat-box"><div class="stat-val">${[...new Set(lista.map(r=>r.fuso))].length}</div><div class="stat-lbl">Fusos</div></div>
    </div>

    <div class="card">
      <div class="card-header">
        <h2>🌍 Reinos</h2>
        <div style="display:flex;gap:8px">
          <button class="btn btn-gold btn-sm" onclick="abrirModalReino(null)">＋ Novo Reino</button>
        </div>
      </div>
      <div class="card-body">
        ${Object.entries(porRegiao).sort(([a],[b])=>a.localeCompare(b)).map(([reg,reinos])=>`
          <div style="margin-bottom:18px">
            <div style="font-size:0.62rem;font-weight:900;letter-spacing:2.5px;color:var(--muted);text-transform:uppercase;padding:0 0 6px;border-bottom:1px solid rgba(200,168,74,0.2);margin-bottom:2px">${esc(reg)}</div>
            ${reinos.sort((a,b)=>a.nome.localeCompare(b.nome)).map(r=>`
              <div style="display:flex;align-items:center;padding:7px 4px;border-bottom:1px solid rgba(200,168,74,0.08)">
                <span style="font-size:0.7rem;font-weight:900;color:var(--muted);min-width:32px;font-family:monospace">#${Number(r.id)||0}</span>
                <span style="flex:1;font-weight:700;font-size:0.88rem;color:var(--dark)">${esc(r.nome)}</span>
                <div style="display:flex;gap:5px;flex-shrink:0">
                  <button class="btn btn-navy btn-sm" onclick="abrirModalReino(fromDataArg('${dataArg(r)}'))">✏ Editar</button>
                  <button class="btn btn-red btn-sm" onclick="deletarReino(fromStrArg('${strArg(r.slug)}'),fromStrArg('${strArg(r.nome)}'))">🗑</button>
                </div>
              </div>
            `).join('')}
          </div>
        `).join('')}
        ${lista.length===0?`<p style="text-align:center;color:var(--muted);padding:24px">Nenhum reino cadastrado no MongoDB. Verifique o diagnóstico da migração ou crie um reino manualmente.</p>`:''}
      </div>
    </div>
  `;
}

function abrirModalReino(r) {
  REINO_EDITANDO = r ? r.slug : null;
  document.getElementById('mr-titulo').textContent = r ? `✏ Editar: ${r.nome}` : '🌍 Novo Reino';
  document.getElementById('mr-id').value     = r?.id     || '';
  document.getElementById('mr-nome').value   = r?.nome   || '';
  document.getElementById('mr-fuso').value   = r?.fuso   || '';
  document.getElementById('mr-regiao').value = r?.regiao || '';
  document.getElementById('mr-idioma').value = r?.idioma || '';
  document.getElementById('mr-en-regiao').value = r?.i18n?.['en-US']?.regiao || '';
  document.getElementById('mr-en-idioma').value = r?.i18n?.['en-US']?.idioma || '';
  abrirModal('modal-reino');
}

async function salvarReino() {
  const id     = parseInt(document.getElementById('mr-id').value);
  const nome   = document.getElementById('mr-nome').value.trim();
  const fuso   = document.getElementById('mr-fuso').value;
  const regiao = document.getElementById('mr-regiao').value;
  const idioma = document.getElementById('mr-idioma').value;
  const i18n = { 'en-US': { regiao: document.getElementById('mr-en-regiao').value.trim(), idioma: document.getElementById('mr-en-idioma').value.trim() } };
  if (!id || !nome || !fuso) return toast('ID, nome e fuso são obrigatórios.','erro');
  try {
    const r = REINO_EDITANDO
      ? await fetch(`${API}/reinos/${REINO_EDITANDO}`,{ method:'PUT', headers:{'Content-Type':'application/json',Authorization:`Bearer ${TOKEN}`}, body:JSON.stringify({id,nome,fuso,regiao,idioma,i18n}) })
      : await fetch(`${API}/reinos`,                  { method:'POST',headers:{'Content-Type':'application/json',Authorization:`Bearer ${TOKEN}`}, body:JSON.stringify({id,nome,fuso,regiao,idioma,i18n}) });
    const d = await r.json();
    if (!r.ok) return toast(d.erro||'Erro ao salvar','erro');
    toast(REINO_EDITANDO ? 'Reino atualizado!' : 'Reino criado!','ok');
    fecharModal('modal-reino');
    carregarReinos();
  } catch(err) { toast('Erro: '+err.message,'erro'); }
}

async function deletarReino(slug, nome) {
  if (!confirm(`Excluir o reino "${nome}"? Esta ação não pode ser desfeita.`)) return;
  try {
    const r = await fetch(`${API}/reinos/${slug}`,{ method:'DELETE', headers:{Authorization:`Bearer ${TOKEN}`} });
    const d = await r.json();
    if (!r.ok) return toast(d.erro||'Erro ao excluir','erro');
    toast(`"${nome}" removido.`,'ok');
    carregarReinos();
  } catch(err) { toast('Erro: '+err.message,'erro'); }
}

// Módulos de Traduções e Dicas foram separados em arquivos próprios na Beta 2.3.
