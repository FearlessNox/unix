import { Card } from './ui/card';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useNavigate } from 'react-router-dom';
import { MessageCircle } from 'lucide-react';

interface Post {
  id: number;
  username: string;
  displayName: string;
  content: string;
  timestamp: Date;
  avatar: string;
}

interface FeedProps {
  posts: Post[];
  isLoading?: boolean;
}

export const Feed = ({ posts, isLoading = false }: FeedProps) => {
  const navigate = useNavigate();

  const formatTimeAgo = (timestamp: Date) => {
    return formatDistanceToNow(timestamp, { addSuffix: true, locale: ptBR });
  };

  const handleTweetClick = (postId: number) => {
    navigate(`/tweet/${postId}`);
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-slate-800 mb-4">Feed Principal</h2>
      
      {isLoading ? (
        <Card className="p-8 text-center bg-white/60 backdrop-blur-sm">
          <div className="text-4xl mb-4">⏳</div>
          <h3 className="text-lg font-medium text-slate-600 mb-2">Carregando posts...</h3>
          <p className="text-slate-500">Buscando as últimas atualizações</p>
        </Card>
      ) : posts.length === 0 ? (
        <Card className="p-8 text-center bg-white/60 backdrop-blur-sm">
          <div className="text-4xl mb-4">📝</div>
          <h3 className="text-lg font-medium text-slate-600 mb-2">Nenhum post ainda</h3>
          <p className="text-slate-500">Seja o primeiro a compartilhar algo interessante!</p>
        </Card>
      ) : (
        posts.map((post) => (
          <Card 
            key={post.id} 
            className="p-6 bg-white/60 backdrop-blur-sm border-slate-200 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer"
            onClick={() => handleTweetClick(post.id)}
          >
            <div className="flex space-x-4">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-green-400 rounded-full flex items-center justify-center">
                  <span className="text-xl">{post.avatar}</span>
                </div>
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2 mb-2">
                  <h3 className="font-semibold text-slate-900 truncate">
                    {post.displayName}
                  </h3>
                  <span className="text-slate-500">@{post.username}</span>
                  <span className="text-slate-400">•</span>
                  <span className="text-slate-500 text-sm">
                    {formatTimeAgo(post.timestamp)}
                  </span>
                </div>
                
                <p className="text-slate-800 text-base leading-relaxed whitespace-pre-wrap">
                  {post.content}
                </p>
                
                <div className="flex items-center space-x-6 mt-4 text-slate-500">
                  <button 
                    className="flex items-center space-x-2 hover:text-blue-600 transition-colors duration-200"
                    onClick={(e) => {
                      e.stopPropagation();
                      // TODO: Implementar resposta
                    }}
                  >
                    <span className="text-lg">💬</span>
                    <span className="text-sm">Responder</span>
                  </button>
                  
                  <button 
                    className="flex items-center space-x-2 hover:text-green-600 transition-colors duration-200"
                    onClick={(e) => {
                      e.stopPropagation();
                      // TODO: Implementar compartilhamento
                    }}
                  >
                    <span className="text-lg">🔄</span>
                    <span className="text-sm">Compartilhar</span>
                  </button>
                  
                  <button 
                    className="flex items-center space-x-2 hover:text-red-500 transition-colors duration-200"
                    onClick={(e) => {
                      e.stopPropagation();
                      // TODO: Implementar curtir
                    }}
                  >
                    <span className="text-lg">❤️</span>
                    <span className="text-sm">Curtir</span>
                  </button>

                  <button className="flex items-center gap-2 text-slate-500 hover:text-blue-500 transition-colors">
                    <MessageCircle size={18} />
                    <span className="text-sm">{post.comments?.[0]?.count ?? 0}</span>
                  </button>
                </div>
              </div>
            </div>
          </Card>
        ))
      )}
    </div>
  );
};
