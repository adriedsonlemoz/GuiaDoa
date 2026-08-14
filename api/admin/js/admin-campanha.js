// ── MAPA & CAMPANHA ─────────────────────────────────────────────────────────
let CAMPANHA_EDITANDO = null;
const MC_CATS = { antropos:'☠️ Antropos', campos:'🌲 Campos', zyrvorthian:'🐲 Zyrvorthian', grodz:'🛡️ Campanha / Grodz' };
const MC_RES = ['stone','metals','wood','gold','food','pearls','seeds','geodes','sulfur','other'];
const MC_FIELD_TYPES = { savana:'Savana', montanha:'Montanha', morro:'Morro', lago:'Lago', floresta:'Floresta' };

async function carregarCampanha() {
  setLoading('Carregando Mapa & Campanha…');
  try {
    const r = await fetch(`${API}/campanha`, { headers:{ Authorization:`Bearer ${TOKEN}` } });
    if (r.status === 401) return sair();
    const d = await r.json();
    if (!r.ok) throw new Error(d.erro || 'Falha ao carregar campanha.');
    renderCampanha(d.locais || [], d.categorias || {});
  } catch (err) {
    document.getElementById('content').innerHTML = `<div class="loading" style="color:var(--red)">❌ ${esc(err.message)}</div>`;
  }
}

function renderCampanha(lista, counts) {
  const grupos = Object.keys(MC_CATS).map(cat => [cat, lista.filter(x => x.categoria === cat)]);
  document.getElementById('content').innerHTML = `
    <div class="stats-row">
      <div class="stat-box"><div class="stat-val">${lista.length}</div><div class="stat-lbl">Registros</div></div>
      <div class="stat-box"><div class="stat-val">${counts.antropos || 0}</div><div class="stat-lbl">Antropos</div></div>
      <div class="stat-box"><div class="stat-val">${counts.campos || 0}</div><div class="stat-lbl">Campos</div></div>
      <div class="stat-box"><div class="stat-val">${lista.reduce((n,x)=>n+(x.recompensas||[]).length,0)}</div><div class="stat-lbl">Recompensas</div></div>
    </div>
    <div class="card">
      <div class="card-header"><h2>🗺️ Mapa & Campanha</h2><button class="btn btn-gold btn-sm" onclick="abrirModalCampanha(null)">＋ Novo registro</button></div>
      <div class="card-body">
        <p class="admin-help-copy">Dados oficiais, recompensas e estratégias ficam separados. Itens sem nome confirmado podem usar apenas um símbolo como R1, R2… até a identificação no jogo.</p>
        ${grupos.map(([cat,items]) => `
          <section class="mc-admin-section">
            <div class="mc-admin-section-title"><span>${MC_CATS[cat]}</span><small>${items.length}</small></div>
            ${items.length ? `<div class="tabela-wrap"><table><thead><tr><th>Nome</th><th>Subtipo</th><th>Nível</th><th>Tropas</th><th>Recursos</th><th>Recompensas</th><th>Ações</th></tr></thead><tbody>
              ${items.sort((a,b)=>String(a.subtipo||'').localeCompare(String(b.subtipo||'')) || (a.nivel??999)-(b.nivel??999)).map(item => `<tr>
                <td><strong>${esc(item.nome)}</strong><br><small style="color:var(--muted)">${esc(item.slug)}</small></td>
                <td>${esc(item.subtipo || '—')}</td><td>${item.nivel ?? '—'}</td><td>${(item.tropas||[]).length}</td><td>${(item.recursos||[]).length}</td><td>${(item.recompensas||[]).length}</td>
                <td><div style="display:flex;gap:5px"><button class="btn btn-navy btn-sm" onclick="abrirModalCampanha(fromDataArg('${dataArg(item)}'))">✏ Editar</button><button class="btn btn-red btn-sm" onclick="deletarCampanha(fromStrArg('${strArg(item.slug)}'),fromStrArg('${strArg(item.nome)}'))">🗑</button></div></td>
              </tr>`).join('')}
            </tbody></table></div>` : '<p class="mc-admin-empty">Nenhum dado confirmado nesta categoria.</p>'}
          </section>`).join('')}
      </div>
    </div>`;
  window.enhanceAdminLayout?.();
}

