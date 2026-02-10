'use server';

import { createClient } from '@/lib/supabase/server';
import type { ActivityLevel, Goal, Gender } from '@/types';
import {
  bmi,
  bmrMifflinStJeor,
  maintenanceCalories,
  goalCalories,
  macroSplit,
} from '@/lib/health';
import type { HealthMetrics } from '@/types';

export async function getProfile() {
  const supabase = await createClient();
  if (!supabase) return null;
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;
  const { data } = await supabase
    .from('profiles')
    .select('*')
    .eq('user_id', user.id)
    .single();
  return data;
}

export async function upsertProfile(params: {
  age: number;
  gender: Gender;
  height_cm: number;
  weight_kg: number;
  activity_level: ActivityLevel;
  goal: Goal;
  athlete_mode: boolean;
}) {
  const supabase = await createClient();
  if (!supabase) return { error: 'Unauthorized' };
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: 'Unauthorized' };
  const { error } = await supabase.from('profiles').upsert(
    {
      user_id: user.id,
      ...params,
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'user_id' }
  );
  if (error) return { error: error.message };
  return {};
}

export function computeHealthMetrics(profile: {
  age: number;
  gender: Gender;
  height_cm: number;
  weight_kg: number;
  activity_level: ActivityLevel;
  goal: Goal;
  athlete_mode: boolean;
}): HealthMetrics {
  const bmr = bmrMifflinStJeor(
    profile.weight_kg,
    profile.height_cm,
    profile.age,
    profile.gender
  );
  const maintenance = maintenanceCalories(bmr, profile.activity_level);
  const goal = goalCalories(maintenance, profile.goal);
  const { protein_g, carbs_g, fat_g } = macroSplit(
    profile.weight_kg,
    goal,
    profile.athlete_mode
  );
  return {
    bmi: bmi(profile.weight_kg, profile.height_cm),
    bmr,
    maintenance_calories: maintenance,
    goal_calories: goal,
    protein_g,
    carbs_g,
    fat_g,
  };
}
