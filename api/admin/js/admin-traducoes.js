// TRADUÇÕES — estado, grade e carregamento de categorias
let TR_LOCALE  = 'en-US';
let TR_CAT     = null;
let TR_DADOS   = [];
let TR_FILTRO  = 'todos';
let TR_EXPAND  = null;
let TR_STATS   = {};
let TR_ULTIMO_ERRO_AUTO = null; // {catId, erros:[{chave,erro}]} — exibido na lista após auto-traduzir com falhas

function badgeTr(doc){
  if(!doc||!doc.traducao) return `<span class="tr-badge tr-badge-sem">Sem tradução</span>`;
  const mp={rascunho:['tr-badge-rascunho','Rascunho'],revisado:['tr-badge-revisado','Revisado'],ativo:['tr-badge-ativo','✓ Ativo']};
  const[cls,lbl]=mp[doc.status]||['tr-badge-rascunho',doc.status];
  return `<span class="tr-badge ${cls}">${lbl}</span>`;
}

const TR_CSS=`<style>
.tr-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-bottom:16px}
.tr-cat-card{background:var(--card);border:1.5px solid rgba(200,168,74,0.2);border-radius:11px;
  padding:10px 9px 9px;cursor:pointer;transition:all 0.15s;position:relative;overflow:hidden;
  display:flex;flex-direction:column;gap:4px}
.tr-cat-card:hover{transform:translateY(-2px);box-shadow:0 6px 20px rgba(0,0,0,0.12)}
.tr-cat-bar{position:absolute;top:0;left:0;right:0;height:3px}
.tr-toolbar{display:flex;flex-wrap:wrap;gap:8px;align-items:center;
  background:var(--card);border:1.5px solid rgba(200,168,74,0.2);
  border-radius:12px;padding:12px 14px;margin-bottom:12px}
.tr-filtros{display:flex;gap:5px;flex-wrap:wrap;margin-bottom:10px}
.tr-filtro{font-size:0.68rem;padding:3px 12px;border-radius:100px;
  border:1.5px solid rgba(200,168,74,0.25);background:transparent;
  color:var(--muted);cursor:pointer;font-family:inherit;
  letter-spacing:0.05em;text-transform:uppercase;transition:all 0.12s}
.tr-filtro.on{background:linear-gradient(135deg,#2A4C72,#1C3A5E);
  color:rgba(200,168,74,0.9);border-color:rgba(200,168,74,0.5)}
.tr-cards{display:flex;flex-direction:column;gap:6px}
.tr-card{background:var(--card);border:1.5px solid rgba(200,168,74,0.2);
  border-radius:12px;overflow:hidden;transition:border-color 0.15s}
.tr-card:hover{border-color:rgba(200,168,74,0.4)}
.tr-card-head{display:flex;align-items:center;gap:10px;padding:10px 14px;cursor:pointer;user-select:none}
.tr-card-head:hover{background:rgba(200,168,74,0.04)}
.tr-col{flex:1;min-width:0}
.tr-col .lbl{font-size:0.58rem;color:var(--muted);text-transform:uppercase;letter-spacing:0.1em;margin-bottom:2px}
.tr-col .val{font-size:0.88rem;color:var(--text2);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.tr-col .val.en{color:var(--text)}
.tr-col .val.vazio{color:#A83C2C;font-style:italic;opacity:0.7}
.tr-chevron{font-size:0.8rem;color:var(--muted);flex-shrink:0;transition:transform 0.2s}
.tr-chevron.open{transform:rotate(90deg)}
.tr-card-body{border-top:1px solid rgba(200,168,74,0.15);padding:14px;background:rgba(200,168,74,0.02)}
.tr-chave-tag{font-family:monospace;font-size:0.68rem;color:var(--muted);
  background:rgba(0,0,0,0.04);padding:3px 8px;border-radius:5px;
  display:inline-block;margin-bottom:10px;word-break:break-all}
.tr-field{margin-bottom:10px}
.tr-field label{display:block;font-size:0.62rem;color:var(--muted);
  text-transform:uppercase;letter-spacing:0.1em;margin-bottom:5px}
.tr-field input{width:100%;background:var(--bg);
  border:1.5px solid rgba(200,168,74,0.3);border-radius:8px;
  color:var(--text);padding:8px 12px;font-size:0.85rem;
  font-family:inherit;outline:none;transition:border-color 0.15s;box-sizing:border-box}
.tr-field input:focus{border-color:var(--gold)}
.tr-field input[readonly]{opacity:0.6;cursor:default;background:rgba(0,0,0,0.03)}
.tr-acoes{display:flex;gap:6px;flex-wrap:wrap;align-items:center;margin-top:4px}
.tr-btn{border-radius:7px;padding:6px 12px;cursor:pointer;font-size:0.72rem;
  font-family:inherit;font-weight:600;letter-spacing:0.04em;transition:all 0.13s;border:1.5px solid}
.tr-btn-auto{background:rgba(184,134,11,0.12);color:#B8860B;border-color:rgba(184,134,11,0.35)}
.tr-btn-save{background:linear-gradient(135deg,#2A4C72,#1C3A5E);color:rgba(200,168,74,0.95);border-color:rgba(200,168,74,0.4)}
.tr-btn-rev{background:rgba(46,125,82,0.12);color:#2E7D52;border-color:rgba(46,125,82,0.35)}
.tr-btn-ativ{background:rgba(28,58,94,0.1);color:#2A4C72;border-color:rgba(28,58,94,0.3)}
.tr-btn-ativ.on{background:linear-gradient(135deg,#2A4C72,#1C3A5E);color:rgba(200,168,74,0.9)}
.tr-badge{display:inline-flex;align-items:center;font-size:0.62rem;padding:2px 8px;
  border-radius:100px;font-weight:700;letter-spacing:0.05em;text-transform:uppercase;
  white-space:nowrap;border:1px solid;flex-shrink:0}
.tr-badge-sem{background:rgba(168,60,44,0.12);color:#A83C2C;border-color:rgba(168,60,44,0.3)}
.tr-badge-rascunho{background:rgba(184,134,11,0.12);color:#B8860B;border-color:rgba(184,134,11,0.3)}
.tr-badge-revisado{background:rgba(46,125,82,0.12);color:#2E7D52;border-color:rgba(46,125,82,0.3)}
.tr-badge-ativo{background:rgba(28,58,94,0.12);color:#2A4C72;border-color:rgba(28,58,94,0.3)}
.tr-diag{padding:10px 14px;border-radius:10px;font-size:0.75rem;margin-bottom:10px;line-height:1.6;border:1.5px solid}
.tr-diag.ok{background:rgba(46,125,82,0.08);color:#2E7D52;border-color:rgba(46,125,82,0.3)}
.tr-diag.erro{background:rgba(168,60,44,0.08);color:#A83C2C;border-color:rgba(168,60,44,0.3)}
.tr-diag.aviso{background:rgba(184,134,11,0.08);color:#B8860B;border-color:rgba(184,134,11,0.3)}
.tr-progress-bar{height:5px;background:rgba(200,168,74,0.12);border-radius:5px;overflow:hidden;margin:4px 0}
.tr-progress-fill{height:100%;border-radius:5px;transition:width 0.4s}
.tr-sublist{display:flex;flex-direction:column;gap:7px}
.tr-sub-item{background:var(--card);border:1.5px solid rgba(200,168,74,0.2);border-radius:12px;
  padding:11px 14px;cursor:pointer;transition:all 0.15s;display:flex;align-items:center;gap:11px;
  border-left:4px solid transparent}
.tr-sub-item:hover{transform:translateX(2px);box-shadow:0 3px 12px rgba(0,0,0,0.10)}
.tr-sub-icon{width:38px;height:38px;flex-shrink:0;border-radius:10px;display:flex;align-items:center;
  justify-content:center;font-size:1.15rem;background:rgba(200,168,74,0.08)}
.tr-sub-body{flex:1;min-width:0}
.tr-sub-label{font-family:'Cinzel',serif;font-weight:700;font-size:0.82rem;color:var(--text);line-height:1.25}
.tr-sub-desc{font-size:0.66rem;color:var(--muted);margin-top:1px}
.tr-sub-progress{width:64px;flex-shrink:0}
.tr-sub-right{display:flex;flex-direction:column;align-items:flex-end;gap:3px;flex-shrink:0}
</style>`;

