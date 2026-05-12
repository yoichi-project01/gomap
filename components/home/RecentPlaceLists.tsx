import Link from 'next/link';
import { Map as MapIcon, Heart } from 'lucide-react';
import type { PlaceList } from '@/types/spot';

type Props = {
  placeLists: PlaceList[];
};

export default function RecentPlaceLists({ placeLists }: Props) {
  const items = [
    { id: 'fav', title: 'いいねしたプレイスリスト', isFav: true, href: '/mylibrary/likes' },
    ...placeLists.slice(0, 5).map((p) => ({
      id: p.id,
      title: p.name,
      isFav: false,
      href: `/placelists/${p.id}`,
    })),
  ];

  return (
    <div className="grid grid-cols-2 gap-2 mb-8">
      {items.map((item) => (
        <Link
          href={item.href}
          key={item.id}
          className="bg-zinc-200/60 dark:bg-zinc-800/60 hover:bg-zinc-300/60 dark:hover:bg-zinc-700/60 rounded flex items-center overflow-hidden h-14 cursor-pointer transition group"
        >
          <div className="w-14 h-14 bg-gradient-to-br from-indigo-500 to-purple-600 flex-shrink-0 shadow-[inset_0_0_10px_rgba(0,0,0,0.5)] flex items-center justify-center">
            {item.isFav
              ? <Heart className="w-6 h-6 text-white" />
              : <MapIcon className="w-6 h-6 text-white/50" />}
          </div>
          <span className="px-3 text-xs font-bold truncate line-clamp-2 leading-tight text-zinc-800 dark:text-zinc-100 group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors">
            {item.title}
          </span>
        </Link>
      ))}
    </div>
  );
}
