'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { Check, ChevronDown, MapPin, Plus, Search, Tag, User, X } from 'lucide-react';
import type { Spot } from '@/types/spot';
import SpotPickerMapWrapper, { type FocusTarget } from '@/components/placelists/SpotPickerMapWrapper';

const CATEGORIES = ['観光', 'グルメ', 'カフェ', '自然', 'ショッピング', 'その他'];

type Sort = 'recent' | 'name';

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
  const [sort, setSort] = useState<Sort>('recent');
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
    if (sort === 'name') {
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

      {/* 並び順 (セグメント) + 自分のみ (スイッチ) */}
      <div className="flex items-center justify-between gap-3 px-4 py-3 border-b border-zinc-800">
        <div className="flex items-center gap-2">
          <span className="text-[11px] text-zinc-500 font-bold">並び順</span>
          <SortSegment value={sort} onChange={setSort} />
        </div>
        {currentUserId && <MineSwitch on={mineOnly} onChange={setMineOnly} />}
      </div>

      {/* カテゴリ + 都道府県 (プルダウン) */}
      <div
        className={`grid gap-2 px-4 py-3 border-b border-zinc-800 ${
          availablePrefectures.length > 0 ? 'grid-cols-2' : 'grid-cols-1'
        }`}
      >
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

function SortSegment({ value, onChange }: { value: Sort; onChange: (s: Sort) => void }) {
  return (
    <div className="inline-flex rounded-full border border-zinc-700 bg-zinc-950 p-0.5">
      {(['recent', 'name'] as Sort[]).map((opt) => {
        const active = value === opt;
        return (
          <button
            key={opt}
            type="button"
            onClick={() => onChange(opt)}
            className={`px-2.5 py-1 text-xs rounded-full transition ${
              active ? 'bg-green-500 text-black font-bold' : 'text-zinc-400 hover:text-white'
            }`}
          >
            {opt === 'recent' ? '最近追加' : '名前順'}
          </button>
        );
      })}
    </div>
  );
}

function MineSwitch({ on, onChange }: { on: boolean; onChange: (next: boolean) => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      onClick={() => onChange(!on)}
      className="flex items-center gap-2 group"
    >
      <span className="flex items-center gap-1 text-xs text-zinc-300 group-hover:text-white transition">
        <User className="w-3 h-3" />
        自分のみ
      </span>
      <span
        className={`relative inline-block w-8 h-4 rounded-full transition-colors ${
          on ? 'bg-green-500' : 'bg-zinc-700'
        }`}
      >
        <span
          className={`absolute top-0.5 w-3 h-3 rounded-full bg-white shadow transition-all ${
            on ? 'left-[18px]' : 'left-0.5'
          }`}
        />
      </span>
    </button>
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

function SelectField({
  icon,
  ariaLabel,
  value,
  options,
  onChange,
}: {
  icon: React.ReactNode;
  ariaLabel: string;
  value: string | null;
  options: string[];
  onChange: (next: string | null) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // 外側クリック / Esc でクローズ
  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: MouseEvent | TouchEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('touchstart', onPointerDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('touchstart', onPointerDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const isActive = value !== null;
  const displayValue = value ?? 'すべて';

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        aria-label={ariaLabel}
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className={`w-full inline-flex items-center justify-between gap-1.5 rounded-full border text-xs px-3 py-2 transition ${
          isActive
            ? 'bg-green-500 border-green-500 text-black font-bold'
            : 'bg-zinc-800 border-zinc-700 text-zinc-300 hover:border-zinc-500'
        }`}
      >
        <span className="flex items-center gap-1.5 min-w-0">
          <span className="flex-shrink-0">{icon}</span>
          <span className="truncate">{displayValue}</span>
        </span>
        <ChevronDown
          className={`w-3.5 h-3.5 flex-shrink-0 transition-transform ${open ? 'rotate-180' : ''}`}
        />
      </button>

      {open && (
        <ul
          role="listbox"
          className="absolute left-0 right-0 top-full mt-1.5 z-20 rounded-2xl border border-zinc-700 bg-zinc-950 shadow-xl overflow-hidden py-1 max-h-56 overflow-y-auto [&::-webkit-scrollbar]:hidden"
        >
          <OptionItem
            selected={value === null}
            onClick={() => {
              onChange(null);
              setOpen(false);
            }}
          >
            すべて
          </OptionItem>
          {options.map((opt) => (
            <OptionItem
              key={opt}
              selected={value === opt}
              onClick={() => {
                onChange(opt);
                setOpen(false);
              }}
            >
              {opt}
            </OptionItem>
          ))}
        </ul>
      )}
    </div>
  );
}

function OptionItem({
  selected,
  onClick,
  children,
}: {
  selected: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <li role="option" aria-selected={selected}>
      <button
        type="button"
        onClick={onClick}
        className={`w-full flex items-center justify-between gap-2 text-left text-xs px-3 py-2 transition ${
          selected ? 'bg-green-500/15 text-green-400 font-bold' : 'text-zinc-200 hover:bg-zinc-800'
        }`}
      >
        <span className="truncate">{children}</span>
        {selected && <Check className="w-3.5 h-3.5 flex-shrink-0" />}
      </button>
    </li>
  );
}
