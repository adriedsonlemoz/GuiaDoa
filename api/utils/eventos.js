const DAY_MS = 86400000;

export function slugifyEvento(texto) {
  return String(texto || '')
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .toLowerCase().trim().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
}

function eventoError(message, { status = 400, campo = '', indice = null, codigo = 'EVENTO_INVALIDO' } = {}) {
  const err = new Error(message);
  err.status = status;
  err.codigo = codigo;
  err.detalhes = { campo, ...(indice == null ? {} : { indice }) };
  return err;
}

export function parseServidorDate(value, { campo = 'data', indice = null, obrigatorio = false } = {}) {
  if (value == null || value === '') {
    if (obrigatorio) throw eventoError(`Informe ${campo}.`, { campo, indice, codigo:'DATA_OBRIGATORIA' });
    return null;
  }
  if (value instanceof Date) {
    if (Number.isNaN(value.getTime())) throw eventoError(`Data inválida em ${campo}.`, { campo, indice, codigo:'DATA_INVALIDA' });
    return new Date(value.getTime());
  }
  const raw = String(value).trim();
  // datetime-local do Admin representa explicitamente o relógio oficial do servidor (UTC), não o fuso do navegador.
  const normalized = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2}(\.\d{1,3})?)?$/.test(raw) ? `${raw}Z` : raw;
  const date = new Date(normalized);
  if (Number.isNaN(date.getTime())) throw eventoError(`Data inválida em ${campo}.`, { campo, indice, codigo:'DATA_INVALIDA' });
  return date;
}

function ensurePeriod(start, end, { prefix = 'evento', indice = null } = {}) {
  if (!start || !end) return;
  if (end.getTime() <= start.getTime()) {
    throw eventoError(`O término deve ser posterior ao início em ${prefix}.`, {
      campo:`${prefix}.fimServidor`, indice, codigo:'PERIODO_INVALIDO',
    });
  }
}

function parseRankingRange(group = {}) {
  let start = Number(group.posicaoInicio || 0) || null;
  let end = Number(group.posicaoFim || 0) || null;
  const text = String(group.classificacao || '').trim();
  if ((!start || !end) && text) {
    const match = text.match(/^(\d+)\s*(?:[-–—]\s*(\d+))?$/);
    if (match) {
      start = Number(match[1]);
      end = Number(match[2] || match[1]);
    }
  }
  if (start && !end) end = start;
  if (end && !start) start = end;
  if (start && end && end < start) [start, end] = [end, start];
  return { start, end };
}

function normalizarRewardItem(item = {}, idx = 0) {
  const nome = String(item.nome || '').trim();
  if (!nome) throw eventoError('Todo item de recompensa precisa de nome.', { campo:'recompensas.itens.nome', indice:idx, codigo:'ITEM_RECOMPENSA_INVALIDO' });
  return {
    id:String(item.id || `item-${idx + 1}`).trim(),
    nome,
    quantidade:Number.isFinite(Number(item.quantidade)) ? Math.max(0, Number(item.quantidade)) : 1,
    observacao:String(item.observacao || '').trim(),
    tipoReferencia:['tropa','item','dragao','edificio','pesquisa'].includes(item.tipoReferencia) ? item.tipoReferencia : '',
    referenciaSlug:String(item.referenciaSlug || '').trim(),
    i18n:item.i18n && typeof item.i18n === 'object' ? item.i18n : {},
  };
}

export function normalizarRecompensa(group = {}, idx = 0) {
  const tipo = ['individual','ranking','evento'].includes(group.tipo) ? group.tipo : 'individual';
  const { start, end } = tipo === 'ranking' ? parseRankingRange(group) : { start:null, end:null };
  const classificacao = tipo === 'ranking'
    ? String(group.classificacao || (start ? (start === end ? `${start}` : `${start}-${end}`) : '')).trim()
    : String(group.classificacao || '').trim();
  return {
    id:String(group.id || `${tipo}-${idx + 1}`).trim(),
    tipo,
    ordem:Number.isFinite(Number(group.ordem)) ? Math.max(0, Number(group.ordem)) : idx,
    requisito:group.requisito == null || group.requisito === '' ? null : Math.max(0, Number(group.requisito) || 0),
    classificacao,
    posicaoInicio:start,
    posicaoFim:end,
    titulo:String(group.titulo || '').trim(),
    itens:(Array.isArray(group.itens) ? group.itens : []).map(normalizarRewardItem),
    i18n:group.i18n && typeof group.i18n === 'object' ? group.i18n : {},
  };
}

