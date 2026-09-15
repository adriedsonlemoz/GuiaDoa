const ATTRS_BASE = [
  { key:'vida',           label:'Vida'            },
  { key:'defesa',         label:'Defesa'          },
  { key:'ataquePerto',    label:'Ataque de Perto' },
  { key:'ataqueDistante', label:'Ataque Distante' },
  { key:'alcance',        label:'Alcance'         },
  { key:'velocidade',     label:'Velocidade'      },
];
const ATTRS_ELEMENTAL = [
  { key:'ataqueElemental',     label:'Ataque Elemental'      },
  { key:'impulsoElemental',    label:'Impulso Elemental'     },
  { key:'barreiraElemental',   label:'Barreira Elemental'    },
  { key:'bombardeioElemental', label:'Bombardeio Elemental'  },
  { key:'confrontoElemental',  label:'Confronto Elemental'   },
  { key:'bloqueioElemental',   label:'Bloqueio Elemental'    },
  { key:'rupturaElemental',    label:'Ruptura Elemental'     },
];
const TODOS_ATTRS = [...ATTRS_BASE, ...ATTRS_ELEMENTAL];
const fmtAttr = v => v == null ? '—' : typeof v === 'number' ? v.toLocaleString('pt-BR') : esc(v);
let DRAGAO_HAB_ATUAL_ID = null;
let DRAGAO_OBTENCAO_ATUAL = {};
const valNum = id => { const raw = document.getElementById(id)?.value; return raw === '' || raw == null ? null : Number(raw); };

async function carregarDragoes() {
  document.getElementById('content').innerHTML = '<div class="loading"><span class="spinner"></span> Carregando dragões...</div>';
  try {
    const r = await fetch(`${API}/dragoes`, { headers:{ Authorization:`Bearer ${TOKEN}` } });
    if (r.status === 401) { sair(); return; }
    const d = await r.json();
    renderDragoes(d);
  } catch(err) {
    document.getElementById('content').innerHTML = `<div class="loading" style="color:var(--red)">❌ ${esc(err.message)}</div>`;
  }
}

