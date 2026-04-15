export type Gender = 'male' | 'female';

/**
 * Statuses aligned with WHO Growth Reference (5-19y) 
 * and WHO Adult Classification (18+)
 */
export type BmiStatus = 
  | 'severely-underweight' 
  | 'underweight' 
  | 'normal' 
  | 'overweight' 
  | 'obese' 
  | 'pending';

export type Quarter = 'Q1' | 'Q2' | 'Q3' | 'Q4';

export interface Student {
  id: string;         // Unique Primary Key (Admission No / Roll No)
  admissionId: string; // The unique identifier to prevent double entry
  name: string;
  birthDate: string; // The single source of truth for age calculation
  gender: Gender;
  height: number; 
  weight: number; 
  className: string;
  bmi: number;
  bmiStatus: BmiStatus;
  createdAt: string;
  history: HealthRecord[];
}

/**
 * Used for Dashboard Analytics and Class Reports
 */
export interface ClassSummary {
  className: string;
  total: number;
  normal: number;
  underweight: number;
  severelyUnderweight: number;
  overweight: number;
  obese: number;
  pending: number; // Crucial for tracking who hasn't been measured yet
}

/**
 * System-generated notifications for Teacher/Admin intervention
 */
export interface Alert {
  id: string;
  type: 'critical' | 'warning' | 'info';
  message: string;
  className: string;
  date: string;
  studentId?: string; // Links alert directly to a child's profile
}

/**
 * Snapshot of a student's health at a specific point in time
 */
export interface HealthRecord {
  quarter: Quarter;
  date: string; // Assessment date (e.g., "12-Oct-2025")
  height: number;
  weight: number;
  bmi: number;
  bmiStatus: BmiStatus;
}