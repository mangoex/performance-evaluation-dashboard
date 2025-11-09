import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { Employee, Evaluation, View } from './types';
import LoginScreen from './components/LoginScreen';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import DashboardView from './components/DashboardView';
import TeamView from './components/TeamView';
import EvaluationView from './components/EvaluationView';
import AdminView from './components/AdminView';

// Mock initial data - replacing Firebase functionality
const MOCK_EMPLOYEES: Employee[] = [
  {
    id: 1,
    name: 'Juan Pérez',
    email: 'juan.perez@company.com',
    area: 'Engineering',
    position: 'Senior Developer',
    avatar: 'https://i.pravatar.cc/150?u=juan'
  },
  {
    id: 2,
    name: 'María García',
    email: 'maria.garcia@company.com',
    area: 'Product',
    position: 'Product Manager',
    avatar: 'https://i.pravatar.cc/150?u=maria'
  },
  {
    id: 3,
    name: 'Carlos López',
    email: 'carlos.lopez@company.com',
    area: 'Design',
    position: 'UX Designer',
    avatar: 'https://i.pravatar.cc/150?u=carlos'
  },
];

const MOCK_EVALUATIONS: Evaluation[] = [
  {
    id: 1,
    employeeId: 1,
    evaluatorId: 2,
    score: 4.5,
    comments: 'Excellent technical skills',
    date: '2024-01-15'
  },
  {
    id: 2,
    employeeId: 2,
    evaluatorId: 1,
    score: 4.2,
    comments: 'Great leadership',
    date: '2024-01-15'
  },
];

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [currentUser, setCurrentUser] = useState<{ name: string; email: string; area: string; isAdmin: boolean } | null>(null);
  const [view, setView] = useState<View>('dashboard');
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [evaluations, setEvaluations] = useState<Evaluation[]>([]);
  const [loading, setLoading] = useState(true);

  // Load mock data on component mount
  useEffect(() => {
    // Simulate loading delay
    setTimeout(() => {
      setEmployees(MOCK_EMPLOYEES);
      setEvaluations(MOCK_EVALUATIONS);
      setLoading(false);
    }, 500);
  }, []);

  const handleLogin = (name: string, email: string, area: string, isAdmin: boolean) => {
    setCurrentUser({ name, email, area, isAdmin });
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
      id: Math.max(...employees.map(e => e.id), 0) + 1,
      avatar: `https://i.pravatar.cc/150?u=${employee.email}`
    };
    setEmployees([...employees, newEmployee]);
  }, [employees]);

  const updateEmployee = useCallback((updatedEmployee: Employee) => {
    setEmployees(employees.map(e => e.id === updatedEmployee.id ? updatedEmployee : e));
  }, [employees]);

  const deleteEmployee = useCallback((employeeId: number) => {
    setEmployees(employees.filter(e => e.id !== employeeId));
  }, [employees]);

  const addEvaluation = useCallback((evaluation: Omit<Evaluation, 'id'>) => {
    const newEvaluation: Evaluation = {
      ...evaluation,
      id: Math.max(...evaluations.map(e => e.id), 0) + 1
    };
    setEvaluations([...evaluations, newEvaluation]);
  }, [evaluations]);

  const updateEvaluation = useCallback((updatedEvaluation: Evaluation) => {
    setEvaluations(evaluations.map(e => e.id === updatedEvaluation.id ? updatedEvaluation : e));
  }, [evaluations]);

  const deleteEvaluation = useCallback((evaluationId: number) => {
    setEvaluations(evaluations.filter(e => e.id !== evaluationId));
  }, [evaluations]);

  const currentView = useMemo(() => {
    if (!isAuthenticated) {
      return <LoginScreen onLogin={handleLogin} />;
    }

    switch (view) {
      case 'team':
        return <TeamView employees={employees} onUpdateEmployee={updateEmployee} onDeleteEmployee={deleteEmployee} />;
      case 'evaluation':
        return <EvaluationView employees={employees} evaluations={evaluations} currentUser={currentUser} onAddEvaluation={addEvaluation} onUpdateEvaluation={updateEvaluation} onDeleteEvaluation={deleteEvaluation} />;
      case 'admin':
        return currentUser?.isAdmin ? <AdminView employees={employees} evaluations={evaluations} onAddEmployee={addEmployee} onUpdateEmployee={updateEmployee} onDeleteEmployee={deleteEmployee} /> : <DashboardView employees={employees} evaluations={evaluations} currentUser={currentUser} />;
      default:
        return <DashboardView employees={employees} evaluations={evaluations} currentUser={currentUser} />;
    }
  }, [view, isAuthenticated, employees, evaluations, currentUser, addEmployee, updateEmployee, deleteEmployee, addEvaluation, updateEvaluation, deleteEvaluation]);

  return (
    <div className="flex h-screen bg-gray-50">
      {isAuthenticated && <Sidebar view={view} onViewChange={setView} currentUser={currentUser} onLogout={handleLogout} />}
      <div className="flex-1 flex flex-col">
        {isAuthenticated && <Header currentUser={currentUser} />}
        <main className="flex-1 overflow-auto">
          {loading ? <div className="flex items-center justify-center h-full"><p>Loading...</p></div> : currentView}
        </main>
      </div>
    </div>
  );
};

export default App;