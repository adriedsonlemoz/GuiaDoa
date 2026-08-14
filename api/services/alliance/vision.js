import { SNAPSHOT_TYPES } from '../../utils/allianceTracker.js';

const DEFAULT_MODEL = process.env.GROQ_VISION_MODEL || 'qwen/qwen3.6-27b';

function extractJson(text = '') {
  const clean = String(text).trim().replace(/^```(?:json)?\s*/i, '').replace(/```$/i, '').trim();
  try { return JSON.parse(clean); } catch {}
  const start = clean.indexOf('{');
  const end = clean.lastIndexOf('}');
  if (start >= 0 && end > start) return JSON.parse(clean.slice(start, end + 1));
  throw new Error('A leitura visual não retornou JSON válido.');
}

export async function extractAllianceScreenshot({ apiKey, buffer, mimetype = 'image/jpeg', model = DEFAULT_MODEL, timeoutMs = 45_000 }) {
  if (!apiKey) {
    const error = new Error('GROQ_API_KEY não configurada. O importador visual precisa da mesma chave usada pelo Assistente Tático.');
    error.status = 503;
    throw error;
  }
  const base64 = buffer.toString('base64');
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), timeoutMs);
  const prompt = `Você extrai dados de screenshots da tela Aliança > Membros do jogo Dragons of Atlantis em português.

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

  try {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
      signal: ctrl.signal,
      body: JSON.stringify({
        model,
        messages: [{
          role: 'user',
          content: [
            { type: 'text', text: prompt },
            { type: 'image_url', image_url: { url: `data:${mimetype};base64,${base64}` } },
          ],
        }],
        response_format: { type: 'json_object' },
        reasoning_effort: 'none',
        temperature: 0.1,
        max_completion_tokens: 4000,
        stream: false,
      }),
    });
    if (!response.ok) {
      const detail = await response.text();
      const error = new Error('Falha ao ler o screenshot com o serviço visual.');
      error.status = response.status === 429 ? 429 : 502;
      error.detail = detail;
      throw error;
    }
    const data = await response.json();
    const parsed = extractJson(data.choices?.[0]?.message?.content || '');
    const snapshotType = SNAPSHOT_TYPES.includes(parsed.snapshotType) ? parsed.snapshotType : null;
    return {
      snapshotType,
      rows: Array.isArray(parsed.rows) ? parsed.rows : [],
      warnings: Array.isArray(parsed.warnings) ? parsed.warnings.map(String).slice(0, 20) : [],
      model,
    };
  } finally {
    clearTimeout(timer);
  }
}
