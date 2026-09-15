const EMOJIS_ITENS = [
  '🎒','💎','🔮','✨','💫','⚡','🔥','❄️','🌿','🌀','⚗️','🧪','🧫','🧲','💉','💊','🍀','🌸','🦋','🌙',
  '☀️','🌊','🌪️','🪄','🗝️','🔑','🏺','📿','🪬','🧿','💍','💰','🪙','👑','🏆','⚔️','🛡️','🗡️','🪃','🪝',
  '📜','📖','🔭','⚙️','🪤','🧩','🎯','🎁','🎀','🎐','🐉','🦅','🦁','🐺','🐝','🦊','🦋','🐙','🦂','🦄',
  '🍄','🌰','🫀','🔴','🟡','🟠','🟢','🔵','🟣','⚫',
];

let ITENS_ADMIN_CACHE = [];
let CONTEUDO_ITEM_EDIT = [];

const ITEM_GROUP_LABEL = { recursos:'Recursos', aceleracoes:'Acelerações', geral:'Geral', arcas:'Arcas' };

async function carregarItens() {
  document.getElementById('content').innerHTML = '<div class="loading"><span class="spinner"></span> Carregando itens...</div>';
  try {
    const r = await fetch(`${API}/itens?limite=500`, { headers:{ Authorization:`Bearer ${TOKEN}` } });
    if (r.status === 401) { sair(); return; }
    const d = await r.json();
    ITENS_ADMIN_CACHE = Array.isArray(d.itens) ? d.itens : [];
    renderItens({ ...d, itens:ITENS_ADMIN_CACHE });
  } catch (err) {
    document.getElementById('content').innerHTML = `<div class="loading" style="color:var(--red)">❌ Erro: ${esc(err.message)}</div>`;
  }
}

function renderItens(d) {
  const hasPrice = item => item.preco?.valor !== null && item.preco?.valor !== undefined && item.preco?.valor !== '' && Number.isFinite(Number(item.preco.valor));
  const ruby = item => hasPrice(item) ? `<span style="color:#138a45;font-weight:900">♦ ${Number(item.preco.valor)}</span>` : '—';
  document.getElementById('content').innerHTML = `
    <div class="stats-row">
      <div class="stat-box"><div class="stat-val">${d.total}</div><div class="stat-lbl">Total de Itens</div></div>
      <div class="stat-box"><div class="stat-val">${d.itens.filter(i=>i.grupo==='arcas').length}</div><div class="stat-lbl">Arcas</div></div>
      <div class="stat-box"><div class="stat-val">${d.itens.filter(hasPrice).length}</div><div class="stat-lbl">Com preço</div></div>
    </div>
    <div class="card">
      <div class="card-header"><h2>🎒 Itens</h2><button class="btn btn-gold btn-sm" onclick="abrirModalNovoItem()">＋ Novo Item</button></div>
      <div class="card-body"><div class="tabela-wrap"><table>
        <thead><tr><th style="width:50px">ÍCONE</th><th>NOME</th><th>GRUPO</th><th>CATEGORIA</th><th>RUBIS</th><th style="white-space:nowrap">AÇÕES</th></tr></thead>
        <tbody>
          ${d.itens.map(item => `<tr>
            <td style="text-align:center;font-size:1.4rem">${item.imagem ? `<img src="${esc(item.imagem)}" alt="" style="width:38px;height:38px;object-fit:cover;border-radius:7px">` : esc(item.icone || '🎒')}</td>
            <td><strong>${esc(item.nome)}</strong>${item.destaque ? ' <span title="Destaque">★</span>' : ''}<div style="font-size:.58rem;color:var(--muted);margin-top:3px">${esc(item.slug || '')}</div></td>
            <td>${esc(ITEM_GROUP_LABEL[item.grupo] || 'Geral')}</td>
            <td>${esc(item.categoria || 'Geral')}</td>
            <td>${ruby(item)}</td>
            <td style="white-space:nowrap"><button class="btn btn-navy btn-sm btn-acao" onclick="editarItem(fromDataArg('${dataArg(item)}'))">✏ Editar</button> <button class="btn btn-red btn-sm btn-acao" onclick="confirmarRemoverItem(fromStrArg('${strArg(item._id)}'),fromStrArg('${strArg(item.nome)}'))">🗑 Excluir</button></td>
          </tr>`).join('')}
          ${d.itens.length === 0 ? '<tr><td colspan="6" style="text-align:center;padding:28px;color:var(--muted)">Nenhum item cadastrado.</td></tr>' : ''}
        </tbody>
      </table></div></div>
    </div>`;
}

