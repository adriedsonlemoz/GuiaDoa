// ── EVENTOS ──────────────────────────────────────────────────────────────────
let EVENTO_EDITANDO = null;
let EVENTOS_REINOS = [];
let EVENTO_OCORRENCIAS = [];
let EVENTO_FONTE = {};

function dataHoraUtcInput(value) {
  if (!value) return '';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '';
  return d.toISOString().slice(0,16);
}

function eventoStatusLabel(status) {
  return ({ ativo:'ATIVO', proximo:'PRÓXIMO', encerrado:'ENCERRADO', nao_confirmado:'NÃO CONFIRMADO' })[status] || String(status || '').toUpperCase();
}

async function carregarEventos() {
  setLoading('Carregando eventos…');
  try {
    const [er, rr] = await Promise.all([
      fetch(`${API}/eventos/admin/todos`, { headers:{Authorization:`Bearer ${TOKEN}`} }),
      fetch(`${API}/reinos`, { headers:{Authorization:`Bearer ${TOKEN}`} }),
    ]);
    if (er.status===401 || rr.status===401) { sair(); return; }
    const ed = await er.json(); const rd = await rr.json();
    if (!er.ok) throw new Error(ed.erro || 'Falha ao carregar eventos.');
    if (!rr.ok) throw new Error(rd.erro || 'Falha ao carregar reinos.');
    EVENTOS_REINOS = rd.reinos || [];
    renderEventos(ed.eventos || []);
  } catch(err) {
    document.getElementById('content').innerHTML = `<div class="loading" style="color:var(--red)">❌ ${esc(err.message)}</div>`;
  }
}

function renderEventos(lista) {
  const ocorrencias = lista.flatMap(e => (e.ocorrencias || []).map(o => ({...o, evento:e.nome})));
  const ativos = ocorrencias.filter(o => o.status === 'ativo').length;
  const proximos = ocorrencias.filter(o => o.status === 'proximo').length;
  document.getElementById('content').innerHTML = `
    <div class="stats-row">
      <div class="stat-box"><div class="stat-val">${lista.length}</div><div class="stat-lbl">Eventos</div></div>
      <div class="stat-box"><div class="stat-val">${ocorrencias.length}</div><div class="stat-lbl">Ocorrências</div></div>
      <div class="stat-box"><div class="stat-val">${ativos}</div><div class="stat-lbl">Ativas</div></div>
      <div class="stat-box"><div class="stat-val">${proximos}</div><div class="stat-lbl">Próximas</div></div>
    </div>
    <div class="card">
      <div class="card-header"><h2>⚡ Eventos por reino</h2><button class="btn btn-gold btn-sm" onclick="abrirModalEvento(null)">＋ Novo Evento</button></div>
      <div class="card-body">
        <div style="padding:9px 11px;background:#f6eed8;border-left:4px solid var(--gold);font-size:.7rem;line-height:1.45;margin-bottom:12px">
          <strong>Regra:</strong> um evento só é considerado confirmado em um reino quando existe uma ocorrência cadastrada para ele. Ausência de ocorrência não significa que o evento não acontece.
        </div>
        ${lista.length ? lista.map(e => `
          <div style="border:1px solid rgba(128,96,51,.22);border-radius:10px;padding:12px;margin-bottom:10px;background:#fffdf6">
            <div style="display:flex;gap:10px;align-items:flex-start;justify-content:space-between">
              <div><div style="font-weight:900;color:var(--dark)">${esc(e.nome)}</div><div style="font-size:.64rem;color:var(--muted);margin-top:2px">${esc(e.slug)} · reset ${esc(e.horarioReset || '00:00')} ${esc(e.servidorFuso || 'UTC')}</div></div>
              <div style="display:flex;gap:5px"><button class="btn btn-navy btn-sm" onclick="abrirModalEvento(fromDataArg('${dataArg(e)}'))">✏ Editar</button><button class="btn btn-red btn-sm" onclick="deletarEvento(fromStrArg('${strArg(e.slug)}'),fromStrArg('${strArg(e.nome)}'))">🗑</button></div>
            </div>
            <div style="margin-top:10px;display:flex;flex-wrap:wrap;gap:6px">${(e.ocorrencias || []).filter(o=>o.confirmado!==false).map(o => `<span style="font-size:.62rem;font-weight:900;padding:5px 7px;border-radius:999px;background:${o.status==='ativo'?'#e1eee7':o.status==='proximo'?'#fff1cf':'#eee8dd'};color:#5c513d;border:1px solid rgba(128,96,51,.18)">${esc(o.reinoNome)} · ${eventoStatusLabel(o.status)}</span>`).join('') || '<span style="font-size:.66rem;color:var(--muted)">Nenhum reino confirmado.</span>'}</div>
          </div>`).join('') : '<p style="text-align:center;color:var(--muted);padding:24px">Nenhum evento cadastrado.</p>'}
      </div>
    </div>`;
}

