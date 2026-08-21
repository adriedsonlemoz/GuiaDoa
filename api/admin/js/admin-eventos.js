// ── EVENTOS: núcleo e página de gerenciamento ────────────────────────────────
var EVENTOS_CACHE = [];
var EVENTOS_REINOS = [];
var EVENTO_ATUAL = null;
var EVENTO_FONTE = {};
var EVENTO_REGRAS_DRAFT = [];

function eventoClone(value) { return JSON.parse(JSON.stringify(value ?? null)); }
function eventoRegraTexto(regra) { return typeof regra === 'string' ? regra : String(regra?.texto || ''); }
function eventoStatusLabel(status) { return ({ ativo:'ATIVO', proximo:'PRÓXIMO', encerrado:'ENCERRADO', nao_confirmado:'NÃO CONFIRMADO' })[status] || String(status || '').toUpperCase(); }
function eventoStatusTone(status) { return status==='ativo'?'ok':status==='proximo'?'warn':status==='encerrado'?'muted':'danger'; }
function eventoPeriodLabel(evento) {
  const fmt = value => {
    if (!value) return 'não informado';
    const d = new Date(value); if (Number.isNaN(d.getTime())) return 'não informado';
    return new Intl.DateTimeFormat('pt-BR',{day:'2-digit',month:'2-digit',year:'numeric',hour:'2-digit',minute:'2-digit',timeZone:'UTC',hour12:false}).format(d)+' UTC';
  };
  return `${fmt(evento?.inicioServidor)} → ${fmt(evento?.fimServidor)}`;
}
function eventoCountRewards(evento) {
  return (evento?.recompensas || []).length + (evento?.fases || []).reduce((sum,f)=>sum+(f.recompensas||[]).length,0);
}
function eventoSecaoModal(titulo, conteudo, footer='') {
  let modal=document.getElementById('modal-evento-secao');
  if (!modal) {
    modal=document.createElement('div'); modal.className='modal-bg'; modal.id='modal-evento-secao';
    modal.addEventListener('click', e=>{ if(e.target===modal) fecharModal('modal-evento-secao'); });
    document.body.appendChild(modal);
  }
  modal.innerHTML=`<div class="modal-card admin-event-modal"><div class="card-header admin-event-modal-head"><h2>${titulo}</h2><button class="btn-close" onclick="fecharModal('modal-evento-secao')">✕</button></div><div class="card-body admin-event-modal-body">${conteudo}</div>${footer?`<div class="admin-event-modal-footer">${footer}</div>`:''}</div>`;
  abrirModal('modal-evento-secao');
}

async function carregarEventos() {
  setLoading('Carregando eventos…');
  try {
    const [er, rr] = await Promise.all([
      fetch(`${API}/eventos/admin/todos`, { headers:{Authorization:`Bearer ${TOKEN}`} }),
      fetch(`${API}/reinos`, { headers:{Authorization:`Bearer ${TOKEN}`} }),
    ]);
    if (er.status===401 || rr.status===401) { sair(); return; }
    const ed=await er.json(); const rd=await rr.json();
    if(!er.ok) throw new Error(ed.erro||'Falha ao carregar eventos.');
    if(!rr.ok) throw new Error(rd.erro||'Falha ao carregar reinos.');
    EVENTOS_CACHE=ed.eventos||[]; EVENTOS_REINOS=rd.reinos||[]; EVENTO_ATUAL=null;
    renderEventos(EVENTOS_CACHE);
  } catch(err) { document.getElementById('content').innerHTML=`<div class="loading" style="color:var(--red)">❌ ${esc(err.message)}</div>`; }
}