function garantirModalCampanha() {
  if (document.getElementById('modal-campanha')) return;
  const modal = document.createElement('div');
  modal.id = 'modal-campanha'; modal.className = 'modal-bg';
  modal.innerHTML = `<div class="modal mc-modal"><div class="modal-header"><h3 id="mc-title">Novo registro</h3><button class="modal-close" onclick="fecharModal('modal-campanha')">✕</button></div>
    <div class="modal-body">
      <div class="grid2"><div class="field"><label>Categoria *</label><select id="mc-cat" onchange="mcToggleCampo()">${Object.entries(MC_CATS).map(([k,v])=>`<option value="${k}">${v}</option>`).join('')}</select></div><div class="field"><label>Nível</label><input id="mc-level" type="number" min="0" max="999"></div></div>
      <div class="field"><label>Nome PT-BR *</label><input id="mc-name"></div>
      <div class="field"><label>Name EN-US</label><input id="mc-name-en"></div>
      <div class="grid2"><div class="field"><label>Subtipo</label><input id="mc-subtype" list="mc-field-types" placeholder="ex.: savana"><datalist id="mc-field-types">${Object.keys(MC_FIELD_TYPES).map(x=>`<option value="${x}">`).join('')}</datalist></div><div class="field"><label>Ordem</label><input id="mc-order" type="number"></div></div>
      <label class="mc-check"><input id="mc-active" type="checkbox" checked> Publicar no frontend</label>

      <div class="mc-editor-block mc-field-only" id="mc-field-domain" hidden><div class="mc-editor-head"><strong>🏞️ Domínio do campo</strong></div>
        <div class="grid2"><div class="field"><label>Recurso principal</label><select id="mc-field-resource"><option value="">A confirmar</option>${MC_RES.map(x=>`<option value="${x}">${x}</option>`).join('')}</select></div><div class="field"><label>Produção / hora</label><input id="mc-field-production" type="number" min="0"></div></div>
        <div class="field"><label>Exibição original</label><input id="mc-field-production-display" placeholder="ex.: 16500/h"></div>
      </div>

      <div class="mc-editor-block"><div class="mc-editor-head"><strong>⚔️ Tropas inimigas</strong><button class="btn btn-ghost btn-sm" type="button" onclick="mcAddTropa()">＋ Tropa</button></div><div id="mc-troops"></div></div>
      <div class="mc-editor-block"><div class="mc-editor-head"><strong>📦 Recursos</strong><button class="btn btn-ghost btn-sm" type="button" onclick="mcAddRecurso()">＋ Recurso</button></div><div id="mc-resources"></div><p class="admin-help-copy">“Exibição” deve preservar o que o jogo mostra (ex.: 1.01m). Desmarque Exato quando houver abreviação/arredondamento.</p></div>

      <div class="mc-editor-block"><div class="mc-editor-head"><strong>◇ Recompensas possíveis</strong><button class="btn btn-ghost btn-sm" type="button" onclick="mcAddReward()">＋ Recompensa</button></div><div id="mc-rewards"></div><p class="admin-help-copy">Se o nome ainda não foi aberto/confirmado no jogo, deixe-o vazio e use um símbolo estável (R1, R2…). Isso registra a existência do item sem inventar seu nome.</p></div>


      <div class="mc-editor-block"><div class="mc-editor-head"><strong>🧭 Métodos de ataque estruturados</strong><button class="btn btn-ghost btn-sm" type="button" onclick="mcAddGuide()">＋ Método</button></div><div id="mc-guides"></div><p class="admin-help-copy">Use para marchas por tropa (ex.: Arqueiros/LBM). Apoios: uma linha por opção no formato Nome | Quantidade | grupo. Pesquisas: Nome | Nível. Estratégias em validação aparecem com aviso no frontend.</p></div>

      <div class="mc-editor-block"><div class="mc-editor-head"><strong>⚔️ Como atacar</strong></div>
        <label class="mc-check"><input id="mc-strategy-published" type="checkbox"> Estratégia publicada</label>
        <div class="field"><label>Título PT-BR</label><input id="mc-strategy-title"></div><div class="field"><label>Resumo PT-BR</label><textarea id="mc-strategy-summary"></textarea></div>
        <div class="grid2"><div class="field"><label>Requisitos (1 por linha)</label><textarea id="mc-strategy-req"></textarea></div><div class="field"><label>Passos (1 por linha)</label><textarea id="mc-strategy-steps"></textarea></div></div>
        <div class="field"><label>Observações</label><textarea id="mc-strategy-notes"></textarea></div>
        <div class="i18n-section"><div class="i18n-title">🌐 English <span>strategy</span></div><div class="field"><label>Title</label><input id="mc-strategy-title-en"></div><div class="field"><label>Summary</label><textarea id="mc-strategy-summary-en"></textarea></div><div class="grid2"><div class="field"><label>Requirements</label><textarea id="mc-strategy-req-en"></textarea></div><div class="field"><label>Steps</label><textarea id="mc-strategy-steps-en"></textarea></div></div></div>
      </div>
      <div class="mc-editor-block"><strong>🔎 Fonte</strong><div class="grid2"><div class="field"><label>Tipo</label><select id="mc-source-type"><option value="manual">Manual</option><option value="screenshot">Screenshot</option><option value="documentacao">Documentação</option></select></div><div class="field"><label>Data</label><input id="mc-source-date" placeholder="AAAA-MM-DD"></div></div><div class="field"><label>Descrição</label><input id="mc-source-desc"></div><label class="mc-check"><input id="mc-source-verified" type="checkbox"> Fonte verificada</label></div>
    </div><div class="modal-footer"><button class="btn btn-ghost" onclick="fecharModal('modal-campanha')">Cancelar</button><button class="btn btn-navy" onclick="salvarCampanha()">💾 Salvar</button></div></div>`;
  document.body.appendChild(modal);
  modal.addEventListener('click', e => { if (e.target === modal) fecharModal('modal-campanha'); });
}

