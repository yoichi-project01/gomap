'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft, Camera, Plus, MapPin, X } from 'lucide-react';

export default function CreateSpotPage() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  
  // 追加した地点（ロケーション）のリストを管理するステート
  // ※今回はUIの確認のため、初期値としてダミーを1件入れています
  const [locations, setLocations] = useState([
    { id: '1', name: '道頓堀', address: '大阪府大阪市中央区' }
  ]);

  // 保存ボタンを押した時の処理
  const handleSave = () => {
    // 実際のアプリではここでSupabase等のデータベースに保存する処理を書きます
    alert(`「${title || '無題のスポット'}」を保存しました！`);
    router.push('/'); // ホーム画面に戻る
  };

  // 地点を削除する処理
  const removeLocation = (id: string) => {
    setLocations(locations.filter(loc => loc.id !== id));
  };

  return (
    <div className="min-h-screen bg-black text-white font-sans pb-24 overflow-y-auto [&::-webkit-scrollbar]:hidden">
      
      {/* 1. ヘッダー領域 */}
      <header className="sticky top-0 z-50 flex items-center justify-between px-4 pt-10 pb-4 bg-black/95 border-b border-zinc-800">
        <button onClick={() => router.back()} className="w-10 h-10 bg-zinc-800 rounded-full flex items-center justify-center hover:bg-zinc-700 transition">
          <ChevronLeft className="w-6 h-6 text-white" />
        </button>
        <h1 className="text-sm font-bold text-zinc-300">新しいスポットを作成</h1>
        <button 
          onClick={handleSave}
          className="bg-green-500 text-black font-bold px-4 py-1.5 rounded-full text-xs hover:bg-green-400 transition"
        >
          保存
        </button>
      </header>

      {/* 2. メインフォーム領域 */}
      <main className="px-4 mt-8 max-w-md mx-auto flex flex-col gap-8">
        
        {/* カバー画像アップロード枠 (Spotify風) */}
        <div className="w-48 h-48 bg-zinc-800 mx-auto rounded-md flex flex-col items-center justify-center cursor-pointer hover:bg-zinc-700 transition group shadow-lg">
          <Camera className="w-10 h-10 text-zinc-500 group-hover:text-white transition-colors mb-2" />
          <span className="text-xs font-bold text-zinc-500 group-hover:text-white transition-colors">
            画像を選択
          </span>
        </div>

        {/* タイトルと説明の入力 */}
        <div className="flex flex-col gap-4">
          <input 
            type="text" 
            placeholder="スポットのタイトル" 
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full bg-transparent text-3xl font-extrabold text-center text-white placeholder-zinc-600 outline-none border-b border-zinc-800 pb-3 focus:border-green-500 transition-colors"
          />
          
          <textarea 
            placeholder="説明を追加（例：週末に行きたいおすすめのカフェ巡りルートです）" 
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={2}
            className="w-full bg-transparent text-sm text-center text-zinc-300 placeholder-zinc-600 outline-none border-b border-zinc-800 pb-3 focus:border-green-500 transition-colors resize-none"
          />
        </div>

        {/* 地点（ロケーション）の追加セクション */}
        <div className="mt-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold">場所を追加</h2>
            <span className="text-xs text-zinc-500">{locations.length} 箇所</span>
          </div>
          
          {/* 追加された地点のリスト */}
          <div className="flex flex-col gap-3 mb-6">
            {locations.length === 0 ? (
              <div className="text-xs text-zinc-500 text-center py-8 border border-dashed border-zinc-800 rounded-lg">
                まだ場所が追加されていません
              </div>
            ) : (
              locations.map((loc, index) => (
                <div key={loc.id} className="flex items-center justify-between bg-zinc-900 p-3 rounded-lg border border-zinc-800 group">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center text-zinc-400">
                      {index + 1}
                    </div>
                    <div>
                      <h3 className="font-bold text-sm text-white">{loc.name}</h3>
                      <p className="text-xs text-zinc-400 flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3 h-3" />
                        {loc.address}
                      </p>
                    </div>
                  </div>
                  {/* 削除ボタン */}
                  <button 
                    onClick={() => removeLocation(loc.id)}
                    className="p-2 text-zinc-500 hover:text-red-500 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              ))
            )}
          </div>

          {/* 検索・追加ボタン (本来はここから検索モーダル等を開く) */}
          <button className="w-full flex items-center justify-center gap-2 bg-zinc-800 hover:bg-zinc-700 text-white py-3.5 rounded-full font-bold text-sm transition shadow-md">
            <Plus className="w-5 h-5" />
            場所を検索して追加
          </button>
        </div>

      </main>
    </div>
  );
}