function renderEventos(lista) {
  const ocorrencias=lista.flatMap(e=>(e.ocorrencias||[]).map(o=>({...o,evento:e.nome})));
  const ativos=ocorrencias.filter(o=>o.status==='ativo').length;
  const proximos=ocorrencias.filter(o=>o.status==='proximo').length;
  document.getElementById('content').innerHTML=`
    <div class="admin-page-head"><div><span class="admin-eyebrow">Conteúdo temporal</span><h1>Eventos</h1><p>Eventos são confirmados somente nos reinos que possuem ocorrência cadastrada.</p></div><button class="btn btn-gold" onclick="abrirInformacoesGeraisEvento(null)">＋ Novo evento</button></div>
    <div class="stats-row"><div class="stat-box"><div class="stat-val">${lista.length}</div><div class="stat-lbl">Eventos</div></div><div class="stat-box"><div class="stat-val">${ocorrencias.length}</div><div class="stat-lbl">Ocorrências</div></div><div class="stat-box"><div class="stat-val">${ativos}</div><div class="stat-lbl">Ativas</div></div><div class="stat-box"><div class="stat-val">${proximos}</div><div class="stat-lbl">Próximas</div></div></div>
    <div class="admin-callout"><strong>Fonte de verdade</strong><span>Ocorrência cadastrada = confirmado. Sem ocorrência = não confirmado. A opção de selecionar os 4 reinos mais recentes é apenas um atalho do Admin.</span></div>
    <div class="admin-event-list">${lista.length?lista.map(e=>{
      const status=(e.ocorrencias||[]).some(o=>o.status==='ativo')?'ativo':(e.ocorrencias||[]).some(o=>o.status==='proximo')?'proximo':(e.ocorrencias||[]).length?'encerrado':'nao_confirmado';
      return `<button class="admin-event-list-card" onclick="abrirGerenciadorEvento(fromStrArg('${strArg(e.slug)}'))"><div class="admin-event-list-main"><span class="admin-status-pill is-${eventoStatusTone(status)}">${eventoStatusLabel(status)}</span><strong>${esc(e.nome)}</strong><small>${esc(eventoPeriodLabel(e))}</small></div><div class="admin-event-list-meta"><span>🌍 ${(e.ocorrencias||[]).length} reino(s)</span><span>◫ ${(e.fases||[]).length} fase(s)</span><span>🎁 ${eventoCountRewards(e)} grupo(s)</span></div><b>›</b></button>`;
    }).join(''):'<div class="admin-empty">Nenhum evento cadastrado.</div>'}</div>`;
}

function abrirGerenciadorEvento(slug) {
  EVENTO_ATUAL=EVENTOS_CACHE.find(e=>e.slug===slug)||null;
  if(!EVENTO_ATUAL) return toast('Evento não encontrado.','erro');
  setBreadcrumb([{label:'⚡ Eventos',action:()=>irModulo('eventos')},{label:EVENTO_ATUAL.nome,action:()=>abrirGerenciadorEvento(EVENTO_ATUAL.slug)}]);
  renderGerenciadorEvento();
}

function renderGerenciadorEvento() {
  const e=EVENTO_ATUAL; if(!e) return carregarEventos();
  const ativas=(e.ocorrencias||[]).filter(o=>o.status==='ativo');
  const proxima=(e.ocorrencias||[]).filter(o=>o.status==='proximo');
  const status=ativas.length?'ativo':proxima.length?'proximo':(e.ocorrencias||[]).length?'encerrado':'nao_confirmado';
  const section=(icon,title,desc,fn,count='')=>`<button class="admin-manage-row" onclick="${fn}"><span class="admin-manage-icon">${icon}</span><span><strong>${title}</strong><small>${desc}</small></span>${count?`<em>${count}</em>`:''}<b>›</b></button>`;
  document.getElementById('content').innerHTML=`
    <div class="admin-event-manager-head"><button class="btn btn-ghost btn-sm" onclick="irModulo('eventos')">‹ Eventos</button><div class="admin-event-manager-title"><span class="admin-status-pill is-${eventoStatusTone(status)}">${eventoStatusLabel(status)}</span><h1>${esc(e.nome)}</h1><p>${esc(e.resumo||'Sem resumo cadastrado.')}</p><small>${esc(eventoPeriodLabel(e))}</small></div><div class="admin-event-manager-actions"><button class="btn btn-navy btn-sm" onclick="abrirInformacoesGeraisEvento(EVENTO_ATUAL)">✏ Editar</button><button class="btn btn-ghost btn-sm" onclick="clonarEventoAtual()">⧉ Clonar</button><button class="btn btn-red btn-sm" onclick="excluirEventoComImpacto()">🗑 Excluir</button></div></div>
    <div class="admin-manage-card"><div class="admin-manage-card-title">Configuração</div>
      ${section('ℹ️','Informações gerais','Nome, descrição, categoria, imagem e disponibilidade.','abrirInformacoesGeraisEvento(EVENTO_ATUAL)')}
      ${section('🗓️','Datas e fases','Período oficial, fases, dia do evento e prévia automática.','abrirDatasFasesEvento()',`${(e.fases||[]).length}`)}
      ${section('🌍','Reinos','Ocorrências confirmadas por reino e atalho dos 4 mais recentes.','abrirReinosEvento()',`${(e.ocorrencias||[]).length}`)}
      ${section('🎁','Recompensas','Metas individuais, ranking, faixas e múltiplos itens.','abrirRecompensasEvento()',`${eventoCountRewards(e)}`)}
      ${section('›','Regras','Instruções estruturadas exibidas no guia e no botão Copiar.','abrirRegrasEvento()',`${(e.regras||[]).length}`)}
      ${section('🕘','Histórico','Ocorrências, fonte e alterações registradas.','abrirHistoricoEvento()',`${(e.historico||[]).length}`)}
    </div>
    <div class="admin-callout compact"><strong>Encerramento automático</strong><span>O campo “disponível no guia” não precisa ser desligado quando o evento termina. Home e status usam as datas; ao atingir o término, o destaque ativo desaparece automaticamente.</span></div>`;
}


