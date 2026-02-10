import Link from 'next/link';
import { signOut } from '@/actions/auth';

export default function DashboardNav() {
  return (
    <nav className="border-b border-zinc-800 bg-zinc-900/50">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
        <Link href="/dashboard" className="text-lg font-semibold text-white">
          CreaseFuel
        </Link>
        <div className="flex items-center gap-6">
          <Link href="/dashboard" className="text-sm text-zinc-400 hover:text-white">
            Dashboard
          </Link>
          <Link href="/log" className="text-sm text-zinc-400 hover:text-white">
            Log food
          </Link>
          <Link href="/profile" className="text-sm text-zinc-400 hover:text-white">
            Profile
          </Link>
          <form action={signOut}>
            <button type="submit" className="text-sm text-zinc-400 hover:text-white">
              Sign out
            </button>
          </form>
        </div>
      </div>
    </nav>
  );
}
