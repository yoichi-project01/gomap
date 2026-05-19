'use client';

import { useMemo, useState } from 'react';
import { ArrowDownUp, MapPin, Plus, Search, Tag, User, X } from 'lucide-react';
import type { Spot } from '@/types/spot';
import SpotPickerMapWrapper, { type FocusTarget } from '@/components/placelists/SpotPickerMapWrapper';
import SelectField from '@/components/ui/SelectField';

const CATEGORIES = ['観光', 'グルメ', 'カフェ', '自然', 'ショッピング', 'その他'];

type Sort = '最近追加' | '名前順';
const SORT_OPTIONS: Sort[] = ['最近追加', '名前順'];

type Props = {
  availableSpots: Spot[];
  selectedSpots: Spot[];
  currentUserId: string | null;
  onAdd: (spot: Spot) => void;
};

export default function SpotPicker({
  availableSpots,
  selectedSpots,
  currentUserId,
  onAdd,
}: Props) {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<string | null>(null);
  const [prefecture, setPrefecture] = useState<string | null>(null);
  const [mineOnly, setMineOnly] = useState(false);
  const [sort, setSort] = useState<Sort>('最近追加');
  const [focused, setFocused] = useState<FocusTarget | null>(null);

  // 都道府県チップは availableSpots に実在するものだけ表示 (空のチップを増やさない)
  const availablePrefectures = useMemo(() => {
    const set = new Set<string>();
    for (const s of availableSpots) {
      if (s.prefecture) set.add(s.prefecture);
    }
    return Array.from(set);
  }, [availableSpots]);

  // 件数表示の母数: 追加済みを除いた残りスポット
  const baseSpots = useMemo(() => {
    const selectedIds = new Set(selectedSpots.map((s) => s.id));
    return availableSpots.filter((s) => !selectedIds.has(s.id));
  }, [availableSpots, selectedSpots]);

  const filtered = useMemo(() => {
    const q = query.trim();
    const list = baseSpots.filter((spot) => {
      if (mineOnly && spot.creator !== currentUserId) return false;
      if (category && spot.category !== category) return false;
      if (prefecture && spot.prefecture !== prefecture) return false;
      if (q && !spot.name.includes(q) && !(spot.description ?? '').includes(q)) return false;
      return true;
    });
    if (sort === '名前順') {
      // availableSpots は created_at desc で渡される前提なので、recent の場合は並べ替え不要
      return [...list].sort((a, b) => a.name.localeCompare(b.name, 'ja'));
    }
    return list;
  }, [baseSpots, query, category, prefecture, mineOnly, sort, currentUserId]);

  const hasActiveFilters = query.trim() !== '' || category !== null || prefecture !== null || mineOnly;
  // フィルタが変わったときだけマップを再フィットさせるためのキー
  const refitKey = `${category ?? ''}|${prefecture ?? ''}|${mineOnly ? 'm' : ''}|${query.trim()}`;
  const resetAll = () => {
    setQuery('');
    setCategory(null);
    setPrefecture(null);
    setMineOnly(false);
  };

  return (
    <div className="mt-4 bg-zinc-900 rounded-xl border border-zinc-800">
      {/* 検索バー */}
      <div className="flex items-center gap-2 px-4 py-3 border-b border-zinc-800">
        <Search className="w-4 h-4 text-zinc-400 flex-shrink-0" />
        <input
          type="text"
          placeholder="スポット名で検索"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="flex-1 bg-transparent text-sm text-white placeholder-zinc-500 outline-none"
        />
        {query && (
          <button
            type="button"
            onClick={() => setQuery('')}
            className="text-zinc-500 hover:text-white transition flex-shrink-0"
            aria-label="検索クリア"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* フィルタプルダウン (並び順 / 自分のみ / カテゴリ / 都道府県) を統一レイアウトに */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 px-4 py-3 border-b border-zinc-800">
        <SelectField
          icon={<ArrowDownUp className="w-3.5 h-3.5" />}
          ariaLabel="並び順"
          value={sort}
          options={SORT_OPTIONS}
          onChange={(v) => v && setSort(v as Sort)}
          clearable={false}
        />
        {currentUserId && (
          <SelectField
            icon={<User className="w-3.5 h-3.5" />}
            ariaLabel="登録者で絞り込み"
            value={mineOnly ? '自分のみ' : null}
            options={['自分のみ']}
            onChange={(v) => setMineOnly(v === '自分のみ')}
            placeholder="全員"
          />
        )}
        <SelectField
          icon={<Tag className="w-3.5 h-3.5" />}
          ariaLabel="カテゴリで絞り込み"
          value={category}
          options={CATEGORIES}
          onChange={setCategory}
        />
        {availablePrefectures.length > 0 && (
          <SelectField
            icon={<MapPin className="w-3.5 h-3.5" />}
            ariaLabel="都道府県で絞り込み"
            value={prefecture}
            options={availablePrefectures}
            onChange={setPrefecture}
          />
        )}
      </div>

      {/* 件数 + 適用中フィルタ */}
      <div className="px-4 py-2.5 border-b border-zinc-800 bg-zinc-950/50">
        <div className="flex items-center justify-between">
          <span className="text-xs text-zinc-400">
            <span className="font-bold text-white">{filtered.length}</span>
            <span className="text-zinc-500"> / {baseSpots.length} 件</span>
          </span>
          {hasActiveFilters && (
            <button
              type="button"
              onClick={resetAll}
              className="text-[11px] text-zinc-400 hover:text-white transition underline underline-offset-2"
            >
              すべて解除
            </button>
          )}
        </div>
        {hasActiveFilters && (
          <div className="flex flex-wrap gap-1.5 mt-2">
            {query.trim() !== '' && (
              <ActivePill onClear={() => setQuery('')} icon={<Search className="w-3 h-3" />}>
                「{query.trim()}」
              </ActivePill>
            )}
            {category && (
              <ActivePill onClear={() => setCategory(null)} icon={<Tag className="w-3 h-3" />}>
                {category}
              </ActivePill>
            )}
            {prefecture && (
              <ActivePill onClear={() => setPrefecture(null)} icon={<MapPin className="w-3 h-3" />}>
                {prefecture}
              </ActivePill>
            )}
            {mineOnly && (
              <ActivePill onClear={() => setMineOnly(false)} icon={<User className="w-3 h-3" />}>
                自分のみ
              </ActivePill>
            )}
          </div>
        )}
      </div>

      {/*
       * モバイル: マップ (上) → リスト (下) の縦並び
       * PC (lg以上): マップ (左 50%) / リスト (右 50%) の横並び
       */}
      <div className="flex flex-col lg:flex-row">
        {/* マップ */}
        <div className="border-b border-zinc-800 lg:border-b-0 lg:border-r lg:w-1/2">
          <SpotPickerMapWrapper
            spots={filtered}
            refitKey={refitKey}
            focused={focused}
            onAdd={onAdd}
          />
        </div>

        {/* リスト: 行クリック → マップをそのスポットへフォーカス、+ クリック → 追加 */}
        <div className="max-h-64 lg:max-h-none lg:h-96 lg:w-1/2 overflow-y-auto [&::-webkit-scrollbar]:hidden">
          {filtered.length === 0 ? (
            <p className="text-xs text-zinc-500 text-center py-6">
              該当するスポットがありません
            </p>
          ) : (
            filtered.map((spot) => {
              const focus = () => setFocused({ spot, key: Date.now() });
              return (
                <div
                  key={spot.id}
                  role="button"
                  tabIndex={0}
                  onClick={focus}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      focus();
                    }
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-zinc-800 transition text-left cursor-pointer"
                >
                  <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center flex-shrink-0">
                    <MapPin className="w-4 h-4 text-green-500" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-bold text-white truncate">{spot.name}</p>
                    <p className="text-xs text-zinc-400 truncate">{spot.description ?? ''}</p>
                  </div>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onAdd(spot);
                    }}
                    aria-label={`${spot.name} を追加`}
                    className="flex-shrink-0 p-1.5 -m-1 rounded-full text-zinc-400 hover:text-green-500 hover:bg-zinc-700 transition"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}

function ActivePill({
  icon,
  children,
  onClear,
}: {
  icon: React.ReactNode;
  children: React.ReactNode;
  onClear: () => void;
}) {
  return (
    <span className="inline-flex items-center gap-1 pl-2 pr-1 py-0.5 text-[11px] rounded-full bg-zinc-800 text-zinc-200 border border-zinc-700">
      <span className="text-zinc-400">{icon}</span>
      <span>{children}</span>
      <button
        type="button"
        onClick={onClear}
        className="ml-0.5 p-0.5 rounded-full hover:bg-zinc-700 hover:text-red-400 transition"
        aria-label="解除"
      >
        <X className="w-3 h-3" />
      </button>
    </span>
  );
}

