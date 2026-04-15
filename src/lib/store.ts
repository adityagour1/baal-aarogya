import { Student, Alert, HealthRecord, Quarter } from './types';
import { calculateBmi, getBmiStatus } from './bmi';
import { calculateAge } from './utils';

const STUDENTS_KEY = 'baal-Aarogya-students';
const ALERTS_KEY = 'baal-Aarogya-alerts';

// --- HELPER UTILS ---

export function getStudents(): Student[] {
  try {
    const data = localStorage.getItem(STUDENTS_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

/**
 * UPDATED: Prevents double entries by ensuring only unique IDs are saved.
 */
function saveStudents(students: Student[]) {
  const uniqueMap = new Map();
  students.forEach(s => uniqueMap.set(s.id, s));
  
  const uniqueStudents = Array.from(uniqueMap.values());
  
  localStorage.setItem(STUDENTS_KEY, JSON.stringify(uniqueStudents));
  generateAlerts(uniqueStudents);
}

// --- CORE FUNCTIONS ---

/**
 * UPDATED: Checks for existing ID AND verifies class authorization.
 */
export function addStudent(data: any, quarter: Quarter = 'Q1', authorizedClass?: string): Student {
  const students = getStudents();
  const admissionId = data.id || data.admissionId?.toUpperCase().trim();

  // 1. STRICT CLASS SCOPING
  if (authorizedClass && authorizedClass !== 'ALL' && data.className !== authorizedClass) {
    throw new Error(`Access Denied: You can only add students to Class ${authorizedClass}.`);
  }

  // 2. PRE-VALIDATION CHECK (DUPLICATE ID)
  const exists = students.some(s => s.id === admissionId);
  if (exists) {
    throw new Error(`Student ID ${admissionId} already exists in the system.`);
  }
  
  const age = calculateAge(data.birthDate);
  const height = data.height ? Number(data.height) : 0;
  const weight = data.weight ? Number(data.weight) : 0;
  
  const bmi = calculateBmi(height, weight);
  const bmiStatus = getBmiStatus(bmi, age, data.gender);

  const student: Student = {
    ...data,
    id: admissionId, 
    bmi, 
    bmiStatus,
    createdAt: new Date().toISOString(),
    history: height > 0 ? [{ 
      quarter, 
      date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }), 
      height, 
      weight, 
      bmi, 
      bmiStatus 
    }] : [],
  };
  
  saveStudents([...students, student]);
  return student;
}

/**
 * UPDATED: PARTIAL SUCCESS LOGIC
 * Filters out duplicates and unauthorized classes row-by-row.
 * The entire file won't fail; only invalid rows are skipped.
 */
export function addStudentsBulk(data: any[], quarter: Quarter = 'Q1', authorizedClass?: string) {
  const existing = getStudents();
  const existingIds = new Set(existing.map(s => s.id));
  
  let skippedDuplicates = 0;
  let skippedWrongClass = 0;

  const validNewOnes = data.reduce((acc: Student[], item) => {
    const id = (item.id || item.admissionId || "").toUpperCase().trim();
    const studentClass = (item.className || "").toUpperCase().trim();

    // 1. Skip if Duplicate
    if (existingIds.has(id)) {
      skippedDuplicates++;
      return acc;
    }

    // 2. Skip if Wrong Class (for Teachers)
    if (authorizedClass && authorizedClass !== 'ALL' && studentClass !== authorizedClass) {
      skippedWrongClass++;
      return acc;
    }

    // 3. Process Valid Row
    const age = calculateAge(item.birthDate);
    const height = item.height ? Number(item.height) : 0;
    const weight = item.weight ? Number(item.weight) : 0;
    const bmi = calculateBmi(height, weight);
    const status = getBmiStatus(bmi, age, item.gender);

    const newStudent: Student = {
      ...item,
      id: id,
      className: studentClass,
      bmi,
      bmiStatus: status,
      createdAt: new Date().toISOString(),
      history: height > 0 ? [{
        quarter,
        date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }),
        height,
        weight,
        bmi,
        bmiStatus: status
      }] : []
    };

    acc.push(newStudent);
    return acc;
  }, []);

  if (validNewOnes.length > 0) {
    saveStudents([...existing, ...validNewOnes]);
  }

  // Return counts so the UI can show a summary
  return {
    added: validNewOnes.length,
    skippedDuplicates,
    skippedWrongClass
  };
}

