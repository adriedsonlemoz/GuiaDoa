import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt    from 'jsonwebtoken';
import User   from '../models/User.js';
import { criarRateLimit } from '../middleware/rateLimit.js';
import { autenticar } from '../middleware/auth.js';

const router = Router();

const LOGIN_MAX = Math.max(3, Number(process.env.LOGIN_RATE_LIMIT_MAX) || 8);
const loginRateLimit = criarRateLimit({
  janelaMs: 15 * 60 * 1000,
  max: LOGIN_MAX,
  prefixo: 'login',
  chave: (req) => {
    const ip = req.ip || req.socket?.remoteAddress || 'unknown';
    const usuario = typeof req.body?.usuario === 'string'
      ? req.body.usuario.trim().toLowerCase().slice(0, 80)
      : 'sem-usuario';
    return `${ip}:${usuario}`;
  },
  mensagem: 'Muitas tentativas de login. Aguarde alguns minutos e tente novamente.',
});

// POST /api/auth/login
router.post('/login', loginRateLimit, async (req, res) => {
  const { usuario, senha } = req.body;
  if (!usuario || !senha)
    return res.status(400).json({ erro: 'Preencha usuário e senha' });
  if (typeof usuario !== 'string' || typeof senha !== 'string')
    return res.status(400).json({ erro: 'Credenciais inválidas' });
  if (usuario.length > 80 || senha.length > 200)
    return res.status(400).json({ erro: 'Credenciais inválidas' });
  if (!process.env.JWT_SECRET)
    return res.status(500).json({ erro: 'JWT_SECRET não configurada no servidor' });

  try {
    const user = await User.findOne({ usuario: usuario.toLowerCase().trim() });
    if (!user)
      return res.status(401).json({ erro: 'Credenciais inválidas' });

    const ok = await bcrypt.compare(senha, user.senhaHash);
    if (!ok)
      return res.status(401).json({ erro: 'Credenciais inválidas' });

    const token = jwt.sign(
      { id: user._id, usuario: user.usuario, papel: user.papel },
      process.env.JWT_SECRET,
      { expiresIn: '12h' }
    );

    res.json({ token, usuario: user.usuario, papel: user.papel });
  } catch (err) {
    console.error('[auth] login:', err.message);
    res.status(500).json({ erro: 'Erro interno do servidor' });
  }
});

// GET /api/auth/verificar — valida token e confirma que o usuário ainda existe
router.get('/verificar', autenticar, async (req, res) => {
  res.json({ valido: true, usuario: req.usuario.usuario, papel: req.usuario.papel });
});

export default router;
