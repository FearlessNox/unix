import React, { useState } from 'react';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { Avatar, AvatarFallback } from './ui/avatar';
import { toast } from 'sonner';

interface CommentFormProps {
  tweetId: number;
  currentUser: {
    username: string;
    displayName: string;
    avatar: string;
  };
  onCommentAdded: () => void;
}

export const CommentForm = ({ tweetId, currentUser, onCommentAdded }: CommentFormProps) => {
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!content.trim()) {
      toast.error('Digite um comentário');
      return;
    }

    setIsSubmitting(true);

    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        toast.error('Você precisa estar logado para comentar');
        return;
      }

      const response = await fetch('/api/createComment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          content: content.trim(),
          tweet_id: tweetId
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setContent('');
        toast.success('Comentário adicionado!');
        onCommentAdded();
      } else {
        toast.error(data.error || 'Erro ao adicionar comentário');
      }
    } catch (error) {
      console.error('Erro ao criar comentário:', error);
      toast.error('Erro ao adicionar comentário. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="border-t border-slate-200 pt-4">
      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="flex gap-3">
          <Avatar className="w-10 h-10 flex-shrink-0">
            <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white font-semibold text-sm">
              {currentUser.displayName.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1">
            <Textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Adicione um comentário..."
              className="min-h-[80px] resize-none border-slate-200 focus:border-blue-500"
              maxLength={280}
            />
            
            <div className="flex items-center justify-between mt-2">
              <span className="text-xs text-slate-500">
                {content.length}/280 caracteres
              </span>
              
              <Button
                type="submit"
                disabled={isSubmitting || !content.trim()}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 text-sm"
              >
                {isSubmitting ? 'Enviando...' : 'Comentar'}
              </Button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}; 