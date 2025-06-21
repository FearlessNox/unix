import { getAllTweets, insertTweet, getTweetById } from './models/tweetModel.js';
import { findUserByEmail, insertUser, findUserByNicknameOrEmail } from './models/userModel.js';
import { insertComment, getCommentsByTweet } from './models/commentModel.js';
import { insertLike, deleteLike, checkUserLiked, getLikeCountByTweet } from './models/likeModel.js';
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
      case 'login':
        return await handleLogin(req, res);

      // Tweet routes
      case 'getTweet':
        return await handleGetTweet(req, res);
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
      case 'checkLike':
        return await handleCheckLike(req, res);
      
      default:
        console.log('DEBUG: Rota não encontrada:', path);
        return res.status(404).json({ 
          error: 'Rota não encontrada',
          path: path,
          availableRoutes: ['test', 'createUser', 'login', 'getTweet', 'createTweet', 'getTweets', 'createComment', 'getComments', 'likeTweet', 'unlikeTweet', 'checkLike']
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

  try {
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

    // Inserir novo usuário
    const { data, error } = await insertUser({ name, nickname, email, password: hashedPassword });
    
    console.log('DEBUG: Resposta do insertUser:', { data, error });
    
    if (error) {
      console.error('Erro ao inserir usuário:', error);
      return res.status(400).json({ error: 'Não foi possível criar a conta.' });
    }

    if (!data || !Array.isArray(data) || data.length === 0) {
      console.log('DEBUG: Usuário criado mas sem retorno de dados');
      return res.status(201).json({ 
        message: 'Usuário criado com sucesso!',
        user: { name, nickname, email }
      });
    }

    console.log('DEBUG: Usuário criado com sucesso:', data[0].nickname);
    return res.status(201).json({ user: data[0] });
  } catch (error) {
    console.error('ERRO CRÍTICO em createUser:', error);
    console.error('Stack trace:', error.stack);
    return res.status(500).json({ error: 'Erro interno do servidor' });
  }
}

async function handleLogin(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email e senha são obrigatórios.' });
    }

    console.log('DEBUG: Tentando login para:', email);

    // Encontrar o usuário pelo email
    const { data: user, error: findError } = await findUserByEmail(email);

    if (findError || !user) {
      console.log('DEBUG: Usuário não encontrado');
      return res.status(401).json({ error: 'Credenciais inválidas.' });
    }

    // Comparar a senha
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      console.log('DEBUG: Senha inválida');
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

// Tweet handlers
async function handleGetTweet(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  try {
    const { id } = req.query;
    
    if (!id) {
      return res.status(400).json({ error: 'ID do tweet é obrigatório' });
    }

    console.log('DEBUG: getTweet function called for ID:', id);
    
    const { data, error } = await getTweetById(id);
    
    console.log('DEBUG: Resposta do Supabase:', { data, error });
    
    if (error) {
      console.error('ERRO do Supabase:', error);
      return res.status(404).json({ error: 'Tweet não encontrado' });
    }

    console.log('DEBUG: Tweet encontrado com sucesso');
    return res.status(200).json({ tweet: data });
  } catch (error) {
    console.error('ERRO CRÍTICO em getTweet:', error);
    console.error('Stack trace:', error.stack);
    return res.status(500).json({ error: 'Erro interno do servidor' });
  }
}

async function handleCreateTweet(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  try {
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
    const decoded = jwt.verify(token, jwtSecret);
    const user_id = decoded.id;

    const { content } = req.body || {};

    if (!content) {
      return res.status(400).json({ error: 'Conteúdo é obrigatório' });
    }

    console.log('DEBUG: Criando tweet para usuário:', user_id);

    const { data, error } = await insertTweet({ content, user_id });

    if (error) {
      console.error('Erro ao inserir tweet:', error);
      return res.status(400).json({ error: error.message });
    }

    console.log('DEBUG: Tweet criado com sucesso');
    return res.status(201).json({ tweet: data[0] });
  } catch (error) {
    console.error('ERRO CRÍTICO em createTweet:', error);
    console.error('Stack trace:', error.stack);
    return res.status(500).json({ error: 'Erro interno do servidor' });
  }
}

async function handleGetTweets(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  try {
    console.log('DEBUG: getTweets function called');
    
    const { data, error } = await getAllTweets();
    
    console.log('DEBUG: Resposta do Supabase:', { data: data?.length, error });
    
    if (error) {
      console.error('ERRO do Supabase:', error);
      return res.status(400).json({ error: error.message });
    }

    console.log('DEBUG: Retornando dados com sucesso');
    return res.status(200).json({ tweets: data });
  } catch (error) {
    console.error('ERRO CRÍTICO em getTweets:', error);
    console.error('Stack trace:', error.stack);
    return res.status(500).json({ error: 'Erro interno do servidor' });
  }
}

// Comment handlers
async function handleCreateComment(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  try {
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
    const decoded = jwt.verify(token, jwtSecret);
    const user_id = decoded.id;

    const { content, tweet_id } = req.body || {};

    if (!content || !tweet_id) {
      return res.status(400).json({ error: 'Conteúdo e tweet_id são obrigatórios' });
    }

    console.log('DEBUG: Criando comentário para tweet:', tweet_id, 'usuário:', user_id);

    const { data, error } = await insertComment({ content, user_id, tweet_id });

    if (error) {
      console.error('Erro ao inserir comentário:', error);
      return res.status(400).json({ error: error.message });
    }

    console.log('DEBUG: Comentário criado com sucesso');
    return res.status(201).json({ comment: data[0] });
  } catch (error) {
    console.error('ERRO CRÍTICO em createComment:', error);
    console.error('Stack trace:', error.stack);
    return res.status(500).json({ error: 'Erro interno do servidor' });
  }
}

async function handleGetComments(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  try {
    const { tweet_id } = req.query;
    
    if (!tweet_id) {
      return res.status(400).json({ error: 'tweet_id é obrigatório' });
    }

    console.log('DEBUG: getComments function called for tweet:', tweet_id);
    
    const { data, error } = await getCommentsByTweet(tweet_id);
    
    console.log('DEBUG: Resposta do Supabase:', { data: data?.length, error });
    
    if (error) {
      console.error('ERRO do Supabase:', error);
      return res.status(400).json({ error: error.message });
    }

    console.log('DEBUG: Comentários encontrados com sucesso');
    return res.status(200).json({ comments: data });
  } catch (error) {
    console.error('ERRO CRÍTICO em getComments:', error);
    console.error('Stack trace:', error.stack);
    return res.status(500).json({ error: 'Erro interno do servidor' });
  }
}

// Like handlers
async function handleLikeTweet(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  try {
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
    const decoded = jwt.verify(token, jwtSecret);
    const user_id = decoded.id;

    const { tweet_id } = req.body || {};

    if (!tweet_id) {
      return res.status(400).json({ error: 'tweet_id é obrigatório' });
    }

    console.log('DEBUG: Curtindo tweet:', tweet_id, 'usuário:', user_id);

    // Verificar se já curtiu
    const { liked, error: checkError } = await checkUserLiked({ user_id, tweet_id });
    
    if (checkError && checkError.code !== 'PGRST116') { // PGRST116 = no rows returned
      console.error('Erro ao verificar like:', checkError);
      return res.status(500).json({ error: 'Erro ao verificar like' });
    }

    if (liked) {
      return res.status(409).json({ error: 'Você já curtiu este tweet' });
    }

    // Adicionar like
    const { data, error } = await insertLike({ user_id, tweet_id });

    if (error) {
      console.error('Erro ao curtir tweet:', error);
      return res.status(400).json({ error: error.message });
    }

    console.log('DEBUG: Tweet curtido com sucesso');
    return res.status(201).json({ like: data[0] });
  } catch (error) {
    console.error('ERRO CRÍTICO em likeTweet:', error);
    console.error('Stack trace:', error.stack);
    return res.status(500).json({ error: 'Erro interno do servidor' });
  }
}

async function handleUnlikeTweet(req, res) {
  if (req.method !== 'DELETE') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  try {
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
    const decoded = jwt.verify(token, jwtSecret);
    const user_id = decoded.id;

    const { tweet_id } = req.query || {};

    if (!tweet_id) {
      return res.status(400).json({ error: 'tweet_id é obrigatório' });
    }

    console.log('DEBUG: Descurtindo tweet:', tweet_id, 'usuário:', user_id);

    // Remover like
    const { error } = await deleteLike({ user_id, tweet_id });

    if (error) {
      console.error('Erro ao descurtir tweet:', error);
      return res.status(400).json({ error: error.message });
    }

    console.log('DEBUG: Tweet descurtido com sucesso');
    return res.status(200).json({ message: 'Like removido com sucesso' });
  } catch (error) {
    console.error('ERRO CRÍTICO em unlikeTweet:', error);
    console.error('Stack trace:', error.stack);
    return res.status(500).json({ error: 'Erro interno do servidor' });
  }
}

async function handleCheckLike(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  try {
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
    const decoded = jwt.verify(token, jwtSecret);
    const user_id = decoded.id;

    const { tweet_id } = req.query || {};

    if (!tweet_id) {
      return res.status(400).json({ error: 'tweet_id é obrigatório' });
    }

    console.log('DEBUG: Verificando like para tweet:', tweet_id, 'usuário:', user_id);

    // Verificar se curtiu
    const { liked, error } = await checkUserLiked({ user_id, tweet_id });

    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
      console.error('Erro ao verificar like:', error);
      return res.status(500).json({ error: 'Erro ao verificar like' });
    }

    console.log('DEBUG: Like verificado com sucesso');
    return res.status(200).json({ liked });
  } catch (error) {
    console.error('ERRO CRÍTICO em checkLike:', error);
    console.error('Stack trace:', error.stack);
    return res.status(500).json({ error: 'Erro interno do servidor' });
  }
} 