// ── TELA 1: Grade de categorias ───────────────────────────────────────────────
// Sincroniza uma categoria dinâmica direto do grid (sem precisar entrar nela)
async function syncRapido(catId){
  const cat = TR_CATEGORIAS.find(c => c.id === catId);
  if (!cat || !cat.dinamico) return;
  toast('↻ Sincronizando '+cat.label+'…','aviso');
  try {
    const dados = await fetch(`${API}${cat.endpoint}`,
      {headers:{Authorization:`Bearer ${TOKEN}`}}).then(r=>r.json());
    const chaves = Array.isArray(dados)
      ? dados.flatMap(item => cat.mapear(item) || [])
      : [];
    if (!chaves.length) {
      toast('⚠️ Nenhuma chave gerada para '+cat.label+' — verifique se há dados no banco.','aviso');
      return;
    }
    const r = await fetch(`${API}/traducoes/seed`,{
      method:'POST', headers:{'Content-Type':'application/json',Authorization:`Bearer ${TOKEN}`},
      body: JSON.stringify({chaves, locale: TR_LOCALE}),
    });
    const res = await r.json();
    if (!r.ok) { toast('Erro: '+(res.erro||r.status),'erro'); return; }
    toast(`↻ ${cat.label}: ${res.inseridos} novas, ${res.existentes} já existentes`,'ok');
    await carregarTraducoes();
  } catch(e) { toast('Erro ao sincronizar: '+e.message,'erro'); }
}