function garantirModalEvento() {
  if (document.getElementById('modal-evento')) return;
  const wrap = document.createElement('div');
  wrap.innerHTML = `<div class="modal-bg" id="modal-evento"><div class="modal-card" style="max-width:760px;width:100%">
    <div class="card-header" style="padding:12px 16px"><h2 id="me-titulo">⚡ Evento</h2><button class="btn-close" onclick="fecharModal('modal-evento')">✕</button></div>
    <div class="card-body" style="padding:16px;max-height:76vh;overflow:auto">
      <div class="grid2"><div class="field"><label>Nome *</label><input id="me-nome"></div><div class="field"><label>Slug</label><input id="me-slug" placeholder="gerado pelo nome"></div></div>
      <div class="field"><label>Resumo PT-BR</label><textarea id="me-resumo" rows="2"></textarea></div>
      <div class="field"><label>Descrição PT-BR</label><textarea id="me-descricao" rows="3"></textarea></div>
      <div class="grid2"><div class="field"><label>Categoria</label><input id="me-categoria" value="geral"></div><div class="field"><label>Reset oficial</label><input id="me-reset" value="00:00 UTC" disabled></div></div>
      <label style="display:flex;align-items:center;gap:8px;font-size:.72rem;font-weight:800;margin:3px 0 12px"><input id="me-ativo" type="checkbox" checked style="width:auto"> Evento disponível no guia</label>
      <div class="i18n-section"><div class="i18n-title">🌐 English</div><div class="grid2"><div class="field"><label>Name</label><input id="me-en-nome"></div><div class="field"><label>Summary</label><input id="me-en-resumo"></div></div><div class="field"><label>Description</label><textarea id="me-en-descricao" rows="2"></textarea></div></div>
      <div class="field"><label>Regras (uma por linha)</label><textarea id="me-regras" rows="4"></textarea></div>
      <div class="field"><label>Fases e recompensas (JSON)</label><textarea id="me-fases" rows="10" spellcheck="false" style="font-family:monospace;font-size:.68rem"></textarea><small style="color:var(--muted)">Cada fase usa codigo, nome, diaInicio, diaFim, objetivo e recompensas. O JSON permite preservar recompensas detalhadas sem limitar o formato.</small></div>
      <div class="field"><label>Recompensas finais do evento (JSON)</label><textarea id="me-recompensas" rows="7" spellcheck="false" style="font-family:monospace;font-size:.68rem"></textarea><small style="color:var(--muted)">Use para os prêmios finais de classificação do evento, separados das recompensas de cada fase.</small></div>
      <div style="display:flex;align-items:center;justify-content:space-between;margin:14px 0 7px"><strong style="font-size:.8rem">🌍 Ocorrências confirmadas por reino</strong><button class="btn btn-gold btn-sm" onclick="adicionarOcorrenciaEvento()">＋ Ocorrência</button></div>
      <div style="font-size:.65rem;color:var(--muted);margin-bottom:8px">Datas são informadas no relógio oficial do evento (UTC). O fuso do reino é apenas referência e não desloca o reset global.</div>
      <div id="me-ocorrencias"></div>
      <div style="display:flex;gap:8px;justify-content:flex-end;margin-top:14px"><button class="btn btn-ghost" onclick="fecharModal('modal-evento')">Cancelar</button><button class="btn btn-gold" onclick="salvarEvento()">💾 Salvar Evento</button></div>
    </div></div></div>`;
  document.body.appendChild(wrap.firstElementChild);
}