function resetItemForm() {
  const values = {
    'fi-nome':'','fi-slug':'','fi-descricao':'','fi-onde':'','fi-imagem':'','fi-categoria':'Geral','fi-raridade':'','fi-quantidade':'',
    'fi-origem':'','fi-uso':'','fi-limites':'','fi-ordem':'999','fi-preco':'','fi-preco-original':'','fi-efeito-tipo':'','fi-efeito-valor':'',
    'fi-efeito-unidade':'','fi-tags':'','fi-conteudo-observacao':'','fi-en-nome':'','fi-en-descricao':'','fi-en-onde':''
  };
  Object.entries(values).forEach(([id,value]) => { const el=document.getElementById(id); if(el) el.value=value; });
  document.getElementById('fi-grupo').value = 'geral';
  document.getElementById('fi-destaque').checked = false;
  CONTEUDO_ITEM_EDIT = [];
}

function abrirModalNovoItem() {
  EDITANDO_ITEM_ID = null;
  ICONE_SELECIONADO = '🎒';
  document.getElementById('modal-item-titulo').textContent = '✦ Novo Item';
  resetItemForm();
  renderEmojiPicker();
  renderConteudoItemAdmin();
  abrirModal('modal-item');
}

function editarItem(item) {
  EDITANDO_ITEM_ID = item._id;
  ICONE_SELECIONADO = item.icone || '🎒';
  document.getElementById('modal-item-titulo').textContent = `✏ Editar: ${item.nome}`;
  const set=(id,value='')=>{ const el=document.getElementById(id); if(el) el.value=value ?? ''; };
  set('fi-nome',item.nome); set('fi-slug',item.slug); set('fi-descricao',item.descricao); set('fi-onde',item.onde); set('fi-imagem',item.imagem);
  set('fi-categoria',item.categoria || 'Geral'); set('fi-raridade',item.raridade); set('fi-quantidade',item.quantidade); set('fi-origem',item.origem);
  set('fi-uso',item.uso); set('fi-limites',item.limites); set('fi-ordem',item.ordem ?? 999); set('fi-preco',item.preco?.valor); set('fi-preco-original',item.preco?.valorOriginal);
  set('fi-efeito-tipo',item.efeito?.tipo); set('fi-efeito-valor',item.efeito?.valor); set('fi-efeito-unidade',item.efeito?.unidade); set('fi-tags',(item.tags || []).join(', '));
  set('fi-conteudo-observacao',item.conteudoObservacao); set('fi-en-nome',item.i18n?.['en-US']?.nome); set('fi-en-descricao',item.i18n?.['en-US']?.descricao); set('fi-en-onde',item.i18n?.['en-US']?.onde);
  document.getElementById('fi-grupo').value = item.grupo || 'geral';
  document.getElementById('fi-destaque').checked = Boolean(item.destaque);
  CONTEUDO_ITEM_EDIT = (item.conteudo || []).map(row => ({ itemSlug:row.itemSlug || '', quantidade:row.quantidade ?? 1, observacao:row.observacao || '' }));
  renderEmojiPicker();
  renderConteudoItemAdmin();
  abrirModal('modal-item');
}

function renderEmojiPicker() {
  const grid = document.getElementById('emoji-grid');
  grid.innerHTML = EMOJIS_ITENS.map(e => `<button type="button" class="emoji-btn ${e === ICONE_SELECIONADO ? 'ativo' : ''}" onclick="selecionarEmoji('${e}')" title="${e}">${e}</button>`).join('');
  document.getElementById('emoji-preview').textContent = ICONE_SELECIONADO;
}

function selecionarEmoji(e) {
  ICONE_SELECIONADO = e;
  document.getElementById('emoji-preview').textContent = e;
  document.querySelectorAll('.emoji-btn').forEach(button => button.classList.toggle('ativo', button.textContent === e));
}

