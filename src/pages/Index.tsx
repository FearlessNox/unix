import { useState, useEffect } from 'react';
import { Header } from '../components/Header';
import { PostCreator } from '../components/PostCreator';
import { Feed } from '../components/Feed';
import { LoginModal } from '../components/LoginModal';
import { RegisterModal } from '../components/RegisterModal';
import { toast } from 'sonner';

const Index = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [isLoadingPosts, setIsLoadingPosts] = useState(true);

  // Função para parsear datas corretamente
  const parseDate = (dateString: string) => {
    // Se a data já tem 'Z' (UTC), usar diretamente
    if (dateString.includes('Z')) {
      return new Date(dateString);
    }
    
    // Se não tem timezone, assumir que é UTC e adicionar 'Z'
    if (dateString.includes('T') && !dateString.includes('Z') && !dateString.includes('+')) {
      return new Date(dateString + 'Z');
    }
    
    // Caso padrão
    return new Date(dateString);
  };

  // Função para carregar tweets da API
  const loadTweets = async () => {
    try {
      setIsLoadingPosts(true);
      const response = await fetch('/api/getTweets');
      const data = await response.json();
      
      if (response.ok) {
        // Transformar os dados da API para o formato esperado pelo Feed
        const formattedPosts = data.tweets.map(tweet => ({
          id: tweet.id,
          username: tweet.users.nickname,
          displayName: tweet.users.name,
          content: tweet.content,
          timestamp: parseDate(tweet.created_at),
          avatar: '👤',
          comments: tweet.comments?.[0]?.count ?? 0,
          likes: tweet.likes?.[0]?.count ?? 0
        }));
        setPosts(formattedPosts);
      } else {
        console.error('Erro ao carregar tweets:', data.error);
      }
    } catch (error) {
      console.error('Erro ao carregar tweets:', error);
    } finally {
      setIsLoadingPosts(false);
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
        // Limpar dados inválidos
        localStorage.removeItem('authToken');
        localStorage.removeItem('userData');
      }
    }
  }, []);

  // Carregar tweets quando o componente montar
  useEffect(() => {
    loadTweets();
  }, []);

  const handleLogin = (data) => {
    // data contém { user, token } da API
    const user = {
      username: data.user.nickname,
      displayName: data.user.name,
      avatar: '👤'
    };
    setCurrentUser(user);
    setIsLoggedIn(true);
    setShowLogin(false);
  };

  const handleRegister = (data) => {
    // data contém { user } da API
    const user = {
      username: data.user.nickname,
      displayName: data.user.name,
      avatar: '👤'
    };
    setCurrentUser(user);
    setIsLoggedIn(true);
    setShowRegister(false);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setCurrentUser(null);
    // Limpar dados do localStorage
    localStorage.removeItem('authToken');
    localStorage.removeItem('userData');
  };

  const handleCreatePost = async (content) => {
    if (!isLoggedIn || !currentUser) return;

    try {
      // Buscar o token do localStorage
      const token = localStorage.getItem('authToken');
      if (!token) {
        console.error('Token de autenticação não encontrado');
        return;
      }
      
      const response = await fetch('/api/createTweet', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          content: content
        }),
      });

      const data = await response.json();

      if (response.ok) {
        // Recarregar os tweets para mostrar o novo
        await loadTweets();
        toast.success('Post criado com sucesso!');
      } else {
        console.error('Erro ao criar tweet:', data.error);
        toast.error(data.error || 'Erro ao criar post');
      }
    } catch (error) {
      console.error('Erro ao criar tweet:', error);
      toast.error('Erro ao criar post. Tente novamente.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <Header 
        isLoggedIn={isLoggedIn}
        currentUser={currentUser}
        onLogin={() => setShowLogin(true)}
        onRegister={() => setShowRegister(true)}
        onLogout={handleLogout}
      />
      
      <main className="container mx-auto px-4 py-8 max-w-2xl">
        {isLoggedIn && (
          <PostCreator 
            onCreatePost={handleCreatePost}
            currentUser={currentUser}
          />
        )}
        
        <Feed posts={posts} isLoading={isLoadingPosts} isLoggedIn={isLoggedIn} />
      </main>

      {showLogin && (
        <LoginModal
          onClose={() => setShowLogin(false)}
          onLogin={handleLogin}
          onSwitchToRegister={() => {
            setShowLogin(false);
            setShowRegister(true);
          }}
        />
      )}

      {showRegister && (
        <RegisterModal
          onClose={() => setShowRegister(false)}
          onRegister={handleRegister}
          onSwitchToLogin={() => {
            setShowRegister(false);
            setShowLogin(true);
          }}
        />
      )}
    </div>
  );
};

export default Index;