function mcToggleCampo(){ const el=document.getElementById('mc-field-domain'); if(el) el.hidden=document.getElementById('mc-cat')?.value!=='campos'; }
function mcAddTropa(data={}) { const row=document.createElement('div'); row.className='mc-row mc-troop-row'; row.innerHTML=`<input class="mc-troop-name" placeholder="Nome" value="${esc(data.nome||'')}"><input class="mc-troop-qty" type="number" min="0" placeholder="Quantidade" value="${Number.isFinite(Number(data.quantidade))?Number(data.quantidade):''}"><button type="button" class="btn btn-red btn-sm" onclick="this.parentElement.remove()">✕</button>`; document.getElementById('mc-troops').appendChild(row); }
function mcAddRecurso(data={}) { const row=document.createElement('div'); row.className='mc-row mc-resource-row'; row.innerHTML=`<select class="mc-res-type">${MC_RES.map(x=>`<option value="${x}" ${x===data.tipo?'selected':''}>${x}</option>`).join('')}</select><input class="mc-res-display" placeholder="Exibição" value="${esc(data.exibicao||'')}"><input class="mc-res-value" type="number" min="0" placeholder="Valor normalizado" value="${data.valor==null?'':Number(data.valor)}"><label class="mc-inline-check"><input class="mc-res-exact" type="checkbox" ${data.exato!==false?'checked':''}> exato</label><button type="button" class="btn btn-red btn-sm" onclick="this.parentElement.remove()">✕</button>`; document.getElementById('mc-resources').appendChild(row); }
function mcAddReward(data={}) { const row=document.createElement('div'); row.className='mc-reward-editor'; row.innerHTML=`<div class="mc-row mc-reward-row"><input class="mc-reward-symbol" placeholder="R1" value="${esc(data.simbolo||'')}"><input class="mc-reward-name" placeholder="Nome PT-BR (opcional)" value="${esc(data.nome||'')}"><input class="mc-reward-qty" type="number" min="0" placeholder="Qtd." value="${data.quantidade==null?'':Number(data.quantidade)}"><button type="button" class="btn btn-red btn-sm" onclick="this.closest('.mc-reward-editor').remove()">✕</button></div><div class="mc-row mc-reward-row-secondary"><input class="mc-reward-name-en" placeholder="Name EN-US" value="${esc(data.i18n?.['en-US']?.nome||'')}"><input class="mc-reward-code" placeholder="Código estável (opcional)" value="${esc(data.codigo||'')}"><label class="mc-inline-check"><input class="mc-reward-confirmed" type="checkbox" ${data.nomeConfirmado?'checked':''}> nome confirmado</label></div></div>`; document.getElementById('mc-rewards').appendChild(row); }
const mcLines = value => String(value || '').split('\n').map(x=>x.trim()).filter(Boolean);
const mcJoin = value => Array.isArray(value) ? value.join('\n') : '';