// --- KEEPING ALL OTHER FUNCTIONS UNCHANGED ---

export function getClassHealthScore(className: string) {
  const allStudents = getStudents();
  const classStudents = allStudents.filter(s => s.className === className);
  if (classStudents.length === 0) return { score: 0, improvedCount: 0, status: 'N/A' };
  const healthyCount = classStudents.filter(s => s.bmiStatus === 'normal').length;
  const healthScore = Math.round((healthyCount / classStudents.length) * 100);
  const improvedCount = classStudents.filter(s => getStudentTrend(s) === "IMPROVED").length;
  let status = "Stable";
  if (healthScore >= 85) status = "Outstanding";
  else if (healthScore >= 70 || improvedCount > 2) status = "Improving";
  return { score: healthScore, improvedCount, status, total: classStudents.length };
}

export function getClassLeaderboard() {
  const classes = getAvailableClasses();
  return classes.map(cls => ({
    className: cls,
    ...getClassHealthScore(cls)
  })).sort((a, b) => b.score - a.score);
}

export function recordQuarterlyMetrics(studentId: string, metrics: { weight: number, height: number, quarter: Quarter }) {
  const students = getStudents();
  const updated = students.map(s => {
    if (s.id === studentId) {
      const filteredHistory = (s.history || []).filter(h => h.quarter !== metrics.quarter);
      const age = calculateAge(s.birthDate);
      const bmi = calculateBmi(metrics.height, metrics.weight);
      const bmiStatus = getBmiStatus(bmi, age, s.gender);
      const newRecord = { 
        ...metrics, 
        date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }), 
        bmi, 
        bmiStatus 
      };
      const newHistory = [...filteredHistory, newRecord].sort((a, b) => a.quarter.localeCompare(b.quarter));
      const latest = newHistory[newHistory.length - 1];
      return { 
        ...s, 
        height: latest.height, 
        weight: latest.weight, 
        bmi: latest.bmi, 
        bmiStatus: latest.bmiStatus, 
        history: newHistory
      };
    }
    return s;
  });
  saveStudents(updated);
}

export function getClassSummaries() {
  const s = getStudents();
  const classes = [...new Set(s.map(x => x.className))];
  return classes.map(cls => {
    const classStudents = s.filter(x => x.className === cls);
    return { 
      className: cls, 
      total: classStudents.length, 
      normal: classStudents.filter(x => x.bmiStatus === 'normal').length, 
      underweight: classStudents.filter(x => x.bmiStatus === 'underweight').length, 
      severelyUnderweight: classStudents.filter(x => x.bmiStatus === 'severely-underweight').length, 
      overweight: classStudents.filter(x => x.bmiStatus === 'overweight').length, 
      obese: classStudents.filter(x => x.bmiStatus === 'obese').length,
      pending: classStudents.filter(x => x.bmiStatus === 'pending').length 
    };
  });
}

function generateAlerts(students: Student[]) {
  const alerts: Alert[] = [];
  const classes = [...new Set(students.map(s => s.className))];
  classes.forEach(cls => {
    const crit = students.filter(s => s.className === cls && s.bmiStatus === 'severely-underweight').length;
    if (crit > 0) {
      alerts.push({ 
        id: `alert-${cls}-${Date.now()}`, 
        type: 'critical', 
        message: `${crit} critical cases in Class ${cls}`, 
        className: cls, 
        date: new Date().toISOString() 
      });
    }
  });
  localStorage.setItem(ALERTS_KEY, JSON.stringify(alerts));
}

