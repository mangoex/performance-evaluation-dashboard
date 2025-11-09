
export enum EvaluationCategory {
  PRODUCTIVIDAD = 'Productividad',
  CALIDAD = 'Calidad del Trabajo',
  ACTITUD = 'Actitud y Trabajo en Equipo',
  LIDERAZGO = 'Liderazgo',
  COMUNICACION = 'Comunicación'
}

export interface Employee {
  id: number;
  name: string;
  position: string;
  department: string;
  avatar: string;
}

export type EvaluationScores = {
  [key in EvaluationCategory]: number;
};

export interface Evaluation {
  id: number;
  employeeId: number;
  period: string; // e.g., "T3 2024"
  scores: EvaluationScores;
  comments: string;
  evaluator: string;
  date: string;
}

export type View = 'dashboard' | 'team' | 'evaluate' | 'admin';