function mcGuideSupports(value=[]) { return (Array.isArray(value)?value:[]).map(x=>`${x.nome||''} | ${x.quantidade??''} | ${x.alternativa||''}`).join('\n'); }
function mcGuideResearch(value=[]) { return (Array.isArray(value)?value:[]).map(x=>`${x.nome||''} | ${x.nivel??''}`).join('\n'); }
function mcParseGuideSupports(value) { return mcLines(value).map(line=>{const [nome='',qtd='',alternativa='']=line.split('|').map(x=>x.trim());return {nome,quantidade:Number(qtd),alternativa};}).filter(x=>x.nome&&Number.isFinite(x.quantidade)); }
function mcParseGuideResearch(value) { return mcLines(value).map(line=>{const [nome='',nivel='']=line.split('|').map(x=>x.trim());return {nome,nivel:Number(nivel)};}).filter(x=>x.nome&&Number.isFinite(x.nivel)); }
function mcAddGuide(data={}) {
  const box=document.createElement('div'); box.className='mc-guide-editor';
  const en=data.i18n?.['en-US']||{};
  box.innerHTML=`<input class="mc-guide-code" type="hidden" value="${esc(data.codigo||'')}"><div class="mc-editor-head"><strong>${esc(data.titulo||'Novo método')}</strong><button type="button" class="btn btn-red btn-sm" onclick="this.closest('.mc-guide-editor').remove()">✕</button></div>
    <div class="grid2"><div class="field"><label>Título PT-BR *</label><input class="mc-guide-title" value="${esc(data.titulo||'')}"></div><div class="field"><label>Status da fonte</label><select class="mc-guide-status"><option value="validacao" ${data.status!=='confirmado'?'selected':''}>Em validação</option><option value="confirmado" ${data.status==='confirmado'?'selected':''}>Confirmado</option></select></div></div>
    <div class="grid2"><div class="field"><label>Resultado</label><select class="mc-guide-result"><option value="" ${!data.resultado?'selected':''}>Sem classificação</option><option value="sem_perdas" ${data.resultado==='sem_perdas'?'selected':''}>Sem perdas</option><option value="possiveis_perdas" ${data.resultado==='possiveis_perdas'?'selected':''}>Possíveis perdas</option><option value="incompleto" ${data.resultado==='incompleto'?'selected':''}>Dados incompletos</option></select></div><div class="field"><label>Complemento / Dragão</label><input class="mc-guide-complement" value="${esc(data.complemento||'')}"></div></div>
    <div class="grid2"><div class="field"><label>Tropa principal</label><input class="mc-guide-main" value="${esc(data.tropaPrincipal||'')}"></div><div class="field"><label>Quantidade</label><input class="mc-guide-qty" type="number" min="0" value="${data.quantidade==null?'':Number(data.quantidade)}"></div></div>
    <div class="field"><label>Resumo PT-BR</label><textarea class="mc-guide-summary">${esc(data.resumo||'')}</textarea></div>
    <div class="grid2"><div class="field"><label>Apoios · Nome | Quantidade | grupo</label><textarea class="mc-guide-supports">${esc(mcGuideSupports(data.apoios))}</textarea></div><div class="field"><label>Pesquisas · Nome | Nível</label><textarea class="mc-guide-research">${esc(mcGuideResearch(data.pesquisas))}</textarea></div></div>
    <div class="field"><label>Passos (1 por linha)</label><textarea class="mc-guide-steps">${esc(mcJoin(data.passos))}</textarea></div><div class="field"><label>Observações</label><textarea class="mc-guide-notes">${esc(data.observacoes||'')}</textarea></div>
    <div class="grid2"><div class="field"><label>Fonte / descrição</label><input class="mc-guide-source-desc" value="${esc(data.fonte?.descricao||'')}"></div><div class="field"><label>URL da fonte</label><input class="mc-guide-source-url" value="${esc(data.fonte?.url||'')}"></div></div>
    <div class="i18n-section"><div class="i18n-title">🌐 English <span>attack method</span></div><div class="field"><label>Title</label><input class="mc-guide-title-en" value="${esc(en.titulo||'')}"></div><div class="field"><label>Summary</label><textarea class="mc-guide-summary-en">${esc(en.resumo||'')}</textarea></div><div class="field"><label>Companion / Dragon</label><input class="mc-guide-complement-en" value="${esc(en.complemento||'')}"></div><div class="field"><label>Steps (1 per line)</label><textarea class="mc-guide-steps-en">${esc(mcJoin(en.passos))}</textarea></div><div class="field"><label>Notes</label><textarea class="mc-guide-notes-en">${esc(en.observacoes||'')}</textarea></div></div>`;
  document.getElementById('mc-guides').appendChild(box);
}

