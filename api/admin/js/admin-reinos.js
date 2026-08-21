// ── REINOS ──────────────────────────────────────────────────────────────────
const FUSOS_OPCOES = [
  'UTC-12','UTC-11','UTC-10','UTC-9','UTC-8','UTC-7','UTC-6','UTC-5','UTC-4','UTC-3','UTC-2','UTC-1','UTC+0','UTC+1','UTC+2','UTC+3','UTC+4','UTC+5','UTC+5:30','UTC+6','UTC+7','UTC+8','UTC+9','UTC+9:30','UTC+10','UTC+11','UTC+12'
];
let REINO_EDITANDO = null;

(function popularSelectFusoReino(){
  const sel=document.getElementById('mr-fuso'); if(!sel)return;
  FUSOS_OPCOES.forEach(f=>{const o=document.createElement('option');o.value=f;o.textContent=f;sel.appendChild(o);});
})();

async function carregarReinos(){
  setLoading('Carregando reinos…');
  try{const r=await fetch(`${API}/reinos`,{headers:{Authorization:`Bearer ${TOKEN}`}});if(r.status===401){sair();return;}const d=await r.json();if(!r.ok)throw new Error(d.erro||'Falha ao carregar reinos.');renderReinos(d.reinos||[]);}catch(err){document.getElementById('content').innerHTML=`<div class="loading" style="color:var(--red)">❌ ${esc(err.message)}</div>`;}
}
function realmDateLabel(value){if(!value)return'Não informada';const d=new Date(value);return Number.isNaN(d.getTime())?'Não informada':new Intl.DateTimeFormat('pt-BR',{day:'2-digit',month:'2-digit',year:'numeric',timeZone:'UTC'}).format(d);}
function realmTypeLabel(value){return value==='idade_dragao'?'🐉 Idade do Dragão':value==='hardcore'?'⚔️ Hardcore':'Normal';}
function renderReinos(lista){
  const withDate=lista.filter(r=>r.aberturaEm).length;const timezones=new Set(lista.map(r=>r.fuso).filter(Boolean)).size;
  document.getElementById('content').innerHTML=`<div class="admin-page-head"><div><span class="admin-eyebrow">Catálogo de servidores</span><h1>Reinos</h1><p>Identificação, abertura, fuso e horários confirmados de cada reino.</p></div><button class="btn btn-gold" onclick="abrirModalReino(null)">＋ Novo reino</button></div><div class="stats-row"><div class="stat-box"><div class="stat-val">${lista.length}</div><div class="stat-lbl">Total</div></div><div class="stat-box"><div class="stat-val">${withDate}</div><div class="stat-lbl">Com abertura</div></div><div class="stat-box"><div class="stat-val">${timezones}</div><div class="stat-lbl">Fusos</div></div></div><div class="admin-callout"><strong>Dados desconhecidos ficam vazios</strong><span>Não são criados horários, datas ou fusões por estimativa. A idade do reino é calculada a partir da data de abertura e nunca armazenada manualmente.</span></div><div class="admin-realm-admin-list">${lista.slice().sort((a,b)=>Number(b.id)-Number(a.id)).map(r=>`<div class="admin-realm-admin-card"><div><small>#${r.id} · ${esc(r.fuso||'Fuso não informado')} · ${esc(realmTypeLabel(r.tipoEspecial))}</small><strong>${esc(r.nome)}</strong><span>Abertura: ${esc(realmDateLabel(r.aberturaEm))}${r.idadeDias!=null?` · ${r.idadeDias} dia(s)`:''}</span></div><div><button class="btn btn-navy btn-sm" onclick="abrirModalReino(fromDataArg('${dataArg(r)}'))">✏ Editar</button><button class="btn btn-red btn-sm" onclick="deletarReino(fromStrArg('${strArg(r.slug)}'),fromStrArg('${strArg(r.nome)}'))">🗑</button></div></div>`).join('')||'<div class="admin-empty">Nenhum reino cadastrado.</div>'}</div>`;
}
function abrirModalReino(r){
  REINO_EDITANDO=r?.slug||null;document.getElementById('mr-titulo').textContent=r?`✏ ${r.nome}`:'🌍 Novo Reino';
  document.getElementById('mr-id').value=r?.id||'';document.getElementById('mr-nome').value=r?.nome||'';document.getElementById('mr-status').value=r?.status||'';document.getElementById('mr-tipo-especial').value=r?.tipoEspecial||'';document.getElementById('mr-abertura').value=r?.aberturaEm?new Date(r.aberturaEm).toISOString().slice(0,10):'';document.getElementById('mr-fuso').value=r?.fuso||'';
  document.getElementById('mr-torneios').value=r?.horarios?.torneiosFim||'';document.getElementById('mr-zyrvorthian').value=r?.horarios?.zyrvorthian||'';document.getElementById('mr-dragao').value=r?.horarios?.batalhaDragao||'';document.getElementById('mr-historico-status').value=r?.historico?.status||'';document.getElementById('mr-historico-obs').value=r?.historico?.observacoes||'';
  const en=r?.i18n?.['en-US']||{};document.getElementById('mr-en-nome').value=en.nome||'';document.getElementById('mr-en-status').value=en.status||'';document.getElementById('mr-en-historico-status').value=en.historico?.status||'';document.getElementById('mr-en-historico-obs').value=en.historico?.observacoes||'';
  abrirModal('modal-reino');
}
async function salvarReino(){
  const id=Number(document.getElementById('mr-id').value),nome=document.getElementById('mr-nome').value.trim(),fuso=document.getElementById('mr-fuso').value;
  if(!id||!nome)return toast('ID e nome são obrigatórios.','erro');
  const en={nome:document.getElementById('mr-en-nome').value.trim(),status:document.getElementById('mr-en-status').value.trim(),historico:{status:document.getElementById('mr-en-historico-status').value.trim(),observacoes:document.getElementById('mr-en-historico-obs').value.trim()}};
  const hasEn=en.nome||en.status||en.historico.status||en.historico.observacoes;
  const payload={id,nome,status:document.getElementById('mr-status').value.trim(),tipoEspecial:document.getElementById('mr-tipo-especial').value,aberturaEm:document.getElementById('mr-abertura').value||null,fuso,horarios:{torneiosFim:document.getElementById('mr-torneios').value,zyrvorthian:document.getElementById('mr-zyrvorthian').value,batalhaDragao:document.getElementById('mr-dragao').value},historico:{status:document.getElementById('mr-historico-status').value.trim(),observacoes:document.getElementById('mr-historico-obs').value.trim()},i18n:{'en-US':hasEn?en:{}}};
  try{const r=await fetch(REINO_EDITANDO?`${API}/reinos/${REINO_EDITANDO}`:`${API}/reinos`,{method:REINO_EDITANDO?'PUT':'POST',headers:{'Content-Type':'application/json',Authorization:`Bearer ${TOKEN}`},body:JSON.stringify(payload)});const d=await r.json();if(!r.ok)return toast(d.erro||'Erro ao salvar.','erro');fecharModal('modal-reino');toast(REINO_EDITANDO?'Reino atualizado!':'Reino criado!','ok');carregarReinos();}catch(err){toast('Erro: '+err.message,'erro');}
}
async function deletarReino(slug,nome){if(!confirm(`Excluir o reino "${nome}"? Esta ação não pode ser desfeita.`))return;try{const r=await fetch(`${API}/reinos/${slug}`,{method:'DELETE',headers:{Authorization:`Bearer ${TOKEN}`}});const d=await r.json();if(!r.ok)return toast(d.erro||'Erro ao excluir.','erro');toast(`"${nome}" removido.`,'ok');carregarReinos();}catch(err){toast('Erro: '+err.message,'erro');}}
