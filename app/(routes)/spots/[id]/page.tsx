import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ChevronLeft, MapPin } from 'lucide-react';
import SpotDetailMapWrapper from '@/components/SpotDetailMapWrapper';
import SpotActions from '@/components/spot/SpotActions';
import { getSpotById } from '@/lib/server/spots';
import { isSpotFavorited } from '@/lib/server/favorites';
import { supabase } from '@/lib/server/supabase';

export default async function SpotDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [spot, favorited] = await Promise.all([
    getSpotById(supabase, id),
    isSpotFavorited(id),
  ]);
  if (!spot) notFound();

  const tags = [spot.prefecture, spot.category].filter(Boolean) as string[];

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-white font-sans pb-24 overflow-y-auto [&::-webkit-scrollbar]:hidden">

      <div
        className="relative h-72 w-full bg-gradient-to-b from-indigo-200 dark:from-blue-900 to-zinc-50 dark:to-zinc-950 flex flex-col justify-end p-4"
        style={spot.coverImageUrl ? {
          backgroundImage: `linear-gradient(to bottom, rgba(0,0,0,0.1), rgba(0,0,0,0.6)), url(${spot.coverImageUrl})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        } : undefined}
      >
        <Link href="/" className="absolute top-10 left-4 w-10 h-10 bg-black/10 dark:bg-black/40 rounded-full flex items-center justify-center backdrop-blur-md z-10 hover:bg-black/20 dark:hover:bg-black/60 transition">
          <ChevronLeft className="w-6 h-6 text-zinc-800 dark:text-white" />
        </Link>
        <h1 className={`text-4xl font-extrabold mb-2 drop-shadow-sm ${spot.coverImageUrl ? 'text-white' : ''}`}>
          {spot.name}
        </h1>
        <p className={`text-sm flex items-center gap-1 ${spot.coverImageUrl ? 'text-zinc-100' : 'text-zinc-600 dark:text-gray-300'}`}>
          <MapPin className="w-4 h-4" />
          {spot.prefecture ?? `${spot.lat.toFixed(4)}, ${spot.lng.toFixed(4)}`}
        </p>
      </div>

      <SpotActions
        spotId={spot.id}
        name={spot.name}
        lat={spot.lat}
        lng={spot.lng}
        initialFavorited={favorited}
      />

      <div className="px-4 mb-8">
        {tags.length > 0 && (
          <div className="flex gap-2 mb-4 flex-wrap">
            {tags.map((tag, idx) => (
              <span key={idx} className="px-3 py-1 bg-zinc-200 dark:bg-zinc-800 text-xs font-bold rounded-full text-zinc-700 dark:text-white">
                {tag}
              </span>
            ))}
          </div>
        )}
        <p className="text-zinc-600 dark:text-gray-300 text-sm leading-relaxed mb-6">
          {spot.description ?? '説明はありません'}
        </p>
      </div>

      <div className="px-4 mb-8">
        <h2 className="text-lg font-bold mb-4 text-zinc-900 dark:text-white">場所</h2>
        <div className="h-64 w-full rounded-xl overflow-hidden border border-zinc-200 dark:border-zinc-800 shadow relative z-0">
          <SpotDetailMapWrapper
            lat={spot.lat}
            lng={spot.lng}
            name={spot.name}
          />
        </div>
      </div>
    </div>
  );
}
