
import React, { useState } from 'react';
import { Employee, Evaluation, EvaluationCategory, EvaluationScores } from '../types';
import Button from './ui/Button';
import Card from './ui/Card';

interface EvaluationViewProps {
    employees: Employee[];
    evaluations: Evaluation[];
    onAddEvaluation: (evaluation: Omit<Evaluation, 'id'|'date'>) => void;
    currentUser: { name: string; };
}

const EvaluationForm: React.FC<{
    employee: Employee;
    currentUser: { name: string; };
    onSave: (evaluation: Omit<Evaluation, 'id'|'date'>) => void;
    onCancel: () => void;
}> = ({ employee, currentUser, onSave, onCancel }) => {
    const initialScores = Object.values(EvaluationCategory).reduce((acc, cat) => ({...acc, [cat]: 3 }), {}) as EvaluationScores;
    const [scores, setScores] = useState<EvaluationScores>(initialScores);
    const [comments, setComments] = useState('');
    const [period, setPeriod] = useState('T4 2024');

    const handleScoreChange = (category: EvaluationCategory, value: number) => {
        setScores(prev => ({...prev, [category]: value}));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave({
            employeeId: employee.id,
            period,
            scores,
            comments,
            evaluator: currentUser.name,
        });
    };

    return (
        <Card>
            <h3 className="text-xl font-bold text-slate-800">Nueva Evaluación para {employee.name}</h3>
            <p className="text-slate-500 mb-6">{employee.position}</p>
            <form onSubmit={handleSubmit} className="space-y-6">
                 <div>
                    <label className="block text-sm font-medium text-slate-700">Periodo de Evaluación</label>
                    <input type="text" value={period} onChange={e => setPeriod(e.target.value)} required className="mt-1 block w-full max-w-xs rounded-md border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500" />
                </div>
                {Object.values(EvaluationCategory).map(category => (
                    <div key={category}>
                        <label className="block text-sm font-medium text-slate-700">{category}</label>
                        <div className="flex items-center space-x-2 mt-2">
                             <span className="text-xs text-slate-500">Bajo</span>
                            {[1, 2, 3, 4, 5].map(val => (
                                <label key={val} className="flex flex-col items-center">
                                    <input type="radio" name={category} value={val} checked={scores[category] === val} onChange={() => handleScoreChange(category, val)} className="h-4 w-4 text-blue-600 border-slate-300 focus:ring-blue-500" />
                                     <span className="text-xs mt-1">{val}</span>
                                </label>
                            ))}
                             <span className="text-xs text-slate-500">Alto</span>
                        </div>
                    </div>
                ))}
                <div>
                    <label className="block text-sm font-medium text-slate-700">Comentarios Cualitativos</label>
                    <textarea value={comments} onChange={e => setComments(e.target.value)} rows={4} required className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500" />
                </div>
                <div className="flex justify-end gap-3 pt-4">
                    <Button type="button" variant="secondary" onClick={onCancel}>Cancelar</Button>
                    <Button type="submit">Guardar Evaluación</Button>
                </div>
            </form>
        </Card>
    );
};

const EvaluationView: React.FC<EvaluationViewProps> = ({ employees, evaluations, onAddEvaluation, currentUser }) => {
    const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
    const [showSuccess, setShowSuccess] = useState(false);

    const handleSaveEvaluation = (evaluation: Omit<Evaluation, 'id'|'date'>) => {
        onAddEvaluation(evaluation);
        setSelectedEmployee(null);
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 3000);
    };

    if (selectedEmployee) {
        return <EvaluationForm 
            employee={selectedEmployee} 
            currentUser={currentUser} 
            onSave={handleSaveEvaluation} 
            onCancel={() => setSelectedEmployee(null)}
        />;
    }
    
    return (
        <div>
            <h2 className="text-2xl font-bold text-slate-800 mb-6">Realizar Evaluación</h2>
            {showSuccess && (
                <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg relative mb-4" role="alert">
                    <span className="block sm:inline">Evaluación guardada correctamente.</span>
                </div>
            )}
            <div className="bg-white p-6 rounded-xl shadow-md">
                <h3 className="text-lg font-semibold text-slate-700 mb-4">Selecciona un colaborador para evaluar:</h3>
                <ul className="divide-y divide-slate-200">
                    {employees.map(employee => {
                        const lastEval = evaluations.filter(e => e.employeeId === employee.id).sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];
                        return (
                            <li key={employee.id} className="py-4 flex justify-between items-center">
                                <div className="flex items-center">
                                    <img src={employee.avatar} alt={employee.name} className="h-12 w-12 rounded-full" />
                                    <div className="ml-4">
                                        <p className="font-semibold text-slate-800">{employee.name}</p>
                                        <p className="text-sm text-slate-500">Última evaluación: {lastEval ? new Date(lastEval.date).toLocaleDateString() : 'N/A'}</p>
                                    </div>
                                </div>
                                <Button onClick={() => setSelectedEmployee(employee)}>
                                    Evaluar Ahora
                                </Button>
                            </li>
                        )
                    })}
                </ul>
            </div>
        </div>
    );
};

export default EvaluationView;
