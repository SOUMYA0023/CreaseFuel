'use server';

import { createClient } from '@/lib/supabase/server';
import type { ActivityLevel, Goal, Gender } from '@/types';

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
