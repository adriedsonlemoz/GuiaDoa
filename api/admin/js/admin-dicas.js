// ══════════════════════════════════════════════════════════════════════════════
// DICAS & TUTORIAIS — Admin
// ══════════════════════════════════════════════════════════════════════════════

let DI_CATS     = [];   // categorias
let DI_DICAS    = [];   // dicas da categoria aberta
let DI_CAT      = null; // categoria ativa
let DI_EDITANDO = null; // dica sendo editada

const DI_MODULOS = [
  ['ilhas','🏝️ Cidade/Ilhas'], ['edificios','🏰 Edifícios'], ['tropas','⚔️ Tropas'],
  ['dragoes','🐉 Dragões'], ['pesquisas','🔬 Pesquisas'], ['itens','🎒 Itens'],
  ['niveis','📈 Níveis'], ['torneios','🏆 Torneios'],
];
const diCsv = value => String(value || '').split(',').map(v=>v.trim()).filter(Boolean);
const diJoin = value => Array.isArray(value) ? value.join(', ') : '';

const DI_CSS = `<style>
.di-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(160px,1fr));gap:10px;margin-bottom:14px}
.di-cat-card{background:var(--card);border:1.5px solid rgba(200,168,74,0.2);border-radius:12px;
  padding:16px 12px;cursor:pointer;transition:all 0.14s;text-align:center;
  display:flex;flex-direction:column;align-items:center;gap:7px;position:relative;overflow:hidden}
.di-cat-card:hover{transform:translateY(-2px);box-shadow:0 5px 18px rgba(0,0,0,0.1)}
.di-cat-bar{position:absolute;top:0;left:0;right:0;height:3px;background:var(--gold)}
.di-toolbar{display:flex;flex-wrap:wrap;gap:8px;align-items:center;
  background:var(--card);border:1.5px solid rgba(200,168,74,0.2);
  border-radius:12px;padding:12px 14px;margin-bottom:12px}
.di-list{display:flex;flex-direction:column;gap:8px}
.di-dica-card{background:var(--card);border:1.5px solid rgba(200,168,74,0.2);
  border-radius:12px;overflow:hidden;display:flex;gap:0}
.di-dica-img{width:90px;flex-shrink:0;object-fit:cover;background:var(--bg)}
.di-dica-img-ph{width:90px;flex-shrink:0;background:rgba(200,168,74,0.08);
  display:flex;align-items:center;justify-content:center;font-size:1.8rem}
.di-dica-body{flex:1;padding:10px 12px;min-width:0}
.di-dica-titulo{font-family:'Cinzel',serif;font-weight:700;font-size:0.82rem;
  color:var(--text);margin-bottom:4px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.di-dica-conteudo{font-size:0.7rem;color:var(--muted);line-height:1.4;
  display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}
.di-dica-acoes{display:flex;gap:5px;margin-top:8px;flex-wrap:wrap}
.di-btn{border-radius:7px;padding:4px 10px;cursor:pointer;font-size:0.68rem;
  font-family:inherit;font-weight:600;border:1.5px solid;transition:all 0.12s}
.di-btn-edit{background:rgba(28,58,94,0.1);color:#2A4C72;border-color:rgba(28,58,94,0.3)}
.di-btn-del{background:rgba(168,60,44,0.1);color:#A83C2C;border-color:rgba(168,60,44,0.3)}
.di-btn-pri{background:linear-gradient(135deg,#2A4C72,#1C3A5E);color:rgba(200,168,74,0.95);border-color:rgba(200,168,74,0.4)}
.di-form{background:var(--card);border:1.5px solid rgba(200,168,74,0.25);border-radius:12px;padding:16px}
.di-field{margin-bottom:12px}
.di-field label{display:block;font-size:0.62rem;color:var(--muted);
  text-transform:uppercase;letter-spacing:0.1em;margin-bottom:5px;font-weight:700}
.di-field input,.di-field select,.di-field textarea{width:100%;background:var(--bg);
  border:1.5px solid rgba(200,168,74,0.3);border-radius:8px;color:var(--text);
  padding:8px 12px;font-size:0.85rem;font-family:inherit;outline:none;
  transition:border-color 0.15s;box-sizing:border-box}
.di-field input:focus,.di-field select:focus,.di-field textarea:focus{border-color:var(--gold)}
.di-field textarea{resize:vertical;min-height:130px}
.di-meta-grid{display:grid;grid-template-columns:1fr 1fr;gap:10px}
.di-rel-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:7px;margin-top:7px}
.di-rel-opt{display:flex;align-items:center;gap:7px;padding:8px 9px;border:1px solid rgba(200,168,74,.22);border-radius:8px;background:rgba(200,168,74,.04);font-size:.7rem;color:var(--text);cursor:pointer}
.di-rel-opt input{width:auto!important}
@media(max-width:600px){.di-meta-grid,.di-rel-grid{grid-template-columns:1fr}}
.di-imgs-grid{display:flex;flex-wrap:wrap;gap:8px;margin-top:8px}
.di-img-thumb{position:relative;width:80px;height:80px;border-radius:8px;overflow:hidden}
.di-img-thumb img{width:100%;height:100%;object-fit:cover}
.di-img-del{position:absolute;top:2px;right:2px;background:rgba(168,60,44,0.85);
  color:#fff;border:none;border-radius:50%;width:20px;height:20px;cursor:pointer;
  font-size:0.7rem;display:flex;align-items:center;justify-content:center}
.di-badge-dest{background:rgba(200,168,74,0.15);color:var(--gold);
  border:1px solid rgba(200,168,74,0.3);font-size:0.6rem;padding:1px 6px;
  border-radius:100px;font-weight:700;letter-spacing:0.05em}
.di-upload-area{border:2px dashed rgba(200,168,74,0.3);border-radius:10px;
  padding:16px;text-align:center;cursor:pointer;background:rgba(200,168,74,0.04);
  transition:all 0.15s}
.di-upload-area:hover{border-color:var(--gold);background:rgba(200,168,74,0.08)}
</style>`;