function abrirModalCampanha(item) {
  garantirModalCampanha(); CAMPANHA_EDITANDO = item?.slug || null;
  document.getElementById('mc-title').textContent=item?`✏ ${item.nome}`:'🗺️ Novo registro';
  document.getElementById('mc-cat').value=item?.categoria||'antropos'; document.getElementById('mc-level').value=item?.nivel??''; document.getElementById('mc-name').value=item?.nome||''; document.getElementById('mc-name-en').value=item?.i18n?.['en-US']?.nome||''; document.getElementById('mc-subtype').value=item?.subtipo||''; document.getElementById('mc-order').value=item?.ordem??item?.nivel??0; document.getElementById('mc-active').checked=item?.ativo!==false;
  const troops=document.getElementById('mc-troops'); troops.innerHTML=''; (item?.tropas||[]).forEach(mcAddTropa); if(!(item?.tropas||[]).length) mcAddTropa();
  const resources=document.getElementById('mc-resources'); resources.innerHTML=''; (item?.recursos||[]).forEach(mcAddRecurso); if(!(item?.recursos||[]).length) mcAddRecurso({tipo:'food',exato:true});
  const rewards=document.getElementById('mc-rewards'); rewards.innerHTML=''; (item?.recompensas||[]).forEach(mcAddReward);
  const guides=document.getElementById('mc-guides'); guides.innerHTML=''; (item?.guiasAtaque||[]).forEach(mcAddGuide);
  document.getElementById('mc-field-resource').value=item?.campo?.recursoPrincipal||''; document.getElementById('mc-field-production').value=item?.campo?.producaoHora??''; document.getElementById('mc-field-production-display').value=item?.campo?.producaoExibicao||'';
  const st=item?.estrategia||{}; document.getElementById('mc-strategy-published').checked=Boolean(st.publicada); document.getElementById('mc-strategy-title').value=st.titulo||''; document.getElementById('mc-strategy-summary').value=st.resumo||''; document.getElementById('mc-strategy-req').value=mcJoin(st.requisitos); document.getElementById('mc-strategy-steps').value=mcJoin(st.passos); document.getElementById('mc-strategy-notes').value=st.observacoes||'';
  const en=st.i18n?.['en-US']||{}; document.getElementById('mc-strategy-title-en').value=en.titulo||''; document.getElementById('mc-strategy-summary-en').value=en.resumo||''; document.getElementById('mc-strategy-req-en').value=mcJoin(en.requisitos); document.getElementById('mc-strategy-steps-en').value=mcJoin(en.passos);
  document.getElementById('mc-source-type').value=item?.fonte?.tipo||'manual'; document.getElementById('mc-source-date').value=item?.fonte?.data||''; document.getElementById('mc-source-desc').value=item?.fonte?.descricao||''; document.getElementById('mc-source-verified').checked=Boolean(item?.fonte?.verificado);
  mcToggleCampo(); abrirModal('modal-campanha');
}

