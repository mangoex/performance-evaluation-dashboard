import React, { useMemo } from 'react';
import { Employee, Evaluation, View } from '../types';
import Card from './ui/Card';
import Button from './ui/Button';
import { PlusCircle } from 'lucide-react';
import { BarChart, PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';

interface DashboardViewProps {
  employees: Employee[];
  evaluations: Evaluation[];
  currentUser: { name: string; email: string; department: string } | null;
  setView: (view: View) => void;
}

const DashboardView: React.FC<DashboardViewProps> = ({ employees, evaluations, currentUser, setView }) => {
  const stats = useMemo(() => {
    if (!evaluations || !employees) return { totalEmployees: 0, totalEvaluations: 0, avgScore: 'N/A' };
    
    const totalEmployees = employees.length;
    const totalEvaluations = evaluations.length;
    const avgScore = totalEvaluations > 0
      ? (evaluations.reduce((sum: number, ev) => {
          const scores = Object.values(ev.scores);
          // FIX: The value `c` from `scores` can be of type `unknown` if the data from Firestore is not a clean number.
          // This causes a type error on `s + c`. Explicitly convert `c` to a number before the addition.
          const avg = scores.length > 0 ? scores.reduce((s, c) => s + (Number(c) || 0), 0) / scores.length : 0;
          return sum + avg;
        }, 0) / totalEvaluations).toFixed(2)
      : '0.00';

    return { totalEmployees, totalEvaluations, avgScore };
  }, [employees, evaluations]);

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold mb-6 text-slate-800">Dashboard</h1>
      
      {currentUser && (
        <div className="mb-8 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <p className="text-lg text-slate-800">Bienvenido de nuevo, <span className="font-semibold">{currentUser.name}</span>.</p>
          <p className="text-sm text-slate-600">Departamento: {currentUser.department}</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <div className="text-center">
            <h3 className="text-sm font-medium text-slate-600 mb-2">Total de Empleados</h3>
            <p className="text-4xl font-bold text-blue-600">{stats.totalEmployees}</p>
          </div>
        </Card>
        <Card>
          <div className="text-center">
            <h3 className="text-sm font-medium text-slate-600 mb-2">Total de Evaluaciones</h3>
            <p className="text-4xl font-bold text-green-600">{stats.totalEvaluations}</p>
          </div>
        </Card>
        <Card>
          <div className="text-center">
            <h3 className="text-sm font-medium text-slate-600 mb-2">Calificación Promedio</h3>
            <p className="text-4xl font-bold text-purple-600">{stats.avgScore}</p>
          </div>
        </Card>
      </div>

      {employees.length > 0 ? (
        <Card>
          <h2 className="text-xl font-semibold mb-4 text-slate-800">Empleados Recientes</h2>
          <div className="space-y-3">
            {employees.slice(0, 5).map((emp) => (
              <div key={emp.id} className="p-3 bg-slate-50 rounded-lg flex justify-between items-center transition-all hover:bg-slate-100">
                <div className="flex items-center">
                    <img src={emp.avatar} alt={emp.name} className="h-10 w-10 rounded-full mr-3" />
                    <div>
                        <p className="font-medium text-slate-800">{emp.name}</p>
                        <p className="text-sm text-slate-600">{emp.department}</p>
                    </div>
                </div>
                <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full font-medium">{emp.position}</span>
              </div>
            ))}
          </div>
        </Card>
      ) : (
        <Card className="text-center py-12">
          <h2 className="text-2xl font-bold text-slate-800 mb-2">¡Es hora de construir tu equipo!</h2>
          <p className="text-slate-600 max-w-md mx-auto mb-6">Añade tu primer colaborador para empezar a gestionar el desempeño y realizar evaluaciones.</p>
          <Button onClick={() => setView('team')}>
            <PlusCircle className="h-5 w-5 mr-2" />
            Añadir Colaborador
          </Button>
        </Card>
      )}
    </div>
  );
};

export default DashboardView;
