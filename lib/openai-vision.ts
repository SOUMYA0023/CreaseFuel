import OpenAI from 'openai';

const OPENAI_MODEL = 'gpt-4o';

export interface VisionEstimate {
  food_name: string;
  quantity_g: number;
  calories: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
}

export async function estimateFromImage(
  imageUrl: string,
  apiKey: string
): Promise<VisionEstimate | null> {
  const openai = new OpenAI({ apiKey });
  const res = await openai.chat.completions.create({
    model: OPENAI_MODEL,
    max_tokens: 300,
    messages: [
      {
        role: 'user',
        content: [
          {
            type: 'text',
            text: `Analyze this food image. Respond with ONLY a single JSON object (no markdown, no code block) with keys: food_name (string), quantity_g (number, estimated total grams), calories (number), protein_g (number), carbs_g (number), fat_g (number). Estimate for the entire portion shown.`,
          },
          { type: 'image_url', image_url: { url: imageUrl } },
        ],
      },
    ],
  });
  const raw = res.choices[0]?.message?.content?.trim();
  if (!raw) return null;
  const cleaned = raw.replace(/^```\w*\n?|\n?```$/g, '').trim();
  try {
    const parsed = JSON.parse(cleaned) as VisionEstimate;
    if (
      typeof parsed.food_name !== 'string' ||
      typeof parsed.quantity_g !== 'number' ||
      typeof parsed.calories !== 'number'
    ) {
      return null;
    }
    return {
      food_name: parsed.food_name,
      quantity_g: Math.round(parsed.quantity_g),
      calories: Math.round(parsed.calories),
      protein_g: Number((parsed.protein_g ?? 0).toFixed(1)),
      carbs_g: Number((parsed.carbs_g ?? 0).toFixed(1)),
      fat_g: Number((parsed.fat_g ?? 0).toFixed(1)),
    };
  } catch {
    return null;
  }
}
