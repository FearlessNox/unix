import { useState, useEffect } from 'react';
import { toast } from 'sonner';

interface UseLikeProps {
  tweetId: number;
  initialLikeCount: number;
  isLoggedIn: boolean;
}

export const useLike = ({ tweetId, initialLikeCount, isLoggedIn }: UseLikeProps) => {
  const [likeCount, setLikeCount] = useState(initialLikeCount);
  const [isLiked, setIsLiked] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Verificar se o usuário já curtiu o tweet
  useEffect(() => {
    if (isLoggedIn && tweetId) {
      checkLikeStatus();
    }
  }, [tweetId, isLoggedIn]);

  const checkLikeStatus = async () => {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) return;

      const response = await fetch(`/api/checkLike?tweet_id=${tweetId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setIsLiked(data.liked);
      }
    } catch (error) {
      console.error('Erro ao verificar like:', error);
    }
  };

  const handleLike = async () => {
    if (!isLoggedIn) {
      toast.error('Você precisa estar logado para curtir');
      return;
    }

    setIsLoading(true);

    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        toast.error('Token de autenticação não encontrado');
        return;
      }

      if (isLiked) {
        // Descurtir
        const response = await fetch(`/api/unlikeTweet?tweet_id=${tweetId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.ok) {
          setIsLiked(false);
          setLikeCount(prev => Math.max(0, prev - 1));
          toast.success('Tweet descurtido');
        } else {
          const data = await response.json();
          toast.error(data.error || 'Erro ao descurtir');
        }
      } else {
        // Curtir
        const response = await fetch('/api/likeTweet', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ tweet_id: tweetId })
        });

        if (response.ok) {
          setIsLiked(true);
          setLikeCount(prev => prev + 1);
          toast.success('Tweet curtido!');
        } else {
          const data = await response.json();
          toast.error(data.error || 'Erro ao curtir');
        }
      }
    } catch (error) {
      console.error('Erro ao gerenciar like:', error);
      toast.error('Erro ao gerenciar like. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  return {
    likeCount,
    isLiked,
    isLoading,
    handleLike
  };
}; 