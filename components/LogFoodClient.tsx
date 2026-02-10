'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { logFoodManual, logFoodFromImage, getVisionEstimate, deleteFoodEntry } from '@/actions/food';
import type { HealthMetrics } from '@/types';
import type { USDAFoodItem } from '@/types';

interface EntryRow {
  id: string;
  food_name: string;
  quantity_g: number;
  calories: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
  is_estimated: boolean;
}

export default function LogFoodClient({
  metrics,
  entries,
  today,
}: {
  metrics: HealthMetrics | null;
  entries: EntryRow[];
  today: string;
}) {
  const router = useRouter();
  const [mode, setMode] = useState<'manual' | 'image'>('manual');
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<USDAFoodItem[]>([]);
  const [selectedFood, setSelectedFood] = useState<USDAFoodItem | null>(null);
  const [quantityG, setQuantityG] = useState('');
  const [searching, setSearching] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploadedImagePath, setUploadedImagePath] = useState<string | null>(null);
  const [visionEstimate, setVisionEstimate] = useState<{
    food_name: string;
    quantity_g: number;
    calories: number;
    protein_g: number;
    carbs_g: number;
    fat_g: number;
  } | null>(null);
  const [visionLoading, setVisionLoading] = useState(false);
  const [error, setError] = useState('');

  async function search() {
    if (!query.trim()) return;
    setError('');
    setSearching(true);
    try {
      const res = await fetch(
        `/api/usda/search?q=${encodeURIComponent(query.trim())}`
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Search failed');
      setResults(data.foods ?? []);
      setSelectedFood(null);
      setQuantityG('');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Search failed');
      setResults([]);
    } finally {
      setSearching(false);
    }
  }

  async function submitManual() {
    if (!selectedFood || !quantityG) return;
    const q = parseFloat(quantityG);
    if (isNaN(q) || q <= 0) {
      setError('Enter a valid quantity (grams)');
      return;
    }
    setError('');
    setSubmitting(true);
    const result = await logFoodManual({
      fdcId: selectedFood.fdcId,
      foodName: selectedFood.description,
      quantity_g: q,
    });
    setSubmitting(false);
    if (result.error) {
      setError(result.error);
      return;
    }
    router.refresh();
    setSelectedFood(null);
    setQuantityG('');
    setQuery('');
    setResults([]);
  }

  async function onImageSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
    setVisionEstimate(null);
    setUploadedImagePath(null);
  }

  async function analyzeImage() {
    if (!imageFile) return;
    setError('');
    setVisionLoading(true);
    try {
      const supabase = (await import('@/lib/supabase/client')).createClient();
      const ext = imageFile.name.split('.').pop() || 'jpg';
      const path = `${today}-${Date.now()}.${ext}`;
      const { error: upError } = await supabase.storage
        .from('food-images')
        .upload(path, imageFile, { upsert: true });
      if (upError) {
        setError(upError.message);
        setVisionLoading(false);
        return;
      }
      setUploadedImagePath(path);
      const { data } = supabase.storage.from('food-images').getPublicUrl(path);
      const { error: visionErr, estimate } = await getVisionEstimate(data.publicUrl);
      if (visionErr || !estimate) {
        setError(visionErr ?? 'Could not analyze image');
        setVisionLoading(false);
        return;
      }
      setVisionEstimate(estimate);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Image analysis failed');
    } finally {
      setVisionLoading(false);
    }
  }

  async function submitImage() {
    if (!visionEstimate || !uploadedImagePath) return;
    setError('');
    setSubmitting(true);
    const result = await logFoodFromImage({
      imagePath: uploadedImagePath,
      foodName: visionEstimate.food_name,
      quantity_g: visionEstimate.quantity_g,
      calories: visionEstimate.calories,
      protein_g: visionEstimate.protein_g,
      carbs_g: visionEstimate.carbs_g,
      fat_g: visionEstimate.fat_g,
    });
    setSubmitting(false);
    if (result.error) {
      setError(result.error);
      return;
    }
    router.refresh();
    setImageFile(null);
    setImagePreview(null);
    setVisionEstimate(null);
    setUploadedImagePath(null);
  }

  async function remove(id: string) {
    const result = await deleteFoodEntry(id);
    if (!result.error) router.refresh();
  }

  const dayTotal = entries.reduce(
    (acc, e) => ({
      calories: acc.calories + Number(e.calories),
      protein_g: acc.protein_g + Number(e.protein_g),
    }),
    { calories: 0, protein_g: 0 }
  );

  return (
    <div className="space-y-8">
      {metrics && (
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4 text-sm text-zinc-400">
          Today: {dayTotal.calories} / {metrics.goal_calories} kcal · Protein:{' '}
          {Math.round(dayTotal.protein_g)}g / {metrics.protein_g}g
        </div>
      )}

      <div className="flex gap-2 border-b border-zinc-800 pb-2">
        <button
          type="button"
          onClick={() => setMode('manual')}
          className={`rounded-lg px-4 py-2 text-sm font-medium ${
            mode === 'manual'
              ? 'bg-brand-500 text-white'
              : 'text-zinc-400 hover:text-white'
          }`}
        >
          Manual entry
        </button>
        <button
          type="button"
          onClick={() => setMode('image')}
          className={`rounded-lg px-4 py-2 text-sm font-medium ${
            mode === 'image'
              ? 'bg-brand-500 text-white'
              : 'text-zinc-400 hover:text-white'
          }`}
        >
          Image upload
        </button>
      </div>

      {mode === 'manual' && (
        <div className="space-y-4">
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Search USDA food..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), search())}
              className="flex-1 rounded-lg border border-zinc-600 bg-zinc-900 px-4 py-2 text-white placeholder-zinc-500 focus:border-brand-500 focus:outline-none"
            />
            <button
              type="button"
              onClick={search}
              disabled={searching}
              className="rounded-lg bg-brand-500 px-4 py-2 text-white hover:bg-brand-600 disabled:opacity-50"
            >
              {searching ? 'Searching…' : 'Search'}
            </button>
          </div>
          {results.length > 0 && (
            <ul className="rounded-lg border border-zinc-700 divide-y divide-zinc-700">
              {results.map((f) => (
                <li key={f.fdcId}>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedFood(f);
                      setQuantityG('100');
                    }}
                    className={`w-full text-left px-4 py-3 hover:bg-zinc-800 ${
                      selectedFood?.fdcId === f.fdcId ? 'bg-zinc-800' : ''
                    }`}
                  >
                    {f.description}
                  </button>
                </li>
              ))}
            </ul>
          )}
          {selectedFood && (
            <div className="rounded-lg border border-zinc-700 p-4 space-y-3">
              <p className="text-white font-medium">{selectedFood.description}</p>
              <div className="flex gap-2 items-center">
                <input
                  type="number"
                  min={1}
                  step={1}
                  value={quantityG}
                  onChange={(e) => setQuantityG(e.target.value)}
                  placeholder="Grams"
                  className="w-28 rounded-lg border border-zinc-600 bg-zinc-900 px-3 py-2 text-white focus:border-brand-500 focus:outline-none"
                />
                <span className="text-zinc-400">grams</span>
                <button
                  type="button"
                  onClick={submitManual}
                  disabled={submitting}
                  className="rounded-lg bg-brand-500 px-4 py-2 text-white hover:bg-brand-600 disabled:opacity-50"
                >
                  {submitting ? 'Adding…' : 'Add entry'}
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {mode === 'image' && (
        <div className="space-y-4">
          <label className="block">
            <span className="sr-only">Choose image</span>
            <input
              type="file"
              accept="image/*"
              onChange={onImageSelect}
              className="block w-full text-sm text-zinc-400 file:mr-4 file:rounded file:border-0 file:bg-brand-500 file:px-4 file:py-2 file:text-white"
            />
          </label>
          {imagePreview && (
            <div className="space-y-3">
              <img
                src={imagePreview}
                alt="Food"
                className="max-h-48 rounded-lg object-cover"
              />
              {!visionEstimate ? (
                <button
                  type="button"
                  onClick={analyzeImage}
                  disabled={visionLoading}
                  className="rounded-lg bg-brand-500 px-4 py-2 text-white hover:bg-brand-600 disabled:opacity-50"
                >
                  {visionLoading ? 'Analyzing…' : 'Estimate with AI'}
                </button>
              ) : (
                <div className="rounded-lg border border-amber-800/50 bg-amber-950/20 p-4 space-y-2">
                  <p className="text-amber-200 font-medium">Estimated (AI)</p>
                  <p className="text-white">{visionEstimate.food_name} · {visionEstimate.quantity_g}g</p>
                  <p className="text-zinc-400 text-sm">
                    {visionEstimate.calories} kcal · P {visionEstimate.protein_g}g C {visionEstimate.carbs_g}g F {visionEstimate.fat_g}g
                  </p>
                  <button
                    type="button"
                    onClick={submitImage}
                    disabled={submitting}
                    className="rounded-lg bg-brand-500 px-4 py-2 text-white hover:bg-brand-600 disabled:opacity-50"
                  >
                    {submitting ? 'Adding…' : 'Add estimated entry'}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {error && <p className="text-sm text-red-400">{error}</p>}

      <div>
        <h2 className="text-lg font-medium text-white mb-3">Today&apos;s entries</h2>
        {entries.length === 0 ? (
          <p className="text-zinc-500 text-sm">No entries yet.</p>
        ) : (
          <ul className="space-y-2">
            {entries.map((e) => (
              <li
                key={e.id}
                className="flex items-center justify-between rounded-lg border border-zinc-800 bg-zinc-900/50 px-4 py-3"
              >
                <div>
                  <p className="text-white font-medium">
                    {e.food_name}
                    {e.is_estimated && (
                      <span className="ml-2 text-xs text-amber-400">(estimated)</span>
                    )}
                  </p>
                  <p className="text-sm text-zinc-400">
                    {e.quantity_g}g · {e.calories} kcal · P {Number(e.protein_g).toFixed(0)}g
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => remove(e.id)}
                  className="text-zinc-500 hover:text-red-400 text-sm"
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
