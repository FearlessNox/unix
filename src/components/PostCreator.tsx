
import { useState } from 'react';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { Card } from './ui/card';

interface PostCreatorProps {
  onCreatePost: (content: string) => void;
  currentUser: any;
}

export const PostCreator = ({ onCreatePost, currentUser }: PostCreatorProps) => {
  const [content, setContent] = useState('');
  const maxLength = 280;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (content.trim() && content.length <= maxLength) {
      onCreatePost(content.trim());
      setContent('');
    }
  };

  const remainingChars = maxLength - content.length;
  const isOverLimit = remainingChars < 0;

  return (
    <Card className="p-6 mb-6 bg-white/60 backdrop-blur-sm border-slate-200 shadow-sm">
      <form onSubmit={handleSubmit}>
        <div className="flex space-x-4">
          <div className="flex-shrink-0">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-green-400 rounded-full flex items-center justify-center">
              <span className="text-xl">{currentUser?.avatar}</span>
            </div>
          </div>
          
          <div className="flex-1">
            <Textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="O que está acontecendo?"
              className="border-none resize-none text-lg placeholder:text-slate-400 focus:ring-0 p-0 min-h-[120px]"
              maxLength={maxLength + 50} // Allow typing beyond limit for better UX
            />
            
            <div className="flex items-center justify-between mt-4">
              <div className={`text-sm ${isOverLimit ? 'text-red-500' : remainingChars <= 20 ? 'text-yellow-600' : 'text-slate-500'}`}>
                {remainingChars} caracteres restantes
              </div>
              
              <Button
                type="submit"
                disabled={!content.trim() || isOverLimit}
                className="bg-gradient-to-r from-blue-600 to-green-500 hover:from-blue-700 hover:to-green-600 disabled:opacity-50"
              >
                Publicar
              </Button>
            </div>
          </div>
        </div>
      </form>
    </Card>
  );
};
