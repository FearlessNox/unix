import { insertUser, getAllUsers, findUserByNicknameOrEmail } from '../models/userModel.js';
import bcrypt from 'bcrypt';

export async function createUserController(req, res) {
  console.log('DEBUG: Variável SUPABASE_URL é:', process.env.SUPABASE_URL);

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' });
  }
  const { name, nickname, email, password } = req.body;
  if (!name || !nickname || !email || !password) {
    return res.status(400).json({ error: 'Dados incompletos' });
  }

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
    return res.status(400).json({ error: 'Não foi possível criar a conta.' });
  }
  return res.status(201).json({ user: data[0] });
}

export async function getUsersController(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Método não permitido' });
  }
  const { data, error } = await getAllUsers();
  if (error) {
    return res.status(400).json({ error: error.message });
  }
  return res.status(200).json({ users: data });
} 