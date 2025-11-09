import React from 'react';
import { View } from '../types';
import { BarChart2, Users, FileText, Briefcase, Shield } from 'lucide-react';

interface SidebarProps {
  currentView: View;
  setView: (view: View) => void;
  isAdmin: boolean;
}

const NavItem: React.FC<{
  icon: React.ElementType;
  label: string;
  isActive: boolean;
  onClick: () => void;
}> = ({ icon: Icon, label, isActive, onClick }) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center p-3 rounded-lg transition-colors duration-200 ${
      isActive
        ? 'bg-blue-600 text-white'
        : 'text-slate-600 hover:bg-slate-200 hover:text-slate-800'
    }`}
  >
    <Icon className="h-5 w-5 mr-3" />
    <span className="font-medium">{label}</span>
  </button>
);

const Sidebar: React.FC<SidebarProps> = ({ currentView, setView, isAdmin }) => {
  return (
    <aside className="w-64 bg-white shadow-lg flex-shrink-0 hidden md:flex flex-col p-4">
      <div className="flex items-center mb-8 p-3">
         <Briefcase className="h-8 w-8 text-blue-600" />
         <h1 className="ml-3 text-xl font-bold text-slate-800">PerformanceApp</h1>
      </div>
      <nav className="flex flex-col space-y-2">
        <NavItem
          icon={BarChart2}
          label="Dashboard"
          isActive={currentView === 'dashboard'}
          onClick={() => setView('dashboard')}
        />
        <NavItem
          icon={Users}
          label="Mi Equipo"
          isActive={currentView === 'team'}
          onClick={() => setView('team')}
        />
        <NavItem
          icon={FileText}
          label="Evaluar"
          isActive={currentView === 'evaluate'}
          onClick={() => setView('evaluate')}
        />
        {isAdmin && (
            <NavItem
                icon={Shield}
                label="Admin"
                isActive={currentView === 'admin'}
                onClick={() => setView('admin')}
            />
        )}
      </nav>
      <div className="mt-auto p-3 text-center text-slate-500 text-xs">
        <p>&copy; 2024 PerformanceApp</p>
        <p>Creado para mejores equipos.</p>
      </div>
    </aside>
  );
};

export default Sidebar;