'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft, Plus, MapPin, X, Search } from 'lucide-react';
import type { Spot } from '@/types/spot';
import { createPlaceList } from '@/lib/client/placeLists';
import CoverImageUploader from '@/components/ui/CoverImageUploader';

type Props = {
  availableSpots: Spot[];
};

export default function CreatePlaceListForm({ availableSpots }: Props) {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedSpots, setSelectedSpots] = useState<Spot[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [cover, setCover] = useState<{ url: string; path: string } | null>(null);

  const filteredSpots = availableSpots.filter(
    (spot) =>
      !selectedSpots.some((s) => s.id === spot.id) &&
      (searchQuery === '' ||
        spot.name.includes(searchQuery) ||
        (spot.description ?? '').includes(searchQuery))
  );

  const addSpot = (spot: Spot) => {
    setSelectedSpots((prev) => [...prev, spot]);
    setSearchQuery('');
  };

  const removeSpot = (id: string) => {
    setSelectedSpots((prev) => prev.filter((s) => s.id !== id));
  };

  const handleSave = async () => {
    if (!title.trim()) {
      alert('タイトルを入力してください');
      return;
    }
    if (selectedSpots.length === 0) {
      alert('スポットを1件以上追加してください');
      return;
    }

    setIsSaving(true);
    try {
      const created = await createPlaceList({
        name: title.trim(),
        description: description.trim() || undefined,
        spotIds: selectedSpots.map((s) => s.id),
        coverImageUrl: cover?.url,
      });
      router.push(`/placelists/${created.id}`);
      router.refresh();
    } catch (err) {
      console.error(err);
      alert('保存に失敗しました');
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white font-sans pb-24 overflow-y-auto [&::-webkit-scrollbar]:hidden">
      <header className="sticky top-0 z-50 flex items-center justify-between px-4 pt-10 pb-4 bg-black/95 border-b border-zinc-800">
        <button
          onClick={() => router.back()}
          className="w-10 h-10 bg-zinc-800 rounded-full flex items-center justify-center hover:bg-zinc-700 transition"
        >
          <ChevronLeft className="w-6 h-6 text-white" />
        </button>
        <h1 className="text-sm font-bold text-zinc-300">新しいプレイスリストを作成</h1>
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="bg-green-500 text-black font-bold px-4 py-1.5 rounded-full text-xs hover:bg-green-400 transition disabled:opacity-50"
        >
          {isSaving ? '保存中...' : '保存'}
        </button>
      </header>

      <main className="px-4 mt-8 max-w-md mx-auto flex flex-col gap-8">
        <CoverImageUploader value={cover} onChange={setCover} className="mx-auto" />

        <div className="flex flex-col gap-4">
          <input
            type="text"
            placeholder="プレイスリストのタイトル"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full bg-transparent text-3xl font-extrabold text-center text-white placeholder-zinc-600 outline-none border-b border-zinc-800 pb-3 focus:border-green-500 transition-colors"
          />
          <textarea
            placeholder="説明を追加(例:週末に行きたいおすすめのカフェ巡りルートです)"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={2}
            className="w-full bg-transparent text-sm text-center text-zinc-300 placeholder-zinc-600 outline-none border-b border-zinc-800 pb-3 focus:border-green-500 transition-colors resize-none"
          />
        </div>

        <div className="mt-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold">スポットを追加</h2>
            <span className="text-xs text-zinc-500">{selectedSpots.length} 件</span>
          </div>

          <div className="flex flex-col gap-3 mb-6">
            {selectedSpots.length === 0 ? (
              <div className="text-xs text-zinc-500 text-center py-8 border border-dashed border-zinc-800 rounded-lg">
                まだスポットが追加されていません
              </div>
            ) : (
              selectedSpots.map((spot, index) => (
                <div
                  key={spot.id}
                  className="flex items-center justify-between bg-zinc-900 p-3 rounded-lg border border-zinc-800"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center text-zinc-400 text-sm font-bold">
                      {index + 1}
                    </div>
                    <div>
                      <h3 className="font-bold text-sm text-white">{spot.name}</h3>
                      <p className="text-xs text-zinc-400 flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3 h-3" />
                        {spot.description ?? ''}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => removeSpot(spot.id)}
                    className="p-2 text-zinc-500 hover:text-red-500 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              ))
            )}
          </div>

          <button
            onClick={() => setShowSearch((v) => !v)}
            className="w-full flex items-center justify-center gap-2 bg-zinc-800 hover:bg-zinc-700 text-white py-3.5 rounded-full font-bold text-sm transition shadow-md"
          >
            <Plus className="w-5 h-5" />
            スポットを検索して追加
          </button>

          {showSearch && (
            <div className="mt-4 bg-zinc-900 rounded-xl border border-zinc-800 overflow-hidden">
              <div className="flex items-center gap-2 px-4 py-3 border-b border-zinc-800">
                <Search className="w-4 h-4 text-zinc-400 flex-shrink-0" />
                <input
                  type="text"
                  placeholder="スポット名で検索"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  autoFocus
                  className="flex-1 bg-transparent text-sm text-white placeholder-zinc-500 outline-none"
                />
              </div>
              <div className="max-h-64 overflow-y-auto [&::-webkit-scrollbar]:hidden">
                {filteredSpots.length === 0 ? (
                  <p className="text-xs text-zinc-500 text-center py-6">
                    {searchQuery ? '該当するスポットがありません' : 'すべて追加済みです'}
                  </p>
                ) : (
                  filteredSpots.map((spot) => (
                    <button
                      key={spot.id}
                      onClick={() => addSpot(spot)}
                      className="w-full flex items-center gap-3 px-4 py-3 hover:bg-zinc-800 transition text-left"
                    >
                      <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center flex-shrink-0">
                        <MapPin className="w-4 h-4 text-green-500" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-white truncate">{spot.name}</p>
                        <p className="text-xs text-zinc-400 truncate">
                          {spot.description ?? ''}
                        </p>
                      </div>
                      <Plus className="w-4 h-4 text-zinc-400 flex-shrink-0 ml-auto" />
                    </button>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