async function carregarTraducoes(){
  TR_CAT=null; TR_DADOS=[]; TR_FILTRO='todos'; TR_EXPAND=null;
  setLoading('Carregando categorias…');

  // Busca stats e contagens de dinâmicas em paralelo — muito mais rápido
  let statsMap = {}, contsDinamicas = {};
  const dinamicas = TR_CATEGORIAS.filter(c => c.dinamico && !c.grupo);

  try {
    // /admin/stats retorna só contagens agregadas (sem transferir documentos)
    const [statsRes, ...dinamicasRes] = await Promise.all([
      fetch(`${API}/traducoes/admin/stats?locale=${TR_LOCALE}`,
        {headers:{Authorization:`Bearer ${TOKEN}`}}).then(r=>r.json()),
      ...dinamicas.map(cat =>
        fetch(`${API}${cat.endpoint}`,{headers:{Authorization:`Bearer ${TOKEN}`}})
          .then(r=>r.json()).then(dados=>{
            const lista = Array.isArray(dados) ? dados : (dados.items || dados.tropas || dados.dragoes || dados.edificios || dados.pesquisas || dados.itens || []);
            const total = lista.reduce((acc, item) => acc + (cat.mapear(item)?.length || 0), 0);
            contsDinamicas[cat.id] = total;
          }).catch(()=>{})
      ),
    ]);
    if (statsRes && typeof statsRes === 'object' && !statsRes.erro) statsMap = statsRes;
  } catch(e) { /* stats são opcionais */ }

  TR_STATS = statsMap;

  // Para categorias estáticas com múltiplos prefixos (ex: torneios_hub, torneio_general),
  // usa o total de chaves do próprio array quando o banco não tem nada ainda
  const statsDe = cat => {
    const prefix = TR_PREFIX[cat.id] || cat.id;
    const st = statsMap[prefix] || null;
    if (!st || st.total === 0) {
      if (cat.dinamico && contsDinamicas[cat.id]) {
        return {total: contsDinamicas[cat.id], ativo: 0, sem: contsDinamicas[cat.id]};
      }
      return {total: cat.chaves?.length || 0, ativo: 0, sem: cat.chaves?.length || 0};
    }
    return st;
  };

  // Categorias soltas (sem grupo) entram direto na grade.
  // Categorias com `grupo` são agregadas num único card do grupo.
  const soltas=TR_CATEGORIAS.filter(c=>!c.grupo);
  const gruposPresentes=[...new Set(TR_CATEGORIAS.filter(c=>c.grupo).map(c=>c.grupo))];

  const entradas=[
    ...soltas.map(cat=>({tipo:'cat', cat, st:statsDe(cat)})),
    ...gruposPresentes.map(gid=>{
      const grupo=TR_GRUPOS[gid];
      const membros=TR_CATEGORIAS.filter(c=>c.grupo===gid);
      const st=membros.reduce((acc,c)=>{
        const s=statsDe(c);
        acc.total+=s.total; acc.ativo+=s.ativo; acc.sem+=s.sem;
        return acc;
      },{total:0,ativo:0,sem:0});
      return {tipo:'grupo', grupo, st};
    }),
  ];

  document.getElementById('content').innerHTML = TR_CSS + `
    <div style="display:flex;align-items:center;gap:10px;margin-bottom:16px;flex-wrap:wrap">
      <label style="font-size:0.72rem;color:var(--muted);font-weight:700;letter-spacing:0.08em;text-transform:uppercase">Idioma</label>
      <select onchange="TR_LOCALE=this.value;carregarTraducoes()"
        style="background:var(--bg);border:1.5px solid rgba(200,168,74,0.25);border-radius:8px;
               color:var(--text);padding:6px 12px;font-size:0.82rem;cursor:pointer;outline:none">
        <option value="en-US" ${TR_LOCALE==='en-US'?'selected':''}>🇺🇸 English (en-US)</option>
      </select>
      <button class="btn btn-navy btn-sm" onclick="testarAPITr()">🔍 Testar API de tradução</button>
    </div>
    <div id="tr-diag-box"></div>
    <div class="tr-grid">
      ${entradas.map(({tipo, cat, grupo, st})=>{
        const item = tipo==='grupo' ? grupo : cat;
        const onclick = tipo==='grupo' ? `abrirGrupo('${grupo.id}')` : `abrirCategoria('${cat.id}')`;
        const isDinamicaVazia = tipo==='cat' && cat.dinamico && st.ativo===0;
        const pct=st.total?Math.round((st.ativo/st.total)*100):0;
        const completo=st.total>0&&st.ativo===st.total;
        return `<div class="tr-cat-card" onclick="${onclick}"
          style="border-color:${completo?item.cor+'70':'rgba(200,168,74,0.2)'}">
          <div class="tr-cat-bar" style="background:linear-gradient(90deg,${item.cor},${item.cor}50)"></div>
          <span style="font-size:1.5rem;line-height:1">${item.icon}</span>
          <span style="font-family:'Cinzel',serif;font-weight:700;font-size:0.72rem;color:var(--text);line-height:1.25">${item.label}${tipo==='grupo'?`<br><span style="font-size:0.55rem;color:var(--muted);font-weight:600">(${TR_CATEGORIAS.filter(c=>c.grupo===grupo.id).length} módulos)</span>`:''}</span>
          <div class="tr-progress-bar">
            <div class="tr-progress-fill" style="width:${pct}%;background:${item.cor}"></div>
          </div>
          <div style="display:flex;justify-content:space-between;align-items:center">
            <span style="font-size:0.56rem;color:var(--muted)">${st.ativo}/${st.total}</span>
            ${completo
              ?`<span class="tr-badge tr-badge-ativo">✓</span>`
              :isDinamicaVazia && st.total>0
                ?`<span class="tr-badge" style="background:rgba(59,92,140,0.15);color:#5C7FA3;border-color:#5C7FA3;cursor:pointer"
                    onclick="event.stopPropagation();syncRapido('${cat.id}')">↻ Sync</span>`
                :st.sem>0
                  ?`<span class="tr-badge tr-badge-sem">${st.sem} sem</span>`
                  :`<span class="tr-badge" style="background:rgba(200,168,74,0.1);color:var(--muted);border-color:rgba(200,168,74,0.2)">0</span>`}
          </div>
        </div>`;
      }).join('')}
    </div>`;
}