export function normalizarRegra(rule, idx = 0) {
  if (typeof rule === 'string') {
    const texto = rule.trim();
    if (!texto) return null;
    return { id:`regra-${idx + 1}`, ordem:idx, texto, i18n:{} };
  }
  const texto = String(rule?.texto || '').trim();
  if (!texto) return null;
  return {
    id:String(rule.id || `regra-${idx + 1}`).trim(),
    ordem:Number.isFinite(Number(rule.ordem)) ? Math.max(0, Number(rule.ordem)) : idx,
    texto,
    i18n:rule.i18n && typeof rule.i18n === 'object' ? rule.i18n : {},
  };
}

function phaseDatesFromRelative(phase, eventStart) {
  const dayStart = Number(phase.diaInicio || 0);
  const dayEnd = Number(phase.diaFim || dayStart || 0);
  if (!eventStart || !dayStart) return { start:null, end:null };
  return {
    start:new Date(eventStart.getTime() + (dayStart - 1) * DAY_MS),
    end:new Date(eventStart.getTime() + dayEnd * DAY_MS),
  };
}

export function normalizarFase(phase = {}, idx = 0, eventStart = null) {
  const codigo = slugifyEvento(phase.codigo || phase.nome || `fase-${idx + 1}`) || `fase-${idx + 1}`;
  const nome = String(phase.nome || `Fase ${idx + 1}`).trim();
  let start = parseServidorDate(phase.inicioServidor, { campo:`fases.${idx}.inicioServidor` });
  let end = parseServidorDate(phase.fimServidor, { campo:`fases.${idx}.fimServidor` });
  let dayStart = Number(phase.diaInicio || 0) || null;
  let dayEnd = Number(phase.diaFim || 0) || dayStart;

  if (start && eventStart) dayStart = Math.floor((start.getTime() - eventStart.getTime()) / DAY_MS) + 1;
  if (end && eventStart) dayEnd = Math.max(dayStart || 1, Math.ceil((end.getTime() - eventStart.getTime()) / DAY_MS));
  if (!start || !end) {
    const derived = phaseDatesFromRelative({ diaInicio:dayStart, diaFim:dayEnd }, eventStart);
    start ||= derived.start;
    end ||= derived.end;
  }
  ensurePeriod(start, end, { prefix:`fase ${idx + 1}` });
  return {
    codigo,
    nome,
    ordem:Number.isFinite(Number(phase.ordem)) ? Math.max(0, Number(phase.ordem)) : idx,
    diaInicio:dayStart,
    diaFim:dayEnd,
    inicioServidor:start,
    fimServidor:end,
    objetivo:String(phase.objetivo || '').trim(),
    descricao:String(phase.descricao || '').trim(),
    observacao:String(phase.observacao || '').trim(),
    torneioId:String(phase.torneioId || '').trim(),
    mecanica:String(phase.mecanica || '').trim(),
    recompensas:(Array.isArray(phase.recompensas) ? phase.recompensas : []).map(normalizarRecompensa),
    i18n:phase.i18n && typeof phase.i18n === 'object' ? phase.i18n : {},
  };
}

export function statusOcorrencia(ocorrencia, agora = new Date()) {
  if (!ocorrencia?.confirmado) return 'nao_confirmado';
  const now = agora instanceof Date ? agora.getTime() : new Date(agora).getTime();
  const inicio = new Date(ocorrencia.inicioServidor).getTime();
  const fim = new Date(ocorrencia.fimServidor).getTime();
  if (!Number.isFinite(inicio) || !Number.isFinite(fim)) return 'nao_confirmado';
  if (now < inicio) return 'proximo';
  if (now >= fim) return 'encerrado';
  return 'ativo';
}

