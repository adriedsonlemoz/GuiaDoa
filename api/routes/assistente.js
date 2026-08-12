import express from 'express';
import { criarRateLimit } from '../middleware/rateLimit.js';
import { validarEntradaAssistente } from '../utils/assistantValidation.js';
import { buildContext } from '../services/assistente/context.js';
import { detectarAnalise, buildContextoAnalitico } from '../services/assistente/analytics.js';
import { detectarIntencao } from '../services/assistente/intent.js';
import { buildSystemPrompt } from '../services/assistente/prompt.js';
import { consultarGroq } from '../services/assistente/groq.js';

const router = express.Router();

const ASSISTENTE_MAX = Math.max(3, Number(process.env.AI_RATE_LIMIT_MAX) || 20);
const assistenteRateLimit = criarRateLimit({
  janelaMs: 5 * 60 * 1000,
  max: ASSISTENTE_MAX,
  prefixo: 'assistente',
  mensagem: 'Muitas perguntas em pouco tempo. Aguarde alguns minutos e tente novamente.',
});

router.post('/', assistenteRateLimit, async (req, res) => {
  const entrada = validarEntradaAssistente(req.body);
  if (!entrada.ok) {
    return res.status(400).json({ codigo: entrada.codigo, erro: entrada.mensagem });
  }

  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ erro: 'Chave da API não configurada.' });
  }

  const perguntaLimpa = entrada.pergunta;
  const historicoSeguro = entrada.historico;
  const locale = entrada.locale;
  const contexto = await buildContext(locale);
  const intencao = detectarIntencao(perguntaLimpa);
  const analise = detectarAnalise(perguntaLimpa);
  const contextoAnalitico = analise && contexto.tropasDados.length
    ? buildContextoAnalitico(contexto.tropasDados, analise)
    : '';

  const systemPrompt = buildSystemPrompt({
    intencao,
    contextoAnalitico,
    ...contexto,
    locale,
  });

  const mensagens = [
    ...historicoSeguro,
    { role: 'user', content: perguntaLimpa },
  ];

  try {
    const resposta = await consultarGroq({ apiKey, systemPrompt, mensagens });
    return res.json({ resposta, intencao });
  } catch (error) {
    if (error.name === 'AbortError') {
      return res.status(504).json({ erro: 'O assistente demorou demais para responder. Tente novamente.' });
    }
    if (error.code === 'GROQ_HTTP_ERROR') {
      console.error('[assistente] Groq erro:', error.detail || error.message);
      return res.status(502).json({ erro: error.message });
    }
    console.error('[assistente] erro:', error.message);
    return res.status(502).json({ erro: 'Falha na conexão com o assistente.' });
  }
});

export default router;
