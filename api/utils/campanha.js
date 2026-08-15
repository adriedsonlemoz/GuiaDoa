import { CAMPANHA_CATEGORIAS, CAMPO_SUBTIPOS } from '../seeds/campanha.js';

const RESOURCE_TYPES = new Set(['food','wood','stone','metals','gold','pearls','seeds','geodes','sulfur','ice_crystal','venom_crystal','dark_crystal','other']);
const FIELD_SUBTYPES = new Set(CAMPO_SUBTIPOS);

export function slugifyCampanha(value) {
  return String(value || '')
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .toLowerCase().trim().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '').replace(/-+/g, '-');
}

const cleanString = (v, max = 200) => String(v ?? '').trim().slice(0, max);
const cleanLines = (v, maxItems = 30, maxLen = 300) => (Array.isArray(v) ? v : [])
  .map(x => cleanString(x, maxLen)).filter(Boolean).slice(0, maxItems);

function normalizarRecompensas(input) {
  const codigos = new Set();
  return (Array.isArray(input) ? input : []).slice(0, 40).map((item, index) => {
    const nome = cleanString(item?.nome, 140);
    const simbolo = cleanString(item?.simbolo, 16) || `R${index + 1}`;
    const codigo = slugifyCampanha(cleanString(item?.codigo, 100) || nome || `recompensa-${index + 1}`);
    const quantidade = item?.quantidade === '' || item?.quantidade == null ? null : Number(item.quantidade);
    if (!codigo || codigos.has(codigo)) throw Object.assign(new Error(`Recompensa inválida ou duplicada na linha ${index + 1}.`), { status:400 });
    if (quantidade != null && (!Number.isSafeInteger(quantidade) || quantidade < 0)) {
      throw Object.assign(new Error(`Quantidade de recompensa inválida na linha ${index + 1}.`), { status:400 });
    }
    codigos.add(codigo);
    return {
      codigo,
      simbolo,
      nome,
      imagem:cleanString(item?.imagem, 500),
      quantidade,
      nomeConfirmado:Boolean(item?.nomeConfirmado && nome),
      observacao:cleanString(item?.observacao, 400),
      i18n:item?.i18n && typeof item.i18n === 'object' ? item.i18n : {},
    };
  });
}


function normalizarGuiasAtaque(input) {
  const codigos = new Set();
  return (Array.isArray(input) ? input : []).slice(0, 30).map((item, index) => {
    const titulo = cleanString(item?.titulo, 160);
    const codigo = slugifyCampanha(cleanString(item?.codigo, 100) || titulo || `guia-${index + 1}`);
    const quantidade = item?.quantidade === '' || item?.quantidade == null ? null : Number(item.quantidade);
    if (!codigo || codigos.has(codigo) || !titulo) {
      throw Object.assign(new Error(`Guia de ataque inválido ou duplicado na linha ${index + 1}.`), { status:400 });
    }
    if (quantidade != null && (!Number.isSafeInteger(quantidade) || quantidade < 0)) {
      throw Object.assign(new Error(`Quantidade principal inválida no guia ${index + 1}.`), { status:400 });
    }
    const apoios = (Array.isArray(item?.apoios) ? item.apoios : []).slice(0, 12).map((apoio, apoioIndex) => {
      const nome = cleanString(apoio?.nome, 100);
      const qtd = Number(apoio?.quantidade);
      if (!nome || !Number.isSafeInteger(qtd) || qtd < 0) {
        throw Object.assign(new Error(`Apoio inválido no guia ${index + 1}, linha ${apoioIndex + 1}.`), { status:400 });
      }
      return {
        nome,
        quantidade:qtd,
        alternativa:cleanString(apoio?.alternativa, 60),
        i18n:apoio?.i18n && typeof apoio.i18n === 'object' ? apoio.i18n : {},
      };
    });
    const pesquisas = (Array.isArray(item?.pesquisas) ? item.pesquisas : []).slice(0, 12).map((pesquisa, pesquisaIndex) => {
      const nome = cleanString(pesquisa?.nome, 100);
      const nivel = Number(pesquisa?.nivel);
      if (!nome || !Number.isSafeInteger(nivel) || nivel < 0 || nivel > 99) {
        throw Object.assign(new Error(`Pesquisa inválida no guia ${index + 1}, linha ${pesquisaIndex + 1}.`), { status:400 });
      }
      return { nome, nivel, i18n:pesquisa?.i18n && typeof pesquisa.i18n === 'object' ? pesquisa.i18n : {} };
    });
    codigos.add(codigo);
    return {
      codigo,
      titulo,
      resumo:cleanString(item?.resumo, 1200),
      status:item?.status === 'confirmado' ? 'confirmado' : 'validacao',
      resultado:['sem_perdas','possiveis_perdas','incompleto'].includes(item?.resultado) ? item.resultado : '',
      tropaPrincipal:cleanString(item?.tropaPrincipal, 100),
      quantidade,
      complemento:cleanString(item?.complemento, 180),
      apoios,
      pesquisas,
      passos:cleanLines(item?.passos, 30, 400),
      observacoes:cleanString(item?.observacoes, 1600),
      fonte:item?.fonte && typeof item.fonte === 'object' ? {
        tipo:cleanString(item.fonte.tipo, 40) || 'manual',
        url:cleanString(item.fonte.url, 500),
        descricao:cleanString(item.fonte.descricao, 300),
      } : { tipo:'manual', url:'', descricao:'' },
      i18n:item?.i18n && typeof item.i18n === 'object' ? item.i18n : {},
    };
  });
}

