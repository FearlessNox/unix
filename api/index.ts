import { createUserController, getUsersController, loginController } from './controllers/userController.js';
import { createTweetController, getTweetsController } from './controllers/tweetController.js';
import { createCommentController, getCommentsController } from './controllers/commentController.js';
import { likeTweetController, unlikeTweetController } from './controllers/likeController.js';

export default async function handler(req, res) {
  const { pathname } = new URL(req.url || '', `http://${req.headers.host}`);
  const path = pathname.replace('/api/', '');

  console.log('DEBUG: API request for path:', path);

  try {
    switch (path) {
      // User routes
      case 'createUser':
        return await createUserController(req, res);
      case 'getUsers':
        return await getUsersController(req, res);
      case 'login':
        return await loginController(req, res);
      
      // Tweet routes
      case 'createTweet':
        return await createTweetController(req, res);
      case 'getTweets':
        return await getTweetsController(req, res);
      
      // Comment routes
      case 'createComment':
        return await createCommentController(req, res);
      case 'getComments':
        return await getCommentsController(req, res);
      
      // Like routes
      case 'likeTweet':
        return await likeTweetController(req, res);
      case 'unlikeTweet':
        return await unlikeTweetController(req, res);
      
      // Test route
      case 'test':
        return res.status(200).json({ 
          message: 'API funcionando!',
          timestamp: new Date().toISOString(),
          env: {
            hasSupabaseUrl: !!process.env.SUPABASE_URL,
            hasSupabaseKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
            hasJwtSecret: !!process.env.JWT_SECRET
          }
        });
      
      default:
        return res.status(404).json({ error: 'Rota não encontrada' });
    }
  } catch (error) {
    console.error('ERRO CRÍTICO na API:', error);
    return res.status(500).json({ error: 'Erro interno do servidor' });
  }
} 