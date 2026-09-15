import test from 'node:test';
import assert from 'node:assert/strict';
import { criarRateLimit } from '../middleware/rateLimit.js';

function criarRes() {
  return {
    headers: {}, statusCode: 200, payload: null,
    setHeader(k, v) { this.headers[k] = v; },
    status(code) { this.statusCode = code; return this; },
    json(body) { this.payload = body; return this; },
  };
}

test('rate limit libera até o máximo e depois responde 429', () => {
  const middleware = criarRateLimit({ janelaMs: 60000, max: 2, prefixo: `test-${Date.now()}` });
  const req = { ip: '127.0.0.1', socket: {} };

  for (let n = 0; n < 2; n += 1) {
    const res = criarRes();
    let chamou = false;
    middleware(req, res, () => { chamou = true; });
    assert.equal(chamou, true);
    assert.equal(res.statusCode, 200);
  }

  const bloqueado = criarRes();
  let chamou = false;
  middleware(req, bloqueado, () => { chamou = true; });
  assert.equal(chamou, false);
  assert.equal(bloqueado.statusCode, 429);
  assert.ok(Number(bloqueado.headers['Retry-After']) >= 1);
});
