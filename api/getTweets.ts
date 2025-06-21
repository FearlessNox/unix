import { getTweetsController } from './controllers/tweetController.js';

export default async function handler(req, res) {
  try {
    console.log('DEBUG: getTweets function iniciada');
    console.log('DEBUG: Método:', req.method);
    console.log('DEBUG: Headers:', req.headers);
    
    await getTweetsController(req, res);
    
    console.log('DEBUG: getTweets function concluída com sucesso');
  } catch (error) {
    console.error('ERRO CRÍTICO em getTweets:', error);
    console.error('Stack trace:', error.stack);
    
    return res.status(500).json({ 
      error: 'Erro interno do servidor',
      details: process.env.NODE_ENV === 'development' ? error.message : 'Erro interno'
    });
  }
} 