// ── Tela 1: Grade de categorias ───────────────────────────────────────────────
async function carregarDicas(){
  DI_CAT=null; DI_DICAS=[]; DI_EDITANDO=null;
  setLoading('Carregando Dicas…');
  try{
    DI_CATS=await fetch(`${API}/dicas/categorias/todas`,
      {headers:{Authorization:`Bearer ${TOKEN}`}}).then(r=>r.json());
    renderGradeDicas();
  }catch(e){toast('Erro: '+e.message,'erro');}
}

function renderGradeDicas(){
  document.getElementById('content').innerHTML = DI_CSS + `
    <div class="di-toolbar">
      <button class="btn btn-navy btn-sm" onclick="mostrarFormCategoria()">+ Nova categoria</button>
    </div>
    <div id="di-form-cat"></div>
    <div class="di-grid">
      ${DI_CATS.length===0
        ?`<div style="grid-column:1/-1;text-align:center;padding:32px;color:var(--muted)">
            <p style="font-size:1.4rem;margin-bottom:8px">📭</p>
            <p>Nenhuma categoria no MongoDB. Verifique a migração automática ou crie uma categoria manualmente.</p>
          </div>`
        :DI_CATS.map(cat=>`
          <div class="di-cat-card" onclick="abrirCatDica(fromStrArg('${strArg(cat._id)}'),fromStrArg('${strArg(cat.slug)}'),fromStrArg('${strArg(cat.label)}'),fromStrArg('${strArg(cat.icon)}'))">
            <div class="di-cat-bar"></div>
            <span style="font-size:2rem">${esc(cat.icon)}</span>
            <span style="font-family:'Cinzel',serif;font-weight:700;font-size:0.82rem;color:var(--text)">${esc(cat.label)}</span>
            ${!cat.ativo?`<span style="font-size:0.6rem;color:#A83C2C">Inativa</span>`:''}
          </div>`).join('')}
    </div>`;
}

function mostrarFormCategoria(){
  document.getElementById('di-form-cat').innerHTML=`
    <div class="di-form" style="margin-bottom:14px">
      <p style="font-family:'Cinzel',serif;font-weight:700;font-size:0.82rem;color:var(--text);margin-bottom:12px">Nova Categoria</p>
      <div style="display:grid;grid-template-columns:1fr 1fr 60px;gap:8px">
        <div class="di-field" style="margin:0"><label>Label (Português)</label><input id="di-cat-label" placeholder="Ex: Dragões"/></div>
        <div class="di-field" style="margin:0"><label>Slug</label><input id="di-cat-slug" placeholder="Ex: dragoes"/></div>
        <div class="di-field" style="margin:0"><label>Ícone</label><input id="di-cat-icon" placeholder="🐉" value="📖"/></div>
      </div>
      <div class="i18n-section" style="margin-top:12px">
        <div class="i18n-title">🇺🇸 English <span style="font-weight:500;opacity:.7">(opcional)</span></div>
        <div class="di-field" style="margin:0"><label>Label</label><input id="di-cat-en-label" placeholder="e.g. Dragons"/></div>
      </div>
      <div style="display:flex;gap:8px;margin-top:10px">
        <button class="di-btn di-btn-pri" onclick="criarCategoriaDica()">Criar</button>
        <button class="di-btn di-btn-edit" onclick="document.getElementById('di-form-cat').innerHTML=''">Cancelar</button>
      </div>
    </div>`;
}

