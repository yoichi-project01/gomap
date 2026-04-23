import Link from 'next/link';
import { Bell, Clock, Settings } from 'lucide-react';

export default function HomeHeader() {
  return (
    <header className="sticky top-0 z-50 flex items-center px-4 pt-10 pb-4 bg-black/95 border-b border-zinc-800">
      <div className="flex items-center justify-between w-full">
        {/* プロフィールアイコン */}
        <Link href="/mypage" className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center text-sm font-bold text-black cursor-pointer hover:opacity-80 transition">
          Y
        </Link>
        
        {/* 右上のアクションアイコン群 */}
        <div className="flex items-center gap-5 text-gray-300">
          <Bell className="w-6 h-6 cursor-pointer hover:text-white transition" />
          <Clock className="w-6 h-6 cursor-pointer hover:text-white transition" />
          <Link href="/filter">
            <Settings className="w-6 h-6 cursor-pointer hover:text-white transition" />
          </Link>
        </div>
      </div>
    </header>
  );
}