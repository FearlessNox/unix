export default function handler(req, res) {
  console.log('DEBUG: Test function iniciada');
  
  try {
    res.status(200).json({ 
      message: 'API funcionando!',
      timestamp: new Date().toISOString(),
      env: {
        hasSupabaseUrl: !!process.env.SUPABASE_URL,
        hasSupabaseKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
        hasJwtSecret: !!process.env.JWT_SECRET
      }
    });
  } catch (error) {
    console.error('ERRO no test:', error);
    res.status(500).json({ error: 'Erro no test' });
  }
} 