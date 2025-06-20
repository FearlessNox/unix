
import { useState } from 'react';
import { Header } from '../components/Header';
import { PostCreator } from '../components/PostCreator';
import { Feed } from '../components/Feed';
import { LoginModal } from '../components/LoginModal';
import { RegisterModal } from '../components/RegisterModal';

const Index = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [posts, setPosts] = useState([
    {
      id: 1,
      username: 'unix_creator',
      displayName: 'Unix Creator',
      content: 'Bem-vindos ao Unix! Uma nova forma de compartilhar ideias em pequenas doses. 🚀',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
      avatar: '🖥️'
    },
    {
      id: 2,
      username: 'dev_ninja',
      displayName: 'Dev Ninja',
      content: 'Testando o Unix! Adorando a interface limpa e minimalista. Parabéns à equipe! 👨‍💻',
      timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000),
      avatar: '🥷'
    },
    {
      id: 3,
      username: 'tech_enthusiast',
      displayName: 'Tech Enthusiast',
      content: 'O Unix está revolucionando o microblogging! Simplicidade e funcionalidade em perfeita harmonia. #Unix #Tech',
      timestamp: new Date(Date.now() - 30 * 60 * 1000),
      avatar: '⚡'
    }
  ]);

  const handleLogin = (username, password) => {
    // Simulação de login - em produção seria integrado com backend
    const user = {
      username: username,
      displayName: username.charAt(0).toUpperCase() + username.slice(1),
      avatar: '👤'
    };
    setCurrentUser(user);
    setIsLoggedIn(true);
    setShowLogin(false);
  };

  const handleRegister = (formData) => {
    // Simulação de cadastro - em produção seria integrado com backend
    const user = {
      username: formData.username,
      displayName: formData.name,
      avatar: '👤'
    };
    setCurrentUser(user);
    setIsLoggedIn(true);
    setShowRegister(false);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setCurrentUser(null);
  };

  const handleCreatePost = (content) => {
    if (!isLoggedIn || !currentUser) return;

    const newPost = {
      id: Date.now(),
      username: currentUser.username,
      displayName: currentUser.displayName,
      content: content,
      timestamp: new Date(),
      avatar: currentUser.avatar
    };

    setPosts([newPost, ...posts]);
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
        
        <Feed posts={posts} />
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