export function statusFase(fase, ocorrencia, agora = new Date()) {
  const now = agora instanceof Date ? agora.getTime() : new Date(agora).getTime();
  const occurrenceStart = new Date(ocorrencia?.inicioServidor).getTime();
  let start = fase?.inicioServidor ? new Date(fase.inicioServidor).getTime() : NaN;
  let end = fase?.fimServidor ? new Date(fase.fimServidor).getTime() : NaN;
  if ((!Number.isFinite(start) || !Number.isFinite(end)) && Number.isFinite(occurrenceStart)) {
    const diaInicio = Number(fase?.diaInicio || 0);
    const diaFim = Number(fase?.diaFim || diaInicio || 0);
    if (diaInicio) start = occurrenceStart + (diaInicio - 1) * DAY_MS;
    if (diaFim) end = occurrenceStart + diaFim * DAY_MS;
  }
  if (!Number.isFinite(start) || !Number.isFinite(end)) return 'nao_confirmado';
  if (now < start) return 'proximo';
  if (now >= end) return 'encerrado';
  return 'ativo';
}

export function faseAtual(evento, ocorrencia, agora = new Date()) {
  if (statusOcorrencia(ocorrencia, agora) !== 'ativo') return null;
  return (evento.fases || []).find(f => statusFase(f, ocorrencia, agora) === 'ativo') || null;
}

function serializarFase(fase, ocorrencia, agora) {
  const occurrenceStart = new Date(ocorrencia?.inicioServidor).getTime();
  let inicio = fase?.inicioServidor ? new Date(fase.inicioServidor) : null;
  let fim = fase?.fimServidor ? new Date(fase.fimServidor) : null;
  if ((!inicio || Number.isNaN(inicio.getTime())) && Number.isFinite(occurrenceStart) && fase?.diaInicio) inicio = new Date(occurrenceStart + (Number(fase.diaInicio) - 1) * DAY_MS);
  if ((!fim || Number.isNaN(fim.getTime())) && Number.isFinite(occurrenceStart) && fase?.diaFim) fim = new Date(occurrenceStart + Number(fase.diaFim) * DAY_MS);
  return { ...fase, inicioServidor:inicio, fimServidor:fim, status:statusFase(fase, ocorrencia, agora) };
}

export function serializarEvento(evento, agora = new Date()) {
  const doc = typeof evento?.toObject === 'function' ? evento.toObject() : evento;
  const ocorrencias = (doc.ocorrencias || []).map(o => ({
    ...o,
    status:statusOcorrencia(o, agora),
    faseAtual:faseAtual(doc, o, agora),
    fases:(doc.fases || []).map(f => serializarFase(f, o, agora)),
  }));
  return { ...doc, ocorrencias };
}