// ── TELA 1.5: Lista vertical de submódulos de um grupo ────────────────────────
function abrirGrupo(grupoId){
  const grupo=TR_GRUPOS[grupoId];
  if(!grupo) return;
  const membros=TR_CATEGORIAS.filter(c=>c.grupo===grupoId);

  const statsDe=cat=>{
    const prefix=TR_PREFIX[cat.id]||cat.id;
    return (TR_STATS&&TR_STATS[prefix])||{total:cat.chaves?.length||0,ativo:0,sem:cat.chaves?.length||0};
  };

  setBreadcrumb([
    {label:'🌐 Traduções', action:()=>carregarTraducoes()},
    {label:`${grupo.icon} ${grupo.label}`},
  ]);

  document.getElementById('content').innerHTML = TR_CSS + `
    <div style="margin-bottom:14px">
      <p style="font-family:'Cinzel',serif;font-weight:700;font-size:0.95rem;color:var(--text);margin-bottom:3px">
        ${grupo.icon} ${grupo.label}
      </p>
      <p style="font-size:0.72rem;color:var(--muted)">${grupo.desc} — selecione um módulo abaixo</p>
    </div>
    <div class="tr-sublist">
      ${membros.map(cat=>{
        const st=statsDe(cat);
        const pct=st.total?Math.round((st.ativo/st.total)*100):0;
        const completo=st.total>0&&st.ativo===st.total;
        return `<div class="tr-sub-item" onclick="abrirCategoria('${cat.id}')"
          style="border-left-color:${cat.cor}">
          <div class="tr-sub-icon">${cat.icon}</div>
          <div class="tr-sub-body">
            <div class="tr-sub-label">${cat.label}</div>
            <div class="tr-sub-desc">${cat.desc}</div>
          </div>
          <div class="tr-sub-progress">
            <div class="tr-progress-bar"><div class="tr-progress-fill" style="width:${pct}%;background:${cat.cor}"></div></div>
          </div>
          <div class="tr-sub-right">
            <span style="font-size:0.62rem;color:var(--muted)">${st.ativo}/${st.total}</span>
            ${completo
              ?`<span class="tr-badge tr-badge-ativo">✓</span>`
              :st.sem>0
                ?`<span class="tr-badge tr-badge-sem">${st.sem} sem</span>`
                :''}
          </div>
        </div>`;
      }).join('')}
    </div>`;
}

