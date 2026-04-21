import Link from 'next/link';
import { Home, Search, Library, User } from 'lucide-react';

export default function BottomNav() {
  return (
    <div className="fixed bottom-0 left-0 w-full bg-gradient-to-t from-black via-black/95 to-transparent pt-12 pb-6 px-6 z-50">
      <div className="flex justify-between items-center max-w-md mx-auto">
        <Link href="/" className="flex flex-col items-center gap-1.5 text-white">
          <Home className="w-6 h-6" />
          <span className="text-[10px] font-medium">ホーム</span>
        </Link>
        
        <Link href="/filter" className="flex flex-col items-center gap-1.5 text-gray-400 hover:text-white transition">
          <Search className="w-6 h-6" />
          <span className="text-[10px] font-medium">絞り込み</span>
        </Link>
        
        <Link href="/favorites" className="flex flex-col items-center gap-1.5 text-gray-400 hover:text-white transition">
          <Library className="w-6 h-6" />
          <span className="text-[10px] font-medium">マイライブラリ</span>
        </Link>
        
        <Link href="/mypage" className="flex flex-col items-center gap-1.5 text-gray-400 hover:text-white transition">
          <User className="w-6 h-6" />
          <span className="text-[10px] font-medium">マイページ</span>
        </Link>
      </div>
    </div>
  );
}