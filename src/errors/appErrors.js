const NETWORK_NAMES = new Set(['AbortError', 'TimeoutError']);

export function normalizeError(error) {
  if (error instanceof Error) return error;
  if (typeof error === 'string') return new Error(error);
  try { return new Error(JSON.stringify(error)); }
  catch { return new Error('Erro desconhecido'); }
}

export function classifyConnectionError(error, fallbackCode = 'GD-DATA-001') {
  const err = normalizeError(error);
  const msg = String(err.message || '').toLowerCase();
  if (NETWORK_NAMES.has(err.name) || msg.includes('timeout') || msg.includes('timed out')) {
    return { code: 'GD-NET-002', title: 'A conexão demorou mais que o esperado', message: 'Verifique sua internet e tente novamente.' };
  }
  if (msg.includes('failed to fetch') || msg.includes('network') || msg.includes('fetch')) {
    return { code: 'GD-NET-001', title: 'Não foi possível conectar', message: 'Verifique sua internet e tente novamente em instantes.' };
  }
  if (/http\s+5\d\d/.test(msg)) {
    return { code: 'GD-SRV-001', title: 'Serviço temporariamente indisponível', message: 'Não foi possível carregar os dados agora. Tente novamente em instantes.' };
  }
  return { code: fallbackCode, title: 'Não foi possível carregar os dados', message: 'Ocorreu uma falha inesperada. Tente novamente.' };
}

export function buildDiagnostic({ code, error, componentStack = '', context = '', extra = {} } = {}) {
  const err = normalizeError(error || 'Sem detalhes adicionais');
  const lines = [
    `GUIA DOA — diagnóstico`,
    `Código: ${code || 'GD-UNK-001'}`,
    `Data: ${new Date().toISOString()}`,
    `Tela: ${context || (typeof window !== 'undefined' ? (window.location?.hash || window.location?.pathname) : '') || 'desconhecida'}`,
    `Mensagem: ${err.message || 'indisponível'}`,
  ];
  if (err.name) lines.push(`Tipo: ${err.name}`);
  if (componentStack) lines.push(`Componente:${componentStack}`);
  if (err.stack) lines.push(`Stack:${err.stack}`);
  for (const [key, value] of Object.entries(extra || {})) {
    if (value !== undefined && value !== null && value !== '') lines.push(`${key}: ${String(value)}`);
  }
  if (typeof navigator !== 'undefined' && navigator.userAgent) lines.push(`Dispositivo: ${navigator.userAgent}`);
  return lines.join('\n');
}

export async function copyDiagnostic(text) {
  if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text);
    return;
  }
  const el = document.createElement('textarea');
  el.value = text;
  el.style.position = 'fixed';
  el.style.opacity = '0';
  document.body.appendChild(el);
  el.select();
  document.execCommand('copy');
  document.body.removeChild(el);
}
