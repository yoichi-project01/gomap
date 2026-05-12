'use client'

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Search, Library, User } from 'lucide-react';

export default function BottomNav() {
  const pathname = usePathname() || '';

  const getNavClass = (basePath: string) => {
    const active = basePath === '/'
      ? pathname === '/'
      : pathname.startsWith(basePath);

    return `flex flex-col items-center gap-1.5 transition-colors ${
      active
        ? 'text-zinc-900 dark:text-white'
        : 'text-zinc-400 dark:text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'
    }`;
  };

  return (
    <div className="fixed bottom-0 left-0 w-full bg-gradient-to-t from-zinc-50 via-zinc-50/95 to-transparent dark:from-zinc-950 dark:via-zinc-950/95 dark:to-transparent pt-12 pb-6 px-6 z-50">
      <div className="flex justify-between items-center max-w-md mx-auto">
        <Link href="/" className={getNavClass('/')}>
          <Home className="w-6 h-6" />
          <span className="text-[10px] font-medium">ホーム</span>
        </Link>

        <Link href="/filter" className={getNavClass('/filter')}>
          <Search className="w-6 h-6" />
          <span className="text-[10px] font-medium">絞り込み</span>
        </Link>

        <Link href="/mylibrary" className={getNavClass('/mylibrary')}>
          <Library className="w-6 h-6" />
          <span className="text-[10px] font-medium">マイライブラリ</span>
        </Link>

        <Link href="/mypage" className={getNavClass('/mypage')}>
          <User className="w-6 h-6" />
          <span className="text-[10px] font-medium">マイページ</span>
        </Link>
      </div>
    </div>
  );
}
