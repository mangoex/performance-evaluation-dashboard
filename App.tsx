
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
import { onSnapshot, Unsubscribe } from 'firebase/firestore';


const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [currentUser, setCurrentUser] = useState<{ name: string; email: string; department: string; isAdmin: boolean } | null>(null);
  const [view, setView] = useState<View>('dashboard');
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [evaluations, setEvaluations] = useState<Evaluation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) {
        setEmployees([]);
        setEvaluations([]);
        setLoading(false);
        return;
    }

    setLoading(true);

    const unsubscribeEmployees: Unsubscribe = onSnapshot(db.employeesCollection, (snapshot) => {
        const employeesData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Employee));
        setEmployees(employeesData);
        setLoading(false);
    }, (error) => {
        console.error("Error al obtener empleados:", error);
        setLoading(false);
    });
    
    const unsubscribeEvaluations: Unsubscribe = onSnapshot(db.evaluationsCollection, (snapshot) => {
        const evaluationsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Evaluation));
        setEvaluations(evaluationsData);
        setLoading(false);
    }, (error) => {
        console.error("Error al obtener evaluaciones:", error);
        setLoading(false);
    });


    // Función de limpieza para cancelar las suscripciones al desmontar el componente o al cerrar sesión
    return () => {
        unsubscribeEmployees();
        unsubscribeEvaluations();
    };
}, [isAuthenticated]);


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
  }, []);

  const updateEmployee = useCallback(async (updatedEmployee: Employee) => {
    await db.updateEmployee(updatedEmployee);
  }, []);

  const deleteEmployee = useCallback(async (employeeId: string) => {
    await db.deleteEmployee(employeeId);
  }, []);

  const addEvaluation = useCallback(async (evaluation: Omit<Evaluation, 'id' | 'date'>) => {
    await db.addEvaluation(evaluation);
  }, []);

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
    if (loading && isAuthenticated) {
      return <div className="flex items-center justify-center h-full"><p>Conectando con la base de datos...</p></div>;
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
