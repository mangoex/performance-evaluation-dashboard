import { Employee, Evaluation } from './types';
import { initializeApp } from 'firebase/app';
import { 
    getFirestore, 
    collection, 
    getDocs, 
    addDoc, 
    doc, 
    updateDoc, 
    deleteDoc, 
    query, 
    where, 
    writeBatch,
    serverTimestamp // Opcional para timestamps precisos
} from 'firebase/firestore';
import { firebaseConfig } from './firebaseConfig';

// --- Inicialización de Firebase ---
const firebaseApp = initializeApp(firebaseConfig);
const db = getFirestore(firebaseApp);

// --- Referencias a Colecciones ---
export const employeesCollection = collection(db, 'employees');
export const evaluationsCollection = collection(db, 'evaluations');

// --- API del Servicio de Base de Datos (Firestore) ---

export const getEmployees = async (): Promise<Employee[]> => {
  const snapshot = await getDocs(employeesCollection);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Employee));
};

export const getEvaluations = async (): Promise<Evaluation[]> => {
  const snapshot = await getDocs(evaluationsCollection);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Evaluation));
};

export const addEmployee = async (employeeData: Omit<Employee, 'id' | 'avatar'>): Promise<void> => {
  const newEmployeeData = {
    ...employeeData,
    avatar: `https://i.pravatar.cc/150?u=${employeeData.email}`
  };
  await addDoc(employeesCollection, newEmployeeData);
};

export const updateEmployee = async (updatedEmployee: Employee): Promise<void> => {
  const { id, ...employeeData } = updatedEmployee;
  const employeeDoc = doc(db, 'employees', id);
  await updateDoc(employeeDoc, employeeData);
};

export const deleteEmployee = async (employeeId: string): Promise<void> => {
  const batch = writeBatch(db);

  // 1. Referencia al documento del empleado a eliminar
  const employeeDoc = doc(db, 'employees', employeeId);
  batch.delete(employeeDoc);

  // 2. Encontrar y eliminar todas las evaluaciones asociadas
  const q = query(evaluationsCollection, where("employeeId", "==", employeeId));
  const evaluationsSnapshot = await getDocs(q);
  evaluationsSnapshot.forEach(doc => {
    batch.delete(doc.ref);
  });

  // 3. Ejecutar el lote de operaciones
  await batch.commit();
};

export const addEvaluation = async (evaluationData: Omit<Evaluation, 'id' | 'date'>): Promise<void> => {
  const newEvaluationData = {
    ...evaluationData,
    date: new Date().toISOString(), // O usar serverTimestamp() para mayor precisión
  };
  await addDoc(evaluationsCollection, newEvaluationData);
};

// --- Estado de la Conexión ---
// Con Firestore, el SDK maneja la conexión y el modo sin conexión automáticamente.
// Esta variable ya no es necesaria de la misma manera.
// Podríamos implementar una escucha del estado de la conexión si fuera necesario.
export const isConnected = true; // Placeholder, el SDK de Firebase gestiona esto.
