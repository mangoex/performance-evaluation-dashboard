
import React, { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import { Employee, Evaluation, View } from './types';
import LoginScreen from './components/LoginScreen';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import DashboardView from './components/DashboardView';
import TeamView from './components/TeamView';
import EvaluationView from './components/EvaluationView';
import AdminView from './components/AdminView';
import { supabase } from './database';
import type { RealtimeChannel } from '@supabase/supabase-js';
import Card from './components/ui/Card';
import Button from './components/ui/Button';
import { AlertTriangle } from 'lucide-react';

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [currentUser, setCurrentUser] = useState<{ name: string; email: string; department: string; isAdmin: boolean } | null>(null);
  const [view, setView] = useState<View>('dashboard');
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [evaluations, setEvaluations] = useState<Evaluation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const channels = useRef<RealtimeChannel[]>([]);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data: employeesData, error: employeesError } = await supabase
        .from('employees')
        .select('*')
        .order('name', { ascending: true });
        
      if (employeesError) throw employeesError;
      setEmployees((employeesData as Employee[]) || []);

      const { data: evaluationsData, error: evaluationsError } = await supabase
        .from('evaluations')
        .select('*')
        .order('date', { ascending: false });

      if (evaluationsError) throw evaluationsError;
      setEvaluations((evaluationsData as Evaluation[]) || []);

    } catch (err: any) {
      const errorMessage = err.message || 'Ocurrió un error desconocido al conectar con la base de datos.';
      console.error("Error detallado al obtener los datos:", err);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!isAuthenticated) {
      setEmployees([]);
      setEvaluations([]);
      channels.current.forEach(channel => supabase.removeChannel(channel));
      channels.current = [];
      setLoading(false);
      setError(null);
      return;
    }
    
    fetchData();

    const handleDbChanges = () => {
        console.log('Cambio detectado en la base de datos, actualizando datos.');
        // Nota: Una recarga completa puede causar un parpadeo. Se mantiene simple por ahora.
        fetchData(); 
    };
    
    const subscribeToTable = (table: 'employees' | 'evaluations') => {
        const channel = supabase
          .channel(`${table}-changes`)
          .on('postgres_changes', { event: '*', schema: 'public', table }, handleDbChanges)
          .subscribe((status, err) => {
              if (err) {
                  const subError = `Fallo en la conexión en tiempo real para '${table}'. La replicación podría estar desactivada en la base de datos.`;
                  console.error(`Error de suscripción a '${table}':`, err.message);
                  // Solo mostrar este error si no hay un error de carga de datos más crítico
                  setError(prevError => prevError || subError);
              }
          });
        return channel;
    };

    const employeeChannel = subscribeToTable('employees');
    const evaluationChannel = subscribeToTable('evaluations');
      
    channels.current = [employeeChannel, evaluationChannel];

    return () => {
      channels.current.forEach(channel => {
          supabase.removeChannel(channel).catch(console.error);
      });
    };
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
    try {
      const employeeData = {
        ...employee,
        avatar: `https://i.pravatar.cc/150?u=${employee.email}`
      };
      const { error } = await supabase.from('employees').insert([employeeData]);
      if (error) throw error;
    } catch (error) {
      console.error("Error al añadir empleado:", error);
    }
  }, []);

  const updateEmployee = useCallback(async (updatedEmployee: Employee) => {
    try {
      const { id, ...employeeData } = updatedEmployee;
      const { error } = await supabase.from('employees').update(employeeData).eq('id', id);
      if (error) throw error;
    } catch (error) {
      console.error("Error al actualizar empleado:", error);
    }
  }, []);

  const deleteEmployee = useCallback(async (employeeId: string) => {
    try {
      const { error: evalError } = await supabase.from('evaluations').delete().eq('employeeId', employeeId);
      if (evalError) throw evalError;

      const { error: empError } = await supabase.from('employees').delete().eq('id', employeeId);
      if (empError) throw empError;

    } catch (error) {
      console.error("Error al eliminar empleado y sus evaluaciones:", error);
    }
  }, []);

  const addEvaluation = useCallback(async (evaluation: Omit<Evaluation, 'id' | 'date'>) => {
    try {
      const evaluationData = {
        ...evaluation,
        date: new Date().toISOString(),
      };
      const { error } = await supabase.from('evaluations').insert([evaluationData]);
      if (error) throw error;
    } catch (error) {
      console.error("Error al añadir evaluación:", error);
    }
  }, []);

  const currentView = useMemo(() => {
    // La pantalla de login ahora se maneja fuera de este memo
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
        return <div className="flex items-center justify-center h-full"><p>Conectando a la base de datos...</p></div>;
    }
    if (error) {
        return (
            <div className="flex flex-col items-center justify-center h-full text-center p-4">
                <Card className="max-w-md bg-red-50 border border-red-200">
                    <div className="flex items-center text-red-700">
                        <AlertTriangle className="h-8 w-8 mr-4 flex-shrink-0"/>
                        <div>
                            <h3 className="text-lg font-bold">Error de Conexión</h3>
                            <p className="text-sm mt-1 text-left">{error}</p>
                        </div>
                    </div>
                    <Button onClick={fetchData} variant='primary' className="mt-6 w-full">
                        Reintentar Conexión
                    </Button>
                </Card>
            </div>
        );
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
