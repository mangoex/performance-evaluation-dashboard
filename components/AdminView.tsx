
import React, { useState, useMemo } from 'react';
import { Employee, Evaluation, EvaluationCategory, EvaluationScores } from '../types';
import Card from './ui/Card';
import Button from './ui/Button';
import { RadarChart, PolarGrid, PolarAngleAxis, Tooltip, Radar, ResponsiveContainer } from 'recharts';
import { Users, FileText, BarChart, UserCheck, Eye, X } from 'lucide-react';

interface AdminViewProps {
  employees: Employee[];
  evaluations: Evaluation[];
}

type CombinedEvaluationData = Evaluation & {
    employeeName: string;
    employeePosition: string;
    employeeDepartment: string;
    employeeAvatar: string;
    avgScore: number;
};

const getAverageScore = (scores: EvaluationScores) => {
  const scoreValues = Object.values(scores);
  return parseFloat((scoreValues.reduce((a, b) => a + b, 0) / scoreValues.length).toFixed(1));
};

const EvaluationDetailModal: React.FC<{ evaluation: CombinedEvaluationData, onClose: () => void }> = ({ evaluation, onClose }) => {
    const performanceByCategory = useMemo(() => {
        return Object.entries(evaluation.scores).map(([category, score]) => ({
            category,
            score: score as number,
            fullMark: 5
        }));
    }, [evaluation.scores]);

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center p-4" onClick={onClose}>
            <Card className="w-full max-w-2xl" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-bold text-slate-800">Detalles de Evaluación</h3>
                    <Button variant="secondary" onClick={onClose} className="!p-2"><X className="h-5 w-5"/></Button>
                </div>
                <div className="flex items-start space-x-4 mb-6">
                    <img src={evaluation.employeeAvatar} alt={evaluation.employeeName} className="h-20 w-20 rounded-full" />
                    <div>
                        <h4 className="text-lg font-semibold">{evaluation.employeeName}</h4>
                        <p className="text-slate-500">{evaluation.employeePosition}</p>
                        <p className="text-sm text-slate-500">{evaluation.employeeDepartment}</p>
                        <p className="text-sm font-medium mt-1">Periodo: <span className="font-normal">{evaluation.period}</span></p>
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <h5 className="font-semibold mb-2">Comentarios del Evaluador:</h5>
                        <div className="bg-slate-50 p-3 rounded-lg border h-32 overflow-y-auto">
                            <p className="text-sm text-slate-700">{evaluation.comments}</p>
                        </div>
                        <div className="text-sm mt-4">
                            <p><span className="font-semibold">Evaluador:</span> {evaluation.evaluator}</p>
                            <p><span className="font-semibold">Fecha:</span> {new Date(evaluation.date).toLocaleDateString()}</p>
                            <p><span className="font-semibold">Puntuación Promedio:</span> <span className="text-blue-600 font-bold">{evaluation.avgScore}</span> / 5.0</p>
                        </div>
                    </div>
                    <div>
                        <h5 className="font-semibold mb-2 text-center">Desglose de Puntuación</h5>
                        <ResponsiveContainer width="100%" height={250}>
                            <RadarChart cx="50%" cy="50%" outerRadius="80%" data={performanceByCategory}>
                                <PolarGrid />
                                <PolarAngleAxis dataKey="category" tick={{ fontSize: 12 }}/>
                                <Radar name="Puntuación" dataKey="score" stroke="#2563eb" fill="#3b82f6" fillOpacity={0.6} />
                                <Tooltip />
                            </RadarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </Card>
        </div>
    );
};

