import { insertUser, getAllUsers, findUserByNicknameOrEmail, findUserByEmail } from '../models/userModel.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

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

export async function loginController(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email e senha são obrigatórios.' });
  }

  // 1. Encontrar o usuário pelo email
  const { data: user, error: findError } = await findUserByEmail(email);

  if (findError || !user) {
    return res.status(401).json({ error: 'Credenciais inválidas.' });
  }

  // 2. Comparar a senha fornecida com o hash no banco
  const isPasswordValid = await bcrypt.compare(password, user.password);

  if (!isPasswordValid) {
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

  return res.status(200).json({
    user: userWithoutPassword,
    token,
  });
} 