async function salvarCampanha() {
  const tropas=[...document.querySelectorAll('.mc-troop-row')].map(row=>({nome:row.querySelector('.mc-troop-name').value.trim(),quantidade:Number(row.querySelector('.mc-troop-qty').value)})).filter(x=>x.nome);
  const recursos=[...document.querySelectorAll('.mc-resource-row')].map(row=>({tipo:row.querySelector('.mc-res-type').value,exibicao:row.querySelector('.mc-res-display').value.trim(),valor:row.querySelector('.mc-res-value').value===''?null:Number(row.querySelector('.mc-res-value').value),exato:row.querySelector('.mc-res-exact').checked})).filter(x=>x.exibicao);
  const recompensas=[...document.querySelectorAll('.mc-reward-editor')].map((box,i)=>({codigo:box.querySelector('.mc-reward-code').value.trim(),simbolo:box.querySelector('.mc-reward-symbol').value.trim()||`R${i+1}`,nome:box.querySelector('.mc-reward-name').value.trim(),quantidade:box.querySelector('.mc-reward-qty').value===''?null:Number(box.querySelector('.mc-reward-qty').value),nomeConfirmado:box.querySelector('.mc-reward-confirmed').checked,i18n:{'en-US':{nome:box.querySelector('.mc-reward-name-en').value.trim()}}}));
  const guiasAtaque=[...document.querySelectorAll('.mc-guide-editor')].map((box,i)=>({codigo:box.querySelector('.mc-guide-code').value.trim()||`guia-${i+1}-${box.querySelector('.mc-guide-title').value.trim()}`,titulo:box.querySelector('.mc-guide-title').value.trim(),resumo:box.querySelector('.mc-guide-summary').value.trim(),status:box.querySelector('.mc-guide-status').value,resultado:box.querySelector('.mc-guide-result').value,complemento:box.querySelector('.mc-guide-complement').value.trim(),tropaPrincipal:box.querySelector('.mc-guide-main').value.trim(),quantidade:box.querySelector('.mc-guide-qty').value===''?null:Number(box.querySelector('.mc-guide-qty').value),apoios:mcParseGuideSupports(box.querySelector('.mc-guide-supports').value),pesquisas:mcParseGuideResearch(box.querySelector('.mc-guide-research').value),passos:mcLines(box.querySelector('.mc-guide-steps').value),observacoes:box.querySelector('.mc-guide-notes').value.trim(),fonte:{tipo:'comunidade',descricao:box.querySelector('.mc-guide-source-desc').value.trim(),url:box.querySelector('.mc-guide-source-url').value.trim()},i18n:{'en-US':{titulo:box.querySelector('.mc-guide-title-en').value.trim(),resumo:box.querySelector('.mc-guide-summary-en').value.trim(),complemento:box.querySelector('.mc-guide-complement-en').value.trim(),passos:mcLines(box.querySelector('.mc-guide-steps-en').value),observacoes:box.querySelector('.mc-guide-notes-en').value.trim()}}})).filter(x=>x.titulo);
  const payload={categoria:document.getElementById('mc-cat').value,nivel:document.getElementById('mc-level').value,nome:document.getElementById('mc-name').value.trim(),subtipo:document.getElementById('mc-subtype').value.trim(),ordem:Number(document.getElementById('mc-order').value||0),ativo:document.getElementById('mc-active').checked,tropas,recursos,recompensas,guiasAtaque,campo:{recursoPrincipal:document.getElementById('mc-field-resource').value,producaoHora:document.getElementById('mc-field-production').value,producaoExibicao:document.getElementById('mc-field-production-display').value.trim()},i18n:{'en-US':{nome:document.getElementById('mc-name-en').value.trim()}},estrategia:{publicada:document.getElementById('mc-strategy-published').checked,titulo:document.getElementById('mc-strategy-title').value.trim(),resumo:document.getElementById('mc-strategy-summary').value.trim(),requisitos:mcLines(document.getElementById('mc-strategy-req').value),passos:mcLines(document.getElementById('mc-strategy-steps').value),observacoes:document.getElementById('mc-strategy-notes').value.trim(),i18n:{'en-US':{titulo:document.getElementById('mc-strategy-title-en').value.trim(),resumo:document.getElementById('mc-strategy-summary-en').value.trim(),requisitos:mcLines(document.getElementById('mc-strategy-req-en').value),passos:mcLines(document.getElementById('mc-strategy-steps-en').value)}}},fonte:{tipo:document.getElementById('mc-source-type').value,data:document.getElementById('mc-source-date').value.trim(),descricao:document.getElementById('mc-source-desc').value.trim(),verificado:document.getElementById('mc-source-verified').checked}};
  if(!payload.nome) return toast('Nome é obrigatório.','erro');
  if(payload.categoria==='campos' && !payload.subtipo) return toast('Campos exigem subtipo (savana, montanha, morro, lago ou floresta).','erro');
  try{const url=CAMPANHA_EDITANDO?`${API}/campanha/${encodeURIComponent(CAMPANHA_EDITANDO)}`:`${API}/campanha`;const r=await fetch(url,{method:CAMPANHA_EDITANDO?'PUT':'POST',headers:{'Content-Type':'application/json',Authorization:`Bearer ${TOKEN}`},body:JSON.stringify(payload)});const d=await r.json();if(!r.ok)return toast(d.erro||'Erro ao salvar.','erro');toast(CAMPANHA_EDITANDO?'Registro atualizado.':'Registro criado.');fecharModal('modal-campanha');carregarCampanha();}catch(err){toast(err.message,'erro');}
}

async function deletarCampanha(slug,nome){if(!confirm(`Excluir "${nome}"?`))return;try{const r=await fetch(`${API}/campanha/${encodeURIComponent(slug)}`,{method:'DELETE',headers:{Authorization:`Bearer ${TOKEN}`}});const d=await r.json();if(!r.ok)return toast(d.erro||'Erro ao excluir.','erro');toast('Registro removido.');carregarCampanha();}catch(err){toast(err.message,'erro');}}