async function criarCategoriaDica(){
  const label=document.getElementById('di-cat-label')?.value.trim();
  const slug =document.getElementById('di-cat-slug')?.value.trim().toLowerCase().replace(/\s+/g,'-');
  const icon =document.getElementById('di-cat-icon')?.value.trim()||'📖';
  const enLabel=document.getElementById('di-cat-en-label')?.value.trim()||'';
  if(!label||!slug){toast('Label e slug são obrigatórios','aviso');return;}
  try{
    await fetch(`${API}/dicas/categorias`,{
      method:'POST',headers:{'Content-Type':'application/json',Authorization:`Bearer ${TOKEN}`},
      body:JSON.stringify({label,slug,icon,i18n:{'en-US':{label:enLabel}}}),
    });
    toast('✓ Categoria criada!','ok');
    carregarDicas();
  }catch(e){toast('Erro: '+e.message,'erro');}
}

// ── Tela 2: Dicas de uma categoria ───────────────────────────────────────────
async function abrirCatDica(catId, slug, label, icon){
  DI_CAT={_id:catId,slug,label,icon};
  DI_EDITANDO=null;
  setBreadcrumb([
    {label:'💡 Dicas', action:()=>carregarDicas()},
    {label:`${icon} ${label}`},
  ]);
  setLoading(`Carregando ${label}…`);
  try{
    DI_DICAS=await fetch(`${API}/dicas/admin?categoria=${slug}`,
      {headers:{Authorization:`Bearer ${TOKEN}`}}).then(r=>r.json());
    renderListaDicas();
  }catch(e){toast('Erro: '+e.message,'erro');}
}

function renderListaDicas(){
  const cat=DI_CAT;
  document.getElementById('content').innerHTML = DI_CSS + `
    <div class="di-toolbar">
      <span style="font-size:1.4rem">${esc(cat.icon)}</span>
      <div style="flex:1">
        <div style="font-family:'Cinzel',serif;font-weight:700;font-size:0.85rem;color:var(--text)">${esc(cat.label)}</div>
        <div style="font-size:0.68rem;color:var(--muted)">${DI_DICAS.length} dica(s)</div>
      </div>
      <button class="btn btn-navy btn-sm" onclick="mostrarFormDica(null)">+ Nova dica</button>
    </div>

    <!-- Formulário inline (injetado aqui) -->
    <div id="di-form-box"></div>

    <!-- Lista -->
    <div class="di-list" id="di-lista">
      ${DI_DICAS.length===0
        ?`<div style="text-align:center;padding:40px;color:var(--muted)">
            <p style="font-size:1.4rem;margin-bottom:8px">${esc(cat.icon)}</p>
            <p>Nenhuma dica ainda. Clique em <strong>+ Nova dica</strong>.</p>
          </div>`
        :DI_DICAS.map((d,i)=>`
          <div class="di-dica-card">
            ${d.imagens?.length
              ?`<img class="di-dica-img" src="${esc(d.imagens[0].url)}" alt="" onerror="this.style.display='none'" />`
              :`<div class="di-dica-img-ph">${esc(cat.icon)}</div>`}
            <div class="di-dica-body">
              <div class="di-dica-titulo">${esc(d.titulo)} ${d.destaque?'<span class="di-badge-dest">⭐</span>':''} ${!d.ativo?'<span style="font-size:0.6rem;color:#A83C2C">[Inativa]</span>':''}</div>
              ${d.resumo?`<div class="di-dica-conteudo">${esc(d.resumo)}</div>`:(d.conteudo?`<div class="di-dica-conteudo">${esc(d.conteudo)}</div>`:'')}
              <div style="font-size:0.6rem;color:var(--muted);margin-top:5px">${esc(d.tipo||'dica')} · ${Number(d.leituraMin||0)} min · ${d.imagens?.length||0} imagem(ns) · ${(d.relacionados?.modulos||[]).length} módulo(s)</div>
              <div class="di-dica-acoes">
                <button class="di-btn di-btn-edit" onclick="mostrarFormDica(fromDataArg('${dataArg(d)}'))">✏️ Editar</button>
                <button class="di-btn di-btn-del"  onclick="excluirDica(fromStrArg('${strArg(d._id)}'),fromStrArg('${strArg(d.titulo)}'))">🗑️</button>
              </div>
            </div>
          </div>`).join('')}
    </div>`;
}

