import { getAllTweets, insertTweet } from './models/tweetModel.js';
import { findUserByEmail, insertUser, findUserByNicknameOrEmail } from './models/userModel.js';
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
      case 'createTweet':
        return await handleCreateTweet(req, res);
      case 'getTweets':
        return await handleGetTweets(req, res);
      
      default:
        console.log('DEBUG: Rota não encontrada:', path);
        return res.status(404).json({ 
          error: 'Rota não encontrada',
          path: path,
          availableRoutes: ['test', 'createUser', 'login', 'createTweet', 'getTweets']
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