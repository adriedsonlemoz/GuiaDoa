export const MAX_PERGUNTA = 2000;
export const MAX_HISTORICO = 12;
export const MAX_MSG_HISTORICO = 1800;
export const ASSISTANT_LOCALES = ['pt-BR', 'en-US'];

export const normalizarLocaleAssistente = locale => (
  ASSISTANT_LOCALES.includes(locale) ? locale : 'pt-BR'
);

const msg = (locale, pt, en) => locale === 'en-US' ? en : pt;

export function sanitizarHistorico(historico) {
  if (!Array.isArray(historico)) return [];
  return historico
    .filter(m => m && (m.role === 'user' || m.role === 'assistant') && typeof m.content === 'string')
    .slice(-MAX_HISTORICO)
    .map(m => ({
      role: m.role,
      content: m.content.replace(/\u0000/g, '').trim().slice(0, MAX_MSG_HISTORICO),
    }))
    .filter(m => m.content.length > 0);
}

export function validarEntradaAssistente(body) {
  const { pergunta, historico = [] } = body || {};
  const locale = normalizarLocaleAssistente(body?.locale);
  if (!pergunta || typeof pergunta !== 'string' || pergunta.trim().length < 2) {
    return { ok: false, codigo: 'PERGUNTA_INVALIDA', mensagem: msg(locale, 'Pergunta inválida.', 'Invalid question.'), locale };
  }
  if (pergunta.length > MAX_PERGUNTA) {
    return {
      ok: false,
      codigo: 'PERGUNTA_MUITO_LONGA',
      mensagem: msg(locale, `Pergunta muito longa. Limite de ${MAX_PERGUNTA} caracteres.`, `Question is too long. Limit: ${MAX_PERGUNTA} characters.`),
      locale,
    };
  }
  if (!Array.isArray(historico)) {
    return { ok: false, codigo: 'HISTORICO_INVALIDO', mensagem: msg(locale, 'Histórico inválido.', 'Invalid conversation history.'), locale };
  }
  return {
    ok: true,
    pergunta: pergunta.replace(/\u0000/g, '').trim(),
    historico: sanitizarHistorico(historico),
    locale,
  };
}
