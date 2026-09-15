export const ITEM_GROUPS = ['recursos','aceleracoes','geral','arcas'];

export function slugifyItem(value) {
  return String(value || '')
    .normalize('NFD').replace(/[\u0300-\u036f]/g,'')
    .toLowerCase().trim().replace(/[^a-z0-9]+/g,'-').replace(/^-+|-+$/g,'').slice(0,120);
}

export function inferItemGroup(item = {}) {
  if (ITEM_GROUPS.includes(item.grupo) && item.grupo !== 'geral') return item.grupo;
  const text = `${item.nome || ''} ${item.categoria || ''}`.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
  if (/\b(arca|bau|chest|caixas? de nanos|latas? de nanos|bolsa|pasta de finalizacao)\b/.test(text)) return 'arcas';
  if (/aceleracao|speedup|marcha forcada|recuperacao forcada/.test(text)) return 'aceleracoes';
  if (/\d/.test(text) && /(recursos?|madeira|comida|pedra|metais?|ouro)/.test(text)) return 'recursos';
  return ITEM_GROUPS.includes(item.grupo) ? item.grupo : 'geral';
}

function nullableNumber(value) {
  if (value === null || value === undefined || value === '') return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

export function normalizeCatalogItem(item, content = (_item, field) => _item?.[field]) {
  const preco = item?.preco && typeof item.preco === 'object' ? item.preco : {};
  const efeito = item?.efeito && typeof item.efeito === 'object' ? item.efeito : {};
  return {
    ...item,
    slug:item?.slug || slugifyItem(item?.nome),
    nome:content(item,'nome') || item?.nome || 'Item',
    descricao:content(item,'descricao') || item?.descricao || '',
    categoria:content(item,'categoria') || item?.categoria || 'Geral',
    grupo:inferItemGroup(item),
    raridade:content(item,'raridade') || item?.raridade || '',
    origem:content(item,'origem') || item?.origem || content(item,'onde') || item?.onde || '',
    uso:content(item,'uso') || item?.uso || '',
    limites:content(item,'limites') || item?.limites || '',
    conteudoObservacao:content(item,'conteudoObservacao') || item?.conteudoObservacao || '',
    quantidade:nullableNumber(item?.quantidade),
    preco:{
      moeda:'rubis',
      valor:nullableNumber(preco.valor),
      valorOriginal:nullableNumber(preco.valorOriginal),
    },
    efeito:{
      tipo:efeito.tipo || '',
      valor:nullableNumber(efeito.valor),
      unidade:efeito.unidade || '',
    },
    conteudo:Array.isArray(item?.conteudo) ? item.conteudo.filter(row => row?.itemSlug) : [],
    tags:Array.isArray(item?.tags) ? item.tags : [],
    destaque:Boolean(item?.destaque),
  };
}

export function buildItemMap(catalog = []) {
  return new Map(catalog.map(item => [item.slug || slugifyItem(item.nome), item]));
}

export function buildContainerMap(catalog = []) {
  const map = new Map();
  catalog.forEach(container => {
    (container.conteudo || []).forEach(row => {
      const slug = row.itemSlug;
      if (!slug) return;
      if (!map.has(slug)) map.set(slug, []);
      map.get(slug).push(container);
    });
  });
  return map;
}
