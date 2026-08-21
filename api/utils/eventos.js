export function slugifyEvento(texto) {
  return String(texto || '')
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .toLowerCase().trim().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
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

export function faseAtual(evento, ocorrencia, agora = new Date()) {
  if (statusOcorrencia(ocorrencia, agora) !== 'ativo') return null;
  const inicio = new Date(ocorrencia.inicioServidor).getTime();
  const now = agora instanceof Date ? agora.getTime() : new Date(agora).getTime();
  const dia = Math.floor((now - inicio) / 86400000) + 1;
  return (evento.fases || []).find(f => dia >= Number(f.diaInicio) && dia <= Number(f.diaFim)) || null;
}

export function serializarEvento(evento, agora = new Date()) {
  const doc = typeof evento?.toObject === 'function' ? evento.toObject() : evento;
  const ocorrencias = (doc.ocorrencias || []).map(o => ({
    ...o,
    status: statusOcorrencia(o, agora),
    faseAtual: faseAtual(doc, o, agora),
  }));
  return { ...doc, ocorrencias };
}

export function normalizarEventoPayload(body = {}) {
  const nome = String(body.nome || '').trim();
  if (!nome) throw Object.assign(new Error('Nome do evento é obrigatório.'), { status:400 });
  const fases = Array.isArray(body.fases) ? body.fases : [];
  const ocorrencias = Array.isArray(body.ocorrencias) ? body.ocorrencias : [];
  for (const o of ocorrencias) {
    if (!Number(o.reinoId) || !String(o.reinoNome || '').trim()) throw Object.assign(new Error('Cada ocorrência precisa de reino.'), { status:400 });
    const inicio = new Date(o.inicioServidor);
    const fim = new Date(o.fimServidor);
    if (Number.isNaN(inicio.getTime()) || Number.isNaN(fim.getTime()) || fim <= inicio) throw Object.assign(new Error('Período inválido em uma ocorrência.'), { status:400 });
  }
  return {
    slug: slugifyEvento(body.slug || nome),
    nome,
    resumo:String(body.resumo || '').trim(),
    descricao:String(body.descricao || '').trim(),
    categoria:String(body.categoria || 'geral').trim() || 'geral',
    servidorFuso:String(body.servidorFuso || 'UTC').trim() || 'UTC',
    horarioReset:String(body.horarioReset || '00:00').trim() || '00:00',
    ativo:body.ativo !== false,
    fases,
    recompensas:Array.isArray(body.recompensas) ? body.recompensas : [],
    regras:Array.isArray(body.regras) ? body.regras.map(x=>String(x).trim()).filter(Boolean) : [],
    ocorrencias:ocorrencias.map((o, idx) => ({
      codigo:String(o.codigo || `${Number(o.reinoId)}-${idx+1}`).trim(),
      reinoId:Number(o.reinoId),
      reinoNome:String(o.reinoNome || '').trim(),
      fusoReino:String(o.fusoReino || '').trim(),
      inicioServidor:new Date(o.inicioServidor),
      fimServidor:new Date(o.fimServidor),
      confirmado:o.confirmado !== false,
      observacao:String(o.observacao || '').trim(),
    })),
    fonte:body.fonte && typeof body.fonte === 'object' ? body.fonte : {},
    i18n:body.i18n && typeof body.i18n === 'object' ? body.i18n : {},
    atualizadoEm:new Date(),
  };
}
