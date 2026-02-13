import { createSupabaseServerClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import LoginForm from '@/components/LoginForm';

export default async function LoginPage() {
  const supabase = createSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    redirect('/dashboard');
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-b from-zinc-950 to-zinc-900 px-4">
      <div className="w-full max-w-md space-y-6 rounded-2xl border border-zinc-800 bg-zinc-900/60 p-8">
        <div className="space-y-1 text-center">
          <h1 className="text-2xl font-semibold text-white">Welcome back</h1>
          <p className="text-sm text-zinc-400">Sign in to continue tracking.</p>
        </div>
        <LoginForm />
      </div>
    </main>
  );
}
