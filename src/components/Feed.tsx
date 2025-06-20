
import { Card } from './ui/card';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

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
}

export const Feed = ({ posts }: FeedProps) => {
  const formatTimeAgo = (timestamp: Date) => {
    return formatDistanceToNow(timestamp, { addSuffix: true, locale: ptBR });
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-slate-800 mb-4">Feed Principal</h2>
      
      {posts.length === 0 ? (
        <Card className="p-8 text-center bg-white/60 backdrop-blur-sm">
          <div className="text-4xl mb-4">📝</div>
          <h3 className="text-lg font-medium text-slate-600 mb-2">Nenhum post ainda</h3>
          <p className="text-slate-500">Seja o primeiro a compartilhar algo interessante!</p>
        </Card>
      ) : (
        posts.map((post) => (
          <Card key={post.id} className="p-6 bg-white/60 backdrop-blur-sm border-slate-200 shadow-sm hover:shadow-md transition-all duration-200">
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
                  <button className="flex items-center space-x-2 hover:text-blue-600 transition-colors duration-200">
                    <span className="text-lg">💬</span>
                    <span className="text-sm">Responder</span>
                  </button>
                  
                  <button className="flex items-center space-x-2 hover:text-green-600 transition-colors duration-200">
                    <span className="text-lg">🔄</span>
                    <span className="text-sm">Compartilhar</span>
                  </button>
                  
                  <button className="flex items-center space-x-2 hover:text-red-500 transition-colors duration-200">
                    <span className="text-lg">❤️</span>
                    <span className="text-sm">Curtir</span>
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
