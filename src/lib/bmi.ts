import { BmiStatus, Gender } from './types';
import { getThresholdForAge } from './data/bmiReference';

/**
 * Standard Metric BMI Formula
 * WHO Formula: weight (kg) / [height (m)]^2
 */
export function calculateBmi(height: number | null, weight: number | null): number {
  if (!height || !weight || height === 0) return 0;
  
  const heightM = height / 100;
  return parseFloat((weight / (heightM * heightM)).toFixed(1));
}

/**
 * BMI Status based on WHO Growth Standards (5-19 years) 
 * and WHO Adult Classification (18+)
 */
export function getBmiStatus(bmi: number | null, age: number, gender: Gender): BmiStatus | 'pending' {
  if (!bmi || bmi === 0) return 'pending';

  // Adult Classification (WHO 1995/2000)
  if (age >= 18) {
    if (bmi < 16) return 'severely-underweight';
    if (bmi < 18.5) return 'underweight';
    if (bmi < 25) return 'normal';
    if (bmi < 30) return 'overweight';
    return 'obese';
  }

  // Pediatric Classification (WHO 2007 Growth Reference)
  // Maps to standard deviations (SD): <-3SD (Severe), <-2SD (Underweight)
  const targetGender = (gender === 'female') ? 'female' : 'male';
  const thresholds = getThresholdForAge(age, targetGender);

  if (bmi < thresholds.p5 - 1.5) return 'severely-underweight';
  if (bmi < thresholds.p5) return 'underweight';
  if (bmi < thresholds.p85) return 'normal';
  if (bmi < thresholds.p95) return 'overweight';
  return 'obese';
}

/**
 * Cleaned up Styles using your "Balanced-Cool" color palette
 */
export function getBmiColor(status: BmiStatus | 'pending'): string {
  const colors: Record<string, string> = {
    'severely-underweight': 'text-red-600',
    'underweight': 'text-amber-500',
    'normal': 'text-emerald-600',
    'overweight': 'text-amber-500',
    'obese': 'text-red-600',
    'pending': 'text-slate-400',
  };
  return colors[status] || 'text-slate-400';
}

export function getBmiBadgeVariant(status: BmiStatus | 'pending'): 'destructive' | 'secondary' | 'default' | 'outline' {
  switch (status) {
    case 'severely-underweight': 
    case 'obese': return 'destructive';
    case 'underweight': 
    case 'overweight': return 'secondary';
    case 'pending': return 'outline'; 
    default: return 'default';
  }
}

/**
 * Recommendations updated to align with Mid-Day Meal (MDM) 
 * and WIFS (Weekly Iron and Folic Acid Supplementation) programs
 */
export function getRecommendations(status: BmiStatus | 'pending', age: number): string[] {
  if (status === 'pending') {
    return ['Awaiting initial measurement for nutritional assessment.'];
  }

  const isAdolescent = age >= 12;

  switch (status) {
    case 'severely-underweight':
      return [
        'Urgent: Mandatory referral to medical officer (NRC protocol)',
        'Ensure double portion of Mid-Day Meal protein (Soy/Dal/Egg)',
        'Weekly weight monitoring and deworming status check',
        isAdolescent ? 'Administer Weekly Iron and Folic Acid (WIFS) tablets' : 'Screen for SAM (Severe Acute Malnutrition)',
      ];
    case 'underweight':
      return [
        'Nutritional Enrichment: Increase local protein/calorie intake',
        'Monitor completion of full Mid-Day Meal portion',
        'Parental counseling on energy-dense diet (Peanuts/Milk)',
      ];
    case 'normal':
      return [
        'Maintain balanced diet and physical growth trajectory',
        'Encourage 60 mins of outdoor play/sports daily',
        'Ensure clean drinking water and hand hygiene habits',
      ];
    case 'overweight':
    case 'obese':
      return [
        'Restrict junk food/sugary snacks from school surroundings',
        'Replace refined grains with Millets/Ragi (Local nutrition)',
        'Increase structured physical activity and sports participation',
        isAdolescent ? 'Check for sedentary screen time habits' : 'Avoid using sweets as a behavioral reward',
      ];
    default:
      return ['Routine health screening recommended'];
  }
}

export function statusLabel(status: BmiStatus | 'pending'): string {
  if (status === 'pending') return 'Pending Assessment';
  // Formats 'severely-underweight' to 'Severely Underweight'
  return status.split('-').map(w => w[0].toUpperCase() + w.slice(1)).join(' ');
}