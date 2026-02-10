import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { getProfile, computeHealthMetrics } from '@/actions/profile';

export const revalidate = 30;

function getWeekDates(): string[] {
  const out: string[] = [];
  const d = new Date();
  for (let i = 6; i >= 0; i--) {
    const x = new Date(d);
    x.setDate(x.getDate() - i);
    out.push(x.toISOString().slice(0, 10));
  }
  return out;
}

export default async function DashboardPage() {
  const profile = await getProfile();
  if (!profile) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-8">
        <p className="text-zinc-400 mb-4">Set up your profile to see your dashboard.</p>
        <Link href="/profile" className="text-brand-500 hover:underline">
          Go to profile →
        </Link>
      </div>
    );
  }

  const metrics = computeHealthMetrics(profile);
  const supabase = await createClient();
  const today = new Date().toISOString().slice(0, 10);
  const { data: todayEntries } = await supabase
    .from('food_entries')
    .select('calories, protein_g, carbs_g, fat_g')
    .eq('logged_at', today);

  const dayTotals = {
    calories: todayEntries?.reduce((s, e) => s + Number(e.calories), 0) ?? 0,
    protein_g: todayEntries?.reduce((s, e) => s + Number(e.protein_g), 0) ?? 0,
    carbs_g: todayEntries?.reduce((s, e) => s + Number(e.carbs_g), 0) ?? 0,
    fat_g: todayEntries?.reduce((s, e) => s + Number(e.fat_g), 0) ?? 0,
  };

  const weekDates = getWeekDates();
  const { data: weekEntries } = await supabase
    .from('food_entries')
    .select('logged_at, calories')
    .in('logged_at', weekDates);

  const byDate = new Map<string, number>();
  weekEntries?.forEach((e) => {
    const d = e.logged_at as string;
    byDate.set(d, (byDate.get(d) ?? 0) + Number(e.calories));
  });
  const weekTargetTotal = metrics.goal_calories * 7;
  const weekActualTotal = weekDates.reduce((s, d) => s + (byDate.get(d) ?? 0), 0);
  const adherencePct =
    weekTargetTotal > 0
      ? Math.round((Math.min(weekActualTotal, weekTargetTotal) / weekTargetTotal) * 100)
      : 0;

  const calPct =
    metrics.goal_calories > 0
      ? Math.min(100, Math.round((dayTotals.calories / metrics.goal_calories) * 100))
      : 0;
  const proteinPct =
    metrics.protein_g > 0
      ? Math.min(100, Math.round((dayTotals.protein_g / metrics.protein_g) * 100))
      : 0;

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="text-2xl font-bold text-white mb-8">Dashboard</h1>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-5">
          <p className="text-sm text-zinc-400">BMI</p>
          <p className="text-2xl font-semibold text-white">{metrics.bmi}</p>
        </div>
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-5">
          <p className="text-sm text-zinc-400">Daily target</p>
          <p className="text-2xl font-semibold text-white">{metrics.goal_calories} kcal</p>
        </div>
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-5">
          <p className="text-sm text-zinc-400">Protein target</p>
          <p className="text-2xl font-semibold text-white">{metrics.protein_g}g</p>
        </div>
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-5">
          <p className="text-sm text-zinc-400">Weekly adherence</p>
          <p className="text-2xl font-semibold text-white">{adherencePct}%</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2 mb-8">
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-5">
          <h2 className="text-lg font-medium text-white mb-3">Today&apos;s calories</h2>
          <div className="flex items-end gap-2 h-8">
            <div className="flex-1 rounded bg-zinc-700 overflow-hidden">
              <div
                className="h-full bg-brand-500 transition-all"
                style={{ width: `${calPct}%` }}
              />
            </div>
            <span className="text-sm text-zinc-400 whitespace-nowrap">
              {dayTotals.calories} / {metrics.goal_calories}
            </span>
          </div>
        </div>
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-5">
          <h2 className="text-lg font-medium text-white mb-3">Today&apos;s protein</h2>
          <div className="flex items-end gap-2 h-8">
            <div className="flex-1 rounded bg-zinc-700 overflow-hidden">
              <div
                className="h-full bg-brand-600 transition-all"
                style={{ width: `${proteinPct}%` }}
              />
            </div>
            <span className="text-sm text-zinc-400 whitespace-nowrap">
              {Math.round(dayTotals.protein_g)}g / {metrics.protein_g}g
            </span>
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-5 mb-8">
        <h2 className="text-lg font-medium text-white mb-3">Macros today</h2>
        <div className="flex flex-wrap gap-4 text-sm">
          <span className="text-zinc-400">
            Carbs: <strong className="text-white">{Math.round(dayTotals.carbs_g)}g</strong> (target {metrics.carbs_g}g)
          </span>
          <span className="text-zinc-400">
            Fat: <strong className="text-white">{Math.round(dayTotals.fat_g)}g</strong> (target {metrics.fat_g}g)
          </span>
        </div>
      </div>

      <Link
        href="/log"
        className="inline-flex rounded-lg bg-brand-500 px-5 py-2.5 font-medium text-white hover:bg-brand-600"
      >
        Log food
      </Link>
    </div>
  );
}
