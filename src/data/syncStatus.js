export function calcularSyncStatus({ ok = 0, total = 0 } = {}) {
  if (total > 0 && ok === total) return 'ok';
  if (ok > 0) return 'parcial';
  return 'erro';
}

export function descreverSyncStatus(status, online = true) {
  if (status === 'syncing') return { emoji:'🔄', label:'Sincronizando dados', nivel:'info' };
  if (status === 'ok' && online) return { emoji:'🟢', label:'Dados atualizados', nivel:'ok' };
  if (status === 'parcial') return { emoji:'🟡', label:'Atualização parcial', nivel:'aviso' };
  return { emoji:'🔴', label:online ? 'Serviço de dados indisponível' : 'Sem conexão', nivel:'erro' };
}