// ── TELA 2: Lista da categoria ────────────────────────────────────────────────
async function abrirCategoria(catId){
  const cat=TR_CATEGORIAS.find(c=>c.id===catId);
  if(!cat) return;
  TR_CAT=cat; TR_FILTRO='todos'; TR_EXPAND=null;

  const grupo=cat.grupo?TR_GRUPOS[cat.grupo]:null;
  setBreadcrumb([
    {label:'🌐 Traduções', action:()=>carregarTraducoes()},
    ...(grupo?[{label:`${grupo.icon} ${grupo.label}`, action:()=>abrirGrupo(TR_CAT.grupo)}]:[]),
    {label:`${cat.icon} ${cat.label}`},
  ]);
  setLoading(`Carregando ${cat.label}…`);

  try{
    // Determina o prefixo para filtrar apenas as chaves desta categoria no banco
    const prefix = TR_PREFIX[cat.id] || (cat.dinamico ? null : cat.id);
    const urlBanco = prefix
      ? `${API}/traducoes/admin?locale=${TR_LOCALE}&prefixo=${prefix}`
      : `${API}/traducoes/admin?locale=${TR_LOCALE}`;

    // Paraleliza: busca banco e dados da categoria ao mesmo tempo
    const [todosBanco, dadosCat] = await Promise.all([
      fetch(urlBanco, {headers:{Authorization:`Bearer ${TOKEN}`}}).then(r=>r.json()),
      cat.dinamico
        ? fetch(`${API}${cat.endpoint}`, {headers:{Authorization:`Bearer ${TOKEN}`}}).then(r=>r.json())
        : Promise.resolve(null),
    ]);

    // 2. Chaves da categoria
    let chavesDaCat = [];
    if (cat.dinamico) {
      const lista = Array.isArray(dadosCat)
        ? dadosCat
        : (dadosCat?.items || dadosCat?.tropas || dadosCat?.dragoes ||
           dadosCat?.edificios || dadosCat?.pesquisas || dadosCat?.itens || []);
      // Corrigido: não filtra por item.slug (Tropas não tem slug)
      lista.forEach(item => {
        const chaves = cat.mapear(item) || [];
        chavesDaCat.push(...chaves);
      });
    } else {
      chavesDaCat = cat.chaves || [];
    }

    // 3. Mescla com o que existe no banco
    const bancoMap = {};
    if (Array.isArray(todosBanco)) todosBanco.forEach(d => { bancoMap[d.chave] = d; });

    TR_DADOS = chavesDaCat
      .filter(c => c.textoPT)
      .map(c => bancoMap[c.chave] || {
        _id:null, chave:c.chave, textoPT:c.textoPT,
        traducao:'', status:'rascunho', fonte:'manual',
      });

    renderListaCategoria();
  }catch(e){ toast('Erro: '+e.message,'erro'); grupo?abrirGrupo(grupo.id):carregarTraducoes(); }
}
