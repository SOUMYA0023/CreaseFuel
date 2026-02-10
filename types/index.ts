export type ActivityLevel =
  | 'sedentary'
  | 'light'
  | 'moderate'
  | 'high'
  | 'athlete';

export type Goal = 'lose_weight' | 'maintain' | 'gain_weight';

export type Gender = 'male' | 'female' | 'other';

export interface UserProfile {
  id: string;
  user_id: string;
  age: number;
  gender: Gender;
  height_cm: number;
  weight_kg: number;
  activity_level: ActivityLevel;
  goal: Goal;
  athlete_mode: boolean;
  created_at: string;
  updated_at: string;
}

export interface HealthMetrics {
  bmi: number;
  bmr: number;
  maintenance_calories: number;
  goal_calories: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
}

export interface FoodEntry {
  id: string;
  user_id: string;
  food_name: string;
  quantity_g: number;
  calories: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
  is_estimated: boolean;
  image_url: string | null;
  logged_at: string;
  created_at: string;
}

export interface USDAFoodItem {
  fdcId: number;
  description: string;
  foodNutrients: Array<{
    nutrientId: number;
    nutrientName: string;
    unitName: string;
    value: number;
  }>;
}

export interface DailyTotals {
  date: string;
  calories: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
  target_calories: number;
  adherence_pct: number;
}