function abrirModalEvento(e) {
  garantirModalEvento(); EVENTO_EDITANDO = e?.slug || null;
  document.getElementById('me-titulo').textContent = e ? `✏ ${e.nome}` : '⚡ Novo Evento';
  document.getElementById('me-nome').value = e?.nome || '';
  document.getElementById('me-slug').value = e?.slug || '';
  document.getElementById('me-resumo').value = e?.resumo || '';
  document.getElementById('me-descricao').value = e?.descricao || '';
  document.getElementById('me-categoria').value = e?.categoria || 'geral';
  document.getElementById('me-ativo').checked = e?.ativo !== false;
  document.getElementById('me-en-nome').value = e?.i18n?.['en-US']?.nome || '';
  document.getElementById('me-en-resumo').value = e?.i18n?.['en-US']?.resumo || '';
  document.getElementById('me-en-descricao').value = e?.i18n?.['en-US']?.descricao || '';
  document.getElementById('me-regras').value = (e?.regras || []).join('\n');
  document.getElementById('me-fases').value = JSON.stringify(e?.fases || [], null, 2);
  document.getElementById('me-recompensas').value = JSON.stringify(e?.recompensas || [], null, 2);
  EVENTO_FONTE = e?.fonte || {};
  EVENTO_OCORRENCIAS = (e?.ocorrencias || []).map(o => ({...o, inicioServidor:dataHoraUtcInput(o.inicioServidor), fimServidor:dataHoraUtcInput(o.fimServidor)}));
  renderOcorrenciasEvento(); abrirModal('modal-evento');
}

