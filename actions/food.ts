'use server';

import { createClient } from '@/lib/supabase/server';
import { getUSDAFood, parseUSDAFood } from '@/lib/usda';
import { estimateFromImage } from '@/lib/openai-vision';

export async function logFoodManual(params: {
  fdcId: number;
  foodName: string;
  quantity_g: number;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: 'Unauthorized' };
  const apiKey = process.env.USDA_API_KEY;
  if (!apiKey) return { error: 'USDA API not configured' };
  const food = await getUSDAFood(params.fdcId, apiKey);
  if (!food) return { error: 'Food not found' };
  const nutrients = parseUSDAFood(food, params.quantity_g);
  const { error } = await supabase.from('food_entries').insert({
    user_id: user.id,
    food_name: params.foodName,
    quantity_g: params.quantity_g,
    calories: nutrients.calories,
    protein_g: nutrients.protein_g,
    carbs_g: nutrients.carbs_g,
    fat_g: nutrients.fat_g,
    is_estimated: false,
    image_url: null,
    logged_at: new Date().toISOString().slice(0, 10),
  });
  if (error) return { error: error.message };
  return {};
}

export async function logFoodFromImage(params: {
  imagePath: string;
  foodName: string;
  quantity_g: number;
  calories: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: 'Unauthorized' };
  const { data: urlData } = supabase.storage
    .from('food-images')
    .getPublicUrl(params.imagePath);
  const { error } = await supabase.from('food_entries').insert({
    user_id: user.id,
    food_name: params.foodName,
    quantity_g: params.quantity_g,
    calories: params.calories,
    protein_g: params.protein_g,
    carbs_g: params.carbs_g,
    fat_g: params.fat_g,
    is_estimated: true,
    image_url: urlData.publicUrl,
    logged_at: new Date().toISOString().slice(0, 10),
  });
  if (error) return { error: error.message };
  return {};
}

export async function deleteFoodEntry(id: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: 'Unauthorized' };
  const { error } = await supabase
    .from('food_entries')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id);
  if (error) return { error: error.message };
  return {};
}

export async function getVisionEstimate(imageUrl: string) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return { error: 'OpenAI not configured', estimate: null };
  const estimate = await estimateFromImage(imageUrl, apiKey);
  return { error: null, estimate };
}
