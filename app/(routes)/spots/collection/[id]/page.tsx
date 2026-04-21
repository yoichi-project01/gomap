import Link from 'next/link';
import { ChevronLeft, Heart, Share2, Map as MapIcon, MoreVertical } from 'lucide-react';
import CollectionMapWrapper from '@/components/CollectionMapWrapper';

// モックデータ：クリックされたスポット（プレイリスト）の情報を想定
const collectionData = {
  id: '1',
  name: '大阪観光名所7選',
  description: '大阪城、道頓堀、通天閣など、初めての大阪なら絶対に外せない王道スポットをまとめました。1日で巡れるおすすめのルートです。',
  creator: 'Gomap 編集部',
  likes: 1240,
  locations: [
    { id: 'loc-1', name: '道頓堀', desc: '巨大看板と絶品グルメが集まる繁華街', lat: 34.6687, lng: 135.5021 },
    { id: 'loc-2', name: '大阪城', desc: '歴史を感じる大阪のシンボル', lat: 34.6873, lng: 135.5262 },
    { id: 'loc-3', name: '通天閣', desc: '新世界の中心にそびえるレトロな展望塔', lat: 34.6525, lng: 135.5063 },
    { id: 'loc-4', name: '海遊館', desc: 'ジンベエザメに会える世界最大級の水族館', lat: 34.6545, lng: 135.4289 },
    { id: 'loc-5', name: '梅田スカイビル', desc: '空中庭園から大阪を一望できる絶景スポット', lat: 34.7050, lng: 135.4896 },
  ]
};

export default function CollectionDetailPage({ params }: { params: { id: string } }) {
  return (
    <div className="min-h-screen bg-black text-white font-sans pb-24 overflow-y-auto [&::-webkit-scrollbar]:hidden">
      
      {/* 1. 上部のカバー領域 (Spotifyのプレイリストヘッダー風) */}
      <div className="relative pt-16 pb-6 px-4 bg-gradient-to-b from-indigo-900 to-black">
        {/* 戻るボタン */}
        <Link href="/" className="absolute top-10 left-4 w-10 h-10 bg-black/40 rounded-full flex items-center justify-center backdrop-blur-md z-10 hover:bg-black/60 transition">
          <ChevronLeft className="w-6 h-6 text-white" />
        </Link>

        {/* コレクションのタイトルと情報 */}
        <div className="mt-8">
          <h1 className="text-3xl font-extrabold mb-2 text-white shadow-sm drop-shadow-md leading-tight">
            {collectionData.name}
          </h1>
          <p className="text-zinc-300 text-sm mb-4 leading-relaxed line-clamp-3">
            {collectionData.description}
          </p>
          <div className="flex items-center gap-2 text-xs font-bold text-zinc-400">
            <span className="text-white">{collectionData.creator}</span>
            <span>•</span>
            <span>{collectionData.likes} 件のいいね</span>
            <span>•</span>
            <span>{collectionData.locations.length} 箇所</span>
          </div>
        </div>
      </div>

      {/* 2. アクションボタン群 */}
      <div className="flex items-center gap-6 px-4 py-2 mb-6">
        {/* Spotifyの緑の再生ボタンの位置に、マップ起動ボタン */}
        <button className="w-14 h-14 bg-green-500 rounded-full flex items-center justify-center hover:scale-105 transition-transform shadow-lg text-black">
          <MapIcon className="w-6 h-6 fill-black" />
        </button>
        <button className="text-zinc-400 hover:text-white transition">
          <Heart className="w-7 h-7" />
        </button>
        <button className="text-zinc-400 hover:text-white transition">
          <MoreVertical className="w-7 h-7" />
        </button>
      </div>

      {/* 3. このスポットの全体マップ（操作可能） */}
      <div className="px-4 mb-8">
        <div className="h-64 w-full rounded-xl overflow-hidden border border-zinc-800 shadow-lg relative z-0">
          {/* 先ほど作った複数ピン対応・操作可能なマップラッパー */}
          <CollectionMapWrapper locations={collectionData.locations} />
        </div>
      </div>

      {/* 4. 地点（曲）のリスト */}
      <div className="px-4">
        <h2 className="text-lg font-bold mb-4">含まれる場所</h2>
        <div className="flex flex-col gap-4">
          {collectionData.locations.map((loc, index) => (
            <div key={loc.id} className="flex items-center gap-4 group cursor-pointer hover:bg-zinc-800/50 p-2 -mx-2 rounded-md transition-colors">
              {/* 曲順（リストの番号） */}
              <div className="w-4 text-center text-zinc-500 font-bold text-sm group-hover:hidden">
                {index + 1}
              </div>
              <div className="w-4 text-center text-white hidden group-hover:block">
                {/* ホバー時にアイコンを変える（Spotify風） */}
                <MapIcon className="w-4 h-4" />
              </div>
              
              {/* 地点の情報 */}
              <div className="flex-1">
                <h3 className="font-bold text-base text-white group-hover:text-green-500 transition-colors">
                  {loc.name}
                </h3>
                <p className="text-xs text-zinc-400 line-clamp-1">
                  {loc.desc}
                </p>
              </div>
              
              {/* 右側のメニューアイコン */}
              <button className="text-zinc-500 hover:text-white opacity-0 group-hover:opacity-100 transition-opacity">
                <MoreVertical className="w-5 h-5" />
              </button>
            </div>
          ))}
        </div>
      </div>
      
    </div>
  );
}