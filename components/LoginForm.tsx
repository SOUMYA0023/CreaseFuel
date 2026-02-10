'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';

export default function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);

  const supabase = createClient();

  async function handleSignIn(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) {
      setMessage({ type: 'err', text: error.message });
      return;
    }
    window.location.href = '/dashboard';
  }

  async function handleSignUp(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    const { error } = await supabase.auth.signUp({ email, password });
    setLoading(false);
    if (error) {
      setMessage({ type: 'err', text: error.message });
      return;
    }
    setMessage({ type: 'ok', text: 'Check your email to confirm, or sign in if you already have an account.' });
  }

  async function handleGoogle() {
    setLoading(true);
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/callback` },
    });
  }

  return (
    <div className="w-full max-w-sm space-y-4">
      <form onSubmit={handleSignIn} className="space-y-3">
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="w-full rounded-lg border border-zinc-600 bg-zinc-900 px-4 py-2.5 text-white placeholder-zinc-500 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="w-full rounded-lg border border-zinc-600 bg-zinc-900 px-4 py-2.5 text-white placeholder-zinc-500 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
        />
        <div className="flex gap-2">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 rounded-lg bg-brand-500 py-2.5 font-medium text-white hover:bg-brand-600 disabled:opacity-50"
          >
            {loading ? '…' : 'Sign in'}
          </button>
          <button
            type="button"
            disabled={loading}
            onClick={handleSignUp}
            className="flex-1 rounded-lg border border-zinc-600 py-2.5 font-medium text-zinc-300 hover:bg-zinc-800 disabled:opacity-50"
          >
            Sign up
          </button>
        </div>
      </form>
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-zinc-700" />
        </div>
        <span className="relative flex justify-center text-xs text-zinc-500">or</span>
      </div>
      <button
        type="button"
        onClick={handleGoogle}
        disabled={loading}
        className="w-full rounded-lg border border-zinc-600 bg-zinc-900 py-2.5 font-medium text-zinc-300 hover:bg-zinc-800 disabled:opacity-50"
      >
        Continue with Google
      </button>
      {message && (
        <p className={message.type === 'err' ? 'text-red-400 text-sm' : 'text-brand-400 text-sm'}>
          {message.text}
        </p>
      )}
      <p className="text-center text-sm text-zinc-500">
        Use Sign up for a new account, or Sign in with Google.
      </p>
    </div>
  );
}
