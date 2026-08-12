export function calcularSyncStatus({ ok = 0, total = 0 } = {}) {
  if (total > 0 && ok === total) return 'ok';
  if (ok > 0) return 'parcial';
  return 'erro';
}

export function descreverSyncStatus(status, online = true) {
  if (status === 'syncing') return { emoji:'🔄', label:'Atualizando do MongoDB', nivel:'info' };
  if (status === 'ok' && online) return { emoji:'🟢', label:'MongoDB conectado', nivel:'ok' };
  if (status === 'parcial') return { emoji:'🟡', label:'Dados incompletos', nivel:'aviso' };
  return { emoji:'🔴', label:online ? 'API/MongoDB indisponível' : 'Sem conexão', nivel:'erro' };
}
