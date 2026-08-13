const EMOJIS_ITENS = [
  '🎒','💎','🔮','✨','💫','⚡','🔥','❄️','🌿','🌀',
  '⚗️','🧪','🧫','🧲','💉','💊','🍀','🌸','🦋','🌙',
  '☀️','🌊','🌪️','🪄','🗝️','🔑','🏺','📿','🪬','🧿',
  '💍','💰','🪙','👑','🏆','⚔️','🛡️','🗡️','🪃','🪝',
  '📜','📖','🔭','⚙️','🪤','🧩','🎯','🎁','🎀','🎐',
  '🐉','🦅','🦁','🐺','🐝','🦊','🦋','🐙','🦂','🦄',
  '🍄','🌰','🫀','🔴','🟡','🟠','🟢','🔵','🟣','⚫',
];

async function carregarItens() {
  document.getElementById('content').innerHTML = '<div class="loading"><span class="spinner"></span> Carregando itens...</div>';
  try {
    const r = await fetch(`${API}/itens`, { headers: { Authorization: `Bearer ${TOKEN}` } });
    if (r.status === 401) { sair(); return; }
    const d = await r.json();
    renderItens(d);
  } catch (err) {
    document.getElementById('content').innerHTML = `<div class="loading" style="color:var(--red)">❌ Erro: ${esc(err.message)}</div>`;
  }
}

function renderItens(d) {
  document.getElementById('content').innerHTML = `
    <div class="stats-row">
      <div class="stat-box"><div class="stat-val">${d.total}</div><div class="stat-lbl">Total de Itens</div></div>
    </div>

    <div class="card">
      <div class="card-header">
        <h2>🎒 Itens</h2>
        <button class="btn btn-gold btn-sm" onclick="abrirModalNovoItem()">＋ Novo Item</button>
      </div>
      <div class="card-body">
        <div class="tabela-wrap">
          <table>
            <thead><tr>
              <th style="width:50px">ÍCONE</th>
              <th>NOME</th>
              <th>CATEGORIA</th>
              <th>RARIDADE</th>
              <th style="white-space:nowrap">AÇÕES</th>
            </tr></thead>
            <tbody>
              ${d.itens.map(item => `
                <tr>
                  <td style="text-align:center;font-size:1.4rem">${esc(item.icone || '🎒')}</td>
                  <td><strong>${esc(item.nome)}</strong></td>
                  <td>${esc(item.categoria || 'Geral')}</td>
                  <td>${esc(item.raridade || '—')}</td>
                  <td style="white-space:nowrap">
                    <button class="btn btn-navy btn-sm btn-acao" onclick="editarItem(fromDataArg('${dataArg(item)}'))">✏ Editar</button>
                    <button class="btn btn-red btn-sm btn-acao"  onclick="confirmarRemoverItem(fromStrArg('${strArg(item._id)}'),fromStrArg('${strArg(item.nome)}'))">🗑 Excluir</button>
                  </td>
                </tr>
              `).join('')}
              ${d.itens.length === 0 ? '<tr><td colspan="6" style="text-align:center;padding:28px;color:var(--muted)">Nenhum item cadastrado. Clique em "＋ Novo Item" para começar.</td></tr>' : ''}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `;
}

function abrirModalNovoItem() {
  EDITANDO_ITEM_ID = null;
  ICONE_SELECIONADO = '🎒';
  document.getElementById('modal-item-titulo').textContent = '✦ Novo Item';
  document.getElementById('fi-nome').value = '';
  document.getElementById('fi-descricao').value = '';
  document.getElementById('fi-onde').value = '';
  document.getElementById('fi-imagem').value = '';
  document.getElementById('fi-categoria').value = 'Geral';
  document.getElementById('fi-raridade').value = '';
  document.getElementById('fi-quantidade').value = '';
  document.getElementById('fi-origem').value = '';
  document.getElementById('fi-uso').value = '';
  document.getElementById('fi-limites').value = '';
  document.getElementById('fi-ordem').value = '999';
  renderEmojiPicker();
  abrirModal('modal-item');
}

