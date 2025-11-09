import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { INITIAL_EMPLOYEES, INITIAL_EVALUATIONS } from './constants';
import { Employee, Evaluation, View } from './types';
import LoginScreen from './components/LoginScreen';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import DashboardView from './components/DashboardView';
import TeamView from './components/TeamView';
import EvaluationView from './components/EvaluationView';
import AdminView from './components/AdminView';

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [currentUser, setCurrentUser] = useState<{ name: string; email: string; area: string; isAdmin: boolean; } | null>(null);
  const [view, setView] = useState<View>('dashboard');

  const [employees, setEmployees] = useState<Employee[]>(() => {
    try {
      const saved = localStorage.getItem('employees');
      return saved ? JSON.parse(saved) : INITIAL_EMPLOYEES;
    } catch (e) {
      console.error('Could not load employees from local storage', e);
      return INITIAL_EMPLOYEES;
    }
  });
  const [evaluations, setEvaluations] = useState<Evaluation[]>(() => {
    try {
      const saved = localStorage.getItem('evaluations');
      return saved ? JSON.parse(saved) : INITIAL_EVALUATIONS;
    } catch (e) {
      console.error('Could not load evaluations from local storage', e);
      return INITIAL_EVALUATIONS;
    }
  });

  useEffect(() => {
    localStorage.setItem('employees', JSON.stringify(employees));
  }, [employees]);

  useEffect(() => {
    localStorage.setItem('evaluations', JSON.stringify(evaluations));
  }, [evaluations]);


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
    setEmployees(prev => {
        const newId = prev.length > 0 ? Math.max(...prev.map(e => e.id)) + 1 : 1;
        const newEmployee: Employee = { 
            ...employee, 
            id: newId, 
            avatar: `https://i.pravatar.cc/150?u=${newId}`
        };
        return [...prev, newEmployee];
    });
  }, []);

  const updateEmployee = useCallback((updatedEmployee: Employee) => {
    setEmployees(prev => prev.map(emp => emp.id === updatedEmployee.id ? updatedEmployee : emp));
  }, []);

  const deleteEmployee = useCallback((employeeId: number) => {
    setEmployees(prev => prev.filter(emp => emp.id !== employeeId));
    setEvaluations(prev => prev.filter(ev => ev.employeeId !== employeeId));
  }, []);

  const addEvaluation = useCallback((evaluation: Omit<Evaluation, 'id' | 'date'>) => {
    setEvaluations(prev => {
        const newId = prev.length > 0 ? Math.max(...prev.map(e => e.id)) + 1 : 1;
        const newEvaluation: Evaluation = {
            ...evaluation,
            id: newId,
            date: new Date().toISOString().split('T')[0]
        };
        return [...prev, newEvaluation];
    });
  }, []);
  
  const visibleEmployees = useMemo(() => {
    if (!currentUser) return [];

    const isManagerialView = view === 'dashboard' || view === 'team' || view === 'evaluate';
    
    // An admin on managerial views sees their own team.
    if (currentUser.isAdmin && isManagerialView) {
        return employees.filter(employee => employee.department === currentUser.area);
    }

    // A non-admin always sees their own team.
    if (!currentUser.isAdmin) {
        return employees.filter(employee => employee.department === currentUser.area);
    }
    
    // An admin on the admin view sees everyone (though this view gets data directly).
    return employees;
  }, [employees, currentUser, view]);

  const visibleEvaluations = useMemo(() => {
    if (!currentUser) return [];

    // Filter evaluations based on the already-correct visibleEmployees list.
    const visibleEmployeeIds = new Set(visibleEmployees.map(e => e.id));
    return evaluations.filter(evaluation => visibleEmployeeIds.has(evaluation.employeeId));
  }, [evaluations, visibleEmployees]);


  if (!isAuthenticated) {
    return <LoginScreen onLogin={handleLogin} />;
  }

  const renderView = () => {
    switch (view) {
      case 'dashboard':
        return <DashboardView employees={visibleEmployees} evaluations={visibleEvaluations} />;
      case 'team':
        return <TeamView 
            employees={visibleEmployees} 
            onAddEmployee={addEmployee} 
            onUpdateEmployee={updateEmployee} 
            onDeleteEmployee={deleteEmployee}
            currentUser={currentUser!}
        />;
      case 'evaluate':
        return <EvaluationView 
            employees={visibleEmployees} 
            evaluations={visibleEvaluations}
            onAddEvaluation={addEvaluation}
            currentUser={currentUser!}
        />;
      case 'admin':
        // Admin view always gets the full, unfiltered lists
        return currentUser?.isAdmin 
            ? <AdminView employees={employees} evaluations={evaluations} />
            : <DashboardView employees={visibleEmployees} evaluations={visibleEvaluations} />;
      default:
        return <DashboardView employees={visibleEmployees} evaluations={visibleEvaluations} />;
    }
  };

  return (
    <div className="flex h-screen bg-slate-100 font-sans">
      <Sidebar currentView={view} setView={setView} isAdmin={currentUser!.isAdmin} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header user={currentUser!} onLogout={handleLogout} />
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-slate-100 p-4 sm:p-6 lg:p-8">
          {renderView()}
        </main>
      </div>
    </div>
  );
};

export default App;
