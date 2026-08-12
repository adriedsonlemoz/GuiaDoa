// TRADUÇÕES — editor de itens e ações em lote
function renderListaCategoria(){
  const cat=TR_CAT;
  if(!cat) return;

  const filtrados = TR_FILTRO==='sem'      ? TR_DADOS.filter(d=>!d.traducao)
    : TR_FILTRO==='rascunho' ? TR_DADOS.filter(d=>d.status==='rascunho'&&d.traducao)
    : TR_FILTRO==='revisado' ? TR_DADOS.filter(d=>d.status==='revisado')
    : TR_FILTRO==='ativo'    ? TR_DADOS.filter(d=>d.status==='ativo')
    : TR_DADOS;

  const total=TR_DADOS.length;
  const ativos=TR_DADOS.filter(d=>d.status==='ativo').length;
  const rascunho=TR_DADOS.filter(d=>d.status==='rascunho'&&d.traducao).length;
  const semTrad=TR_DADOS.filter(d=>!d.traducao).length;
  const pct=total?Math.round((ativos/total)*100):0;

  const filtros=['todos','sem','rascunho','revisado','ativo'];
  const fLabels={todos:`Todos (${total})`,sem:`Sem tradução (${semTrad})`,
    rascunho:`Rascunho (${rascunho})`,revisado:'Revisado',ativo:`Ativo (${ativos})`};

  const cardId=chave=>'tr-card-'+chave.replace(/[^a-z0-9]/gi,'-');
  const inpId =chave=>'tr-inp-' +chave.replace(/[^a-z0-9]/gi,'-');
  const bdgId =chave=>'tr-bdg-' +chave.replace(/[^a-z0-9]/gi,'-');
  const safe  =chave=>chave.replace(/'/g,"\\'");

  document.getElementById('content').innerHTML = TR_CSS + `
    <!-- Toolbar -->
    <div class="tr-toolbar">
      <span style="font-size:1.5rem">${cat.icon}</span>
      <div style="flex:1">
        <div style="font-family:'Cinzel',serif;font-weight:700;font-size:0.85rem;color:var(--text)">${esc(cat.label)}</div>
        <div style="font-size:0.68rem;color:var(--muted)">${cat.desc}</div>
      </div>
      <button class="btn btn-navy btn-sm" onclick="syncCategoria()">↻ Sincronizar</button>
      <button class="btn btn-navy btn-sm" onclick="autoTraduzirCategoria()">⚡ Auto-traduzir</button>
      <button class="tr-btn tr-btn-rev" style="padding:5px 11px" onclick="ativarRascunhosCategoria()">✓ Ativar rascunhos</button>
      <button class="tr-btn tr-btn-rev" style="padding:5px 11px" onclick="ativarRevisadosCategoria()">✓ Ativar revisados</button>
    </div>

    ${TR_ULTIMO_ERRO_AUTO && TR_ULTIMO_ERRO_AUTO.catId===cat.id ? `
    <div class="tr-diag erro" style="display:flex;justify-content:space-between;align-items:flex-start;gap:10px">
      <div>
        <strong>⚠️ ${TR_ULTIMO_ERRO_AUTO.erros.length} entrada${TR_ULTIMO_ERRO_AUTO.erros.length>1?'s':''} não foram traduzidas:</strong>
        <ul style="margin:6px 0 0 18px;padding:0">
          ${TR_ULTIMO_ERRO_AUTO.erros.slice(0,8).map(e=>
            `<li style="margin-bottom:2px"><code style="font-size:0.68rem">${esc(e.chave)}</code> — ${esc(e.erro)}</li>`
          ).join('')}
          ${TR_ULTIMO_ERRO_AUTO.erros.length>8?`<li style="color:var(--muted)">e mais ${TR_ULTIMO_ERRO_AUTO.erros.length-8}…</li>`:''}
        </ul>
        <div style="font-size:0.7rem;margin-top:6px;color:var(--muted)">
          Use o filtro <strong>Sem tradução</strong> abaixo pra achá-las e tentar de novo.
        </div>
      </div>
      <button class="btn btn-ghost btn-sm" style="flex-shrink:0" onclick="TR_ULTIMO_ERRO_AUTO=null;renderListaCategoria()">✕</button>
    </div>` : ''}

    <!-- Progresso -->
    <div style="margin-bottom:12px">
      <div style="display:flex;justify-content:space-between;margin-bottom:4px">
        <span style="font-size:0.68rem;color:var(--muted)">Progresso</span>
        <span style="font-size:0.68rem;color:${cat.cor};font-weight:700">${pct}% — ${ativos}/${total} ativos</span>
      </div>
      <div class="tr-progress-bar" style="height:7px">
        <div class="tr-progress-fill" style="width:${pct}%;background:${cat.cor}"></div>
      </div>
    </div>

    <!-- Filtros -->
    <div class="tr-filtros">
      ${filtros.map(f=>`<button class="tr-filtro ${TR_FILTRO===f?'on':''}"
        onclick="TR_FILTRO='${f}';renderListaCategoria()">${fLabels[f]}</button>`).join('')}
    </div>

    <!-- Cards -->
    <div class="tr-cards">
      ${filtrados.length===0?`
        <div style="text-align:center;padding:40px 20px;color:var(--muted)">
          <p style="font-size:1.4rem;margin-bottom:8px">📭</p>
          <p>Nenhuma entrada para este filtro.</p>
          ${semTrad>0&&TR_FILTRO!=='sem'
            ?`<p style="font-size:0.72rem;margin-top:6px">Tente o filtro <strong>Sem tradução</strong>.</p>`:''}
        </div>`
      :filtrados.map(doc=>{
        const exp=TR_EXPAND===doc.chave;
        return `<div class="tr-card" id="${cardId(doc.chave)}">
          <div class="tr-card-head" onclick="toggleExpandTr(fromStrArg('${strArg(doc.chave)}'))">
            <div class="tr-col">
              <div class="lbl">🇧🇷 Português</div>
              <div class="val">${esc(doc.textoPT)}</div>
            </div>
            <div class="tr-col">
              <div class="lbl">🇺🇸 ${TR_LOCALE}</div>
              <div class="val ${doc.traducao?'en':'vazio'}">${doc.traducao?esc(doc.traducao):'Sem tradução'}</div>
            </div>
            <div style="flex-shrink:0;margin:0 4px">${badgeTr(doc)}</div>
            <span class="tr-chevron ${exp?'open':''}">›</span>
          </div>
          ${exp?`<div class="tr-card-body">
            <span class="tr-chave-tag">🔑 ${esc(doc.chave)}</span>
            <div class="tr-field">
              <label>🇧🇷 Original</label>
              <input type="text" value="${esc(doc.textoPT)}" readonly />
            </div>
            <div class="tr-field">
              <label>🇺🇸 Tradução</label>
              <input type="text" id="${inpId(doc.chave)}"
                value="${esc(doc.traducao||'')}" placeholder="Digite aqui e clique Salvar…"
                onkeydown="if(event.key==='Enter'){salvarTrItem(fromStrArg('${strArg(doc.chave)}'))}"/>
            </div>
            <div class="tr-acoes">
              <button class="tr-btn tr-btn-auto" onclick="autoTraduzirItem(fromStrArg('${strArg(doc.chave)}'))">⚡ Auto</button>
              <button class="tr-btn tr-btn-save" onclick="salvarTrItem(fromStrArg('${strArg(doc.chave)}'))">💾 Salvar</button>
              <button class="tr-btn tr-btn-rev"  onclick="mudarStatusTrItem(fromStrArg('${strArg(doc.chave)}'),'revisado')">✓ Revisar</button>
              <button class="tr-btn tr-btn-ativ ${doc.status==='ativo'?'on':''}"
                onclick="mudarStatusTrItem(fromStrArg('${strArg(doc.chave)}'),'ativo')">
                ${doc.status==='ativo'?'✓ Ativo':'Ativar'}
              </button>
              <span id="${bdgId(doc.chave)}" style="margin-left:auto">${badgeTr(doc)}</span>
            </div>
          </div>`:''}
        </div>`;
      }).join('')}
    </div>`;
}

function toggleExpandTr(chave){
  TR_EXPAND=TR_EXPAND===chave?null:chave;
  renderListaCategoria();
  if(TR_EXPAND){
    const id='tr-card-'+chave.replace(/[^a-z0-9]/gi,'-');
    setTimeout(()=>document.getElementById(id)?.scrollIntoView({behavior:'smooth',block:'nearest'}),60);
  }
}

// ── Salvar item ───────────────────────────────────────────────────────────────
async function salvarTrItem(chave){
  const inp=document.getElementById('tr-inp-'+chave.replace(/[^a-z0-9]/gi,'-'));
  if(!inp) return;
  const traducao=inp.value.trim();
  if(!traducao){toast('Digite a tradução antes de salvar','aviso');inp.focus();return;}
  const doc=TR_DADOS.find(d=>d.chave===chave);
  if(!doc) return;
  try{
    let resultado;
    if(doc._id){
      const r=await fetch(`${API}/traducoes/${doc._id}`,{
        method:'PATCH',headers:{'Content-Type':'application/json',Authorization:`Bearer ${TOKEN}`},
        body:JSON.stringify({traducao,status:'revisado'}),
      });
      resultado=await r.json();
    } else {
      // Cria via seed depois atualiza
      await fetch(`${API}/traducoes/seed`,{
        method:'POST',headers:{'Content-Type':'application/json',Authorization:`Bearer ${TOKEN}`},
        body:JSON.stringify({chaves:[{chave,textoPT:doc.textoPT}],locale:TR_LOCALE}),
      });
      const todos=await fetch(`${API}/traducoes/admin?locale=${TR_LOCALE}`,
        {headers:{Authorization:`Bearer ${TOKEN}`}}).then(r=>r.json());
      const novo=todos.find(d=>d.chave===chave);
      if(novo){
        const r=await fetch(`${API}/traducoes/${novo._id}`,{
          method:'PATCH',headers:{'Content-Type':'application/json',Authorization:`Bearer ${TOKEN}`},
          body:JSON.stringify({traducao,status:'revisado'}),
        });
        resultado=await r.json();
      }
    }
    if(resultado){
      const idx=TR_DADOS.findIndex(d=>d.chave===chave);
      if(idx!==-1) TR_DADOS[idx]={...TR_DADOS[idx],...resultado};
      const bdg=document.getElementById('tr-bdg-'+chave.replace(/[^a-z0-9]/gi,'-'));
      if(bdg) bdg.innerHTML=badgeTr(resultado);
      toast('✓ Salvo e marcado como revisado','ok');
    }
  }catch(e){toast('Erro: '+e.message,'erro');}
}

// ── Mudar status ──────────────────────────────────────────────────────────────
async function mudarStatusTrItem(chave,status){
  const doc=TR_DADOS.find(d=>d.chave===chave);
  if(!doc?._id){toast('Salve primeiro antes de mudar o status','aviso');return;}
  try{
    const r=await fetch(`${API}/traducoes/${doc._id}`,{
      method:'PATCH',headers:{'Content-Type':'application/json',Authorization:`Bearer ${TOKEN}`},
      body:JSON.stringify({status}),
    });
    const resultado=await r.json();
    const idx=TR_DADOS.findIndex(d=>d.chave===chave);
    if(idx!==-1) TR_DADOS[idx]={...TR_DADOS[idx],...resultado};
    const bdg=document.getElementById('tr-bdg-'+chave.replace(/[^a-z0-9]/gi,'-'));
    if(bdg) bdg.innerHTML=badgeTr(resultado);
    toast(status==='ativo'?'✓ Ativado no app!':'✓ Marcado como revisado','ok');
  }catch(e){toast('Erro: '+e.message,'erro');}
}

// ── Auto-traduzir item ────────────────────────────────────────────────────────
async function autoTraduzirItem(chave){
  const doc=TR_DADOS.find(d=>d.chave===chave);
  if(!doc) return;
  if(!doc._id){
    await fetch(`${API}/traducoes/seed`,{
      method:'POST',headers:{'Content-Type':'application/json',Authorization:`Bearer ${TOKEN}`},
      body:JSON.stringify({chaves:[{chave,textoPT:doc.textoPT}],locale:TR_LOCALE}),
    });
  }
  try{
    const r=await fetch(`${API}/traducoes/auto`,{
      method:'POST',headers:{'Content-Type':'application/json',Authorization:`Bearer ${TOKEN}`},
      body:JSON.stringify({chave,locale:TR_LOCALE}),
    });
    const res=await r.json();
    if(res.erros?.length){toast('⚠ Falhou: '+res.erros[0].erro,'erro');}
    else{await abrirCategoria(TR_CAT.id);toast('⚡ Rascunho gerado — revise e salve','ok');}
  }catch(e){toast('Erro: '+e.message,'erro');}
}

// ── Sync, auto-traduzir toda a categoria, ativar revisados ────────────────────
async function syncCategoria(){
  if(!TR_CAT) return;
  setLoading('Sincronizando…');
  try{
    const chaves=TR_DADOS.map(d=>({chave:d.chave,textoPT:d.textoPT}));
    if(!chaves.length){ toast('Nenhuma chave para sincronizar.','aviso'); await abrirCategoria(TR_CAT.id); return; }
    const r=await fetch(`${API}/traducoes/seed`,{
      method:'POST',headers:{'Content-Type':'application/json',Authorization:`Bearer ${TOKEN}`},
      body:JSON.stringify({chaves,locale:TR_LOCALE}),
    });
    const res=await r.json();
    await abrirCategoria(TR_CAT.id);
    if(!r.ok){ toast('Erro: '+(res.erro||r.status),'erro'); return; }
    toast(`↻ ${res.inseridos} novas, ${res.existentes} já existentes`,'ok');
  }catch(e){toast('Erro: '+e.message,'erro');}
}

// Abre o modal de confirmação reutilizável com mensagem/botão customizados
function confirmarCustom(mensagemHtml, textoBotao, onConfirm, btnClass='btn btn-navy'){
  document.getElementById('confirm-msg').innerHTML=mensagemHtml;
  const btn=document.getElementById('confirm-ok');
  btn.textContent=textoBotao;
  btn.className=btnClass;
  btn.onclick=()=>{ fecharModal('confirm-modal'); onConfirm(); };
  abrirModal('confirm-modal');
}

function autoTraduzirCategoria(){
  if(!TR_CAT) return;
  const semTraducao=TR_DADOS.filter(d=>!d.traducao);
  if(!semTraducao.length){toast('Todas as entradas já têm tradução!','ok');return;}

  confirmarCustom(`
    Auto-traduzir <strong>${semTraducao.length}</strong> entrada${semTraducao.length>1?'s':''}
    em "<strong>${esc(TR_CAT.label)}</strong>" usando a MyMemory?
    <br><span style="font-size:0.7rem;color:var(--muted);display:block;margin-top:6px">
      Pode levar alguns segundos. As traduções entram como <strong>rascunho</strong>
      e precisam de revisão antes de aparecerem no app.
    </span>`,
    '⚡ Traduzir',
    ()=>executarAutoTraducao(semTraducao),
  );
}

// Renderiza a tela de progresso da tradução em lote (substitui o spinner genérico)
function renderProgressoAutoTraducao(feitos, total, erros){
  const pct=total?Math.round((feitos/total)*100):0;
  document.getElementById('content').innerHTML = TR_CSS + `
    <div style="max-width:420px;margin:50px auto 0;text-align:center">
      <p style="font-size:2.2rem;margin-bottom:8px;line-height:1">⚡</p>
      <p style="font-family:'Cinzel',serif;font-weight:700;font-size:1rem;color:var(--text);margin-bottom:5px">
        Traduzindo "${esc(TR_CAT.label)}"…
      </p>
      <p style="font-size:0.78rem;color:var(--muted);margin-bottom:16px">
        ${feitos}/${total} entradas processadas
        ${erros.length?` · <span style="color:#A83C2C;font-weight:700">${erros.length} erro${erros.length>1?'s':''}</span>`:''}
      </p>
      <div class="tr-progress-bar" style="height:10px">
        <div class="tr-progress-fill" style="width:${pct}%;background:${TR_CAT.cor};transition:width 0.25s"></div>
      </div>
      <p style="font-size:1.05rem;font-weight:800;color:${TR_CAT.cor};margin-top:10px">${pct}%</p>
    </div>`;
}

// Executa a tradução chave-por-chave, atualizando a barra de progresso a cada uma
async function executarAutoTraducao(itens){
  const total=itens.length;
  let feitos=0, erros=[];
  renderProgressoAutoTraducao(feitos, total, erros);

  // Garante que todas as chaves já existem no banco antes de traduzir
  try{
    const chaves=TR_DADOS.map(d=>({chave:d.chave,textoPT:d.textoPT}));
    await fetch(`${API}/traducoes/seed`,{
      method:'POST',headers:{'Content-Type':'application/json',Authorization:`Bearer ${TOKEN}`},
      body:JSON.stringify({chaves,locale:TR_LOCALE}),
    });
  }catch(e){
    toast('Erro ao preparar tradução: '+e.message,'erro');
    await abrirCategoria(TR_CAT.id);
    return;
  }

  for(const item of itens){
    try{
      const r=await fetch(`${API}/traducoes/auto`,{
        method:'POST',headers:{'Content-Type':'application/json',Authorization:`Bearer ${TOKEN}`},
        body:JSON.stringify({chave:item.chave,locale:TR_LOCALE}),
      });
      const d=await r.json();
      if(!r.ok) throw new Error(d.erro||`HTTP ${r.status}`);
      if(d.erros?.length) erros.push({chave:item.chave, erro:d.erros[0].erro});
    }catch(e){
      erros.push({chave:item.chave, erro:e.message});
    }
    feitos++;
    renderProgressoAutoTraducao(feitos, total, erros);
  }

  TR_ULTIMO_ERRO_AUTO = erros.length ? {catId:TR_CAT.id, erros} : null;
  await abrirCategoria(TR_CAT.id);

  const ok=feitos-erros.length;
  if(erros.length){
    toast(`⚡ ${ok}/${total} traduzidas — ${erros.length} com erro (veja detalhes na lista)`,'aviso');
  } else {
    toast(`⚡ ${ok} entrada${ok>1?'s':''} traduzida${ok>1?'s':''} com sucesso!`,'ok');
  }
}

async function ativarStatusCategoria(itens, mensagemSucesso){
  try{
    await Promise.all(itens.map(d=>fetch(`${API}/traducoes/${d._id}`,{
      method:'PATCH',headers:{'Content-Type':'application/json',Authorization:`Bearer ${TOKEN}`},
      body:JSON.stringify({status:'ativo'}),
    })));
    await abrirCategoria(TR_CAT.id);
    toast(mensagemSucesso,'ok');
  }catch(e){toast('Erro: '+e.message,'erro');}
}

function ativarRascunhosCategoria(){
  const rascunhos=TR_DADOS.filter(d=>d.status==='rascunho'&&d.traducao&&d._id);
  if(!rascunhos.length){toast('Nenhum rascunho pra ativar','aviso');return;}
  const n=rascunhos.length;
  confirmarCustom(`
    Ativar <strong>${n}</strong> ${n>1?'traduções':'tradução'}
    em rascunho em "<strong>${esc(TR_CAT.label)}</strong>"?
    <br><span style="font-size:0.7rem;color:var(--muted);display:block;margin-top:6px">
      Ela${n>1?'s':''} passa${n>1?'m':''} a aparecer no app sem revisão manual prévia.
    </span>`,
    '✓ Ativar rascunhos',
    ()=>ativarStatusCategoria(rascunhos, `✓ ${n} rascunho${n>1?'s':''} ativado${n>1?'s':''}!`),
    'btn btn-navy',
  );
}

function ativarRevisadosCategoria(){
  const revisados=TR_DADOS.filter(d=>d.status==='revisado'&&d._id);
  if(!revisados.length){toast('Nenhuma entrada revisada para ativar','aviso');return;}
  const n=revisados.length;
  confirmarCustom(`
    Ativar <strong>${n}</strong> ${n>1?'traduções revisadas':'tradução revisada'}
    em "<strong>${esc(TR_CAT.label)}</strong>"?`,
    '✓ Ativar revisados',
    ()=>ativarStatusCategoria(revisados, `✓ ${n} ${n>1?'traduções revisadas ativadas':'tradução revisada ativada'}!`),
    'btn btn-navy',
  );
}

// ── Diagnóstico API ───────────────────────────────────────────────────────────
async function testarAPITr(){
  const box=document.getElementById('tr-diag-box');
  if(!box) return;
  box.innerHTML=`<div class="tr-diag aviso">🔄 Testando MyMemory…</div>`;
  try{
    const params=new URLSearchParams({q:'Olá',langpair:'pt|en'});
    const r=await fetch(`https://api.mymemory.translated.net/get?${params.toString()}`,
      {signal:AbortSignal.timeout(6000)});
    if(r.ok){
      const d=await r.json();
      const traduzido=d.responseData?.translatedText;
      if(traduzido && !/MYMEMORY WARNING/i.test(traduzido)){
        box.innerHTML=`<div class="tr-diag ok">
          ✅ <strong>MyMemory</strong> funcionando — "Olá" → "<strong>${traduzido}</strong>"<br>
          <small>Sem necessidade de configuração. Limite gratuito: ~5.000 palavras/dia por IP
          (configure <code>MYMEMORY_EMAIL</code> no Render para subir esse limite pra 50.000/dia).</small>
        </div>`;
        return;
      }
      box.innerHTML=`<div class="tr-diag erro">
        ❌ MyMemory respondeu, mas a cota diária gratuita parece ter sido excedida.<br>
        <small>Configure <code>MYMEMORY_EMAIL</code> no Render pra aumentar o limite, ou tente de novo mais tarde.</small>
      </div>`;
      return;
    }
    box.innerHTML=`<div class="tr-diag erro">❌ MyMemory retornou ${r.status}. Tente de novo mais tarde.</div>`;
  }catch(e){
    box.innerHTML=`<div class="tr-diag erro">❌ Não foi possível contatar a MyMemory: ${esc(e.message)}</div>`;
  }
}
