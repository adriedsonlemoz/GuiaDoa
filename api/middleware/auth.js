import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export const autenticar = async (req, res, next) => {
  if (!process.env.JWT_SECRET) {
    return res.status(500).json({ erro: 'JWT_SECRET não configurada no servidor' });
  }

  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    return res.status(401).json({ erro: 'Token não fornecido' });
  }

  const token = header.slice(7).trim();
  if (!token) return res.status(401).json({ erro: 'Token não fornecido' });

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(payload.id).select('_id usuario papel').lean();
    if (!user) return res.status(401).json({ erro: 'Sessão revogada. Faça login novamente.' });

    req.usuario = {
      id: String(user._id),
      usuario: user.usuario,
      papel: user.papel,
    };
    next();
  } catch (err) {
    if (err?.name === 'JsonWebTokenError' || err?.name === 'TokenExpiredError') {
      return res.status(401).json({ erro: 'Token inválido ou expirado' });
    }
    console.error('[auth] verificar token:', err.message);
    return res.status(500).json({ erro: 'Falha ao validar a sessão' });
  }
};

export const exigirAdmin = (req, res, next) => {
  if (req.usuario?.papel !== 'admin') {
    return res.status(403).json({ erro: 'Acesso restrito a administradores' });
  }
  next();
};
