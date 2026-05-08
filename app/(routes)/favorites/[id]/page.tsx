import Link from 'next/link';
import { ChevronLeft, Library, ChevronRight } from 'lucide-react';
import SpotMiniMapWrapper from '@/components/SpotMiniMapWrapper';

const favoritePlaceLists = [
  {
    id: 'list-1',
    name: '大阪観光名所7選',
    desc: '大阪城、道頓堀、通天閣など、初めての大阪ならここ！',
    locations: [
      { id: 'loc-1', name: '道頓堀',  lat: 34.6687, lng: 135.5021 },
      { id: 'loc-2', name: '大阪城',  lat: 34.6873, lng: 135.5262 },
      { id: 'loc-3', name: '通天閣',  lat: 34.6525, lng: 135.5063 },
    ],
  },
  {
    id: 'list-2',
    name: '絶景の夜景プレイスリスト',
    desc: '梅田スカイビル、ハルカスなどロマンチックな場所。',
    locations: [
      { id: 'loc-4', name: '梅田スカイビル',   lat: 34.7050, lng: 135.4896 },
      { id: 'loc-5', name: 'あべのハルカス', lat: 34.6458, lng: 135.5140 },
    ],
  },
  {
    id: 'list-3',
    name: '家族で楽しむ大阪',
    desc: '海遊館やUSJなど、子供も大人も楽しめるエリア。',
    locations: [
      { id: 'loc-6', name: '海遊館',         lat: 34.6545, lng: 135.4289 },
      { id: 'loc-7', name: '天保山大観覧車', lat: 34.6562, lng: 135.4310 },
    ],
  },
];

export default function SavedPlaceListsPage() {
  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 pb-24">
      <header className="sticky top-0 z-50 flex items-center px-4 pt-10 pb-4 bg-zinc-50/95 dark:bg-zinc-950/95 backdrop-blur-sm border-b border-zinc-200 dark:border-zinc-800">
        <Link href="/favorites" className="w-10 h-10 bg-zinc-200 dark:bg-zinc-800 rounded-full flex items-center justify-center hover:bg-zinc-300 dark:hover:bg-zinc-700 transition mr-3">
          <ChevronLeft className="w-6 h-6 text-zinc-700 dark:text-white" />
        </Link>
        <Library className="w-6 h-6 text-green-500 mr-2" />
        <h1 className="text-xl font-bold text-zinc-900 dark:text-white">保存したプレイスリスト</h1>
      </header>

      <main className="px-4 mt-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-zinc-900 dark:text-white">保存済みのプレイスリスト</h2>
          <span className="text-sm text-zinc-500 dark:text-zinc-400">{favoritePlaceLists.length}件</span>
        </div>

        <div className="flex flex-col gap-6">
          {favoritePlaceLists.map((placeList) => (
            <div
              key={placeList.id}
              className="bg-white dark:bg-zinc-900 rounded-xl overflow-hidden shadow border border-zinc-200 dark:border-zinc-800 flex flex-col"
            >
              <div className="h-32 w-full relative z-0">
                <SpotMiniMapWrapper locations={placeList.locations} />
              </div>

              <Link
                href={`/placelists/${placeList.id}`}
                className="p-4 flex items-center justify-between group hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors"
              >
                <div className="pr-4">
                  <h3 className="font-bold text-base text-zinc-900 dark:text-white group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors">
                    {placeList.name}
                  </h3>
                  <p className="text-zinc-500 dark:text-zinc-400 text-sm mt-1 line-clamp-1">
                    {placeList.desc}
                  </p>
                  <p className="text-zinc-400 dark:text-zinc-500 text-xs mt-2 font-medium">
                    📍 {placeList.locations.length}件のスポット
                  </p>
                </div>
                <div className="w-8 h-8 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center group-hover:bg-green-500 transition-colors shrink-0">
                  <ChevronRight className="w-5 h-5 text-zinc-500 dark:text-white group-hover:text-white" />
                </div>
              </Link>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
