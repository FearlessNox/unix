import { insertTweet } from './models/tweetModel.js';
import jwt from 'jsonwebtoken';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    console.log('DEBUG: createTweet function called');
    
    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Método não permitido' });
    }

    // Verificar autenticação
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Token de autenticação não fornecido' });
    }

    const token = authHeader.substring(7); // Remove "Bearer "
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