async function clonarEventoAtual(){
  if(!EVENTO_ATUAL)return;
  if(!confirm(`Clonar "${EVENTO_ATUAL.nome}"? A cópia manterá estrutura, fases, regras e recompensas, mas ficará sem datas e sem reinos confirmados.`))return;
  try{
    const r=await fetch(`${API}/eventos/admin/${EVENTO_ATUAL.slug}/clonar`,{method:'POST',headers:{Authorization:`Bearer ${TOKEN}`}});const d=await r.json();
    if(!r.ok)return toast(d.erro||'Erro ao clonar evento.','erro');
    EVENTOS_CACHE.push(d);EVENTO_ATUAL=d;toast('Evento clonado. Confirme novas datas e reinos antes de usar.','ok');renderGerenciadorEvento();
  }catch(err){toast('Erro: '+err.message,'erro');}
}

function abrirModalEvento(e) { abrirInformacoesGeraisEvento(e||null); }
function abrirInformacoesGeraisEvento(evento) {
  const novo=!evento;
  const e=evento||{nome:'',slug:'',resumo:'',descricao:'',imagem:'',categoria:'geral',ativo:true,i18n:{}};
  EVENTO_FONTE=eventoClone(e.fonte||{});
  eventoSecaoModal(novo?'⚡ Novo evento':'ℹ️ Informações gerais',`
    <div class="admin-form-section"><h3>Identificação</h3><div class="grid2"><div class="field"><label>Nome *</label><input id="eg-nome" value="${esc(e.nome||'')}"></div><div class="field"><label>Slug</label><input id="eg-slug" value="${esc(e.slug||'')}" placeholder="gerado pelo nome"></div></div><div class="field"><label>Categoria</label><input id="eg-categoria" value="${esc(e.categoria||'geral')}"></div></div>
    <div class="admin-form-section"><h3>Conteúdo</h3><div class="field"><label>Resumo PT-BR</label><textarea id="eg-resumo" rows="2">${esc(e.resumo||'')}</textarea></div><div class="field"><label>Descrição PT-BR</label><textarea id="eg-descricao" rows="4">${esc(e.descricao||'')}</textarea></div><div class="field"><label>Imagem existente / URL</label><input id="eg-imagem" value="${esc(e.imagem||'')}" placeholder="Deixe vazio quando não houver imagem cadastrada"></div></div>
    <div class="admin-form-section"><h3>English</h3><div class="field"><label>Name</label><input id="eg-en-nome" value="${esc(e.i18n?.['en-US']?.nome||'')}"></div><div class="field"><label>Summary</label><textarea id="eg-en-resumo" rows="2">${esc(e.i18n?.['en-US']?.resumo||'')}</textarea></div><div class="field"><label>Description</label><textarea id="eg-en-descricao" rows="3">${esc(e.i18n?.['en-US']?.descricao||'')}</textarea></div></div>
    <label class="admin-toggle-row"><input id="eg-ativo" type="checkbox" ${e.ativo!==false?'checked':''}><span><strong>Disponível no guia</strong><small>Não controla o encerramento. O status ativo/próximo/encerrado é calculado pelas datas.</small></span></label>`,
    `<button class="btn btn-ghost" onclick="fecharModal('modal-evento-secao')">Cancelar</button><button class="btn btn-gold" onclick="salvarInformacoesGeraisEvento(${novo?'true':'false'})">💾 ${novo?'Criar evento':'Salvar'}</button>`);
}

