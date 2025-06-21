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
      
      default:
        console.log('DEBUG: Rota não encontrada:', path);
        return res.status(404).json({ 
          error: 'Rota não encontrada',
          path: path,
          availableRoutes: ['test']
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