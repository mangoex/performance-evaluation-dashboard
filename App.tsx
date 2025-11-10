

import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { Employee, Evaluation, View } from './types';
import LoginScreen from './components/LoginScreen';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import DashboardView from './components/DashboardView';
import TeamView from './components/TeamView';
import EvaluationView from './components/EvaluationView';
import AdminView from './components/AdminView';
import Alert from './components/ui/Alert';
import Spinner from './components/ui/Spinner';
import * as db from './database';
import { onSnapshot, Unsubscribe } from 'firebase/firestore';


const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [currentUser, setCurrentUser] = useState<{ name: string; email: string; department: string; isAdmin: boolean } | null>(null);
  const [view, setView] = useState<View>('dashboard');
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [evaluations, setEvaluations] = useState<Evaluation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryAttempt, setRetryAttempt] = useState(0);

  const handleRetry = () => {
    setError(null);
    setRetryAttempt(prev => prev + 1); // Dispara el useEffect para reintentar
  };

  useEffect(() => {
    if (!isAuthenticated) {
        setEmployees([]);
        setEvaluations([]);
        setLoading(false); 
        setError(null);
        return;
    }

    setLoading(true);
    setError(null);

    const connectionTimeout = setTimeout(() => {
        if (loading) { // Solo muestra el error si sigue cargando
            setLoading(false);
            setError("La conexión con la base de datos está tardando demasiado. Posibles causas:\n1. Credenciales incorrectas en 'firebaseConfig.ts'.\n2. Reglas de seguridad de Firestore bloqueando el acceso.\n3. Problemas de conexión a internet.");
        }
    }, 15000);

    let initialLoad = { employees: false, evaluations: false };
    let unsubscribes: Unsubscribe[] = [];

    const checkInitialLoadComplete = () => {
        if (initialLoad.employees && initialLoad.evaluations) {
            clearTimeout(connectionTimeout);
            setLoading(false);
        }
    };
    
    const errorHandler = (err: Error) => {
        clearTimeout(connectionTimeout);
        console.error("Error de Firestore:", err);
        setError("No se pudo conectar a la base de datos. Revisa la configuración en 'firebaseConfig.ts' y las reglas de seguridad de tu proyecto en la consola de Firebase.");
        setLoading(false);
        // Limpia suscripciones existentes en caso de error para evitar fugas de memoria.
        unsubscribes.forEach(unsub => unsub());
    };

    const unsubscribeEmployees = onSnapshot(db.employeesCollection, (snapshot) => {
        if (!initialLoad.employees) {
            initialLoad.employees = true;
            checkInitialLoadComplete();
        }
        const employeesData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Employee));
        setEmployees(employeesData);
    }, errorHandler);
    
    const unsubscribeEvaluations = onSnapshot(db.evaluationsCollection, (snapshot) => {
        if (!initialLoad.evaluations) {
            initialLoad.evaluations = true;
            checkInitialLoadComplete();
        }
        const evaluationsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Evaluation));
        setEvaluations(evaluationsData);
    }, errorHandler);
    
    unsubscribes = [unsubscribeEmployees, unsubscribeEvaluations];

    return () => {
        clearTimeout(connectionTimeout);
        unsubscribes.forEach(unsub => unsub());
    };
}, [isAuthenticated, retryAttempt]);


  const handleLogin = (name: string, email: string, department: string, isAdmin: boolean) => {
    setCurrentUser({ name, email, department, isAdmin });
    setIsAuthenticated(true);
    setError(null);
    setRetryAttempt(0); // Resetea el contador de reintentos al iniciar sesión
    if (!isAdmin && view === 'admin') {
      setView('dashboard');
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setIsAuthenticated(false);
    setError(null);
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
        return currentUser?.isAdmin ? <AdminView employees={employees} evaluations={evaluations} /> : <DashboardView employees={employees} evaluations={evaluations} currentUser={currentUser} setView={setView} />;
      default:
        return <DashboardView employees={employees} evaluations={evaluations} currentUser={currentUser} setView={setView} />;
    }
  }, [view, employees, evaluations, currentUser, addEmployee, updateEmployee, deleteEmployee, addEvaluation]);

  const renderContent = () => {
    if (loading && isAuthenticated) {
      return (
        <div className="flex flex-col items-center justify-center h-full text-center">
          <Spinner />
          <p className="text-slate-600 mt-4 text-lg font-medium">Conectando con la base de datos...</p>
          <p className="text-sm text-slate-500 mt-1">Asegurando la información de tu equipo.</p>
        </div>
      );
    }
    if (error) {
      return <Alert title="Error de Conexión" message={error} onRetry={handleRetry} />;
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