'use client';

import { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft, Plus, MapPin, X, Search } from 'lucide-react';
import type { Spot } from '@/types/spot';
import { createPlaceList } from '@/lib/client/placeLists';
import { createSpot, deleteSpot } from '@/lib/client/spots';
import CoverImageUploader from '@/components/ui/CoverImageUploader';
import LocationSearchModal from '@/components/spot/LocationSearchModal';
import type { PlaceSearchResult } from '@/app/api/places/search/route';

type Props = {
  availableSpots: Spot[];
};

const CATEGORIES = ['観光', 'グルメ', 'カフェ', '自然', 'ショッピング', 'その他'];

export default function CreatePlaceListForm({ availableSpots }: Props) {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<string>('');
  const [selectedSpots, setSelectedSpots] = useState<Spot[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [mapSearchOpen, setMapSearchOpen] = useState(false);
  const [isAddingMapPlace, setIsAddingMapPlace] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [cover, setCover] = useState<{ url: string; path: string } | null>(null);

  // このセッションで map_ref として作成したスポット ID。
  // ユーザーが削除/キャンセルした際にオーファンを残さないよう、DB からも消す。
  const sessionMapRefIds = useRef<Set<string>>(new Set());

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
    // セッション中に作った map_ref なら DB からも消してオーファンを残さない
    if (sessionMapRefIds.current.has(id)) {
      sessionMapRefIds.current.delete(id);
      void deleteSpot(id).catch((err) => console.error('map_ref cleanup failed', err));
    }
  };

  const handleSelectMapPlace = async (result: PlaceSearchResult) => {
    if (isAddingMapPlace) return;
    setIsAddingMapPlace(true);
    try {
      const created = await createSpot({
        name: result.name,
        lat: result.lat,
        lng: result.lng,
        description: result.address,
        prefecture: result.prefecture ?? undefined,
        source: 'map_ref',
      });
      sessionMapRefIds.current.add(created.id);
      setSelectedSpots((prev) => [...prev, created]);
      setMapSearchOpen(false);
    } catch (err) {
      console.error(err);
      alert('場所の追加に失敗しました');
    } finally {
      setIsAddingMapPlace(false);
    }
  };

  // 戻る / キャンセル時に、保存されなかった map_ref スポットを掃除する
  const cleanupUnsavedMapRefs = async () => {
    const usedIds = new Set(selectedSpots.map((s) => s.id));
    const orphans = Array.from(sessionMapRefIds.current).filter((id) => !usedIds.has(id));
    sessionMapRefIds.current.clear();
    if (orphans.length === 0) return;
    await Promise.allSettled(orphans.map((id) => deleteSpot(id)));
  };

  const handleBack = async () => {
    await cleanupUnsavedMapRefs();
    router.back();
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
        category: category || undefined,
        spotIds: selectedSpots.map((s) => s.id),
        coverImageUrl: cover?.url,
      });
      // 保存に成功したセッションでは、追加したが使わなかった map_ref があれば掃除する
      await cleanupUnsavedMapRefs();
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
          onClick={handleBack}
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

        <div>
          <h2 className="text-sm font-bold text-zinc-300 mb-3">カテゴリ</h2>
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((cat) => {
              const active = category === cat;
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setCategory(active ? '' : cat)}
                  className={`px-3 py-1.5 text-xs rounded-full border transition ${
                    active
                      ? 'bg-green-500 border-green-500 text-black font-bold'
                      : 'border-zinc-700 text-zinc-300 hover:border-zinc-500'
                  }`}
                >
                  {cat}
                </button>
              );
            })}
          </div>
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
                      <div className="flex flex-col gap-0.5 mt-0.5">
                        {spot.prefecture && (
                          <span className="text-xs text-green-400 flex items-center gap-1">
                            <MapPin className="w-3 h-3 flex-shrink-0" />
                            {spot.prefecture}
                          </span>
                        )}
                        {spot.description && (
                          <p className="text-xs text-zinc-400">{spot.description}</p>
                        )}
                      </div>
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

          <div className="flex flex-col gap-2">
            <button
              onClick={() => setMapSearchOpen(true)}
              className="w-full flex items-center justify-center gap-2 bg-green-500 hover:bg-green-400 text-black py-3.5 rounded-full font-bold text-sm transition shadow-md"
            >
              <MapPin className="w-5 h-5" />
              マップから場所を検索して追加
            </button>
            <button
              onClick={() => setShowSearch((v) => !v)}
              className="w-full flex items-center justify-center gap-2 bg-zinc-800 hover:bg-zinc-700 text-white py-3 rounded-full font-bold text-xs transition"
            >
              <Plus className="w-4 h-4" />
              登録済みスポットから選ぶ
            </button>
          </div>

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
                        <div className="flex flex-col gap-0.5 mt-0.5">
                          {spot.prefecture && (
                            <span className="text-xs text-green-400 flex items-center gap-0.5">
                              <MapPin className="w-3 h-3 flex-shrink-0" />
                              {spot.prefecture}
                            </span>
                          )}
                          {spot.description && (
                            <p className="text-xs text-zinc-400 truncate">{spot.description}</p>
                          )}
                        </div>
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

      {mapSearchOpen && (
        <LocationSearchModal
          onClose={() => setMapSearchOpen(false)}
          onSelect={handleSelectMapPlace}
        />
      )}
    </div>
  );
}
