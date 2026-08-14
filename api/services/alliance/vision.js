import { SNAPSHOT_TYPES } from '../../utils/allianceTracker.js';

const DEFAULT_MODEL = process.env.GROQ_VISION_MODEL || 'qwen/qwen3.6-27b';
const FALLBACK_MODEL = process.env.GROQ_VISION_FALLBACK_MODEL || 'meta-llama/llama-4-maverick-17b-128e-instruct';

function extractJson(text = '') {
  const clean = String(text).trim().replace(/^```(?:json)?\s*/i, '').replace(/```$/i, '').trim();
  try { return JSON.parse(clean); } catch {}
  const start = clean.indexOf('{');
  const end = clean.lastIndexOf('}');
  if (start >= 0 && end > start) return JSON.parse(clean.slice(start, end + 1));
  const error = new Error('O leitor visual respondeu, mas não devolveu uma tabela válida. Tente novamente.');
  error.code = 'VISION_INVALID_JSON';
  error.status = 502;
  throw error;
}

function uniqueModels(...models) {
  return [...new Set(models.flat().map(v => String(v || '').trim()).filter(Boolean))];
}

export function visionModelCandidates(model = DEFAULT_MODEL) {
  return uniqueModels(model, DEFAULT_MODEL, FALLBACK_MODEL);
}

function parseProviderError(raw = '') {
  let payload = null;
  try { payload = JSON.parse(String(raw || '')); } catch {}
  const provider = payload?.error || payload || {};
  const message = String(provider.message || raw || '').replace(/\s+/g, ' ').trim().slice(0, 500);
  const code = String(provider.code || provider.type || '').trim().slice(0, 100);
  return { message, code };
}

export function friendlyVisionError(status, raw = '', model = '') {
  const provider = parseProviderError(raw);
  let message = 'O serviço visual não conseguiu ler este screenshot.';
  let code = 'VISION_PROVIDER_ERROR';
  let retryable = false;

  if (status === 400 || status === 413) {
    code = status === 413 ? 'VISION_IMAGE_TOO_LARGE' : 'VISION_BAD_REQUEST';
    message = status === 413
      ? 'A imagem ficou grande demais para o leitor visual. Tente enviar uma captura menor.'
      : 'O leitor visual recusou esta imagem. Tente um screenshot original, sem edição ou compressão excessiva.';
  } else if (status === 401) {
    code = 'VISION_INVALID_KEY';
    message = 'A GROQ_API_KEY configurada no Render foi recusada pelo serviço visual.';
  } else if (status === 403 || status === 404) {
    code = 'VISION_MODEL_UNAVAILABLE';
    message = 'O modelo visual não está disponível para esta chave. O GUIA tentou as alternativas configuradas.';
  } else if (status === 429) {
    code = 'VISION_RATE_LIMIT';
    retryable = true;
    message = 'O limite temporário do leitor visual foi atingido. Aguarde alguns instantes e tente novamente.';
  } else if (status >= 500) {
    code = 'VISION_PROVIDER_UNAVAILABLE';
    retryable = true;
    message = 'O leitor visual está indisponível no momento. Tente novamente em alguns instantes.';
  }

  const error = new Error(message);
  error.status = status === 429 ? 429 : (status >= 400 && status < 500 ? status : 502);
  error.code = code;
  error.retryable = retryable;
  error.providerStatus = status;
  error.providerCode = provider.code || null;
  error.providerMessage = provider.message || null;
  error.model = model || null;
  error.detail = raw;
  return error;
}

function shouldTryNextModel(error) {
  return [400, 403, 404, 422, 500, 502, 503].includes(Number(error?.providerStatus || error?.status));
}