export function normalizarCampanhaPayload(body = {}, { parcial = false } = {}) {
  const categoria = cleanString(body.categoria, 32).toLowerCase();
  if (!CAMPANHA_CATEGORIAS.includes(categoria)) throw Object.assign(new Error('Categoria inválida.'), { status:400 });

  const nivelRaw = body.nivel === '' || body.nivel == null ? null : Number(body.nivel);
  if (nivelRaw != null && (!Number.isInteger(nivelRaw) || nivelRaw < 0 || nivelRaw > 999)) {
    throw Object.assign(new Error('Nível inválido.'), { status:400 });
  }

  const nome = cleanString(body.nome, 120);
  if (!parcial && !nome) throw Object.assign(new Error('Nome é obrigatório.'), { status:400 });

  const tropas = (Array.isArray(body.tropas) ? body.tropas : []).slice(0, 120).map((item, index) => {
    const tropaNome = cleanString(item?.nome, 100);
    const quantidade = Number(item?.quantidade);
    if (!tropaNome || !Number.isSafeInteger(quantidade) || quantidade < 0) {
      throw Object.assign(new Error(`Tropa inválida na linha ${index + 1}.`), { status:400 });
    }
    return { nome:tropaNome, quantidade, i18n: item?.i18n && typeof item.i18n === 'object' ? item.i18n : {} };
  });

  const recursos = (Array.isArray(body.recursos) ? body.recursos : []).slice(0, 30).map((item, index) => {
    const tipo = cleanString(item?.tipo, 40).toLowerCase();
    const exibicao = cleanString(item?.exibicao, 40);
    const valor = item?.valor === '' || item?.valor == null ? null : Number(item.valor);
    if (!RESOURCE_TYPES.has(tipo) || !exibicao || (valor != null && (!Number.isSafeInteger(valor) || valor < 0))) {
      throw Object.assign(new Error(`Recurso inválido na linha ${index + 1}.`), { status:400 });
    }
    return { tipo, exibicao, valor, exato:item?.exato !== false };
  });

  const estrategiaRaw = body.estrategia && typeof body.estrategia === 'object' ? body.estrategia : {};
  const estrategia = {
    publicada:Boolean(estrategiaRaw.publicada),
    titulo:cleanString(estrategiaRaw.titulo, 160),
    resumo:cleanString(estrategiaRaw.resumo, 1200),
    passos:cleanLines(estrategiaRaw.passos, 30, 400),
    requisitos:cleanLines(estrategiaRaw.requisitos, 30, 300),
    observacoes:cleanString(estrategiaRaw.observacoes, 1500),
    i18n: estrategiaRaw.i18n && typeof estrategiaRaw.i18n === 'object' ? estrategiaRaw.i18n : {},
  };
  if (estrategia.publicada && !estrategia.resumo && !estrategia.passos.length) {
    throw Object.assign(new Error('Uma estratégia publicada precisa de resumo ou passos.'), { status:400 });
  }

  const subtipoTexto = cleanString(body.subtipo, 80);
  const subtipo = categoria === 'campos' ? slugifyCampanha(subtipoTexto) : subtipoTexto;
  if (categoria === 'campos' && !FIELD_SUBTYPES.has(subtipo)) {
    throw Object.assign(new Error('Campos exigem um subtipo válido: savana, montanha, morro, lago ou floresta.'), { status:400 });
  }

  const campoRaw = body.campo && typeof body.campo === 'object' ? body.campo : {};
  const recursoPrincipal = cleanString(campoRaw.recursoPrincipal, 40).toLowerCase();
  const producaoHora = campoRaw.producaoHora === '' || campoRaw.producaoHora == null ? null : Number(campoRaw.producaoHora);
  if (recursoPrincipal && !RESOURCE_TYPES.has(recursoPrincipal)) {
    throw Object.assign(new Error('Recurso principal do campo inválido.'), { status:400 });
  }
  if (producaoHora != null && (!Number.isSafeInteger(producaoHora) || producaoHora < 0)) {
    throw Object.assign(new Error('Produção por hora inválida.'), { status:400 });
  }
  const campo = {
    recursoPrincipal,
    producaoHora,
    producaoExibicao:cleanString(campoRaw.producaoExibicao, 50),
  };

  const recompensas = normalizarRecompensas(body.recompensas);
  const guiasAtaque = normalizarGuiasAtaque(body.guiasAtaque);

  const slugBase = cleanString(body.slug, 120)
    || (subtipo && nivelRaw != null ? `${categoria}-${subtipo}-${nivelRaw}` : `${categoria}-${nivelRaw ?? nome}`);
  const slug = slugifyCampanha(slugBase);
  if (!slug) throw Object.assign(new Error('Não foi possível gerar o identificador do local.'), { status:400 });

  return {
    slug, categoria, subtipo, nivel:nivelRaw, nome,
    ordem:Number.isFinite(Number(body.ordem)) ? Number(body.ordem) : (nivelRaw ?? 0),
    ativo:body.ativo !== false,
    tropas, recursos, recompensas, campo,
    estrategia, guiasAtaque,
    i18n:body.i18n && typeof body.i18n === 'object' ? body.i18n : {},
    fonte:body.fonte && typeof body.fonte === 'object' ? {
      tipo:cleanString(body.fonte.tipo, 30) || 'manual',
      data:cleanString(body.fonte.data, 20),
      descricao:cleanString(body.fonte.descricao, 240),
      verificado:Boolean(body.fonte.verificado),
    } : { tipo:'manual', data:'', descricao:'', verificado:false },
    atualizadoEm:new Date(),
  };
}

export function resumoCategorias(locais = []) {
  const base = Object.fromEntries(CAMPANHA_CATEGORIAS.map(k => [k, 0]));
  for (const item of locais) if (item?.categoria in base) base[item.categoria] += 1;
  return base;
}

export { RESOURCE_TYPES };
