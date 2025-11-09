import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { Employee, Evaluation, View } from './types';
import LoginScreen from './components/LoginScreen';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import DashboardView from './components/DashboardView';
import TeamView from './components/TeamView';
import EvaluationView from './components/EvaluationView';
import AdminView from './components/AdminView';

// Los datos de prueba se han eliminado para comenzar con un estado limpio para producción.

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [currentUser, setCurrentUser] = useState<{ name: string; email: string; department: string; isAdmin: boolean } | null>(null);
  const [view, setView] = useState<View>('dashboard');
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [evaluations, setEvaluations] = useState<Evaluation[]>([]);
  const [loading, setLoading] = useState(true);

  // Cargar estado inicial
  useEffect(() => {
    setLoading(false);
  }, []);

  const handleLogin = (name: string, email: string, department: string, isAdmin: boolean) => {
    setCurrentUser({ name, email, department, isAdmin });
    setIsAuthenticated(true);
    if (!isAdmin && view === 'admin') {
      setView('dashboard');
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setIsAuthenticated(false);
  };

  const addEmployee = useCallback((employee: Omit<Employee, 'id' | 'avatar'>) => {
    const newEmployee: Employee = {
      ...employee,
      id: crypto.randomUUID(),
      avatar: `https://i.pravatar.cc/150?u=${employee.email}`
    };
    setEmployees(prev => [...prev, newEmployee]);
  }, []);

  const updateEmployee = useCallback((updatedEmployee: Employee) => {
    setEmployees(prev => prev.map(e => e.id === updatedEmployee.id ? updatedEmployee : e));
  }, []);

  const deleteEmployee = useCallback((employeeId: string) => {
    setEmployees(prev => prev.filter(e => e.id !== employeeId));
  }, []);

  const addEvaluation = useCallback((evaluation: Omit<Evaluation, 'id' | 'date'>) => {
    const newEvaluation: Evaluation = {
      ...evaluation,
      id: crypto.randomUUID(),
      date: new Date().toISOString(),
    };
    setEvaluations(prev => [...prev, newEvaluation]);
  }, []);

  const updateEvaluation = useCallback((updatedEvaluation: Evaluation) => {
    setEvaluations(prev => prev.map(e => e.id === updatedEvaluation.id ? updatedEvaluation : e));
  }, []);

  const deleteEvaluation = useCallback((evaluationId: string) => {
    setEvaluations(prev => prev.filter(e => e.id !== evaluationId));
  }, []);

  const currentView = useMemo(() => {
    if (!isAuthenticated) {
      return <LoginScreen onLogin={handleLogin} />;
    }

    switch (view) {
      case 'team':
        return <TeamView 
                  employees={employees} 
                  onAddEmployee={addEmployee} 
                  onUpdateEmployee={updateEmployee} 
                  onDeleteEmployee={deleteEmployee} 
                  currentUser={currentUser} />;
      // FIX: Corrected typo from 'evaluation' to 'evaluate' to match the View type.
      case 'evaluate':
        return <EvaluationView 
                  employees={employees} 
                  evaluations={evaluations} 
                  currentUser={currentUser} 
                  onAddEvaluation={addEvaluation} />;
      case 'admin':
        return currentUser?.isAdmin ? <AdminView employees={employees} evaluations={evaluations} /> : <DashboardView employees={employees} evaluations={evaluations} currentUser={currentUser} />;
      default:
        return <DashboardView employees={employees} evaluations={evaluations} currentUser={currentUser} />;
    }
  }, [view, isAuthenticated, employees, evaluations, currentUser, addEmployee, updateEmployee, deleteEmployee, addEvaluation]);

  return (
    <div className="flex h-screen bg-gray-50">
      {isAuthenticated && <Sidebar currentView={view} setView={setView} isAdmin={currentUser?.isAdmin ?? false} />}
      <div className="flex-1 flex flex-col">
        {isAuthenticated && <Header user={currentUser} onLogout={handleLogout} />}
        <main className="flex-1 overflow-auto p-6">
          {loading ? <div className="flex items-center justify-center h-full"><p>Loading...</p></div> : currentView}
        </main>
      </div>
    </div>
  );
};

export default App;