// ── TROPAS ───────────────────────────────────────────────────────────────────
async function carregarTropas() {
  document.getElementById('content').innerHTML = '<div class="loading"><span class="spinner"></span> Carregando tropas...</div>';
  try {
    const qs = new URLSearchParams({pagina:PAGINA,limite:15,busca:BUSCA,ordenar:ORDENAR,dir:DIR,tipo:TIPO});
    const r  = await fetch(`${API}/tropas?${qs}`, {headers:{Authorization:`Bearer ${TOKEN}`}});
    if (r.status===401) { sair(); return; }
    const d  = await r.json();
    TOTAL_PAG = d.paginas;
    renderTropas(d);
  } catch (err) {
    document.getElementById('content').innerHTML = `<div class="loading" style="color:var(--red)">❌ Erro: ${esc(err.message)}</div>`;
  }
}

function renderTropas(d) {
  const especiais  = d.tropas.filter(t=>t.tipo==='especial').length;
  const treinaveis = d.tropas.filter(t=>t.tipo==='treinavel').length;

  document.getElementById('content').innerHTML = `
    <div class="stats-row">
      <div class="stat-box"><div class="stat-val">${d.total}</div><div class="stat-lbl">Total</div></div>
      <div class="stat-box"><div class="stat-val">${treinaveis}</div><div class="stat-lbl">Treináveis</div></div>
      <div class="stat-box"><div class="stat-val">${especiais}</div><div class="stat-lbl">Especiais</div></div>
    </div>

    <div class="card">
      <div class="card-header">
        <h2>⚔️ Tropas</h2>
        <button class="btn btn-gold btn-sm" onclick="abrirModalNova()">＋ Nova Tropa</button>
      </div>
      <div class="card-body">
        <div class="toolbar">
          <input type="text" placeholder="🔍  Buscar por nome..." value="${esc(BUSCA)}" oninput="debouceBusca(this.value)">
          <select onchange="filtrarTipo(this.value)">
            <option value="" ${!TIPO?'selected':''}>Todos os tipos</option>
            <option value="treinavel" ${TIPO==='treinavel'?'selected':''}>Treináveis</option>
            <option value="especial"  ${TIPO==='especial'?'selected':''}>Especiais</option>
          </select>
        </div>
        <div class="tabela-wrap">
          <table>
            <thead><tr>
              <th onclick="ordenarPor('nome')" style="cursor:pointer">NOME ${ORDENAR==='nome'?(DIR==='1'?'▲':'▼'):''}</th>
              <th style="text-align:right">AÇÕES</th>
            </tr></thead>
            <tbody>
              ${d.tropas.map(t=>{
                return `
                <tr>
                  <td><strong style="font-size:0.88rem">${esc(t.nome)}</strong><div style="margin-top:4px;display:flex;gap:4px;flex-wrap:wrap"><span class="badge">${t.combate==='distancia'?'🏹 Distância':'⚔️ Corpo a corpo'}</span><span class="badge">${esc(t.categoria||'outro')}</span>${t.desbloqueio?.fonte?`<span class="badge">🔓 ${esc(t.desbloqueio.fonte)}${t.desbloqueio.nivel?' '+esc(String(t.desbloqueio.nivel)):''}</span>`:''}</div></td>
                  <td style="text-align:right;white-space:nowrap">
                    <button class="btn btn-navy btn-sm" onclick="editarTropa(fromDataArg('${dataArg(t)}'))">✏ Editar</button>
                    <button class="btn btn-red btn-sm" onclick="confirmarRemover(fromStrArg('${strArg(t._id)}'),fromStrArg('${strArg(t.nome)}'))">🗑 Excluir</button>
                  </td>
                </tr>`;
              }).join('')}
              ${d.tropas.length===0?'<tr><td colspan="2" style="text-align:center;padding:24px;color:var(--muted)">Nenhuma tropa encontrada</td></tr>':''}
            </tbody>
          </table>
        </div>
        ${renderPaginacao(d.pagina, TOTAL_PAG)}
      </div>
    </div>
  `;
}

function renderPaginacao(atual, total) {
  if (total<=1) return '';
  let h = '<div class="paginacao">';
  h += `<button onclick="irPagina(${atual-1})" ${atual===1?'disabled style="opacity:0.4"':''}>‹</button>`;
  for (let i=1;i<=total;i++) {
    if (i===1||i===total||Math.abs(i-atual)<=2) h+=`<button class="${i===atual?'ativa':''}" onclick="irPagina(${i})">${i}</button>`;
    else if (Math.abs(i-atual)===3) h+='<span>…</span>';
  }
  h += `<button onclick="irPagina(${atual+1})" ${atual===total?'disabled style="opacity:0.4"':''}>›</button>`;
  return h+'</div>';
}

