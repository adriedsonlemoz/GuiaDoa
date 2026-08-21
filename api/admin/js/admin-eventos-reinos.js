// ── EVENTOS: ocorrências por reino ──────────────────────────────────────────
var EVENTO_REINOS_SELECTED = new Set();
var EVENTO_REINOS_SEARCH = '';

function abrirReinosEvento(){EVENTO_REINOS_SELECTED=new Set((EVENTO_ATUAL.ocorrencias||[]).map(o=>Number(o.reinoId)));EVENTO_REINOS_SEARCH='';renderReinosEvento();}
function selecionarQuatroReinosRecentes(){EVENTOS_REINOS.slice().sort((a,b)=>Number(b.id)-Number(a.id)).slice(0,4).forEach(r=>EVENTO_REINOS_SELECTED.add(Number(r.id)));renderReinosEvento();}
function alternarReinoEvento(id,checked){if(checked)EVENTO_REINOS_SELECTED.add(Number(id));else EVENTO_REINOS_SELECTED.delete(Number(id));renderReinosEvento();}
function pesquisarReinosEvento(value){EVENTO_REINOS_SEARCH=String(value||'').toLowerCase();renderReinosEvento();const el=document.getElementById('event-realm-search');if(el){el.focus();el.setSelectionRange(el.value.length,el.value.length);}}
function renderReinosEvento(){
  const q=EVENTO_REINOS_SEARCH;const list=EVENTOS_REINOS.slice().sort((a,b)=>Number(b.id)-Number(a.id)).filter(r=>!q||`${r.id} ${r.nome} ${r.fuso}`.toLowerCase().includes(q));const existing=new Map((EVENTO_ATUAL.ocorrencias||[]).map(o=>[Number(o.reinoId),o]));
  eventoSecaoModal('🌍 Reinos do evento',`<div class="admin-section-intro">Selecionar um reino cria/atualiza sua ocorrência. Desmarcar remove somente a ocorrência deste evento. Sem ocorrência = não confirmado.</div><div class="admin-realm-tools"><input id="event-realm-search" value="${esc(EVENTO_REINOS_SEARCH)}" oninput="pesquisarReinosEvento(this.value)" placeholder="Pesquisar nome ou ID"><button class="btn btn-gold btn-sm" onclick="selecionarQuatroReinosRecentes()">Selecionar 4 mais recentes</button><button class="btn btn-ghost btn-sm" onclick="EVENTO_REINOS_SELECTED.clear();renderReinosEvento()">Limpar seleção</button></div><div class="admin-realm-selection-count">${EVENTO_REINOS_SELECTED.size} reino(s) selecionado(s)</div><div class="admin-realm-check-list">${list.map(r=>{const occ=existing.get(Number(r.id));const selected=EVENTO_REINOS_SELECTED.has(Number(r.id));return`<label class="admin-realm-check ${selected?'is-selected':''}"><input type="checkbox" ${selected?'checked':''} onchange="alternarReinoEvento(${Number(r.id)},this.checked)"><span><strong>#${r.id} ${esc(r.nome)}</strong><small>${esc(r.fuso||'Fuso não informado')}${r.aberturaEm?` · aberto ${new Date(r.aberturaEm).toLocaleDateString('pt-BR',{timeZone:'UTC'})}`:''}</small></span>${occ?`<em class="admin-status-pill is-${eventoStatusTone(occ.status)}">${eventoStatusLabel(occ.status)}</em>`:'<em class="admin-status-pill is-danger">NÃO CONFIRMADO</em>'}</label>`;}).join('')||'<div class="admin-empty">Nenhum reino encontrado.</div>'}</div>`,`<button class="btn btn-ghost" onclick="fecharModal('modal-evento-secao')">Cancelar</button><button class="btn btn-gold" onclick="salvarReinosEvento()">💾 Salvar ocorrências</button>`);
}
async function salvarReinosEvento(){
  const selected=[...EVENTO_REINOS_SELECTED];
  if(selected.length&&(!EVENTO_ATUAL.inicioServidor||!EVENTO_ATUAL.fimServidor))return toast('Cadastre primeiro o início e término em “Datas e fases”.','erro');
  const existing=new Map((EVENTO_ATUAL.ocorrencias||[]).map(o=>[Number(o.reinoId),o]));
  const ocorrencias=selected.map(id=>{const old=existing.get(id);return old?{...old,reinoId:id}:{codigo:`${EVENTO_ATUAL.slug}-${id}`,reinoId:id,confirmado:true,observacao:''};});
  await salvarSecaoEvento('reinos',{ocorrencias},'Reinos do evento atualizados.');
}
