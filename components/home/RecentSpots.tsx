import Link from 'next/link';
import { Map as MapIcon, Heart } from 'lucide-react';

export default function RecentSpots() {
  // 最近チェックした「コレクション（まとまり）」のデータ
  const recentCollections = [
    { id: 'fav', title: 'お気に入りスポット', isFav: true },
    { id: '1', title: '大阪観光名所7選', isFav: false },
    { id: '2', title: '絶景の夜景スポット', isFav: false },
    { id: '3', title: '大阪食い倒れツアー', isFav: false },
    { id: '4', title: '最新カフェ巡りin中崎町', isFav: false },
    { id: '5', title: 'ディープな大阪体験', isFav: false },
  ];

  return (
    <div className="grid grid-cols-2 gap-2 mb-8">
      {recentCollections.map((item, i) => (
        <Link 
          href={item.id === 'fav' ? '/favorites' : `/spots/collection/${item.id}`}
          key={i} 
          className="bg-zinc-800/60 hover:bg-zinc-700/60 rounded flex items-center overflow-hidden h-14 cursor-pointer transition group"
        >
          <div className="w-14 h-14 bg-gradient-to-br from-indigo-500 to-purple-600 flex-shrink-0 shadow-[inset_0_0_10px_rgba(0,0,0,0.5)] flex items-center justify-center">
            {item.isFav ? <Heart className="w-6 h-6 text-white" /> : <MapIcon className="w-6 h-6 text-white/50" />}
          </div>
          <span className="px-3 text-xs font-bold truncate line-clamp-2 leading-tight group-hover:text-green-400 transition-colors">
            {item.title}
          </span>
        </Link>
      ))}
    </div>
  );
}