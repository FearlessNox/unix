import jwt from 'jsonwebtoken';

export interface AuthenticatedRequest {
  headers: {
    authorization?: string;
  };
  user?: {
    id: number;
    name: string;
    nickname: string;
    email: string;
  };
  body?: any;
  method?: string;
}

export function authMiddleware(req: AuthenticatedRequest, res: any, next: () => void) {
  try {
    // Pegar o token do header Authorization
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
    
    // Adicionar informações do usuário à requisição
    req.user = {
      id: decoded.id,
      name: decoded.name,
      nickname: decoded.nickname,
      email: decoded.email,
    };

    next();
  } catch (error) {
    console.error('Erro na validação do token:', error);
    return res.status(401).json({ error: 'Token inválido ou expirado' });
  }
} 