export function normalizarEventoPayload(body = {}) {
  const nome = String(body.nome || '').trim();
  if (!nome) throw eventoError('Nome do evento é obrigatório.', { campo:'nome', codigo:'NOME_OBRIGATORIO' });
  const slug = slugifyEvento(body.slug || nome);
  if (!slug) throw eventoError('Identificador do evento é inválido.', { campo:'slug', codigo:'SLUG_INVALIDO' });

  const ocorrenciasRaw = Array.isArray(body.ocorrencias) ? body.ocorrencias : [];
  let eventStart = parseServidorDate(body.inicioServidor, { campo:'inicioServidor' });
  let eventEnd = parseServidorDate(body.fimServidor, { campo:'fimServidor' });
  if (!eventStart && ocorrenciasRaw[0]?.inicioServidor) eventStart = parseServidorDate(ocorrenciasRaw[0].inicioServidor, { campo:'inicioServidor' });
  if (!eventEnd && ocorrenciasRaw[0]?.fimServidor) eventEnd = parseServidorDate(ocorrenciasRaw[0].fimServidor, { campo:'fimServidor' });
  ensurePeriod(eventStart, eventEnd, { prefix:'evento' });

  const ocorrencias = ocorrenciasRaw.map((o, idx) => {
    const reinoId = Number(o.reinoId || 0);
    if (!Number.isInteger(reinoId) || reinoId < 1) throw eventoError(`Ocorrência ${idx + 1}: selecione um reino válido.`, { campo:'reinoId', indice:idx, codigo:'REINO_INVALIDO' });
    const start = parseServidorDate(o.inicioServidor || eventStart, { campo:'inicioServidor', indice:idx, obrigatorio:true });
    const end = parseServidorDate(o.fimServidor || eventEnd, { campo:'fimServidor', indice:idx, obrigatorio:true });
    ensurePeriod(start, end, { prefix:`ocorrência ${idx + 1}`, indice:idx });
    return {
      codigo:String(o.codigo || `${slug}-${reinoId}`).trim(),
      reinoId,
      reinoNome:String(o.reinoNome || '').trim(),
      fusoReino:String(o.fusoReino || '').trim(),
      inicioServidor:start,
      fimServidor:end,
      confirmado:o.confirmado !== false,
      observacao:String(o.observacao || '').trim(),
    };
  });
  const realmIds = ocorrencias.map(o => o.reinoId);
  if (new Set(realmIds).size !== realmIds.length) throw eventoError('O mesmo reino não pode aparecer duas vezes nas ocorrências do mesmo evento.', { campo:'ocorrencias', codigo:'REINO_DUPLICADO' });

  const fases = (Array.isArray(body.fases) ? body.fases : []).map((phase, idx) => normalizarFase(phase, idx, eventStart));
  const phaseCodes = fases.map(f => f.codigo);
  if (new Set(phaseCodes).size !== phaseCodes.length) throw eventoError('Existem fases com o mesmo código.', { campo:'fases', codigo:'FASE_DUPLICADA' });

  return {
    slug,
    nome,
    resumo:String(body.resumo || '').trim(),
    descricao:String(body.descricao || '').trim(),
    imagem:String(body.imagem || '').trim(),
    categoria:String(body.categoria || 'geral').trim() || 'geral',
    servidorFuso:String(body.servidorFuso || 'UTC').trim() || 'UTC',
    horarioReset:String(body.horarioReset || '00:00').trim() || '00:00',
    inicioServidor:eventStart,
    fimServidor:eventEnd,
    ativo:body.ativo !== false,
    fases,
    recompensas:(Array.isArray(body.recompensas) ? body.recompensas : []).map(normalizarRecompensa),
    regras:(Array.isArray(body.regras) ? body.regras : []).map(normalizarRegra).filter(Boolean),
    ocorrencias,
    historico:Array.isArray(body.historico) ? body.historico : [],
    fonte:body.fonte && typeof body.fonte === 'object' ? body.fonte : {},
    i18n:body.i18n && typeof body.i18n === 'object' ? body.i18n : {},
    atualizadoEm:new Date(),
  };
}


export function alinharOcorrenciasAoPeriodo(ocorrencias = [], inicioServidor, fimServidor) {
  const start = parseServidorDate(inicioServidor, { campo:'inicioServidor', obrigatorio:true });
  const end = parseServidorDate(fimServidor, { campo:'fimServidor', obrigatorio:true });
  ensurePeriod(start, end, { prefix:'evento' });
  return (Array.isArray(ocorrencias) ? ocorrencias : []).map(ocorrencia => ({
    ...ocorrencia,
    inicioServidor:start,
    fimServidor:end,
  }));
}

export function validarOcorrenciasComReinos(payload, reinos = []) {
  const byId = new Map((reinos || []).map(r => [Number(r.id), r]));
  payload.ocorrencias = (payload.ocorrencias || []).map((occ, idx) => {
    const realm = byId.get(Number(occ.reinoId));
    if (!realm) throw eventoError(`Ocorrência ${idx + 1}: o reino #${occ.reinoId} não existe no cadastro.`, { campo:'reinoId', indice:idx, codigo:'REINO_NAO_ENCONTRADO' });
    return { ...occ, reinoNome:String(realm.nome || '').trim(), fusoReino:String(realm.fuso || '').trim() };
  });
  return payload;
}

export function resumoExclusaoEvento(evento = {}) {
  const fases = Array.isArray(evento.fases) ? evento.fases : [];
  const recompensasFases = fases.reduce((sum, fase) => sum + (Array.isArray(fase.recompensas) ? fase.recompensas.length : 0), 0);
  return {
    ocorrencias:(evento.ocorrencias || []).length,
    reinos:new Set((evento.ocorrencias || []).map(o => Number(o.reinoId)).filter(Boolean)).size,
    fases:fases.length,
    recompensas:(evento.recompensas || []).length + recompensasFases,
    historico:(evento.historico || []).length,
  };
}

export const EVENT_DAY_MS = DAY_MS;
