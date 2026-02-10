import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import LoginForm from '@/components/LoginForm';

export default async function LoginPage() {
  const supabase = await createClient();
  if (supabase) {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) redirect('/dashboard');
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-zinc-950 px-4">
      <h1 className="text-2xl font-bold text-white mb-6">CreaseFuel</h1>
      <LoginForm />
    </main>
  );
}