function renderConteudoItemAdmin() {
  const box = document.getElementById('fi-conteudo-lista');
  if (!box) return;
  const options = ITENS_ADMIN_CACHE.filter(item => item._id !== EDITANDO_ITEM_ID).map(item => `<option value="${esc(item.slug || '')}">${esc(item.nome)} · ${esc(item.slug || 'sem-slug')}</option>`).join('');
  box.innerHTML = CONTEUDO_ITEM_EDIT.length ? CONTEUDO_ITEM_EDIT.map((row,index) => `
    <div class="item-content-admin-row">
      <select onchange="atualizarConteudoItem(${index},'itemSlug',this.value)"><option value="">Selecione um item…</option>${options.replace(`value="${row.itemSlug}"`,`value="${row.itemSlug}" selected`)}</select>
      <input type="number" min="0" step="1" value="${Number(row.quantidade ?? 1)}" title="Quantidade" onchange="atualizarConteudoItem(${index},'quantidade',this.value)">
      <button type="button" class="btn btn-red btn-sm" onclick="removerConteudoItem(${index})">✕</button>
    </div>`).join('') : '<div style="font-size:.68rem;color:var(--muted);padding:8px 0">Nenhum conteúdo relacionado. Use apenas para Arcas/recipientes.</div>';
}

function adicionarConteudoItem() { CONTEUDO_ITEM_EDIT.push({ itemSlug:'', quantidade:1, observacao:'' }); renderConteudoItemAdmin(); }
function removerConteudoItem(index) { CONTEUDO_ITEM_EDIT.splice(index,1); renderConteudoItemAdmin(); }
function atualizarConteudoItem(index,campo,value) { if (!CONTEUDO_ITEM_EDIT[index]) return; CONTEUDO_ITEM_EDIT[index][campo] = campo === 'quantidade' ? Math.max(0,Number(value)||0) : value; }

async function salvarItem() {
  const nome = document.getElementById('fi-nome').value.trim();
  if (!nome) return toast('Preencha o nome do item!', 'warn');
  const val=id=>document.getElementById(id)?.value?.trim?.() || '';
  const body = {
    nome, slug:val('fi-slug'), icone:ICONE_SELECIONADO, imagem:val('fi-imagem'), grupo:document.getElementById('fi-grupo').value,
    categoria:val('fi-categoria') || 'Geral', raridade:val('fi-raridade'), quantidade:val('fi-quantidade'), destaque:document.getElementById('fi-destaque').checked,
    preco:{ valor:val('fi-preco'), valorOriginal:val('fi-preco-original'), moeda:'rubis' },
    efeito:{ tipo:val('fi-efeito-tipo'), valor:val('fi-efeito-valor'), unidade:val('fi-efeito-unidade') },
    conteudo:CONTEUDO_ITEM_EDIT.filter(row=>row.itemSlug), conteudoObservacao:val('fi-conteudo-observacao'), tags:val('fi-tags').split(',').map(v=>v.trim()).filter(Boolean),
    descricao:val('fi-descricao'), origem:val('fi-origem'), uso:val('fi-uso'), limites:val('fi-limites'), onde:val('fi-onde'), ordem:val('fi-ordem'),
    i18n:{ 'en-US':{ nome:val('fi-en-nome'), descricao:val('fi-en-descricao'), onde:val('fi-en-onde') } },
  };
  try {
    const url = EDITANDO_ITEM_ID ? `${API}/itens/${EDITANDO_ITEM_ID}` : `${API}/itens`;
    const r = await fetch(url,{ method:EDITANDO_ITEM_ID?'PUT':'POST', headers:{ 'Content-Type':'application/json', Authorization:`Bearer ${TOKEN}` }, body:JSON.stringify(body) });
    const d = await r.json();
    if (!r.ok) return toast(d.erro || 'Erro ao salvar', 'erro');
    fecharModal('modal-item');
    toast(EDITANDO_ITEM_ID ? `"${d.nome}" atualizado!` : `"${d.nome}" criado!`, 'ok');
    carregarItens();
  } catch (e) { toast('Erro de rede: ' + e.message, 'erro'); }
}

function confirmarRemoverItem(id,nome) {
  document.getElementById('confirm-msg').textContent = `Remover "${nome}" permanentemente?`;
  document.getElementById('confirm-ok').onclick = async () => {
    const r = await fetch(`${API}/itens/${id}`, { method:'DELETE', headers:{ Authorization:`Bearer ${TOKEN}` } });
    const d = await r.json();
    fecharModal('confirm-modal');
    if (!r.ok) return toast(d.erro || 'Erro','erro');
    toast(d.mensagem,'ok');
    carregarItens();
  };
  abrirModal('confirm-modal');
}