// ── Formulário criar/editar dica ──────────────────────────────────────────────
function mostrarFormDica(dica){
  DI_EDITANDO=dica;
  const isEdit=!!dica;
  const box=document.getElementById('di-form-box');
  if(!box) return;
  box.innerHTML=`
    <div class="di-form" style="margin-bottom:14px">
      <p style="font-family:'Cinzel',serif;font-weight:700;font-size:0.85rem;color:var(--text);margin-bottom:14px">
        ${isEdit?'✏️ Editar dica':'+ Nova dica'}
      </p>

      <div class="di-field">
        <label>Título *</label>
        <input id="di-titulo" value="${isEdit?esc(dica.titulo):''}" placeholder="Ex: Como evoluir Dragões rapidamente" />
      </div>

      <div class="di-meta-grid">
        <div class="di-field">
          <label>Categoria</label>
          <select id="di-cat-sel">
            ${DI_CATS.map(c=>`<option value="${esc(c.slug)}" ${(isEdit?dica.categoria:DI_CAT?.slug)===c.slug?'selected':''}>${esc(c.icon)} ${esc(c.label)}</option>`).join('')}
          </select>
        </div>
        <div class="di-field">
          <label>Tipo</label>
          <select id="di-tipo">
            ${['dica','guia','tutorial'].map(v=>`<option value="${v}" ${(isEdit?dica.tipo:'guia')===v?'selected':''}>${v[0].toUpperCase()+v.slice(1)}</option>`).join('')}
          </select>
        </div>
      </div>
      <div class="di-meta-grid">
        <div class="di-field"><label>Slug</label><input id="di-slug" value="${isEdit?esc(dica.slug||''):''}" placeholder="guia-inicial-construcoes" /></div>
        <div class="di-field"><label>Tempo de leitura (min)</label><input id="di-leitura" type="number" min="0" max="120" value="${isEdit?Number(dica.leituraMin||0):5}" /></div>
      </div>

      <div class="di-field">
        <label>Resumo</label>
        <textarea id="di-resumo" style="min-height:78px" placeholder="Uma frase curta para o card da biblioteca…">${isEdit?esc(dica.resumo||''):''}</textarea>
      </div>

      <div class="di-field">
        <label>Conteúdo do guia</label>
        <textarea id="di-conteudo" style="min-height:320px" placeholder="Use linhas com emoji como títulos, - para listas e --- para separar seções.">${isEdit?esc(dica.conteudo||''):''}</textarea>
        <div style="font-size:.64rem;color:var(--muted);margin-top:5px">O app transforma o texto em seções visuais. Ex.: 🏰 Título · - item · ---. Dados dinâmicos: {{fonte_n35}} e {{fontes_38}}.</div>
      </div>

      <div class="di-field">
        <label>Conectar com módulos do jogo</label>
        <div class="di-rel-grid">
          ${DI_MODULOS.map(([id,label])=>`<label class="di-rel-opt"><input type="checkbox" data-di-modulo="${id}" ${(dica?.relacionados?.modulos||[]).includes(id)?'checked':''}/> ${label}</label>`).join('')}
        </div>
      </div>
      <div class="di-meta-grid">
        <div class="di-field"><label>Edifícios relacionados (slugs)</label><input id="di-rel-edificios" value="${isEdit?esc(diJoin(dica.relacionados?.edificios)):''}" placeholder="FonteDaCura, Casa, Fabrica" /></div>
        <div class="di-field"><label>Tropas relacionadas (nomes)</label><input id="di-rel-tropas" value="${isEdit?esc(diJoin(dica.relacionados?.tropas)):''}" placeholder="Hoplita, Ogros de Granito" /></div>
        <div class="di-field"><label>Dragões relacionados (slugs)</label><input id="di-rel-dragoes" value="${isEdit?esc(diJoin(dica.relacionados?.dragoes)):''}" placeholder="dragao_agua, dragao_terra" /></div>
        <div class="di-field"><label>Pesquisas relacionadas (slugs)</label><input id="di-rel-pesquisas" value="${isEdit?esc(diJoin(dica.relacionados?.pesquisas)):''}" placeholder="opcional" /></div>
      </div>

      <div class="i18n-section" style="margin:14px 0">
        <div class="i18n-title">🇺🇸 English <span style="font-weight:500;opacity:.7">(opcional)</span></div>
        <div class="di-field">
          <label>Title</label>
          <input id="di-en-titulo" value="${isEdit?esc(dica.i18n?.['en-US']?.titulo||''):''}" placeholder="e.g. Beginner Building Guide" />
        </div>
        <div class="di-field">
          <label>Summary</label>
          <textarea id="di-en-resumo" style="min-height:78px" placeholder="Short summary shown on the guide card…">${isEdit?esc(dica.i18n?.['en-US']?.resumo||''):''}</textarea>
        </div>
        <div class="di-field" style="margin-bottom:0">
          <label>Guide content</label>
          <textarea id="di-en-conteudo" style="min-height:280px" placeholder="Write the guide in English…">${isEdit?esc(dica.i18n?.['en-US']?.conteudo||''):''}</textarea>
        </div>
      </div>

      <div class="di-field">
        <label style="display:flex;align-items:center;gap:8px;cursor:pointer">
          <input type="checkbox" id="di-destaque" ${isEdit&&dica.destaque?'checked':''} style="width:auto;accent-color:var(--gold)"/>
          ⭐ Marcar como destaque
        </label>
      </div>

      <div class="di-field">
        <label style="display:flex;align-items:center;gap:8px;cursor:pointer">
          <input type="checkbox" id="di-ativo" ${!isEdit||dica.ativo?'checked':''} style="width:auto;accent-color:var(--gold)"/>
          Dica ativa (visível no app)
        </label>
      </div>

      ${isEdit && dica.imagens?.length?`
      <div class="di-field">
        <label>Imagens atuais</label>
        <div class="di-imgs-grid">
          ${dica.imagens.map((img,idx)=>`
            <div class="di-img-thumb">
              <img src="${esc(img.url)}" alt="" onerror="this.src='data:image/svg+xml,<svg xmlns=\\'http://www.w3.org/2000/svg\\' width=\\'80\\' height=\\'80\\'><rect fill=\\'%23eee\\' width=\\'80\\' height=\\'80\\'/></svg>'" />
              <button class="di-img-del" onclick="removerImagem('${dica._id}',${idx})" title="Remover">✕</button>
            </div>`).join('')}
        </div>
      </div>`:''}

      <div class="di-field">
        <label>Adicionar imagens</label>
        <div class="di-upload-area" onclick="document.getElementById('di-file-inp').click()">
          <div style="font-size:1.5rem;margin-bottom:6px">📷</div>
          <div style="font-size:0.78rem;color:var(--muted)">Clique para selecionar imagens</div>
          <div style="font-size:0.65rem;color:var(--muted);margin-top:3px">JPG, PNG, WebP — máx 10MB cada</div>
          <input type="file" id="di-file-inp" accept="image/*" multiple style="display:none"
            onchange="previewImagens(this)" />
        </div>
        <div id="di-preview-imgs" class="di-imgs-grid" style="margin-top:8px"></div>
      </div>

      <div style="display:flex;gap:8px;margin-top:4px">
        <button class="di-btn di-btn-pri" onclick="salvarDica()">
          ${isEdit?'💾 Salvar alterações':'✓ Criar dica'}
        </button>
        <button class="di-btn di-btn-edit" onclick="document.getElementById('di-form-box').innerHTML='';DI_EDITANDO=null">
          Cancelar
        </button>
      </div>
    </div>`;
}

