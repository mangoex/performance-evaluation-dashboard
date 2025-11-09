
import React, { useMemo } from 'react';
import { Employee, Evaluation, EvaluationCategory } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';
import Card from './ui/Card';
import { Star, Users, CheckCircle, TrendingUp } from 'lucide-react';

interface DashboardViewProps {
  employees: Employee[];
  evaluations: Evaluation[];
}

const getAverageScore = (scores: Evaluation['scores']) => {
  const scoreValues = Object.values(scores);
  return scoreValues.reduce((a, b) => a + b, 0) / scoreValues.length;
};

const DashboardView: React.FC<DashboardViewProps> = ({ employees, evaluations }) => {
  const teamAverage = useMemo(() => {
    if (evaluations.length === 0) return 0;
    const total = evaluations.reduce((sum, ev) => sum + getAverageScore(ev.scores), 0);
    return (total / evaluations.length).toFixed(1);
  }, [evaluations]);

  const topPerformer = useMemo(() => {
    if (evaluations.length === 0) return null;
    const employeeScores = employees.map(emp => {
      const empEvals = evaluations.filter(ev => ev.employeeId === emp.id);
      if (empEvals.length === 0) return { name: emp.name, avgScore: 0 };
      const totalScore = empEvals.reduce((sum, ev) => sum + getAverageScore(ev.scores), 0);
      return { name: emp.name, avgScore: totalScore / empEvals.length };
    });
    return employeeScores.reduce((top, current) => current.avgScore > top.avgScore ? current : top);
  }, [employees, evaluations]);

  const performanceByEmployee = useMemo(() => {
    return employees.map(employee => {
      const empEvals = evaluations.filter(ev => ev.employeeId === employee.id);
      const avgScore = empEvals.length > 0
        ? (empEvals.reduce((sum, ev) => sum + getAverageScore(ev.scores), 0) / empEvals.length)
        : 0;
      return { name: employee.name.split(' ')[0], score: parseFloat(avgScore.toFixed(1)) };
    });
  }, [employees, evaluations]);

  const performanceByCategory = useMemo(() => {
    const categoryTotals = Object.values(EvaluationCategory).reduce((acc, cat) => ({ ...acc, [cat]: { total: 0, count: 0 } }), {} as Record<string, { total: number; count: number; }>);
    evaluations.forEach(ev => {
      Object.entries(ev.scores).forEach(([cat, score]) => {
        if (categoryTotals[cat]) {
            // FIX: Cast `score` to `number` as `Object.entries` infers its value as `unknown`.
            categoryTotals[cat].total += score as number;
            categoryTotals[cat].count += 1;
        }
      });
    });
    return Object.entries(categoryTotals).map(([category, data]) => ({
      category,
      score: data.count > 0 ? parseFloat((data.total / data.count).toFixed(1)) : 0,
      fullMark: 5
    }));
  }, [evaluations]);
  
  const totalEvaluations = evaluations.length;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
            <div className="flex items-center">
                <div className="p-3 rounded-full bg-blue-100 text-blue-600">
                    <TrendingUp className="h-6 w-6" />
                </div>
                <div className="ml-4">
                    <p className="text-sm text-slate-500">Promedio del Equipo</p>
                    <p className="text-2xl font-bold text-slate-800">{teamAverage} / 5.0</p>
                </div>
            </div>
        </Card>
        <Card>
            <div className="flex items-center">
                <div className="p-3 rounded-full bg-green-100 text-green-600">
                    <Users className="h-6 w-6" />
                </div>
                <div className="ml-4">
                    <p className="text-sm text-slate-500">Tamaño del Equipo</p>
                    <p className="text-2xl font-bold text-slate-800">{employees.length}</p>
                </div>
            </div>
        </Card>
        <Card>
            <div className="flex items-center">
                <div className="p-3 rounded-full bg-yellow-100 text-yellow-600">
                    <Star className="h-6 w-6" />
                </div>
                <div className="ml-4">
                    <p className="text-sm text-slate-500">Mejor Desempeño</p>
                    <p className="text-2xl font-bold text-slate-800">{topPerformer?.name || 'N/A'}</p>
                </div>
            </div>
        </Card>
        <Card>
            <div className="flex items-center">
                <div className="p-3 rounded-full bg-indigo-100 text-indigo-600">
                    <CheckCircle className="h-6 w-6" />
                </div>
                <div className="ml-4">
                    <p className="text-sm text-slate-500">Evaluaciones Realizadas</p>
                    <p className="text-2xl font-bold text-slate-800">{totalEvaluations}</p>
                </div>
            </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <h3 className="text-lg font-semibold text-slate-800 mb-4">Desempeño por Colaborador</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={performanceByEmployee} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false}/>
              <XAxis dataKey="name" />
              <YAxis domain={[0, 5]} />
              <Tooltip cursor={{fill: 'rgba(230, 230, 250, 0.5)'}} />
              <Legend />
              <Bar dataKey="score" fill="#4f46e5" name="Puntuación Promedio" />
            </BarChart>
          </ResponsiveContainer>
        </Card>
        <Card>
          <h3 className="text-lg font-semibold text-slate-800 mb-4">Fortalezas y Debilidades del Equipo</h3>
          <ResponsiveContainer width="100%" height={300}>
            <RadarChart cx="50%" cy="50%" outerRadius="80%" data={performanceByCategory}>
              <PolarGrid />
              <PolarAngleAxis dataKey="category" />
              <PolarRadiusAxis angle={30} domain={[0, 5]} />
              <Radar name="Promedio del Equipo" dataKey="score" stroke="#2563eb" fill="#3b82f6" fillOpacity={0.6} />
              <Tooltip />
            </RadarChart>
          </ResponsiveContainer>
        </Card>
      </div>
    </div>
  );
};

export default DashboardView;