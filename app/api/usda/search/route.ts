import { NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { searchUSDA } from '@/lib/usda';
import { rateLimit } from '@/lib/rate-limit';

export const revalidate = 0;

export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const key = user.id;
  if (!rateLimit(key)) {
    return Response.json({ error: 'Too many requests' }, { status: 429 });
  }
  const q = request.nextUrl.searchParams.get('q');
  if (!q || q.length > 200) {
    return Response.json({ error: 'Invalid query' }, { status: 400 });
  }
  const apiKey = process.env.USDA_API_KEY;
  if (!apiKey) {
    return Response.json({ error: 'Service unavailable' }, { status: 503 });
  }
  const foods = await searchUSDA(q, apiKey);
  return Response.json({ foods });
}
