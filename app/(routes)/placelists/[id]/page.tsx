import Link from 'next/link';
import { ChevronLeft, MapPin, Heart, Share2, Navigation } from 'lucide-react';
// ▼ 修正: ラッパーコンポーネントを通常インポートする
import SpotMapWrapper from '@/components/SpotMapWrapper';

// モックデータ：クリックされたスポットの情報を想定
const spotData = {
  id: '1',
  name: '道頓堀',
  description: '大阪の象徴的な繁華街。グリコの看板やカニ道楽など、大阪ならではのド派手な景観と絶品グルメが楽しめる大人気スポットです。たこ焼きやお好み焼きの食べ歩きもおすすめ。',
  address: '大阪府大阪市中央区道頓堀',
  tags: ['グルメ', '観光名所', '写真映え'],
  lat: 34.6687, // 道頓堀の緯度
  lng: 135.5021, // 道頓堀の経度
};

export default function SpotDetailPage({ params }: { params: { id: string } }) {
  return (
    <div className="min-h-screen bg-black text-white font-sans pb-24 overflow-y-auto [&::-webkit-scrollbar]:hidden">
      
      {/* 1. 上部のカバー画像領域 ＆ 戻るボタン */}
      <div className="relative h-72 w-full bg-gradient-to-b from-blue-900 to-black flex flex-col justify-end p-4">
        {/* 戻るボタン（左上固定） */}
        <Link href="/" className="absolute top-10 left-4 w-10 h-10 bg-black/40 rounded-full flex items-center justify-center backdrop-blur-md z-10 hover:bg-black/60 transition">
          <ChevronLeft className="w-6 h-6 text-white" />
        </Link>
        
        {/* スポット名 */}
        <h1 className="text-4xl font-extrabold mb-2 text-white shadow-sm drop-shadow-md">
          {spotData.name}
        </h1>
        <p className="text-gray-300 text-sm flex items-center gap-1">
          <MapPin className="w-4 h-4" />
          {spotData.address}
        </p>
      </div>

      {/* 2. アクションボタン群 */}
      <div className="flex items-center gap-4 px-4 py-4">
        <button className="w-14 h-14 bg-green-500 rounded-full flex items-center justify-center hover:scale-105 transition-transform shadow-lg text-black">
          <Navigation className="w-6 h-6 fill-black" />
        </button>
        <button className="text-gray-400 hover:text-white transition">
          <Heart className="w-8 h-8" />
        </button>
        <button className="text-gray-400 hover:text-white transition">
          <Share2 className="w-7 h-7" />
        </button>
      </div>

      {/* 3. スポットの詳細・説明 */}
      <div className="px-4 mb-8">
        <div className="flex gap-2 mb-4">
          {spotData.tags.map((tag, idx) => (
            <span key={idx} className="px-3 py-1 bg-zinc-800 text-xs font-bold rounded-full text-white">
              {tag}
            </span>
          ))}
        </div>
        <p className="text-gray-300 text-sm leading-relaxed mb-6">
          {spotData.description}
        </p>
      </div>

      {/* 4. 地図とピンの表示エリア */}
      <div className="px-4 mb-8">
        <h2 className="text-lg font-bold mb-4">場所</h2>
        <div className="h-64 w-full rounded-xl overflow-hidden border border-zinc-800 shadow-lg relative z-0">
          {/* ▼ 修正: 作成したラッパーコンポーネントを呼び出す ▼ */}
          <SpotMapWrapper 
            lat={spotData.lat} 
            lng={spotData.lng} 
            name={spotData.name} 
          />
        </div>
      </div>
      
    </div>
  );
}