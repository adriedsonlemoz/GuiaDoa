import { timingSafeEqual } from 'node:crypto';

export function validarSetupKey(esperada, recebida = '') {
  if (!esperada) return true;
  const a = Buffer.from(String(recebida));
  const b = Buffer.from(String(esperada));
  return a.length === b.length && timingSafeEqual(a, b);
}

export function decidirAcessoSetup(totalUsers, setupKey, recebida = '') {
  if (Number(totalUsers) > 0) return { modo: 'admin' };
  if (!validarSetupKey(setupKey, recebida)) return { modo: 'negado' };
  return { modo: 'inicial' };
}
