import { randomUUID } from 'node:crypto';

const DEFAULT_CODES = {
  400: 'REQUISICAO_INVALIDA',
  401: 'NAO_AUTORIZADO',
  403: 'ACESSO_NEGADO',
  404: 'NAO_ENCONTRADO',
  409: 'CONFLITO',
  413: 'ARQUIVO_MUITO_GRANDE',
  429: 'LIMITE_REQUISICOES',
  500: 'ERRO_INTERNO',
  502: 'SERVICO_EXTERNO_INDISPONIVEL',
  503: 'SERVICO_INDISPONIVEL',
};

export function codigoPorStatus(status = 500) {
  return DEFAULT_CODES[status] || `HTTP_${status}`;
}

export function formatarErroApi(body = {}, status = 500, requestId = null) {
  const mensagem = body?.mensagem || body?.erro || 'Erro interno do servidor';
  const payload = {
    sucesso: false,
    codigo: body?.codigo || codigoPorStatus(status),
    mensagem,
    // Compatibilidade com o painel/frontends antigos durante a migração.
    erro: mensagem,
  };

  if (body?.detalhes !== undefined) payload.detalhes = body.detalhes;
  const retryAfter = body?.retryAfter ?? body?.tentarNovamenteEm;
  if (retryAfter !== undefined) payload.retryAfter = retryAfter;
  if (requestId) payload.requestId = requestId;
  return payload;
}

export function requestContext(req, res, next) {
  const recebido = req.get?.('x-request-id');
  req.requestId = typeof recebido === 'string' && recebido.trim()
    ? recebido.trim().slice(0, 120)
    : randomUUID();
  res.setHeader('X-Request-Id', req.requestId);
  next();
}

export function padronizarRespostasDeErro(req, res, next) {
  const originalJson = res.json.bind(res);
  res.json = (body) => {
    if (!res.locals?.skipErrorEnvelope && res.statusCode >= 400 && body && typeof body === 'object' && !Array.isArray(body)) {
      return originalJson(formatarErroApi(body, res.statusCode, req.requestId));
    }
    return originalJson(body);
  };
  next();
}

export function erroGlobal(err, req, res, _next) {
  const isMulterLimit = err?.code === 'LIMIT_FILE_SIZE';
  const status = isMulterLimit ? 413 : (Number(err?.status || err?.statusCode) || 500);
  const mensagem = isMulterLimit
    ? 'A imagem ultrapassa o limite máximo permitido.'
    : (status >= 500 ? 'Erro interno do servidor' : (err?.message || 'Falha na requisição'));

  if (status >= 500) {
    console.error(`[erro] ${req?.requestId || '-'} ${req?.method || ''} ${req?.originalUrl || ''}:`, err?.message || err);
  }

  res.status(status).json({
    codigo: isMulterLimit ? 'ARQUIVO_MUITO_GRANDE' : codigoPorStatus(status),
    mensagem,
  });
}
