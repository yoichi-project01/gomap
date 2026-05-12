import Link from 'next/link';
import { ChevronLeft, MapPin, Heart, Share2, Navigation } from 'lucide-react';
import SpotMapWrapper from '@/components/SpotMapWrapper';

const spotData = {
  id: '1',
  name: '道頓堀',
  description: '大阪の象徴的な繁華街。グリコの看板やカニ道楽など、大阪ならではのド派手な景観と絶品グルメが楽しめる大人気スポットです。たこ焼きやお好み焼きの食べ歩きもおすすめ。',
  address: '大阪府大阪市中央区道頓堀',
  tags: ['グルメ', '観光名所', '写真映え'],
  lat: 34.6687,
  lng: 135.5021,
};

export default async function SpotDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: _id } = await params

  return (
    <div className="min-h-screen bg-white dark:bg-black text-zinc-900 dark:text-white font-sans pb-24 overflow-y-auto [&::-webkit-scrollbar]:hidden">
      {/* ヘッダー部分 */}
      <div className="relative h-72 w-full bg-gradient-to-b from-blue-200 via-indigo-100 dark:from-blue-900 dark:via-indigo-800 to-white dark:to-black flex flex-col justify-end p-4">
        <Link href="/results" className="absolute top-10 left-4 w-10 h-10 bg-black/10 dark:bg-black/40 rounded-full flex items-center justify-center backdrop-blur-md z-10 hover:bg-black/20 dark:hover:bg-black/60 transition">
          <ChevronLeft className="w-6 h-6 text-zinc-800 dark:text-white" />
        </Link>
        <h1 className="text-4xl font-extrabold mb-2 drop-shadow-sm">
          {spotData.name}
        </h1>
        <p className="text-zinc-700 dark:text-zinc-400 text-sm flex items-center gap-1">
          <MapPin className="w-4 h-4" />
          {spotData.address}
        </p>
      </div>

      <div className="flex items-center gap-4 px-4 py-4">
        <button className="w-14 h-14 bg-green-500 rounded-full flex items-center justify-center hover:scale-105 transition-transform shadow-lg text-black">
          <Navigation className="w-6 h-6 fill-black" />
        </button>
        <button className="text-zinc-400 dark:text-gray-400 hover:text-zinc-700 dark:hover:text-white transition">
          <Heart className="w-8 h-8" />
        </button>
        <button className="text-zinc-400 dark:text-gray-400 hover:text-zinc-700 dark:hover:text-white transition">
          <Share2 className="w-7 h-7" />
        </button>
      </div>

      <div className="px-4 mb-8">
        <div className="flex gap-2 mb-4 flex-wrap">
          {spotData.tags.map((tag, idx) => (
            <span key={idx} className="px-3 py-1 bg-zinc-200 dark:bg-zinc-800 text-xs font-bold rounded-full text-zinc-700 dark:text-white">
              {tag}
            </span>
          ))}
        </div>
        <p className="text-zinc-600 dark:text-gray-300 text-sm leading-relaxed mb-6">
          {spotData.description}
        </p>
      </div>

      <div className="px-4 mb-8">
        <h2 className="text-lg font-bold mb-4 text-zinc-900 dark:text-white">場所</h2>
        <div className="h-64 w-full rounded-xl overflow-hidden border border-zinc-200 dark:border-zinc-800 shadow relative z-0">
          <SpotMapWrapper
            lat={spotData.lat}
            lng={spotData.lng}
            name={spotData.name}
          />
        </div>
      </div>
    </div>
  )
}
