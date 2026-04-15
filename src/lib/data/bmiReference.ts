// Sample data based on WHO/IAP simplified thresholds for ages 5-18
// In a production app, this would be a full JSON mapping for every month
export const PEDIATRIC_THRESHOLDS: Record<string, Record<number, { p5: number; p85: number; p95: number }>> = {
  male: {
    5: { p5: 13.0, p85: 16.6, p95: 18.2 },
    8: { p5: 13.2, p85: 18.5, p95: 21.0 },
    10: { p5: 13.7, p85: 20.3, p95: 23.2 },
    12: { p5: 14.5, p85: 22.4, p95: 25.6 },
    15: { p5: 16.0, p85: 25.1, p95: 28.5 },
  },
  female: {
    5: { p5: 12.7, p85: 16.8, p95: 18.7 },
    8: { p5: 12.9, p85: 18.7, p95: 21.5 },
    10: { p5: 13.5, p85: 20.6, p95: 23.8 },
    12: { p5: 14.4, p85: 23.0, p95: 26.6 },
    15: { p5: 15.8, p85: 25.6, p95: 29.3 },
  }
};

// Fallback for ages not explicitly defined in the simplified table
export const getThresholdForAge = (age: number, gender: 'male' | 'female') => {
  const genderData = PEDIATRIC_THRESHOLDS[gender];
  const ages = Object.keys(genderData).map(Number).sort((a, b) => a - b);
  const closestAge = ages.reduce((prev, curr) => 
    Math.abs(curr - age) < Math.abs(prev - age) ? curr : prev
  );
  return genderData[closestAge];
};