
import { Button } from './ui/button';
import { User, LogOut } from 'lucide-react';

interface HeaderProps {
  isLoggedIn: boolean;
  currentUser: any;
  onLogin: () => void;
  onRegister: () => void;
  onLogout: () => void;
}

export const Header = ({ isLoggedIn, currentUser, onLogin, onRegister, onLogout }: HeaderProps) => {
  return (
    <header className="bg-white/80 backdrop-blur-sm border-b border-slate-200 sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between max-w-6xl">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-green-500 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-lg">U</span>
          </div>
          <div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-green-500 bg-clip-text text-transparent">
              Unix
            </h1>
            <p className="text-xs text-slate-500">Microblog Platform</p>
          </div>
        </div>

        <nav className="flex items-center space-x-4">
          {isLoggedIn ? (
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 px-3 py-2 bg-slate-100 rounded-full">
                <span className="text-xl">{currentUser?.avatar}</span>
                <span className="font-medium text-slate-700">@{currentUser?.username}</span>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={onLogout}
                className="flex items-center space-x-2"
              >
                <LogOut size={16} />
                <span>Sair</span>
              </Button>
            </div>
          ) : (
            <div className="flex items-center space-x-3">
              <Button variant="outline" onClick={onLogin}>
                Entrar
              </Button>
              <Button onClick={onRegister} className="bg-gradient-to-r from-blue-600 to-green-500 hover:from-blue-700 hover:to-green-600">
                Cadastrar
              </Button>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
};
