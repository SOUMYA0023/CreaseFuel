import type { USDAFoodItem } from '@/types';

const USDA_API = 'https://api.nal.usda.gov/fdc/v1';
const NUTRIENT_IDS = {
  calories: 1008,
  protein: 1003,
  carbs: 1005,
  fat: 1004,
};

function getNutrient(food: USDAFoodItem, nutrientId: number): number {
  const n = food.foodNutrients?.find((x) => x.nutrientId === nutrientId);
  return n ? Number(n.value) : 0;
}

export function parseUSDAFood(
  food: USDAFoodItem,
  quantityG: number
): { calories: number; protein_g: number; carbs_g: number; fat_g: number } {
  const scale = quantityG / 100;
  return {
    calories: Math.round(getNutrient(food, NUTRIENT_IDS.calories) * scale),
    protein_g: Number((getNutrient(food, NUTRIENT_IDS.protein) * scale).toFixed(1)),
    carbs_g: Number((getNutrient(food, NUTRIENT_IDS.carbs) * scale).toFixed(1)),
    fat_g: Number((getNutrient(food, NUTRIENT_IDS.fat) * scale).toFixed(1)),
  };
}

export async function searchUSDA(
  query: string,
  apiKey: string
): Promise<USDAFoodItem[]> {
  const res = await fetch(
    `${USDA_API}/foods/search?api_key=${encodeURIComponent(apiKey)}&query=${encodeURIComponent(query)}&pageSize=5&dataType=Survey%20Foods,Foundation%20Foods,SR%20Legacy`
  );
  if (!res.ok) return [];
  const data = await res.json();
  return data.foods ?? [];
}

export async function getUSDAFood(fdcId: number, apiKey: string): Promise<USDAFoodItem | null> {
  const res = await fetch(
    `${USDA_API}/food/${fdcId}?api_key=${encodeURIComponent(apiKey)}`
  );
  if (!res.ok) return null;
  return res.json();
}
