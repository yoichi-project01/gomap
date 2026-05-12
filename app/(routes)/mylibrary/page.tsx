import Link from 'next/link';
import { redirect } from 'next/navigation';
import { LayoutList, Library, Heart, ChevronRight } from 'lucide-react';
import { createSupabaseServerClient } from '@/lib/server/supabaseAuth';
import { countPlaceListsByCreator } from '@/lib/server/placeLists';
import { countSaved } from '@/lib/server/saves';
import { countLiked } from '@/lib/server/likes';

export const dynamic = 'force-dynamic';

export default async function MyLibraryPage() {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const [createdCount, savedCount, likedCount] = await Promise.all([
    countPlaceListsByCreator(supabase, user.id),
    countSaved(user.id),
    countLiked(user.id),
  ]);

  const menuItems = [
    {
      href: '/mylibrary/placelists',
      icon: <LayoutList className="w-6 h-6 text-green-500" />,
      label: '登録したプレイスリスト',
      count: createdCount,
    },
    {
      href: '/mylibrary/saved',
      icon: <Library className="w-6 h-6 text-indigo-500" />,
      label: '保存したプレイスリスト',
      count: savedCount,
    },
    {
      href: '/mylibrary/likes',
      icon: <Heart className="w-6 h-6 text-red-500" />,
      label: 'いいねしたプレイスリスト',
      count: likedCount,
    },
  ];

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 pb-24">
      <header className="sticky top-0 z-50 flex items-center px-4 pt-10 pb-4 bg-zinc-50/95 dark:bg-zinc-950/95 backdrop-blur-sm border-b border-zinc-200 dark:border-zinc-800">
        <Library className="w-6 h-6 text-green-500 mr-2" />
        <h1 className="text-xl font-bold text-zinc-900 dark:text-white">マイライブラリ</h1>
      </header>

      <main className="px-4 mt-6">
        <div className="flex flex-col gap-3">
          {menuItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-4 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl px-4 py-4 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors group"
            >
              <div className="w-11 h-11 rounded-full bg-zinc-100 dark:bg-zinc-800 group-hover:bg-zinc-200 dark:group-hover:bg-zinc-700 flex items-center justify-center shrink-0 transition-colors">
                {item.icon}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm text-zinc-900 dark:text-white group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors">
                  {item.label}
                </p>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">{item.count} 件</p>
              </div>
              <ChevronRight className="w-5 h-5 text-zinc-400 dark:text-zinc-600 group-hover:text-green-500 transition-colors shrink-0" />
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
}
