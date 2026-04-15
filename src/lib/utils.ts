import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Merges Tailwind classes safely without conflicts.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Precise Age Calculation Utility
 * Handles ISO, Slash, and Dash formats with local-time stability.
 */
export function calculateAge(birthDate: string | Date | undefined | null): number {
  // 1. Guard Clause for missing data
  if (!birthDate || birthDate === "N/A" || birthDate === "undefined") {
    return 0;
  }

  try {
    const today = new Date();
    
    /** * 2. The "Stability Fix": 
     * Standardizing to "YYYY/MM/DD" ensures the browser parses 
     * the date as Local Time rather than UTC, preventing 1-day shifts.
     */
    const standardizedDate = String(birthDate).replace(/-/g, '/');
    const birth = new Date(standardizedDate);

    // 3. Validation: Ensure it's a real date and not in the future
    if (isNaN(birth.getTime()) || birth > today) {
      return 0;
    }

    // 4. Mathematical Age Logic
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    const dayDiff = today.getDate() - birth.getDate();

    // Adjust if current date is before the birthday in the current year
    if (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)) {
      age--;
    }

    return Math.max(0, age);
  } catch (error) {
    console.error("Age calculation error:", error);
    return 0;
  }
}