const fmt = n => (n||0).toLocaleString('pt-BR');
let _bt; function debouceBusca(v){clearTimeout(_bt);_bt=setTimeout(()=>{BUSCA=v;PAGINA=1;carregarTropas();},350);}
function filtrarTipo(v){TIPO=v;PAGINA=1;carregarTropas();}
function ordenarPor(c){if(ORDENAR===c)DIR=DIR==='1'?'-1':'1';else{ORDENAR=c;DIR='1';}carregarTropas();}
function irPagina(n){if(n<1||n>TOTAL_PAG)return;PAGINA=n;carregarTropas();}

const COMBAT_ROLES=['melee','ranged','speed','tank','supply'];
const CONF_SELECTS=['official','roles','attributes','counters','skills','tier','recommended','notes','target'];
const CONF_OPTIONS='<option value="">Não informada</option><option value="confirmado">🟢 Confirmado</option><option value="experimental">🟡 Experimental</option><option value="hipotese">🔴 Hipótese</option>';
const splitLines=v=>[...new Set(String(v||'').split(/\n|,/).map(x=>x.trim()).filter(Boolean))];
const joinLines=v=>Array.isArray(v)?v.filter(Boolean).join('\n'):'';

function prepararConfiancaCombate(){
  CONF_SELECTS.forEach(id=>{const el=document.getElementById(`f-conf-${id}`);if(el&&!el.options.length)el.innerHTML=CONF_OPTIONS;});
}
function limparPerfilCombate(){
  prepararConfiancaCombate();
  ['combat-tier','combat-strong','combat-weak','combat-skills','combat-recommended','combat-target','combat-notes','combat-source','en-combat-strong','en-combat-weak','en-combat-skills','en-combat-recommended','en-combat-target','en-combat-notes','en-combat-source'].forEach(id=>document.getElementById(`f-${id}`).value='');
  document.getElementById('f-combat-official').value='';
  document.getElementById('f-combat-confidence').value='';
  COMBAT_ROLES.forEach(role=>document.getElementById(`f-combat-role-${role}`).checked=false);
  CONF_SELECTS.forEach(id=>document.getElementById(`f-conf-${id}`).value='');
}
function preencherPerfilCombate(t){
  limparPerfilCombate();
  const p=t.perfilCombate||{};
  const c=p.confiancaCampos||{};
  document.getElementById('f-combat-official').value=p.tipoOficial||'';
  document.getElementById('f-combat-tier').value=p.tier??'';
  document.getElementById('f-combat-confidence').value=p.confianca||'';
  COMBAT_ROLES.forEach(role=>document.getElementById(`f-combat-role-${role}`).checked=(p.funcoesTaticas||[]).includes(role));
  document.getElementById('f-combat-strong').value=joinLines(p.forteContra);
  document.getElementById('f-combat-weak').value=joinLines(p.fracoContra);
  document.getElementById('f-combat-skills').value=joinLines(p.habilidadesEspeciais);
  document.getElementById('f-combat-recommended').value=p.funcaoRecomendada||'';
  document.getElementById('f-combat-target').value=p.prioridadeAlvo||'';
  document.getElementById('f-combat-notes').value=p.observacoesEstrategicas||'';
  document.getElementById('f-combat-source').value=p.fonteInformacao||'';
  const map={official:'tipoOficial',roles:'funcoesTaticas',attributes:'atributos',counters:'counters',skills:'habilidades',tier:'tier',recommended:'funcaoRecomendada',notes:'observacoesEstrategicas',target:'prioridadeAlvo'};
  Object.entries(map).forEach(([id,key])=>document.getElementById(`f-conf-${id}`).value=c[key]||'');
  const en=t.i18n?.['en-US']||{};
  document.getElementById('f-en-combat-strong').value=joinLines(en.combateForteContra);
  document.getElementById('f-en-combat-weak').value=joinLines(en.combateFracoContra);
  document.getElementById('f-en-combat-skills').value=joinLines(en.combateHabilidades);
  document.getElementById('f-en-combat-recommended').value=en.combateFuncaoRecomendada||'';
  document.getElementById('f-en-combat-target').value=en.combatePrioridadeAlvo||'';
  document.getElementById('f-en-combat-notes').value=en.combateObservacoesEstrategicas||'';
  document.getElementById('f-en-combat-source').value=en.combateFonteInformacao||'';
}

