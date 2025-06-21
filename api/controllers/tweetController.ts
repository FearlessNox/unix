import { insertTweet, getAllTweets } from '../models/tweetModel.js';
import { authMiddleware, AuthenticatedRequest } from '../middleware/authMiddleware.js';

export async function createTweetController(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  // Aplicar middleware de autenticação
  authMiddleware(req, res, () => {
    handleCreateTweet(req, res);
  });
}

async function handleCreateTweet(req: AuthenticatedRequest, res: any) {
  const { content } = req.body || {};

  if (!content) {
    return res.status(400).json({ error: 'Conteúdo é obrigatório' });
  }

  // user_id vem do token JWT (req.user.id)
  const user_id = req.user!.id;

  const { data, error } = await insertTweet({ content, user_id });

  if (error) {
    return res.status(400).json({ error: error.message });
  }

  return res.status(201).json({ tweet: data[0] });
}

export async function getTweetsController(req: any, res: any) {
  try {
    console.log('DEBUG: getTweetsController iniciado');
    
    if (req.method !== 'GET') {
      return res.status(405).json({ error: 'Método não permitido' });
    }

    console.log('DEBUG: Chamando getAllTweets...');
    const { data, error } = await getAllTweets();
    
    console.log('DEBUG: Resposta do Supabase:', { data: data?.length, error });
    
    if (error) {
      console.error('ERRO do Supabase:', error);
      return res.status(400).json({ error: error.message });
    }

    console.log('DEBUG: Retornando dados com sucesso');
    return res.status(200).json({ tweets: data });
  } catch (error) {
    console.error('ERRO CRÍTICO em getTweetsController:', error);
    console.error('Stack trace:', error.stack);
    return res.status(500).json({ error: 'Erro interno do servidor' });
  }
} 