import React from 'react';
import { Avatar, AvatarFallback } from './ui/avatar';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface Comment {
  id: number;
  content: string;
  created_at: string;
  users: {
    id: number;
    name: string;
    nickname: string;
  };
}

interface CommentListProps {
  comments: Comment[];
  isLoading?: boolean;
}

export const CommentList = ({ comments, isLoading = false }: CommentListProps) => {
  const formatTimeAgo = (dateString: string) => {
    const utcDate = new Date(dateString);
    const localDate = new Date(utcDate.getTime() + (utcDate.getTimezoneOffset() * 60000 * -1));
    return formatDistanceToNow(localDate, { addSuffix: true, locale: ptBR });
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex gap-3 animate-pulse">
            <div className="w-10 h-10 bg-slate-200 rounded-full flex-shrink-0"></div>
            <div className="flex-1 space-y-2">
              <div className="flex items-center gap-2">
                <div className="h-4 bg-slate-200 rounded w-24"></div>
                <div className="h-3 bg-slate-200 rounded w-16"></div>
                <div className="h-3 bg-slate-200 rounded w-12"></div>
              </div>
              <div className="h-4 bg-slate-200 rounded w-full"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (comments.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-slate-500">Nenhum comentário ainda. Seja o primeiro a comentar!</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {comments.map((comment) => (
        <div key={comment.id} className="flex gap-3">
          <Avatar className="w-10 h-10 flex-shrink-0">
            <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white font-semibold text-sm">
              {comment.users.name.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="font-semibold text-slate-900 text-sm">
                {comment.users.name}
              </span>
              <span className="text-slate-500 text-sm">
                @{comment.users.nickname}
              </span>
              <span className="text-slate-400">·</span>
              <span className="text-slate-500 text-sm">
                {formatTimeAgo(comment.created_at)}
              </span>
            </div>
            
            <p className="text-slate-800 text-sm leading-relaxed whitespace-pre-wrap">
              {comment.content}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}; 