// ── Modal CRUD ────────────────────────────────────────────────────────────────
function abrirModalNova(){
  EDITANDO_ID=null;
  document.getElementById('modal-titulo').textContent='✦ Nova Tropa';
  ['nome','poder','vida','def','atqPerto','atqDist','alcance','vel','car','imagem','desc','en-nome','en-desc','unlock-nivel','unlock-fonte','unlock-observacao','en-unlock-fonte','en-unlock-observacao'].forEach(id=>document.getElementById(`f-${id}`).value='');
  document.getElementById('f-tipo').value='treinavel';
  document.getElementById('f-combate').value='corpo_a_corpo';
  document.getElementById('f-rapida').value='false';
  document.getElementById('f-categoria').value='outro';
  ['ataque','defesa','farming','suporte','equilibrada'].forEach(role=>document.getElementById(`f-role-${role}`).checked=role==='equilibrada');
  document.getElementById('f-unlock-tipo').value='';
  limparPerfilCombate();
  abrirModal('modal-tropa');
}

function editarTropa(t){
  EDITANDO_ID=t._id;
  document.getElementById('modal-titulo').textContent=`✏ Editar: ${t.nome}`;
  document.getElementById('f-nome').value=t.nome||'';
  document.getElementById('f-tipo').value=t.tipo||'treinavel';
  document.getElementById('f-combate').value=t.combate||'corpo_a_corpo';
  document.getElementById('f-rapida').value=t.rapida?'true':'false';
  document.getElementById('f-categoria').value=t.categoria||'outro';
  { const roles=Array.isArray(t.funcoes)&&t.funcoes.length?t.funcoes:['equilibrada']; ['ataque','defesa','farming','suporte','equilibrada'].forEach(role=>document.getElementById(`f-role-${role}`).checked=roles.includes(role)); }
  document.getElementById('f-unlock-tipo').value=t.desbloqueio?.tipo||'';
  document.getElementById('f-unlock-nivel').value=t.desbloqueio?.nivel??'';
  document.getElementById('f-unlock-fonte').value=t.desbloqueio?.fonte||'';
  document.getElementById('f-unlock-observacao').value=t.desbloqueio?.observacao||'';
  document.getElementById('f-poder').value=t.poder||0;
  document.getElementById('f-vida').value=t.vida||0;
  document.getElementById('f-def').value=t.def||0;
  document.getElementById('f-atqPerto').value=t.atqPerto||0;
  document.getElementById('f-atqDist').value=t.atqDist||0;
  document.getElementById('f-alcance').value=t.alcance||0;
  document.getElementById('f-vel').value=t.vel||0;
  document.getElementById('f-car').value=t.car||0;
  document.getElementById('f-imagem').value=t.imagem||'';
  document.getElementById('f-desc').value=t.desc||'';
  document.getElementById('f-en-nome').value=t.i18n?.['en-US']?.nome||'';
  document.getElementById('f-en-desc').value=t.i18n?.['en-US']?.desc||'';
  document.getElementById('f-en-unlock-fonte').value=t.i18n?.['en-US']?.desbloqueioFonte||'';
  document.getElementById('f-en-unlock-observacao').value=t.i18n?.['en-US']?.desbloqueioObservacao||'';
  preencherPerfilCombate(t);
  abrirModal('modal-tropa');
}

