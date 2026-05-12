import Link from 'next/link';
import { Bell, Clock, Settings, LogIn } from 'lucide-react';
import ThemeToggle from '@/components/ui/ThemeToggle';
import { createSupabaseServerClient } from '@/lib/server/supabaseAuth';
import { getDisplayName } from '@/lib/server/profiles';

export default async function HomeHeader() {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  const profileName = user ? await getDisplayName(supabase, user.id) : null;
  const displayName = profileName || user?.email?.split("@")[0] || "";
  const initial = displayName.slice(0, 1).toUpperCase() || "?";

  return (
    <header className="sticky top-0 z-50 flex items-center px-4 pt-10 pb-4 bg-zinc-50/95 dark:bg-zinc-950/95 backdrop-blur-sm border-b border-zinc-200 dark:border-zinc-800">
      <div className="flex items-center justify-between w-full">
        {user ? (
          <Link
            href="/mypage"
            className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center text-sm font-bold text-black cursor-pointer hover:opacity-80 transition"
            title={displayName}
          >
            {initial}
          </Link>
        ) : (
          <Link
            href="/login"
            className="flex items-center gap-1.5 px-3 h-8 rounded-full bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 text-xs font-semibold hover:opacity-90 transition"
          >
            <LogIn className="w-3.5 h-3.5" />
            ログイン
          </Link>
        )}

        <div className="flex items-center gap-4 text-zinc-500 dark:text-zinc-400">
          <ThemeToggle className="w-8 h-8 hover:bg-zinc-200 dark:hover:bg-zinc-800 hover:text-zinc-900 dark:hover:text-zinc-100" />
          <span aria-disabled="true" title="準備中" className="inline-flex cursor-not-allowed text-zinc-300 dark:text-zinc-600">
            <Bell className="w-6 h-6" />
          </span>
          <span aria-disabled="true" title="準備中" className="inline-flex cursor-not-allowed text-zinc-300 dark:text-zinc-600">
            <Clock className="w-6 h-6" />
          </span>
          <Link href={user ? "/mypage" : "/login"}>
            <Settings className="w-6 h-6 cursor-pointer hover:text-zinc-900 dark:hover:text-white transition" />
          </Link>
        </div>
      </div>
    </header>
  );
}