function renderDragoes(d) {
  document.getElementById('content').innerHTML = `
    <div class="stats-row">
      <div class="stat-box"><div class="stat-val">${d.total}</div><div class="stat-lbl">Dragões</div></div>
      <div class="stat-box"><div class="stat-val">${d.dragoes.reduce((s,dr)=>s+(dr.niveis?.length||0),0)}</div><div class="stat-lbl">Snapshots de atributos</div></div>
      <div class="stat-box"><div class="stat-val">${d.dragoes.reduce((s,dr)=>s+(dr.habilidades?.length||0),0)}</div><div class="stat-lbl">Habilidades</div></div>
    </div>
    <div class="card">
      <div class="card-header">
        <h2>🐉 Dragões</h2>
        <div style="display:flex;gap:8px;flex-wrap:wrap">
          <button class="btn btn-gold btn-sm"  onclick="abrirModalNovoDragao()">＋ Novo Dragão</button>
        </div>
      </div>
      <div class="card-body">
        ${d.dragoes.length === 0 ? `
          <div style="text-align:center;padding:32px;color:var(--muted)">
            <p style="font-size:2rem;margin-bottom:8px">🐉</p>
            <p>Nenhum dragão cadastrado.</p>
            <p style="font-size:0.8rem;margin-top:8px">Os dados padrão são migrados automaticamente para o MongoDB. Verifique o diagnóstico da migração ou use <strong>＋ Novo Dragão</strong>.</p>
          </div>
        ` : `
          <div class="tabela-wrap">
            <table>
              <thead><tr>
                <th style="width:36px"></th>
                <th>DRAGÃO</th>
                <th>ELEMENTO</th>
                <th style="text-align:center">NÍVEIS</th>
                <th style="text-align:center">HAB.</th>
                <th style="white-space:nowrap">AÇÕES</th>
              </tr></thead>
              <tbody>
                ${d.dragoes.map(dr => `
                  <tr>
                    <td style="text-align:center">${dr.imagem ? `<img src="${esc(dr.imagem)}" alt="" style="width:42px;height:40px;object-fit:cover;border-radius:6px;border:1px solid rgba(200,168,74,.45)">` : esc(dr.emojiDragao || '🐉')}</td>
                    <td>
                      <strong>${esc(dr.nome)}</strong>
                      <div style="font-size:0.65rem;color:var(--muted);margin-top:1px">${esc(dr.raridade || '')}</div>
                    </td>
                    <td>
                      <span style="display:inline-flex;align-items:center;gap:4px;font-size:0.72rem;
                        padding:2px 8px;border-radius:5px;
                        background:${safeColor(dr.cor)}22;border:1px solid ${safeColor(dr.cor)}44;
                        color:${safeColor(dr.cor)}">
                        ${esc(dr.emoji || '🔥')} ${esc(dr.elemento || '—')}
                      </span>
                    </td>
                    <td style="text-align:center;font-weight:800;color:var(--gold3)">${dr.niveis?.length || 0}</td>
                    <td style="text-align:center;font-weight:800;color:var(--navy2)">${dr.habilidades?.length || 0}</td>
                    <td style="white-space:nowrap">
                      <button class="btn btn-navy btn-sm btn-acao" onclick="editarDragao(fromDataArg('${dataArg(dr)}'))">✏ Editar</button>
                      <button class="btn btn-gold btn-sm btn-acao" onclick="abrirNiveisDragao(fromStrArg('${strArg(dr.slug)}'),fromStrArg('${strArg(dr.nome)}'))">📊 Atributos</button>
                      <button class="btn btn-navy btn-sm btn-acao" onclick="abrirHabilidadesDragao(fromStrArg('${strArg(dr.slug)}'),fromStrArg('${strArg(dr.nome)}'))">✦ Habilidades</button>
                      <button class="btn btn-red btn-sm btn-acao"   onclick="confirmarRemoverDragao(fromStrArg('${strArg(dr.slug)}'),fromStrArg('${strArg(dr.nome)}'))">🗑 Excluir</button>
                    </td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        `}
      </div>
    </div>
  `;
}

// ── Modal: Novo/Editar Dragão (meta) ──────────────────────────────────────────
function abrirModalNovoDragao() {
  DRAGAO_ED_SLUG = null;
  DRAGAO_OBTENCAO_ATUAL = {};
  document.getElementById('modal-dragao-titulo').textContent = '✦ Novo Dragão';
  ['fdr-slug','fdr-nome','fdr-elemento','fdr-emoji','fdr-emojidragao','fdr-cor','fdr-raridade','fdr-descricao','fdr-imagem','fdr-bonus','fdr-atributo','fdr-obt-resumo','fdr-obt-dia','fdr-obt-fonte','fdr-obt-slug','fdr-obt-min','fdr-obt-max','fdr-en-nome','fdr-en-elemento','fdr-en-raridade','fdr-en-descricao','fdr-en-bonus','fdr-en-atributo'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.value = id === 'fdr-cor' ? '#C8A84A' : id === 'fdr-emojidragao' ? '🐉' : id === 'fdr-emoji' ? '🔥' : '';
  });
  document.getElementById('fdr-obt-tipo').value = 'desconhecido';
  document.getElementById('fdr-slug').disabled = false;
  abrirModal('modal-dragao');
}

function editarDragao(dr) {
  DRAGAO_ED_SLUG = dr.slug;
  DRAGAO_OBTENCAO_ATUAL = dr.obtencao && typeof dr.obtencao === 'object' ? dr.obtencao : {};
  document.getElementById('modal-dragao-titulo').textContent = `✏ Editar: ${dr.nome}`;
  document.getElementById('fdr-slug').value       = dr.slug;
  document.getElementById('fdr-slug').disabled    = true;
  document.getElementById('fdr-nome').value       = dr.nome || '';
  document.getElementById('fdr-elemento').value   = dr.elemento || '';
  document.getElementById('fdr-emoji').value      = dr.emoji || '🔥';
  document.getElementById('fdr-emojidragao').value= dr.emojiDragao || '🐉';
  document.getElementById('fdr-cor').value        = dr.cor || '#C8A84A';
  document.getElementById('fdr-raridade').value   = dr.raridade || '';
  document.getElementById('fdr-descricao').value   = dr.descricao || '';
  document.getElementById('fdr-imagem').value      = dr.imagem || '';
  document.getElementById('fdr-obt-tipo').value    = dr.obtencao?.tipo || 'desconhecido';
  document.getElementById('fdr-obt-resumo').value  = dr.obtencao?.resumo || '';
  document.getElementById('fdr-obt-dia').value     = dr.obtencao?.dia ?? '';
  document.getElementById('fdr-obt-fonte').value   = dr.obtencao?.fonte?.nome || '';
  document.getElementById('fdr-obt-slug').value    = dr.obtencao?.fonte?.slug || '';
  document.getElementById('fdr-obt-min').value     = dr.obtencao?.fonte?.nivelMin ?? '';
  document.getElementById('fdr-obt-max').value     = dr.obtencao?.fonte?.nivelMax ?? '';
  document.getElementById('fdr-bonus').value       = dr.bonusMarcha || '';
  document.getElementById('fdr-atributo').value    = dr.atributo || '';
  document.getElementById('fdr-en-nome').value     = dr.i18n?.['en-US']?.nome || '';
  document.getElementById('fdr-en-elemento').value = dr.i18n?.['en-US']?.elemento || '';
  document.getElementById('fdr-en-raridade').value = dr.i18n?.['en-US']?.raridade || '';
  document.getElementById('fdr-en-descricao').value = dr.i18n?.['en-US']?.descricao || '';
  document.getElementById('fdr-en-bonus').value = dr.i18n?.['en-US']?.bonusMarcha || '';
  document.getElementById('fdr-en-atributo').value = dr.i18n?.['en-US']?.atributo || '';
  abrirModal('modal-dragao');
}

async function salvarDragao() {
  const slug       = document.getElementById('fdr-slug').value.trim();
  const nome       = document.getElementById('fdr-nome').value.trim();
  const elemento   = document.getElementById('fdr-elemento').value.trim();
  const emoji      = document.getElementById('fdr-emoji').value.trim();
  const emojiDragao= document.getElementById('fdr-emojidragao').value.trim();
  const cor        = document.getElementById('fdr-cor').value;
  const raridade   = document.getElementById('fdr-raridade').value.trim();
  const descricao  = document.getElementById('fdr-descricao').value.trim();
  const imagem     = document.getElementById('fdr-imagem').value.trim();
  const fonteNome  = document.getElementById('fdr-obt-fonte').value.trim();
  const fonteSlug  = document.getElementById('fdr-obt-slug').value.trim();
  const obtencao = {
    ...DRAGAO_OBTENCAO_ATUAL,
    tipo: document.getElementById('fdr-obt-tipo').value,
    resumo: document.getElementById('fdr-obt-resumo').value.trim(),
    dia: valNum('fdr-obt-dia'),
    fonte: (fonteNome || fonteSlug) ? { modulo:'campos', nome:fonteNome, slug:fonteSlug, nivelMin:valNum('fdr-obt-min'), nivelMax:valNum('fdr-obt-max') } : null,
  };
  const bonusMarcha= document.getElementById('fdr-bonus').value.trim();
  const atributo   = document.getElementById('fdr-atributo').value.trim();

  if (!nome) return toast('Preencha o nome!', 'warn');
  if (!DRAGAO_ED_SLUG && !slug) return toast('Preencha o slug!', 'warn');

  const body = { nome, elemento, emoji, emojiDragao, imagem, cor, raridade, descricao, bonusMarcha, atributo, obtencao, i18n: { 'en-US': {
    nome: document.getElementById('fdr-en-nome').value.trim(),
    elemento: document.getElementById('fdr-en-elemento').value.trim(),
    raridade: document.getElementById('fdr-en-raridade').value.trim(),
    descricao: document.getElementById('fdr-en-descricao').value.trim(),
    bonusMarcha: document.getElementById('fdr-en-bonus').value.trim(),
    atributo: document.getElementById('fdr-en-atributo').value.trim(),
  } } };
  try {
    let r;
    if (DRAGAO_ED_SLUG) {
      r = await fetch(`${API}/dragoes/${DRAGAO_ED_SLUG}/meta`, {
        method:'PUT', headers:{'Content-Type':'application/json',Authorization:`Bearer ${TOKEN}`},
        body:JSON.stringify(body),
      });
    } else {
      r = await fetch(`${API}/dragoes`, {
        method:'POST', headers:{'Content-Type':'application/json',Authorization:`Bearer ${TOKEN}`},
        body:JSON.stringify({ slug, ...body }),
      });
    }
    const d = await r.json();
    if (!r.ok) return toast(d.erro || 'Erro', 'erro');
    fecharModal('modal-dragao');
    toast(DRAGAO_ED_SLUG ? `"${nome}" atualizado!` : `"${nome}" criado!`, 'ok');
    carregarDragoes();
  } catch(e) { toast('Erro: '+e.message, 'erro'); }
}

// ── Modal: Atributos por Nível ────────────────────────────────────────────────
async function abrirNiveisDragao(slug, nome) {
  DRAGAO_ED_SLUG = slug;
  DRAGAO_NIV_ATUAL = null;
  document.getElementById('modal-dniv-titulo').textContent = `📊 ${nome} — Atributos por Nível`;
  const r  = await fetch(`${API}/dragoes/${slug}`, { headers:{ Authorization:`Bearer ${TOKEN}` } });
  const dr = await r.json();
  renderTabelaAtributos(dr);
  abrirModal('modal-dniv');
}

function renderTabelaAtributos(dr) {
  const niveis = (dr.niveis || []).slice().sort((a,b)=>a.nivel-b.nivel);
  const box = document.getElementById('dniv-conteudo');

  box.innerHTML = `
    <!-- Painel: Comparação próximo nível -->
    <div id="dniv-comparacao" style="display:none;margin-bottom:14px;padding:12px;
      background:var(--bg2);border:1px solid rgba(200,168,74,0.3);border-radius:10px">
    </div>

    <!-- Tabela de níveis -->
    <div style="overflow-x:auto;margin-bottom:12px">
      <table style="width:100%;border-collapse:collapse;font-size:0.75rem">
        <thead>
          <tr style="background:var(--bg2)">
            <th style="padding:6px 8px;text-align:center;font-size:0.6rem;color:var(--muted)">NÍV.</th>
            <th style="padding:6px 8px;text-align:center;font-size:0.6rem;color:var(--muted)">XP</th>
            ${ATTRS_BASE.map(a=>`<th style="padding:6px 8px;text-align:center;font-size:0.6rem;color:var(--muted);white-space:nowrap">${a.label}</th>`).join('')}
            ${ATTRS_ELEMENTAL.map(a=>`<th style="padding:6px 8px;text-align:center;font-size:0.6rem;color:#8B6BAE;white-space:nowrap">${a.label}</th>`).join('')}
            <th style="padding:6px 8px;width:70px"></th>
          </tr>
        </thead>
        <tbody>
          ${niveis.map((nv,i) => {
            const proximo = niveis[i+1];
            return `
              <tr style="border-bottom:1px solid rgba(200,168,74,0.1);cursor:pointer"
                onclick="verComparacao(fromDataArg('${dataArg(nv)}'), ${proximo ? `fromDataArg('${dataArg(proximo)}')` : 'null'})"
                onmouseover="this.style.background='rgba(200,168,74,0.06)'"
                onmouseout="this.style.background='transparent'">
                <td style="padding:5px 6px;text-align:center;font-weight:900;color:var(--gold3)">${nv.nivel}</td>
                <td style="padding:5px 6px;text-align:center;color:var(--muted);font-size:0.7rem">${nv.xpNecessaria ?? '—'}</td>
                ${TODOS_ATTRS.map(a => `<td style="padding:5px 6px;text-align:center;color:var(--dark)">${fmtAttr(nv[a.key])}</td>`).join('')}
                <td style="padding:5px 4px;text-align:center;white-space:nowrap">
                  <button class="btn btn-navy btn-sm" style="padding:2px 6px;font-size:0.68rem"
                    onclick="event.stopPropagation();editarNivelDragao(fromDataArg('${dataArg(nv)}'))">✏</button>
                  <button class="btn btn-red btn-sm" style="padding:2px 6px;font-size:0.68rem"
                    onclick="event.stopPropagation();removerNivelDragao(${nv.nivel})">✕</button>
                </td>
              </tr>
            `;
          }).join('')}
          ${niveis.length === 0 ? `<tr><td colspan="${4 + TODOS_ATTRS.length}" style="padding:20px;text-align:center;color:var(--muted)">Nenhum nível cadastrado. Clique em "+ Adicionar Nível" abaixo.</td></tr>` : ''}
        </tbody>
      </table>
    </div>

    <button onclick="abrirFormNivel(null)"
      style="width:100%;padding:8px;background:rgba(200,168,74,0.1);
             border:1.5px dashed rgba(200,168,74,0.4);border-radius:8px;cursor:pointer;
             font-size:0.78rem;font-weight:800;color:var(--gold3)">
      ＋ Adicionar Nível
    </button>

    <!-- Form inline de adicionar/editar nível -->
    <div id="form-nivel-dragao" style="display:none;margin-top:14px;padding:14px;
      background:var(--bg2);border:1.5px solid rgba(200,168,74,0.35);border-radius:12px">

      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:12px">
        <strong id="form-nivel-titulo" style="font-size:0.82rem;color:var(--dark)">Adicionar Nível</strong>
        <button onclick="fecharFormNivel()" style="background:none;border:none;cursor:pointer;font-size:1rem;color:var(--muted)">✕</button>
      </div>

      <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:10px">
        <div>
          <label style="font-size:0.6rem;font-weight:800;color:var(--muted);letter-spacing:1px;text-transform:uppercase">Nível *</label>
          <input id="fnv-nivel" type="number" min="1" placeholder="Ex: 1"
            style="width:100%;padding:6px 8px;font-size:0.85rem;font-weight:700;background:#F8F4E8;border:1.5px solid var(--gold);border-radius:7px;font-family:inherit">
        </div>
        <div>
          <label style="font-size:0.6rem;font-weight:800;color:var(--muted);letter-spacing:1px;text-transform:uppercase">XP Necessária</label>
          <input id="fnv-xp" type="number" min="0" placeholder="Ex: 4517"
            style="width:100%;padding:6px 8px;font-size:0.85rem;font-weight:700;background:#F8F4E8;border:1.5px solid var(--gold);border-radius:7px;font-family:inherit">
        </div>
      </div>

      <p style="font-size:0.63rem;font-weight:800;color:var(--muted);letter-spacing:1.5px;text-transform:uppercase;margin-bottom:6px">⚔ Atributos Base</p>
      <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:6px;margin-bottom:10px">
        ${ATTRS_BASE.map(a => `
          <div>
            <label style="font-size:0.58rem;font-weight:800;color:var(--muted);letter-spacing:0.8px;display:block;margin-bottom:2px">${a.label.toUpperCase()}</label>
            <input id="fnv-${a.key}" type="number" min="0" value="0"
              style="width:100%;padding:5px 7px;font-size:0.82rem;font-weight:700;background:#F8F4E8;border:1px solid rgba(200,168,74,0.5);border-radius:6px;font-family:inherit">
          </div>
        `).join('')}
      </div>

      <p style="font-size:0.63rem;font-weight:800;color:#8B6BAE;letter-spacing:1.5px;text-transform:uppercase;margin-bottom:6px">✨ Atributos Elementais</p>
      <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:6px;margin-bottom:14px">
        ${ATTRS_ELEMENTAL.map(a => `
          <div>
            <label style="font-size:0.58rem;font-weight:800;color:#8B6BAE;letter-spacing:0.8px;display:block;margin-bottom:2px">${a.label.toUpperCase()}</label>
            <input id="fnv-${a.key}" type="number" min="0" value="0"
              style="width:100%;padding:5px 7px;font-size:0.82rem;font-weight:700;background:#F8F4E8;border:1px solid rgba(139,107,174,0.4);border-radius:6px;font-family:inherit">
          </div>
        `).join('')}
      </div>

      <div style="display:flex;gap:8px;justify-content:flex-end">
        <button class="btn btn-ghost btn-sm" onclick="fecharFormNivel()">Cancelar</button>
        <button class="btn btn-gold" onclick="salvarNivelDragao()">💾 Salvar Nível</button>
      </div>
    </div>
  `;
}

function verComparacao(nv, proximo) {
  const box = document.getElementById('dniv-comparacao');
  if (!proximo) {
    box.style.display = 'none';
    return;
  }
  box.style.display = 'block';
  box.innerHTML = `
    <p style="font-size:0.65rem;font-weight:900;color:var(--muted);letter-spacing:1.5px;text-transform:uppercase;margin-bottom:10px">
      📈 Evolução: Nível ${nv.nivel} → ${proximo.nivel}
    </p>
    <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:6px">
      ${TODOS_ATTRS.map(a => {
        const de   = nv[a.key] ?? 0;
        const para = proximo[a.key] ?? 0;
        const diff = para - de;
        const isElem = ATTRS_ELEMENTAL.some(e=>e.key===a.key);
        const cor = isElem ? '#8B6BAE' : 'var(--navy2)';
        return `
          <div style="background:var(--card);border:1px solid rgba(200,168,74,0.2);border-radius:8px;padding:7px 10px">
            <div style="font-size:0.58rem;font-weight:800;color:${cor};letter-spacing:0.8px;margin-bottom:3px;text-transform:uppercase">${a.label}</div>
            <div style="display:flex;align-items:center;gap:5px;font-size:0.78rem;font-weight:800">
              <span style="color:var(--muted)">${fmtAttr(de)}</span>
              <span style="color:var(--faint)">→</span>
              <span style="color:var(--dark)">${fmtAttr(para)}</span>
              ${diff > 0 ? `<span style="font-size:0.65rem;padding:1px 5px;border-radius:4px;background:rgba(90,138,92,0.15);border:1px solid rgba(90,138,92,0.35);color:var(--green)">+${fmtAttr(diff)}</span>` : ''}
              ${diff < 0 ? `<span style="font-size:0.65rem;padding:1px 5px;border-radius:4px;background:rgba(168,60,44,0.1);border:1px solid rgba(168,60,44,0.3);color:var(--red)">${fmtAttr(diff)}</span>` : ''}
            </div>
          </div>
        `;
      }).join('')}
    </div>
  `;
}

function abrirFormNivel(nv) {
  DRAGAO_NIV_ATUAL = nv;
  document.getElementById('form-nivel-titulo').textContent = nv ? `Editar Nível ${nv.nivel}` : 'Adicionar Nível';
  document.getElementById('fnv-nivel').value = nv?.nivel ?? '';
  document.getElementById('fnv-nivel').disabled = !!nv;
  document.getElementById('fnv-xp').value    = nv?.xpNecessaria ?? '';
  TODOS_ATTRS.forEach(a => {
    document.getElementById(`fnv-${a.key}`).value = nv?.[a.key] ?? 0;
  });
  document.getElementById('form-nivel-dragao').style.display = 'block';
  document.getElementById('form-nivel-dragao').scrollIntoView({ behavior:'smooth', block:'start' });
}

function editarNivelDragao(nv) { abrirFormNivel(nv); }

function fecharFormNivel() {
  document.getElementById('form-nivel-dragao').style.display = 'none';
  DRAGAO_NIV_ATUAL = null;
}

async function salvarNivelDragao() {
  const nivel = parseInt(document.getElementById('fnv-nivel').value);
  if (!nivel || nivel < 1) return toast('Preencha o nível!', 'warn');

  const body = { nivel, xpNecessaria: parseInt(document.getElementById('fnv-xp').value) || null };
  TODOS_ATTRS.forEach(a => { body[a.key] = parseFloat(document.getElementById(`fnv-${a.key}`).value) || 0; });

  try {
    const r = await fetch(`${API}/dragoes/${DRAGAO_ED_SLUG}/nivel`, {
      method:'PUT', headers:{'Content-Type':'application/json',Authorization:`Bearer ${TOKEN}`},
      body:JSON.stringify(body),
    });
    const d = await r.json();
    if (!r.ok) return toast(d.erro||'Erro','erro');
    toast(`Nível ${nivel} salvo!`, 'ok');
    fecharFormNivel();
    renderTabelaAtributos(d);
  } catch(e) { toast('Erro: '+e.message,'erro'); }
}

async function removerNivelDragao(nivel) {
  if (!confirm(`Remover o nível ${nivel} deste dragão?`)) return;
  try {
    const r = await fetch(`${API}/dragoes/${DRAGAO_ED_SLUG}/nivel/${nivel}`, {
      method:'DELETE', headers:{ Authorization:`Bearer ${TOKEN}` },
    });
    const d = await r.json();
    if (!r.ok) return toast(d.erro||'Erro','erro');
    toast(`Nível ${nivel} removido.`, 'ok');
    renderTabelaAtributos(d);
  } catch(e) { toast('Erro: '+e.message,'erro'); }
}


async function abrirHabilidadesDragao(slug, nome) {
  DRAGAO_ED_SLUG = slug;
  DRAGAO_HAB_ATUAL_ID = null;
  document.getElementById('modal-dhab-titulo').textContent = `✦ ${nome} — Habilidades`;
  const r = await fetch(`${API}/dragoes/${slug}`, { headers:{ Authorization:`Bearer ${TOKEN}` } });
  const dr = await r.json();
  if (!r.ok) return toast(dr.erro || 'Erro ao carregar habilidades', 'erro');
  renderHabilidadesDragao(dr);
  abrirModal('modal-dhab');
}

function renderHabilidadesDragao(dr) {
  const lista = document.getElementById('dhab-lista');
  const habilidades = dr.habilidades || [];
  lista.innerHTML = `
    <div style="display:flex;justify-content:flex-end;margin-bottom:8px"><button class="btn btn-gold btn-sm" onclick="abrirFormHabilidade(null)">＋ Adicionar habilidade</button></div>
    ${habilidades.length ? habilidades.map(h => `
      <div style="display:flex;align-items:flex-start;gap:10px;padding:10px 0;border-bottom:1px solid rgba(200,168,74,.2)">
        ${h.imagem ? `<img src="${esc(h.imagem)}" alt="" style="width:44px;height:44px;object-fit:cover;border-radius:6px;border:1px solid rgba(200,168,74,.4)">` : `<div style="width:44px;height:44px;display:grid;place-items:center;border:1px solid rgba(200,168,74,.4);border-radius:6px">✦</div>`}
        <div style="flex:1;min-width:0"><strong>${esc(h.nome)}</strong><div style="font-size:.65rem;color:var(--muted);margin:2px 0 4px">${h.tipo === 'comum' ? 'Habilidade comum' : 'Habilidade de batalha'}</div><div style="font-size:.72rem;line-height:1.4;color:var(--dark)">${esc(h.descricao || 'Descrição ainda não cadastrada.')}</div></div>
        <div style="display:flex;gap:4px"><button class="btn btn-navy btn-sm" onclick="abrirFormHabilidade(fromDataArg('${dataArg(h)}'))">✏</button><button class="btn btn-red btn-sm" onclick="removerHabilidadeDragao(fromStrArg('${strArg(h.id)}'),fromStrArg('${strArg(h.nome)}'))">✕</button></div>
      </div>`).join('') : `<div style="padding:24px;text-align:center;color:var(--muted)">Nenhuma habilidade cadastrada ainda.</div>`}
  `;
}

function abrirFormHabilidade(h) {
  DRAGAO_HAB_ATUAL_ID = h?.id || null;
  document.getElementById('dhab-nome').value = h?.nome || '';
  document.getElementById('dhab-tipo').value = h?.tipo === 'comum' ? 'comum' : 'batalha';
  document.getElementById('dhab-imagem').value = h?.imagem || '';
  document.getElementById('dhab-descricao').value = h?.descricao || '';
  document.getElementById('dhab-form').style.display = 'block';
  document.getElementById('dhab-form').scrollIntoView({ behavior:'smooth', block:'nearest' });
}

function fecharFormHabilidade() {
  DRAGAO_HAB_ATUAL_ID = null;
  document.getElementById('dhab-form').style.display = 'none';
}

async function salvarHabilidadeDragao() {
  const nome = document.getElementById('dhab-nome').value.trim();
  if (!nome) return toast('Informe o nome da habilidade.', 'warn');
  const body = { id:DRAGAO_HAB_ATUAL_ID || '', nome, tipo:document.getElementById('dhab-tipo').value, imagem:document.getElementById('dhab-imagem').value.trim(), descricao:document.getElementById('dhab-descricao').value.trim() };
  const r = await fetch(`${API}/dragoes/${DRAGAO_ED_SLUG}/habilidade`, { method:'PUT', headers:{ 'Content-Type':'application/json', Authorization:`Bearer ${TOKEN}` }, body:JSON.stringify(body) });
  const dr = await r.json();
  if (!r.ok) return toast(dr.erro || 'Erro ao salvar habilidade.', 'erro');
  fecharFormHabilidade();
  renderHabilidadesDragao(dr);
  toast('Habilidade salva.', 'ok');
}

async function removerHabilidadeDragao(id, nome) {
  if (!confirm(`Remover a habilidade "${nome}"?`)) return;
  const r = await fetch(`${API}/dragoes/${DRAGAO_ED_SLUG}/habilidade/${encodeURIComponent(id)}`, { method:'DELETE', headers:{ Authorization:`Bearer ${TOKEN}` } });
  const dr = await r.json();
  if (!r.ok) return toast(dr.erro || 'Erro ao remover habilidade.', 'erro');
  renderHabilidadesDragao(dr);
  toast('Habilidade removida.', 'ok');
}

function confirmarRemoverDragao(slug, nome) {
  document.getElementById('confirm-msg').textContent = `Remover o dragão "${nome}" e todos os seus níveis?`;
  document.getElementById('confirm-ok').onclick = async () => {
    const r = await fetch(`${API}/dragoes/${slug}`, { method:'DELETE', headers:{ Authorization:`Bearer ${TOKEN}` } });
    const d = await r.json();
    fecharModal('confirm-modal');
    if (!r.ok) return toast(d.erro||'Erro','erro');
    toast(d.mensagem, 'ok');
    carregarDragoes();
  };
  abrirModal('confirm-modal');
}