async function salvarInformacoesGeraisEvento(novo=false) {
  const nome=document.getElementById('eg-nome').value.trim(); if(!nome) return toast('Informe o nome do evento.','erro');
  const gerais={nome,slug:document.getElementById('eg-slug').value.trim(),resumo:document.getElementById('eg-resumo').value.trim(),descricao:document.getElementById('eg-descricao').value.trim(),imagem:document.getElementById('eg-imagem').value.trim(),categoria:document.getElementById('eg-categoria').value.trim()||'geral',ativo:document.getElementById('eg-ativo').checked,fonte:EVENTO_FONTE,i18n:{'en-US':{nome:document.getElementById('eg-en-nome').value.trim(),resumo:document.getElementById('eg-en-resumo').value.trim(),descricao:document.getElementById('eg-en-descricao').value.trim()}}};
  try {
    let r;
    if(novo) r=await fetch(`${API}/eventos`,{method:'POST',headers:{'Content-Type':'application/json',Authorization:`Bearer ${TOKEN}`},body:JSON.stringify({...gerais,servidorFuso:'UTC',horarioReset:'00:00',fases:[],recompensas:[],regras:[],ocorrencias:[]})});
    else r=await fetch(`${API}/eventos/${EVENTO_ATUAL.slug}/secao/gerais`,{method:'PATCH',headers:{'Content-Type':'application/json',Authorization:`Bearer ${TOKEN}`},body:JSON.stringify(gerais)});
    const d=await r.json(); if(!r.ok) return toast(d.erro||'Erro ao salvar.','erro');
    fecharModal('modal-evento-secao'); await atualizarEventoLocal(d); toast(novo?'Evento criado.':'Informações salvas.','ok');
    if(novo) abrirGerenciadorEvento(d.slug); else renderGerenciadorEvento();
  } catch(err){toast('Erro: '+err.message,'erro');}
}

async function atualizarEventoLocal(evento) {
  const idx=EVENTOS_CACHE.findIndex(e=>e.slug===EVENTO_ATUAL?.slug || e.slug===evento.slug);
  if(idx>=0) EVENTOS_CACHE[idx]=evento; else EVENTOS_CACHE.push(evento);
  EVENTO_ATUAL=evento;
}

function eventoEnsureRuleEn(index){const rule=EVENTO_REGRAS_DRAFT[index];rule.i18n=rule.i18n||{};rule.i18n['en-US']=rule.i18n['en-US']||{};return rule.i18n['en-US'];}

function abrirRegrasEvento() {
  EVENTO_REGRAS_DRAFT=(EVENTO_ATUAL.regras||[]).map((r,i)=>typeof r==='string'?{id:`regra-${i+1}`,ordem:i,texto:r,i18n:{}}:eventoClone(r));
  renderRegrasEvento();
}
function renderRegrasEvento() {
  eventoSecaoModal('› Regras do evento',`<div class="admin-section-intro">Cada regra fica estruturada separadamente. O guia adiciona o indicador visual automaticamente.</div><div id="event-rule-list">${EVENTO_REGRAS_DRAFT.map((r,i)=>`<div class="admin-rule-edit"><span>›</span><div class="admin-rule-copy"><label>PT-BR</label><textarea rows="2" onchange="EVENTO_REGRAS_DRAFT[${i}].texto=this.value">${esc(r.texto||'')}</textarea><label>English <small>opcional</small></label><textarea rows="2" onchange="eventoEnsureRuleEn(${i}).texto=this.value">${esc(r.i18n?.['en-US']?.texto||'')}</textarea></div><button class="btn btn-red btn-sm" onclick="removerRegraEvento(${i})">Remover</button></div>`).join('')||'<div class="admin-empty">Nenhuma regra cadastrada.</div>'}</div><button class="btn btn-ghost btn-sm" onclick="adicionarRegraEvento()">＋ Adicionar regra</button>`,`<button class="btn btn-ghost" onclick="fecharModal('modal-evento-secao')">Cancelar</button><button class="btn btn-gold" onclick="salvarRegrasEvento()">💾 Salvar regras</button>`);
}
function adicionarRegraEvento(){EVENTO_REGRAS_DRAFT.push({id:`regra-${Date.now()}`,ordem:EVENTO_REGRAS_DRAFT.length,texto:'',i18n:{}});renderRegrasEvento();}
function removerRegraEvento(i){EVENTO_REGRAS_DRAFT.splice(i,1);renderRegrasEvento();}
async function salvarRegrasEvento(){const regras=EVENTO_REGRAS_DRAFT.map((r,i)=>({...r,ordem:i,texto:String(r.texto||'').trim()})).filter(r=>r.texto);await salvarSecaoEvento('regras',{regras},'Regras salvas.');}

