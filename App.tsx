
import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { Employee, Evaluation, View } from './types';
import LoginScreen from './components/LoginScreen';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import DashboardView from './components/DashboardView';
import TeamView from './components/TeamView';
import EvaluationView from './components/EvaluationView';
import AdminView from './components/AdminView';
import { db } from './firebase';

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [currentUser, setCurrentUser] = useState<{ name: string; email: string; area: string; isAdmin: boolean; } | null>(null);
  const [view, setView] = useState<View>('dashboard');

  const [employees, setEmployees] = useState<Employee[]>([]);
  const [evaluations, setEvaluations] = useState<Evaluation[]>([]);
  const [loading, setLoading] = useState(true);


  useEffect(() => {
    // Fetch initial data from Firebase
    const employeesRef = db.ref('employees');
    const evaluationsRef = db.ref('evaluations');
    
    const onEmployeesValueChange = employeesRef.on('value', (snapshot) => {
        const data = snapshot.val();
        setEmployees(data ? Object.values(data) : []);
        setLoading(false);
    }, (error) => {
        console.error("Firebase read failed: " + error.message);
        setLoading(false);
    });

    const onEvaluationsValueChange = evaluationsRef.on('value', (snapshot) => {
        const data = snapshot.val();
        setEvaluations(data ? Object.values(data) : []);
    });

    // Detach listeners on unmount
    return () => {
        employeesRef.off('value', onEmployeesValueChange);
        evaluationsRef.off('value', onEvaluationsValueChange);
    };
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
    const newIdRef = db.ref('employees').push();
    const newId = newIdRef.key;
    if (!newId) return;

    const newEmployee: Employee = {
        ...employee,
        id: Number(new Date().getTime()), // Using timestamp for a simple unique ID
        avatar: `https://i.pravatar.cc/150?u=${newId}`
    };
    db.ref(`employees/${newEmployee.id}`).set(newEmployee);
  }, []);

  const updateEmployee = useCallback((updatedEmployee: Employee) => {
    db.ref(`employees/${updatedEmployee.id}`).update(updatedEmployee);
  }, []);

  const deleteEmployee = useCallback((employeeId: number) => {
    db.ref(`employees/${employeeId}`).remove();
    // Also remove evaluations for that employee
    db.ref('evaluations').orderByChild('employeeId').equalTo(employeeId).once('value', snapshot => {
        snapshot.forEach(childSnapshot => {
            childSnapshot.ref.remove();
        });
    });
  }, []);

  const addEvaluation = useCallback((evaluation: Omit<Evaluation, 'id' | 'date'>) => {
    const newIdRef = db.ref('evaluations').push();
    const newId = newIdRef.key;
    if (!newId) return;

    const newEvaluation: Evaluation = {
        ...evaluation,
        id: Number(new Date().getTime()),
        date: new Date().toISOString().split('T')[0]
    };
    db.ref(`evaluations/${newEvaluation.id}`).set(newEvaluation);
  }, []);
  
  const visibleEmployees = useMemo(() => {
    if (!currentUser) return [];

    const isManagerialView = view === 'dashboard' || view === 'team' || view === 'evaluate';
    
    if (currentUser.isAdmin && isManagerialView) {
        return employees.filter(employee => employee.department === currentUser.area);
    }

    if (!currentUser.isAdmin) {
        return employees.filter(employee => employee.department === currentUser.area);
    }
    
    return employees;
  }, [employees, currentUser, view]);

  const visibleEvaluations = useMemo(() => {
    if (!currentUser) return [];

    const visibleEmployeeIds = new Set(visibleEmployees.map(e => e.id));
    return evaluations.filter(evaluation => visibleEmployeeIds.has(evaluation.employeeId));
  }, [evaluations, visibleEmployees]);

  if (loading && !isAuthenticated) {
    // Don't show login until we have a db connection state
     return <LoginScreen onLogin={handleLogin} />;
  }

  if (!isAuthenticated) {
    return <LoginScreen onLogin={handleLogin} />;
  }
  
  if (loading) {
    return (
        <div className="flex h-screen w-full items-center justify-center bg-slate-100">
            <div className="flex items-center space-x-2">
                <div className="w-4 h-4 rounded-full bg-blue-600 animate-pulse"></div>
                <div className="w-4 h-4 rounded-full bg-blue-600 animate-pulse [animation-delay:0.2s]"></div>
                <div className="w-4 h-4 rounded-full bg-blue-600 animate-pulse [animation-delay:0.4s]"></div>
                <span className="text-slate-600">Conectando a la base de datos...</span>
            </div>
        </div>
    );
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