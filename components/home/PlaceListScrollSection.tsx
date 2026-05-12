'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Sparkles, Flame, Trophy } from 'lucide-react';
import type { PlaceList } from '@/types/spot';

type Props = {
  title: string;
  type: 'new' | 'featured' | 'ranking';
  placeLists: PlaceList[];
};

export default function PlaceListScrollSection({ title, type, placeLists }: Props) {
  const [isExpanded, setIsExpanded] = useState(false);

  const displayLimit = 5;
  const hasMore = placeLists.length > displayLimit;
  const displayedData = isExpanded ? placeLists : placeLists.slice(0, displayLimit);

  if (placeLists.length === 0) return null;

  return (
    <section className="mb-10">
      <div className="flex justify-between items-end mb-4">
        <h2 className="text-xl font-bold text-zinc-900 dark:text-white">{title}</h2>

        {hasMore && !isExpanded && (
          <button
            onClick={() => setIsExpanded(true)}
            className="text-xs font-bold text-zinc-400 dark:text-zinc-500 hover:text-zinc-700 dark:hover:text-white transition"
          >
            すべて表示
          </button>
        )}
        {isExpanded && (
          <button
            onClick={() => setIsExpanded(false)}
            className="text-xs font-bold text-zinc-400 dark:text-zinc-500 hover:text-zinc-700 dark:hover:text-white transition"
          >
            一部を表示
          </button>
        )}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
        {displayedData.map((item, index) => (
          <Link href={`/placelists/${item.id}`} key={item.id} className="flex flex-col group cursor-pointer">
            <div
              className="aspect-square w-full bg-zinc-200 dark:bg-zinc-800 rounded-md mb-3 shadow-lg group-hover:opacity-80 transition relative overflow-hidden flex items-center justify-center"
              style={item.coverImageUrl ? {
                backgroundImage: `url(${item.coverImageUrl})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
              } : undefined}
            >
              {!item.coverImageUrl && type === 'new' && <Sparkles className="w-10 h-10 text-yellow-500 dark:text-yellow-400" />}
              {!item.coverImageUrl && type === 'featured' && <Flame className="w-10 h-10 text-red-500" />}
              {type === 'ranking' && (
                <>
                  <span
                    className={`absolute -left-2 -bottom-5 text-[80px] font-bold italic z-10 select-none ${
                      item.coverImageUrl
                        ? 'text-white/80 drop-shadow-lg'
                        : 'text-zinc-400/40 dark:text-zinc-600/40'
                    }`}
                  >
                    {index + 1}
                  </span>
                  {!item.coverImageUrl && (
                    <Trophy className="w-8 h-8 text-yellow-500 z-10" />
                  )}
                </>
              )}
            </div>

            <h3 className="font-bold text-sm truncate mb-1 text-zinc-900 dark:text-zinc-100">
              {item.name}
            </h3>
            <p className="text-zinc-500 dark:text-zinc-400 text-xs line-clamp-2 whitespace-normal leading-relaxed">
              {item.description}
            </p>
          </Link>
        ))}
      </div>
    </section>
  );
}