// Preview de imagens antes de upload
let DI_FILES_PENDENTES = [];
function previewImagens(input){
  DI_FILES_PENDENTES = Array.from(input.files);
  const box = document.getElementById('di-preview-imgs');
  if(!box) return;
  box.innerHTML = DI_FILES_PENDENTES.map((f,i)=>`
    <div class="di-img-thumb">
      <img src="${URL.createObjectURL(f)}" alt="" />
      <button class="di-img-del" onclick="DI_FILES_PENDENTES.splice(${i},1);previewImagens({files:DI_FILES_PENDENTES})" title="Remover">✕</button>
    </div>`).join('');
}

// Salvar dica (criar ou editar)
async function salvarDica(){
  const titulo   = document.getElementById('di-titulo')?.value.trim();
  const categoria= document.getElementById('di-cat-sel')?.value;
  const slug      = document.getElementById('di-slug')?.value.trim();
  const tipo      = document.getElementById('di-tipo')?.value || 'dica';
  const leituraMin= Number(document.getElementById('di-leitura')?.value || 0);
  const resumo    = document.getElementById('di-resumo')?.value.trim();
  const conteudo = document.getElementById('di-conteudo')?.value.trim();
  const destaque = document.getElementById('di-destaque')?.checked;
  const ativo    = document.getElementById('di-ativo')?.checked;
  const i18n     = { 'en-US': {
    titulo: document.getElementById('di-en-titulo')?.value.trim() || '',
    resumo: document.getElementById('di-en-resumo')?.value.trim() || '',
    conteudo: document.getElementById('di-en-conteudo')?.value.trim() || '',
  } };

  const relacionados = {
    modulos: [...document.querySelectorAll('[data-di-modulo]:checked')].map(el=>el.dataset.diModulo),
    edificios: diCsv(document.getElementById('di-rel-edificios')?.value),
    tropas: diCsv(document.getElementById('di-rel-tropas')?.value),
    dragoes: diCsv(document.getElementById('di-rel-dragoes')?.value),
    pesquisas: diCsv(document.getElementById('di-rel-pesquisas')?.value),
  };

  if(!titulo){toast('Título é obrigatório','aviso');return;}

  try{
    let dica;
    if(DI_EDITANDO){
      const r=await fetch(`${API}/dicas/${DI_EDITANDO._id}`,{
        method:'PATCH',headers:{'Content-Type':'application/json',Authorization:`Bearer ${TOKEN}`},
        body:JSON.stringify({titulo,slug,categoria,resumo,conteudo,tipo,leituraMin,relacionados,destaque,ativo,i18n}),
      });
      dica=await r.json();
      if(!r.ok) throw new Error(dica.erro || 'Não foi possível salvar a dica.');
    } else {
      const r=await fetch(`${API}/dicas`,{
        method:'POST',headers:{'Content-Type':'application/json',Authorization:`Bearer ${TOKEN}`},
        body:JSON.stringify({titulo,slug,categoria,resumo,conteudo,tipo,leituraMin,relacionados,destaque,ativo,i18n}),
      });
      dica=await r.json();
      if(!r.ok) throw new Error(dica.erro || 'Não foi possível criar a dica.');
    }

    // Upload de imagens pendentes
    if(DI_FILES_PENDENTES.length && dica._id){
      const fd=new FormData();
      DI_FILES_PENDENTES.forEach(f=>fd.append('imagens',f));
      const uploadResp=await fetch(`${API}/dicas/${dica._id}/imagens`,{
        method:'POST',headers:{Authorization:`Bearer ${TOKEN}`},
        body:fd,
      });
      if(!uploadResp.ok){
        const uploadErro=await uploadResp.json().catch(()=>({}));
        throw new Error(uploadErro.erro || 'A dica foi salva, mas o envio das imagens falhou.');
      }
      DI_FILES_PENDENTES=[];
    }

    toast(DI_EDITANDO?'✓ Dica atualizada!':'✓ Dica criada!','ok');
    DI_EDITANDO=null;
    await abrirCatDica(DI_CAT._id,DI_CAT.slug,DI_CAT.label,DI_CAT.icon);
  }catch(e){toast('Erro: '+e.message,'erro');}
}

// Remover imagem de uma dica
async function removerImagem(dicaId, idx){
  if(!confirm('Remover esta imagem?')) return;
  try{
    await fetch(`${API}/dicas/${dicaId}/imagens/${idx}`,{
      method:'DELETE',headers:{Authorization:`Bearer ${TOKEN}`},
    });
    toast('Imagem removida','ok');
    await abrirCatDica(DI_CAT._id,DI_CAT.slug,DI_CAT.label,DI_CAT.icon);
  }catch(e){toast('Erro: '+e.message,'erro');}
}

// Excluir dica
async function excluirDica(id, titulo){
  if(!confirm(`Excluir "${titulo}"? As imagens serão removidas do Cloudinary.`)) return;
  try{
    await fetch(`${API}/dicas/${id}`,{
      method:'DELETE',headers:{Authorization:`Bearer ${TOKEN}`},
    });
    toast('Dica excluída','ok');
    await abrirCatDica(DI_CAT._id,DI_CAT.slug,DI_CAT.label,DI_CAT.icon);
  }catch(e){toast('Erro: '+e.message,'erro');}
}
