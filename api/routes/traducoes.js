import express from 'express';
import Traducao from '../models/Traducao.js';
import { autenticar } from '../middleware/auth.js';

const router = express.Router();

// E-mail opcional para aumentar o limite diário gratuito da MyMemory
// (5.000 → 50.000 palavras/dia). Defina MYMEMORY_EMAIL no .env se quiser usar.
const MYMEMORY_EMAIL = process.env.MYMEMORY_EMAIL || '';

// ── Helper: traduz um texto usando a API gratuita da MyMemory ──────────────────
// Limite: ~500 caracteres por requisição (key anônima) e ~5.000 palavras/dia por IP
// (50.000/dia se MYMEMORY_EMAIL estiver configurado). Não precisa de API key.
async function traduzirTexto(texto, de = 'pt', para = 'en') {
  const params = new URLSearchParams({ q: texto, langpair: `${de}|${para}` });
  if (MYMEMORY_EMAIL) params.set('de', MYMEMORY_EMAIL);

  const res = await fetch(`https://api.mymemory.translated.net/get?${params.toString()}`, {
    signal: AbortSignal.timeout(8000),
  });

  if (!res.ok) throw new Error(`MyMemory retornou ${res.status}`);
  const data = await res.json();

  if (data.responseStatus && Number(data.responseStatus) !== 200) {
    throw new Error(`MyMemory: ${data.responseDetails || 'erro desconhecido'}`);
  }

  const traduzido = data.responseData?.translatedText;
  if (!traduzido) throw new Error('MyMemory não retornou translatedText');
  if (/MYMEMORY WARNING/i.test(traduzido)) {
    throw new Error('MyMemory: cota diária gratuita excedida (tente de novo mais tarde, ou configure MYMEMORY_EMAIL no .env para aumentar o limite)');
  }
  return traduzido;
}

// ── GET /api/traducoes?locale=en-US
// Retorna traduções ativas para o frontend consumir
router.get('/', async (req, res) => {
  try {
    const locale = req.query.locale || 'en-US';
    const docs = await Traducao.find({ locale, status: 'ativo' }).lean();
    // Converte array em objeto { chave: traducao }
    const mapa = {};
    docs.forEach(d => { mapa[d.chave] = d.traducao; });
    res.json(mapa);
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
});

// ── GET /api/traducoes/admin?locale=en-US[&prefixo=tropa]
// Retorna traduções filtradas por locale (e opcionalmente por prefixo de chave)
router.get('/admin', autenticar, async (req, res) => {
  try {
    const locale   = req.query.locale   || 'en-US';
    const prefixo  = req.query.prefixo  || null;
    const query    = { locale };
    if (prefixo) query.chave = { $regex: `^${prefixo}\\.` };
    const docs = await Traducao.find(query).sort({ chave: 1 }).lean();
    res.json(docs);
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
});

// ── GET /api/traducoes/admin/stats?locale=en-US
// Retorna contagens agregadas por prefixo (primeiro segmento da chave)
// Usado pelo grid de categorias — evita transferir todos os documentos
router.get('/admin/stats', autenticar, async (req, res) => {
  try {
    const locale = req.query.locale || 'en-US';
    const pipeline = [
      { $match: { locale } },
      { $project: {
          prefix: { $arrayElemAt: [{ $split: ['$chave', '.'] }, 0] },
          ativo:  { $cond: [{ $eq: ['$status', 'ativo'] }, 1, 0] },
          semTrad:{ $cond: [{ $not: ['$traducao'] }, 1, 0] },
        }
      },
      { $group: {
          _id:    '$prefix',
          total:  { $sum: 1 },
          ativo:  { $sum: '$ativo' },
          sem:    { $sum: '$semTrad' },
        }
      },
    ];
    const raw = await Traducao.aggregate(pipeline);
    // Converte para objeto { prefix: {total, ativo, sem} }
    const result = {};
    raw.forEach(r => { result[r._id] = { total: r.total, ativo: r.ativo, sem: r.sem }; });
    res.json(result);
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
});

// ── GET /api/traducoes/locales
// Lista todos os locales que existem no banco
router.get('/locales', async (req, res) => {
  try {
    const locales = await Traducao.distinct('locale');
    res.json(locales);
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
});

// ── POST /api/traducoes/seed
// Insere ou atualiza as chaves PT base no banco (idempotente)
// Chamado pelo admin para sincronizar quando novas chaves forem adicionadas
router.post('/seed', autenticar, async (req, res) => {
  try {
    const { chaves, locale = 'en-US' } = req.body;
    // chaves = [{ chave: 'home.botao.torneios', textoPT: 'Torneios' }, ...]
    if (!Array.isArray(chaves) || !chaves.length) {
      return res.status(400).json({ erro: 'Envie um array "chaves"' });
    }

    let inseridos = 0, existentes = 0;
    for (const { chave, textoPT } of chaves) {
      const existe = await Traducao.findOne({ chave, locale });
      if (!existe) {
        await Traducao.create({ chave, locale, textoPT, status: 'rascunho', fonte: 'manual' });
        inseridos++;
      } else {
        // Atualiza textoPT se o original mudou, mas preserva tradução/status
        if (existe.textoPT !== textoPT) {
          existe.textoPT = textoPT;
          existe.status = 'rascunho'; // regride para revisão quando o original muda
          await existe.save();
        }
        existentes++;
      }
    }
    res.json({ ok: true, inseridos, existentes });
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
});

// ── POST /api/traducoes/auto
// Auto-traduz uma chave específica (ou todas com status rascunho sem tradução)
router.post('/auto', autenticar, async (req, res) => {
  try {
    const { chave, locale = 'en-US' } = req.body;

    let docs;
    if (chave) {
      // Traduz só a chave pedida
      docs = await Traducao.find({ chave, locale });
    } else {
      // Traduz todas que ainda não têm tradução
      docs = await Traducao.find({ locale, traducao: '' });
    }

    if (!docs.length) return res.json({ ok: true, traduzidos: 0 });

    let traduzidos = 0, erros = [];
    for (const doc of docs) {
      try {
        const traduzido = await traduzirTexto(doc.textoPT, 'pt', 'en');
        doc.traducao = traduzido;
        doc.status   = 'rascunho';
        doc.fonte    = 'mymemory';
        await doc.save();
        traduzidos++;
      } catch (e) {
        erros.push({ chave: doc.chave, erro: e.message });
      }
    }

    res.json({ ok: true, traduzidos, erros });
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
});

// ── PATCH /api/traducoes/:id
// Admin edita manualmente a tradução de uma chave
router.patch('/:id', autenticar, async (req, res) => {
  try {
    const { traducao, status } = req.body;
    const doc = await Traducao.findById(req.params.id);
    if (!doc) return res.status(404).json({ erro: 'Não encontrada' });

    if (traducao !== undefined) { doc.traducao = traducao; doc.fonte = 'manual'; }
    if (status   !== undefined)   doc.status   = status;

    await doc.save();
    res.json(doc);
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
});

// ── POST /api/traducoes/ativar-todos
// Ativa todas as traduções revisadas de um locale
router.post('/ativar-todos', autenticar, async (req, res) => {
  try {
    const { locale = 'en-US' } = req.body;
    const result = await Traducao.updateMany(
      { locale, status: 'revisado' },
      { $set: { status: 'ativo', updatedAt: new Date() } }
    );
    res.json({ ok: true, ativados: result.modifiedCount });
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
});

// ── DELETE /api/traducoes/:id  (admin)
router.delete('/:id', autenticar, async (req, res) => {
  try {
    await Traducao.findByIdAndDelete(req.params.id);
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
});

export default router;
