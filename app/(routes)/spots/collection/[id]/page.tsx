import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Map as MapIcon, MoreVertical } from 'lucide-react';
import BackButton from '@/components/ui/BackButton';
import CollectionMapWrapper from '@/components/PlaceListMapWrapper';
import CollectionActions from '@/components/collection/CollectionActions';
import { getPlaceListById } from '@/lib/server/placeLists';
import { isPlaceListLiked } from '@/lib/server/likes';
import { isPlaceListSaved, countPlaceListSaves } from '@/lib/server/saves';
import { supabase } from '@/lib/server/supabase';

type Props = { params: Promise<{ id: string }> };

const MAP_ANCHOR_ID = "collection-map";

export default async function CollectionDetailPage({ params }: Props) {
  const { id } = await params;
  const [collection, liked, saved, savesCount] = await Promise.all([
    getPlaceListById(supabase, id),
    isPlaceListLiked(id),
    isPlaceListSaved(id),
    countPlaceListSaves(id),
  ]);
  if (!collection) notFound();

  return (
    <div className="min-h-screen bg-black text-white font-sans pb-24 overflow-y-auto [&::-webkit-scrollbar]:hidden">

      <div
        className="relative pt-16 pb-6 px-4 bg-gradient-to-b from-indigo-900 to-black"
        style={collection.coverImageUrl ? {
          backgroundImage: `linear-gradient(to bottom, rgba(0,0,0,0.35), rgba(0,0,0,0.85)), url(${collection.coverImageUrl})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        } : undefined}
      >
        <BackButton
          className="absolute top-10 left-4 w-10 h-10 bg-black/40 rounded-full flex items-center justify-center backdrop-blur-md z-10 hover:bg-black/60 transition"
          iconClassName="w-6 h-6 text-white"
        />

        <div className="mt-8">
          <h1 className="text-3xl font-extrabold mb-2 text-white shadow-sm drop-shadow-md leading-tight">
            {collection.name}
          </h1>
          <p className="text-zinc-300 text-sm mb-4 leading-relaxed line-clamp-3">
            {collection.description}
          </p>
          <div className="flex items-center gap-2 text-xs font-bold text-zinc-400">
            <span className="text-white">{collection.creatorName ?? 'Unknown'}</span>
            <span>•</span>
            <span>{collection.likes ?? 0} 件のいいね</span>
            <span>•</span>
            <span>{collection.spots.length} 箇所</span>
          </div>
        </div>
      </div>

      <CollectionActions
        placeListId={collection.id}
        initialLiked={liked}
        initialSaved={saved}
        initialLikesCount={collection.likes ?? 0}
        initialSavesCount={savesCount}
        mapAnchorId={MAP_ANCHOR_ID}
        name={collection.name}
      />

      <div id={MAP_ANCHOR_ID} className="px-4 mb-8 scroll-mt-4">
        <div className="h-64 w-full rounded-xl overflow-hidden border border-zinc-800 shadow-lg relative z-0">
          <CollectionMapWrapper spots={collection.spots} />
        </div>
      </div>

      <div className="px-4">
        <h2 className="text-lg font-bold mb-4">含まれる場所</h2>
        <div className="flex flex-col gap-4">
          {collection.spots.map((spot, index) => (
            <Link
              href={`/spots/${spot.id}`}
              key={spot.id}
              className="flex items-center gap-4 group cursor-pointer hover:bg-zinc-800/50 p-2 -mx-2 rounded-md transition-colors"
            >
              <div className="w-4 text-center text-zinc-500 font-bold text-sm group-hover:hidden">
                {index + 1}
              </div>
              <div className="w-4 text-center text-white hidden group-hover:block">
                <MapIcon className="w-4 h-4" />
              </div>

              <div className="flex-1">
                <h3 className="font-bold text-base text-white group-hover:text-green-500 transition-colors">
                  {spot.name}
                </h3>
                <p className="text-xs text-zinc-400 line-clamp-1">
                  {spot.description ?? '説明はありません'}
                </p>
              </div>

              <button
                className="text-zinc-500 hover:text-white opacity-0 group-hover:opacity-100 transition-opacity"
                aria-label="その他のメニュー"
              >
                <MoreVertical className="w-5 h-5" />
              </button>
            </Link>
          ))}
        </div>
      </div>

    </div>
  );
}
