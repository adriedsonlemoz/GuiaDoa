/**
 * Rate limiter simples em memória, sem dependências externas.
 * Adequado para uma instância única (Render/Termux). Em múltiplas instâncias,
 * use um store compartilhado (ex.: Redis) para limites globais.
 */
const buckets = new Map();

const getClientIp = (req) => req.ip || req.socket?.remoteAddress || 'unknown';

export function criarRateLimit({
  janelaMs,
  max,
  prefixo = 'global',
  chave,
  mensagem = 'Muitas tentativas. Tente novamente mais tarde.',
}) {
  if (!Number.isFinite(janelaMs) || janelaMs <= 0) throw new Error('janelaMs inválida');
  if (!Number.isFinite(max) || max <= 0) throw new Error('max inválido');

  return (req, res, next) => {
    const now = Date.now();
    const identity = chave ? chave(req) : getClientIp(req);
    const key = `${prefixo}:${identity}`;
    let bucket = buckets.get(key);

    if (!bucket || now >= bucket.resetAt) {
      bucket = { count: 0, resetAt: now + janelaMs };
      buckets.set(key, bucket);
    }

    bucket.count += 1;
    const remaining = Math.max(0, max - bucket.count);
    const retryAfter = Math.max(1, Math.ceil((bucket.resetAt - now) / 1000));

    res.setHeader('RateLimit-Limit', String(max));
    res.setHeader('RateLimit-Remaining', String(remaining));
    res.setHeader('RateLimit-Reset', String(Math.ceil(bucket.resetAt / 1000)));

    if (bucket.count > max) {
      res.setHeader('Retry-After', String(retryAfter));
      return res.status(429).json({ erro: mensagem, tentarNovamenteEm: retryAfter });
    }

    next();
  };
}

// Evita crescimento indefinido do Map em processos longos.
const cleanup = setInterval(() => {
  const now = Date.now();
  for (const [key, bucket] of buckets.entries()) {
    if (now >= bucket.resetAt) buckets.delete(key);
  }
}, 10 * 60 * 1000);
cleanup.unref?.();
