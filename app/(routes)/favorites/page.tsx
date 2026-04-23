import Link from 'next/link';
import { ChevronLeft, Library, ChevronRight } from 'lucide-react';
import SpotMiniMapWrapper from '@/components/SpotMiniMapWrapper';

// データ構造の修正：
// 1つの「スポット（例：大阪観光名所7選）」の中に、複数の「地点（locations）」が含まれる構造
const favoriteSpots = [
  { 
    id: 'spot-1', 
    name: '大阪観光名所7選', 
    desc: '大阪城、道頓堀、通天閣など、初めての大阪ならここ！',
    locations: [
      { id: 'loc-1', name: '道頓堀', lat: 34.6687, lng: 135.5021 },
      { id: 'loc-2', name: '大阪城', lat: 34.6873, lng: 135.5262 },
      { id: 'loc-3', name: '通天閣', lat: 34.6525, lng: 135.5063 },
    ]
  },
  { 
    id: 'spot-2', 
    name: '絶景の夜景スポット', 
    desc: '梅田スカイビル、ハルカスなどロマンチックな場所。',
    locations: [
      { id: 'loc-4', name: '梅田スカイビル', lat: 34.7050, lng: 135.4896 },
      { id: 'loc-5', name: 'あべのハルカス', lat: 34.6458, lng: 135.5140 },
    ]
  },
  { 
    id: 'spot-3', 
    name: '家族で楽しむ大阪', 
    desc: '海遊館やUSJなど、子供も大人も楽しめるエリア。',
    locations: [
      { id: 'loc-6', name: '海遊館', lat: 34.6545, lng: 135.4289 },
      { id: 'loc-7', name: '天保山大観覧車', lat: 34.6562, lng: 135.4310 },
    ]
  },
];

export default function FavoritesPage() {
  return (
    <div className="min-h-screen bg-black text-white font-sans pb-24 overflow-y-auto [&::-webkit-scrollbar]:hidden">
      
      {/* 1. ヘッダー領域 */}
      <header className="sticky top-0 z-50 flex items-center px-4 pt-10 pb-4 bg-black/95 border-b border-zinc-800">
        <Link href="/" className="w-10 h-10 bg-zinc-800 rounded-full flex items-center justify-center hover:bg-zinc-700 transition mr-3">
          <ChevronLeft className="w-6 h-6 text-white" />
        </Link>
        <Library className="w-6 h-6 text-green-500 mr-2" />
        <h1 className="text-xl font-bold">マイライブラリ</h1>
      </header>

      {/* 2. メインコンテンツ（保存済みスポットのリスト） */}
      <main className="px-4 mt-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold">保存済みのスポット</h2>
          <span className="text-sm text-zinc-400">{favoriteSpots.length}件</span>
        </div>

        {/* スポット（プレイリスト）ごとのカードリスト */}
        <div className="flex flex-col gap-6">
          {favoriteSpots.map((spot) => (
            <div 
              key={spot.id} 
              className="bg-zinc-900 rounded-xl overflow-hidden shadow-lg border border-zinc-800 flex flex-col"
            >
              {/* スポット内の全地点のピンが刺さったミニマップ */}
              <div className="h-32 w-full relative z-0">
                <SpotMiniMapWrapper locations={spot.locations} />
              </div>
              
              {/* スポット情報と詳細ページへのリンク */}
              <Link 
                href={`/spots/${spot.id}`} 
                className="p-4 flex items-center justify-between group hover:bg-zinc-800/50 transition-colors"
              >
                <div className="pr-4">
                  <h3 className="font-bold text-lg group-hover:text-green-500 transition-colors">
                    {spot.name}
                  </h3>
                  <p className="text-zinc-400 text-sm mt-1 line-clamp-1">
                    {spot.desc}
                  </p>
                  {/* ピンの数を表示 */}
                  <p className="text-zinc-500 text-xs mt-2 font-medium">
                    📍 {spot.locations.length}箇所の地点
                  </p>
                </div>
                <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center group-hover:bg-green-500 transition-colors shrink-0">
                  <ChevronRight className="w-5 h-5 text-white group-hover:text-black" />
                </div>
              </Link>
            </div>
          ))}
        </div>
      </main>
      
    </div>
  );
}