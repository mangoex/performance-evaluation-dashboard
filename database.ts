import { Employee, Evaluation } from './types';

// --- Configuración de localStorage ---
const EMPLOYEES_KEY = 'performance_app_employees';
const EVALUATIONS_KEY = 'performance_app_evaluations';

// --- Funciones de Utilidad ---
const read = <T>(key: string, defaultValue: T[] = []): T[] => {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : defaultValue;
  } catch (error) {
    console.error(`Error al leer de localStorage [${key}]:`, error);
    return defaultValue;
  }
};

const write = <T>(key: string, data: T[]): void => {
  try {
    localStorage.setItem(key, JSON.stringify(data, null, 2));
  } catch (error)
 {
    console.error(`Error al escribir en localStorage [${key}]:`, error);
  }
};

// --- API del Servicio de Base de Datos (localStorage) ---

export const getEmployees = async (): Promise<Employee[]> => {
  return Promise.resolve(read<Employee>(EMPLOYEES_KEY));
};

export const getEvaluations = async (): Promise<Evaluation[]> => {
  return Promise.resolve(read<Evaluation>(EVALUATIONS_KEY));
};

export const addEmployee = async (employeeData: Omit<Employee, 'id' | 'avatar'>): Promise<void> => {
  const employees = await getEmployees();
  const newEmployee: Employee = {
    ...employeeData,
    id: self.crypto.randomUUID(),
    avatar: `https://i.pravatar.cc/150?u=${employeeData.email}`
  };
  employees.push(newEmployee);
  write(EMPLOYEES_KEY, employees);
  return Promise.resolve();
};

export const updateEmployee = async (updatedEmployee: Employee): Promise<void> => {
  let employees = await getEmployees();
  employees = employees.map(emp => emp.id === updatedEmployee.id ? updatedEmployee : emp);
  write(EMPLOYEES_KEY, employees);
  return Promise.resolve();
};

export const deleteEmployee = async (employeeId: string): Promise<void> => {
  let employees = await getEmployees();
  employees = employees.filter(emp => emp.id !== employeeId);
  write(EMPLOYEES_KEY, employees);

  // También eliminar las evaluaciones asociadas
  let evaluations = await getEvaluations();
  evaluations = evaluations.filter(ev => ev.employeeId !== employeeId);
  write(EVALUATIONS_KEY, evaluations);
  
  return Promise.resolve();
};

export const addEvaluation = async (evaluationData: Omit<Evaluation, 'id' | 'date'>): Promise<void> => {
  const evaluations = await getEvaluations();
  const newEvaluation: Evaluation = {
    ...evaluationData,
    id: self.crypto.randomUUID(),
    date: new Date().toISOString(),
  };
  evaluations.push(newEvaluation);
  write(EVALUATIONS_KEY, evaluations);
  return Promise.resolve();
};


// --- Estado de la Conexión ---
// Como la base de datos es local, siempre estamos "conectados".
export const isConnected = true;