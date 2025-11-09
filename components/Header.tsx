
import React from 'react';
import { LogOut } from 'lucide-react';
import Button from './ui/Button';

interface HeaderProps {
  user: { name: string; email: string; area: string };
  onLogout: () => void;
}

const Header: React.FC<HeaderProps> = ({ user, onLogout }) => {
  return (
    <header className="bg-white shadow-sm p-4 flex justify-between items-center flex-shrink-0">
      <div className="flex items-center">
        <h2 className="text-xl font-semibold text-slate-800">Bienvenido, {user.name}</h2>
        <span className="ml-4 text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded-full">{user.area}</span>
      </div>
      <div className="flex items-center gap-4">
        <div className="text-right hidden sm:block">
            <p className="font-medium text-slate-700">{user.name}</p>
            <p className="text-xs text-slate-500">{user.email}</p>
        </div>
        <Button onClick={onLogout} variant="secondary">
          <LogOut className="h-4 w-4" />
          <span className="hidden sm:inline">Cerrar Sesión</span>
        </Button>
      </div>
    </header>
  );
};

export default Header;