function adicionarOcorrenciaEvento() {
  EVENTO_OCORRENCIAS.push({ codigo:'', reinoId:'', reinoNome:'', fusoReino:'', inicioServidor:'', fimServidor:'', confirmado:true, observacao:'' });
  renderOcorrenciasEvento();
}
function removerOcorrenciaEvento(i) { EVENTO_OCORRENCIAS.splice(i,1); renderOcorrenciasEvento(); }
function atualizarOcorrenciaEvento(i,campo,valor) {
  EVENTO_OCORRENCIAS[i][campo]=valor;
  if (campo==='reinoId') { const r=EVENTOS_REINOS.find(x=>Number(x.id)===Number(valor)); if(r){EVENTO_OCORRENCIAS[i].reinoNome=r.nome;EVENTO_OCORRENCIAS[i].fusoReino=r.fuso;} renderOcorrenciasEvento(); }
}
function renderOcorrenciasEvento() {
  const el=document.getElementById('me-ocorrencias'); if(!el)return;
  el.innerHTML = EVENTO_OCORRENCIAS.length ? EVENTO_OCORRENCIAS.map((o,i)=>`<div style="border:1px solid rgba(128,96,51,.22);border-radius:9px;padding:10px;margin-bottom:8px;background:#fbf7e9">
    <div class="grid2"><div class="field"><label>Reino *</label><select onchange="atualizarOcorrenciaEvento(${i},'reinoId',this.value)"><option value="">— Selecionar —</option>${EVENTOS_REINOS.slice().sort((a,b)=>Number(b.id)-Number(a.id)).map(r=>`<option value="${r.id}" ${Number(o.reinoId)===Number(r.id)?'selected':''}>#${r.id} ${esc(r.nome)} (${esc(r.fuso)})</option>`).join('')}</select></div><div class="field"><label>Código</label><input value="${esc(o.codigo||'')}" onchange="atualizarOcorrenciaEvento(${i},'codigo',this.value)"></div></div>
    <div class="grid2"><div class="field"><label>Início UTC *</label><input type="datetime-local" value="${esc(o.inicioServidor||'')}" onchange="atualizarOcorrenciaEvento(${i},'inicioServidor',this.value)"></div><div class="field"><label>Fim UTC *</label><input type="datetime-local" value="${esc(o.fimServidor||'')}" onchange="atualizarOcorrenciaEvento(${i},'fimServidor',this.value)"></div></div>
    <div style="display:flex;justify-content:space-between;gap:8px;align-items:center"><span style="font-size:.63rem;color:var(--muted)">${esc(o.reinoNome||'')} ${esc(o.fusoReino||'')}</span><button class="btn btn-red btn-sm" onclick="removerOcorrenciaEvento(${i})">Remover</button></div>
  </div>`).join('') : '<div style="padding:12px;text-align:center;color:var(--muted);font-size:.68rem">Sem ocorrências. Neste estado o evento não fica confirmado em nenhum reino.</div>';
}

async function salvarEvento() {
  const nome=document.getElementById('me-nome').value.trim(); if(!nome)return toast('Informe o nome do evento.','erro');
  let fases=[]; try { fases=JSON.parse(document.getElementById('me-fases').value || '[]'); if(!Array.isArray(fases))throw new Error(); } catch { return toast('JSON de fases inválido.','erro'); }
  let recompensas=[]; try { recompensas=JSON.parse(document.getElementById('me-recompensas').value || '[]'); if(!Array.isArray(recompensas))throw new Error(); } catch { return toast('JSON de recompensas finais inválido.','erro'); }
  const ocorrencias=EVENTO_OCORRENCIAS.map((o,i)=>({ ...o, codigo:o.codigo || `${o.reinoId}-${i+1}`, reinoId:Number(o.reinoId), inicioServidor:o.inicioServidor ? `${o.inicioServidor}:00.000Z` : '', fimServidor:o.fimServidor ? `${o.fimServidor}:00.000Z` : '', confirmado:true }));
  if (ocorrencias.some(o=>!o.reinoId || !o.inicioServidor || !o.fimServidor)) return toast('Complete reino, início e fim de cada ocorrência.','erro');
  const payload={
    nome,
    slug:document.getElementById('me-slug').value.trim(),
    resumo:document.getElementById('me-resumo').value.trim(),
    descricao:document.getElementById('me-descricao').value.trim(),
    categoria:document.getElementById('me-categoria').value.trim()||'geral',
    servidorFuso:'UTC', horarioReset:'00:00',
    ativo:document.getElementById('me-ativo').checked,
    regras:document.getElementById('me-regras').value.split('\n').map(x=>x.trim()).filter(Boolean),
    fases, recompensas, ocorrencias,
    fonte:EVENTO_FONTE,
    i18n:{'en-US':{
      nome:document.getElementById('me-en-nome').value.trim(),
      resumo:document.getElementById('me-en-resumo').value.trim(),
      descricao:document.getElementById('me-en-descricao').value.trim()
    }}
  };
  try {
    const r=await fetch(EVENTO_EDITANDO?`${API}/eventos/${EVENTO_EDITANDO}`:`${API}/eventos`,{method:EVENTO_EDITANDO?'PUT':'POST',headers:{'Content-Type':'application/json',Authorization:`Bearer ${TOKEN}`},body:JSON.stringify(payload)}); const d=await r.json(); if(!r.ok)return toast(d.erro||'Erro ao salvar.','erro');
    fecharModal('modal-evento'); toast('Evento salvo.','ok'); carregarEventos();
  } catch(err){ toast('Erro: '+err.message,'erro'); }
}

async function deletarEvento(slug,nome) {
  if(!confirm(`Excluir o evento "${nome}"?`))return;
  const r=await fetch(`${API}/eventos/${slug}`,{method:'DELETE',headers:{Authorization:`Bearer ${TOKEN}`}}); const d=await r.json().catch(()=>({})); if(!r.ok)return toast(d.erro||'Erro ao excluir.','erro'); toast('Evento removido.','ok'); carregarEventos();
}
