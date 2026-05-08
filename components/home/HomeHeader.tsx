import Link from 'next/link';
import { Bell, Clock, Settings } from 'lucide-react';
import ThemeToggle from '@/components/ui/ThemeToggle';

export default function HomeHeader() {
  return (
    <header className="sticky top-0 z-50 flex items-center px-4 pt-10 pb-4 bg-zinc-50/95 dark:bg-zinc-950/95 backdrop-blur-sm border-b border-zinc-200 dark:border-zinc-800">
      <div className="flex items-center justify-between w-full">
        <Link
          href="/mypage"
          className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center text-sm font-bold text-black cursor-pointer hover:opacity-80 transition"
        >
          Y
        </Link>

        <div className="flex items-center gap-4 text-zinc-500 dark:text-zinc-400">
          <ThemeToggle className="w-8 h-8 hover:bg-zinc-200 dark:hover:bg-zinc-800 hover:text-zinc-900 dark:hover:text-zinc-100" />
          <Bell className="w-6 h-6 cursor-pointer hover:text-zinc-900 dark:hover:text-white transition" />
          <Clock className="w-6 h-6 cursor-pointer hover:text-zinc-900 dark:hover:text-white transition" />
          <Link href="/mypage">
            <Settings className="w-6 h-6 cursor-pointer hover:text-zinc-900 dark:hover:text-white transition" />
          </Link>
        </div>
      </div>
    </header>
  );
}
