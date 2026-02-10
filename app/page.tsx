import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';

export default async function HomePage() {
  const supabase = await createClient();
  const user = supabase ? (await supabase.auth.getUser()).data.user : null;

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-zinc-950 to-zinc-900 px-4">
      <h1 className="text-4xl font-bold tracking-tight text-white mb-2">
        CreaseFuel
      </h1>
      <p className="text-zinc-400 mb-10">Track nutrition. Hit your goals.</p>
      {user ? (
        <Link
          href="/dashboard"
          className="rounded-lg bg-brand-500 px-6 py-3 font-medium text-white hover:bg-brand-600 transition"
        >
          Dashboard
        </Link>
      ) : (
        <div className="flex gap-4">
          <Link
            href="/login"
            className="rounded-lg bg-brand-500 px-6 py-3 font-medium text-white hover:bg-brand-600 transition"
          >
            Sign in
          </Link>
          <Link
            href="/login"
            className="rounded-lg border border-zinc-600 px-6 py-3 font-medium text-zinc-300 hover:bg-zinc-800 transition"
          >
            Sign up
          </Link>
        </div>
      )}
    </main>
  );
}
