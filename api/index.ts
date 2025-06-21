import { insertUser, getAllUsers, findUserByNicknameOrEmail, findUserByEmail } from './models/userModel.js';
import { insertTweet, getAllTweets } from './models/tweetModel.js';
import { insertComment, getCommentsByTweet } from './models/commentModel.js';
import { insertLike, deleteLike } from './models/likeModel.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    // Extract path from URL
    let path = '';
    
    if (req.url) {
      // Remove query parameters and get the path
      const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
      path = url.pathname.replace('/api/', '');
    }

    console.log('DEBUG: API request for path:', path);
    console.log('DEBUG: Method:', req.method);

    switch (path) {
      // Test route
      case 'test':
        return res.status(200).json({ 
          message: 'API funcionando!',
          timestamp: new Date().toISOString(),
          path: path,
          method: req.method,
          env: {
            hasSupabaseUrl: !!process.env.SUPABASE_URL,
            hasSupabaseKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
            hasJwtSecret: !!process.env.JWT_SECRET
          }
        });

      // User routes
      case 'createUser':
        return await handleCreateUser(req, res);
      case 'getUsers':
        return await handleGetUsers(req, res);
      case 'login':
        return await handleLogin(req, res);
      
      // Tweet routes
      case 'createTweet':
        return await handleCreateTweet(req, res);
      case 'getTweets':
        return await handleGetTweets(req, res);
      
      // Comment routes
      case 'createComment':
        return await handleCreateComment(req, res);
      case 'getComments':
        return await handleGetComments(req, res);
      
      // Like routes
      case 'likeTweet':
        return await handleLikeTweet(req, res);
      case 'unlikeTweet':
        return await handleUnlikeTweet(req, res);
      
      default:
        console.log('DEBUG: Rota não encontrada:', path);
        return res.status(404).json({ 
          error: 'Rota não encontrada',
          path: path,
          availableRoutes: [
            'test', 'createUser', 'getUsers', 'login',
            'createTweet', 'getTweets',
            'createComment', 'getComments',
            'likeTweet', 'unlikeTweet'
          ]
        });
    }
  } catch (error) {
    console.error('ERRO CRÍTICO na API:', error);
    console.error('Stack trace:', error.stack);
    return res.status(500).json({ 
      error: 'Erro interno do servidor',
      message: error.message
    });
  }
}

// User handlers
async function handleCreateUser(req, res) {
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

  // Inserir novo usuário
  const { data, error } = await insertUser({ name, nickname, email, password: hashedPassword });
  if (error) {
    return res.status(400).json({ error: 'Não foi possível criar a conta.' });
  }
  return res.status(201).json({ user: data[0] });
}

async function handleGetUsers(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Método não permitido' });
  }
  const { data, error } = await getAllUsers();
  if (error) {
    return res.status(400).json({ error: error.message });
  }
  return res.status(200).json({ users: data });
}

async function handleLogin(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email e senha são obrigatórios.' });
  }

  // Encontrar o usuário pelo email
  const { data: user, error: findError } = await findUserByEmail(email);

  if (findError || !user) {
    return res.status(401).json({ error: 'Credenciais inválidas.' });
  }

  // Comparar a senha
  const isPasswordValid = await bcrypt.compare(password, user.password);

  if (!isPasswordValid) {
    return res.status(401).json({ error: 'Credenciais inválidas.' });
  }

  // Gerar o token JWT
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

  // Enviar o token e os dados do usuário (sem a senha)
  const { password: _, ...userWithoutPassword } = user;

  return res.status(200).json({
    user: userWithoutPassword,
    token,
  });
}

// Tweet handlers
async function handleCreateTweet(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  // Verificar autenticação
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Token de autenticação não fornecido' });
  }

  const token = authHeader.substring(7);
  const jwtSecret = process.env.JWT_SECRET;

  if (!jwtSecret) {
    console.error('Erro: JWT_SECRET não definido nas variáveis de ambiente.');
    return res.status(500).json({ error: 'Erro interno do servidor.' });
  }

  // Verificar e decodificar o token
  const decoded = jwt.verify(token, jwtSecret) as any;
  const user_id = decoded.id;

  const { content } = req.body || {};

  if (!content) {
    return res.status(400).json({ error: 'Conteúdo é obrigatório' });
  }

  const { data, error } = await insertTweet({ content, user_id });

  if (error) {
    return res.status(400).json({ error: error.message });
  }

  return res.status(201).json({ tweet: data[0] });
}

async function handleGetTweets(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  const { data, error } = await getAllTweets();
  
  if (error) {
    return res.status(400).json({ error: error.message });
  }

  return res.status(200).json({ tweets: data });
}

// Comment handlers
async function handleCreateComment(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' });
  }
  const { content, user_id, tweet_id } = req.body;
  if (!content || !user_id || !tweet_id) {
    return res.status(400).json({ error: 'Dados incompletos' });
  }
  const { data, error } = await insertComment({ content, user_id, tweet_id });
  if (error) {
    return res.status(400).json({ error: error.message });
  }
  return res.status(201).json({ comment: data[0] });
}

async function handleGetComments(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Método não permitido' });
  }
  const tweet_id = req.query.tweet_id;
  if (!tweet_id) {
    return res.status(400).json({ error: 'tweet_id é obrigatório' });
  }
  const { data, error } = await getCommentsByTweet(tweet_id);
  if (error) {
    return res.status(400).json({ error: error.message });
  }
  return res.status(200).json({ comments: data });
}

// Like handlers
async function handleLikeTweet(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' });
  }
  const { user_id, tweet_id } = req.body;
  if (!user_id || !tweet_id) {
    return res.status(400).json({ error: 'Dados incompletos' });
  }
  const { data, error } = await insertLike({ user_id, tweet_id });
  if (error) {
    return res.status(400).json({ error: error.message });
  }
  return res.status(201).json({ like: data[0] });
}

async function handleUnlikeTweet(req, res) {
  if (req.method !== 'DELETE') {
    return res.status(405).json({ error: 'Método não permitido' });
  }
  const { user_id, tweet_id } = req.body;
  if (!user_id || !tweet_id) {
    return res.status(400).json({ error: 'Dados incompletos' });
  }
  const { error } = await deleteLike({ user_id, tweet_id });
  if (error) {
    return res.status(400).json({ error: error.message });
  }
  return res.status(200).json({ message: 'Like removido com sucesso' });
} 