async function salvarTropa(){
  const confidenceMap={official:'tipoOficial',roles:'funcoesTaticas',attributes:'atributos',counters:'counters',skills:'habilidades',tier:'tier',recommended:'funcaoRecomendada',notes:'observacoesEstrategicas',target:'prioridadeAlvo'};
  const confiancaCampos={};
  Object.entries(confidenceMap).forEach(([id,key])=>{confiancaCampos[key]=document.getElementById(`f-conf-${id}`).value;});
  const tierRaw=document.getElementById('f-combat-tier').value;
  const body={
    nome:     document.getElementById('f-nome').value.trim(),
    tipo:     document.getElementById('f-tipo').value,
    combate:  document.getElementById('f-combate').value,
    rapida:   document.getElementById('f-rapida').value === 'true',
    categoria:document.getElementById('f-categoria').value,
    funcoes:  ['ataque','defesa','farming','suporte','equilibrada'].filter(role=>document.getElementById(`f-role-${role}`).checked),
    poder:    +document.getElementById('f-poder').value||0,
    vida:     +document.getElementById('f-vida').value||0,
    def:      +document.getElementById('f-def').value||0,
    atqPerto: +document.getElementById('f-atqPerto').value||0,
    atqDist:  +document.getElementById('f-atqDist').value||0,
    alcance:  +document.getElementById('f-alcance').value||0,
    vel:      +document.getElementById('f-vel').value||0,
    car:      +document.getElementById('f-car').value||0,
    imagem:   document.getElementById('f-imagem').value.trim(),
    desc:     document.getElementById('f-desc').value.trim(),
    perfilCombate:{
      tipoOficial:document.getElementById('f-combat-official').value,
      funcoesTaticas:COMBAT_ROLES.filter(role=>document.getElementById(`f-combat-role-${role}`).checked),
      tier:tierRaw===''?null:+tierRaw,
      forteContra:splitLines(document.getElementById('f-combat-strong').value),
      fracoContra:splitLines(document.getElementById('f-combat-weak').value),
      habilidadesEspeciais:splitLines(document.getElementById('f-combat-skills').value),
      funcaoRecomendada:document.getElementById('f-combat-recommended').value.trim(),
      prioridadeAlvo:document.getElementById('f-combat-target').value.trim(),
      observacoesEstrategicas:document.getElementById('f-combat-notes').value.trim(),
      fonteInformacao:document.getElementById('f-combat-source').value.trim(),
      confianca:document.getElementById('f-combat-confidence').value,
      confiancaCampos,
    },
    desbloqueio: {
      tipo: document.getElementById('f-unlock-tipo').value,
      nivel: document.getElementById('f-unlock-nivel').value,
      fonte: document.getElementById('f-unlock-fonte').value.trim(),
      observacao: document.getElementById('f-unlock-observacao').value.trim(),
    },
    i18n: { 'en-US': {
      nome: document.getElementById('f-en-nome').value.trim(),
      desc: document.getElementById('f-en-desc').value.trim(),
      desbloqueioFonte: document.getElementById('f-en-unlock-fonte').value.trim(),
      desbloqueioObservacao: document.getElementById('f-en-unlock-observacao').value.trim(),
      combateForteContra: splitLines(document.getElementById('f-en-combat-strong').value),
      combateFracoContra: splitLines(document.getElementById('f-en-combat-weak').value),
      combateHabilidades: splitLines(document.getElementById('f-en-combat-skills').value),
      combateFuncaoRecomendada: document.getElementById('f-en-combat-recommended').value.trim(),
      combatePrioridadeAlvo: document.getElementById('f-en-combat-target').value.trim(),
      combateObservacoesEstrategicas: document.getElementById('f-en-combat-notes').value.trim(),
      combateFonteInformacao: document.getElementById('f-en-combat-source').value.trim(),
    } },
  };
  if(!body.nome) return toast('Preencha o nome da tropa!','warn');
  if(body.perfilCombate.tier!==null&&(body.perfilCombate.tier<1||body.perfilCombate.tier>99)) return toast('Tier deve ficar entre 1 e 99.','warn');
  try {
    const r=await fetch(EDITANDO_ID?`${API}/tropas/${EDITANDO_ID}`:`${API}/tropas`,{method:EDITANDO_ID?'PUT':'POST',headers:{'Content-Type':'application/json',Authorization:`Bearer ${TOKEN}`},body:JSON.stringify(body)});
    const d=await r.json();
    if(!r.ok) return toast(d.erro||'Erro ao salvar','erro');
    fecharModal('modal-tropa');
    toast(EDITANDO_ID?`"${d.nome}" atualizada!`:`"${d.nome}" criada!`,'ok');
    carregarTropas();
  } catch(e){toast('Erro de rede: '+e.message,'erro');}
}

function confirmarRemover(id,nome){
  document.getElementById('confirm-msg').textContent=`Remover "${nome}" permanentemente?`;
  document.getElementById('confirm-ok').onclick=async()=>{
    const r=await fetch(`${API}/tropas/${id}`,{method:'DELETE',headers:{Authorization:`Bearer ${TOKEN}`}});
    const d=await r.json();
    fecharModal('confirm-modal');
    if(!r.ok) return toast(d.erro||'Erro','erro');
    toast(d.mensagem,'ok'); carregarTropas();
  };
  abrirModal('confirm-modal');
}


// ═══════════════════════════════════════════════════════════════════════════════
// MÓDULO: NÍVEIS
// ═══════════════════════════════════════════════════════════════════════════════


const fmtXP = n => n != null ? Number(n).toLocaleString('pt-BR') : '—';
