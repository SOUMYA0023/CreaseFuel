'use client';

import { useState } from 'react';
import { upsertProfile } from '@/actions/profile';
import type { ActivityLevel, Goal, Gender } from '@/types';

const ACTIVITY_OPTIONS: { value: ActivityLevel; label: string }[] = [
  { value: 'sedentary', label: 'Sedentary' },
  { value: 'light', label: 'Light' },
  { value: 'moderate', label: 'Moderate' },
  { value: 'high', label: 'High' },
  { value: 'athlete', label: 'Athlete' },
];

const GOAL_OPTIONS: { value: Goal; label: string }[] = [
  { value: 'lose_weight', label: 'Lose weight' },
  { value: 'maintain', label: 'Maintain' },
  { value: 'gain_weight', label: 'Gain weight' },
];

export default function ProfileForm({
  defaultValues,
}: {
  defaultValues?: Partial<{
    age: number;
    gender: Gender;
    height_cm: number;
    weight_kg: number;
    activity_level: ActivityLevel;
    goal: Goal;
    athlete_mode: boolean;
  }>;
}) {
  const [age, setAge] = useState(String(defaultValues?.age ?? ''));
  const [gender, setGender] = useState<Gender>(defaultValues?.gender ?? 'other');
  const [heightCm, setHeightCm] = useState(String(defaultValues?.height_cm ?? ''));
  const [weightKg, setWeightKg] = useState(String(defaultValues?.weight_kg ?? ''));
  const [activityLevel, setActivityLevel] = useState<ActivityLevel>(
    defaultValues?.activity_level ?? 'moderate'
  );
  const [goal, setGoal] = useState<Goal>(defaultValues?.goal ?? 'maintain');
  const [athleteMode, setAthleteMode] = useState(defaultValues?.athlete_mode ?? false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    const a = parseInt(age, 10);
    const h = parseFloat(heightCm);
    const w = parseFloat(weightKg);
    if (isNaN(a) || a < 10 || a > 120) {
      setError('Age must be 10–120');
      return;
    }
    if (isNaN(h) || h <= 0) {
      setError('Height must be positive');
      return;
    }
    if (isNaN(w) || w <= 0) {
      setError('Weight must be positive');
      return;
    }
    setLoading(true);
    const result = await upsertProfile({
      age: a,
      gender,
      height_cm: h,
      weight_kg: w,
      activity_level: activityLevel,
      goal,
      athlete_mode: athleteMode,
    });
    setLoading(false);
    if (result.error) {
      setError(result.error);
      return;
    }
    window.location.href = '/dashboard';
  }

  return (
    <form onSubmit={submit} className="mx-auto max-w-md space-y-4">
      <div>
        <label className="mb-1 block text-sm text-zinc-400">Age</label>
        <input
          type="number"
          min={10}
          max={120}
          value={age}
          onChange={(e) => setAge(e.target.value)}
          className="w-full rounded-lg border border-zinc-600 bg-zinc-900 px-4 py-2 text-white focus:border-brand-500 focus:outline-none"
        />
      </div>
      <div>
        <label className="mb-1 block text-sm text-zinc-400">Gender</label>
        <select
          value={gender}
          onChange={(e) => setGender(e.target.value as Gender)}
          className="w-full rounded-lg border border-zinc-600 bg-zinc-900 px-4 py-2 text-white focus:border-brand-500 focus:outline-none"
        >
          <option value="male">Male</option>
          <option value="female">Female</option>
          <option value="other">Other</option>
        </select>
      </div>
      <div>
        <label className="mb-1 block text-sm text-zinc-400">Height (cm)</label>
        <input
          type="number"
          min={1}
          step={0.1}
          value={heightCm}
          onChange={(e) => setHeightCm(e.target.value)}
          className="w-full rounded-lg border border-zinc-600 bg-zinc-900 px-4 py-2 text-white focus:border-brand-500 focus:outline-none"
        />
      </div>
      <div>
        <label className="mb-1 block text-sm text-zinc-400">Weight (kg)</label>
        <input
          type="number"
          min={1}
          step={0.1}
          value={weightKg}
          onChange={(e) => setWeightKg(e.target.value)}
          className="w-full rounded-lg border border-zinc-600 bg-zinc-900 px-4 py-2 text-white focus:border-brand-500 focus:outline-none"
        />
      </div>
      <div>
        <label className="mb-1 block text-sm text-zinc-400">Activity level</label>
        <select
          value={activityLevel}
          onChange={(e) => setActivityLevel(e.target.value as ActivityLevel)}
          className="w-full rounded-lg border border-zinc-600 bg-zinc-900 px-4 py-2 text-white focus:border-brand-500 focus:outline-none"
        >
          {ACTIVITY_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="mb-1 block text-sm text-zinc-400">Goal</label>
        <select
          value={goal}
          onChange={(e) => setGoal(e.target.value as Goal)}
          className="w-full rounded-lg border border-zinc-600 bg-zinc-900 px-4 py-2 text-white focus:border-brand-500 focus:outline-none"
        >
          {GOAL_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </div>
      <label className="flex items-center gap-2 text-zinc-300">
        <input
          type="checkbox"
          checked={athleteMode}
          onChange={(e) => setAthleteMode(e.target.checked)}
          className="rounded border-zinc-600 bg-zinc-900 text-brand-500 focus:ring-brand-500"
        />
        Athlete mode (higher protein)
      </label>
      {error && <p className="text-sm text-red-400">{error}</p>}
      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-lg bg-brand-500 py-2.5 font-medium text-white hover:bg-brand-600 disabled:opacity-50"
      >
        {loading ? 'Saving…' : 'Save profile'}
      </button>
    </form>
  );
}