function abrirHistoricoEvento(){
  const e=EVENTO_ATUAL; const history=e.historico||[];
  const occ=(e.ocorrencias||[]).slice().sort((a,b)=>new Date(b.inicioServidor)-new Date(a.inicioServidor));
  eventoSecaoModal('🕘 Histórico',`<div class="admin-form-section"><h3>Fonte</h3><div class="admin-info-grid"><div><small>Tipo</small><strong>${esc(e.fonte?.tipo||'não informado')}</strong></div><div><small>Data</small><strong>${esc(e.fonte?.data||'não informada')}</strong></div></div>${e.fonte?.descricao?`<p class="admin-muted-copy">${esc(e.fonte.descricao)}</p>`:''}</div><div class="admin-form-section"><h3>Ocorrências</h3>${occ.map(o=>`<div class="admin-history-row"><span class="admin-status-pill is-${eventoStatusTone(o.status)}">${eventoStatusLabel(o.status)}</span><div><strong>#${o.reinoId} ${esc(o.reinoNome)}</strong><small>${esc(eventoPeriodLabel({inicioServidor:o.inicioServidor,fimServidor:o.fimServidor}))}</small></div></div>`).join('')||'<div class="admin-empty">Sem ocorrências.</div>'}</div><div class="admin-form-section"><h3>Histórico registrado</h3>${history.map(h=>`<div class="admin-history-row"><span>🕘</span><div><strong>${esc(h.tipo||'Atualização')}</strong><small>${h.data?new Date(h.data).toLocaleString('pt-BR'):'Data não informada'}</small><p>${esc(h.descricao||'')}</p></div></div>`).join('')||'<div class="admin-empty">Nenhuma entrada de histórico cadastrada.</div>'}</div>`,`<button class="btn btn-gold" onclick="fecharModal('modal-evento-secao')">Fechar</button>`);
}

async function salvarSecaoEvento(secao,payload,mensagem='Alterações salvas.') {
  try { const r=await fetch(`${API}/eventos/${EVENTO_ATUAL.slug}/secao/${secao}`,{method:'PATCH',headers:{'Content-Type':'application/json',Authorization:`Bearer ${TOKEN}`},body:JSON.stringify(payload)}); const d=await r.json(); if(!r.ok){const extra=d.detalhes?.indice!=null?` (ocorrência ${d.detalhes.indice+1})`:'';return toast((d.erro||'Erro ao salvar.')+extra,'erro');} fecharModal('modal-evento-secao'); await atualizarEventoLocal(d); renderGerenciadorEvento(); toast(mensagem,'ok'); return d; } catch(err){toast('Erro: '+err.message,'erro');}
}

async function excluirEventoComImpacto() {
  try {
    const r=await fetch(`${API}/eventos/admin/${EVENTO_ATUAL.slug}/impacto-exclusao`,{headers:{Authorization:`Bearer ${TOKEN}`}}); const d=await r.json(); if(!r.ok)return toast(d.erro||'Erro ao verificar evento.','erro'); const i=d.impacto||{};
    const msg=`Excluir "${EVENTO_ATUAL.nome}"?\n\nSerá removido junto:\n• ${i.ocorrencias||0} ocorrência(s)\n• ${i.reinos||0} reino(s) vinculado(s)\n• ${i.fases||0} fase(s)\n• ${i.recompensas||0} grupo(s) de recompensa\n• ${i.historico||0} registro(s) de histórico\n\nEsta ação não pode ser desfeita.`;
    if(!confirm(msg))return;
    const del=await fetch(`${API}/eventos/${EVENTO_ATUAL.slug}?confirmar=sim`,{method:'DELETE',headers:{Authorization:`Bearer ${TOKEN}`}}); const dd=await del.json().catch(()=>({})); if(!del.ok)return toast(dd.erro||'Erro ao excluir.','erro'); toast('Evento removido.','ok'); irModulo('eventos');
  } catch(err){toast('Erro: '+err.message,'erro');}
}
function deletarEvento(slug){EVENTO_ATUAL=EVENTOS_CACHE.find(e=>e.slug===slug)||null;if(EVENTO_ATUAL)excluirEventoComImpacto();}
