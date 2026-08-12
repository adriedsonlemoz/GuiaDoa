export function calcularSyncStatus({ ok = 0, total = 0, usouEstatico = false, usouCache = false } = {}) {
  if (total > 0 && ok === total) return 'ok';
  if (ok > 0) return 'parcial';
  if (usouEstatico) return 'estatico';
  if (usouCache) return 'cache';
  return 'erro';
}

export function descreverSyncStatus(status, online = true) {
  if (status === 'syncing') return { emoji: '🔄', label: 'Sincronizando', nivel: 'info' };
  if (status === 'ok' && online) return { emoji: '🟢', label: 'Online e atualizado', nivel: 'ok' };
  if (status === 'parcial') return { emoji: '🟡', label: 'Atualização parcial', nivel: 'aviso' };
  if (status === 'cache') return { emoji: '🟡', label: 'Usando cache', nivel: 'aviso' };
  if (status === 'estatico') return { emoji: '🟡', label: 'Dados locais parciais', nivel: 'aviso' };
  return { emoji: '🔴', label: online ? 'API indisponível' : 'Sem conexão', nivel: 'erro' };
}
