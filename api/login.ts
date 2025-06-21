import { findUserByEmail } from './models/userModel.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    console.log('DEBUG: login function called');
    
    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Método não permitido' });
    }

    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email e senha são obrigatórios.' });
    }

    console.log('DEBUG: Tentando login para:', email);

    // 1. Encontrar o usuário pelo email
    const { data: user, error: findError } = await findUserByEmail(email);

    if (findError || !user) {
      console.log('DEBUG: Usuário não encontrado');
      return res.status(401).json({ error: 'Credenciais inválidas.' });
    }

    // 2. Comparar a senha fornecida com o hash no banco
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      console.log('DEBUG: Senha inválida');
      return res.status(401).json({ error: 'Credenciais inválidas.' });
    }

    // 3. Gerar o token JWT
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      console.error('Erro: JWT_SECRET não definido nas variáveis de ambiente.');
      return res.status(500).json({ error: 'Erro interno do servidor.' });
    }

    const tokenPayload = {
      id: user.id,
      name: user.name,
      nickname: user.nickname,
      email: user.email,
    };

    const token = jwt.sign(tokenPayload, jwtSecret, { expiresIn: '7d' });

    // 4. Enviar o token e os dados do usuário (sem a senha)
    const { password: _, ...userWithoutPassword } = user;

    console.log('DEBUG: Login bem-sucedido para:', email);

    return res.status(200).json({
      user: userWithoutPassword,
      token,
    });
  } catch (error) {
    console.error('ERRO CRÍTICO em login:', error);
    console.error('Stack trace:', error.stack);
    return res.status(500).json({ error: 'Erro interno do servidor' });
  }
} 