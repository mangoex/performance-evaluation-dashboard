
import React, { useState } from 'react';
import { Employee } from '../types';
import Button from './ui/Button';
import Card from './ui/Card';
import { PlusCircle, Edit, Trash2, User } from 'lucide-react';

interface TeamViewProps {
    employees: Employee[];
    onAddEmployee: (employee: Omit<Employee, 'id' | 'avatar'>) => void;
    onUpdateEmployee: (employee: Employee) => void;
    onDeleteEmployee: (employeeId: number) => void;
    currentUser: { name: string; email: string; area: string; isAdmin: boolean; };
}

const EmployeeForm: React.FC<{ 
    employee?: Employee | null;
    onSubmit: (employeeData: any) => void;
    onCancel: () => void;
    currentUser: { name: string; email: string; area: string; isAdmin: boolean; };
}> = ({ employee, onSubmit, onCancel, currentUser }) => {
    const isEditing = !!employee;
    const isManagerOnly = !currentUser.isAdmin;

    const [name, setName] = useState(employee?.name || '');
    const [position, setPosition] = useState(employee?.position || '');
    const [department, setDepartment] = useState(employee?.department || currentUser.area);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit({ name, position, department });
    };

    // Department is read-only for non-admins, OR for admins when they are ADDING a new employee (from TeamView).
    // Admins can only change department when editing an existing employee.
    const isDepartmentReadOnly = isManagerOnly || !isEditing;

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label className="block text-sm font-medium text-slate-700">Nombre Completo</label>
                <input type="text" value={name} onChange={e => setName(e.target.value)} required className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500" />
            </div>
            <div>
                <label className="block text-sm font-medium text-slate-700">Puesto</label>
                <input type="text" value={position} onChange={e => setPosition(e.target.value)} required className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500" />
            </div>
            <div>
                <label className="block text-sm font-medium text-slate-700">Departamento</label>
                <input 
                    type="text" 
                    value={department} 
                    onChange={e => setDepartment(e.target.value)} 
                    required 
                    readOnly={isDepartmentReadOnly}
                    className={`mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 ${isDepartmentReadOnly ? 'bg-slate-100 cursor-not-allowed' : ''}`}
                />
            </div>
            <div className="flex justify-end gap-3 pt-4">
                <Button type="button" variant="secondary" onClick={onCancel}>Cancelar</Button>
                <Button type="submit">{employee ? 'Actualizar' : 'Añadir'} Colaborador</Button>
            </div>
        </form>
    );
};


const TeamView: React.FC<TeamViewProps> = ({ employees, onAddEmployee, onUpdateEmployee, onDeleteEmployee, currentUser }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);

    const handleAddClick = () => {
        setEditingEmployee(null);
        setIsModalOpen(true);
    };

    const handleEditClick = (employee: Employee) => {
        setEditingEmployee(employee);
        setIsModalOpen(true);
    };

    const handleFormSubmit = (employeeData: any) => {
        if (editingEmployee) {
            onUpdateEmployee({ ...editingEmployee, ...employeeData });
        } else {
            onAddEmployee(employeeData);
        }
        setIsModalOpen(false);
        setEditingEmployee(null);
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-slate-800">Mi Equipo ({employees.length})</h2>
                <Button onClick={handleAddClick}><PlusCircle className="h-5 w-5"/>Añadir Colaborador</Button>
            </div>
            {employees.length === 0 ? (
                <Card className="text-center py-12">
                     <User className="mx-auto h-12 w-12 text-slate-400" />
                    <h3 className="mt-2 text-sm font-medium text-slate-900">Aún no hay miembros en el equipo</h3>
                    <p className="mt-1 text-sm text-slate-500">Comienza añadiendo un nuevo colaborador.</p>
                </Card>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {employees.map(employee => (
                        <Card key={employee.id} className="flex flex-col">
                            <div className="flex items-center">
                                <img src={employee.avatar} alt={employee.name} className="h-16 w-16 rounded-full" />
                                <div className="ml-4">
                                    <h3 className="text-lg font-semibold text-slate-800">{employee.name}</h3>
                                    <p className="text-sm text-slate-500">{employee.position}</p>
                                    <p className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full inline-block mt-1">{employee.department}</p>
                                </div>
                            </div>
                            <div className="mt-4 pt-4 border-t border-slate-200 flex justify-end gap-2">
                                <Button variant="secondary" onClick={() => handleEditClick(employee)}><Edit className="h-4 w-4"/> Editar</Button>
                                <Button variant="danger" onClick={() => onDeleteEmployee(employee.id)}><Trash2 className="h-4 w-4"/> Eliminar</Button>
                            </div>
                        </Card>
                    ))}
                </div>
            )}
            {isModalOpen && (
                 <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
                    <Card className="w-full max-w-lg">
                         <h3 className="text-lg font-semibold text-slate-800 mb-4">{editingEmployee ? 'Editar' : 'Añadir'} Colaborador</h3>
                         <EmployeeForm 
                             employee={editingEmployee}
                             onSubmit={handleFormSubmit}
                             onCancel={() => setIsModalOpen(false)}
                             currentUser={currentUser}
                         />
                    </Card>
                 </div>
            )}
        </div>
    );
};

export default TeamView;