import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt    from 'jsonwebtoken';
import User   from '../models/User.js';

const router = Router();

// POST /api/auth/login
router.post('/login', async (req, res) => {
  const { usuario, senha } = req.body;
  if (!usuario || !senha)
    return res.status(400).json({ erro: 'Preencha usuário e senha' });

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
    res.status(500).json({ erro: 'Erro interno: ' + err.message });
  }
});

// GET /api/auth/verificar  — valida token
router.get('/verificar', async (req, res) => {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer '))
    return res.status(401).json({ valido: false });
  try {
    const payload = jwt.verify(header.split(' ')[1], process.env.JWT_SECRET);
    res.json({ valido: true, usuario: payload.usuario });
  } catch {
    res.status(401).json({ valido: false });
  }
});

export default router;
