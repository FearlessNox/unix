import { insertUser, findUserByNicknameOrEmail } from './models/userModel.js';
import bcrypt from 'bcrypt';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    console.log('DEBUG: createUser function called');
    
    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Método não permitido' });
    }

    const { name, nickname, email, password } = req.body;
    if (!name || !nickname || !email || !password) {
      return res.status(400).json({ error: 'Dados incompletos' });
    }

    console.log('DEBUG: Tentando criar usuário:', nickname);

    // Validação de usuário existente
    const { data: existingUser, error: findError } = await findUserByNicknameOrEmail({ nickname, email });

    if (findError) {
      console.error('Erro ao verificar usuário existente:', findError);
      return res.status(500).json({ error: 'Erro ao verificar os dados. Tente novamente.' });
    }

    if (existingUser) {
      if (existingUser.nickname === nickname) {
        return res.status(409).json({ error: 'Este nome de usuário já está em uso.' });
      }
      if (existingUser.email === email) {
        return res.status(409).json({ error: 'Este email já está em uso.' });
      }
    }

    // Criptografar a senha
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Inserir novo usuário se a validação passar
    const { data, error } = await insertUser({ name, nickname, email, password: hashedPassword });
    if (error) {
      console.error('Erro ao inserir usuário:', error);
      return res.status(400).json({ error: 'Não foi possível criar a conta.' });
    }

    console.log('DEBUG: Usuário criado com sucesso:', nickname);
    return res.status(201).json({ user: data[0] });
  } catch (error) {
    console.error('ERRO CRÍTICO em createUser:', error);
    console.error('Stack trace:', error.stack);
    return res.status(500).json({ error: 'Erro interno do servidor' });
  }
} 