const AdminView: React.FC<AdminViewProps> = ({ employees, evaluations }) => {
    const [selectedEvaluator, setSelectedEvaluator] = useState('all');
    const [selectedDepartment, setSelectedDepartment] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [modalEvaluation, setModalEvaluation] = useState<CombinedEvaluationData | null>(null);

    const evaluators = useMemo(() => ['all', ...Array.from(new Set(evaluations.map(e => e.evaluator)))], [evaluations]);
    const departments = useMemo(() => ['all', ...Array.from(new Set(employees.map(e => e.department)))], [employees]);

    const combinedData = useMemo<CombinedEvaluationData[]>(() => {
        return evaluations.map(ev => {
            const employee = employees.find(emp => emp.id === ev.employeeId);
            return {
                ...ev,
                employeeName: employee?.name || 'N/A',
                employeePosition: employee?.position || 'N/A',
                employeeDepartment: employee?.department || 'N/A',
                employeeAvatar: employee?.avatar || '',
                avgScore: getAverageScore(ev.scores),
            };
        }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }, [employees, evaluations]);

    const filteredData = useMemo(() => {
        return combinedData.filter(item => {
            const evaluatorMatch = selectedEvaluator === 'all' || item.evaluator === selectedEvaluator;
            const departmentMatch = selectedDepartment === 'all' || item.employeeDepartment === selectedDepartment;
            const searchMatch = searchTerm === '' || item.employeeName.toLowerCase().includes(searchTerm.toLowerCase());
            return evaluatorMatch && departmentMatch && searchMatch;
        });
    }, [combinedData, selectedEvaluator, selectedDepartment, searchTerm]);

    const companyAverage = useMemo(() => {
        if (evaluations.length === 0) return 0;
        const totalScore = combinedData.reduce((sum, ev) => sum + ev.avgScore, 0);
        return (totalScore / combinedData.length).toFixed(1);
    }, [combinedData, evaluations.length]);

    const StatCard: React.FC<{icon: React.ElementType, title: string, value: string | number}> = ({icon: Icon, title, value}) => (
        <Card>
            <div className="flex items-center">
                <div className="p-3 rounded-full bg-blue-100 text-blue-600">
                    <Icon className="h-6 w-6" />
                </div>
                <div className="ml-4">
                    <p className="text-sm text-slate-500">{title}</p>
                    <p className="text-2xl font-bold text-slate-800">{value}</p>
                </div>
            </div>
        </Card>
    );

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold text-slate-800">Panel de Administrador</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard icon={Users} title="Total Colaboradores" value={employees.length} />
                <StatCard icon={FileText} title="Total Evaluaciones" value={evaluations.length} />
                <StatCard icon={BarChart} title="Promedio General" value={`${companyAverage} / 5.0`} />
                <StatCard icon={UserCheck} title="Total Evaluadores" value={evaluators.length - 1} />
            </div>

            <Card>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                        <label htmlFor="search" className="block text-sm font-medium text-slate-700">Buscar por nombre</label>
                        <input id="search" type="text" placeholder="Buscar colaborador..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500" />
                    </div>
                    <div>
                        <label htmlFor="evaluator" className="block text-sm font-medium text-slate-700">Filtrar por Evaluador</label>
                        <select id="evaluator" value={selectedEvaluator} onChange={e => setSelectedEvaluator(e.target.value)} className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500">
                            {evaluators.map(e => <option key={e} value={e}>{e === 'all' ? 'Todos' : e}</option>)}
                        </select>
                    </div>
                    <div>
                        <label htmlFor="department" className="block text-sm font-medium text-slate-700">Filtrar por Departamento</label>
                        <select id="department" value={selectedDepartment} onChange={e => setSelectedDepartment(e.target.value)} className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500">
                            {departments.map(d => <option key={d} value={d}>{d === 'all' ? 'Todos' : d}</option>)}
                        </select>
                    </div>
                </div>
            </Card>

            <Card className="overflow-x-auto">
                <table className="w-full text-sm text-left text-slate-500">
                    <thead className="text-xs text-slate-700 uppercase bg-slate-50">
                        <tr>
                            <th scope="col" className="px-6 py-3">Colaborador</th>
                            <th scope="col" className="px-6 py-3">Departamento</th>
                            <th scope="col" className="px-6 py-3">Evaluador</th>
                            <th scope="col" className="px-6 py-3">Periodo</th>
                            <th scope="col" className="px-6 py-3">Puntuación</th>
                            <th scope="col" className="px-6 py-3">Fecha</th>
                            <th scope="col" className="px-6 py-3"></th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredData.length > 0 ? filteredData.map(ev => (
                            <tr key={ev.id} className="bg-white border-b hover:bg-slate-50">
                                <th scope="row" className="px-6 py-4 font-medium text-slate-900 whitespace-nowrap">
                                    <div className="flex items-center">
                                        <img src={ev.employeeAvatar} alt={ev.employeeName} className="w-10 h-10 rounded-full" />
                                        <div className="pl-3">
                                            <div className="text-base font-semibold">{ev.employeeName}</div>
                                            <div className="font-normal text-slate-500">{ev.employeePosition}</div>
                                        </div>
                                    </div>
                                </th>
                                <td className="px-6 py-4">{ev.employeeDepartment}</td>
                                <td className="px-6 py-4">{ev.evaluator}</td>
                                <td className="px-6 py-4">{ev.period}</td>
                                <td className="px-6 py-4 font-semibold text-slate-800">{ev.avgScore.toFixed(1)}</td>
                                <td className="px-6 py-4">{new Date(ev.date).toLocaleDateString()}</td>
                                <td className="px-6 py-4">
                                    <Button variant="secondary" onClick={() => setModalEvaluation(ev)} className="!p-2"><Eye className="h-5 w-5"/></Button>
                                </td>
                            </tr>
                        )) : (
                           <tr>
                                <td colSpan={7} className="text-center py-10 text-slate-500">
                                    No se encontraron evaluaciones con los filtros actuales.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </Card>

            {modalEvaluation && <EvaluationDetailModal evaluation={modalEvaluation} onClose={() => setModalEvaluation(null)} />}
        </div>
    );
};

export default AdminView;
