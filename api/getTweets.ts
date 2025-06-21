import { getAllTweets } from './models/tweetModel.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    console.log('DEBUG: getTweets function called');
    
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
    console.error('ERRO CRÍTICO em getTweets:', error);
    console.error('Stack trace:', error.stack);
    return res.status(500).json({ error: 'Erro interno do servidor' });
  }
} 