export function getAvailableClasses(): string[] {
  const students = getStudents();
  const classes = [...new Set(students.map(s => s.className))].filter(Boolean);
  return classes.sort((a, b) => a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' }));
}

export function getClassImprovementRate(className: string): number {
  const students = getStudents().filter(s => className === 'ALL' ? true : s.className === className);
  if (students.length === 0) return 0;
  const improvedCount = students.filter(s => getStudentTrend(s) === "IMPROVED").length;
  return Math.round((improvedCount / students.length) * 100);
} 

export function deleteStudent(id: string) { 
  const remaining = getStudents().filter(s => s.id !== id);
  saveStudents(remaining); 
}

export function deleteStudentsBulk(ids: string[]) {
  const remaining = getStudents().filter(s => !ids.includes(s.id));
  saveStudents(remaining);
}

export function updateStudentsClassBulk(ids: string[], newClassName: string) {
  const students = getStudents();
  const updated = students.map(s => {
    if (ids.includes(s.id)) {
      return { ...s, className: newClassName.toUpperCase().trim() };
    }
    return s;
  });
  saveStudents(updated);
} 

export function getStudentById(id: string) { return getStudents().find(s => s.id === id); }

export function getAlerts(): Alert[] {
  const students = getStudents();
  const alerts: Alert[] = [];
  students.forEach(s => {
    if (s.bmiStatus === 'severely-underweight') {
      alerts.push({
        id: `alert-crit-${s.id}`,
        type: 'critical',
        message: `IMMEDIATE ACTION: ${s.name} is Severely Underweight (BMI: ${s.bmi?.toFixed(1)}). Priority intervention required.`,
        className: s.className,
        date: s.history?.[s.history.length - 1]?.date || new Date().toISOString(),
        studentId: s.id
      });
    }
    const trend = getStudentTrend(s);
    if (trend === 'DECLINED' || trend === 'RAPID_DECLINE') {
      alerts.push({
        id: `alert-trend-${s.id}`,
        type: trend === 'RAPID_DECLINE' ? 'critical' : 'warning',
        message: `${trend === 'RAPID_DECLINE' ? 'RAPID' : 'SYSTEMIC'} health decline detected for ${s.name}. Review growth chart.`,
        className: s.className,
        date: new Date().toISOString(),
        studentId: s.id
      });
    }
    if (s.bmiStatus === 'underweight' && trend !== 'IMPROVED') {
      alerts.push({
        id: `alert-warn-${s.id}`,
        type: 'warning',
        message: `${s.name} is in the Underweight bracket. Recommend nutritional screening.`,
        className: s.className,
        date: new Date().toISOString(),
        studentId: s.id
      });
    }
  });
  return alerts.sort((a, b) => {
    if (a.type === 'critical' && b.type !== 'critical') return -1;
    if (a.type !== 'critical' && b.type === 'critical') return 1;
    return new Date(b.date).getTime() - new Date(a.date).getTime();
  });
}

export function getStudentTrend(student: Student) {
  const history = student.history || [];
  const validHistory = history.filter(h => h.bmi && h.bmi > 0);
  if (validHistory.length < 2) return "STABLE";
  const sortedHistory = [...validHistory].sort((a, b) => a.quarter.localeCompare(b.quarter));
  const current = sortedHistory[sortedHistory.length - 1];
  const previous = sortedHistory[sortedHistory.length - 2];
  const bmiChange = current.bmi - previous.bmi;
  const bmiChangePercent = (bmiChange / previous.bmi) * 100;
  if (previous.bmiStatus !== 'normal' && current.bmiStatus === 'normal') return "IMPROVED";
  if (bmiChange > 0.2 && current.bmiStatus !== 'obese') return "IMPROVING";
  if (bmiChangePercent < -5) return "RAPID_DECLINE";
  if (bmiChange < -0.1) return "DECLINED";
  return "STABLE";
}

export function updateStudent(id: string, data: Partial<Student>) {
  const students = getStudents();
  const updated = students.map(s => {
    if (s.id === id) {
      const merged = { ...s, ...data };
      const age = calculateAge(merged.birthDate);
      const height = merged.height ? Number(merged.height) : 0;
      const weight = merged.weight ? Number(merged.weight) : 0;
      const bmi = calculateBmi(height, weight);
      const bmiStatus = getBmiStatus(bmi, age, merged.gender);
      return { ...merged, bmi, bmiStatus };
    }
    return s;
  });
  saveStudents(updated);
}