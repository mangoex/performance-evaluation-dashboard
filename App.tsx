
import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { Employee, Evaluation, View } from './types';
import LoginScreen from './components/LoginScreen';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import DashboardView from './components/DashboardView';
import TeamView from './components/TeamView';
import EvaluationView from './components/EvaluationView';
import AdminView from './components/AdminView';
import * as db from './database';

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [currentUser, setCurrentUser] = useState<{ name: string; email: string; department: string; isAdmin: boolean } | null>(null);
  const [view, setView] = useState<View>('dashboard');
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [evaluations, setEvaluations] = useState<Evaluation[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    const [employeesData, evaluationsData] = await Promise.all([
      db.getEmployees(),
      db.getEvaluations()
    ]);
    setEmployees(employeesData);
    setEvaluations(evaluationsData);
    setLoading(false);
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      fetchData();
    } else {
      // Limpiar estado al cerrar sesión
      setEmployees([]);
      setEvaluations([]);
      setLoading(false);
    }
  }, [isAuthenticated, fetchData]);

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

  const addEmployee = useCallback(async (employee: Omit<Employee, 'id' | 'avatar'>) => {
    await db.addEmployee(employee);
    fetchData(); // Recargar datos para reflejar el cambio
  }, [fetchData]);

  const updateEmployee = useCallback(async (updatedEmployee: Employee) => {
    await db.updateEmployee(updatedEmployee);
    fetchData();
  }, [fetchData]);

  const deleteEmployee = useCallback(async (employeeId: string) => {
    await db.deleteEmployee(employeeId);
    fetchData();
  }, [fetchData]);

  const addEvaluation = useCallback(async (evaluation: Omit<Evaluation, 'id' | 'date'>) => {
    await db.addEvaluation(evaluation);
    fetchData();
  }, [fetchData]);

  const currentView = useMemo(() => {
    switch (view) {
      case 'team':
        return <TeamView 
                  employees={employees} 
                  onAddEmployee={addEmployee} 
                  onUpdateEmployee={updateEmployee} 
                  onDeleteEmployee={deleteEmployee} 
                  currentUser={currentUser!} />;
      case 'evaluate':
        return <EvaluationView 
                  employees={employees} 
                  evaluations={evaluations} 
                  currentUser={currentUser!} 
                  onAddEvaluation={addEvaluation} />;
      case 'admin':
        return currentUser?.isAdmin ? <AdminView employees={employees} evaluations={evaluations} /> : <DashboardView employees={employees} evaluations={evaluations} currentUser={currentUser} />;
      default:
        return <DashboardView employees={employees} evaluations={evaluations} currentUser={currentUser} />;
    }
  }, [view, employees, evaluations, currentUser, addEmployee, updateEmployee, deleteEmployee, addEvaluation]);

  const renderContent = () => {
    if (loading) {
      return <div className="flex items-center justify-center h-full"><p>Cargando datos locales...</p></div>;
    }
    return currentView;
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {isAuthenticated && <Sidebar currentView={view} setView={setView} isAdmin={currentUser?.isAdmin ?? false} />}
      <div className="flex-1 flex flex-col">
        {isAuthenticated && <Header user={currentUser} onLogout={handleLogout} />}
        <main className="flex-1 overflow-auto p-6">
          {isAuthenticated ? renderContent() : <LoginScreen onLogin={handleLogin} />}
        </main>
      </div>
    </div>
  );
};

export default App;