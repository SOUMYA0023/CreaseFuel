import type { ActivityLevel, Goal, Gender } from '@/types';

const ACTIVITY_MULTIPLIERS: Record<ActivityLevel, number> = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  high: 1.725,
  athlete: 1.9,
};

export function bmi(weightKg: number, heightCm: number): number {
  const heightM = heightCm / 100;
  return Number((weightKg / (heightM * heightM)).toFixed(1));
}

export function bmrMifflinStJeor(
  weightKg: number,
  heightCm: number,
  age: number,
  gender: Gender
): number {
  const base = 10 * weightKg + 6.25 * heightCm - 5 * age;
  return Math.round(gender === 'female' ? base - 161 : base + 5);
}

export function maintenanceCalories(bmr: number, activityLevel: ActivityLevel): number {
  return Math.round(bmr * ACTIVITY_MULTIPLIERS[activityLevel]);
}

export function goalCalories(
  maintenance: number,
  goal: Goal
): number {
  if (goal === 'lose_weight') {
    return Math.round(maintenance * 0.82);
  }
  if (goal === 'gain_weight') {
    return Math.round(maintenance * 1.125);
  }
  return maintenance;
}

export function proteinG(
  weightKg: number,
  athleteMode: boolean,
  goalCalories: number
): number {
  const perKg = athleteMode ? 2.2 : 1.6;
  const fromWeight = Math.round(weightKg * perKg);
  const maxFromCal = Math.floor((goalCalories * 0.4) / 4);
  return Math.min(fromWeight, maxFromCal);
}

export function fatG(goalCalories: number, proteinCal: number, carbCal: number): number {
  const fatCal = goalCalories - proteinCal - carbCal;
  return Math.max(0, Math.round(fatCal / 9));
}

export function carbsG(
  goalCalories: number,
  proteinG: number,
  fatG: number
): number {
  const proteinCal = proteinG * 4;
  const fatCal = fatG * 9;
  const carbCal = goalCalories - proteinCal - fatCal;
  return Math.max(0, Math.round(carbCal / 4));
}

export function macroSplit(
  weightKg: number,
  goalCalories: number,
  athleteMode: boolean
): { protein_g: number; carbs_g: number; fat_g: number } {
  const protein_g = proteinG(weightKg, athleteMode, goalCalories);
  const proteinCal = protein_g * 4;
  const fat_g = Math.round((goalCalories * 0.25) / 9);
  const carbs_g = carbsG(goalCalories, protein_g, fat_g);
  return { protein_g, carbs_g, fat_g };
}
