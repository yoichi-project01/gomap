"use client"

// プレイスリスト詳細ページ
// URL: /spots/[id]
// プレイスリストの詳細情報と含まれるスポット一覧を表示

import { useParams } from "next/navigation"
import Link from "next/link"
import { ChevronLeft, MapPin, Heart, Share2, Navigation } from "lucide-react"
import { placeLists, type PlaceList } from "@/lib/data/placeLists"
import SpotMapWrapper from "@/components/SpotMapWrapper"

export default function PlaceListDetailPage() {
  const params = useParams()
  const id = params.id as string

  // IDからプレイスリストを取得
  const placeList: PlaceList | undefined = placeLists.find(list => list.id === parseInt(id))

  if (!placeList) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">プレイスリストが見つかりません</h1>
          <Link href="/results" className="text-zinc-400 hover:text-white transition-colors">
            結果一覧に戻る
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white dark:bg-black text-zinc-900 dark:text-white font-sans pb-24 overflow-y-auto [&::-webkit-scrollbar]:hidden">
      {/* ヘッダー部分 */}
      <div className="relative h-72 w-full bg-gradient-to-b from-blue-200 via-indigo-100 dark:from-blue-900 dark:via-indigo-800 to-white dark:to-black flex flex-col justify-end p-4">
        <Link href="/results" className="absolute top-10 left-4 w-10 h-10 bg-black/10 dark:bg-black/40 rounded-full flex items-center justify-center backdrop-blur-md z-10 hover:bg-black/20 dark:hover:bg-black/60 transition">
          <ChevronLeft className="w-6 h-6 text-zinc-800 dark:text-white" />
        </Link>
        <h1 className="text-4xl font-extrabold mb-2 drop-shadow-sm text-zinc-900 dark:text-white">
          {placeList.name}
        </h1>
        <p className="text-zinc-700 dark:text-zinc-400 text-sm flex items-center gap-1">
          <MapPin className="w-4 h-4" />
          {placeList.prefecture}
        </p>
      </div>

      {/* アクションボタン */}
      <div className="flex items-center gap-4 px-4 py-4">
        <button className="w-14 h-14 bg-green-500 rounded-full flex items-center justify-center hover:scale-105 transition-transform shadow-lg text-white dark:text-zinc-900">
          <Navigation className="w-6 h-6 fill-current" />
        </button>
        <button className="text-zinc-400 dark:text-zinc-500 hover:text-zinc-600 dark:hover:text-zinc-300 transition">
          <Heart className="w-8 h-8" />
        </button>
        <button className="text-zinc-400 dark:text-zinc-500 hover:text-zinc-600 dark:hover:text-zinc-300 transition">
          <Share2 className="w-7 h-7" />
        </button>
      </div>

      {/* 説明とタグ */}
      <div className="px-4 mb-6">
        <p className="text-zinc-700 dark:text-zinc-300 text-base leading-relaxed mb-4">
          {placeList.description}
        </p>
        <div className="flex gap-2 flex-wrap">
          {placeList.tags.map((tag, idx) => (
            <span key={idx} className="px-3 py-1 bg-zinc-200 dark:bg-zinc-800 text-xs font-bold rounded-full text-zinc-800 dark:text-zinc-200">
              {tag}
            </span>
          ))}
        </div>
      </div>

      {/* 地図 */}
      <div className="px-4 mb-6">
        <div className="h-64 w-full rounded-lg overflow-hidden border border-zinc-300 dark:border-zinc-700">
          <SpotMapWrapper locations={placeList.locations} />
        </div>
      </div>

      {/* スポット一覧 */}
      <div className="px-4">
        <h2 className="text-xl font-bold mb-4 text-zinc-900 dark:text-white">含まれるスポット ({placeList.spots.length}件)</h2>
        <div className="space-y-3">
          {placeList.spots.map((spot, index) => (
            <div key={index} className="bg-zinc-100 dark:bg-zinc-800 rounded-lg p-4 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors border border-zinc-200 dark:border-zinc-700">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-zinc-300 dark:bg-zinc-600 rounded-full flex items-center justify-center text-sm font-bold text-zinc-800 dark:text-zinc-100">
                  {index + 1}
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-zinc-900 dark:text-zinc-100">{spot}</h3>
                  <p className="text-sm text-zinc-600 dark:text-zinc-400">スポット詳細</p>
                </div>
                <button className="w-8 h-8 bg-zinc-200 dark:bg-zinc-700 rounded-full flex items-center justify-center hover:bg-zinc-300 dark:hover:bg-zinc-600 transition-colors">
                  <Navigation className="w-4 h-4 text-zinc-700 dark:text-zinc-300" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
