'use client';

import { use } from 'react';
import Link from 'next/link';
import { ArrowLeft, MapPin, Heart, Share2, MoreVertical } from 'lucide-react';
import PlaceListMapWrapper from '@/components/PlaceListMapWrapper';
import { DUMMY_PLACE_LISTS } from '@/lib/client/dummySpots';

type Props = {
  params: Promise<{ id: string }>;
};

export default function PlaceListDetailPage({ params }: Props) {
  const { id } = use(params);
  const placeList = DUMMY_PLACE_LISTS.find((p) => p.id === id) || DUMMY_PLACE_LISTS[0];

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-white font-sans pb-20">
      <header className="sticky top-0 z-50 bg-zinc-50/90 dark:bg-zinc-950/90 backdrop-blur-md px-4 py-4 flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800">
        <Link href="/" className="p-2 -ml-2 hover:bg-zinc-200 dark:hover:bg-zinc-800 rounded-full transition">
          <ArrowLeft className="w-6 h-6" />
        </Link>
        <div className="flex gap-2">
          <button className="p-2 hover:bg-zinc-200 dark:hover:bg-zinc-800 rounded-full transition">
            <Share2 className="w-5 h-5" />
          </button>
          <button className="p-2 hover:bg-zinc-200 dark:hover:bg-zinc-800 rounded-full transition">
            <MoreVertical className="w-5 h-5" />
          </button>
        </div>
      </header>

      <div className="w-full h-64 md:h-96 relative border-b border-zinc-200 dark:border-zinc-800">
        <PlaceListMapWrapper spots={placeList.spots} />
      </div>

      <main className="px-4 py-6 max-w-4xl mx-auto">
        <div className="mb-8">
          <div className="flex justify-between items-start mb-2">
            <h1 className="text-3xl font-bold">{placeList.name}</h1>
            <button className="flex items-center gap-2 px-4 py-2 bg-zinc-200 dark:bg-zinc-800 hover:bg-zinc-300 dark:hover:bg-zinc-700 rounded-full transition">
              <Heart className="w-5 h-5" />
              <span className="text-sm font-bold">{placeList.likes || 0}</span>
            </button>
          </div>
          <p className="text-zinc-500 dark:text-zinc-400 text-sm mb-4">{placeList.description}</p>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-indigo-500 flex items-center justify-center text-[10px] font-bold text-white">
              {placeList.creator?.charAt(0).toUpperCase() || 'U'}
            </div>
            <span className="text-xs text-zinc-500 dark:text-zinc-300">作成者: {placeList.creator || '匿名ユーザー'}</span>
          </div>
        </div>

        <section>
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <MapPin className="w-5 h-5 text-green-500" />
            含まれるスポット ({placeList.spots.length})
          </h2>

          <div className="space-y-3">
            {placeList.spots.map((spot, index) => (
              <Link
                href={`/spots/${spot.id}`}
                key={spot.id}
                className="flex items-center gap-4 p-3 bg-white dark:bg-zinc-900/50 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-xl transition group border border-zinc-200 dark:border-zinc-800"
              >
                <div className="w-10 h-10 flex-shrink-0 bg-zinc-100 dark:bg-zinc-800 rounded-lg flex items-center justify-center font-bold text-zinc-500 dark:text-zinc-500 group-hover:text-green-500 transition-colors">
                  {index + 1}
                </div>
                <div className="flex-grow min-w-0">
                  <h3 className="font-bold text-sm truncate group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors">
                    {spot.name}
                  </h3>
                  <p className="text-zinc-500 dark:text-zinc-500 text-xs truncate">
                    {spot.description || spot.desc || '説明はありません'}
                  </p>
                </div>
                <ArrowLeft className="w-4 h-4 text-zinc-400 dark:text-zinc-600 rotate-180" />
              </Link>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
