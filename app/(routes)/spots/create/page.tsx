'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft, MapPin, Tag, X } from 'lucide-react';
import LocationSearchModal from '@/components/spot/LocationSearchModal';
import CoverImageUploader from '@/components/ui/CoverImageUploader';
import SelectField from '@/components/ui/SelectField';
import type { PlaceSearchResult } from '@/app/api/places/search/route';
import { createSpot } from '@/lib/client/spots';

const CATEGORIES = ['観光', 'グルメ', 'カフェ', '自然', 'ショッピング', 'その他'];

type SelectedLocation = {
  name: string;
  address: string;
  prefecture: string | null;
  lat: number;
  lng: number;
};

export default function CreateSpotPage() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<string | null>(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const [cover, setCover] = useState<{ url: string; path: string } | null>(null);
  const [location, setLocation] = useState<SelectedLocation | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  function handleSelectPlace(result: PlaceSearchResult) {
    setLocation({
      name: result.name,
      address: result.address,
      prefecture: result.prefecture,
      lat: result.lat,
      lng: result.lng,
    });
    // タイトルが未入力なら場所名で初期化
    if (!title.trim()) setTitle(result.name);
    setSearchOpen(false);
  }

  async function handleSave() {
    if (!title.trim()) {
      alert('タイトルを入力してください');
      return;
    }
    if (!location) {
      alert('場所を選択してください');
      return;
    }

    setIsSaving(true);
    try {
      const created = await createSpot({
        name: title.trim(),
        lat: location.lat,
        lng: location.lng,
        description: description.trim() || undefined,
        prefecture: location.prefecture ?? undefined,
        category: category || undefined,
        coverImageUrl: cover?.url,
      });
      router.push(`/spots/${created.id}`);
      router.refresh();
    } catch (err) {
      console.error(err);
      alert('保存に失敗しました');
      setIsSaving(false);
    }
  }

  return (
    <div className="min-h-screen bg-black text-white font-sans pb-24 overflow-y-auto [&::-webkit-scrollbar]:hidden">
      <header className="sticky top-0 z-50 flex items-center justify-between px-4 pt-10 pb-4 bg-black/95 border-b border-zinc-800">
        <button onClick={() => router.back()} className="w-10 h-10 bg-zinc-800 rounded-full flex items-center justify-center hover:bg-zinc-700 transition">
          <ChevronLeft className="w-6 h-6 text-white" />
        </button>
        <h1 className="text-sm font-bold text-zinc-300">新しいスポットを作成</h1>
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="bg-green-500 text-black font-bold px-4 py-1.5 rounded-full text-xs hover:bg-green-400 transition disabled:opacity-50"
        >
          {isSaving ? '保存中...' : '保存'}
        </button>
      </header>

      <main className="px-4 mt-8 max-w-md md:max-w-2xl lg:max-w-4xl mx-auto flex flex-col gap-8">
        <CoverImageUploader value={cover} onChange={setCover} className="mx-auto" />

        <div className="flex flex-col gap-4">
          <input
            type="text"
            placeholder="スポットのタイトル"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full bg-transparent text-3xl font-extrabold text-center text-white placeholder-zinc-600 outline-none border-b border-zinc-800 pb-3 focus:border-green-500 transition-colors"
          />
          <textarea
            placeholder="説明を追加(例:夜景がきれいで写真映えする)"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={2}
            className="w-full bg-transparent text-sm text-center text-zinc-300 placeholder-zinc-600 outline-none border-b border-zinc-800 pb-3 focus:border-green-500 transition-colors resize-none"
          />
        </div>

        <div>
          <h2 className="text-sm font-bold text-zinc-300 mb-3">カテゴリ</h2>
          <SelectField
            icon={<Tag className="w-3.5 h-3.5" />}
            ariaLabel="カテゴリを選択"
            value={category}
            options={CATEGORIES}
            onChange={setCategory}
            placeholder="カテゴリを選択"
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-bold text-zinc-300">場所</h2>
            {location && (
              <button
                type="button"
                onClick={() => setLocation(null)}
                className="text-xs text-zinc-500 hover:text-red-400 inline-flex items-center gap-1"
              >
                <X className="w-3 h-3" />
                クリア
              </button>
            )}
          </div>

          {location ? (
            <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-3">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center text-green-400 shrink-0">
                  <MapPin className="w-4 h-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-bold text-sm text-white">{location.name}</p>
                  <p className="text-xs text-zinc-400 mt-0.5 line-clamp-2">{location.address}</p>
                  <p className="text-[10px] text-zinc-500 mt-1 font-mono">
                    {location.lat.toFixed(5)}, {location.lng.toFixed(5)}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSearchOpen(true)}
                className="mt-3 w-full text-xs text-zinc-400 hover:text-white py-2 border-t border-zinc-800"
              >
                別の場所を選択
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setSearchOpen(true)}
              className="w-full flex items-center justify-center gap-2 bg-zinc-800 hover:bg-zinc-700 text-white py-3.5 rounded-full font-bold text-sm transition shadow-md"
            >
              <MapPin className="w-5 h-5" />
              場所を検索して選択
            </button>
          )}
        </div>
      </main>

      {searchOpen && (
        <LocationSearchModal
          onClose={() => setSearchOpen(false)}
          onSelect={handleSelectPlace}
        />
      )}
    </div>
  );
}
