/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║  GUIA DOA — Setup Web Routes                                ║
 * ║  Montado em /api/setup                                      ║
 * ╚══════════════════════════════════════════════════════════════╝
 */
import { Router } from 'express';
import bcrypt      from 'bcryptjs';
import User        from '../models/User.js';
import Tropa       from '../models/Tropa.js';
import Nivel       from '../models/Nivel.js';
import Dragao      from '../models/Dragao.js';
import Edificio    from '../models/Edificio.js';
import Item        from '../models/Item.js';
import Pesquisa    from '../models/Pesquisa.js';
import Reino       from '../models/Reino.js';
import Traducao    from '../models/Traducao.js';
import CategoriaDica from '../models/CategoriaDica.js';
import Dica        from '../models/Dica.js';
import { autenticar, exigirAdmin } from '../middleware/auth.js';
import { decidirAcessoSetup } from '../security/setupAccess.js';
import { obterBootstrapStatus } from '../services/bootstrapStatus.js';
import AppConfig from '../models/AppConfig.js';

const router = Router();
const SETUP_KEY_OBRIGATORIA = String(process.env.REQUIRE_SETUP_KEY || '').toLowerCase() === 'true' && Boolean(process.env.SETUP_KEY);

const autenticarAdmin = (req, res, next) => autenticar(req, res, () => exigirAdmin(req, res, next));

// Sem usuários: permite somente o bootstrap inicial. Depois disso, setup exige admin.
const setupInicialOuAdmin = async (req, res, next) => {
  try {
    const totalUsers = await User.countDocuments();
    const acesso = decidirAcessoSetup(
      totalUsers,
      SETUP_KEY_OBRIGATORIA ? process.env.SETUP_KEY : '',
      req.get('x-setup-key') || ''
    );

    if (acesso.modo === 'negado') {
      return res.status(401).json({
        codigo: 'SETUP_KEY_INVALIDA',
        erro: 'Chave de setup inválida ou não fornecida.',
      });
    }
    if (acesso.modo === 'inicial') {
      req.setupInicial = true;
      return next();
    }
    return autenticarAdmin(req, res, next);
  } catch (err) {
    return res.status(500).json({ codigo: 'SETUP_STATUS_FALHOU', erro: 'Não foi possível validar o estado do setup.' });
  }
};

// ── GET /api/setup/bootstrap-status — diagnóstico público mínimo do primeiro acesso
// Expõe apenas contagens/flags necessárias para o Admin decidir entre login e bootstrap.
router.get('/bootstrap-status', async (_req, res) => {
  try {
    const status = await obterBootstrapStatus({
      User, Tropa, Nivel, Dragao, Edificio, Item, Pesquisa, Reino, Traducao, CategoriaDica, Dica,
      AppConfig,
    }, { setupKeyObrigatoria: SETUP_KEY_OBRIGATORIA });
    res.json(status);
  } catch (err) {
    res.status(500).json({ codigo: 'BOOTSTRAP_STATUS_FALHOU', erro: 'Não foi possível verificar o estado inicial do banco.' });
  }
});

// ── POST /api/setup/usuario ──────────────────────────────────────────────────

router.post('/usuario', setupInicialOuAdmin, async (req, res) => {
  const { usuario, senha, forcar } = req.body || {};
  if (typeof usuario !== 'string' || typeof senha !== 'string' || !usuario || !senha)
    return res.status(400).json({ erro: 'Usuário e senha são obrigatórios.' });
  if (usuario.trim().length < 3)
    return res.status(400).json({ erro: 'Usuário deve ter pelo menos 3 caracteres.' });
  if (senha.length < 6)
    return res.status(400).json({ erro: 'Senha deve ter pelo menos 6 caracteres.' });

  try {
    const usuarioNormalizado = usuario.toLowerCase().trim();
    const totalUsers = await User.countDocuments();
    const existe = await User.findOne({ usuario: usuarioNormalizado });

    if (totalUsers > 0 && !forcar) {
      return res.status(409).json({
        erro: existe
          ? 'Usuário já existe. Use a opção Recriar para trocar a senha.'
          : 'O setup já possui administrador. Use Recriar para substituir explicitamente.',
        existe: Boolean(existe),
        configurado: true,
      });
    }

    if (totalUsers > 0 && forcar) {
      await User.deleteMany({});
    }

    await User.create({
      usuario: usuarioNormalizado,
      senhaHash: await bcrypt.hash(senha, 12),
      papel: 'admin',
    });
    await AppConfig.findOneAndUpdate(
      { chave: 'installation' },
      { $set: { setupConcluido: true, setupConcluidoEm: new Date(), modoDados: 'mongo', atualizadoEm: new Date() } },
      { upsert: true, setDefaultsOnInsert: true }
    );
    res.json({
      ok: true,
      setupInicial: totalUsers === 0,
      mensagem: totalUsers === 0
        ? `Administrador "${usuarioNormalizado}" criado com sucesso.`
        : `Administrador substituído por "${usuarioNormalizado}" com sucesso. Sessões antigas foram revogadas.`,
    });
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
});

export default router;
