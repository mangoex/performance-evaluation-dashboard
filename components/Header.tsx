
import React from 'react';
import Button from './ui/Button';

interface HeaderProps {
  user: { name: string; email: string; department: string } | null;
  onLogout: () => void;
}

const Header: React.FC<HeaderProps> = ({ user, onLogout }) => {
  // Only render if user is authenticated
  if (!user) {
    return null;
  }

  return (
    <header className="bg-white shadow-sm p-4 flex justify-between items-center border-b">
      <div className="flex items-center gap-4">
        <div>
          <h2 className="text-xl font-semibold text-slate-800">Bienvenido, {user.name}</h2>
          <p className="text-sm text-slate-500">{user.department}</p>
        </div>
      </div>
      <div className="flex items-center gap-4">
        <div className="text-right hidden sm:block">
          <p className="font-medium text-slate-700">{user.name}</p>
          <p className="text-xs text-slate-500">{user.email}</p>
        </div>
        <Button onClick={onLogout} variant="secondary">
          <span>Cerrar Sesión</span>
        </Button>
      </div>
    </header>
  );
};

export default Header;
