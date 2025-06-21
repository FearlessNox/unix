import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Heart, MessageCircle, Share2, MoreHorizontal } from 'lucide-react';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Avatar, AvatarFallback } from '../components/ui/avatar';
import { toast } from 'sonner';

interface Tweet {
  id: number;
  content: string;
  created_at: string;
  users: {
    id: number;
    name: string;
    nickname: string;
  };
}

const TweetDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [tweet, setTweet] = useState<Tweet | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  // Função para parsear datas corretamente
  const parseDate = (dateString: string) => {
    if (dateString.includes('Z')) {
      return new Date(dateString);
    }
    if (dateString.includes('T') && !dateString.includes('Z') && !dateString.includes('+')) {
      return new Date(dateString + 'Z');
    }
    return new Date(dateString);
  };

  // Função para formatar data
  const formatDate = (date: Date) => {
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return 'agora mesmo';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h`;
    if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)}d`;
    
    return date.toLocaleDateString('pt-BR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  // Carregar tweet específico
  const loadTweet = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/getTweet?id=${id}`);
      const data = await response.json();
      
      if (response.ok) {
        setTweet(data.tweet);
      } else {
        console.error('Erro ao carregar tweet:', data.error);
        toast.error('Tweet não encontrado');
        navigate('/');
      }
    } catch (error) {
      console.error('Erro ao carregar tweet:', error);
      toast.error('Erro ao carregar tweet');
      navigate('/');
    } finally {
      setIsLoading(false);
    }
  };

  // Verificar se há sessão salva no localStorage
  useEffect(() => {
    const token = localStorage.getItem('authToken');
    const userData = localStorage.getItem('userData');

    if (token && userData) {
      try {
        const user = JSON.parse(userData);
        setCurrentUser({
          username: user.nickname,
          displayName: user.name,
          avatar: '👤'
        });
        setIsLoggedIn(true);
      } catch (error) {
        console.error('Erro ao restaurar sessão:', error);
        localStorage.removeItem('authToken');
        localStorage.removeItem('userData');
      }
    }
  }, []);

  // Carregar tweet quando o componente montar
  useEffect(() => {
    if (id) {
      loadTweet();
    }
  }, [id]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="container mx-auto px-4 py-8 max-w-2xl">
          <div className="flex items-center gap-4 mb-6">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/')}
              className="text-slate-600 hover:text-slate-800"
            >
              <ArrowLeft size={20} />
            </Button>
            <div className="h-6 bg-slate-200 rounded animate-pulse w-32"></div>
          </div>
          
          <Card className="p-6">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-slate-200 rounded-full animate-pulse"></div>
                <div className="space-y-2">
                  <div className="h-4 bg-slate-200 rounded animate-pulse w-24"></div>
                  <div className="h-3 bg-slate-200 rounded animate-pulse w-16"></div>
                </div>
              </div>
              <div className="space-y-2">
                <div className="h-4 bg-slate-200 rounded animate-pulse w-full"></div>
                <div className="h-4 bg-slate-200 rounded animate-pulse w-3/4"></div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  if (!tweet) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="container mx-auto px-4 py-8 max-w-2xl">
          <div className="flex items-center gap-4 mb-6">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/')}
              className="text-slate-600 hover:text-slate-800"
            >
              <ArrowLeft size={20} />
            </Button>
            <span className="text-lg font-semibold text-slate-900">Tweet</span>
          </div>
          
          <Card className="p-6 text-center">
            <p className="text-slate-600">Tweet não encontrado</p>
            <Button
              onClick={() => navigate('/')}
              className="mt-4"
            >
              Voltar ao início
            </Button>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/')}
            className="text-slate-600 hover:text-slate-800"
          >
            <ArrowLeft size={20} />
          </Button>
          <span className="text-lg font-semibold text-slate-900">Tweet</span>
        </div>

        {/* Tweet Card */}
        <Card className="border-0 shadow-sm bg-white/80 backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="flex items-start gap-3">
              <Avatar className="w-12 h-12">
                <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white font-semibold">
                  {tweet.users.name.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-semibold text-slate-900 truncate">
                    {tweet.users.name}
                  </span>
                  <span className="text-slate-500 text-sm">
                    @{tweet.users.nickname}
                  </span>
                  <span className="text-slate-400">·</span>
                  <span className="text-slate-500 text-sm">
                    {formatDate(parseDate(tweet.created_at))}
                  </span>
                </div>
                
                <div className="text-slate-900 leading-relaxed mb-4">
                  {tweet.content}
                </div>

                {/* Tweet Actions */}
                <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                  <div className="flex items-center gap-6">
                    <button className="flex items-center gap-2 text-slate-500 hover:text-blue-500 transition-colors">
                      <MessageCircle size={18} />
                      <span className="text-sm">0</span>
                    </button>
                    
                    <button className="flex items-center gap-2 text-slate-500 hover:text-green-500 transition-colors">
                      <Share2 size={18} />
                      <span className="text-sm">0</span>
                    </button>
                    
                    <button className="flex items-center gap-2 text-slate-500 hover:text-red-500 transition-colors">
                      <Heart size={18} />
                      <span className="text-sm">0</span>
                    </button>
                  </div>
                  
                  <button className="text-slate-400 hover:text-slate-600 transition-colors">
                    <MoreHorizontal size={18} />
                  </button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Comments Section */}
        <div className="mt-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Comentários</h3>
          <Card className="border-0 shadow-sm bg-white/80 backdrop-blur-sm">
            <CardContent className="p-6">
              <p className="text-slate-500 text-center py-8">
                Comentários em breve...
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default TweetDetail; 