function editarItem(item) {
  EDITANDO_ITEM_ID  = item._id;
  ICONE_SELECIONADO = item.icone || '🎒';
  document.getElementById('modal-item-titulo').textContent = `✏ Editar: ${item.nome}`;
  document.getElementById('fi-nome').value      = item.nome || '';
  document.getElementById('fi-descricao').value = item.descricao || '';
  document.getElementById('fi-onde').value      = item.onde || '';
  document.getElementById('fi-imagem').value = item.imagem || '';
  document.getElementById('fi-categoria').value = item.categoria || 'Geral';
  document.getElementById('fi-raridade').value = item.raridade || '';
  document.getElementById('fi-quantidade').value = item.quantidade ?? '';
  document.getElementById('fi-origem').value = item.origem || '';
  document.getElementById('fi-uso').value = item.uso || '';
  document.getElementById('fi-limites').value = item.limites || '';
  document.getElementById('fi-ordem').value = item.ordem ?? 999;
  document.getElementById('fi-en-nome').value = item.i18n?.['en-US']?.nome || '';
  document.getElementById('fi-en-descricao').value = item.i18n?.['en-US']?.descricao || '';
  document.getElementById('fi-en-onde').value = item.i18n?.['en-US']?.onde || '';
  renderEmojiPicker();
  abrirModal('modal-item');
}

function renderEmojiPicker() {
  const grid = document.getElementById('emoji-grid');
  grid.innerHTML = EMOJIS_ITENS.map(e => `
    <button type="button" class="emoji-btn ${e === ICONE_SELECIONADO ? 'ativo' : ''}"
      onclick="selecionarEmoji('${e}')" title="${e}">${e}</button>
  `).join('');
  document.getElementById('emoji-preview').textContent = ICONE_SELECIONADO;
}

function selecionarEmoji(e) {
  ICONE_SELECIONADO = e;
  document.getElementById('emoji-preview').textContent = e;
  document.querySelectorAll('.emoji-btn').forEach(b => {
    b.classList.toggle('ativo', b.textContent === e);
  });
}

async function salvarItem() {
  const nome      = document.getElementById('fi-nome').value.trim();
  const descricao = document.getElementById('fi-descricao').value.trim();
  const onde      = document.getElementById('fi-onde').value.trim();
  if (!nome) return toast('Preencha o nome do item!', 'warn');

  const body = {
    nome, icone: ICONE_SELECIONADO, descricao, onde,
    imagem: document.getElementById('fi-imagem').value.trim(),
    categoria: document.getElementById('fi-categoria').value.trim() || 'Geral',
    raridade: document.getElementById('fi-raridade').value.trim(),
    quantidade: document.getElementById('fi-quantidade').value,
    origem: document.getElementById('fi-origem').value.trim(),
    uso: document.getElementById('fi-uso').value.trim(),
    limites: document.getElementById('fi-limites').value.trim(),
    ordem: document.getElementById('fi-ordem').value,
    i18n: { 'en-US': {
    nome: document.getElementById('fi-en-nome').value.trim(),
    descricao: document.getElementById('fi-en-descricao').value.trim(),
    onde: document.getElementById('fi-en-onde').value.trim(),
  } } };
  try {
    const url    = EDITANDO_ITEM_ID ? `${API}/itens/${EDITANDO_ITEM_ID}` : `${API}/itens`;
    const method = EDITANDO_ITEM_ID ? 'PUT' : 'POST';
    const r = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${TOKEN}` },
      body: JSON.stringify(body),
    });
    const d = await r.json();
    if (!r.ok) return toast(d.erro || 'Erro ao salvar', 'erro');
    fecharModal('modal-item');
    toast(EDITANDO_ITEM_ID ? `"${d.nome}" atualizado!` : `"${d.nome}" criado!`, 'ok');
    carregarItens();
  } catch (e) { toast('Erro de rede: ' + e.message, 'erro'); }
}

function confirmarRemoverItem(id, nome) {
  document.getElementById('confirm-msg').textContent = `Remover "${nome}" permanentemente?`;
  document.getElementById('confirm-ok').onclick = async () => {
    const r = await fetch(`${API}/itens/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${TOKEN}` } });
    const d = await r.json();
    fecharModal('confirm-modal');
    if (!r.ok) return toast(d.erro || 'Erro', 'erro');
    toast(d.mensagem, 'ok');
    carregarItens();
  };
  abrirModal('confirm-modal');
}
