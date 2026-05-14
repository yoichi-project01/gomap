import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, MapPin } from 'lucide-react';
import PlaceListMapWrapper from '@/components/PlaceListMapWrapper';
import CollectionActions from '@/components/collection/CollectionActions';
import PlaceListViewTracker from '@/components/placelists/PlaceListViewTracker';
import { getPlaceListById } from '@/lib/server/placeLists';
import { isPlaceListLiked } from '@/lib/server/likes';
import { isPlaceListSaved } from '@/lib/server/saves';
import { supabase } from '@/lib/server/supabase';

export const dynamic = 'force-dynamic';

const MAP_ANCHOR_ID = 'placelist-map';

type Props = {
  params: Promise<{ id: string }>;
};

export default async function PlaceListDetailPage({ params }: Props) {
  const { id } = await params;
  const [placeList, liked, saved] = await Promise.all([
    getPlaceListById(supabase, id),
    isPlaceListLiked(id),
    isPlaceListSaved(id),
  ]);
  if (!placeList) notFound();

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-white font-sans pb-20">
      <PlaceListViewTracker
        id={placeList.id}
        name={placeList.name}
        description={placeList.description}
        coverImageUrl={placeList.coverImageUrl}
        spotsCount={placeList.spots.length}
      />
      <header className="sticky top-0 z-50 bg-zinc-50/90 dark:bg-zinc-950/90 backdrop-blur-md px-4 py-4 flex items-center border-b border-zinc-200 dark:border-zinc-800">
        <Link href="/" className="p-2 -ml-2 hover:bg-zinc-200 dark:hover:bg-zinc-800 rounded-full transition">
          <ArrowLeft className="w-6 h-6" />
        </Link>
      </header>

      <div id={MAP_ANCHOR_ID} className="w-full h-64 md:h-96 relative border-b border-zinc-200 dark:border-zinc-800 scroll-mt-0">
        <PlaceListMapWrapper spots={placeList.spots} />
      </div>

      <main className="px-4 py-6 max-w-4xl mx-auto">
        <div className="mb-4">
          <h1 className="text-3xl font-bold mb-2">{placeList.name}</h1>
          <p className="text-zinc-500 dark:text-zinc-400 text-sm mb-4">{placeList.description}</p>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-indigo-500 flex items-center justify-center text-[10px] font-bold text-white">
              {placeList.creatorName?.charAt(0).toUpperCase() || 'U'}
            </div>
            <span className="text-xs text-zinc-500 dark:text-zinc-300">作成者: {placeList.creatorName || '匿名ユーザー'}</span>
          </div>
        </div>

        <CollectionActions
          placeListId={placeList.id}
          initialLiked={liked}
          initialSaved={saved}
          initialLikesCount={placeList.likes ?? 0}
          mapAnchorId={MAP_ANCHOR_ID}
        />

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
                    {spot.description ?? '説明はありません'}
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
