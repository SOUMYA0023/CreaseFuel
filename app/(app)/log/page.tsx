import { createClient } from '@/lib/supabase/server';
import { getProfile } from '@/actions/profile';
import { computeHealthMetrics } from '@/lib/health';
import LogFoodClient from '@/components/LogFoodClient';

export const revalidate = 0;

export default async function LogPage() {
  const profile = await getProfile();
  const metrics = profile ? computeHealthMetrics(profile) : null;
  const supabase = await createClient();
  const today = new Date().toISOString().slice(0, 10);
  let entries: unknown[] = [];
  if (supabase) {
    const { data } = await supabase.from('food_entries').select('*').eq('logged_at', today).order('created_at', { ascending: false });
    entries = data ?? [];
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="text-2xl font-bold text-white mb-6">Log food</h1>
      <LogFoodClient
        metrics={metrics}
        entries={entries ?? []}
        today={today}
      />
    </div>
  );
}