const PROMPT = `Você extrai dados de screenshots da tela Aliança > Membros do jogo Dragons of Atlantis em português.

Identifique o tipo pela coluna selecionada:
- "Poder" => snapshotType "power"
- "Última Conexão" => snapshotType "last_connection"
- "Data de Entrada na Aliança" => snapshotType "joined_at"

Regras críticas:
1. Leia SOMENTE as linhas da tabela de membros. Ignore cabeçalho, chat na parte inferior, botões e textos "Conectado".
2. Preserve o nickname exatamente como aparece, incluindo símbolos como ™, ⊙, Ø, ♛, pontos e caracteres Unicode. Não traduza nem corrija nomes.
3. Não invente linhas parcialmente escondidas. Se uma linha estiver cortada e o valor não puder ser confirmado, omita-a e registre um aviso.
4. power deve ser inteiro sem separadores. Ex.: 3,117,901 => 3117901.
5. Datas devem permanecer como texto exatamente no formato YYYY-MM-DD HH:mm:ss visto no jogo.
6. Em Última Conexão, marque online=true quando a palavra Online aparecer na mesma linha.
7. confidence é um número de 0 a 1 estimando a confiança de leitura daquela linha.

Retorne SOMENTE um objeto JSON neste formato:
{"snapshotType":"power|last_connection|joined_at","rows":[{"name":"...","power":123,"lastConnection":"YYYY-MM-DD HH:mm:ss","joinedAt":"YYYY-MM-DD HH:mm:ss","online":false,"confidence":0.98}],"warnings":[]}
Inclua em cada linha apenas os campos relevantes ao tipo detectado.`;

async function requestModel({ apiKey, buffer, mimetype, model, signal }) {
  const base64 = buffer.toString('base64');
  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
    signal,
    body: JSON.stringify({
      model,
      messages: [{
        role: 'user',
        content: [
          { type: 'text', text: PROMPT },
          { type: 'image_url', image_url: { url: `data:${mimetype};base64,${base64}` } },
        ],
      }],
      response_format: { type: 'json_object' },
      temperature: 0.1,
      max_completion_tokens: 4000,
      stream: false,
    }),
  });

  if (!response.ok) {
    const detail = await response.text();
    throw friendlyVisionError(response.status, detail, model);
  }
  return response.json();
}

export async function extractAllianceScreenshot({
  apiKey,
  buffer,
  mimetype = 'image/jpeg',
  model = DEFAULT_MODEL,
  timeoutMs = 60_000,
  onProgress = null,
}) {
  if (!apiKey) {
    const error = new Error('A GROQ_API_KEY não está configurada no Render. O Alliance Tracker precisa dela para ler screenshots.');
    error.status = 503;
    error.code = 'VISION_KEY_MISSING';
    error.retryable = false;
    throw error;
  }

  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), timeoutMs);
  const candidates = visionModelCandidates(model);
  const attempts = [];

  try {
    for (let index = 0; index < candidates.length; index += 1) {
      const currentModel = candidates[index];
      onProgress?.({ stage: 'provider', model: currentModel, attempt: index + 1, attempts: candidates.length });
      try {
        const data = await requestModel({ apiKey, buffer, mimetype, model: currentModel, signal: ctrl.signal });
        const parsed = extractJson(data.choices?.[0]?.message?.content || '');
        const snapshotType = SNAPSHOT_TYPES.includes(parsed.snapshotType) ? parsed.snapshotType : null;
        return {
          snapshotType,
          rows: Array.isArray(parsed.rows) ? parsed.rows : [],
          warnings: Array.isArray(parsed.warnings) ? parsed.warnings.map(String).slice(0, 20) : [],
          model: currentModel,
          attempts,
        };
      } catch (error) {
        if (error.name === 'AbortError') throw error;
        attempts.push({ model: currentModel, status: error.providerStatus || error.status || 502, code: error.code || null });
        onProgress?.({ stage: 'provider_failed', model: currentModel, code: error.code || null, retryable: shouldTryNextModel(error) && index < candidates.length - 1 });
        if (!shouldTryNextModel(error) || index === candidates.length - 1) {
          error.attempts = attempts;
          throw error;
        }
      }
    }
    throw new Error('Nenhum modelo visual disponível.');
  } finally {
    clearTimeout(timer);
  }
}

export function serializeVisionError(error) {
  return {
    erro: error?.message || 'Falha ao analisar screenshots.',
    code: error?.code || 'VISION_ERROR',
    retryable: Boolean(error?.retryable),
    providerStatus: error?.providerStatus || null,
    providerCode: error?.providerCode || null,
    model: error?.model || null,
    attempts: Array.isArray(error?.attempts) ? error.attempts : [],
  };
}
